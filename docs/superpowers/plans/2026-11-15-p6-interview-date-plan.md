# P6: Interview-date Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/plan`: the reader enters an interview date, a role and the minutes they have each day, and gets a day-by-day plan built from their weak cards, the unreviewed core cards and the rest, plus a “night before” list and a “30 minutes before” warm-up.

**Architecture:** A pure function builds the plan from the card bank and the reader’s live progress, so it is recomputed on every visit and corrects itself when the reader falls behind or gets ahead: today is always the first day. Each block of cards opens in its guide as a flashcard deck through the `#deck=` link from P0. Only the three settings are stored.

**Tech Stack:** Next.js 16, React 19, `app/lib/bank.mjs`, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (feature 7). Requires P0. Uses `/mock` and `/stories` links only when those tools are `ready` in `app/lib/tools.mjs`.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- Dates are plain `YYYY-MM-DD` strings in the reader’s local calendar. All date arithmetic goes through two helpers that use `Date.UTC` on the parts; never `new Date('YYYY-MM-DD')` plus local getters (a time-zone off-by-one).
- Roles and their guides, in study order:

| role id | label | guides |
|---------|-------|--------|
| `frontend` | Frontend | javascript, typescript, react-training, nextjs, tailwind-css, web-platform, testing, performance-optimization, behavioural, whiteboard, bug-clinic |
| `fullstack` | Full-stack | interview-prep, javascript, typescript, react-training, nextjs, nodejs, sql, testing, web-platform, system-design, behavioural, whiteboard, bug-clinic |
| `backend` | Backend | nodejs, sql, system-design, system-design-scale, architecture, aws, performance-optimization, testing, typescript, behavioural, whiteboard |
| `senior` | Senior or lead full-stack | interview-prep, react-training, nextjs, nodejs, sql, system-design, system-design-scale, architecture, aws, performance-optimization, ai-dev, behavioural, whiteboard |

- Night-before crash-course sections (ids in `/crash-course`): frontend `js, ts, react, next, css, web, test, soft`; fullstack `js, ts, react, next, node, db, web, test, sd, soft`; backend `node, db, sd, arch, scale, perf, aws, soft`; senior `js, react, next, node, db, sd, arch, scale, perf, aws, soft`.
- Minutes for a card: `clamp(round(words / 200 × 1.5), 1, 6)`; a card with no word count is 2.
- Minutes-per-day choices: 20, 30, 45, 60, 90. Default role `fullstack`, default 45.
- Cards never planned: section `review`, kinds `quiz` and `diagram`. A card that appears in two guides (same `tkey`) is planned once, in the earlier guide of the role’s list.

## The planning rules

Let `daysLeft` be the whole days from today to the interview date.

1. `daysLeft < 0` → status `past`; `daysLeft = 0` → status `today` (the page shows the warm-up); otherwise `ok` with one day entry for each date from today to the day before the interview.
2. Day kinds: the last entry is `eve`. When `daysLeft ≥ 4` the entry before it is `mock`. When `daysLeft ≥ 10` the entry at index `floor((daysLeft − 2) / 2)` is also `mock`. Every other entry is `study`.
3. The queue, without duplicates: weak cards (any card in the bank whose `tkey` is weak), then unreviewed ★ core cards of the role’s guides, then the role’s other unreviewed cards; inside each group in the role’s guide order, then index order.
4. A `study` day has `minutesPerDay`. It first takes weak cards up to 30% of the budget, then fills from the rest of the queue in order, stopping at the first card that does not fit. It always takes at least one card when the queue is not empty.
5. A `mock` day holds one 45-minute mock round, and, when `minutesPerDay > 45`, weak cards in the minutes left.
6. An `eve` day holds the night-before list and takes nothing from the queue.
7. When the queue runs out early, each later `study` day gets one block `Flashcards: <guide>` (kind `review`), cycling through the role’s guides.
8. What is still queued after the last day is counted in `dropped: { core, other }`; `fits` is true when both are 0.
9. Cards in a day are grouped into blocks by guide, weak blocks first (`Weak cards · <guide>`); each block has its `deckHref`.

## Review Focus

1. **The date is today, yesterday, tomorrow, or a year away.** Each gives a sensible screen: warm-up, a prompt to set a new date, a single `eve` day, a long plan that says how much is left over or how much slack there is. Pinned in Task 1.
2. **The date crosses a month end, a year end or a daylight-saving change.** Day counts and labels stay right. Pinned in Task 1.
3. **Nothing reviewed and thirty minutes a day for three days.** The plan must say plainly that it does not fit and what is dropped (non-core first), not silently truncate. Pinned in Task 1.
4. **Everything already reviewed.** No empty days: review blocks fill them. Pinned in Task 1.
5. **A block with more than 40 cards** (the limit of a `#deck=` link). It is split into `Part 1`, `Part 2`. Pinned in Task 1.

---

### Task 1: The planner (pure logic)

**Files:**
- Create: `app/lib/plan.mjs`, `tests/unit/plan.test.mjs`

**Interfaces:**
- Consumes: `Card`, `deckHref`, `mulberry32`, `seedFrom`, `shuffle` from `bank.mjs`.
- Produces:
  - `ROLES: {id: string, label: string, guides: string[], crash: string[]}[]` — the two tables above.
  - `dayDiff(from: string, to: string): number`, `addDays(date: string, n: number): string`, `minutesFor(card: Card): number`.
  - `buildPlan(input: {today: string, date: string, role: string, minutesPerDay: number, cards: Card[], reviewed: Set<string>, weak: Map<string, number>}): Plan` with
    `/** @typedef {{status: 'ok'|'today'|'past', daysLeft: number, days: Day[], totals: {cards: number, minutes: number, fits: boolean, dropped: {core: number, other: number}}}} Plan */`,
    `/** @typedef {{date: string, kind: 'study'|'mock'|'eve', minutes: number, blocks: Block[]}} Day */`,
    `/** @typedef {{kind: 'weak'|'core'|'other'|'review'|'mock'|'eve', label: string, minutes: number, cards: Card[], href: string}} Block */`.
  - `eveList(role: string, cards: Card[], weak: Map<string, number>): {label: string, href: string | null}[]` — in order: one `Crash course: <section title>` item per crash id (`/crash-course#<id>`; titles from the bank’s `secTitle`); up to three `Weak cards: <guide>` items (`/<slug>#weak`) for the guides with the most weak cards; `Your introduction` (`/behavioural#bh2`); `Questions to ask them` (`/interview-prep#behavioral`); then three items with `href: null`: `Check the time, the link or the address, and who you are meeting.`, `Have water, a charger, a pen and paper ready.`, `Stop studying an hour before bed.`
  - `warmupList(input: {role: string, date: string, cards: Card[], reviewed: Set<string>, weak: Map<string, number>}): {blocks: Block[], prompts: string[]}` — ten cards from the role’s guides, kind `concept`: weak core first, then reviewed core shuffled with `mulberry32(seedFrom(date))`, then other core; grouped into blocks by guide. `prompts`: `Say your introduction once, out loud.`, `Pick the two questions you will ask.`, `One slow breath. Then read each question twice before you answer.`
  - `readSettings(storage): {date: string, role: string, minutesPerDay: number} | null`, `saveSettings(storage, settings)`; key `study-plan-v1`; invalid stored values give `null`.

- [ ] **Step 1: Write the failing tests** `tests/unit/plan.test.mjs` with a fixture bank helper (cards across `interview-prep`, `javascript`, `sql`, `behavioural`, `crash-course`; controllable `core`, `words`, `kind`):
  - `dayDiff('2026-12-30', '2027-01-02') === 3`; `addDays('2027-02-27', 2) === '2027-03-01'`; `dayDiff` across a March daylight-saving date is whole;
  - `minutesFor` for 0, 100, 400 and 2000 words is 2, 1, 3 and 6;
  - status `past` for a date before today, `today` for the same date, and one `eve` day when the date is tomorrow;
  - `daysLeft` 4 gives kinds `study, study, mock, eve`; `daysLeft` 12 has `mock` at indexes 5 and 10 and `eve` at 11;
  - with two weak cards, three unreviewed core and five unreviewed others, day 1’s first block is `weak` and core cards all come before any `other` card across the plan;
  - weak minutes on a study day never exceed 30% of the budget unless a single weak card is all that fits;
  - no `tkey` appears twice in the plan; a card whose `tkey` is in two guides is planned in the role’s earlier guide;
  - `review`, `quiz` and `diagram` cards are never planned;
  - 300 unreviewed cards of 3 minutes, 30 minutes a day, `daysLeft` 3 → `fits: false`, `dropped.other > 0`, and `dropped.core === 0` when the core cards fit;
  - everything reviewed → every study day has exactly one `review` block and `totals.cards === 0`;
  - a 45-card guide block on a 200-minute day is split into `Part 1` (40) and `Part 2` (5), each `href` within the 40-key limit;
  - `eveList('backend', …)` starts with `/crash-course#node` and ends with the three checklist lines; `warmupList` returns ten cards and is the same for the same date and different for another date;
  - `readSettings` returns `null` for bad JSON, an unknown role, a malformed date.
- [ ] **Step 2: Run** `npm run test:unit` — FAIL. **Step 3: Implement.** **Step 4: Run** — pass.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the interview-date planner"`

---

### Task 2: The page and the homepage chip

**Files:**
- Create: `app/plan/page.tsx`, `app/plan/PlanClient.tsx`, `tests/checks/16-plan.mjs`
- Modify: `app/lib/tools.mjs` (`plan` → `ready: true`), `app/page.tsx`

**Interfaces:** Consumes Task 1, `loadBank`, `readProgress`, `ToolShell`, `TOOLS`. Produces `/plan`.

Screen:
- **Settings row** (always on top): `Interview date` (`<input type="date">`, minimum today), `Role` (select), `Time each day` (select: `20 min` … `90 min`). Changing any of them saves and re-plans at once.
- **No date yet:** `Pick your interview date to get a plan.`
- **Status `ok`:** a summary line: `12 days to go · 214 cards · about 9 h 40 min of study`; then either `This fits in your time, with N days of review at the end.` or `This does not fit: N cards are left out (C core, O other). Add time each day, or accept the cut: core cards are kept first.` Three tabs: `Plan`, `Night before`, `30 minutes before`.
  - `Plan`: today’s card first and larger (`Today · Tuesday 17 November · 45 min`), each block as a row with its label, card count, minutes and an `Open as flashcards` link (`href`), or `Start a mock round` (`/mock`, shown as plain text `Do one timed mock round` when that tool is not ready). Later days are a compact list that opens on click.
  - `Night before`: the `eveList` items as a checklist (ticks are not stored).
  - `30 minutes before`: the warm-up blocks and the three prompts.
- **Status `today`:** heading `It is today. Good luck.` and the warm-up only.
- **Status `past`:** `That date has passed. Set your next one.`
- **Homepage:** in the existing row of chips under the hero (where “Review N cards you marked Again” appears), when settings exist and the date is today or later: a link to `/plan` reading `Interview in N days · open today’s plan` (`Interview today · open your warm-up` on the day).

- [ ] **Step 1: Write the failing check** `tests/checks/16-plan.mjs` (set the date through the input to today + 6 days, computed in the test):
  1. before a date is set, the prompt text is shown;
  2. after setting it, the summary line matches `/^6 days to go · \d+ cards/` and today’s card has at least one `Open as flashcards` link whose `href` matches `/^\/[a-z-]+#deck=/`;
  3. following that link opens the guide with the flashcard dialog visible and its count starting `1 /`;
  4. mark that deck’s first card `Got it`, return to `/plan`: the summary’s card count is one lower;
  5. `Night before` lists an item linking to `/crash-course#js`; `30 minutes before` shows the three prompts;
  6. reload keeps the date, role and minutes; the homepage shows `Interview in 6 days`;
  7. with `localStorage['study-plan-v1']` set to yesterday’s date the page shows the passed message;
  8. no `pageerror`.
- [ ] **Step 2: Run** `npm run build && npm test` — `16-plan` FAILS. **Step 3: Implement.**
- [ ] **Step 4: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`. Look at `/plan` at 375px and 1280px in both themes with a 3-day and a 30-day date.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the interview plan page and the homepage countdown"`

---

### Task 3: Document

- [ ] **Step 1:** Root `README.md`: `/plan` in the feature list. `scripts/study/README.md`: a note that a new guide joins plans only when it is added to a role in `app/lib/plan.mjs`.
- [ ] **Step 2: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 3: Commit** — `git commit -am "Document the interview plan"`
