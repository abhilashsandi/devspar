// Whiteboard diagrams: every diagram is redrawn by hand when its card renders, and the tidy original
// stays one click away, drawn exactly as authored. The choice is remembered across guides.
// (Whether every label still fits its box is a separate, slower check: `npm run study:audit`.)
export async function run({ browser, base, ok }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const inner = async () => {
    const f = await (await page.waitForSelector('iframe')).contentFrame();
    await f.waitForSelector('#navList .nav-item', { state: 'attached' });
    return f;
  };
  // open the first section that has a diagram, and return what was authored for it
  const openFirstDiagram = (f) => f.evaluate(() => {
    const e = INDEX.find((x) => x.section.id !== 'quickref' && /<div class="diagram/.test(x.item.a));
    window.postMessage({ type: 'goto-section', id: e.section.id }, '*');
    return { sec: e.section.id, q: e.qIdx, authored: e.item.a.match(/<svg[\s\S]*?<\/svg>/)[0], labels: (e.item.a.match(/<text/g) || []).length };
  });
  const state = (f, t) => f.evaluate(({ sec, q }) => {
    const card = document.querySelector(`.qcard[data-sec="${sec}"][data-q="${q}"]`);
    card.classList.add('open');
    const box = card.querySelector('.diagram'), svg = box.querySelector('svg');
    const norm = (s) => { const d = document.createElement('div'); d.innerHTML = s; return d.innerHTML; };
    return {
      sketched: svg.classList.contains('sk'), tidyClass: box.classList.contains('tidy'),
      labels: svg.querySelectorAll('text').length, html: norm(svg.outerHTML),
      font: getComputedStyle(svg.querySelector('text')).fontFamily,
      pressed: box.querySelector('.dg-bar button[aria-pressed="true"]')?.dataset.dg,
      opacity: getComputedStyle(svg.querySelector('text')).opacity,
    };
  }, t);

  await page.goto(`${base}/whiteboard`, { waitUntil: 'networkidle' });
  let f = await inner();
  const t = await openFirstDiagram(f);
  await f.waitForSelector(`.qcard[data-sec="${t.sec}"][data-q="${t.q}"] .diagram svg`, { state: 'attached' });
  let s = await state(f, t);
  ok('a diagram is drawn as a whiteboard sketch by default', s.sketched && s.pressed === 'sketch' && /Caveat/.test(s.font), `${s.pressed}, ${s.font.slice(0, 24)}`);
  ok('the sketch keeps every label of the authored diagram', s.labels === t.labels && t.labels > 0, `${s.labels} of ${t.labels}`);
  await page.waitForTimeout(1600);
  ok('labels are fully visible once the draw-in has finished', (await state(f, t)).opacity === '1');

  await f.click(`.qcard[data-sec="${t.sec}"][data-q="${t.q}"] .dg-bar button[data-dg="tidy"]`);
  s = await state(f, t);
  const authored = await f.evaluate((a) => { const d = document.createElement('div'); d.innerHTML = a; return d.innerHTML; }, t.authored);
  ok('"Tidy" restores the diagram exactly as authored', !s.sketched && s.tidyClass && s.pressed === 'tidy' && s.html === authored, s.html === authored ? 'identical markup' : 'markup differs');

  // remembered across guides (the pref lives in localStorage, like the theme)
  await page.goto(`${base}/sql`, { waitUntil: 'networkidle' });
  f = await inner();
  const t2 = await openFirstDiagram(f);
  await f.waitForSelector(`.qcard[data-sec="${t2.sec}"][data-q="${t2.q}"] .diagram svg`, { state: 'attached' });
  s = await state(f, t2);
  ok('the choice is remembered on another guide', !s.sketched && s.pressed === 'tidy');
  await f.click(`.qcard[data-sec="${t2.sec}"][data-q="${t2.q}"] .dg-bar button[data-dg="sketch"]`);
  s = await state(f, t2);
  ok('switching back redraws the sketch with nothing lost', s.sketched && s.labels === t2.labels, `${s.labels} of ${t2.labels}`);
  // code and SQL inside a sketch are not handwritten: they keep the type they were authored in
  const fonts = await f.evaluate(({ sec, q }) => {
    const svg = document.querySelector(`.qcard[data-sec="${sec}"][data-q="${q}"] .diagram svg`);
    const code = svg.querySelector('text.sk-code'), hand = svg.querySelector('text:not(.sk-code)');
    return { code: code ? code.textContent + ' | ' + getComputedStyle(code).fontFamily.slice(0, 22) : null, hand: getComputedStyle(hand).fontFamily.slice(0, 8) };
  }, t2);
  ok('code inside a sketch stays in its authored type, the rest is handwritten', !!fonts.code && !/Caveat/.test(fonts.code) && /Caveat/.test(fonts.hand), fonts.code);
  // Enlarge: the same diagram, as wide as the window, in a dialog that Esc closes
  await f.click(`.qcard[data-sec="${t2.sec}"][data-q="${t2.q}"] .dg-bar button[data-dg="zoom"]`);
  const z = await f.evaluate(() => { const d = document.getElementById('dgZoom'), svg = d.querySelector('svg'); return { open: d.open, labels: svg.querySelectorAll('text').length, width: Math.round(svg.getBoundingClientRect().width), sk: svg.classList.contains('sk') }; });
  const inlineWidth = await f.evaluate(({ sec, q }) => Math.round(document.querySelector(`.qcard[data-sec="${sec}"][data-q="${q}"] .diagram svg`).getBoundingClientRect().width), t2);
  ok('"Enlarge" opens the same diagram, larger, with every label', z.open && z.sk && z.labels === t2.labels && z.width > inlineWidth, `${inlineWidth}px -> ${z.width}px, ${z.labels} labels`);
  await page.keyboard.press('Escape');
  ok('Esc closes the enlarged diagram', !(await f.evaluate(() => document.getElementById('dgZoom').open)));
  ok('the loading label is gone once the guide has loaded', (await page.getByText('Loading study guide').count()) === 0);
  ok('no script errors while switching diagram styles', errors.length === 0, errors.join(' | ').slice(0, 160));
  await page.close();
}
