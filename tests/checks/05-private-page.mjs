// /my-prep: served files carry no plaintext, the wrong password is rejected, the right one
// unlocks it, and nothing else on the site links to it. Needs PRIVATE_PASSWORD in the
// environment (the real password lives outside the repo) — skips itself otherwise, since CI and
// most contributors have no way to know it.
export async function run({ browser, base, ok }) {
  const password = process.env.PRIVATE_PASSWORD;
  if (!password) {
    console.log('SKIP  /my-prep checks (set PRIVATE_PASSWORD to run them locally)');
    return;
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const res = await page.request.get(`${base}/my-prep`);
  const html = await res.text();
  const chunks = [...new Set([...html.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]))];
  const leakPattern = /Tell me about yourself|carrier with no API/i;
  let leaked = leakPattern.test(html);
  for (const c of chunks) {
    const t = await (await page.request.get(base + c)).text();
    if (leakPattern.test(t)) { leaked = true; break; }
  }
  ok('/my-prep: noindex + no plaintext in served files', /noindex/.test(html) && !leaked);

  await page.goto(`${base}/my-prep`, { waitUntil: 'networkidle' });
  await page.fill('#pw', 'not-the-password-123');
  await page.click('button[type=submit]');
  await page.waitForSelector('p[role=alert]', { timeout: 15000 });
  ok('wrong password is rejected', /did not work/i.test(await page.textContent('p[role=alert]')));

  await page.fill('#pw', password);
  await page.click('button[type=submit]');
  await page.waitForSelector('iframe', { timeout: 20000 });
  const f = await (await page.$('iframe')).contentFrame();
  await f.waitForSelector('#navList .nav-item', { state: 'attached' });
  ok('right password unlocks the notes', (await f.evaluate(() => INDEX.length)) > 0);

  const linked = [];
  for (const p of ['/', '/interview-prep', '/genai']) {
    const r = await (await page.request.get(base + p)).text();
    if (/my-prep/.test(r)) linked.push(p);
  }
  ok('no page links to /my-prep', linked.length === 0, linked.join(', '));
  await page.close();
}
