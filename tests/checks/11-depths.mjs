// Answer length switch and follow-up ladder, on guides that carry extras (interview-prep) and on one that does not.
export async function run({ browser, base, ok }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const inner = async () => {
    const f = await (await page.waitForSelector('iframe')).contentFrame();
    await f.waitForSelector('#navList .nav-item', { state: 'attached' });
    return f;
  };

  await page.goto(`${base}/interview-prep`, { waitUntil: 'networkidle' });
  let f = await inner();
  // the first card that carries extras
  const target = await f.evaluate(() => {
    const e = INDEX.filter((x) => /class="xdepths"/.test(x.item.a));
    const t = e[0];
    window.postMessage({ type: 'goto-section', id: t.section.id }, '*');
    return { sec: t.section.id, q: t.qIdx, count: e.length };
  });
  const card = `.qcard[data-sec="${target.sec}"][data-q="${target.q}"]`;
  await f.waitForSelector(card, { state: 'attached' });
  await f.evaluate((c) => document.querySelector(c).classList.add('open'), card);

  const state = () => f.evaluate((c) => {
    const el = document.querySelector(c), body = el.querySelector('.qbody');
    const bar = body.querySelector('.depth-bar');
    const vis = (e) => !!e && e.offsetParent !== null;
    const first = Array.from(body.children).find((x) => x.tagName === 'P' && !x.closest('.xdepths') && !x.closest('.xladder'));
    return {
      bar: !!bar, pressed: bar ? bar.querySelector('button[aria-pressed="true"]').textContent : null,
      time: bar ? bar.querySelector('.depth-time').textContent : '',
      buttons: bar ? bar.querySelectorAll('button').length : 0,
      firstVisible: vis(first),
      script15: vis(body.querySelector('[data-depth="15"]')), script60: vis(body.querySelector('.xdepths [data-depth="60"]')),
      rungs: Array.from(body.querySelectorAll('.rung')).filter((r) => !r.hidden).length,
      counter: (body.querySelector('.ladder-count') || {}).textContent || '',
      next: !!body.querySelector('.ladder-next'),
    };
  }, card);

  let s = await state();
  ok('a card with extras has a three-button length switch, Full answer pressed', s.bar && s.buttons === 3 && s.pressed === 'Full answer' && s.firstVisible, s.pressed);
  ok('the full answer reports its spoken length in minutes', /^about \d+ min spoken$/.test(s.time), s.time);
  ok('the ladder starts with one rung and a counter', s.rungs === 1 && /^Follow-up 1 of [23]$/.test(s.counter), s.counter);

  await f.click(`${card} .depth-bar button[data-depth="15"]`);
  s = await state();
  ok('15 s shows the short script and hides the full answer', s.pressed === '15 s' && s.script15 && !s.script60 && !s.firstVisible);
  ok('the short script reports its spoken length in seconds', /^about \d+ s spoken$/.test(s.time), s.time);
  ok('the ladder stays visible in short mode', s.rungs === 1);

  // the ladder
  const total = Number(s.counter.split(' of ')[1]);
  await f.click(`${card} .ladder-next`);
  s = await state();
  ok('Push harder shows the next rung and moves focus to it', s.rungs === 2 && /^Follow-up 2 of /.test(s.counter) && await f.evaluate(() => document.activeElement.tagName === 'SUMMARY' && !!document.activeElement.closest('.rung')));
  if (total === 3) await f.click(`${card} .ladder-next`);
  s = await state();
  ok('the button goes away after the last rung', !s.next && s.rungs === total, s.counter);
  await f.click(`${card} .rung:last-of-type summary`);
  ok('opening a rung shows its answer', await f.evaluate((c) => { const r = document.querySelector(c).querySelectorAll('.rung'); const l = r[r.length - 1]; return l.open && l.querySelector('p').offsetParent !== null; }, card));

  // remembered, and shared by every card
  await page.reload({ waitUntil: 'networkidle' });
  f = await inner();
  await f.evaluate((t) => { window.postMessage({ type: 'goto-section', id: t.sec }, '*'); }, target);
  await f.waitForSelector(card, { state: 'attached' });
  await f.evaluate((c) => document.querySelector(c).classList.add('open'), card);
  s = await state();
  ok('the chosen length is remembered after a reload', s.pressed === '15 s', s.pressed);

  // a card without extras gets no switch and keeps its full answer while a short length is chosen
  const plain = await f.evaluate(() => {
    const e = INDEX.find((x) => !/class="xdepths"/.test(x.item.a) && x.section.id !== 'review' && x.section.id !== 'quickref');
    window.postMessage({ type: 'goto-section', id: e.section.id }, '*');
    return { sec: e.section.id, q: e.qIdx };
  });
  const pc = `.qcard[data-sec="${plain.sec}"][data-q="${plain.q}"]`;
  await f.waitForSelector(pc, { state: 'attached' });
  const p = await f.evaluate((c) => { const el = document.querySelector(c); el.classList.add('open'); const b = el.querySelector('.qbody'); return { bar: !!b.querySelector('.depth-bar'), short: b.classList.contains('depth-short'), shown: b.firstElementChild && b.firstElementChild.offsetParent !== null }; }, pc);
  ok('a card without extras has no switch and shows its full answer', !p.bar && !p.short && p.shown);

  // flashcards show the switch too
  await f.evaluate(() => document.getElementById('fcCore').click());
  await f.waitForSelector('#fc:not([hidden])');
  let found = false;
  for (let i = 0; i < 60 && !found; i++) {
    await f.click('button[data-fc="reveal"]');
    found = await f.evaluate(() => !!document.querySelector('#fc .fc-a .depth-bar'));
    if (!found) await page.keyboard.press('ArrowRight');
  }
  ok('the revealed answer in flashcards carries the switch when the card has extras', found);
  await page.keyboard.press('Escape');

  ok('all 60 core cards of Interview Prep carry short answers and follow-ups', target.count === 60, String(target.count));

  // a guide with no extras at all
  const sql = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  sql.on('pageerror', (e) => errors.push(e.message));
  await sql.goto(`${base}/sql`, { waitUntil: 'networkidle' });
  const sf = await (await sql.waitForSelector('iframe')).contentFrame();
  await sf.waitForSelector('#navList .nav-item', { state: 'attached' });
  await sf.evaluate(() => document.querySelectorAll('.qcard').forEach((c) => c.classList.add('open')));
  ok('a guide without extras has no switch', (await sf.locator('.depth-bar').count()) === 0);
  await sql.close();
  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}
