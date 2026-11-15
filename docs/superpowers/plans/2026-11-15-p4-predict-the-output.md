# P4: Predict the Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 24 “Predict the output” cards to the JavaScript guide where the reader types what a snippet will print, locks the answer in, and only then watches the code run and sees line by line where they were right.

**Architecture:** A card carries the snippet, an empty `<div class="predict">`, and a hidden explanation. The engine turns the placeholder into a prediction box and runs the snippet in a Web Worker built from a Blob, so an infinite loop cannot freeze the page and can be stopped. The same harness and the same value formatter run in Node at build time (`check-predict.mjs`), so the output printed on each card is proven by a real run in the code path the reader will use.

**Tech Stack:** Web Workers, `node:worker_threads`, the shared engine, the `scripts/study` toolkit, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (feature 5). Requires P0.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- Snippets run **in strict mode, in a worker, with no DOM**. The card says so: `Runs in strict mode in a Web Worker: no DOM, no network.`
- A snippet logs only strings, numbers, booleans, `null`, `undefined`, arrays and plain objects, with `console.log`. Timers are at most 300 ms. The harness collects output for 700 ms, then reports. A snippet still running after 2 seconds is stopped with the line `Stopped: still running after 2 seconds`.
- Formatting, identical in the browser and in Node: several arguments joined by one space; a top-level string as written; inside arrays and objects strings in single quotes; numbers, booleans, `null`, `undefined` by `String`; `bigint` with a trailing `n`; arrays `[ 1, 2 ]` and `[]`; plain objects `{ a: 1, b: 'x' }` and `{}`; functions `[Function: name]`; errors `Name: message`. An uncaught error prints `Uncaught Name: message`; an unhandled rejection prints `Uncaught (in promise) Name: message`.
- Every card’s printed output is what `check-predict.mjs` captured. Never type an output from memory.
- The JavaScript guide is edited through `lib.load` / `lib.save`. The new section id is `js-predict`, title `Predict the Output`, placed after `deep-objects`. Titles start `Predict the output: ` (the Quick Reference generator already skips that prefix).
- Each explanation is two or three sentences plus one line to say aloud (`SAY`), and names the rule, not just the result.

## Review Focus

1. **The reader edits the code into an infinite loop.** The page stays usable and the run ends with the stopped line. Pinned in Task 2.
2. **Output order depends on timing** (two timers with the same delay). Snippets must be deterministic: `check-predict.mjs` runs each one five times and fails if any run differs. Pinned in Task 1.
3. **A prediction that differs only in spacing or quotes** (`[1,2]` for `[ 1, 2 ]`, `"a"` for `a`). Lines are normalised before comparing, so the reader is judged on the answer; a string written as a number is still wrong. Pinned in Task 1.
4. **The reader predicts more or fewer lines than the snippet prints.** Missing and extra lines are shown as wrong, not dropped. Pinned in Task 1.
5. **Workers from a Blob are refused** (an embedding with a strict policy). The box says `This browser will not run code here. Open the answer below.` and the reveal still works. Pinned in Task 2.

---

### Task 1: The harness, the formatter and the comparison

**Files:**
- Modify: `scripts/study/engine.js` (block `// ---- predict:start` … `// ---- predict:end`, before `function enhance`)
- Create: `tests/unit/predict.test.mjs`, `scripts/study/check-predict.mjs`

**Interfaces (all inside the `predict` block, so both the engine and Node tests can load them with `loadBlock('predict')`):**
- `predictFormat(value: any, nested?: boolean): string` — the formatting rules above.
- `predictSource(code: string, post: string): string` — the program text a worker runs: `'use strict'`, the text of `predictFormat`, a `console.log` that calls `<post>({line: …})`, handlers for uncaught errors and unhandled rejections, the reader’s code inside a `try`, and after 700 ms `<post>({done: true})`. `post` is the name of the function that sends a message (`postMessage` in the browser, a `parentPort` wrapper in Node).
- `predictCompare(predicted: string, actual: string[]): {rows: {said: string, printed: string, ok: boolean}[], right: number, total: number}` — `predicted` is split on newlines with empty lines at the ends dropped; row count is the longer of the two lists; a row is `ok` when both sides exist and are equal after this normalising: remove all whitespace; replace `“ ” ‘ ’ "` with `'`; then, if the predicted line starts and ends with `'`, has no other `'`, and the printed line has none, drop those two quotes (the reader wrote `"a"` for a bare `a`). `total` is `actual.length`.
- Produces: `node scripts/study/check-predict.mjs` — loads the block, runs every `PREDICT` card of `scripts/study/predict-content.mjs` five times in a `node:worker_threads` worker (`eval: true`) using `predictSource`, and compares the lines with the card’s `expect`. Prints `check-predict: N of N match` or each mismatch with expected and actual; exit 1 on any mismatch or any run that differs from the others. With `--print <n>` it prints the captured output of card `n` (used while authoring).

- [ ] **Step 1: Write the failing tests** `tests/unit/predict.test.mjs`:
  - `predictFormat`: `'a'` → `a`; `['a', 1, null]` → `[ 'a', 1, null ]`; `[]` → `[]`; `{ a: 1, b: 'x' }` → `{ a: 1, b: 'x' }`; `{}` → `{}`; `undefined` → `undefined`; `10n` → `10n`; `new TypeError('no')` → `TypeError: no`; a function named `go` → `[Function: go]`.
  - Run `predictSource("console.log(1); setTimeout(() => console.log(3), 0); Promise.resolve().then(() => console.log(2));", 'post')` in a `worker_threads` worker and collect `['1', '2', '3']`.
  - Run `predictSource("null.x", 'post')` and collect one line matching `/^Uncaught TypeError: /`.
  - `predictCompare('1\n2', ['1', '2', '3'])` → `right: 2, total: 3`, third row `{said: '', printed: '3', ok: false}`; `predictCompare('[1,2]', ['[ 1, 2 ]'])` → `right: 1`; `predictCompare('"a"\n\n', ['a'])` → `right: 1` (quotes around a bare string are forgiven, trailing blank lines dropped); `predictCompare('[“5”,5]', ["[ '5', 5 ]"])` → `right: 1`; `predictCompare('[5,5]', ["[ '5', 5 ]"])` → `right: 0` (a string is not a number).
- [ ] **Step 2: Run** `npm run test:unit` — FAIL (`engine block not found: predict`).
- [ ] **Step 3: Implement** the three functions in the engine block and `check-predict.mjs`.
- [ ] **Step 4: Run** `npm run test:unit` — pass.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the predict-the-output harness, formatter and comparison"`

---

### Task 2: The card and its box

**Files:**
- Modify: `scripts/study/cc-kit.mjs`, `scripts/study/engine.js` (rest of the `predict` block; one call in `enhance`), `scripts/study/theme.css`
- Create: `scripts/study/predict-content.mjs` (two pilot cards), `scripts/study/add-predict-cards.mjs`, `tests/checks/14-predict.mjs`

**Interfaces:**
- `PREDICT(title: string, code: string, expect: string, ...why: string[])` in `cc-kit.mjs` returns `{ q: 'Predict the output: ' + md(title), a: C(code, 'JavaScript') + '<div class="predict"></div>' + REVEAL('Show the output and why', SAMPLE('Output', expect), ...why), predict: { code, expect } }`. The extra `predict` field is for `check-predict.mjs`; builders copy only `q` and `a` into a guide.
- `scripts/study/predict-content.mjs` exports `predict: ReturnType<typeof PREDICT>[]`.
- `node scripts/study/add-predict-cards.mjs` loads `javascript`, removes any existing section `js-predict`, inserts `{ id: 'js-predict', title: 'Predict the Output', questions }` after `deep-objects`, saves through `lib.upgrade` + `lib.save`, and prints `javascript: N predict cards`.
- Engine `mountPredict(root)`: for each `.predict` not yet mounted, with `code` = the text of the first `<pre>` in the same `.qbody` that is not `.plain` and not inside `details`:
  - a `<textarea aria-label="Your predicted output, one line per console.log">`, buttons `Lock in and run` (disabled while the textarea is empty) and `I don’t know: run it`, and the strict-mode note;
  - on either button: the textarea becomes read-only, a worker is made from `new Blob([predictSource(code, 'postMessage')])`, lines are collected until `done` or 2 seconds;
  - then a two-column table `You said` / `It printed` with a tick or cross per row, a verdict (`Exactly right.` or `N of M lines right.`, or `It printed M lines.` after `I don’t know`), and the card’s `details.reveal` is opened;
  - a button `Edit the code` shows the snippet in a `<textarea aria-label="Code">` with `Run again`, which reruns the edited text and replaces the `It printed` column;
  - if creating the worker throws: `This browser will not run code here. Open the answer below.`

- [ ] **Step 1: Write two pilot cards** in `predict-content.mjs`: the classic `setTimeout` / promise / synchronous ordering, and `var` in a loop with a timer. Capture each `expect` with `node scripts/study/check-predict.mjs --print 0` and `--print 1`, paste it, then `node scripts/study/check-predict.mjs` → `check-predict: 2 of 2 match`.
- [ ] **Step 2: Write the failing check** `tests/checks/14-predict.mjs` on `${base}/javascript`, section `js-predict`, first card:
  1. `Lock in and run` is disabled until text is typed; the reveal is closed;
  2. typing a deliberately wrong first line and the right remaining lines, then `Lock in and run`, shows a table whose first row has a cross and the rest ticks, the verdict `N of M lines right.` with the right numbers, and the reveal is now open;
  3. `Edit the code`, replace the snippet with `while (true) {}`, `Run again` → within 4 seconds the `It printed` column shows `Stopped: still running after 2 seconds`, and clicking another card’s header still opens it;
  4. on the second card, `I don’t know: run it` shows `It printed M lines.`;
  5. `/sql` has no `.predict` box and no `pageerror`.
- [ ] **Step 3: Run** `node scripts/study/add-predict-cards.mjs && npm run build && npm test` — Expected: `14-predict` FAILS.
- [ ] **Step 4: Implement** the kit helper, the rest of the block and the CSS; `npm run study:upgrade && node scripts/study/add-predict-cards.mjs && npm run study:build`.
- [ ] **Step 5: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "Add runnable predict-the-output cards to the engine, with two pilot cards"`

---

### Task 3: The 24 cards

**Files:** Modify `scripts/study/predict-content.mjs`, `tests/checks/14-predict.mjs`.

Write these, in this order (the two pilots are the first of groups A and B):

| Group | Cards |
|-------|-------|
| A. Event loop (6) | synchronous code, a zero timer and a resolved promise; a timer that queues a microtask beside a second timer; an `async` function before and after its first `await`; a promise executor runs at once; two timers of 10 and 0 ms with a promise chain between; `queueMicrotask` against a two-step `then` chain |
| B. Scope and hoisting (5) | `var` in a loop with a timer; the same with `let`; reading a `var` before its line against reading a `let` before its line; calling a function declaration before its line against a function expression; two counters from one factory |
| C. `this` (4) | a method copied to a variable and called (strict mode: an error); an arrow function and a regular function as object methods; `bind` then `call` with another object; a class method passed as a callback, then fixed with a class field arrow |
| D. Coercion and equality (4) | `'5' + 2`, `'5' - 2`, `[] + []`, `[] + {}`; `null == undefined`, `null == 0`, `'' == 0`, `NaN === NaN`, `Object.is(NaN, NaN)`; `typeof null`, `typeof []`, `typeof function(){}`; `[10, 9, 1].sort()` against a numeric comparator |
| E. Promises and errors (4) | a `then` that throws, a `catch` that returns, a `then` after it; `Promise.all` against `Promise.allSettled` with one rejection; `try`/`catch` around an `async` call without `await`, then with it; what `finally` does to the value passing through |
| F. Objects (1) | a spread copy is shallow: change a nested value and a top-level value, log both objects |

- [ ] **Step 1: Write group by group.** For each card: write the snippet (at most 14 lines), run `--print <n>`, paste the output as `expect`, then write the explanation from what actually printed. If the output surprises you, the explanation must say why; do not bend the snippet to fit a remembered answer.
- [ ] **Step 2: Check** — `node scripts/study/check-predict.mjs` prints `check-predict: 24 of 24 match`.
- [ ] **Step 3: Apply** — `node scripts/study/add-predict-cards.mjs && npm run study:build`; add to `14-predict.mjs`: section `js-predict` has 24 cards. Open five cards across the groups in the browser and run them.
- [ ] **Step 4: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add 24 predict-the-output cards to the JavaScript guide"`

---

### Task 4: Document

- [ ] **Step 1:** `scripts/study/README.md` (“Predict the output”): `PREDICT`, the snippet rules, `check-predict.mjs`, how to add a card to another guide. Update the JavaScript card description in `app/page.tsx` to end `… and 24 predict-the-output snippets you can run.` Add `"study:predict": "node scripts/study/check-predict.mjs"` to `package.json`.
- [ ] **Step 2: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 3: Commit** — `git commit -am "Document predict-the-output cards"`. Tell the owner `/my-prep` needs their own refresh to get the new engine.
