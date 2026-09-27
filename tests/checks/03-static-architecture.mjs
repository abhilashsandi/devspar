// A guide loads from its own static file (public/study/<slug>.html) plus the shared engine.js —
// not embedded in the Next.js page — and the guide's theme follows the site's light/dark toggle.
export async function run({ browser, base, ok }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.goto(`${base}/nextjs`, { waitUntil: 'networkidle' });
  ok('guide HTML is fetched as its own file, not embedded', reqs.some((u) => u.endsWith('/study/nextjs.html')));
  ok('engine.js is fetched as its own (shared, cacheable) request', reqs.some((u) => u.endsWith('/study/engine.js')));

  let f = await (await page.$('iframe')).contentFrame();
  await f.waitForSelector('#navList .nav-item', { state: 'attached' });
  let theme = await f.evaluate(() => document.documentElement.getAttribute('data-theme'));
  ok('guide theme is set on initial load', theme === 'light' || theme === 'dark', theme);

  // toggle the site theme on the homepage (guide pages have no nav of their own), then confirm a
  // freshly opened guide picks it up.
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const toggle = await page.$('button[title="Toggle theme"]');
  await toggle.click();
  await page.waitForTimeout(300);
  const siteIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

  await page.goto(`${base}/nextjs`, { waitUntil: 'networkidle' });
  f = await (await page.$('iframe')).contentFrame();
  await f.waitForSelector('#navList .nav-item', { state: 'attached' });
  await page.waitForTimeout(300);
  theme = await f.evaluate(() => document.documentElement.getAttribute('data-theme'));
  ok('guide theme follows the site toggle', (siteIsDark && theme === 'dark') || (!siteIsDark && theme === 'light'), `siteDark=${siteIsDark} guideTheme=${theme}`);
  await page.close();
}
