# Refresh prompt: typescript

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **typescript** study guide (`app/typescript/content.json`, 60 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('typescript')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- ECMAScript: guide mentions major version(s) 2023; current is ES2026  ← BEHIND
- TypeScript: guide mentions major version(s) 4, 5, 7; current is 7.0.2
- Node.js: guide mentions major version(s) 24; current is 26.13.1 LTS (Lithium), current 26.13.1  ← BEHIND

## Cards that mention the newest-known version of something that has since moved on

### ECMAScript (guide: 2023, current: ES2026)
- `ts1:3` Which tsconfig options should every new project turn on, and why?

### Node.js (guide: 24, current: 26.13.1 LTS (Lithium), current 26.13.1)
- `ts7:9` Running TypeScript on Node 24 without a build step: what is type stripping?

## Cards with time-sensitive wording (check each still holds)

- `ts7:8` Why can compilation be slow, and how do you find the cause?  (check the current)

## Sections

- `ts1` 1. The Type System Model (10)
- `ts2` 2. Declaring Types (9)
- `ts3` 3. Narrowing & Control Flow (6)
- `ts4` 4. Generics (5)
- `ts5` 5. Type-Level Programming (9)
- `ts6` 6. Patterns for Real Code (6)
- `ts7` 7. TypeScript in the Real World (11)
- `ts8` 8. Practice & Rapid-Fire (4)

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
3. Run `npm run study:freshness -- --mark typescript` to record the review date.
4. Do not commit or push unless asked.
