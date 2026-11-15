# P9: Listen Mode and Offline Install Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two things for studying away from a desk: a Listen mode that reads a guide’s questions and answers aloud as a playlist, and an installable, offline-capable site, so the guides open on a phone with no connection.

**Architecture:** Part A is an engine block: it turns a card into short speakable sentences (using the 60-second answer where one exists) and plays a queue through the browser’s own speech synthesis, with a small player bar. No audio files are generated or downloaded. Part B is a web app manifest and one service worker, generated at build time with the list of guide files and a version hash: static guide files are precached, hashed Next.js assets are cached on first use, page loads try the network first and fall back to the cache, and a “Save for offline” button warms every guide and tool route.

**Tech Stack:** Web Speech API (`speechSynthesis`), Screen Wake Lock API, Service Worker and Cache Storage, Next.js 16 (`app/manifest.ts`), Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (feature 10). Requires P0. **Run this plan last**, after every other plan you intend to ship, so the offline list includes their routes.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- Look up the current Next.js guidance before Part B: `npx ctx7@latest docs /vercel/next.js "progressive web app manifest.ts service worker registration headers"`.
- **Do not copy the `X-Frame-Options: DENY` header from that guide.** Every study guide is shown in a same-origin iframe and would go blank. Add headers for `/sw.js` only.
- The service worker is registered only in a production build (`process.env.NODE_ENV === 'production'`). In development the registration component unregisters any worker it finds, so `next dev` never serves stale files.
- Never cache `/api/*`, non-GET requests, or `/my-prep` (the encrypted page must always come from the network).
- `/vendor/pglite-*` (about 10 MB, from P3) is cached only after the reader has used the SQL runner, never as part of “Save for offline”.
- Honest copy for Listen, shown the first time the player opens: `Reading aloud uses your device’s voice. It plays while this tab is open and the screen is on.`
- Speech is split into chunks of at most 220 characters, each its own utterance: some browsers stop a long utterance after about 15 seconds. Pause is implemented as cancel-and-remember, resume re-speaks the current chunk: `speechSynthesis.pause()` is unreliable on Android.

## Review Focus

1. **The browser has no speech synthesis or no English voice.** No Listen button; nothing else changes. Pinned in Task 2.
2. **Code, tables and diagrams read aloud as noise.** They are replaced by a short spoken marker (`Code example on the card.`), never read character by character. Pinned in Task 1.
3. **A new deploy while an old service worker is installed.** The new worker takes over on the next load and deletes old caches; a page from the new build must never be paired with chunks from the old one while online. Pinned in Task 4.
4. **Offline, a page that was never saved.** The reader gets a plain page saying so, with a link home, not the browser’s error page and not a blank frame. Pinned in Task 4.
5. **The service worker changes behaviour for readers who never asked for offline** (stale guide after an update). Guide files are served stale-while-revalidate and the worker’s version changes whenever any guide file changes, so the second load after a deploy is current. Pinned in Task 4.

---

## Part A: Listen

### Task 1: Turning a card into speech (pure logic)

**Files:**
- Modify: `scripts/study/engine.js` (block `// ---- listen:start` … `// ---- listen:end`, before `function enhance`)
- Create: `tests/unit/listen.test.mjs`

**Interfaces (inside the block, loadable with `loadBlock('listen')`):**
- `speakText(html: string): string` — removes the `<!--x:extras-->` block; replaces each `<pre>…</pre>` with ` Code example on the card. `, each `<svg>…</svg>` with ` Diagram on the card. `, each `<table>…</table>` with ` Table on the card. `; drops remaining tags; decodes `&amp; &lt; &gt; &nbsp; &mdash; &rarr;` and numeric entities; collapses whitespace; collapses a repeated marker (two code blocks in a row) into one.
- `speakChunks(text: string, max = 220): string[]` — splits on sentence ends (`. ! ?` followed by a space), then packs sentences into chunks no longer than `max`; a single sentence longer than `max` is split at the last comma or space before the limit.
- `speakable(q: string, a: string, full: boolean): string[]` — `['Question. ' + speakText(q), ...answer]` where the answer is the chunks of the `data-depth="60"` script when the card has one and `full` is false, otherwise of the whole answer. Text inside `<details class="reveal">` is included, after the marker sentence `The answer.`

- [ ] **Step 1: Write the failing tests** `tests/unit/listen.test.mjs`:
  - `speakText('<p>Use <code>let</code> &amp; <strong>const</strong>.</p><pre>let a = 1;</pre><pre>b</pre><p>Done.</p>')` is `Use let & const. Code example on the card. Done.`;
  - a `<table>` and an `<svg>` become their markers; the extras block is absent from the result;
  - `speakChunks` of three 100-character sentences gives three chunks; of four 50-character sentences gives one; every chunk of a 1,000-character comma-separated sentence is at most 220 characters and joining the chunks loses no word;
  - `speakable` with an answer holding a 60-second script returns that script when `full` is false and the long answer when true; the first element starts `Question. `;
  - an answer with a reveal contains the chunk `The answer.` before the revealed text.
- [ ] **Step 2: Run** `npm run test:unit` — FAIL. **Step 3: Implement.** **Step 4: Run** — pass.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add card-to-speech text preparation"`

### Task 2: The player

**Files:**
- Modify: `scripts/study/engine.js` (rest of the `listen` block; started from the end-of-file init), `scripts/study/theme.css`
- Create: `tests/checks/19-listen-offline.mjs`

**Interfaces:**
- When `window.speechSynthesis` and `window.SpeechSynthesisUtterance` exist, the engine adds `<button id="listenBtn" class="fc-start alt" type="button">🔊 Listen</button>` to `.hero-actions`, and a per-section `Listen` button to the toolbar (`data-act="listen"`).
- Pressing either starts a queue of the cards now shown in `#content` (the same list as `deckFromView()`), from the first, or from the focused card if there is one, and shows `<div id="listenBar" role="region" aria-label="Listen">` fixed to the bottom with: `Previous`, `Play`/`Pause`, `Next`, a speed `<select aria-label="Speed">` (0.8×, 1×, 1.2×, 1.4×, 1.6×), a voice `<select aria-label="Voice">` (voices whose `lang` starts `en`; hidden when there are none or one), a checkbox `Full answers`, the label `3 / 12 · <question>`, and `Close`.
- While a card is being read it is opened, scrolled into view and has class `listening`. After the question there is a 1.5-second pause, then the answer. After the last chunk the player moves to the next card; after the last card it stops and says `End of section.`
- Settings in `study-listen-v1`: `{ rate: number, voiceURI: string, full: boolean }`.
- While playing, the block holds a screen wake lock when `navigator.wakeLock` exists (released on pause, close and page hide; taken again when the page is visible and still playing).
- Opening flashcards, changing section or searching stops playback and removes the bar.
- Keyboard: the bar’s buttons are ordinary buttons; `Escape` closes the bar when focus is inside it.

- [ ] **Step 1: Write the failing check** (Part A of `19-listen-offline.mjs`). Create a context with an init script that replaces `speechSynthesis` and `SpeechSynthesisUtterance` in every frame with a fake: `speak(u)` pushes `u.text` to `window.__spoken` and calls `u.onend` after 5 ms; `cancel()` clears pending callbacks; `getVoices()` returns two English voices. Then on `${base}/whiteboard`, section `wb2`:
  1. `#listenBtn` exists; pressing it shows `#listenBar` and, within 3 seconds, `__spoken[0]` starts `Question. ` and contains the first card’s title;
  2. no spoken chunk is longer than 220 characters and none contains `<` or `viewBox`;
  3. the first card has class `listening` and is open; after the queue advances the label starts `2 / `;
  4. `Pause` stops new chunks arriving for 500 ms; `Play` resumes with the same chunk;
  5. choosing speed `1.4×` and reloading keeps `1.4×` selected;
  6. `Close` removes the bar and stops speech; starting flashcards while playing also removes it;
  7. in a second context whose init script deletes `speechSynthesis`, there is no `#listenBtn` and no `pageerror`.
- [ ] **Step 2: Run** `npm run build && npm test` — the Part A assertions FAIL.
- [ ] **Step 3: Implement**, then `npm run study:upgrade && npm run study:build`.
- [ ] **Step 4: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`. Then listen to one real section in a desktop browser with sound on: check the pause after the question and that code is skipped.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add Listen mode to every guide"`

---

## Part B: Offline and install

### Task 3: Manifest and icons

**Files:**
- Create: `scripts/make-icons.mjs`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/maskable-512.png`, `app/manifest.ts`

**Interfaces:**
- `node scripts/make-icons.mjs` — with Playwright, draws `public/icon.png` (a 1024×1024 image; despite its name the file is a JPEG) onto canvases and writes the three PNGs: two plain, and a maskable one with the image at 80% size centred on the page background colour.
- `app/manifest.ts` — `name: 'DevSpar'`, `short_name: 'DevSpar'`, `description` the same sentence as `app/layout.tsx`’s metadata, `start_url: '/'`, `display: 'standalone'`, `background_color` and `theme_color` the light-theme page background from `app/globals.css` (read the value; do not invent one), and the three icons (`purpose: 'maskable'` on the third).

- [ ] **Step 1:** Write and run the icon script; open the three files and look at them.
- [ ] **Step 2:** Add the manifest. `npm run build`, then `curl -s http://localhost:3000/manifest.webmanifest` under `npm start` shows the JSON with three icons.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "Add a web app manifest and icons"`

### Task 4: The service worker

**Files:**
- Create: `scripts/sw-template.js`, `scripts/build-sw.mjs`, `app/components/OfflineSetup.tsx`, `app/offline/page.tsx`
- Modify: `package.json` (`study:build` runs `build-sw.mjs` last), `.gitignore` (`/public/sw.js`), `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `tests/checks/19-listen-offline.mjs`

**Interfaces:**
- `node scripts/build-sw.mjs` writes `public/sw.js` from the template, replacing `__PRECACHE__` with the list `/study/<slug>.html` for every emitted guide, `/study/engine.js`, `/search-index.json`, the three icons and the small files under `/study/sqlrun/` when present; `__ROUTES__` with `/`, `/offline`, every guide route and every `ready` tool route; and `__VERSION__` with the first 10 hex characters of a SHA-1 over the precached files’ contents. Prints `sw: N precached files, M routes, version <v>`.
- The worker’s behaviour, by request:

| Request | Strategy |
|---------|----------|
| not GET, or `/api/…`, or `/my-prep…` | not handled (network) |
| `/_next/static/…` | cache first (the names are content-hashed) |
| a precached URL, or anything under `/study/` | stale-while-revalidate |
| `/vendor/…` | cache first, cached on first use |
| `fonts.googleapis.com`, `fonts.gstatic.com` | stale-while-revalidate (opaque responses allowed) |
| a page load (`request.mode === 'navigate'`) | network first with a 4-second timeout, then the cached page (ignoring the query string), then the cached `/offline` page |
| any other same-origin GET | network first, then cache |

- Caches are named `devspar-<version>-static` and `devspar-<version>-pages`; `activate` deletes every `devspar-` cache of another version; the worker calls `skipWaiting()` and `clients.claim()`.
- Message `{ type: 'warm' }` from a page: the worker fetches every route in `__ROUTES__`, stores each response, extracts every `/_next/static/…` URL from the HTML and stores those, fetches the font stylesheet linked from one guide file and stores it and the font files it names, and posts `{ type: 'warm-progress', done, total }` after each route and `{ type: 'warm-done', failed: string[] }` at the end.
- `OfflineSetup` (client component, rendered once in `app/layout.tsx`): registers `/sw.js` with `{ scope: '/', updateViaCache: 'none' }` in production; in development unregisters. It exports nothing else.
- Homepage footer row: `Save for offline` (sends `warm`; shows `Saving… 12 of 31`, then `Saved for offline on <date>` from `study-offline-v1`, or `Saved, except N pages` on failures) and, when the browser has fired `beforeinstallprompt`, `Install DevSpar`. Both are hidden when service workers are unsupported.
- `app/offline/page.tsx`: `You are offline, and this page has not been saved yet.` with a link `Go to the home page`.
- `next.config.ts`: for `/sw.js`, `Content-Type: application/javascript; charset=utf-8` and `Cache-Control: no-cache, no-store, must-revalidate`.

- [ ] **Step 1: Write the failing check** (Part B of `19-listen-offline.mjs`), in its own `browser.newContext()`:
  1. open `${base}/`; `navigator.serviceWorker.ready` resolves and `navigator.serviceWorker.controller` is set after one reload;
  2. press `Save for offline`; wait for `Saved for offline`;
  3. `context.setOffline(true)`; `page.goto('${base}/sql')` → the guide frame shows `#navList .nav-item` entries; the first card opens;
  4. still offline, go to `${base}/` and click the `Node.js` guide card → the URL ends `/nodejs` and its guide frame loads;
  5. still offline, `${base}/definitely-not-a-page-xyz` shows `You are offline, and this page has not been saved yet.`, never a browser error page;
  6. still offline, the homepage search box returns a result for `closure` (the index is cached);
  7. `context.setOffline(false)`; a request for `${base}/api/mock-interview` with an empty POST still returns 400 from the server (not intercepted);
  8. `caches.keys()` has exactly two `devspar-` caches, both with the version printed by `build-sw.mjs`.
- [ ] **Step 2: Run** `npm run build && npm test` — Part B FAILS (no worker).
- [ ] **Step 3: Implement** the template, the generator, the component, the offline page, the homepage row and the header. If assertion 4 fails because an in-app link click offline leaves the reader on the same page (the client-side route fetch has no cached answer), add to `OfflineSetup` a capture-phase click listener that, while `navigator.onLine` is false, turns a plain left-click on a same-origin `<a>` into `location.assign(href)`, so the worker’s page-load strategy answers it.
- [ ] **Step 4: Run the whole suite twice in a row** — `npm run build && npm test`, then `npm test` again: both end `ALL CHECKS PASSED`. The second run proves a worker left by one check does not disturb another (each check uses its own context; if any check shares one, give it its own).
- [ ] **Step 5: Prove the update path by hand.** With `npm start` running and the site open in a normal browser: note the cache names; change one word in a content module, rebuild (`npm run build`), restart, reload twice; the old caches are gone and the new word is shown. Write what you saw in the commit body.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "Add offline support and install"`

### Task 5: Document

- [ ] **Step 1:** `scripts/study/README.md`, two sections: “Listen mode” (what is read, the markers, the chunk limit, the stub used in the check) and “Offline” (what is precached, the strategies table, how the version is derived, that a new guide or tool route is picked up by `build-sw.mjs` automatically, how to unregister the worker when debugging: DevTools → Application → Service workers → Unregister). Root `README.md`: one line each.
- [ ] **Step 2: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 3: Commit** — `git commit -am "Document Listen mode and offline support"`. Tell the owner: `/my-prep` needs their own refresh to get the new engine, and it is never available offline by design.
