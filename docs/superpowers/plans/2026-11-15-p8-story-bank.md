# P8: Story Bank Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/stories`: a private form where the reader writes their own STAR stories, sees at once whether each has the shape interviewers look for (the action is most of it, the result has a number, it fits two minutes), and sees which competencies their stories cover and which are empty.

**Architecture:** Stories live only in the reader’s browser (`localStorage`), with export and import as a JSON file for safekeeping. A pure module analyses a story and merges imports; a client page is the list, the editor with live checks, and a coverage grid that lists the Behavioural guide’s questions for each competency from the card bank. This is separate from the owner’s encrypted `/my-prep`: nothing here is in the repository or on the server.

**Tech Stack:** Next.js 16, React 19, `app/lib/bank.mjs`, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (feature 9). Requires P0.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- Story text is rendered as text only. No `dangerouslySetInnerHTML` anywhere in this feature, including for imported files.
- Nothing a reader types is sent anywhere. Exact privacy line on the page: `Your stories are saved in this browser only. Export a copy to keep them safe: clearing site data deletes them.`
- Never read `private/` or `/my-prep` content for examples. Placeholder text in the form is generic.
- Competencies (ids, labels, and the Behavioural guide section each maps to):

| id | label | section |
|----|-------|---------|
| `ownership` | Ownership and delivery | `bh3` |
| `collaboration` | Collaboration and conflict | `bh4` |
| `leadership` | Leadership and mentoring | `bh5` |
| `growth` | Failure, growth and self-awareness | `bh6` |
| `judgement` | Judgement and values | `bh7` |

- Speaking rate for time estimates: 150 words a minute.
- The five checks, with exact rules and copy (`N` is a whole percentage or a number of seconds):

| id | passes when | text when it fails |
|----|-------------|--------------------|
| `action-share` | action words ÷ all words ≥ 0.5 | `The action is N% of the story. Aim for at least half: say what you did, step by step.` |
| `number` | the result contains a digit | `Add a number to the result: a percentage, a time saved, a count.` |
| `length` | 180 ≤ all words ≤ 400 | `This takes about N seconds to say. Aim for 75 seconds to two and a half minutes.` |
| `first-person` | in the action, `I` (as a word, capital) appears at least as often as `we` (any case) | `You say “we” more than “I” in the action. Say what you did yourself.` |
| `setup-short` | (situation + task words) ÷ all words ≤ 0.3 | `The situation and task are N% of the story. Keep them under a third.` |

  When a check passes its text is the short positive form: `The action is N% of the story.`, `The result has a number.`, `About N seconds to say.`, `You say “I” in the action.`, `The set-up is N% of the story.`

## Review Focus

1. **The reader reloads, or the tab crashes, in the middle of writing.** The unsaved draft is kept in `sessionStorage` (`story-draft`) on every change and restored. Pinned in Task 2.
2. **Storage is full or blocked.** Saving shows `Could not save: this browser’s storage is full or blocked. Export your stories to keep them.` and the text stays in the form. Pinned in Task 2.
3. **Import of the wrong file, a huge file, or a file with markup in it.** A file over 1 MB or of the wrong shape is refused with `That is not a DevSpar story file.`; markup shows as plain text. Pinned in Tasks 1 and 2.
4. **The same stories open in two tabs.** A `storage` event reloads the list; when both saved the same story the newer `updatedAt` wins. Pinned in Task 1 (merge rule) and Task 2.
5. **An empty or one-line story.** No checks are shown as failed before there is text: the panel says `Start writing: the checks appear as you go.` until the story has 30 words. Pinned in Task 1.

---

### Task 1: Analyse, store and merge (pure logic)

**Files:**
- Create: `app/lib/stories.mjs`, `tests/unit/stories.test.mjs`

**Interfaces:**
- Produces:
  - `COMPETENCIES: {id: string, label: string, sec: string}[]`
  - `/** @typedef {{id: string, title: string, competencies: string[], s: string, t: string, a: string, r: string, updatedAt: string}} Story */`
  - `countWords(text: string): number` — runs of non-space characters.
  - `analyse(story: Story): {words: {s: number, t: number, a: number, r: number, total: number}, actionShare: number, seconds: number, ready: boolean, checks: {id: string, ok: boolean, text: string}[]}` — `ready` is false and `checks` is empty under 30 words; `seconds = Math.round(total / 150 * 60)`.
  - `coverage(stories: Story[]): {id: string, label: string, sec: string, count: number}[]` — one row per competency, in table order.
  - `upsert(stories: Story[], story: Story): Story[]` (replace by `id` or add; newest `updatedAt` first), `remove(stories: Story[], id: string): Story[]`.
  - `exportJson(stories: Story[], now: string): string` — `{ app: 'devspar-stories', version: 1, exportedAt: now, stories }`, pretty-printed.
  - `importJson(text: string, existing: Story[]): {stories: Story[], added: number, updated: number, skipped: number}` — throws `Error('That is not a DevSpar story file.')` unless the text is JSON with `app === 'devspar-stories'` and an array `stories`; each entry must have string `id`, `title`, `s`, `t`, `a`, `r`, `updatedAt` and an array `competencies` (unknown competency ids are dropped), otherwise it is skipped; an entry whose `id` exists replaces it only when its `updatedAt` is later.
  - `toText(story: Story): string` — title, then `Situation:`, `Task:`, `Action:`, `Result:` paragraphs.
  - `readStories(storage): Story[]` (empty on any error), `writeStories(storage, stories): boolean` (false when `setItem` throws); key `study-stories-v1`.

- [ ] **Step 1: Write the failing tests** `tests/unit/stories.test.mjs`. Build stories from repeated words so counts are exact (`w(n, word = 'x')` returns `n` words):
  - a story with `s` 20, `t` 20, `a` 140 words containing `I` three times and no `we`, `r` 20 words including `40%` → `total` 200, `actionShare` 0.7, `seconds` 80, all five checks `ok`, and `action-share` text `The action is 70% of the story.`;
  - `a` 60 of 200 → `action-share` fails with `The action is 30% of the story. Aim for at least half: say what you did, step by step.`;
  - a result with no digit fails `number`; totals of 179 and 401 fail `length`, 180 and 400 pass;
  - an action with `we` twice and `I` once fails `first-person`; `We` and `we` both count; `I` inside `It` does not count;
  - `s` + `t` of 61 in 200 fails `setup-short`, 60 passes;
  - 29 words → `ready: false`, `checks` empty;
  - `coverage` counts a story with two competencies under both; a story with none under nothing;
  - `importJson` throws on `'[]'`, on `'{"app":"other"}'` and on non-JSON; adds a new story; replaces an existing one only when newer; skips an entry missing `a`; drops an unknown competency id; keeps `<script>` in text unchanged as a string;
  - `exportJson` then `importJson` into `[]` returns the same stories;
  - `writeStories` returns `false` when `setItem` throws; `readStories` returns `[]` for bad JSON.
- [ ] **Step 2: Run** `npm run test:unit` — FAIL. **Step 3: Implement.** **Step 4: Run** — pass.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add story analysis, storage and import for the story bank"`

---

### Task 2: The page

**Files:**
- Create: `app/stories/page.tsx`, `app/stories/StoriesClient.tsx`, `tests/checks/18-stories.mjs`
- Modify: `app/lib/tools.mjs` (`stories` → `ready: true`)

**Interfaces:** Consumes Task 1, `loadBank`, `ToolShell`. Produces `/stories`. New story ids come from `crypto.randomUUID()`; timestamps from `new Date().toISOString()`, both created in the component and passed into the pure functions.

Screen, top to bottom:
1. The privacy line, and `Aim for six to eight stories that cover all five areas.`
2. **Coverage:** five tiles, one per competency, each with its story count (`No story yet` in the warning colour when 0) and a `Questions this answers` disclosure listing the Behavioural guide’s questions for that section from the bank (kind `behavioural`, matching `sec`), each a link to its card.
3. **Your stories:** one row per story: title, competency chips, `4 of 5 checks`, `about 95 s`, and `Edit`. `New story` above the list; `Export`, `Import` (a file input accepting `.json`) and `Print` beside it.
4. **Editor** (shown for a new or chosen story): `Title`; the five competencies as checkboxes in a group labelled `What does this story show?`; four textareas labelled `Situation`, `Task`, `Action`, `Result`, each with a live word count and one line of guidance (`Two sentences: where, when, what was at stake.` / `What you were responsible for.` / `What you did, in order, and why. This is most of the story.` / `What changed, with a number, and what you learned.`); a **checks panel** beside or under the form showing each check with a tick or a cross and its text; a `Say it` stopwatch (`Start`, `Stop`, the elapsed time and the estimate); buttons `Save story`, `Copy as text`, `Delete` (asks `Delete this story? This cannot be undone.`), `Close`.
5. Print: a print stylesheet shows only the stories as plain text, one per page.

- [ ] **Step 1: Write the failing check** `tests/checks/18-stories.mjs`:
  1. first visit: five tiles all say `No story yet`; the checks panel is not shown;
  2. `New story`, type a title, tick `Ownership and delivery`, type 20 words in Situation → the panel says `Start writing: the checks appear as you go.`;
  3. fill Task 20 words, Action 140 words with `I` and no `we`, Result `Latency fell by 40% in two weeks` padded to 20 words → five ticks and `about 80 s`;
  4. reload before saving → the draft is still in the form;
  5. `Save story` → the list has one row with `5 of 5 checks`; the `Ownership and delivery` tile says `1 story`; reload keeps it;
  6. `Export` triggers a download whose JSON has `app: 'devspar-stories'` and one story (use Playwright’s `download` event);
  7. `Import` with a file `{"nope":1}` shows `That is not a DevSpar story file.`; with the exported file edited to a new `id` and a title containing `<b>x</b>` adds a second row whose title shows the literal text `<b>x</b>`;
  8. the `Questions this answers` list under `Ownership and delivery` has at least five links to `/behavioural#bh3:`;
  9. with `localStorage.setItem` patched to throw, `Save story` shows the storage message and the form keeps its text;
  10. `Delete` after confirming removes the row; no `pageerror`; no network request carried the word used in the title.
- [ ] **Step 2: Run** `npm run build && npm test` — `18-stories` FAILS. **Step 3: Implement.**
- [ ] **Step 4: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`. Look at the editor at 375px and 1280px in both themes, and at the print preview.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the story bank page"`

---

### Task 3: Link it and document

- [ ] **Step 1:** In the Behavioural content module that holds section `bh1` (`scripts/study/bh-content-a.mjs` or `bh-content-b.mjs`), add `GO(['/stories', 'Story bank: write and check your own stories'])` to the card that explains STAR in section `bh1` (find it by reading the file; name the card in the commit body), then `node scripts/study/add-behavioural-guide.mjs && npm run study:build` and `node scripts/study/check-guide.mjs behavioural` → `check-guide behavioural: OK`. Root `README.md`: `/stories` in the feature list, with the sentence that stories never leave the browser.
- [ ] **Step 2: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "Link the story bank from the Behavioural guide"`
