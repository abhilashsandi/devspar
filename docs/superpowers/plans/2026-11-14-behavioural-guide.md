# Behavioural Interview Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public, generic behavioural-interview guide at `/behavioural`: a STAR question bank of about 45 cards organised by competency.

**Architecture:** A DevSpar study guide is one generated `app/<slug>/content.json`, built by a script from content modules with the toolkit in `scripts/study/`. This plan adds a diagram module, two content modules and a builder, then registers the guide on the site. No engine or theme changes.

**Tech Stack:** Node.js ESM scripts (no dependencies), the `scripts/study` toolkit (`cc-kit.mjs`, `dg.mjs`, `helpers.mjs`, `lib.mjs`), Next.js 16 for the route wrapper.

**Spec:** `docs/superpowers/specs/2026-11-14-three-new-guides.md`

## Global Constraints

- Work in `C:\Users\abhilashsandi\Documents\projects\merge-csvs`. Commit on the current branch after each task. Never push. Never read or copy anything from `private/` or `app/my-prep/`.
- Read `scripts/study/README.md` before Task 1. Copy patterns from `scripts/study/add-architecture-guide.mjs` (builder), `scripts/study/dg-arch.mjs` (diagrams) and `scripts/study/bug-content-a.mjs` (hidden answers).
- Content goes in content modules and is built by the builder. Never edit `app/*/content.json` or `public/study/*` by hand.
- Authoring kit, all from `./cc-kit.mjs`: `P(...paragraphs)`, `L(...items)` bullets, `N(...items)` numbered, `T(headRow, rows)` table, `C(code, label?)`, `SAY(text)` callout, `TRAP(text)`, `K(title, ...htmlParts)` card, `GO([href, label], ...)` links, `RAPID(title, [[q, a], ...])`, `QUIZ(question, options[4], rightIndex, why)`, `DIAGRAM(title, svg, ...htmlParts)`, `REVEAL(summary, ...htmlParts)`, `md(text)`.
- Text passed to the kit uses its small markup: `` `code` `` and `**bold**`; everything else is escaped, so write `<`, `>` and `&` literally. Write strings in double quotes. Inside text use typographic quotes (“ ”), never a raw `"`.
- Style: second person, plain sentences, British spelling (behaviour, organise, prioritise). No " — " separators (the checker rejects them). No filler openers. Say the trade-off.
- Worked examples are **fictional and generic**: an unnamed engineer on a plausible product team. No real company names, no numbers that could be mistaken for the site owner's.
- Diagrams: `wrap('0 0 900 H', body, caption)` with helpers `box`, `txt`, `arrow`, `rect`, `line`, `M` imported from `./dg.mjs`. Colours only through styles `'n' | 'a' | 'g' | 'd'` and text colours `'text' | 'muted' | 'accent' | 'gold' | 'danger'`. Text must fit its box with 8px to spare: monospace text is about 6.3px per character at size 10.5; bold sans at size 12 is about 6.8px per character.
- Acceptance commands: `node scripts/study/check-guide.mjs behavioural --min 45 --sections bh1:5,bh2:6,bh3:7,bh4:7,bh5:6,bh6:6,bh7:5,bh8:6,bh9:5` must print `check-guide behavioural: OK`; `npm run study:build && npm run build && npm test` must end with `ALL CHECKS PASSED`.

## Review Focus

1. **A reader recites a worked example as their own.** Every example card ends with a line telling the reader to replace it with a real story; Task 2 Step 3 adds it through the `Q` helper, and Task 4's check greps for it.
2. **A title collides with an existing card** in `interview-prep` or `interview-cheatsheet` (shared progress would mark both). `check-guide` fails on it; rename the new card, never the old one.
3. **A long table overflows on a phone.** Tables have at most three columns; Task 4 Step 4 screenshots one table at 390px wide.
4. **The hidden “strong answer” leaks into the card summary or search.** Rewrites use `REVEAL`; Task 3 Step 4 checks the collapsed summary.
5. **Diagram text overflows its box in one theme.** Task 1 Step 3 checks both themes.

---

### Task 1: Diagrams (`scripts/study/dg-bh.mjs`)

**Files:**
- Create: `scripts/study/dg-bh.mjs`

**Interfaces:**
- Produces: `export const BH = { star, storyBank, aboutYou, conflict, probes }` and `export default BH`; each value is an HTML string from `wrap(...)`.

- [ ] **Step 1: Run the acceptance check to see it fail**

Run: `node scripts/study/check-guide.mjs behavioural --min 45`
Expected: `check-guide behavioural: FAIL` and `guide not found: app/behavioural/content.json`

- [ ] **Step 2: Write the five diagrams in `scripts/study/dg-bh.mjs`**

| Key | viewBox | Content | Caption (aria-label) |
|---|---|---|---|
| `star` | `0 0 900 220` | One horizontal bar split into four segments with widths in proportion 10 : 10 : 60 : 20, labelled Situation, Task, Action, Result (Action in style `a`, Result in `g`). Under each: “one sentence”, “your responsibility”, “what you did, step by step”, “a number, and what you learned”. Footer line: “Most answers fail by spending the time on the situation.” | The STAR structure with most of the time given to the action |
| `storyBank` | `0 0 900 300` | A grid: six rows (Story 1 to Story 6, each with a short generic label such as “Migration under deadline”, “Production incident”, “Disagreement on approach”, “Mentoring a junior”, “Project that slipped”, “Process I improved”) by five columns (Ownership, Conflict, Leadership, Failure, Learning). Mark two or three cells per row with a filled accent square. Footer: “Six stories, told from different angles, cover most questions.” | A story bank matrix mapping six stories to five competencies |
| `aboutYou` | `0 0 900 200` | Three boxes in a row joined by arrows: Present (“what you do now, with the stack”), Past (“two roles that led here, one result each”), Future (“why this role”). A bracket under all three: “60 to 90 seconds”. | The present, past, future structure for “tell me about yourself” |
| `conflict` | `0 0 900 210` | Five boxes in a row: Listen, Restate their view, Bring evidence, Decide together, Follow up. Sub-labels one short phrase each. Footer: “The other person should sound reasonable in your story.” | Five steps for telling a conflict story |
| `probes` | `0 0 900 260` | A funnel of four stacked boxes narrowing downwards: “Your answer”, “What exactly did YOU do?”, “Why that, and not the alternative?”, “What would you do differently?”. Right-hand note: “Prepare one level deeper than you plan to say.” | The follow-up questions an interviewer uses to probe a story |

- [ ] **Step 3: Check the diagrams in both themes**

Run: `node scripts/study/preview-diagrams.mjs dg-bh`
Expected: `5 diagram(s) -> ...\.diagram-preview.html`. Open the file in a browser (or screenshot it with Playwright from `node_modules`), switch theme with the button, and confirm no text crosses a box edge and no label sits on an arrow. Fix coordinates until both themes are clean.

- [ ] **Step 4: Commit**

```bash
git add scripts/study/dg-bh.mjs
git commit -m "Add diagrams for the behavioural guide"
```

---

### Task 2: Content, part A (`scripts/study/bh-content-a.mjs`): method, your story, ownership, collaboration

**Files:**
- Create: `scripts/study/bh-content-a.mjs`

**Interfaces:**
- Consumes: `BH` from `./dg-bh.mjs`; the kit from `./cc-kit.mjs`.
- Produces: `export const Q`, `export const method, aboutYou, ownership, collaboration` (arrays of cards).

- [ ] **Step 1: Define the question-card helper `Q` and export it**

```js
// One behavioural question. `example` is a fictional STAR answer; `followUps` are what comes next.
export const Q = (title, { checking, shape, example, avoid, followUps }) => K(title,
  P('**What they are checking:** ' + checking),
  P('**Shape of a strong answer:**'), N(...shape),
  T(['', 'A worked example (fictional)'], [['**Situation**', example.s], ['**Task**', example.t], ['**Action**', example.a], ['**Result**', example.r]]),
  P('Replace this with a real story of your own. An invented one does not survive the first follow-up.'),
  TRAP(avoid),
  P('**Expect next:**'), L(...followUps));
```

- [ ] **Step 2: Write section `method` (5 cards, id `bh1`)**

1. “What are behavioural interviews for, and what do interviewers score?” Table of five signals (ownership, collaboration, judgement, growth, communication) with what evidence shows each.
2. `DIAGRAM("The STAR structure", BH.star, ...)` plus the rule: situation and task 20%, action 60%, result 20%; say “I”, give one number.
3. `DIAGRAM("Build a story bank, not a script per question", BH.storyBank, ...)` plus how to pick six to eight stories and tag each with competencies.
4. “How long should an answer be, and how do you handle follow-ups?” 90 seconds to two minutes; stop and let them probe; include `BH.probes`.
5. `QUIZ`: which part of STAR should take most of the answer (Action).

- [ ] **Step 3: Write section `aboutYou` (6 cards, id `bh2`)**

Plain `K` cards for 1 and 2 (they are structure, not stories), `Q` cards for 3 to 5, then the rapid-fire:

1. “Tell me about yourself.” with `BH.aboutYou`, a 75-second fictional example, and what to leave out.
2. “Walk me through your CV.” Reverse-chronological with one thread; one line per old role.
3. `Q` “Why do you want this role, and why this company?”
4. `Q` “Why are you leaving your current job?”
5. `Q` “Tell me about a project you are proud of.”
6. `RAPID("Rapid-fire: introducing yourself", ...)` with six one-line answers (how long, what to end on, contract roles, career gaps, switching stack, what not to say about a former employer).

- [ ] **Step 4: Write section `ownership` (7 cards, id `bh3`)**

`Q` cards: a tight deadline; working with unclear requirements; a project that slipped or failed; a production incident you handled; going beyond your role; competing priorities; then `QUIZ` (a result without a number: what is missing).

- [ ] **Step 5: Write section `collaboration` (7 cards, id `bh4`)**

First card `DIAGRAM("How to tell a conflict story", BH.conflict, ...)`. Then `Q` cards: a disagreement with a teammate about a technical choice; disagreeing with your manager or a product decision; a difficult stakeholder; giving hard feedback; receiving critical feedback; then `RAPID("Rapid-fire: working with people", ...)`.

- [ ] **Step 6: Syntax-check the module**

Run: `node -e "import('./scripts/study/bh-content-a.mjs').then(m => console.log(m.method.length, m.aboutYou.length, m.ownership.length, m.collaboration.length))"`
Expected: `5 6 7 7`

- [ ] **Step 7: Commit**

```bash
git add scripts/study/bh-content-a.mjs
git commit -m "Add behavioural guide content: method, introductions, ownership, collaboration"
```

---

### Task 3: Content, part B (`scripts/study/bh-content-b.mjs`): leadership, growth, judgement, tricky questions, practice

**Files:**
- Create: `scripts/study/bh-content-b.mjs`

**Interfaces:**
- Consumes: `Q` from `./bh-content-a.mjs`; the kit, including `REVEAL`.
- Produces: `export const leadership, growth, judgement, tricky, practice`.

- [ ] **Step 1: Write `leadership` (6 cards, id `bh5`)**

`Q` cards: leading a project without formal authority; mentoring someone; a decision that was unpopular; helping someone who was struggling; delegating something you could do faster yourself; then `QUIZ` (which answer shows leadership: the one with a person, a problem and an outcome).

- [ ] **Step 2: Write `growth` (6 cards, id `bh6`)**

`Q` cards: your biggest failure; a mistake that reached production; your biggest weakness; learning something quickly; feedback that changed how you work; then `RAPID("Rapid-fire: failure and growth", ...)`.

- [ ] **Step 3: Write `judgement` (5 cards, id `bh7`)**

`Q` cards: trading speed against quality; pushing back on a requirement; being asked to cut a corner you thought was unsafe; using AI-generated code responsibly (who is accountable, how you verified); then `QUIZ`.

- [ ] **Step 4: Write `tricky` (6 cards, id `bh8`)**

Plain `K` cards with a table of “say / do not say”: short tenures and gaps; salary expectations; “why should we hire you?”; “where do you see yourself in five years?”; questions to ask them (by interviewer type); then `RAPID("Rapid-fire: closing questions", ...)`.

- [ ] **Step 5: Write `practice` (5 cards, id `bh9`)**

Cards 1 to 3 are rewrites titled “Rewrite: …” (a vague teamwork answer; a failure answer that blames others; a conflict answer with no outcome). Each shows the weak answer in a `SAMPLE`, asks the reader to say what is wrong, then `REVEAL("Show what is wrong and a stronger version", ...)` with the diagnosis as bullets and the stronger answer in a `SAMPLE`. Card 4: “What are the red flags interviewers write down?” (list of eight). Card 5: `RAPID("Rapid-fire: the day before", ...)`, a checklist.

- [ ] **Step 6: Syntax-check**

Run: `node -e "import('./scripts/study/bh-content-b.mjs').then(m => console.log(m.leadership.length, m.growth.length, m.judgement.length, m.tricky.length, m.practice.length))"`
Expected: `6 6 5 6 5`

- [ ] **Step 7: Commit**

```bash
git add scripts/study/bh-content-b.mjs
git commit -m "Add behavioural guide content: leadership, growth, judgement, closing, practice"
```

---

### Task 4: Builder, registration and verification

**Files:**
- Create: `scripts/study/add-behavioural-guide.mjs`, `app/behavioural/page.tsx`
- Modify: `app/page.tsx` (the `practice` group in `GROUPS`, and the `lucide-react` import), `app/sitemap.ts` (`GUIDES`), `scripts/study/build-index.mjs` (`PAGES`)
- Generated by the commands below, and committed: `app/behavioural/content.json`, `public/study/behavioural.html`, `public/search-index.json`, `app/lib/studyMeta.json`, `scripts/study/freshness-state.json`, `docs/freshness/*`

- [ ] **Step 1: Write the builder `scripts/study/add-behavioural-guide.mjs`**

Same shape as `scripts/study/add-architecture-guide.mjs`. Sections, in order: `quickref` “Quick Reference” (empty, filled by `H.regenQuickRef(data)`), `bh1` “1. How Behavioural Interviews Work”, `bh2` “2. Introducing Yourself”, `bh3` “3. Ownership and Delivery”, `bh4` “4. Collaboration and Conflict”, `bh5` “5. Leadership and Mentoring”, `bh6` “6. Failure, Growth and Self-Awareness”, `bh7` “7. Judgement and Values”, `bh8` “8. Tricky and Closing Questions”, `bh9` “9. Practice: Rewrite the Answer”. `H.newPage` config: `key: 'behavioural'`, `title: 'Behavioural Interviews: Interview Prep'`, `brand: 'Behavioural Interviews'`, `brandSub: 'STAR stories that hold up'`, `h1: 'Behavioural interviews'`, `eyebrow: 'Prep guide'`, and a two-sentence `lede` saying what the guide is and that the examples are fictional. Final log line: `behavioural guide written: N sections, M cards`.

- [ ] **Step 2: Build and run the acceptance check**

Run: `node scripts/study/add-behavioural-guide.mjs && node scripts/study/check-guide.mjs behavioural --min 45 --sections bh1:5,bh2:6,bh3:7,bh4:7,bh5:6,bh6:6,bh7:5,bh8:6,bh9:5`
Expected: `behavioural guide written: 10 sections, ...` then `check-guide behavioural: OK (53 cards in 9 sections)`. Fix every problem it lists (a title that exists in another guide is renamed here).

- [ ] **Step 3: Register the guide**

- `app/behavioural/page.tsx`: copy `app/architecture/page.tsx`; title `Behavioural Interviews`, `src="/study/behavioural.html"`, a one-sentence description.
- `app/page.tsx`: add `MessagesSquare` to the `lucide-react` import; add to the `practice` group, first in its `guides` array: `{ slug: 'behavioural', title: 'Behavioural Interviews', desc: 'A STAR question bank by competency: what each question checks, the shape of a strong answer, a worked example and the follow-ups to expect.', icon: MessagesSquare }`. Change that group's `blurb` to `'Say it and write it, not just read it.'`.
- `app/sitemap.ts`: add `['behavioural', 0.8]` to `GUIDES`.
- `scripts/study/build-index.mjs`: add `behavioural: 'Behavioural'` to `PAGES`.

- [ ] **Step 4: Full build, tests, and a phone-width look**

Run: `npm run study:build && npm run build && npm test`
Expected: output includes `PASS behavioural: card/section counts match studyMeta` and ends `ALL CHECKS PASSED`.

Then start `npx next start -p 3011`, open `http://localhost:3011/behavioural` at 390px wide, open one `Q` card and one “Rewrite:” card. Confirm the table fits without sideways page scroll, the rewrite's strong version is hidden until opened, and the collapsed card summary does not contain the strong version. Stop the server.

- [ ] **Step 5: Confirm every example card carries the “replace this” line**

Run: `node -e "import('./scripts/study/lib.mjs').then(async l => { const { data } = await l.load('behavioural'); const ex = data.flatMap(s => s.questions).filter(q => q.a.includes('A worked example (fictional)')); console.log(ex.length, ex.every(q => q.a.includes('Replace this with a real story of your own'))); })"`
Expected: a count of at least 25, then `true`.

- [ ] **Step 6: Record the guide in the freshness tool and commit**

```bash
npm run study:freshness -- --mark behavioural
npm run study:freshness
git add app/behavioural app/page.tsx app/sitemap.ts app/lib/studyMeta.json public/study public/search-index.json scripts/study docs/freshness
git commit -m "Add the Behavioural Interviews guide"
```
