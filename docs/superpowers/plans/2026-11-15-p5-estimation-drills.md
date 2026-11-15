# P5: Estimation Drills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/drills`: capacity, latency and availability questions whose numbers change every time, so the reader practises the arithmetic of a system-design interview and not a memorised answer.

**Architecture:** Twelve templates in a pure module (`app/lib/drills.mjs`). Each template picks its numbers from fixed lists with a seeded generator and solves them with one formula, returning the prompt, the answer, its unit and the worked steps. A client page runs sessions of eight, grades an answer by how close it is, and keeps per-template results in `localStorage` so weaker templates come up more often.

**Tech Stack:** Next.js 16, React 19, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (feature 6). Requires P0.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- Units are decimal and stated in every prompt: 1 KB = 1,000 bytes, 1 MB = 1,000,000, 1 GB = 10⁹, 1 TB = 10¹². A day is 86,400 seconds, a 30-day month 43,200 minutes, a year 525,600 minutes.
- Grading by relative error against the exact answer: within 10% `exact`, within 50% `close`, otherwise `off`; unparseable input `invalid`. Copy: `Right.`, `Close enough for an interview: the exact figure is X.`, `Off: the answer is X.`, `Enter a number, for example 6900 or 6.9k.`
- The prompt names the unit; the reader types a number only. Accepted forms: `6944`, `6,944`, `6.9k`, `1.2M`, `3B` or `3G`, `2T`, `1e6`, `9.56%`. Anything else is invalid.
- A session is 8 drills from 8 different templates. The clock counts up per drill and is shown, not enforced; 90 seconds is marked as the target.
- Worked steps show the mental-arithmetic route with rounded figures (for example “86,400 ≈ 10⁵”), then the exact figure.
- The “Numbers to know” panel takes its figures from the existing guides, not from memory: read the numbers card in `performance-optimization` (`node -e` over `lib.load`) and link to it.

## The twelve templates (exact formulas and one fixed example each)

| id | Question | Picks | Answer and unit | Example |
|----|----------|-------|-----------------|---------|
| `qps-peak` | peak requests per second | DAU `D` ∈ {1M, 5M, 10M, 50M, 100M}; actions per user per day `a` ∈ {5, 10, 20, 50}; peak factor `p` ∈ {2, 3, 5} | `D·a/86400·p` req/s | 10M, 20, 3 → 6944.4 |
| `storage-year` | storage for one year | writes per day `W` ∈ {1M, 10M, 100M}; record size `S` ∈ {200 B, 1 KB, 5 KB}; copies `r` ∈ {1, 3} | `W·S·365·r / 10¹²` TB | 10M, 1 KB, 3 → 10.95 |
| `bandwidth` | outbound bandwidth | `q` ∈ {500, 2000, 10000} req/s; response `s` ∈ {2 KB, 50 KB, 1 MB} | `q·s·8 / 10⁶` Mbps | 2000, 50 KB → 800 |
| `cache-memory` | memory to cache the hot set | items `N` ∈ {10M, 100M, 1B}; item size ∈ {500 B, 1 KB, 2 KB}; hot share ∈ {10%, 20%} | `N·share·size / 10⁹` GB | 100M, 1 KB, 20% → 20 |
| `servers` | servers needed at peak | peak ∈ {5000, 20000, 100000} req/s; per-server capacity ∈ {500, 1000, 2000}; target utilisation ∈ {50%, 70%} | `ceil(peak / (capacity·utilisation))` servers | 20000, 1000, 70% → 29 |
| `latency` | total latency | 3 or 4 calls from {20, 40, 80, 120, 200} ms; mode ∈ {sequential, parallel}; own work 10 ms | sum or max, plus 10, in ms | [40, 120, 80]: sequential 250, parallel 130 |
| `tail-fanout` | chance a request hits at least one slow call | fan-out `n` ∈ {5, 10, 20, 50, 100}, each call slow 1% of the time | `(1 − 0.99ⁿ)·100` % | 10 → 9.56 |
| `avail-serial` | downtime per 30-day month for components in series | `n` ∈ {2, 3, 4}; each ∈ {99.9, 99.95, 99.99}% | `(1 − Πaᵢ)·43200` minutes | 3 × 99.9% → 129.5 |
| `avail-pair` | downtime per year for two independent replicas | each ∈ {99, 99.5, 99.9}% | `(1 − a)²·525600` minutes | 99% → 52.56 |
| `queue-drain` | time to drain a backlog | backlog ∈ {1M, 5M, 20M}; arrivals ∈ {500, 1000, 2000}/s; consumers ∈ {4, 8, 16}; each ∈ {200, 500}/s | `backlog / (consumers·rate − arrivals) / 60` minutes; re-pick until consumers·rate > arrivals | 5M, 1000, 8, 200 → 138.9 |
| `read-replicas` | replicas needed for reads | reads ∈ {10000, 40000, 100000}/s; cache hit ratio ∈ {0, 80, 90, 95}%; per replica ∈ {2000, 5000}/s | `ceil(reads·(1 − hit) / perReplica)` replicas | 40000, 90%, 2000 → 2 |
| `id-exhaust` | days until a 32-bit counter runs out | ids per second ∈ {1000, 10000, 100000} | `2³² / rate / 86400` days | 10000 → 4.97 |

## Review Focus

1. **An answer typed with a unit or words** (`130 ms`, `about 7k`). `invalid`, with the example text; never read `m` in `ms` as a million. Pinned in Task 1.
2. **Small whole-number answers** (2 replicas): 10% of 2 is less than one, so only 2 is `exact` and 3 is `close`. Pinned in Task 1.
3. **A template that can produce a zero or negative divisor** (`queue-drain`). The picker re-picks; the solver throws on such input. Pinned in Task 1.
4. **Stored stats in an old or broken shape.** Treated as empty. Pinned in Task 1.
5. **The reader presses Enter twice, or submits after the answer is shown.** The second submit moves to the next drill and never grades twice. Pinned in Task 2.

---

### Task 1: Templates, parsing and grading (pure logic)

**Files:**
- Create: `app/lib/drills.mjs`, `tests/unit/drills.test.mjs`

**Interfaces:**
- Consumes: `mulberry32`, `shuffle` from `app/lib/bank.mjs`.
- Produces:
  - `/** @typedef {{id: string, title: string, pick: (rng: () => number) => object, solve: (params: object) => {prompt: string, answer: number, unit: string, steps: string[]}}} Template */`
  - `TEMPLATES: Template[]` — the twelve above, in table order.
  - `/** @typedef {{id: string, params: object, prompt: string, answer: number, unit: string, steps: string[]}} Drill */`
  - `makeSession(seed: number, stats?: Stats): Drill[]` — 8 drills from 8 different templates; a template’s weight is `1 + min(3, seen − exact)` from `stats`; weighted sampling without replacement with one generator.
  - `parseAmount(text: string): number | null` — the accepted forms above (`k` 10³, `M`/`m` 10⁶, `B`/`G` 10⁹, `T` 10¹², case-insensitive except that the suffix must be the last character before an optional `%`).
  - `grade(text: string, drill: Drill): 'exact' | 'close' | 'off' | 'invalid'`
  - `formatAmount(n: number): string` — up to 3 significant figures below 1,000 (`9.56`, `138.9` → `139`, `29`), thousands separators above (`6,944`).
  - `/** @typedef {{[id: string]: {seen: number, exact: number, close: number}}} Stats */`, `readStats(storage): Stats`, `recordResult(storage, id: string, result: string): Stats`; key `study-drills-v1`.

- [ ] **Step 1: Write the failing tests** `tests/unit/drills.test.mjs`:
  - for every row of the table, `TEMPLATES.find(id).solve(exampleParams).answer` is within 0.01 of the example (both `latency` modes), `unit` is the table’s unit, `prompt` contains each picked number in readable form, and `steps` has at least two lines;
  - for seeds 1 to 200, every drill of `makeSession(seed)` has a finite positive `answer`, and a session has 8 distinct template ids; `makeSession(5)` twice is identical;
  - `solve` for `queue-drain` with consumers·rate ≤ arrivals throws;
  - `parseAmount`: `'6944'` 6944, `'6,944'` 6944, `'6.9k'` 6900, `'1.2M'` 1200000, `'3B'` 3e9, `'3G'` 3e9, `'2T'` 2e12, `'1e6'` 1e6, `'9.56%'` 9.56, `' 29 '` 29; `null` for `'130 ms'`, `'about 7k'`, `''`, `'k'`, `'1.2.3'`;
  - `grade` against an answer of 100: `'100'`, `'109'`, `'91'` exact; `'111'`, `'150'`, `'51'` close; `'151'`, `'49'` off; `'x'` invalid; against an answer of 2: `'2'` exact, `'3'` close, `'4'` off;
  - over seeds 1 to 200, `servers` appears in at least 20 more sessions with stats `{ servers: { seen: 5, exact: 1, close: 0 } }` than with no stats;
  - `readStats` with bad JSON is `{}`; `recordResult` adds to `seen` and to `exact` or `close`.
- [ ] **Step 2: Run** `npm run test:unit` — FAIL. **Step 3: Implement.** **Step 4: Run** — pass.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add estimation drill templates, parsing and grading"`

---

### Task 2: The page

**Files:**
- Create: `app/drills/page.tsx`, `app/drills/DrillsClient.tsx`, `tests/checks/15-drills.mjs`
- Modify: `app/lib/tools.mjs` (`drills` → `ready: true`)

**Interfaces:** Consumes Task 1 and `ToolShell`, `seedFrom`. Produces `/drills` and `/drills?seed=<text>` (a fixed session; read from `window.location.search` in an effect).

Screen: `Drill n of 8` and a count-up clock (`0:42`, with `target 1:30` beside it); the prompt; one text input labelled `Your answer in <unit>` and a `Check` button (Enter submits); after checking, the grade line, the worked steps as a numbered list, and `Next drill` (Enter again moves on). After the eighth: a summary (`5 right, 2 close, 1 off`, the slowest drill, a row per template tried with its all-time record) and `Another session`. A collapsible `Numbers to know` panel is on every screen, with a link to the performance guide’s card.

- [ ] **Step 1: Write the failing check** `tests/checks/15-drills.mjs`: in Node build `makeSession(seedFrom('check'))`; in the browser open `${base}/drills?seed=check` and assert the prompt equals drill 1’s prompt; type the answer as a plain number (`String(Math.round(answer))`, or `answer.toFixed(2)` when it is under 10) → `Right.` and at least two steps are listed; press Enter → `Drill 2 of 8`; type `130 ms` → the invalid message and the drill is not graded; type ten times the answer → `Off:`; finish the remaining drills with correct answers → the summary shows `7 right, 0 close, 1 off`; `localStorage['study-drills-v1']` has 8 template ids with `seen: 1`; no `pageerror`.
- [ ] **Step 2: Run** `npm run build && npm test` — `15-drills` FAILS. **Step 3: Implement the page.**
- [ ] **Step 4: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`. Look at the page at 375px and 1280px in both themes.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the estimation drills page"`

---

### Task 3: Link it from the guides

- [ ] **Step 1:** Add a `GO(['/drills', 'Estimation drills'])` line to the capacity-estimation card of `system-design-scale` and the numbers card of `performance-optimization` using a small one-off script with `H.appendHtml` (find the cards with `findCard`; print their titles first and name them in the commit body). Run `npm run study:build`. Add `/drills` to the root `README.md`.
- [ ] **Step 2: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "Link the estimation drills from the design guides"`
