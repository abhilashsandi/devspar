// The seams the practice tools share: opening a set of cards as a flashcard deck from a link, showing one
// card on its own (the embed), and the homepage's tools section (only when a tool is ready).
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export async function run({ browser, base, ok }) {
  const errors = [];
  const watch = (p) => p.on('pageerror', (e) => errors.push(e.message));

  // --- solo mode: one card, nothing else
  const solo = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  watch(solo);
  await solo.goto(`${base}/study/sql.html?card=sq4:1`, { waitUntil: 'networkidle' });
  const s = await solo.evaluate(() => {
    const vis = (sel) => { const e = document.querySelector(sel); return !!e && e.offsetParent !== null && getComputedStyle(e).display !== 'none'; };
    const e = INDEX.find((x) => x.section.id === 'sq4' && x.qIdx === 1);
    return {
      cards: document.querySelectorAll('.qcard').length,
      open: document.querySelector('.qcard').classList.contains('open'),
      sidebar: vis('.sidebar'), hero: vis('.hero'),
      title: document.querySelector('.qcard .qtext').textContent.trim(),
      want: e.item.q.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim(),
    };
  });
  ok('solo mode shows exactly one open card', s.cards === 1 && s.open, `${s.cards} card(s)`);
  ok('solo mode hides the sidebar and the hero', !s.sidebar && !s.hero);
  ok('solo mode shows the requested card', s.title.slice(0, 30) === s.want.slice(0, 30), s.title.slice(0, 40));

  const gone = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  watch(gone);
  await gone.goto(`${base}/study/sql.html?card=nope:99`, { waitUntil: 'networkidle' });
  ok('an unknown card says it has moved', (await gone.locator('text=This card has moved.').count()) === 1);
  await gone.close();
  await solo.close();

  // --- the embed reports its height to the frame it sits in
  const host = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  watch(host);
  await host.goto(`${base}/study/sql.html`, { waitUntil: 'networkidle' });
  const hs = await host.evaluate(() => new Promise((resolve) => {
    const f = document.createElement('iframe');
    f.style.cssText = 'width:900px;height:50px;border:0;position:fixed;left:0;top:0;background:#fff;z-index:99';
    f.src = '/study/sql.html?card=sq4:1';
    window.addEventListener('message', (e) => {
      if (e.source === f.contentWindow && e.data && e.data.type === 'solo-height' && e.data.height > 100) resolve({ card: e.data.card, height: e.data.height });
    });
    document.body.appendChild(f);
    setTimeout(() => resolve(null), 8000);
  }));
  ok('the embedded card reports its height', !!hs && hs.card === 'sq4:1' && hs.height > 100, hs ? `${hs.height}px` : 'no message');
  await host.close();

  // --- a deck from a link
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  watch(page);
  await page.goto(`${base}/sql#deck=sq1:0,sq1:1,zz:9`, { waitUntil: 'networkidle' });
  const frame = await (await page.waitForSelector('iframe')).contentFrame();
  await frame.waitForSelector('#fc:not([hidden])', { timeout: 8000 }).catch(() => {});
  const deck = await frame.evaluate(() => ({
    open: !document.getElementById('fc').hidden,
    title: document.querySelector('#fc .fc-title').textContent,
    count: document.querySelector('#fc .fc-count').textContent,
  }));
  ok('a #deck= link opens the flashcard dialog', deck.open, deck.title);
  ok('the deck is titled "Your deck" and unknown keys are dropped', deck.title === 'Your deck' && /^1 \/ 2/.test(deck.count), deck.count);
  await frame.click('button[data-fc="reveal"]');
  await page.waitForTimeout(3500);   // the link's message keeps being posted for a few seconds
  const after = await frame.evaluate(() => ({ revealed: !!document.querySelector('#fc .fc-a'), count: document.querySelector('#fc .fc-count').textContent }));
  ok('the repeated deck message does not reset the reader', after.revealed && /^1 \/ 2/.test(after.count), after.count);
  await page.close();

  // --- the tools section appears only when a tool is ready
  const { TOOLS } = await import(pathToFileURL(path.resolve('app/lib/tools.mjs')).href);
  const ready = TOOLS.filter((t) => t.ready);
  const home = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  watch(home);
  await home.goto(`${base}/`, { waitUntil: 'networkidle' });
  const heading = await home.locator('h2', { hasText: 'Practice tools' }).count();
  if (!ready.length) ok('the homepage has no Practice tools section while no tool is ready', heading === 0);
  else {
    const links = await home.locator('#tools a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    ok('the homepage lists exactly the ready tools, in order', heading === 1 && JSON.stringify(links) === JSON.stringify(ready.map((t) => t.href)), links.join(' '));
  }
  await home.close();

  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
}
