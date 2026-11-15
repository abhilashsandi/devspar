// /match: a pasted job posting becomes a skills list, a deck and gaps, and the posting itself goes nowhere.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const POSTING = `Senior Full-Stack Engineer. You will build customer-facing features in React and TypeScript on
Next.js, with Node.js services behind them. We run on AWS with Docker and Kubernetes, and ship
through CI/CD on GitHub Actions. You know PostgreSQL well and care about testing (Playwright).
Experience with React Native, C# or Java is a bonus. JavaScript fundamentals matter to us.
You enjoy mentoring and clear communication skills. Zebra umbrellas sing quietly at Northwind Rail.`;

export async function run({ browser, base, ok }) {
  const { toCards } = await import(pathToFileURL(path.resolve('app/lib/bank.mjs')).href);
  const { analyse } = await import(pathToFileURL(path.resolve('app/lib/match.mjs')).href);
  const expected = analyse(POSTING, toCards(JSON.parse(await readFile('public/search-index.json', 'utf8'))), new Set());

  const ctx = await browser.newContext({ viewport: { width: 1100, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [], leaks = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => { if (/zebra/i.test(r.url()) || /zebra/i.test(r.postData() || '')) leaks.push(r.url()); });

  await page.goto(`${base}/match`, { waitUntil: 'networkidle' });
  const find = page.getByRole('button', { name: 'Find my deck' });
  await find.waitFor();
  await page.waitForFunction(() => !document.querySelector('button[disabled]'), null, { timeout: 15000 }).catch(() => {});
  await find.click();
  ok('an empty box asks for the posting', (await page.getByText('Paste the posting first.').count()) === 1);

  await page.getByLabel('Job posting').fill('Come and enjoy our lovely office snacks.');
  await find.click();
  ok('a posting with no skills says so', (await page.getByText('No skills recognised. Paste the requirements section of the posting.').count()) === 1);

  await page.getByLabel('Job posting').fill(POSTING);
  await find.click();
  const skills = page.locator('section[aria-label="What they ask for"]');
  await skills.waitFor({ timeout: 10000 });
  const chips = await skills.locator('li').allTextContents();
  ok('the skills the posting asks for are listed', ['React', 'TypeScript', 'Kubernetes', 'Java'].every((s) => chips.some((c) => c.includes(s))), chips.length + ' skills');

  const count = (await page.locator('[data-testid="deck-count"]').textContent()).trim();
  const total = Number(count.split(' ')[0]);
  ok('the deck says how many cards and guides', /^\d+ cards across \d+ guides$/.test(count) && total >= 10, count);
  ok('the deck is the one the module builds', total === expected.deck.length, `${total} vs ${expected.deck.length}`);

  const headings = await page.locator('section[aria-label="Gaps"] h3').allTextContents();
  const want = [['Not covered here: study these elsewhere', expected.gaps.missing], ['Covered thinly: a few cards only', expected.gaps.thin], ['Covered, but you have not reviewed most of it', expected.gaps.unreviewed]].filter(([, l]) => l.length);
  ok('the gap lists match the module, and empty lists are not shown', JSON.stringify(headings) === JSON.stringify(want.map(([h]) => h)), headings.join(' | '));
  for (const [h, items] of want) {
    const got = await page.locator('section[aria-label="Gaps"] div', { has: page.locator('h3', { hasText: h }) }).first().locator('li').allTextContents();
    ok(`gap list "${h.slice(0, 20)}…" holds the expected skills`, JSON.stringify(got) === JSON.stringify(items), got.join(', '));
  }

  const link = page.getByRole('link', { name: 'Open as flashcards' }).first();
  const href = await link.getAttribute('href');
  ok('each guide in the deck opens as flashcards', /#deck=/.test(href || ''), href);
  await link.click();
  const f = await (await page.waitForSelector('iframe')).contentFrame();
  await f.waitForSelector('#fc:not([hidden])', { timeout: 15000 }).catch(() => {});
  ok('following it opens the flashcard dialog', await f.evaluate(() => !document.getElementById('fc').hidden));

  await page.goto(`${base}/match`, { waitUntil: 'networkidle' });
  await page.getByText(/^From your last posting, analysed on /).waitFor({ timeout: 10000 }).catch(() => {});
  ok('a later visit shows the last result and an empty text box', (await page.getByText(/^From your last posting/).count()) === 1 && (await page.getByLabel('Job posting').inputValue()) === '');

  const stored = await page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage } }));
  ok('nothing from the posting is stored', !/Zebra|umbrellas|Northwind|Senior Full-Stack/i.test(stored));
  ok('nothing from the posting was sent anywhere', leaks.length === 0, leaks.join(' '));
  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}
