# Testing Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Testing guide at `/testing`: about 55 cards on test strategy, unit testing, React Testing Library, MSW, Playwright, back-end testing in Node.js, CI, and interview scenarios, with every code sample executed against current library versions.

**Architecture:** A DevSpar study guide is one generated `app/<slug>/content.json`, built by a script from content modules with the toolkit in `scripts/study/`. This plan first creates a small test lab outside the repository (a Vite + React project with the test libraries installed) so that each sample is run before it is written into a card; then a diagram module, three content modules and a builder; then registers the guide.

**Tech Stack:** Vitest, React Testing Library, user-event, MSW, Playwright, supertest and `node:test` in the lab (installed in the lab folder, not in the repo); the `scripts/study` toolkit; Next.js 16 for the route wrapper.

**Spec:** `docs/superpowers/specs/2026-11-14-three-new-guides.md`

## Global Constraints

- Work in `C:\Users\abhilashsandi\Documents\projects\merge-csvs`. Commit after each task. Never push. Never touch `private/`.
- Read `scripts/study/README.md` first. Copy patterns from `scripts/study/add-architecture-guide.mjs`, `scripts/study/dg-arch.mjs` and `scripts/study/bug-content-a.mjs` (the `BUG` helper, which this plan reuses).
- Never edit `app/*/content.json` or `public/study/*` by hand.
- Authoring kit, all from `./cc-kit.mjs`: `P`, `L`, `N`, `T(headRow, rows)`, `C(code, label?)`, `SAY`, `TRAP`, `K(title, ...parts)`, `GO([href, label], ...)`, `RAPID(title, pairs)`, `QUIZ(question, options[4], rightIndex, why)`, `DIAGRAM(title, svg, ...parts)`, `NOTE(text)`, `SAMPLE(label, text)`, `REVEAL(summary, ...parts)`, `md`. `BUG(title, symptom, buggyCode, why, fixedCode, say?)` comes from `./bug-content-a.mjs`.
- Kit text markup: `` `code` `` and `**bold**`; everything else is escaped. Double-quoted strings; typographic quotes (“ ”) inside text. Code goes in `C(...)` using template literals (escape backticks and `${` inside them).
- Style: second person, plain sentences, British spelling. No " — " separators. Say the trade-off.
- **Versions are looked up, not remembered.** On 14 Nov 2026 `npm view` reported: vitest 5.1.0, jest 30.5.2, @testing-library/react 16.3.3, @testing-library/user-event 14.6.10, msw 3.0.5, @playwright/test 1.65.1, cypress 16.3.0, supertest 7.3.2, testcontainers 12.2.1, jsdom 31.0.1. Re-run `npm view <pkg> version` at the start. For each library, before writing its cards, read its current docs with the `ctx7` CLI (`npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; at most three commands per question). MSW's API changed between major versions: use whatever the version-3 docs show, never a remembered `rest.get`.
- **Every code sample runs.** A sample goes into a card only after it has passed (or, for a deliberately failing example, failed with the message the card quotes) in the lab. Quote failure messages from the real output.
- The lab lives in the session scratch directory, not in the repo. The repo gets no new dependency.
- Diagrams: `wrap('0 0 900 H', body, caption)`; helpers `box`, `txt`, `arrow`, `rect`, `line`, `M` from `./dg.mjs`; colours only through styles `'n' | 'a' | 'g' | 'd'` and text colours `'text' | 'muted' | 'accent' | 'gold' | 'danger'`; monospace about 6.3px per character at size 10.5, bold sans size 12 about 6.8px per character; text fits its box with 8px to spare.
- Reuse `CS.trophy` from `./dg-cs.mjs` for the testing trophy.
- Existing cards to link to, not repeat: the Testing section of `/interview-prep`, the `testing` section of `/interview-cheatsheet`, and the RTL cards in `/react-training`. Use `GO(...)`.
- Acceptance commands: `node scripts/study/check-guide.mjs testing --min 55 --sections te1:7,te2:7,te3:9,te4:6,te5:9,te6:7,te7:6,te8:6` prints `check-guide testing: OK`; `npm run study:build && npm run build && npm test` ends `ALL CHECKS PASSED`.

## Review Focus

1. **A sample uses an API from an older major version** (MSW `rest`, Jest-only globals in a Vitest file, `@testing-library/react-hooks`). The lab run fails on these; no sample is written before it passes.
2. **A test in a card passes for the wrong reason** (asserting on a mock, no assertion after an await). Each “mistake” card is a `BUG` card whose buggy version is shown to pass or fail in the lab exactly as the card says.
3. **A title collides with an existing testing card** in `interview-prep`, `interview-cheatsheet` or `react-training`. `check-guide` fails; rename the new card.
4. **A hidden fix leaks into the summary.** `BUG` uses a closed `<details>`; Task 6 checks one in the browser.
5. **Version claims go stale.** The guide carries one dated `NOTE` with the versions used, and Task 6 adds the libraries to the freshness tracker.

---

### Task 1: The test lab (outside the repo)

**Files:**
- Create (in the session scratch directory, `$LAB`): `$LAB/test-lab/` with `package.json`, `vite.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `src/`, `tests/`, `e2e/`, `api/`

**Interfaces:**
- Produces: `npx vitest run <file>` (jsdom), `npx playwright test <file>` (against the lab's dev server), `node --test api/` in `$LAB/test-lab`.

- [ ] **Step 1: Create the project and install current versions**

```bash
npm create vite@latest test-lab -- --template react-ts
cd test-lab
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw @playwright/test @axe-core/playwright supertest express
npx playwright install chromium
npm ls vitest @testing-library/react @testing-library/user-event msw @playwright/test --depth=0
```
Record the versions printed by the last command; the guide's `NOTE` cites them.

- [ ] **Step 2: Configure and prove each runner works**

Configure Vitest for jsdom with a setup file that loads `@testing-library/jest-dom` matchers and starts, resets and closes an MSW server (use the version-3 setup from the docs). Configure Playwright with a `webServer` that starts `npm run dev`. Add three smoke tests: a Vitest unit test of a pure function, an RTL test that renders a button and clicks it, a Playwright test that loads the page and checks the heading.

Run: `npx vitest run && npx playwright test`
Expected: all pass.

- [ ] **Step 3: Add the components and API the samples will test**

In `src/`: `Counter` (button increments), `LoginForm` (email, password, validation messages, calls `onSubmit`, shows a server error), `UserList` (fetches `/api/users`, loading, empty and error states), `useDebounce` hook, `SearchBox` (debounced fetch). In `api/`: an Express app factory `createApp(deps)` with `GET /users/:id` (404 when missing) and `POST /orders` (validates, returns 201), with the data access passed in so it can be faked. No commit: the lab is not part of the repository.

---

### Task 2: Diagrams (`scripts/study/dg-test.mjs`)

**Files:**
- Create: `scripts/study/dg-test.mjs`

**Interfaces:**
- Produces: `export const TE = { levels, doubles, queryLadder, mswFlow, playwright, pipeline, flaky }`, `export default TE`.

- [ ] **Step 1: Run the acceptance check to see it fail**

Run: `node scripts/study/check-guide.mjs testing --min 55`
Expected: `check-guide testing: FAIL`, `guide not found: app/testing/content.json`

- [ ] **Step 2: Write the seven diagrams**

| Key | viewBox | Content | Caption |
|---|---|---|---|
| `levels` | `0 0 900 280` | Four rows (static analysis, unit, integration, end-to-end), each with three cells: what it runs (types and lint; one function or component; several units with a fake network; the real app in a browser), speed (instant, milliseconds, tens of milliseconds, seconds), what it proves. Integration row in accent. | The four levels of testing: what each runs, how fast, and what it proves |
| `doubles` | `0 0 900 230` | Four boxes side by side: Stub (returns canned answers), Spy (records calls, real behaviour kept), Mock (records calls, behaviour replaced, assertions on calls), Fake (a working lightweight implementation, such as an in-memory repository). One example line under each. | Four kinds of test double: stub, spy, mock and fake |
| `queryLadder` | `0 0 900 260` | A ladder, most preferred at the top: `getByRole` (with name), `getByLabelText`, `getByPlaceholderText` / `getByText`, `getByAltText` / `getByTitle`, `getByTestId` (last resort). Right-hand note: “If you cannot find it by role, a screen-reader user cannot either.” | The order in which to choose a Testing Library query |
| `mswFlow` | `0 0 900 240` | Component → `fetch('/api/users')` → MSW intercepts at the network layer → handler returns a response → component renders. A crossed-out box “real server” to the right. Footer: “The component, the data layer and fetch all run for real.” | How MSW intercepts a request at the network layer in a test |
| `playwright` | `0 0 900 250` | Test runner (parallel workers) → Browser → isolated Browser Context per test → Page. Beneath: the auto-wait checklist a click performs (attached, visible, stable, enabled, receives events). | Playwright’s runner, browser contexts and auto-waiting |
| `pipeline` | `0 0 900 220` | Five stages left to right with typical time budgets: types and lint, unit, integration, end-to-end, deploy with smoke test. Label: “fail fast: cheapest checks first”. | A CI pipeline ordered from the cheapest check to the most expensive |
| `flaky` | `0 0 900 260` | A centre box “Flaky test” with six causes around it: fixed sleeps, shared state between tests, real time and dates, real network, test order dependence, animations and races. One-word fix under each. | Six common causes of a flaky test and the fix for each |

- [ ] **Step 3: Check the diagrams in both themes**

Run: `node scripts/study/preview-diagrams.mjs dg-test`
Expected: `7 diagram(s) -> …`. Open, flip the theme, fix any overflow or label on an arrow.

- [ ] **Step 4: Commit**

```bash
git add scripts/study/dg-test.mjs
git commit -m "Add diagrams for the Testing guide"
```

---

### Task 3: Content, part A (`scripts/study/test-content-a.mjs`): strategy, unit testing, React Testing Library

**Files:**
- Create: `scripts/study/test-content-a.mjs`; lab tests under `$LAB/test-lab/tests/a-*`

**Interfaces:**
- Consumes: `TE`, `CS.trophy`, `BUG`, the kit.
- Produces: `export const strategy, unit, rtl`.

- [ ] **Step 1: Write and pass the lab tests this task's cards quote**

Vitest: arrange-act-assert on a pure function; `test.each`; `vi.fn` and `vi.spyOn`; `vi.mock` of a module; fake timers for `useDebounce`; an async test with a rejected promise; a snapshot test. RTL: `Counter` by role; `LoginForm` filled with `userEvent`, validation messages, `onSubmit` called with the values; `findBy` for async content; `queryBy` for absence; a custom `render` with providers; `renderHook` for `useDebounce`. Four deliberately wrong tests for the `BUG` cards in Step 4, each run to confirm how it behaves.

Run: `npx vitest run tests/a-*`
Expected: all pass, except the files named `*.buggy.test.tsx`, whose behaviour is recorded.

- [ ] **Step 2: Write `strategy` (7 cards, id `te1`)**

1. “What is testing for, and how do you decide what to test?” (confidence per cost; risk first)
2. `DIAGRAM("The levels of testing", TE.levels, …)` with `CS.trophy` and why integration tests carry most of the weight for UI.
3. `DIAGRAM("Stub, spy, mock or fake?", TE.doubles, …)`
4. “What should you not test?” (implementation details, third-party code, private functions; the refactor test)
5. “What does code coverage tell you, and what does it not?”
6. `DIAGRAM("Why tests go flaky", TE.flaky, …)`
7. `QUIZ`: a test that breaks on a refactor that did not change behaviour is testing what (implementation details).

- [ ] **Step 3: Write `unit` (7 cards, id `te2`)**

1. “What does a good unit test look like?” (arrange, act, assert; one reason to fail; the name states the behaviour)
2. “How do you mock a function, a module and a timer?” (the three lab samples)
3. “How do you test asynchronous code?” (await, rejections, the missing-await trap)
4. “When are snapshot tests useful, and when are they a liability?”
5. “How do you run one test over many inputs?” (`test.each`)
6. “Vitest, Jest or `node:test`?” (table: speed, ESM and TypeScript support, ecosystem, when each fits; from the docs, with a dated `NOTE` and versions)
7. `RAPID("Rapid-fire: unit testing", …)`

- [ ] **Step 4: Write `rtl` (9 cards, id `te3`)**

1. “What is the idea behind React Testing Library?” (test what the user sees and does)
2. `DIAGRAM("Which query should you use?", TE.queryLadder, …)` with the `getBy` / `queryBy` / `findBy` table.
3. “`userEvent` or `fireEvent`?”
4. “How do you test a form?” (the `LoginForm` sample)
5. “How do you test UI that appears asynchronously?” (`findBy`, `waitFor`, and what `act` is)
6. “How do you test a custom hook, and a component that needs providers?”
7. `BUG` “A test passes even though the feature is broken” (an assertion placed after an un-awaited `findBy`, or a `waitFor` with no assertion: use whichever the lab confirms passes wrongly)
8. `BUG` “A test fails with ‘unable to find an element’ although it renders in the browser” (using `getBy` for content that arrives after a fetch)
9. `RAPID("Rapid-fire: React Testing Library", …)`

- [ ] **Step 5: Re-run and compare**

Run: `npx vitest run tests/a-*` again. Every snippet quoted in `test-content-a.mjs` must be the text of a passing lab test (or a recorded buggy one). Fix the card, never weaken the test.

- [ ] **Step 6: Commit**

```bash
git add scripts/study/test-content-a.mjs
git commit -m "Add Testing content: strategy, unit testing, React Testing Library"
```

---

### Task 4: Content, part B (`scripts/study/test-content-b.mjs`): MSW and Playwright

**Files:**
- Create: `scripts/study/test-content-b.mjs`; lab tests `$LAB/test-lab/tests/b-msw*`, `$LAB/test-lab/e2e/b-*`

**Interfaces:**
- Consumes: `TE`, `BUG`, the kit.
- Produces: `export const msw, e2e`.

- [ ] **Step 1: Write and pass the lab tests**

MSW (version-3 API from the docs): default handlers, `UserList` success; a per-test override for a 500 and for an empty list; a delayed response to assert the loading state; a handler that asserts on the request body. Playwright: locators by role and label; web-first assertions; a login flow; `storageState` reuse through a setup project; `page.route` to stub an API; a trace on failure; an axe scan; a screenshot assertion.

Run: `npx vitest run tests/b-msw* && npx playwright test e2e/b-*`
Expected: all pass.

- [ ] **Step 2: Write `msw` (6 cards, id `te4`)**

1. `DIAGRAM("Mocking at the network layer with MSW", TE.mswFlow, …)` and why it beats mocking `fetch` or the data hook.
2. “How do you set up MSW for tests?” (handlers, server lifecycle in the setup file)
3. “How do you test loading, empty and error states?” (per-test overrides)
4. “How do you test a component that uses a data-fetching library?” (a fresh query client per test, retries off)
5. “Where else is MSW useful?” (local development, Storybook; the same handlers)
6. `QUIZ`: what a test with MSW still exercises that a mocked `fetch` does not (the real request construction and response parsing).

- [ ] **Step 3: Write `e2e` (9 cards, id `te5`)**

1. “What are end-to-end tests for, and how many should you have?”
2. `DIAGRAM("How Playwright runs a test", TE.playwright, …)`
3. “Locators and auto-waiting: why should you never write a fixed sleep?”
4. “How do you sign in once and reuse it across tests?” (`storageState`, the setup project)
5. “When do you stub the network in an end-to-end test?” (`page.route`; what you lose)
6. “How do you debug a failing end-to-end test in CI?” (trace viewer, retries, video; what a retry hides)
7. “Visual regression and accessibility checks in Playwright”
8. “Playwright or Cypress?” (table from both sets of docs, with a dated `NOTE`)
9. `RAPID("Rapid-fire: end-to-end testing", …)`

- [ ] **Step 4: Re-run and compare; commit**

```bash
git add scripts/study/test-content-b.mjs
git commit -m "Add Testing content: MSW and Playwright"
```

---

### Task 5: Content, part C (`scripts/study/test-content-c.mjs`): back end, CI, interview scenarios

**Files:**
- Create: `scripts/study/test-content-c.mjs`; lab tests `$LAB/test-lab/api/*.test.mjs`

**Interfaces:**
- Consumes: `TE`, the kit.
- Produces: `export const backend, ci, scenarios`.

- [ ] **Step 1: Write and pass the lab tests**

With `node:test` and `supertest` against `createApp(deps)`: 200 and 404 for `GET /users/:id` using a fake repository; validation failure and success for `POST /orders`; a test that the handler does not leak an internal error message. One test using `node:test` mocks and one using its built-in timers.

Run: `node --test api/`
Expected: all pass.

- [ ] **Step 2: Write `backend` (7 cards, id `te6`)**

1. “How do you test an HTTP API in Node.js?” (the app factory, `supertest`, no listening port)
2. “Fake the database or use a real one?” (table; a real PostgreSQL in a container for repository tests, a fake for handler tests; cleaning up with a transaction rollback)
3. “What is a contract test, and when do you need one?” (consumer and provider; schema validation as the light version)
4. “How do you test code that publishes to or consumes from a queue?”
5. “What does Node’s built-in test runner give you?” (`node:test`, `node:assert`, mocks, coverage flag; when it is enough)
6. “How do you test error handling and timeouts?”
7. `RAPID("Rapid-fire: testing a back end", …)`

- [ ] **Step 3: Write `ci` (6 cards, id `te7`)**

1. `DIAGRAM("Tests in the pipeline", TE.pipeline, …)`
2. “The suite takes 40 minutes. How do you make it faster?” (measure, parallelise and shard, move checks down a level, cache, run affected tests)
3. “How do you manage test data?” (factories, isolation per test, seeded databases)
4. “How do you deal with a flaky test in CI?” (quarantine with an owner and a deadline, never a blanket retry)
5. “What testing happens after deployment?” (smoke tests, canaries, feature flags, synthetic monitoring)
6. `QUIZ`: which check belongs first in a pipeline (type-check and lint).

- [ ] **Step 4: Write `scenarios` (6 cards, id `te8`)**

1. “How would you test this login form?” (a worked answer: list the cases first, then one RTL test and one Playwright test from the lab)
2. “How would you test a checkout flow end to end?” (what to cover at each level, and what to leave out)
3. “You inherit a project with no tests. Where do you start?”
4. “How do you test code that an AI assistant wrote?” (tests you specify, failing first; reviewing the assertions)
5. “What is your testing strategy for a new full-stack project?” (a 60-second answer by level, with tools)
6. `RAPID("Rapid-fire: testing interview questions", …)`

Each card that overlaps another guide ends with `GO(...)` (`/interview-prep`, `/react-training`, `/bug-clinic`, `/ai-dev`).

- [ ] **Step 5: Re-run and compare; commit**

```bash
git add scripts/study/test-content-c.mjs
git commit -m "Add Testing content: back end, CI, interview scenarios"
```

---

### Task 6: Builder, registration and verification

**Files:**
- Create: `scripts/study/add-testing-guide.mjs`, `app/testing/page.tsx`
- Modify: `app/page.tsx` (the `frontend` group and the icon import), `app/sitemap.ts`, `scripts/study/build-index.mjs`, `scripts/study/freshness.mjs` (`TRACKED`)
- Generated and committed: `app/testing/content.json`, `public/study/testing.html`, `public/search-index.json`, `app/lib/studyMeta.json`, `scripts/study/freshness-state.json`, `docs/freshness/*`

- [ ] **Step 1: Write the builder**

Same shape as `add-architecture-guide.mjs`. Sections: `quickref`, `te1` “1. Test Strategy”, `te2` “2. Unit Testing”, `te3` “3. React Testing Library”, `te4` “4. Mocking the Network with MSW”, `te5` “5. End-to-End Testing with Playwright”, `te6` “6. Testing a Node.js Back End”, `te7` “7. Tests in CI and After Deployment”, `te8` “8. Interview Scenarios”. The first card of `te1` ends with a `NOTE(...)` listing the library versions every sample was run on, and the date. `H.newPage` config: `key: 'testing'`, `title: 'Testing: Interview Prep'`, `brand: 'Testing'`, `brandSub: 'strategy, RTL, MSW, Playwright'`, `h1: 'Testing'`, `eyebrow: 'Prep guide'`, a two-sentence `lede`. Log: `testing guide written: N sections, M cards`.

- [ ] **Step 2: Build and run the acceptance check**

Run: `node scripts/study/add-testing-guide.mjs && node scripts/study/check-guide.mjs testing --min 55 --sections te1:7,te2:7,te3:9,te4:6,te5:9,te6:7,te7:6,te8:6`
Expected: `check-guide testing: OK (57 cards in 8 sections)`. Rename any new card whose title already exists in another guide.

- [ ] **Step 3: Register the guide**

- `app/testing/page.tsx`: copy `app/architecture/page.tsx`; title `Testing`, `src="/study/testing.html"`.
- `app/page.tsx`: add `FlaskRound` to the `lucide-react` import; add to the `frontend` group after the `web-platform` entry: `{ slug: 'testing', title: 'Testing', desc: 'Test strategy, unit tests, React Testing Library, MSW, Playwright and back-end tests in Node.js. Every sample was run before it was written down.', icon: FlaskRound }`.
- `app/sitemap.ts`: add `['testing', 0.8]`. `scripts/study/build-index.mjs`: add `testing: 'Testing'`.
- `scripts/study/freshness.mjs`: add to `TRACKED`: `{ name: 'MSW', npm: 'msw', re: /\bMSW\s+v?(\d)\b/g }`, `{ name: 'Cypress', npm: 'cypress', re: /\bCypress\s+v?(\d{1,2})\b/g }`, `{ name: 'Testing Library', npm: '@testing-library/react', re: /\bReact Testing Library\s+v?(\d{1,2})\b/g }`.

- [ ] **Step 4: Full build, tests, and a browser check**

Run: `npm run study:build && npm run build && npm test`
Expected: includes `PASS testing: card/section counts match studyMeta`, ends `ALL CHECKS PASSED`.

Start `npx next start -p 3011`, open `http://localhost:3011/testing`, open one `BUG` card in section 3. Confirm the fix is hidden until opened and absent from the collapsed summary, and that code blocks scroll inside their own box at 390px. Stop the server.

- [ ] **Step 5: Record freshness and commit**

```bash
npm run study:freshness -- --mark testing
npm run study:freshness
git add app/testing app/page.tsx app/sitemap.ts app/lib/studyMeta.json public/study public/search-index.json scripts/study docs/freshness
git commit -m "Add the Testing guide"
```
