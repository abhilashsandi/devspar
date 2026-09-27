// The homepage: every guide/lab link resolves, site-wide search returns results, and a reviewed
// card shows up as progress on its guide's card.
export async function run({ browser, base, ok }) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 860 } });
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });

  const hrefs = await page.$$eval('#guides a[href^="/"], #labs a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
  ok('homepage lists guide + lab links', hrefs.length >= 18, hrefs.length + ' links');
  const bad = [];
  for (const h of [...new Set(hrefs)]) {
    const r = await page.request.get(base + h.split('#')[0]);
    if (r.status() !== 200) bad.push(`${h} -> ${r.status()}`);
  }
  ok('every homepage link resolves (200)', bad.length === 0, bad.join(', '));

  await page.fill('input[type=search]', 'closure');
  await page.waitForSelector('[aria-label="Search results"] a', { timeout: 8000 });
  const first = await page.$eval('[aria-label="Search results"] a', (a) => a.getAttribute('href'));
  ok('homepage search returns a result', /^\/[a-z-]+#/.test(first), first);

  await page.goto(`${base}/javascript`, { waitUntil: 'networkidle' });
  const f = await (await page.$('iframe')).contentFrame();
  await f.waitForSelector('#navList .nav-item', { state: 'attached' });
  await f.evaluate(() => document.querySelector('#content .qcard .qcheck').click());
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const withProgress = await page.evaluate(() =>
    [...document.querySelectorAll('#guides a')].filter((a) => /reviewed/.test(a.textContent)).map((a) => a.querySelector('h3')?.textContent));
  ok('a reviewed card shows a progress badge on the homepage', withProgress.includes('JavaScript'), withProgress.join(', '));
  await page.close();
}
