// The shared engine's interactive features: the phone-width section menu, cross-guide search
// results, Ctrl+K, and progress shared between guides by matching question title.
export async function run({ browser, base, ok }) {
  const inner = async (page) => {
    const frame = await (await page.waitForSelector('iframe')).contentFrame();
    await frame.waitForSelector('#navList .nav-item', { state: 'attached' });
    return frame;
  };
  const vis = (frame, sel) => frame.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    return { display: getComputedStyle(el).display };
  }, sel);

  // ---- phone: collapsed menu opens/closes, desktop: menu is always visible
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await phone.goto(`${base}/nextjs`, { waitUntil: 'networkidle' });
  let f = await inner(phone);
  const barHeight = await f.evaluate(() => Math.round(document.getElementById('sidebar').getBoundingClientRect().height));
  ok('phone: collapsed section bar is compact', barHeight < 80, barHeight + 'px');
  ok('phone: section list hidden until opened', (await vis(f, '#navPanel')).display === 'none');
  await f.click('#navToggle');
  ok('phone: panel opens', (await vis(f, '#navPanel')).display === 'block');
  await f.click('#navList .nav-item:nth-child(3)');
  ok('phone: choosing a section closes the panel', (await vis(f, '#navPanel')).display === 'none');
  await phone.close();

  const desk = await browser.newPage({ viewport: { width: 1366, height: 860 } });
  await desk.goto(`${base}/nextjs`, { waitUntil: 'networkidle' });
  f = await inner(desk);
  ok('desktop: phone toggle hidden', (await vis(f, '#navToggle')).display === 'none');

  // ---- cross-guide search
  await f.fill('#searchInput', 'closure');
  await f.waitForSelector('#globalHits .gh', { timeout: 8000 });
  const hits = await f.$$eval('#globalHits .gh', (as) => as.map((a) => a.getAttribute('href')));
  ok('search: other guides show up for a term not on this page', hits.length > 0, hits.slice(0, 2).join(', '));
  ok('search: does not list the current guide as an "other guide"', !hits.some((h) => h.startsWith('/nextjs')));

  // ---- Ctrl+K focuses search
  await f.fill('#searchInput', '');
  await f.evaluate(() => document.activeElement.blur());
  await desk.keyboard.press('Control+k');
  ok('Ctrl+K focuses the search box', await f.evaluate(() => document.activeElement.id === 'searchInput'));

  // ---- shared progress: reviewing a card on one guide marks the same question reviewed on another
  await desk.goto(`${base}/javascript`, { waitUntil: 'networkidle' });
  f = await inner(desk);
  const title = await f.evaluate(() => {
    const card = document.querySelector('#content .qcard');
    card.querySelector('.qcheck').click();
    return card.querySelector('.qtext').textContent;
  });
  await desk.goto(`${base}/interview-prep`, { waitUntil: 'networkidle' });
  f = await inner(desk);
  const shared = await f.evaluate((t) => {
    const e = INDEX.find((x) => x.item.q.replace(/<[^>]+>/g, '') === t);
    return e ? !!reviewed[e.section.id + ':' + e.qIdx] : 'not found';
  }, title);
  ok('progress shared across guides by question title', shared === true, `"${title.slice(0, 50)}" -> ${shared}`);
  await desk.close();
}
