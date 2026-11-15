# P1: Answer Depths and Follow-up Ladder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each ★ core card of `/interview-prep` a 15-second and a 60-second spoken version beside the full answer, and a ladder of two or three follow-up questions that get harder, the way an interviewer digs.

**Architecture:** The new text is an overlay, kept apart from the guide’s own content: one entry per card in `scripts/study/extras/`, applied to a guide’s data by `applyExtras` as a marked block appended to the card’s answer. The engine turns that block into a length switch (`15 s · 60 s · Full answer`) at the top of the card and a one-rung-at-a-time ladder at the bottom. Because the block is ordinary card HTML, it works in the card list, in flashcards and in the solo embed without changing any of them.

**Tech Stack:** `scripts/study` toolkit (Node ES modules), the shared engine and theme, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (features 1 and 2). Requires P0.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- Scope is exactly the 60 ★ core cards of `interview-prep` (index flag from P0). `node scripts/study/check-extras.mjs interview-prep --list` prints them in guide order; that list is the work list.
- The full answer is never edited. “3 minutes” is the existing answer; only the two short scripts and the ladder are new.
- Word budgets, enforced by `check-extras.mjs`: `s15` 20 to 45 words; `s60` 110 to 170 words; 2 or 3 rungs; a rung question ends with `?` and has at most 25 words; a rung answer has 15 to 60 words.
- Scripts are written to be **said**: first person, short sentences, the main point first. `s15` is the headline plus one consequence. `s60` is headline, one concrete example, one trade-off, in that order.
- Rungs escalate: rung 1 asks you to apply it (“when would you reach for it?”), rung 2 asks for a trade-off or a failure, rung 3 asks about scale, internals or a “what if”. Where the card already lists “Common follow-ups”, use those questions, ordered easy to hard.
- **Add no fact the card does not already contain** in `s15` and `s60`: compress, do not extend. A rung answer may go one step further; any such fact must be checked first (run the code, or look it up with `ctx7`) and listed in the commit body as `checked: <claim> — <how>`.
- Text uses the kit’s tiny markup only: `` `code` `` and `**bold**` (rendered by `md` from `./cc-kit.mjs`).
- `interview-prep` is edited through `lib.load` / `lib.save`, never by hand. The script is re-runnable: a second run replaces the block, it never adds a second one.

## Review Focus

1. **Re-running the overlay duplicates the block**, so a card shows two switches. Pinned in Task 1 (apply twice, expect one block).
2. **A card title changes later and its entry no longer matches**: the script must fail loudly with the title, not skip silently. Pinned in Task 1.
3. **The short script leaks into the collapsed summary or the search summary** on a card whose answer starts with a table or diagram. Pinned in Task 1 (all three summary functions ignore the block).
4. **Reader picks `15 s`, then opens a card that has no scripts**: that card must show its full answer, with no empty switch. Pinned in Task 2.
5. **Keyboard and screen reader**: the switch is three buttons with `aria-pressed`, the ladder’s next button is reachable, and focus is not lost when a rung appears. Pinned in Task 2.

---

### Task 1: The overlay toolkit

**Files:**
- Create: `scripts/study/extras.mjs`, `scripts/study/add-extras.mjs`, `scripts/study/check-extras.mjs`, `scripts/study/extras/interview-prep.mjs` (exports `[]` for now), `tests/unit/extras.test.mjs`
- Modify: `scripts/study/engine.js` (the `INDEX` summary, line ~249), `scripts/study/build-index.mjs` (`summary`), `scripts/study/helpers.mjs` (`firstSentence`), `package.json`

**Interfaces:**
- Produces: `/** @typedef {{card: string, sec: string, s15: string, s60: string, ladder: [string, string][]}} Extra */`
- Produces: `extrasHtml(e: Extra): string` — exactly this shape (text through `md`):

```html
<!--x:extras--><div class="xdepths" hidden><div data-depth="15"><p>…</p></div><div data-depth="60"><p>…</p></div></div><div class="xladder" hidden><details class="reveal rung"><summary>Question?</summary><p>What a good answer covers.</p></details>…</div><!--/x:extras-->
```

- Produces: `applyExtras(data, entries: Extra[]): { applied: number }` — for each entry finds the one card in section `sec` whose plain title equals `card` (`plainTitle` from `./parsePage.mjs`), removes any existing `<!--x:extras-->…<!--/x:extras-->` block from its answer and appends `extrasHtml(e)`. Throws `extras: no card "<card>" in <sec>` when there is no match and `extras: two entries for "<card>"` on a duplicate.
- Produces: `validateExtra(e: Extra): string[]` — the budget rules from Global Constraints, one message per breach.
- Produces: `node scripts/study/add-extras.mjs <slug>` — loads the guide, applies `scripts/study/extras/<slug>.mjs` (default export `Extra[]`), saves through `lib.upgrade` + `lib.save`, prints `<slug>: extras on N card(s)`.
- Produces: `node scripts/study/check-extras.mjs <slug> [--list] [--require-all]` — `--list` prints the core cards as `sec | title`; default validates every entry and that each matches a card; `--require-all` also fails unless every core card has an entry. Prints `check-extras <slug>: OK (N of M core cards)` or the failures, exit 1.
- Produces: `npm run study:extras` → `node scripts/study/add-extras.mjs interview-prep`.

- [ ] **Step 1: Write the failing tests** `tests/unit/extras.test.mjs`:
  - `applyExtras` on fixture data (`[{ id: 'js', title: 'JS', questions: [{ q: 'What is a <code>closure</code>?', a: '<p>Full.</p>' }] }]`) with entry `card: 'What is a closure?'` appends one block; applying again with a different `s15` leaves exactly one `<!--x:extras-->` and the new text.
  - An entry whose card is absent throws `/no card "Nope" in js/`.
  - `extrasHtml` escapes `<` in text and renders `` `x` `` as `<code>x</code>`.
  - `validateExtra` returns no message for an entry at the budgets and one message each for: `s15` of 46 words, `s60` of 109 words, one rung, a rung question without `?`, a rung answer of 61 words.
  - Summary stripping: with an answer of `'<table class="cmp"><tr><td>x</td></tr></table>' + extrasHtml(e)`, `firstSentence` from `helpers.mjs` returns `''`.

- [ ] **Step 2: Run** `npm run test:unit` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement** the three scripts and the module. In all three summary functions remove `<!--x:extras-->[\s\S]*?<!--\/x:extras-->` before taking prose (engine line ~249, `summary` in `build-index.mjs`, `firstSentence` in `helpers.mjs`).

- [ ] **Step 4: Verify** — `npm run test:unit` passes; `node scripts/study/check-extras.mjs interview-prep --list` prints 60 lines; `node scripts/study/check-extras.mjs interview-prep` prints `check-extras interview-prep: OK (0 of 60 core cards)`.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the answer-extras overlay: scripts, checks and summary handling"`

---

### Task 2: The switch and the ladder in the engine, with a three-card pilot

**Files:**
- Modify: `scripts/study/engine.js` (blocks `// ---- depths:start/end` and `// ---- ladder:start/end` placed before `function enhance`; two calls inside `enhance`), `scripts/study/theme.css`, `scripts/study/extras/interview-prep.mjs`
- Create: `scripts/study/extras/interview-prep-a.mjs`, `tests/checks/11-depths.mjs`, `tests/unit/depths.test.mjs`

**Interfaces:**
- Consumes: the block markup from Task 1.
- Produces (engine): `depthSeconds(words: number): number` = `Math.round(words / 2.5)` (150 words a minute); `mountDepths(root)`; `mountLadders(root)`; both called from `enhance(root)` after `drawDiagrams(root)`.
- Behaviour of the switch: for each `.xdepths` not yet mounted, insert at the top of its `.qbody` a `<div class="depth-bar" role="group" aria-label="Answer length">` with three `<button type="button" data-depth="15|60|full" aria-pressed>` labelled `15 s`, `60 s`, `Full answer`, and a `<span class="depth-time">` reading `about N s spoken` for a script or `about N min spoken` for the full answer (words / 150, at least 1). Move the `.xdepths` element directly after the bar and remove its `hidden`. With `15` or `60` selected the `.qbody` gets class `depth-short` and `data-depth`, and CSS hides every direct child except the bar, the matching script and `.xladder`. The choice is stored in `study-depth-pref-v1` (`15`, `60` or `full`, default `full`), applies to every mounted card at once, and falls back to memory when storage is blocked (same pattern as `SK_PREF`).
- Behaviour of the ladder: remove `hidden`, add a heading `<p class="ladder-h">The interviewer pushes</p>`, show only the first `.rung`, and add `<button type="button" class="ladder-next">Push harder →</button>` with a counter `Follow-up 1 of N`. Each click shows the next rung, moves focus to its `<summary>`, updates the counter, and removes the button after the last rung.

- [ ] **Step 1: Write the pilot content.** `interview-prep-a.mjs` exports `Extra[]` for the first three cards printed by `--list`. `interview-prep.mjs` becomes `export default [...a]`. Run `node scripts/study/check-extras.mjs interview-prep` → `OK (3 of 60 core cards)`.

- [ ] **Step 2: Write the failing tests.**
  - `tests/unit/depths.test.mjs`: `loadBlock('depths', …)` gives `depthSeconds(40) === 16` and `depthSeconds(150) === 60`.
  - `tests/checks/11-depths.mjs` on `${base}/interview-prep` (frame helpers from `09-diagrams.mjs`; find the first `INDEX` entry whose answer contains `class="xdepths"` and go to its section):
    1. the card has a `.depth-bar` with three buttons, `Full answer` pressed, and the first paragraph of the full answer visible;
    2. clicking `15 s` shows the 15-second script, hides that paragraph, and `.depth-time` matches `/about \d+ s spoken/`;
    3. after a reload the same card still has `15 s` pressed, and so does a second card with scripts;
    4. a card with no `.xdepths` has no `.depth-bar` and its first paragraph is visible while `15 s` is the stored choice;
    5. the ladder shows one rung and `Follow-up 1 of 3` (or `of 2`); `Push harder →` shows the second and focus is on its summary; after the last rung the button is gone; opening a rung shows its answer;
    6. in flashcards (`#fcCore`, then `Reveal answer`) the revealed answer has a `.depth-bar`;
    7. `/sql` (no extras) raises no `pageerror` and has no `.depth-bar`.

- [ ] **Step 3: Run** `npm run study:extras && npm run build && npm test` — Expected: `11-depths` FAILS (no bar yet).

- [ ] **Step 4: Implement** the two engine blocks and the CSS (`.depth-bar` uses the same button look as `.dg-bar`; `.xladder` uses the existing `details.reveal` style with a left rule in `--gold`; hide both in print except the selected script). Then `npm run study:upgrade && npm run study:extras && npm run study:build`.

- [ ] **Step 5: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`. Take a screenshot of one pilot card at 1280px and 375px in both themes and look at it: the switch must not wrap badly on the phone.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "Add the answer-length switch and the follow-up ladder to every guide"`

---

### Tasks 3, 4 and 5: Write the remaining 57 cards

One task per file, same steps each: Task 3 = cards 4 to 20 (finish `interview-prep-a.mjs`), Task 4 = cards 21 to 40 (`interview-prep-b.mjs`), Task 5 = cards 41 to 60 (`interview-prep-c.mjs`). `interview-prep.mjs` exports the three arrays concatenated.

**Interfaces:** Consumes `Extra` and the scripts from Task 1. Produces entries only.

- [ ] **Step 1: Read each card in full** before writing its entry: `node -e "import('./scripts/study/lib.mjs').then(async (l) => { const { data } = await l.load('interview-prep'); const s = data.find((x) => x.id === process.argv[1]); console.log(s.questions[Number(process.argv[2])].a.replace(/<svg[\s\S]*?<\/svg>/g, '[diagram]')); })" <sec> <idx>`.
- [ ] **Step 2: Write the entries** to the rules in Global Constraints. Read each `s60` aloud once in your head against a clock: if it would not fit a minute, cut the example, not the trade-off.
- [ ] **Step 3: Check** — `node scripts/study/check-extras.mjs interview-prep` prints `OK (20|40|60 of 60 core cards)`.
- [ ] **Step 4: Apply and look** — `npm run study:extras && npm run study:build`, open three cards from this batch in the browser, switch all three lengths, step the ladder.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add short answers and follow-ups: core cards N to M"`, with the `checked:` lines in the body.

---

### Task 6: Finish

**Files:** Modify `scripts/study/README.md`, `tests/checks/11-depths.mjs`.

- [ ] **Step 1: Require full coverage.** `node scripts/study/check-extras.mjs interview-prep --require-all` prints `check-extras interview-prep: OK (60 of 60 core cards)`. Add to `11-depths.mjs`: the number of `INDEX` entries on `/interview-prep` with `class="xdepths"` is 60.
- [ ] **Step 2: Document** in `scripts/study/README.md` (“Short answers and follow-ups”): the entry shape, the budgets, the two commands, and that a guide rebuilt from content modules must call `applyExtras(data, entries)` in its builder before `lib.save`, or a rebuild drops the overlay.
- [ ] **Step 3: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 4: Commit** — `git commit -am "Require short answers on every core card and document the overlay"`. Tell the owner `/my-prep` needs their own refresh to get the new engine.
