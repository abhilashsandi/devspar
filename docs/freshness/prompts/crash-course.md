# Refresh prompt: crash-course

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **crash-course** study guide (`app/crash-course/content.json`, 105 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('crash-course')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- Node.js: guide mentions major version(s) 10; current is 26.13.1 LTS (Lithium), current 26.13.1  ← BEHIND
- TypeScript: guide mentions major version(s) 8; current is 7.0.2
- React: guide mentions major version(s) 12, 18, 19; current is 19.3.1
- Next.js: guide mentions major version(s) 10, 15, 16; current is 16.4.6
- Tailwind CSS: guide mentions major version(s) 4, 7; current is 4.3.5
- Express: guide mentions major version(s) 5; current is 5.3.0

## Cards that mention the newest-known version of something that has since moved on

### Node.js (guide: 10, current: 26.13.1 LTS (Lithium), current 26.13.1)
- `start:1` All sections and their reading time

## Cards with time-sensitive wording (check each still holds)

- `js:0` JS 1/6 · Scope, hoisting and closures  (latest)
- `react:1` React 2/7 · Hooks you must explain  (latest)
- `web:5` Web rapid-fire  (soon)
- `test:0` Testing 1/3 · Strategy: the testing trophy  (preview)
- `arch:5` Arch 6/6 · Deploys and observability  (canary)
- `soft:0` Soft 1/2 · Stories that land  (recently)

## Sections

- `start` Start Here · 2 min (2)
- `js` JavaScript · 10 min (8)
- `ts` TypeScript · 8 min (6)
- `react` React · 12 min (8)
- `next` Next.js · 10 min (7)
- `node` Node.js · 10 min (7)
- `css` CSS & Tailwind · 7 min (6)
- `web` Web Platform & Security · 10 min (7)
- `test` Testing · 5 min (4)
- `db` Databases · 9 min (7)
- `sd` System Design: the Method · 8 min (6)
- `arch` Architecture & Reliability · 10 min (8)
- `scale` System Design at Scale · 10 min (5)
- `perf` Performance Optimization · 8 min (5)
- `ai` GenAI & LLM Apps · 12 min (7)
- `aws` AWS · 12 min (9)
- `soft` Behavioral & Engineering Practice · 5 min (3)

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
3. Run `npm run study:freshness -- --mark crash-course` to record the review date.
4. Do not commit or push unless asked.
