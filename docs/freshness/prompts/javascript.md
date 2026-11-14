# Refresh prompt: javascript

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **javascript** study guide (`app/javascript/content.json`, 51 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('javascript')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- none of the tracked technologies are mentioned by version


## Cards with time-sensitive wording (check each still holds)

- `js-async:6` How do you cancel a fetch or add a timeout with AbortController?  (latest)
- `js-data:3` Map vs. WeakMap — why would you choose a WeakMap?  (recently, currently)
- `deep-async:1` Implement debounce and throttle, including cancel and leading-edge options.  (latest)

## Sections

- `js-scope` Scope & Closures (4)
- `js-fn` Functions & Patterns (3)
- `js-async` Async, Promises & Event Loop (7)
- `js-data` Data, Equality & Arrays (4)
- `js-objects` Objects, Prototypes & this (3)
- `js-iter` Iterators, Generators & Modules (2)
- `js-browser` Browser APIs & DOM (3)
- `ts-basics` TypeScript Fundamentals (8)
- `ts-react` TypeScript with React (4)
- `css-box` CSS: Box Model & Positioning (2)
- `css-sel` CSS: Selectors, Responsive & Animation (3)
- `deep-async` Deep Dive: Async Puzzles & Patterns (4)
- `deep-objects` Deep Dive: Objects & Internals (4)

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
3. Run `npm run study:freshness -- --mark javascript` to record the review date.
4. Do not commit or push unless asked.
