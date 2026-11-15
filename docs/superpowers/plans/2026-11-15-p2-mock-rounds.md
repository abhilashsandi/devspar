# P2: Mock Rounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/mock`: a timed 45-minute interview drawn from the guides (one behavioural question, four concept questions, one whiteboard explanation, one bug, one SQL puzzle, then your questions for them), self-rated against a rubric, ending in a scorecard that feeds the weak-cards deck.

**Architecture:** A pure module (`app/lib/mock.mjs`) builds a round from the card bank with a seeded random generator and scores it; a client component runs the clock and the flow; the model answer for each question is the real card, shown with `CardEmbed` from P0 so diagrams, code colours, short answers and follow-ups all appear as they do in the guide. History lives in `localStorage`.

**Tech Stack:** Next.js 16 App Router, React 19, `app/lib/bank.mjs`, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (feature 3). Requires P0.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- The round is fixed at 45 minutes and eight questions. Segments, in order, with exact values:

| id | label | minutes | questions | pool |
|----|-------|---------|-----------|------|
| `behavioural` | Behavioural | 8 | 1 | cards of kind `behavioural` |
| `concepts` | Concepts | 12 | 4 | `interview-prep` cards with `core: true`, kind `concept`, section not `behavioral`, `coding` or `review` |
| `whiteboard` | Whiteboard | 8 | 1 | kind `whiteboard` |
| `bug` | Find the bug | 7 | 1 | kind `bug` |
| `sql` | SQL puzzle | 8 | 1 | kind `sql-puzzle` |
| `wrap` | Your questions for them | 2 | 0 | none |

- Ratings: `0 Missed`, `1 Partial`, `2 Solid`, `3 Strong`. A rating of 0 or 1 adds the card to the weak cards (`addWeak`).
- Verdict bands on the total: 80 and over `Ready`, 60 to 79 `Close`, under 60 `Keep practising`.
- The clock never forces the reader on. At zero the segment clock turns to the warning colour and counts overtime as `+m:ss`. Elapsed time is computed from timestamps (`performance.now()`), never by counting ticks, so a background tab stays correct.
- Read `?seed=` from `window.location.search` inside an effect. Do not use `useSearchParams` (it needs a Suspense boundary and buys nothing here).
- Use only colour tokens that already exist in `app/globals.css`.

## Review Focus

1. **The reader reloads or closes the tab mid-round.** The round in progress is kept in `sessionStorage` (`mock-current`) and offered back as `Resume round` on the setup screen. Pinned in Task 2.
2. **A pool is smaller than the segment needs after removing recently used cards.** `buildRound` falls back to the full pool and never returns a short segment or a duplicate. Pinned in Task 1.
3. **The index is unavailable (offline, fetch fails).** The page says `The question bank could not load. Check your connection and try again.` with a retry button; no spinner forever. Pinned in Task 2.
4. **History holds bad JSON or an old shape.** It is treated as empty, and saving a new round still works. Pinned in Task 1.
5. **The reader rates without revealing, or reveals a card that has moved.** Rating without revealing is allowed; the embed shows `This card has moved.` (P0) and the round carries on. Pinned in Task 2.

---

### Task 1: Build and score a round (pure logic)

**Files:**
- Create: `app/lib/mock.mjs`, `tests/unit/mock.test.mjs`

**Interfaces:**
- Consumes: `Card`, `mulberry32`, `shuffle` from `app/lib/bank.mjs`.
- Produces:
  - `SEGMENTS: {id: string, label: string, minutes: number, count: number}[]` — the table above.
  - `RATINGS: {value: 0|1|2|3, label: string}[]`
  - `poolFor(segmentId: string, cards: Card[]): Card[]`
  - `buildRound(cards: Card[], opts: {seed: number, avoid?: Set<string>}): {seed: number, segments: (typeof SEGMENTS[number] & {cards: Card[]})[]}` — per segment: pool minus `avoid` (by `tkey`); if that leaves fewer than `count`, use the whole pool; `shuffle` with one generator created from `seed`, consumed in segment order; `concepts` takes the first card of each not-yet-used section until it has four, then fills from the rest.
  - `scoreRound(segments: {id: string, minutes: number, seconds: number, ratings: number[]}[]): {total: number, verdict: 'Ready'|'Close'|'Keep practising', bySegment: {id: string, score: number|null, overSeconds: number}[], weak: number}` — segment score `Math.round(mean(ratings) / 3 * 100)` or `null` without ratings; `total` is `Math.round(100 × Σ(minutes × mean(ratings) / 3) / Σ minutes)` over the segments that have ratings (from the unrounded means); `overSeconds = Math.max(0, seconds - minutes * 60)`; `weak` counts ratings of 0 or 1.
  - `readHistory(storage): Entry[]`, `saveRound(storage, entry: Entry): Entry[]` (newest first, at most 20), `recentKeys(history: Entry[], rounds = 3): Set<string>`, with `Entry = {at: string, seed: number, total: number, segments: {id: string, score: number|null, seconds: number}[], cards: {tkey: string, href: string, q: string, rating: number}[]}`; storage key `study-mock-history-v1`.

- [ ] **Step 1: Write the failing tests** `tests/unit/mock.test.mjs` with a fixture bank made by a helper (`mk(kind, n, extra)`): 6 behavioural, 20 core concepts across 5 sections, 5 whiteboard, 5 bug, 3 sql-puzzle. Assert:
  - `SEGMENTS` minutes sum to 45 and counts sum to 8;
  - `buildRound(bank, {seed: 7})` twice gives identical card keys; seed 8 gives a different list;
  - every segment has exactly `count` cards, no `tkey` appears twice in a round, the four concept cards come from four different sections;
  - with `avoid` holding all three SQL puzzles the `sql` segment still has one card; with `avoid` holding two of them it picks the third;
  - `scoreRound` for ratings `[3]`, `[3,3,0,0]`, `[2]`, `[1]`, `[0]` and `[]` (wrap) with all `seconds` at budget gives `bySegment` scores `100, 50, 67, 33, 0, null`, `total` `50` (`100 × (8·1 + 12·0.5 + 8·⅔ + 7·⅓ + 8·0) / 43 = 50.4`), verdict `Keep practising`, `weak` `4`; a segment with `seconds: 500` and `minutes: 8` has `overSeconds` `20`; ratings of all 3 give `total` `100` and `Ready`;
  - `readHistory` on a storage returning `'{bad'` gives `[]`; `saveRound` keeps 20 entries when given 21; `recentKeys` unions the `tkey`s of the newest three entries.

- [ ] **Step 2: Run** `npm run test:unit` — Expected: FAIL, module not found.
- [ ] **Step 3: Implement `app/lib/mock.mjs`.**
- [ ] **Step 4: Run** `npm run test:unit` — Expected: all pass.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add mock-round building and scoring"`

---

### Task 2: The page

**Files:**
- Create: `app/mock/page.tsx` (metadata + `<MockClient />`), `app/mock/MockClient.tsx`, `tests/checks/12-mock.mjs`
- Modify: `app/lib/tools.mjs` (`mock` → `ready: true`)

**Interfaces:**
- Consumes: Task 1; `loadBank`, `readProgress`, `addWeak`, `seedFrom` from `bank.mjs`; `ToolShell`, `CardEmbed` from P0.
- Produces: route `/mock`; `/mock?seed=<text>` reproduces a round exactly (the avoid list is ignored when a seed is given).

Screens, with the exact copy:

1. **Setup.** Title `Mock round`. Lede `Forty-five minutes, eight questions, no notes. Answer out loud, then rate yourself honestly.` The six segments listed with minutes. Buttons `Start round` and, when `sessionStorage['mock-current']` holds a round, `Resume round`. Under them the last five totals from history, newest first, or `No rounds yet.`
2. **Question.** Header: segment label, `Question n of 8`, the segment clock (`m:ss` remaining, then `+m:ss` in the warning colour), a whole-round clock, and `Pause` / `Resume`. Body: the question text only. Under it: `Reveal model answer` (shows `CardEmbed` for the card; the button becomes `Hide model answer`), a three-line rubric (`Main point first`, `A concrete example`, `A trade-off or a limit`), the four rating buttons as a radio group labelled `How did that go?`, and `Next question` (disabled until a rating is chosen; `Finish segment` on a segment’s last question).
3. **Wrap.** `Ask your two questions. Choose them now and say them aloud.` with a link `Questions to ask` to `/interview-prep#behavioral`, the two-minute clock, and `Finish round`.
4. **Scorecard.** The total out of 100 with its verdict; a row per segment (score bar, time used against budget, `+m:ss over` when over); the eight questions with their rating, each linking to its card; `N cards added to your weak cards` when N > 0; buttons `New round` and `Same round again` (links to `/mock?seed=<seed>`).

- [ ] **Step 1: Write the failing check** `tests/checks/12-mock.mjs`. In Node, import `toCards` and `buildRound` and build the expected round for `seedFrom('check')` from `public/search-index.json`. In the browser:
  - `${base}/mock?seed=check` → click `Start round` → the question text equals the expected behavioural card’s title, and `Question 1 of 8` is shown;
  - `Next question` is disabled; click `Reveal model answer` → an iframe whose `src` contains `/study/behavioural.html?card=` is attached and, inside it, exactly one `.qcard.open`;
  - reload the page → `Resume round` is offered and returns to question 1;
  - go through all eight questions rating `Missed` on odd and `Strong` on even questions, then `Finish round`;
  - the scorecard shows a number from 0 to 100 and one of the three verdicts, lists eight questions, and says `4 cards added to your weak cards`;
  - `localStorage['study-mock-history-v1']` parses to one entry with eight cards; `study-weak-titles-v1` has four keys;
  - block `**/search-index.json` in a fresh page → the bank-failure message and a `Try again` button are shown;
  - no `pageerror` during any of it.

- [ ] **Step 2: Run** `npm run build && npm test` — Expected: `12-mock` FAILS (404).
- [ ] **Step 3: Implement the page.** Keep the state machine in one `useReducer` (`setup | question | wrap | done`); persist the in-progress state to `sessionStorage` on every change and clear it on finish.
- [ ] **Step 4: Verify** — `npm run build && npm test` ends `ALL CHECKS PASSED` (the accessibility check now includes `/mock`). Look at all four screens at 375px and 1280px in both themes.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the mock round page"`

---

### Task 3: Document

- [ ] **Step 1:** Add `/mock` to the feature list in the root `README.md` and a short “Mock rounds” note to `scripts/study/README.md` (pools depend on `kindOf`; a new guide that should feed a segment needs a rule there).
- [ ] **Step 2: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 3: Commit** — `git commit -am "Document mock rounds"`
