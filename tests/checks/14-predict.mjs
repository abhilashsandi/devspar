// Predict the output: the reader commits to an answer, then the snippet runs in a worker and each line is judged.
export async function run({ browser, base, ok }) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}/javascript`, { waitUntil: 'networkidle' });
  const f = await (await page.waitForSelector('iframe')).contentFrame();
  await f.waitForSelector('#navList .nav-item', { state: 'attached' });
  await f.evaluate(() => window.postMessage({ type: 'goto-section', id: 'js-predict' }, '*'));
  const cards = f.locator('.qcard[data-sec="js-predict"]');
  await cards.first().waitFor();
  await cards.evaluateAll((els) => els.forEach((e) => e.classList.add('open')));
  const first = cards.nth(0), second = cards.nth(1);

  ok('the section has its predict cards', (await cards.count()) >= 2, String(await cards.count()));
  const lock = first.getByRole('button', { name: 'Lock in and run' });
  ok('Lock in and run is disabled until something is typed, and the answer is hidden', (await lock.isDisabled()) && !(await first.locator('details.reveal').evaluate((d) => d.open)));

  await first.locator('textarea.pred-said').fill('X\nD\nC\nB');
  await lock.click();
  await first.locator('.pred-verdict').waitFor({ timeout: 8000 });
  const rows = await first.locator('.pred-table tr').evaluateAll((trs) => trs.slice(1).map((r) => r.className));
  ok('each line is judged: the wrong first line has a cross, the rest ticks', rows.join(' ') === 'pred-bad pred-ok pred-ok pred-ok', rows.join(' '));
  ok('the verdict counts the lines right', (await first.locator('.pred-verdict').textContent()) === '3 of 4 lines right.', await first.locator('.pred-verdict').textContent());
  ok('the answer opens once the reader has committed', await first.locator('details.reveal').evaluate((d) => d.open));

  // an infinite loop does not freeze the page
  await first.getByRole('button', { name: 'Edit the code' }).click();
  await first.locator('textarea.pred-code').fill('while (true) {}');
  const t0 = Date.now();
  await first.getByRole('button', { name: 'Run again' }).click();
  await first.locator('.pred-table td', { hasText: 'Stopped: still running after 2 seconds' }).waitFor({ timeout: 6000 }).catch(() => {});
  const took = Date.now() - t0;
  ok('a runaway snippet is stopped after about two seconds', (await first.locator('.pred-table td', { hasText: 'Stopped: still running after 2 seconds' }).count()) === 1 && took < 5000, `${took} ms`);
  await second.locator('.qhead').click();
  ok('the page stays usable after a stopped snippet', await second.evaluate((c) => !c.classList.contains('open')));

  await second.evaluate((c) => c.classList.add('open'));
  await second.getByRole('button', { name: 'I don’t know: run it' }).click();
  await second.locator('.pred-verdict').waitFor({ timeout: 8000 });
  ok('I don’t know just runs it and says how many lines it printed', (await second.locator('.pred-verdict').textContent()) === 'It printed 3 lines.', await second.locator('.pred-verdict').textContent());

  const sql = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  sql.on('pageerror', (e) => errors.push(e.message));
  await sql.goto(`${base}/sql`, { waitUntil: 'networkidle' });
  const sf = await (await sql.waitForSelector('iframe')).contentFrame();
  await sf.waitForSelector('#navList .nav-item', { state: 'attached' });
  await sf.evaluate(() => document.querySelectorAll('.qcard').forEach((c) => c.classList.add('open')));
  ok('other guides have no predict boxes', (await sf.locator('.pred-go').count()) === 0);
  await sql.close();
  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}
