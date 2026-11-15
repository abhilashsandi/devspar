# P0: Practice Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pieces the practice features share: a unit-test runner, a card bank that pages can query, a way to open any set of cards as a flashcard deck from a link, a way to embed one card in a page, and a place on the homepage for the new tools.

**Architecture:** Guides are static HTML documents driven by one shared script (`scripts/study/engine.js`) and shown in an iframe by `app/components/StaticPrepClient.tsx`. Cross-guide pages cannot reach inside a guide, so this plan gives them three seams: `public/search-index.json` gains a core flag and a word count per card (read through `app/lib/bank.mjs`), the engine accepts a `start-deck` message and a `?card=` solo mode, and `app/lib/tools.mjs` lists the tool pages so the homepage, sitemap and accessibility check stay in step.

**Tech Stack:** Node 26 (`node --test`, `node:vm`), Next.js 16 App Router, React 19, Playwright (existing checks).

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md`

## Global Constraints

The spec's “Rules for every plan” section applies in full. In addition:

- `public/search-index.json` items are read **by position** in `scripts/study/engine.js` (`fillGlobal`) and `app/components/SiteSearch.tsx`. Positions 0 to 5 must not change; new fields are appended.
- `app/page.tsx` already has `fnv`, `readProgress` and `readWeak`. Keep their behaviour; only replace the local `fnv` with the shared import.
- No tool is marked `ready` in this plan. The homepage must look exactly as it does today when no tool is ready.

## Review Focus

1. **A guide opened with an unknown or stale `?card=` or `#deck=` key** (content was regenerated, the index moved): the reader should see the guide or a short “This card has moved” line, never a blank frame or a script error. Pinned in Task 3.
2. **The `#deck=` message is posted repeatedly** (StaticPrepClient retries 20 times): the deck must open once and not reset the reader’s place. Pinned in Task 3.
3. **Storage is blocked or holds bad JSON** (private mode, a hand-edited value): `readProgress` returns empty sets and never throws. Pinned in Task 2.
4. **A card title with markup and entities** (`<code>this</code> &amp; bind()`): `titleKey` must give the same key as the engine, or shared progress silently stops matching. Pinned in Task 1.
5. **The embedded card is taller than its frame, or changes height when a diagram is enlarged or a reveal is opened**: the frame must follow. Pinned in Task 3.

---

### Task 1: Unit-test runner and shared title keys

**Files:**
- Create: `app/lib/studyKeys.mjs`, `tests/unit/studyKeys.test.mjs`, `tests/unit/helpers/engine-block.mjs`
- Modify: `package.json` (scripts), `app/page.tsx` (use the shared `fnv`)

**Interfaces:**
- Produces: `titleKey(title: string): string` and `fnv(s: string): string` from `app/lib/studyKeys.mjs`, byte-for-byte the same logic as `titleKey` in `scripts/study/engine.js` and `fnv` in `scripts/study/build-index.mjs`.
- Produces: `loadBlock(name: string, globals?: object): object` from `tests/unit/helpers/engine-block.mjs`. It reads `scripts/study/engine.js`, takes the text between `// ---- <name>:start` and `// ---- <name>:end`, runs it with `node:vm` in a context made from `globals`, and returns the context so tests can call the block’s functions (only `function` declarations become properties of the context; top-level `const` and `let` do not). It throws `engine block not found: <name>` when a marker is missing.
- Produces: `npm run test:unit`.

- [ ] **Step 1: Write the failing test** `tests/unit/studyKeys.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleKey, fnv } from '../../app/lib/studyKeys.mjs';
import { loadBlock } from './helpers/engine-block.mjs';

test('titleKey strips tags, entities and punctuation', () => {
  assert.equal(titleKey('What is a closure?'), 'what is a closure');
  assert.equal(titleKey('Tell me about <code>this</code> &amp; bind()'), 'tell me about this bind');
});
test('fnv matches the values the index builder writes', () => {
  assert.equal(fnv('what is a closure'), 'l1zofj');
  assert.equal(fnv('tell me about this bind'), '8zil8y');
});
test('loadBlock runs a marked block of the engine', () => {
  const ctx = loadBlock('sketch', { document: {}, localStorage: { getItem: () => null } });
  assert.equal(typeof ctx.sketchIsCode, 'function');
  assert.equal(ctx.sketchIsCode('SELECT id FROM orders WHERE total > 5'), true);
  assert.throws(() => loadBlock('no-such-block'), /engine block not found/);
});
```

- [ ] **Step 2: Add the script and see it fail**

In `package.json` scripts add `"test:unit": "node --test \"tests/unit/**/*.test.mjs\""`.
Run: `npm run test:unit` — Expected: FAIL, cannot find `app/lib/studyKeys.mjs`.

- [ ] **Step 3: Implement** `app/lib/studyKeys.mjs` (copy the two one-line functions from the engine and the index builder; JSDoc types) and `tests/unit/helpers/engine-block.mjs` as specified above. If the `sketch` block needs more globals to load, add inert stubs in the test, not in the engine.

- [ ] **Step 4: Use the shared `fnv` in `app/page.tsx`** (`import { fnv } from './lib/studyKeys.mjs'`; delete the local copy).

- [ ] **Step 5: Verify** — `npm run test:unit` prints `# pass 3`, `# fail 0`. `npx tsc --noEmit` prints nothing.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "Add a unit-test runner and shared title keys"`

---

### Task 2: The card bank

**Files:**
- Modify: `scripts/study/build-index.mjs`
- Create: `app/lib/bank.mjs`, `tests/unit/bank.test.mjs`

**Interfaces:**
- Produces (index): every item becomes `[slug, sectionId, index, sectionTitle, question, summary, flags, words]`. `flags` bit 1 (`1`) means ★ core: the card’s `sectionId:index` appears as a `data-go="…"` value inside that guide’s `review` section (the same rule as `CORE` in the engine). `words` is the word count of the stripped question plus answer.
- Produces (`app/lib/bank.mjs`):
  - `/** @typedef {{slug:string, sec:string, idx:number, secTitle:string, q:string, summary:string, core:boolean, words:number, tkey:string, kind:Kind, guide:string, key:string, href:string}} Card` where `key` is `sec:idx` and `href` is `/slug#sec:idx`.
  - `toCards(index: {pages: Record<string,string>, items: any[][]}): Card[]`
  - `kindOf(slug: string, sec: string, q: string): 'behavioural'|'whiteboard'|'bug'|'sql-puzzle'|'quiz'|'diagram'|'concept'` — rules, first match wins: `q` starts `Quiz:` → `quiz`; starts `Diagram:` → `diagram`; starts `Puzzle:` and slug `sql` → `sql-puzzle`; starts `Bug:` and slug `bug-clinic` → `bug`; slug `behavioural` and sec in `bh2`…`bh8` → `behavioural`; slug `whiteboard` and sec in `wb2`…`wb7` → `whiteboard`; otherwise `concept`.
  - `loadBank(fetchImpl = fetch): Promise<Card[]>` — fetches `/search-index.json`, caches the promise in the module.
  - `readProgress(storage): {reviewed: Set<string>, weak: Map<string, number>}` — from `study-reviewed-titles-v1` and `study-weak-titles-v1`; empty on any error.
  - `addWeak(storage, tkeys: string[]): void` — adds 1 to each key’s count in `study-weak-titles-v1`, the same shape the engine’s `markWeak` writes.
  - `deckHref(slug: string, cards: Card[]): string` — `/slug#deck=sec:i,sec:j`, at most 40 keys.
  - `mulberry32(seed: number): () => number`, `seedFrom(text: string): number`, `shuffle<T>(items: T[], rng: () => number): T[]` (returns a new array).

- [ ] **Step 1: Write the failing tests** `tests/unit/bank.test.mjs`: build a fixture index of six items (one per kind rule above plus one `concept` with `flags: 1, words: 400`), then assert: `toCards` returns six cards with the right `kind`, `core`, `key`, `href`, `guide` and `tkey === titleKey(q)`; an item with only six fields (an old index) gives `core: false, words: 0`; `readProgress` with a storage whose `getItem` throws returns two empty collections, and with `{"a b":1}` / `{"c d":2}` returns `reviewed.has('a b')` and `weak.get('c d') === 2`; `addWeak` on `{"c d":2}` with `['c d','e f']` stores `{"c d":3,"e f":1}`; `deckHref('sql', cards)` for 45 cards has exactly 40 keys; `mulberry32(42)` gives the same first three numbers on two instances and `shuffle` with it keeps every element.

- [ ] **Step 2: Run** `npm run test:unit` — Expected: FAIL, `app/lib/bank.mjs` not found.

- [ ] **Step 3: Extend `build-index.mjs`**: compute the core set per guide from its `review` section, append `flags` and `words` to each pushed item. Then `npm run study:index`.

- [ ] **Step 4: Implement `app/lib/bank.mjs`.**

- [ ] **Step 5: Verify** — `npm run test:unit` passes. `node -e "const j=require('./public/search-index.json');const n=j.items.filter(i=>i[0]==='interview-prep'&&(i[6]&1)).length;console.log(n, j.items[0].length)"` prints `60 8`.

- [ ] **Step 6: Commit** — `git commit -am "Add core flags and word counts to the search index, and a card bank module"` (add the new files).

---

### Task 3: Open a deck from a link, and embed one card

**Files:**
- Modify: `scripts/study/engine.js` (message handler near line 508; new block `// ---- solo:start` … `// ---- solo:end` placed just before the final `renderNav(); renderContent(); updateProgress();`), `scripts/study/theme.css`, `app/components/StaticPrepClient.tsx`
- Create: `app/components/CardEmbed.tsx`, `tests/checks/10-foundations.mjs`

**Interfaces:**
- Produces (engine message): `{ type: 'start-deck', keys: string[], title?: string }` opens the flashcard dialog with the cards named by `keys` (`sec:idx`), in that order, titled `title` or `Your deck`. Unknown keys are dropped. If no key resolves, nothing opens. If a deck is already open, the message is ignored.
- Produces (link): `/<slug>#deck=sec:i,sec:j` — `StaticPrepClient` turns it into the message above, with the same retry loop it uses for `#weak`.
- Produces (solo mode): `/study/<slug>.html?card=sec:idx` renders only that card, opened, with class `solo` on `<html>`; the sidebar, hero, toolbar, section head, pager and back button are hidden and the page has no outer padding. An unknown key renders `<p class="empty">This card has moved.</p>`. The document posts `{ type: 'solo-height', card: 'sec:idx', height: number }` to its parent whenever the height of `#content` changes (`ResizeObserver`).
- Produces: `CardEmbed({ slug, sec, idx, title }: { slug: string; sec: string; idx: number; title: string })` — an iframe on the solo URL, `title` as its accessible name, height following `solo-height` messages whose `source` is this iframe, light/dark synced the way `StaticPrepClient` does it (`data-theme` on the inner `documentElement` once loaded).

- [ ] **Step 1: Write the failing check** `tests/checks/10-foundations.mjs` (copy the frame helpers from `tests/checks/09-diagrams.mjs`). Assertions:
  - `${base}/study/sql.html?card=sq4:1`: exactly one `.qcard`, it has class `open`, `.sidebar` and `.hero` are not visible, the card title equals `INDEX` entry `sq4:1`’s title text.
  - `${base}/study/sql.html?card=nope:99`: text `This card has moved.` is visible and no `pageerror` fired.
  - `${base}/sql#deck=sq1:0,sq1:1,zz:9`: inside the frame `#fc` becomes visible, `.fc-title` is `Your deck`, `.fc-count` starts `1 / 2`. Click `Reveal answer`, then wait 3.5 seconds (the retry loop is still posting) and assert the answer is still revealed and the count still starts `1 / 2`.
  - Homepage `${base}/`: there is no heading `Practice tools`.

- [ ] **Step 2: Run** `npm run build && npm test` — Expected: the four `10-foundations` assertions FAIL.

- [ ] **Step 3: Implement the engine changes**, then the CSS (`html.solo …` rules), then `npm run study:upgrade && npm run study:build`.

- [ ] **Step 4: Implement the `#deck=` branch in `StaticPrepClient.tsx` and create `CardEmbed.tsx`.**

- [ ] **Step 5: Verify** — `npm run build && npm test` ends `ALL CHECKS PASSED`.

- [ ] **Step 6: Commit** — `git commit -am "Open any set of cards as a deck from a link, and embed a single card"` (add the new files).

---

### Task 4: A home for the tools

**Files:**
- Create: `app/lib/tools.mjs`, `app/components/ToolShell.tsx`
- Modify: `app/page.tsx`, `app/sitemap.ts`, `tests/checks/07-accessibility.mjs`, `tests/checks/10-foundations.mjs`, `scripts/study/README.md`

**Interfaces:**
- Produces: `TOOLS` from `app/lib/tools.mjs`, exactly these five entries in this order, all `ready: false`:

```js
export const TOOLS = [
  { id: 'mock', href: '/mock', title: 'Mock round', icon: 'timer', ready: false, desc: 'A timed 45-minute interview drawn from the guides: behavioural, concepts, whiteboard, a bug and a SQL puzzle, with a scorecard.' },
  { id: 'plan', href: '/plan', title: 'Interview plan', icon: 'calendar', ready: false, desc: 'Enter your interview date and role to get a daily plan built from core, weak and unreviewed cards.' },
  { id: 'match', href: '/match', title: 'Job match', icon: 'target', ready: false, desc: 'Paste a job posting to get a deck for it and a list of gaps. The posting stays in your browser.' },
  { id: 'drills', href: '/drills', title: 'Estimation drills', icon: 'calculator', ready: false, desc: 'Capacity and latency sums with new numbers every time, so you practise the arithmetic.' },
  { id: 'stories', href: '/stories', title: 'Story bank', icon: 'notebook', ready: false, desc: 'Write your STAR stories, check their shape and see which competencies they cover. Stays in your browser.' },
];
```

- Produces: `ToolShell({ title, lede, children }: { title: string; lede: string; children: React.ReactNode })` — the page frame every tool uses: a top bar with a `← DevSpar` link to `/` and the existing `ThemeToggle`, an `<h1 className="font-display …">`, the lede, then `<main className="mx-auto max-w-4xl px-5 py-10">`.
- Later plans flip one `ready` flag each and create `app/<id>/page.tsx`.

- [ ] **Step 1: Extend the check.** In `10-foundations.mjs` import `TOOLS` (`pathToFileURL` of `app/lib/tools.mjs`) and replace the homepage assertion with: when no tool is ready there is no `Practice tools` heading; otherwise the heading exists and the section links are exactly the ready tools’ `href`s, in order.

- [ ] **Step 2: Homepage.** In `app/page.tsx` add a section `id="tools"` between the guides section and “Interactive labs”, same markup pattern as the labs grid (`cardClass`, heading `Practice tools`, blurb `Rehearse the interview itself: against the clock, out loud, with real numbers.`), mapping `icon` names to `lucide-react` icons (`Timer`, `CalendarDays`, `Target`, `Calculator`, `NotebookPen`). Render the whole section only when `TOOLS.some((t) => t.ready)`.

- [ ] **Step 3: Sitemap and accessibility.** `app/sitemap.ts` adds the ready tools’ routes. `tests/checks/07-accessibility.mjs` runs its existing axe pass over each ready tool’s `href` as well (a loop over `TOOLS.filter((t) => t.ready)`).

- [ ] **Step 4: Document.** Add a section “Practice tools and shared seams” to `scripts/study/README.md`: the index fields, `bank.mjs`, the `#deck=` link, the solo card URL and `CardEmbed`, `tools.mjs`, the engine block markers and `loadBlock`, `npm run test:unit`.

- [ ] **Step 5: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`; the homepage is visually unchanged (compare a screenshot of `/` before and after at 1280px).

- [ ] **Step 6: Commit** — `git commit -am "Add the tools registry, page frame and homepage section"` (add the new files).
