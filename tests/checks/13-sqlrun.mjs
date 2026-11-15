// Runnable SQL: PostgreSQL compiled to WebAssembly (PGlite) runs the guide's puzzles in a worker, in the browser.
// The first load seeds 200,000 rows, which takes a while; the second load reuses the saved data.
export async function run({ browser, base, ok }) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [], missing = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() === 404 && /\/(vendor|study\/sqlrun)\//.test(r.url())) missing.push(r.url()); });

  const open = async () => {
    await page.goto(`${base}/sql`, { waitUntil: 'networkidle' });
    const f = await (await page.waitForSelector('iframe')).contentFrame();
    await f.waitForSelector('#navList .nav-item', { state: 'attached' });
    await f.evaluate(() => {
      const e = INDEX.find((x) => /second-highest salary/.test(x.item.q));
      window.postMessage({ type: 'goto-section', id: e.section.id, qIdx: e.qIdx }, '*');
    });
    const card = f.locator('.qcard', { hasText: 'Find the second-highest salary' }).first();
    await card.waitFor();
    await card.evaluate((c) => c.classList.add('open'));
    return { f, card };
  };
  const ready = (card, ms) => card.locator('.sqlr-status').filter({ hasText: /^Ready: PostgreSQL \d+/ }).waitFor({ timeout: ms });

  let { f, card } = await open();
  const t0 = Date.now();
  await card.locator('.sqlr-open').click();
  await ready(card, 150000).catch(() => {});
  const status = (await card.locator('.sqlr-status').textContent().catch(() => '')) || '';
  ok('the runner loads PostgreSQL in the browser and reports it', /^Ready: PostgreSQL \d+/.test(status), `${status.slice(0, 60)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  ok('no engine or runner file is missing', missing.length === 0, missing.join(' '));

  const type = async (sql) => { await card.locator('textarea[aria-label="SQL"]').fill(sql); };
  const press = async (name) => { await card.getByRole('button', { name, exact: true }).click(); };

  await type('select name, salary from employees order by salary desc limit 1 offset 1');
  await press('Run');
  await card.locator('.sqlr-result table').waitFor({ timeout: 30000 });
  const cells = await card.locator('.sqlr-result td').allTextContents();
  ok('a query runs and shows its rows (the tied top salary, the trap the card describes)', cells.includes('150000') && (await card.locator('.sqlr-result tr').count()) === 2, cells.join(' | '));

  await press('Check against the solution');
  await card.locator('.sqlr-verdict').waitFor({ timeout: 30000 });
  ok('a wrong answer is told it differs', (await card.locator('.sqlr-verdict').textContent()) === 'Different: same shape, but some values differ.', await card.locator('.sqlr-verdict').textContent());

  const solution = await card.locator('details.reveal pre').first().textContent();
  await type(solution);
  await press('Check against the solution');
  await card.locator('.sqlr-verdict.sqlr-ok').waitFor({ timeout: 30000 }).catch(() => {});
  ok('the card’s own solution matches the solution', (await card.locator('.sqlr-verdict').textContent()) === 'Matches the solution.');

  await type('selec 1');
  await press('Run');
  await card.locator('.sqlr-error').waitFor({ timeout: 30000 });
  ok('a syntax error is shown as an error', /syntax error/.test(await card.locator('.sqlr-error').textContent()));

  await type('delete from employees');
  await press('Run');
  await card.locator('.sqlr-foot', { hasText: /Done/ }).waitFor({ timeout: 30000 });
  await type('select count(*) from employees');
  await press('Run');
  await card.locator('.sqlr-result td').first().waitFor({ timeout: 30000 });
  ok('a delete is rolled back: the table still has its 12 rows', (await card.locator('.sqlr-result td').first().textContent()) === '12');

  await type('select * from orders where total_cents = 1234');
  await press('Explain');
  await card.locator('ul.plan').first().waitFor({ timeout: 60000 });
  ok('Explain draws the plan as a tree that names the table', /orders/.test(await card.locator('ul.plan').first().textContent()));

  await type('select count(*) from orders a, orders b');
  await press('Run');
  await card.getByRole('button', { name: 'Stop', exact: true }).waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
  await press('Stop');
  await card.locator('.sqlr-foot', { hasText: 'Stopped.' }).waitFor({ timeout: 5000 }).catch(() => {});
  ok('a runaway query can be stopped', (await card.locator('.sqlr-foot', { hasText: 'Stopped.' }).count()) === 1);
  await type('select 1 as one');
  await press('Run');
  await card.locator('.sqlr-result td').first().waitFor({ timeout: 90000 });
  ok('the engine works again after a stop', (await card.locator('.sqlr-result td').first().textContent()) === '1');

  await type('commit; delete from contacts;');
  await press('Run');
  await card.locator('.sqlr-status', { hasText: 'The data has changed' }).waitFor({ timeout: 30000 }).catch(() => {});
  ok('leaving the wrapper transaction is noticed', (await card.locator('.sqlr-status').textContent()).startsWith('The data has changed. Press Reset data to restore it.'));
  await press('Reset data');
  await ready(card, 150000).catch(() => {});
  await type('select count(*) from contacts');
  await press('Run');
  await card.locator('.sqlr-result td').first().waitFor({ timeout: 30000 });
  ok('Reset data restores the practice data', (await card.locator('.sqlr-result td').first().textContent()) === '6');

  // the second visit reuses the saved data
  ({ f, card } = await open());
  const t1 = Date.now();
  await card.locator('.sqlr-open').click();
  await ready(card, 60000).catch(() => {});
  const second = (Date.now() - t1) / 1000;
  ok('a later visit reuses the saved data and is ready quickly', second < 15, `${second.toFixed(1)} s`);

  // a guide with no puzzles has no runner
  await page.goto(`${base}/whiteboard`, { waitUntil: 'networkidle' });
  const wf = await (await page.waitForSelector('iframe')).contentFrame();
  await wf.waitForSelector('#navList .nav-item', { state: 'attached' });
  await wf.evaluate(() => document.querySelectorAll('.qcard').forEach((c) => c.classList.add('open')));
  ok('other guides have no SQL runner', (await wf.locator('.sqlr-open').count()) === 0);
  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}
