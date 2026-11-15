// Listen mode (a fake speech engine stands in for the device's voice) and, further down, offline use.
const FAKE_SPEECH = () => {
  window.__spoken = [];
  const timers = new Set();
  const fake = {
    speak(u) { window.__spoken.push(u.text); const t = setTimeout(() => { timers.delete(t); if (u.onend) u.onend(); }, 5); timers.add(t); },
    cancel() { timers.forEach(clearTimeout); timers.clear(); },
    getVoices() { return [{ name: 'Fake A', lang: 'en-GB', voiceURI: 'a' }, { name: 'Fake B', lang: 'en-US', voiceURI: 'b' }]; },
  };
  Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  window.SpeechSynthesisUtterance = function (text) { this.text = text; };
};
const NO_SPEECH = () => { Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }); };

export async function run({ browser, base, ok }) {
  // ---------------------------------------------------------------- Listen
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await ctx.addInitScript(FAKE_SPEECH);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const frameOf = async () => {
    const f = await (await page.waitForSelector('iframe')).contentFrame();
    await f.waitForSelector('#navList .nav-item', { state: 'attached' });
    return f;
  };
  const spoken = (f) => f.evaluate(() => window.__spoken.slice());

  await page.goto(`${base}/whiteboard`, { waitUntil: 'networkidle' });
  let f = await frameOf();
  await f.evaluate(() => window.postMessage({ type: 'goto-section', id: 'wb2' }, '*'));
  await f.waitForSelector('.qcard[data-sec="wb2"]', { state: 'attached' });
  ok('a Listen button is offered when the browser can speak', (await f.locator('#listenBtn').count()) === 1 && (await f.locator('button[data-act="listen"]').count()) === 1);

  await f.click('#listenBtn');
  await f.waitForSelector('#listenBar', { state: 'visible' });
  await page.waitForTimeout(400);
  const first = await f.evaluate(() => { const e = INDEX.find((x) => x.section.id === 'wb2' && x.qIdx === 0); return e.item.q.replace(/<[^>]+>/g, '').trim(); });
  let said = await spoken(f);
  ok('it starts by reading the first question', said[0].startsWith('Question. ') && said[0].includes(first.slice(0, 25)), (said[0] || '').slice(0, 70));
  ok('the first card is open and marked as being read', await f.evaluate(() => { const c = document.querySelector('.qcard[data-sec="wb2"][data-q="0"]'); return c.classList.contains('open') && c.classList.contains('listening'); }));

  await f.waitForFunction(() => /^2 \//.test(document.querySelector('#listenBar .ls-label').textContent), null, { timeout: 15000 }).catch(() => {});
  said = await spoken(f);
  ok('it moves on to the next card by itself', /^2 \//.test(await f.locator('#listenBar .ls-label').textContent()), await f.locator('#listenBar .ls-label').textContent());
  ok('every chunk is short, and no markup or diagram source is read out', said.every((s) => s.length <= 220 && !/[<>]|viewBox/.test(s)), `${said.length} chunks, longest ${Math.max(...said.map((s) => s.length))}`);

  await f.click('#listenBar .ls-play');
  await page.waitForTimeout(150);
  const atPause = (await spoken(f)).length;
  await page.waitForTimeout(600);
  ok('Pause stops new speech', (await spoken(f)).length === atPause);
  ok('the button now offers Play', (await f.locator('#listenBar .ls-play').textContent()) === 'Play');
  await f.click('#listenBar .ls-play');
  await page.waitForTimeout(300);
  ok('Play carries on', (await spoken(f)).length > atPause);

  await f.selectOption('#listenBar .ls-rate', '1.4');
  await f.click('#listenBar .ls-close');
  ok('Close removes the bar and the marker', (await f.locator('#listenBar').count()) === 0 && (await f.locator('.qcard.listening').count()) === 0);
  const afterClose = (await spoken(f)).length;
  await page.waitForTimeout(500);
  ok('Close stops the speech', (await spoken(f)).length === afterClose);

  await page.reload({ waitUntil: 'networkidle' });
  f = await frameOf();
  await f.click('#listenBtn');
  await f.waitForSelector('#listenBar');
  ok('the chosen speed is remembered after a reload', (await f.locator('#listenBar .ls-rate').inputValue()) === '1.4');

  await f.click('#fcCore');
  await f.waitForSelector('#fc:not([hidden])');
  ok('starting flashcards while listening removes the bar', (await f.locator('#listenBar').count()) === 0);
  await page.keyboard.press('Escape');
  await ctx.close();

  // a browser with no speech synthesis
  const mute = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await mute.addInitScript(NO_SPEECH);
  const quiet = await mute.newPage();
  quiet.on('pageerror', (e) => errors.push(e.message));
  await quiet.goto(`${base}/whiteboard`, { waitUntil: 'networkidle' });
  const qf = await (await quiet.waitForSelector('iframe')).contentFrame();
  await qf.waitForSelector('#navList .nav-item', { state: 'attached' });
  ok('without speech synthesis there is no Listen button', (await qf.locator('#listenBtn').count()) === 0 && (await qf.locator('button[data-act="listen"]').count()) === 0);
  await mute.close();

  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
}
