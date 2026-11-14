# Refresh prompt: interview-prep

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **interview-prep** study guide (`app/interview-prep/content.json`, 402 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('interview-prep')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- React: guide mentions major version(s) 16, 18, 19; current is 19.3.1
- Next.js: guide mentions major version(s) 13, 14, 15, 16; current is 16.4.6
- Node.js: guide mentions major version(s) 15, 20, 22, 24; current is 26.13.1 LTS (Lithium), current 26.13.1  ← BEHIND
- Express: guide mentions major version(s) 4, 5; current is 5.3.0
- Tailwind CSS: guide mentions major version(s) 3, 4; current is 4.3.5
- React Router: guide mentions major version(s) 7; current is 8.5.1  ← BEHIND

## Cards that mention the newest-known version of something that has since moved on

### Node.js (guide: 24, current: 26.13.1 LTS (Lithium), current 26.13.1)
- `review:5` 5. Node.js runtime and API design (10 min)

### React Router (guide: 7, current: 8.5.1)
- `sdscale:2` Which web framework would you choose, and why?

## Cards with time-sensitive wording (check each still holds)

- `review:4` 4. React 19 and Next.js 15/16: what is current (12 min)  (latest)
- `review:9` 9. Cloud, CI/CD and observability (8 min)  (canary)
- `js:11` Map vs. WeakMap — why would you choose a WeakMap?  (recently, currently)
- `js:17` How do you cancel a fetch or add a timeout with AbortController?  (latest)
- `react:7` What is Zustand, and how does it decide when a component re-renders?  (newly)
- `react:9` What are useTransition and useDeferredValue, and when would you reach for them?  (latest)
- `react:23` Tailwind CSS vs CSS Modules vs CSS-in-JS — how do you choose a styling approach?  (deprecated)
- `react:25` What do React 19's useActionState, useFormStatus, and use() add to data flow?  (currently)
- `react:43` How do you type forwardRef with generics?  (deprecated)
- `nextjs:3` What is Partial Prerendering (PPR)?  (experimental)
- `nextjs:14` What runs in Next.js Middleware, and what are its constraints?  (deprecated)
- `nextjs:16` Which Next.js versions matter, and what changed between the recent major versions?  (experimental)
- `nextjs:21` What are Cache Components, and how do "use cache", cacheLife and cacheTag work?  (experimental)
- `nextjs:22` updateTag, revalidateTag and revalidatePath: which one do you call, and when?  (deprecated)
- `node:17` What are the key differences between CommonJS and ES Modules in Node.js?  (recently)
- `node:29` Which features are built into Node.js now that used to need packages?  (experimental)
- `cloud:3` What are blue-green, canary, and rolling deployments, and how do you choose?  (canary)
- `cloud:11` What actually runs in a CI/CD pipeline before code reaches production?  (latest)
- `cloud:12` How do you reduce AWS Lambda cold-start latency?  (check the current, check current)
- `coding:7` How would you check whether a string of brackets — (), [], {} — is validly matched?  (recently)
- `coding:11` Find the length of the longest substring without repeating characters — how do you solve i  (currently)
- `coding:29` How do you build an LRU cache with O(1) get and put?  (recently)
- `arch:16` Can you elaborate on how a service mesh works?  (canary)
- `arch:20` How do you make RabbitMQ messages reliable during service failures, end to end?  (deprecated)
- `web:11` Walk through a CI/CD pipeline and the main rollout strategies.  (canary)
- `web:12` What are feature flags, and how do you use them without creating a mess?  (beta)
- `web:13` Git merge vs rebase: when do you use each?  (latest)
- `sysdesign:5` Explain the CAP theorem and how it plays out in real distributed databases.  (latest)
- `sysdesign:9` How does GraphQL federation work, for example composing search results with item, price an  (deprecated)
- `sysdesign:13` Explain the core Kubernetes building blocks and how the Horizontal Pod Autoscaler decides   (canary)
- `sysdesign:15` What does a real cascading-failure outage look like, and what design lessons does it teach  (canary)
- `sysdesign:17` How would you route and distribute traffic across a fleet of servers in production — what'  (canary)
- `sysdesign:26` How would you design a news feed or timeline?  (latest)
- `sdscale:0` What is the one-page flow for designing a full-stack app that serves millions of users?  (canary)
- `sdscale:4` How do you version an API without breaking existing clients?  (deprecated)
- `perf:0` What is the one-page flow for optimizing performance at every layer of the stack?  (canary)
- `perf:3` How do you stop performance regressions from landing in the first place?  (preview)

## Sections

- `review` 2-Hour Review (14)
- `behavioral` Engineering Practice & Questions to Ask (4)
- `js` JavaScript (26)
- `ts` TypeScript (14)
- `react` React (65)
- `nextjs` Next.js (27)
- `node` Node.js (38)
- `db` Databases (16)
- `cloud` Cloud & Deployment (13)
- `coding` Coding Exercise (30)
- `arch` Architecture & Reliability (23)
- `security` Auth & Security (13)
- `web` Web Platform & Tooling (15)
- `css` CSS (29)
- `testing` Testing (13)
- `sysdesign` System Design (30)
- `sdscale` System Design at Scale (14)
- `perf` Performance Optimization (18)

## Beyond the scan

The scan only sees version numbers and wording. Also check, for this guide's subject:

- **What is new** since the last review that an interviewer would now expect (new stable APIs, new defaults, renamed concepts).
- **What is deprecated or removed** that the guide still recommends.
- **Best practice that has shifted** (recommended tools, patterns the official docs now discourage).
- **Missing questions** that have become common for this topic.
- **Diagrams and whiteboard value**: any card that explains a mechanism in prose only and would be clearer with a diagram.

## When you are done

1. Run `npm run study:build && npm run build && npm test` and fix anything that fails.
2. Report: a table of every card changed (ref, what changed, the source you verified it against), anything you could not verify, and suggestions you did not act on.
3. Run `npm run study:freshness -- --mark interview-prep` to record the review date.
4. Do not commit or push unless asked.
