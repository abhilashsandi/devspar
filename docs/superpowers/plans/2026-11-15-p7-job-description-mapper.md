# P7: Job-description Mapper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/match`: the reader pastes a job posting and gets the skills it asks for, a deck of the cards that cover them, and a list of gaps (skills DevSpar does not cover, covers thinly, or covers but the reader has not reviewed).

**Architecture:** Everything runs in the browser and the posting is never sent or stored. A skills list (`app/lib/skills.mjs`) maps each skill to the words a posting uses for it and, where known, to guides or sections. A pure module finds skills in the text (longest alias first, whole words only), finds the cards for each skill in the card bank, ranks a deck, and classifies gaps by counting cards and the reader’s progress. Whether a skill is “covered” is computed from the bank, never hand-written, so it cannot go stale.

**Tech Stack:** Next.js 16, React 19, `app/lib/bank.mjs`, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-practice-and-readiness.md` (feature 8). Requires P0.

## Global Constraints

The spec’s “Rules for every plan” section applies in full. In addition:

- The posting text is held in React state only. It is not written to `localStorage`, not put in a URL, not logged. The page says, under the text box: `The posting is read in your browser. It is not sent anywhere and not saved.`
- Only the result is saved (`study-match-v1`): `{ at, skills: string[], deck: string[] }` where `deck` holds card `href`s.
- A skill is `covered` when at least 3 cards match it, `thin` with 1 or 2, `missing` with none.
- Deck limits: at most 8 cards per skill and 60 in total.
- Aliases match case-insensitively as whole terms: the character before and after must not be a letter or a digit. `java` must not match in `JavaScript`; `go` is never an alias (use `golang`, `go lang`).

## The skills list

`app/lib/skills.mjs` exports `SKILLS: {id: string, label: string, aliases: string[], guides?: string[]}[]`. `guides` entries are a slug (`sql`) or `slug:section` (`interview-prep:db`). Use exactly this list:

| id | label | aliases | guides |
|----|-------|---------|--------|
| javascript | JavaScript | javascript, js, es6, ecmascript | javascript, interview-prep:js |
| typescript | TypeScript | typescript | typescript, interview-prep:ts |
| react | React | react, react.js, reactjs, react hooks | react-training, reactjs, interview-prep:react |
| nextjs | Next.js | next.js, nextjs, next js, app router, server components | nextjs, interview-prep:nextjs |
| node | Node.js | node.js, nodejs, node js, node, express.js, expressjs, nestjs, fastify | nodejs, interview-prep:node |
| css | CSS | css, css3, sass, scss, flexbox, responsive design | tailwind-css, interview-prep:css |
| tailwind | Tailwind CSS | tailwind, tailwindcss | tailwind-css |
| a11y | Accessibility | accessibility, a11y, wcag, aria | |
| testing | Testing | testing, unit tests, unit testing, tdd, jest, vitest, react testing library | testing, interview-prep:testing |
| e2e | End-to-end testing | playwright, cypress, end-to-end, e2e | testing |
| sql | SQL and PostgreSQL | sql, postgresql, postgres, mysql, relational database, relational databases | sql, interview-prep:db |
| nosql | NoSQL | nosql, mongodb, dynamodb, document database | sql:sq8 |
| caching | Caching | redis, caching, memcached | |
| rest | REST APIs | restful, rest api, rest apis, api design, openapi, swagger | |
| graphql | GraphQL | graphql, apollo | |
| security | Auth and security | oauth, oauth2, oidc, jwt, authentication, authorisation, authorization, owasp, xss, csrf, web security | interview-prep:security, web-platform |
| system-design | System design | system design, distributed systems, scalability, high availability | system-design, system-design-scale, interview-prep:sysdesign |
| architecture | Architecture | microservices, micro-frontends, event-driven, software architecture, domain-driven design, cqrs | architecture, interview-prep:arch |
| messaging | Messaging | kafka, rabbitmq, sqs, message queue, message queues, pub/sub | |
| performance | Performance | web performance, core web vitals, web vitals, performance optimisation, performance optimization, lighthouse | performance-optimization, interview-prep:perf |
| aws | AWS | aws, amazon web services, lambda, s3, ec2, ecs, cloudfront | aws |
| azure | Azure | azure | |
| gcp | Google Cloud | gcp, google cloud | |
| docker | Docker | docker, containers, containerisation, containerization | |
| kubernetes | Kubernetes | kubernetes, k8s, helm | |
| cicd | CI/CD | ci/cd, ci cd, continuous integration, continuous delivery, github actions, jenkins, gitlab ci | |
| iac | Infrastructure as code | terraform, infrastructure as code, cloudformation, cdk | |
| git | Git | git, version control | |
| genai | Generative AI | generative ai, genai, llm, llms, rag, prompt engineering, ai agents, agentic | genai |
| ai-dev | AI-assisted development | copilot, claude code, ai-assisted, ai coding tools | ai-dev |
| state | State management | redux, zustand, state management, react query, tanstack query | |
| bundlers | Build tooling | webpack, vite, turbopack, babel | |
| realtime | Real-time | websocket, websockets, real-time, realtime, server-sent events | |
| observability | Observability | observability, monitoring, logging, datadog, opentelemetry, grafana, prometheus | |
| algorithms | Algorithms | algorithms, data structures, problem solving | coding-questions, interview-prep:coding |
| behavioural | Working with people | agile, scrum, stakeholders, mentoring, leadership, collaboration, communication skills | behavioural |
| i18n | Internationalisation | i18n, internationalisation, internationalization, localisation, localization | |
| python | Python | python, django, flask, fastapi | |
| java | Java | java, spring boot, spring framework | |
| golang | Go | golang, go lang | |
| dotnet | C# and .NET | c#, .net, dotnet, asp.net | |
| php | PHP | php, laravel | |
| ruby | Ruby | ruby, rails | |
| rust | Rust | rust | |
| angular | Angular | angular | |
| vue | Vue | vue, vue.js, nuxt | |
| svelte | Svelte | svelte, sveltekit | |
| mobile | Mobile | react native, flutter, swiftui, kotlin, ios, android | |

Aliases are chosen to avoid everyday words a posting uses in another sense: no bare `rest`, `express`, `spring`, `swift`, `cursor` or `go`. Keep to that rule when adding a skill.

## Review Focus

1. **Overlapping terms** (`React Native` contains `React`; `Java` and `JavaScript`; `Next.js` and `Node.js` with dots; `C#`, `.NET`, `CI/CD` with symbols). Longest alias wins a span, and symbols are matched literally. Pinned in Task 1.
2. **A posting with almost no technical words, or an empty box, or 50,000 characters of pasted HTML.** Clear messages, no hang: text over 20,000 characters is cut to that length with a note. Pinned in Tasks 1 and 2.
3. **A guide pointer that no longer exists** after a guide is renamed or a section id changes. A unit test over the real index fails. Pinned in Task 1.
4. **Privacy.** A check asserts that after an analysis nothing in `localStorage` or `sessionStorage` contains a distinctive sentence from the posting, and no network request carried it. Pinned in Task 2.
5. **A skill mentioned once in passing outranks the main stack.** Skills are ordered by number of mentions, then by first position. Pinned in Task 1.

---

### Task 1: Matching (pure logic)

**Files:**
- Create: `app/lib/skills.mjs`, `app/lib/match.mjs`, `tests/unit/match.test.mjs`

**Interfaces:**
- Consumes: `Card` from `bank.mjs`.
- Produces:
  - `extractSkills(text: string, skills = SKILLS): {id: string, label: string, mentions: number, first: number}[]` — the text is cut to 20,000 characters and lower-cased; all aliases of all skills are tried longest first; a matched span is masked so a shorter alias cannot match inside it; result ordered by `mentions` descending, then `first` ascending.
  - `cardsFor(skill, cards: Card[]): Card[]` — a card matches when its `slug` or `slug:sec` is in `skill.guides`, or an alias matches (same whole-term rule) in its `q` or `secTitle`. Kinds `quiz` and `diagram` and section `review` are left out. Order: core first, then cards whose title contains an alias, then index order. No duplicate `tkey`.
  - `analyse(text: string, cards: Card[], reviewed: Set<string>, skills = SKILLS): Analysis` with `/** @typedef {{found: {id: string, label: string, mentions: number, status: 'covered'|'thin'|'missing', cards: number, reviewed: number}[], deck: Card[], gaps: {missing: string[], thin: string[], unreviewed: string[]}, truncated: boolean}} Analysis */` — `deck`: round-robin over found skills in order, taking each skill’s next card until 8 per skill or 60 in total, unreviewed cards before reviewed ones within a skill, no duplicate `tkey`. `gaps.unreviewed`: covered skills (labels) where fewer than half the matched cards are reviewed.
  - `deckLinks(deck: Card[]): {guide: string, count: number, href: string}[]` — one `deckHref` per guide, in deck order.
  - `saveResult(storage, analysis)`, `readResult(storage)`; key `study-match-v1`.

- [ ] **Step 1: Write the failing tests** `tests/unit/match.test.mjs`. Use this posting as the fixture (fictional):

```text
Senior Full-Stack Engineer. You will build customer-facing features in React and TypeScript on
Next.js, with Node.js services behind them. We run on AWS with Docker and Kubernetes, and ship
through CI/CD on GitHub Actions. You know PostgreSQL well and care about testing (Playwright).
Experience with React Native, C# or Java is a bonus. JavaScript fundamentals matter to us.
You enjoy mentoring and clear communication skills.
```

  - `extractSkills` ids include `react`, `typescript`, `nextjs`, `node`, `aws`, `docker`, `kubernetes`, `cicd`, `sql`, `testing`, `e2e`, `mobile`, `dotnet`, `java`, `javascript`, `behavioural`; `react` has exactly 1 mention (the one in `React Native` belongs to `mobile`); `java` has exactly 1 (not the one inside `JavaScript`); `golang` is absent;
  - `extractSkills('We go fast. Git push daily.')` gives only `git`;
  - `extractSkills('')` is `[]`; a 50,000-character input returns with `truncated: true` from `analyse`;
  - with a fixture bank (5 React cards of which 2 core, 2 Kubernetes cards, 0 Java cards), `analyse` marks `react` `covered`, `kubernetes` `thin`, `java` `missing`; the deck starts with a core React card; `gaps.missing` has `Java`;
  - with all React cards reviewed, `react` is not in `gaps.unreviewed`; with none reviewed it is;
  - the deck never exceeds 60 cards or 8 per skill, and has no duplicate `tkey`;
  - **over the real index** (`public/search-index.json` through `toCards`): every `guides` entry of every skill names a slug, or a `slug:section`, that has at least one card.
- [ ] **Step 2: Run** `npm run test:unit` — FAIL. **Step 3: Implement.** **Step 4: Run** — pass.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add job-posting skill matching"`

---

### Task 2: The page

**Files:**
- Create: `app/match/page.tsx`, `app/match/MatchClient.tsx`, `tests/checks/17-match.mjs`
- Modify: `app/lib/tools.mjs` (`match` → `ready: true`)

**Interfaces:** Consumes Task 1, `loadBank`, `readProgress`, `ToolShell`. Produces `/match`.

Screen: a `<textarea aria-label="Job posting">` (12 rows) with the privacy line under it, and `Find my deck`. Results, in three parts:
1. **What they ask for:** a chip per found skill, most-mentioned first, each with a status mark and `n cards · m reviewed`.
2. **Your deck:** `N cards across G guides`, then one row per guide with `Open as flashcards` (from `deckLinks`), then the card titles as links.
3. **Gaps:** three short lists with these headings and nothing when a list is empty: `Not covered here: study these elsewhere`, `Covered thinly: a few cards only`, `Covered, but you have not reviewed most of it`. A `Copy the gap list` button puts the three lists on the clipboard as plain text.

Messages: empty box → `Paste the posting first.`; no skill found → `No skills recognised. Paste the requirements section of the posting.`; cut text → `Only the first 20,000 characters were read.` On a later visit the last result’s skills and deck are shown with `From your last posting, analysed on <date>` and a `Clear` button; the text box is empty.

- [ ] **Step 1: Write the failing check** `tests/checks/17-match.mjs`: paste the fixture posting plus the sentence `Zebra umbrellas sing quietly at Northwind Rail.`; press `Find my deck`; assert chips for `React`, `TypeScript` and `Kubernetes` exist, the deck count matches `/^\d+ cards across \d+ guides$/` with at least 10 cards, an `Open as flashcards` link’s `href` matches `/#deck=/` and opening it shows the flashcard dialog; `Java` is listed under `Not covered here` only if `analyse` says so for the real index (compute the expected lists in Node from the same modules and compare); no value in `localStorage` or `sessionStorage` contains `Zebra umbrellas`, and no request URL or POST body recorded during the page’s life contains `Zebra`; reload shows `From your last posting` and an empty text box; an empty submit shows `Paste the posting first.`; no `pageerror`.
- [ ] **Step 2: Run** `npm run build && npm test` — `17-match` FAILS. **Step 3: Implement.**
- [ ] **Step 4: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`. Look at the results at 375px and 1280px in both themes.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Add the job match page"`

---

### Task 3: Document

- [ ] **Step 1:** Root `README.md`: `/match` in the feature list. `scripts/study/README.md`: how to add a skill (aliases, optional guide pointers, the real-index test).
- [ ] **Step 2: Verify** — `npm run test:unit && npm run build && npm test` ends `ALL CHECKS PASSED`.
- [ ] **Step 3: Commit** — `git commit -am "Document the job match page"`
