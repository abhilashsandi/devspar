# Refresh prompt: coding-questions

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **coding-questions** study guide (`app/coding-questions/content.json`, 37 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('coding-questions')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- React: guide mentions major version(s) 19; current is 19.3.1


## Cards with time-sensitive wording (check each still holds)

- `coding-arrays:3` How would you check whether a string of brackets — (), [], {} — is validly matched?  (recently)
- `coding-arrays:7` Find the length of the longest substring without repeating characters — how do you solve i  (currently)
- `coding-impl:5` How do you build an LRU cache with O(1) get and put?  (recently)

## Sections

- `coding-arrays` Arrays & Strings (12)
- `coding-impl` Implementations & Async (6)
- `coding-react` React Exercises (10)
- `coding-vanilla` Vanilla JS & APIs (2)
- `deep-practice` Deep Dive: More Exercises (7)

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
3. Run `npm run study:freshness -- --mark coding-questions` to record the review date.
4. Do not commit or push unless asked.
