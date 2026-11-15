// /plan: the date, role and minutes a day become a plan that follows the reader's progress.
export async function run({ browser, base, ok }) {
  const local = (offset) => {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${base}/plan`, { waitUntil: 'networkidle' });
  ok('before a date is set, the page asks for one', (await page.getByText('Pick your interview date to get a plan.').count()) === 1);

  await page.getByLabel('Interview date').fill(local(6));
  const summary = page.locator('[data-testid="summary"]');
  await summary.waitFor({ timeout: 15000 });
  const text = (await summary.textContent()).trim();
  ok('the summary counts the days and the cards', /^6 days to go · \d+ cards · about /.test(text), text);

  const links = page.locator('section', { hasText: 'Today ·' }).getByRole('link', { name: 'Open as flashcards' });
  const firstHref = await links.first().getAttribute('href');
  ok('today’s blocks open as flashcard decks', /^\/[a-z-]+#deck=/.test(firstHref || ''), firstHref);

  await links.first().click();
  const f = await (await page.waitForSelector('iframe')).contentFrame();
  await f.waitForSelector('#fc:not([hidden])', { timeout: 15000 }).catch(() => {});
  const count = await f.evaluate(() => (document.querySelector('#fc .fc-count') || {}).textContent || '');
  ok('following it opens the guide with that deck', /^1 \//.test(count), count);

  await f.click('button[data-fc="reveal"]');
  await f.click('button[data-fc="got"]');
  await page.goto(`${base}/plan`, { waitUntil: 'networkidle' });
  const again = page.locator('section', { hasText: 'Today ·' }).getByRole('link', { name: 'Open as flashcards' });
  await again.first().waitFor({ timeout: 15000 });
  const key = (firstHref || '').split('#deck=')[1].split(',')[0];
  const nextHref = await again.first().getAttribute('href');
  ok('a card marked got it leaves the plan', !!key && !(nextHref || '').includes(key + ','), `${key} gone from ${nextHref}`.slice(0, 80));

  await page.getByRole('tab', { name: 'Night before' }).click();
  ok('the night before lists the crash-course sections', (await page.locator('a[href="/crash-course#js"]').count()) === 1);
  await page.getByRole('tab', { name: '30 minutes before' }).click();
  ok('the warm-up has its three prompts', (await page.getByText('Say your introduction once, out loud.').count()) === 1 && (await page.getByText('Pick the two questions you will ask.').count()) === 1 && (await page.getByText(/^One slow breath/).count()) === 1);

  await page.getByLabel('Role').selectOption('backend');
  await page.getByLabel('Time each day').selectOption('60');
  await page.reload({ waitUntil: 'networkidle' });
  ok('date, role and minutes are remembered', (await page.getByLabel('Interview date').inputValue()) === local(6) && (await page.getByLabel('Role').inputValue()) === 'backend' && (await page.getByLabel('Time each day').inputValue()) === '60');

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.getByText('Interview in 6 days').waitFor({ timeout: 10000 }).catch(() => {});
  ok('the homepage counts the days down', (await page.getByText(/Interview in 6 days/).count()) === 1);

  await page.evaluate((d) => localStorage.setItem('study-plan-v1', JSON.stringify({ date: d, role: 'fullstack', minutesPerDay: 45 })), local(-1));
  await page.goto(`${base}/plan`, { waitUntil: 'networkidle' });
  await page.getByText('That date has passed. Set your next one.').waitFor({ timeout: 10000 }).catch(() => {});
  ok('a date in the past says so', (await page.getByText('That date has passed. Set your next one.').count()) === 1);
  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}
