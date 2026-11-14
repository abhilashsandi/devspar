# Refresh prompt: interview-cheatsheet

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **interview-cheatsheet** study guide (`app/interview-cheatsheet/content.json`, 149 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('interview-cheatsheet')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- React: guide mentions major version(s) 19; current is 19.3.1
- TypeScript: guide mentions major version(s) 4, 5; current is 7.0.2  ← BEHIND
- Node.js: guide mentions major version(s) 15, 24; current is 26.13.1 LTS (Lithium), current 26.13.1  ← BEHIND
- Tailwind CSS: guide mentions major version(s) 4; current is 4.3.5
- Next.js: guide mentions major version(s) 16; current is 16.4.6

## Cards that mention the newest-known version of something that has since moved on

### TypeScript (guide: 5, current: 7.0.2)
- `typescript:10` Type guards

### Node.js (guide: 24, current: 26.13.1 LTS (Lithium), current 26.13.1)
- `typescript:20` Running .ts on Node

## Cards with time-sensitive wording (check each still holds)

- `review:1` The must-know 30-minute pass  (canary)
- `javascript:2` Promise.all vs. allSettled  (soon)
- `typescript:9` Exhaustive switch  (newly)
- `cloud:2` Blue-green vs. canary vs. rolling  (canary)

## Sections

- `review` Start Here: Last 2 Hours (2)
- `behavioral` Engineering Practice (2)
- `javascript` JavaScript (7)
- `typescript` TypeScript (22)
- `react` React (15)
- `node-js` Node.js (9)
- `databases` Databases (6)
- `cloud` Cloud & Deployment (7)
- `architecture` Architecture & Reliability (12)
- `security` Security (4)
- `css` CSS (12)
- `testing` Testing (4)
- `system-design` System Design (9)
- `scale-design` System Design at Scale (10)
- `optimization` Performance Optimization (10)
- `next-js` Next.js (15)
- `coding` Coding Exercises (3)

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
3. Run `npm run study:freshness -- --mark interview-cheatsheet` to record the review date.
4. Do not commit or push unless asked.
