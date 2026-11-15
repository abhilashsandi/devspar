# Practice and readiness features

Date: 2026-11-15. Owner: Abhilash. Status: approved for planning. Executor: Claude Sonnet 5.5
(`claude-sonnet-5-5`), one plan per session.

## Why

DevSpar is strong at reading and recall: 24 guides, 1,469 unique questions, flashcards, shared progress,
weak cards, whiteboard diagrams. An interview tests something else: speaking to a time limit, being
pushed with follow-ups, working under a clock, and running real code and queries. These ten features
close that gap.

## The ten features

| # | Feature | Where it lives | Plan |
|---|---------|----------------|------|
| 1 | Three depths per answer (15 s, 60 s, full) | inside every guide (engine) | P1 |
| 2 | Follow-up ladder | inside every guide (engine) | P1 |
| 3 | Full mock rounds, 45 minutes, scorecard | page `/mock` | P2 |
| 4 | SQL in the browser with a visual `EXPLAIN` | puzzle cards in `/sql` | P3 |
| 5 | Predict the output, run in a sandbox | new section in `/javascript` | P4 |
| 6 | Estimation drills with random numbers | page `/drills` | P5 |
| 7 | Interview-date plan, night-before and 30-minute modes | page `/plan` | P6 |
| 8 | Job-description mapper | page `/match` | P7 |
| 9 | Story bank builder (private STAR form) | page `/stories` | P8 |
| 10 | Audio mode and offline install | engine (listen) and site (service worker) | P9 |

P0 (`2026-11-15-p0-practice-foundations.md`) builds what several features share. **Run P0 first, then
P1 to P8 in any order, one at a time, then P9 last** (its offline list must include every route the other
plans add). Plans touch the same three files (`scripts/study/engine.js`, `scripts/study/theme.css`,
`app/lib/tools.mjs`), so do not run two plans in parallel in one working tree.

Inputs already in the repository: `scripts/study/sql-lab/seed.sql`, `b-puzzles.sql` and `b-puzzles.out`
(the seeded practice database and the puzzle run the Data and SQL guide was written from; P3 uses them).

## Decisions that apply to all of them

1. **No account, no server state.** Everything a reader types or scores stays in their browser
   (`localStorage`, IndexedDB). Nothing a reader writes is sent anywhere. Pages that take personal text
   (`/match`, `/stories`) say so on the page.
2. **No new AI calls.** Scoring is self-rating against a rubric; the mapper is keyword matching. The
   existing AI mock interviewer under `/react-training/labs` is untouched.
3. **Two kinds of home.** A feature that belongs to a card is added to the shared engine
   (`scripts/study/engine.js`), so it reaches every guide. A feature that spans guides is a Next.js page
   in the site's own style, with its logic in a pure module under `app/lib/*.mjs` that Node can test.
4. **Depth "3 minutes" is the existing full answer.** Only the 15-second and 60-second scripts are new
   writing. First scope: the 60 ★ core cards of `/interview-prep`.
5. **Content is verified by running it.** SQL results come from the seeded database, JavaScript outputs
   from actually executing the snippet, numbers in drills from a formula with a unit test.
6. **PGlite is pinned** to `@electric-sql/pglite@0.5.16` (PostgreSQL 18.6), self-hosted under
   `public/vendor/`. The guide's printed results were captured on PostgreSQL 17.6, so the runner always
   shows the engine's own `version()` and compares a reader's result with the solution run live in the
   same database, never with printed text.

## Rules for every plan

- Work in `C:\Users\abhilashsandi\Documents\projects\merge-csvs`, branch `main`. Commit after each task
  with the commit message the task gives. **Never push.** Never read or change `private/`. Never ask for
  or use the `/my-prep` password.
- Read `scripts/study/README.md` before touching anything under `scripts/study/`.
- Never hand-edit `app/*/content.json` or `public/study/*`: they are generated. After changing
  `scripts/study/engine.js` or `scripts/study/theme.css` run `npm run study:upgrade`, then
  `npm run study:build`.
- The engine is one classic script shared by every guide and inlined into the encrypted `/my-prep` page.
  Each feature goes in its own block between `// ---- <name>:start` and `// ---- <name>:end`, is called
  from `enhance(root)` when it decorates a card, and must do nothing (no error, no empty box) on a card
  that lacks its markup. A block's top level holds only declarations (no DOM access, no listeners), and
  anything a unit test needs is a `function` declaration, so `loadBlock` (P0) can run the block in Node:
  `const` and `let` at the top of a block are not visible to the test.
- Styles for guides go in `scripts/study/theme.css` and use the existing tokens (`--panel`, `--panel-2`,
  `--border`, `--text`, `--muted`, `--accent`, `--accent-soft`, `--accent-ink`, `--gold`, `--danger`,
  `--mono`, `--hand`). Site pages use the Tailwind tokens already in `app/globals.css` (`bg-board`,
  `bg-surface`, `bg-surface-2`, `border-line`, `text-ink`, `text-ink-2`, `text-marker`, `bg-marker-soft`,
  `bg-hl`, `text-hl-ink`, `font-display`). Copy the look of `app/page.tsx`; add no UI library.
- Both themes (light and dark) and a 375px-wide phone must work. Every control is reachable by keyboard
  and has a visible label or `aria-label`.
- Pure logic lives in `app/lib/<name>.mjs` with JSDoc types, no DOM and no `Date.now()`/`Math.random()`
  inside (pass `now` and a seeded `rng` in). Unit tests: `tests/unit/<name>.test.mjs`, run by
  `npm run test:unit`. Browser checks: `tests/checks/NN-<name>.mjs`, run by `npm test` after
  `npm run build`.
- Reserved names. Checks: `10-foundations`, `11-depths`, `12-mock`, `13-sqlrun`, `14-predict`,
  `15-drills`, `16-plan`, `17-match`, `18-stories`, `19-listen-offline`. Storage keys:
  `study-depth-pref-v1`, `study-mock-history-v1`, `study-drills-v1`, `study-plan-v1`, `study-match-v1`,
  `study-stories-v1`, `study-listen-v1`, `study-offline-v1`; IndexedDB database `devspar-sql-lab-v1`.
  Existing keys that tools read and write: `study-reviewed-titles-v1`, `study-weak-titles-v1`.
- Library questions (PGlite, Next.js, Playwright): look up current docs with
  `npx ctx7@latest library <name> "<question>"` then `npx ctx7@latest docs <id> "<question>"`, at most
  three commands per question. Do not answer API details from memory.
- Writing style for anything a reader sees: second person, plain sentences, British spelling, no
  " — " separators, typographic quotes inside prose.
- On this Windows machine: write files with the Write/Edit tools, not shell heredocs; a `\b` inside a
  scripted regex edit can become a backspace character.
- A task is done only when its commands print what the task says. The final step of every plan is
  `npm run test:unit && npm run build && npm test`, ending `ALL CHECKS PASSED`. Report real output; if
  a step fails, stop and say so.
- After any plan that changes `engine.js` or `theme.css`, tell the owner that `/my-prep` keeps the old
  engine until they run `scripts/update-my-prep.mjs` themselves.

## Out of scope

Accounts or sync between devices, AI grading, voice recording, pre-generated audio files, a peer
interviewer link, spaced-repetition intervals, drawing canvases. Each can be a later plan.
