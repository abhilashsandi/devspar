// Weak cards: marking "Again" in flashcards persists (shared across guides by question title,
// same as progress), the "Review weak cards" button appears with the right count, "Got it"
// clears it, and the homepage banner links to #weak which auto-starts the deck.
export async function run({ browser, base, ok }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const inner = async () => {
    const f = await (await page.waitForSelector('iframe')).contentFrame();
    await f.waitForSelector('#navList .nav-item', { state: 'attached' });
    return f;
  };

  await page.goto(`${base}/javascript`, { waitUntil: 'networkidle' });
  let f = await inner();
  ok('fcWeak button starts hidden (no weak cards yet)', await f.evaluate(() => document.getElementById('fcWeak').hidden));

  // start a flashcard deck from the current section and mark the first card "Again"
  const title = await f.evaluate(() => {
    document.querySelector('.flash-btn').click();
    return document.querySelector('.fc-q')?.textContent;
  });
  await f.click('[data-fc="reveal"]');
  await f.click('[data-fc="again"]');
  await f.click('[data-fc="close"]');
  ok('fcWeak button shows after marking a card "Again"', !(await f.evaluate(() => document.getElementById('fcWeak').hidden)));

  // shared across guides: the same question on interview-prep is weak too
  await page.goto(`${base}/interview-prep`, { waitUntil: 'networkidle' });
  f = await inner();
  const sharedWeak = await f.evaluate((t) => {
    const e = INDEX.find((x) => x.item.q.replace(/<[^>]+>/g, '') === t);
    return e ? !!weak[e.tkey] : 'not found';
  }, title);
  ok('weak card is shared across guides by title', sharedWeak === true, `"${(title || '').slice(0, 50)}" -> ${sharedWeak}`);

  // #weak deep link auto-starts the weak-cards deck (this is the homepage banner's real flow:
  // navigating to another page and back, so it's a fresh mount, not a same-page hash change —
  // that case is also handled, via a hashchange listener, but isn't what this checks)
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.goto(`${base}/interview-prep#weak`, { waitUntil: 'networkidle' });
  f = await inner();
  await f.waitForSelector('.fc-q', { timeout: 5000 });
  ok('#weak deep link opens the weak-cards deck', !!(await f.$('.fc-q')));

  // "Got it" clears it
  await f.click('[data-fc="reveal"]');
  await f.click('[data-fc="got"]');
  const stillWeak = await f.evaluate((t) => {
    const e = INDEX.find((x) => x.item.q.replace(/<[^>]+>/g, '') === t);
    return e ? !!weak[e.tkey] : 'not found';
  }, title);
  ok('"Got it" clears the weak mark', stillWeak === false, stillWeak);

  // same-page hash change (no remount): still opens the deck, via the hashchange listener
  await page.goto(`${base}/javascript`, { waitUntil: 'networkidle' });
  await page.evaluate((t) => {
    const key = t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    localStorage.setItem('study-weak-titles-v1', JSON.stringify({ [key]: 1 }));
  }, title);
  await page.evaluate(() => { window.location.hash = 'weak'; });
  f = await inner();
  await f.waitForSelector('.fc-q', { timeout: 5000 }).catch(() => {});
  ok('same-page hash change to #weak also opens the deck', !!(await f.$('.fc-q')));

  await page.close();
}
