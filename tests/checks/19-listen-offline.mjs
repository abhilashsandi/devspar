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
  // ---------------------------------------------------------------- Listen: the audio overview
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await ctx.addInitScript(FAKE_SPEECH);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const frameOf = async (p = page) => {
    const f = await (await p.waitForSelector('iframe')).contentFrame();
    await f.waitForSelector('#navList .nav-item', { state: 'attached' });
    return f;
  };
  const spoken = (f) => f.evaluate(() => window.__spoken.slice());
  const label = (f) => f.locator('#listenBar .ls-label').textContent();
  const overview = JSON.parse(await (await import('node:fs/promises')).readFile('public/study/audio/whiteboard.json', 'utf8'));
  const total = overview.chapters.length + 1;

  await page.goto(`${base}/whiteboard`, { waitUntil: 'networkidle' });
  let f = await frameOf();
  ok('a Listen button is offered when the browser can speak', (await f.locator('#listenBtn').count()) === 1 && (await f.locator('button[data-act="listen"]').count()) === 1);

  await f.click('#listenBtn');
  await f.waitForSelector('#listenBar', { state: 'visible' });
  await page.waitForTimeout(400);
  let said = await spoken(f);
  ok('Listen plays the guide’s audio overview, not the cards', (await f.locator('#listenBar').getAttribute('data-mode')) === 'overview' && said[0].startsWith(overview.intro.slice(0, 40)), (said[0] || '').slice(0, 60));
  ok('it starts at the introduction', (await label(f)) === `1 / ${total} · Introduction`, await label(f));

  await f.click('#listenBar .ls-next');
  await page.waitForTimeout(300);
  ok('Next goes to the first chapter, named after its section', (await label(f)) === `2 / ${total} · ${overview.chapters[0].title}`, await label(f));
  ok('the guide opens that section, and the player keeps going', (await f.locator('.section-head h2').textContent()).includes(overview.chapters[0].title) && (await f.locator('#listenBar').count()) === 1);
  said = await spoken(f);
  ok('the chapter is the written script', said.some((s) => s.startsWith(overview.chapters[0].text.slice(0, 30))));

  await f.waitForFunction(() => /^3 \//.test(document.querySelector('#listenBar .ls-label').textContent), null, { timeout: 30000 }).catch(() => {});
  ok('it moves on to the next chapter by itself', (await label(f)).startsWith('3 / '), await label(f));
  said = await spoken(f);
  ok('every chunk is short, and nothing but prose is read out', said.every((s) => s.length <= 220 && !/[<>{}`]|viewBox/.test(s)), `${said.length} chunks, longest ${Math.max(...said.map((s) => s.length))}`);

  await f.click('#listenBar .ls-play');
  await page.waitForTimeout(150);
  const atPause = (await spoken(f)).length;
  await page.waitForTimeout(900);
  ok('Pause stops new speech', (await spoken(f)).length === atPause);
  ok('the button now offers Play', (await f.locator('#listenBar .ls-play').textContent()) === 'Play');
  await f.click('#listenBar .ls-play');
  await page.waitForTimeout(300);
  ok('Play carries on', (await spoken(f)).length > atPause);

  await f.selectOption('#listenBar .ls-rate', '1.4');
  await f.click('#listenBar .ls-close');
  ok('Close removes the bar', (await f.locator('#listenBar').count()) === 0);
  const afterClose = (await spoken(f)).length;
  await page.waitForTimeout(900);
  ok('Close stops the speech', (await spoken(f)).length === afterClose);

  // a section's own Listen button starts at that section's chapter
  await f.evaluate(() => window.postMessage({ type: 'goto-section', id: 'wb5' }, '*'));
  await f.waitForSelector('.qcard[data-sec="wb5"]', { state: 'attached' });
  await f.click('button[data-act="listen"]');
  await f.waitForSelector('#listenBar');
  const at5 = overview.chapters.findIndex((c) => c.id === 'wb5') + 2;
  ok('a section’s Listen button starts at its chapter', (await label(f)) === `${at5} / ${total} · ${overview.chapters[at5 - 2].title}`, await label(f));
  ok('the chosen speed is remembered', (await f.locator('#listenBar .ls-rate').inputValue()) === '1.4');

  await f.click('#fcCore');
  await f.waitForSelector('#fc:not([hidden])');
  ok('starting flashcards while listening removes the bar', (await f.locator('#listenBar').count()) === 0);
  await page.keyboard.press('Escape');
  await ctx.close();

  // ---------------------------------------------------------------- Listen: a guide with no overview reads its cards
  const plain = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
  await plain.addInitScript(FAKE_SPEECH);
  const cp = await plain.newPage();
  cp.on('pageerror', (e) => errors.push(e.message));
  await cp.route('**/study/audio/*.json', (r) => r.fulfill({ status: 404, body: 'none' }));
  await cp.goto(`${base}/whiteboard`, { waitUntil: 'networkidle' });
  const cf = await frameOf(cp);
  await cf.evaluate(() => window.postMessage({ type: 'goto-section', id: 'wb2' }, '*'));
  await cf.waitForSelector('.qcard[data-sec="wb2"]', { state: 'attached' });
  await cf.click('#listenBtn');
  await cf.waitForSelector('#listenBar', { state: 'visible' });
  await cp.waitForTimeout(400);
  const first = await cf.evaluate(() => { const e = INDEX.find((x) => x.section.id === 'wb2' && x.qIdx === 0); return e.item.q.replace(/<[^>]+>/g, '').trim(); });
  let csaid = await spoken(cf);
  ok('without an overview, Listen reads the cards: the question first', (await cf.locator('#listenBar').getAttribute('data-mode')) === 'cards' && csaid[0].startsWith('Question. ') && csaid[0].includes(first.slice(0, 25)), (csaid[0] || '').slice(0, 70));
  ok('the card being read is open and marked', await cf.evaluate(() => { const c = document.querySelector('.qcard[data-sec="wb2"][data-q="0"]'); return c.classList.contains('open') && c.classList.contains('listening'); }));
  await cf.waitForFunction(() => /^2 \//.test(document.querySelector('#listenBar .ls-label').textContent), null, { timeout: 15000 }).catch(() => {});
  csaid = await spoken(cf);
  ok('it moves on to the next card, in short chunks with no markup', (await label(cf)).startsWith('2 / ') && csaid.every((s) => s.length <= 220 && !/[<>]|viewBox/.test(s)), await label(cf));
  ok('card reading offers Full answers; the overview does not', (await cf.locator('#listenBar .ls-full').count()) === 1);
  await plain.close();

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

  // ---------------------------------------------------------------- Offline
  const { readFile } = await import('node:fs/promises');
  const version = ((await readFile('public/sw.js', 'utf8')).match(/const VERSION = '([0-9a-f]+)'/) || [])[1];
  const off = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const op = await off.newPage();
  op.on('pageerror', (e) => errors.push(e.message));

  const manifest = await op.request.get(`${base}/manifest.webmanifest`);
  const mj = manifest.ok() ? await manifest.json() : {};
  ok('the web app manifest is served with three icons', mj.name === 'DevSpar' && mj.display === 'standalone' && (mj.icons || []).length === 3 && (mj.icons || []).some((i) => i.purpose === 'maskable'), JSON.stringify(mj).slice(0, 60));

  await op.goto(`${base}/`, { waitUntil: 'networkidle' });
  await op.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await op.reload({ waitUntil: 'networkidle' });
  ok('the service worker is installed and controls the page', await op.evaluate(() => !!navigator.serviceWorker.controller));

  await op.getByRole('button', { name: 'Save for offline' }).click();
  await op.getByText(/^Saved for offline on /).waitFor({ timeout: 90000 }).catch(() => {});
  ok('Save for offline finishes', (await op.getByText(/^Saved for offline on /).count()) === 1, await op.locator('footer').textContent());

  await off.setOffline(true);
  await op.goto(`${base}/sql`, { waitUntil: 'load' });
  const of = await (await op.waitForSelector('iframe')).contentFrame();
  await of.waitForSelector('#navList .nav-item', { state: 'attached', timeout: 15000 }).catch(() => {});
  ok('a saved guide opens with no connection', (await of.locator('#navList .nav-item').count()) > 0);
  await of.locator('.qcard .qhead').first().click();
  ok('and its cards open', (await of.locator('.qcard.open').count()) === 1);

  await op.goto(`${base}/`, { waitUntil: 'load' });
  await op.getByRole('link', { name: /^Node\.js/ }).first().click();
  await op.waitForURL(/\/nodejs$/, { timeout: 15000 }).catch(() => {});
  const nf = await (await op.waitForSelector('iframe', { timeout: 15000 })).contentFrame();
  await nf.waitForSelector('#navList .nav-item', { state: 'attached', timeout: 15000 }).catch(() => {});
  ok('a guide opened from the home page works offline too', /\/nodejs$/.test(op.url()) && (await nf.locator('#navList .nav-item').count()) > 0, op.url());

  await op.goto(`${base}/definitely-not-a-page-xyz`, { waitUntil: 'load' });
  ok('a page that was never saved says so, in the site’s own words', (await op.getByText('You are offline, and this page has not been saved yet.').count()) === 1);

  await op.goto(`${base}/`, { waitUntil: 'load' });
  await op.getByRole('searchbox').first().fill('closure');
  await op.waitForTimeout(1200);
  ok('search works offline (the index is saved)', (await op.locator('a[href*="#"]', { hasText: /closure/i }).count()) > 0);

  await off.setOffline(false);
  const status = await op.evaluate(() => fetch('/api/mock-interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then((r) => r.status));
  ok('the API is never intercepted: the server still answers', status === 400, String(status));
  const names = await op.evaluate(() => caches.keys());
  ok('exactly two DevSpar caches, both of this build', names.filter((n) => n.startsWith('devspar-')).length === 2 && names.every((n) => n.includes(version)), names.join(' '));
  await off.close();

  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
}
