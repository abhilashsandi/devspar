# P3: SQL in the Browser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a reader run SQL against the guide’s seeded database from inside each query-puzzle card: write a query, run it, check it against the solution, and see the plan as a tree.

**Architecture:** PostgreSQL compiled to WebAssembly (PGlite) runs in a Web Worker inside the guide’s iframe, with its data kept in IndexedDB so the 200,000-row seed is loaded once. Every run happens inside a transaction that is rolled back, so the data never changes. The runner is a small ES module loaded only when a reader presses `Try it here`; PGlite’s files are copied from `node_modules` to `public/vendor/` at build time, so nothing depends on a CDN or on the bundler. A reader’s result is compared with the solution **run live in the same database**, never with printed text.

**Tech Stack:** `@electric-sql/pglite@0.5.16` (PostgreSQL 18.6), Web Workers, IndexedDB, the shared engine, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (feature 4). Requires P0.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- Install with `npm install --save-dev --save-exact @electric-sql/pglite@0.5.16`. It is a dev dependency: the app never imports it; only its `dist` files are copied.
- The seed is `scripts/study/sql-lab/seed.sql`, already in the repo, together with `b-puzzles.sql` and `b-puzzles.out` (the puzzle run captured on PostgreSQL 17.6 that the cards were written from). Do not change the seed.
- The guide’s printed results stay as they are. If PGlite gives a different result for a puzzle, **report it to the owner; do not edit a card to match**.
- Look up PGlite’s API with `ctx7` (`/electric-sql/pglite`) before writing the worker: constructor and `dataDir`, `exec(sql, { rowMode: 'array' })`, the result shape (`rows`, `fields`, `affectedRows`), and which files in `dist` the browser build loads.
- Exact copy for the standing note under the runner: `This is PostgreSQL running in your browser: one process, no parallel workers, so plans and timings differ from a server’s. Every run is rolled back, so the data never changes.`
- Results show at most 200 rows, with `showing 200 of N` when cut.
- Do not add `Cross-Origin-Embedder-Policy`, `Cross-Origin-Opener-Policy` or `X-Frame-Options` headers. The guides are same-origin iframes and would break.

## Review Focus

1. **A runaway query** (a cross join of `orders` with itself). The page must stay responsive and `Stop` must work: it terminates the worker and starts a new one. Pinned in Task 3.
2. **The reader runs `COMMIT`, DDL or a second `ROLLBACK`** and escapes the wrapper transaction. After every run the worker checks three row counts; if they are off, the status says `The data has changed. Press Reset data to restore it.` Pinned in Task 3.
3. **First load on a slow connection, or IndexedDB unavailable** (private mode). The reader sees progress text, not a dead button; without IndexedDB the database runs in memory and is seeded each visit. Pinned in Task 3.
4. **Results that are equal but look different**: column names differ, `bigint` against `number`, `NULL`, dates, row order when the task does not ask for one. Pinned in Task 2.
5. **Two puzzle cards open at once, or the same guide in two tabs.** One worker per document; a second tab must not corrupt the store (open failure → fall back to in-memory with a note). Pinned in Task 3.

---

### Task 1: Vendor PGlite and prove the seed runs

**Files:**
- Modify: `package.json`, `.gitignore` (add `/public/vendor/`), `scripts/study/emit-static.mjs`
- Create: `scripts/study/vendor-pglite.mjs`, `scripts/study/check-sql-lab.mjs`

**Interfaces:**
- Produces: `public/vendor/pglite-0.5.16/` holding the browser files of the package (the ES module entry, the chunks it imports, the `.wasm` and `.data` files). Excluded: `*.cjs`, `*.map`, `*.d.ts`, and extension folders (`contrib`, `vector` and the like) unless the entry imports them. The script prints the file count and total size.
- Produces: `public/study/sqlrun/seed.sql` (copied from `scripts/study/sql-lab/seed.sql`) and, from Task 2 on, every file in `scripts/study/sqlrun/` copied to `public/study/sqlrun/` by `emit-static.mjs`.
- Produces: `npm run study:sql-lab` → `node scripts/study/check-sql-lab.mjs`: starts PGlite in Node (in memory), runs the seed, then every chunk of `b-puzzles.sql` (chunks are separated by lines that are exactly `-- >>>`), and compares each result’s row count with the matching `(N rows)` footer in `b-puzzles.out`. Prints the engine’s `version()` and `sql-lab: N of M result sets match`, listing any that differ. Exit 0 either way; differences are for the owner.

- [ ] **Step 1: Install** the pinned package. Run `ls node_modules/@electric-sql/pglite/dist` and read `package.json`’s `exports` to see what the browser entry is.
- [ ] **Step 2: Write `check-sql-lab.mjs`** (read `b-puzzles.out` first to see how each chunk, its table and its `(N rows)` footer are laid out) and run `node scripts/study/check-sql-lab.mjs`. Expected: a `PostgreSQL 18` version line and a match count. Paste the full output into the commit body.
- [ ] **Step 3: Write `vendor-pglite.mjs`**, call it and the `sqlrun` copy from `emit-static.mjs`, add the ignore rule, add the `study:sql-lab` script.
- [ ] **Step 4: Verify** — `npm run study:emit` prints the vendored size; `git status --short public/vendor` prints nothing.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Vendor PGlite at build time and check the SQL lab seed against it"`

---

### Task 2: Comparing results and reading a plan (pure logic)

**Files:**
- Create: `scripts/study/sqlrun/compare.mjs`, `scripts/study/sqlrun/explain.mjs`, `tests/unit/sqlrun.test.mjs`

**Interfaces:**
- Produces: `/** @typedef {{fields: string[], rows: any[][]}} Result */`
- Produces: `sameResult(mine: Result, theirs: Result, ordered: boolean): {ok: true} | {ok: false, reason: 'columns'|'row-count'|'rows'|'order'}` — compares the number of columns (names are ignored), the number of rows, then the rows as text: each value through `cell(v)` where `null`/`undefined` → `NULL`, `Date` → ISO string, `bigint` and numbers → `String`, objects → `JSON.stringify`. Unordered: equal as multisets. Ordered: the same multiset in a different sequence gives `order`.
- Produces: `REASONS: Record<string, string>` — `columns: 'Different: the number of columns is not the same.'`, `'row-count': 'Different: the number of rows is not the same.'`, `rows: 'Different: same shape, but some values differ.'`, `order: 'Right rows, wrong order: this task asks for a specific order.'`
- Produces: `planTree(explain: any): PlanNode` for the parsed value of `EXPLAIN (ANALYZE, FORMAT JSON)` (`[{ Plan, 'Execution Time' }]`), with `/** @typedef {{type: string, target: string, estRows: number, rows: number, ms: number, selfMs: number, share: number, flags: string[], children: PlanNode[]}} PlanNode */`: `type` = `Node Type`; `target` = `Relation Name`, and ` using <Index Name>` when present; `estRows` = `Plan Rows`; `rows` = `Actual Rows`; `ms` = `Actual Total Time × Actual Loops`; `selfMs` = `ms` minus the children’s `ms`, not below 0; `share` = `selfMs / root.ms` (0 when the root is 0); `flags`: `seq-scan-filter` when `type` is `Seq Scan`, `Rows Removed by Filter` is over 1000 and over nine times `Actual Rows`; `misestimate` when the larger of `estRows` and `rows` is at least ten times the smaller (treating 0 as 1); `disk-sort` when `Sort Method` contains `external`.
- Produces: `FLAG_TEXT: Record<string, string>` — `'seq-scan-filter': 'Reads the whole table and throws most of it away: an index on the filter column would help.'`, `misestimate: 'The planner’s row estimate is off by ten times or more.'`, `'disk-sort': 'The sort did not fit in memory and spilled to disk.'`

- [ ] **Step 1: Write the failing tests** `tests/unit/sqlrun.test.mjs`: `sameResult` cases for each reason; equal with different column names; `1n` equals `1`; `null` equals `undefined`; unordered equal in a different sequence is `ok`, ordered gives `order`. `planTree` on a hand-written fixture (a `Sort` over a `Seq Scan` on `orders`, loops 1, times 12 and 9, `Rows Removed by Filter` 199000, `Actual Rows` 1000, `Plan Rows` 50): root `selfMs` 3, child `share` 0.75, child flags `['seq-scan-filter', 'misestimate']`, child `target` `orders`.
- [ ] **Step 2: Run** `npm run test:unit` — FAIL. **Step 3: Implement.** **Step 4: Run** — pass.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add result comparison and plan reading for the SQL runner"`

---

### Task 3: The worker and the runner

**Files:**
- Create: `scripts/study/sqlrun/worker.js`, `scripts/study/sqlrun/sqlrun.js`, `tests/checks/13-sqlrun.mjs`
- Modify: `scripts/study/engine.js` (block `// ---- sqlrun:start/end` before `function enhance`; one call in `enhance`), `scripts/study/theme.css`, `scripts/study/sql-content-b.mjs`, `next.config.ts`

**Interfaces:**
- Worker protocol (module worker; every request carries `id`, every reply echoes it):
  - `{op: 'init'}` → `{ok: true, version: string, persisted: boolean}`. Imports `/vendor/pglite-0.5.16/<entry>`, opens `idb://devspar-sql-lab-v1` (on failure: in memory, `persisted: false`), and seeds from `/study/sqlrun/seed.sql` unless table `lab_meta` holds `seed = 1`. Posts progress messages `{progress: 'Downloading PostgreSQL…' | 'Loading the practice data…'}` without an `id`.
  - `{op: 'run', sql}` → `{ok: true, results: {fields: string[], rows: any[][], total: number, affected: number}[], changed: boolean}` or `{ok: false, error: string}`. Runs `BEGIN`, the SQL with `rowMode: 'array'`, then `ROLLBACK` (also after an error). `rows` holds at most 200. `changed` is true when, after the rollback, the counts of `employees`, `contacts` and `orders` are not 12, 6 and 200000.
  - `{op: 'explain', sql}` → `{ok: true, plan: any}` (the parsed JSON of `EXPLAIN (ANALYZE, FORMAT JSON)`, run inside the same begin/rollback) or `{ok: false, error}`.
  - `{op: 'reset'}` → drops and recreates schema `public`, seeds again, replies `{ok: true}`.
- `sqlrun.js`: `export function mount(el: HTMLElement, opts: {solution: string | null, ordered: boolean}): void`. One worker per document, shared by every mounted runner. UI inside `el`: a status line; a `<textarea aria-label="SQL">` (Ctrl+Enter or Cmd+Enter runs); buttons `Run`, `Check against the solution` (absent when `solution` is null), `Explain`, `Stop` (only while a request is pending), `Reset data`; the result table; an error box; the verdict (`Matches the solution.` or a `REASONS` text); the plan as a nested `<ul class="plan">` where each node shows type and target, `rows est → actual`, self time in ms, a bar whose width is `share`, and any `FLAG_TEXT`; the standing note. Status texts: the two progress strings, `Ready: <first two words of version> in your browser`, `Running…`, `Stopped.`, `The data has changed. Press Reset data to restore it.`
  - `Check` runs the reader’s SQL and the solution and compares the **last result set that has columns** of each with `sameResult`.
  - `Explain` needs one statement: if the text has a `;` followed by more than whitespace, show `Explain works on a single statement.`
- Engine: `mountSqlRun(root)` gives every `.sqlrun` not yet mounted a button `▶ Try it here`. On click it does `import('/study/sqlrun/sqlrun.js')` and calls `mount(el, {solution, ordered})`, where `solution` is the text of the first `<pre>` inside the first `details.reveal` of the same `.qbody` (null when `data-free="1"`), and `ordered` is `data-ordered === '1'`. If the import fails: `The SQL runner could not load.`
- Authoring: `PUZZLE(title, task, tables, answerSql, output, why, opts = {})` adds `<div class="sqlrun" data-ordered="0|1"></div>` between the tables sample and the reveal; `opts.ordered` is true for a puzzle whose task names an order (decide per puzzle from its task text, and say which in the commit body). A new export `SQLPAD = () => '<div class="sqlrun" data-free="1"></div>'` is added to the first card of section `sq4` (“How do you approach a SQL question in an interview?”) under a line `Try any query against the practice tables.`
- `next.config.ts`: `/vendor/:path*` gets `Cache-Control: public, max-age=31536000, immutable` (the folder name carries the version).

- [ ] **Step 1: Write the failing check** `tests/checks/13-sqlrun.mjs` on `${base}/sql` (frame helpers from `09-diagrams.mjs`; go to section `sq4`, open the card `Puzzle: Find the second-highest salary`; allow 90 seconds for the first `Ready`):
  1. the card has a `▶ Try it here` button; pressing it shows a status that reaches `/^Ready: PostgreSQL \d+/`, and no request to `/vendor/` or `/study/sqlrun/` returned 404;
  2. typing `select name, salary from employees order by salary desc limit 1 offset 1` and pressing `Run` shows a one-row table containing `150000` (the trap the card describes: the tied top salary again; do not assert the name, the tie can fall either way);
  3. `Check against the solution` then says `Different: same shape, but some values differ.`;
  4. typing the card’s own solution (read from the reveal’s `<pre>`) and pressing `Check` says `Matches the solution.`;
  5. `selec 1` shows an error box containing `syntax error`;
  6. `delete from employees` then `select count(*) from employees` shows `12`;
  7. `Explain` on `select * from orders where total_cents = 1234` renders a `.plan` with at least one node whose text contains `orders`;
  8. `select count(*) from orders a, orders b` → `Stop` appears; pressing it shows `Stopped.` within 5 seconds, and a following `select 1` returns `1`;
  9. `commit; delete from contacts; ` → the status says the data has changed; `Reset data` → `select count(*) from contacts` shows `6`;
  10. reload → the second `Ready` arrives in under 15 seconds (the store was reused);
  11. `/whiteboard` has no `.sqlrun` button and no `pageerror`.

- [ ] **Step 2: Run** `npm run build && npm test` — Expected: `13-sqlrun` FAILS.
- [ ] **Step 3: Implement** the worker, the runner, the engine block, the CSS, the `PUZZLE`/`SQLPAD` change. Rebuild the guide: `node scripts/study/add-sql-guide.mjs && npm run study:upgrade && npm run study:build`, then `node scripts/study/check-guide.mjs sql --min 55` → `check-guide sql: OK`.
- [ ] **Step 4: If the native import of the vendored entry fails** (a bare module specifier, a missing chunk), fix the copy list in `vendor-pglite.mjs`. If it cannot be loaded without a bundler at all, stop and report with the console error; do not switch approach on your own.
- [ ] **Step 5: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`. Try three puzzles by hand at 375px: the textarea, buttons and result table must be usable, and a wide result scrolls sideways inside its box.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "Run SQL against the practice database inside the puzzle cards"`

---

### Task 4: Document

- [ ] **Step 1:** `scripts/study/README.md`, new section “Runnable SQL”: the pinned version and how to bump it (change the version in `package.json` and in `worker.js`, run `npm run study:sql-lab`, read the differences), the seed file, the worker protocol in five lines, the `PUZZLE` option, the rollback rule. Root `README.md`: one sentence. In the guide’s lede (`add-sql-guide.mjs`) add `You can run every puzzle in your browser.` and rebuild.
- [ ] **Step 2: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 3: Commit** — `git commit -am "Document the SQL runner"`. Tell the owner about any result set that differed in Task 1.
