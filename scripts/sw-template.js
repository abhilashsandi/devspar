// DevSpar's service worker. scripts/build-sw.mjs fills in the version and the two lists below (the three
// placeholders are written with double underscores) and writes public/sw.js (git-ignored). It makes the guides open with no connection, and nothing else about the site
// changes: pages still come from the network first, and /api and /my-prep are never touched.
const VERSION = '__VERSION__';
const STATIC = 'devspar-' + VERSION + '-static';
const PAGES = 'devspar-' + VERSION + '-pages';
const PRECACHE = __PRECACHE__;
const ROUTES = __ROUTES__;
const PRECACHE_SET = new Set(PRECACHE);
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const stat = await caches.open(STATIC);
    await Promise.all(PRECACHE.map((u) => stat.add(u).catch(() => {})));       // one missing file must not block the install
    const pages = await caches.open(PAGES);
    await pages.add('/offline').catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('devspar-') && name !== STATIC && name !== PAGES) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}
// Serve what is cached now, and refresh it for next time.
async function staleWhileRevalidate(req, cacheName, key) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(key || req);
  const refresh = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(key || req, res.clone()); return res; }).catch(() => null);
  if (hit) return hit;
  const res = await refresh;
  return res || new Response('', { status: 504 });
}
async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req);
    if (hit) return hit;
    throw e;
  }
}
// A page load: the network, but give up after four seconds; then the saved page; then the offline page.
async function navigate(req) {
  const pages = await caches.open(PAGES);
  const key = new URL(req.url).pathname;
  try {
    const res = await Promise.race([fetch(req), timeout(4000)]);
    if (res && res.ok) pages.put(key, res.clone());
    return res;
  } catch (e) {
    const hit = await pages.match(key);
    if (hit) return hit;
    const off = await pages.match('/offline');
    return off || new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    if (FONT_HOSTS.includes(url.hostname)) event.respondWith(staleWhileRevalidate(req, STATIC));
    return;
  }
  const path = url.pathname;
  if (path.startsWith('/api/') || path.startsWith('/my-prep') || path === '/sw.js') return;         // never intercepted
  if (path.startsWith('/_next/static/') || path.startsWith('/vendor/')) { event.respondWith(cacheFirst(req, STATIC)); return; }
  if (path.startsWith('/study/') || PRECACHE_SET.has(path)) {
    // the query string (?card=...) does not change the file, so one saved copy serves them all
    event.respondWith(staleWhileRevalidate(req, STATIC, new Request(url.origin + path)));
    return;
  }
  if (req.mode === 'navigate') { event.respondWith(navigate(req)); return; }
  event.respondWith(networkFirst(req, STATIC));
});

// "Save for offline": fetch every route and the files it needs, reporting progress to the page.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'warm') event.waitUntil(warm(event.source));
});
async function warm(client) {
  const pages = await caches.open(PAGES), stat = await caches.open(STATIC);
  const assets = new Set(), failed = [];
  const find = (text) => { for (const m of text.matchAll(/\/_next\/static\/[^"'\s\\)]+/g)) assets.add(m[0]); };
  let done = 0;
  for (const route of ROUTES) {
    try {
      const res = await fetch(route, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(String(res.status));
      find(await res.clone().text());
      await pages.put(route, res);
    } catch (e) { failed.push(route); }
    done++;
    if (client) client.postMessage({ type: 'warm-progress', done, total: ROUTES.length });
  }
  for (const a of [...assets]) {                                       // scripts, styles, and the fonts a stylesheet names
    try {
      let res = await stat.match(a);
      if (!res) { res = await fetch(a); if (!res.ok) continue; await stat.put(a, res.clone()); }
      if (/\.css$/.test(a)) find(await res.clone().text());
    } catch (e) { /* a missing asset is not worth failing the whole save */ }
  }
  for (const a of assets) { if (!(await stat.match(a))) { try { const r = await fetch(a); if (r.ok) await stat.put(a, r); } catch (e) { /* ignore */ } } }
  try {                                                                 // the guides' web fonts
    const guide = await stat.match('/study/interview-prep.html');
    const css = guide && (await guide.clone().text()).match(/https:\/\/fonts\.googleapis\.com\/css2[^"']+/);
    if (css) {
      const href = css[0].replace(/&amp;/g, '&');
      const sheet = await fetch(href, { mode: 'cors' });
      if (sheet.ok) {
        await stat.put(href, sheet.clone());
        for (const m of (await sheet.text()).matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)) {
          try { const f = await fetch(m[1], { mode: 'cors' }); if (f.ok) await stat.put(m[1], f); } catch (e) { /* ignore */ }
        }
      }
    }
  } catch (e) { /* fonts fall back to the system fonts */ }
  if (client) client.postMessage({ type: 'warm-done', failed });
}
