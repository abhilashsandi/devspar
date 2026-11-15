// /mock: a seeded 45-minute round runs end to end, survives a reload, scores itself, feeds the weak cards.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export async function run({ browser, base, ok }) {
  const { toCards, seedFrom } = await import(pathToFileURL(path.resolve('app/lib/bank.mjs')).href);
  const { buildRound } = await import(pathToFileURL(path.resolve('app/lib/mock.mjs')).href);
  const index = JSON.parse(await readFile('public/search-index.json', 'utf8'));
  const expected = buildRound(toCards(index), { seed: seedFrom('check') });
  const flat = expected.segments.flatMap((s) => s.cards);

  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${base}/mock?seed=check`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Start round' }).click();
  const q = page.locator('[data-testid="question"]');
  await q.waitFor();
  ok('the seeded round starts with the expected behavioural question', (await q.textContent()).trim() === flat[0].q, flat[0].q.slice(0, 50));
  ok('the header says question 1 of 8', (await page.locator('h2').first().textContent()).includes('Question 1 of 8'));
  ok('Next question is disabled until a rating is chosen', await page.getByRole('button', { name: 'Next question' }).isDisabled().catch(async () => await page.getByRole('button', { name: 'Finish segment' }).isDisabled()));

  await page.getByRole('button', { name: 'Reveal model answer' }).click();
  const frameEl = await page.waitForSelector('iframe[src*="/study/behavioural.html?card="]', { timeout: 10000 }).catch(() => null);
  ok('the model answer is the real card, embedded', !!frameEl);
  if (frameEl) {
    const f = await frameEl.contentFrame();
    await f.waitForSelector('.qcard.open', { timeout: 8000 }).catch(() => {});
    ok('the embed shows exactly one open card', (await f.locator('.qcard.open').count()) === 1);
  }

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Resume round' }).click();
  ok('Resume round returns to the same question', (await page.locator('[data-testid="question"]').textContent()).trim() === flat[0].q);

  for (let i = 0; i < 8; i++) {
    await page.locator('label', { hasText: i % 2 === 0 ? 'Missed' : 'Strong' }).click();
    const next = page.getByRole('button', { name: /^(Next question|Finish segment)$/ });
    await next.click();
  }
  await page.getByRole('button', { name: 'Finish round' }).click();
  await page.locator('[data-testid="total"]').waitFor();
  const total = Number(await page.locator('[data-testid="total"]').textContent());
  const verdict = (await page.locator('[data-testid="verdict"]').textContent()).trim();
  ok('the scorecard shows a score and a verdict', total >= 0 && total <= 100 && ['Ready', 'Close', 'Keep practising'].includes(verdict), `${total} ${verdict}`);
  ok('the scorecard lists the eight questions', (await page.locator('section[aria-label="Questions"] li').count()) === 8);
  ok('four missed cards are added to the weak cards', (await page.getByText('4 cards added to your weak cards').count()) === 1);

  const stored = await page.evaluate(() => ({
    history: JSON.parse(localStorage.getItem('study-mock-history-v1') || '[]'),
    weak: Object.keys(JSON.parse(localStorage.getItem('study-weak-titles-v1') || '{}')),
    current: sessionStorage.getItem('mock-current'),
  }));
  ok('one round is in the history with eight cards', stored.history.length === 1 && stored.history[0].cards.length === 8);
  ok('the weak-cards store has the four missed cards', stored.weak.length === 4, String(stored.weak.length));
  ok('the round in progress is cleared once finished', stored.current === null);
  ok('Same round again points at the same seed', (await page.getByRole('link', { name: 'Same round again' }).getAttribute('href')) === `/mock?seed=${expected.seed}`);

  // the bank cannot load
  const down = await ctx.newPage();
  down.on('pageerror', (e) => errors.push(e.message));
  await down.route('**/search-index.json', (r) => r.abort());
  await down.goto(`${base}/mock`, { waitUntil: 'load' });
  await down.getByText('The question bank could not load. Check your connection and try again.').waitFor({ timeout: 8000 }).catch(() => {});
  ok('a failed bank load says so, with a retry button', (await down.getByText('The question bank could not load.').count()) === 1 && (await down.getByRole('button', { name: 'Try again' }).count()) === 1);
  await down.close();

  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}
