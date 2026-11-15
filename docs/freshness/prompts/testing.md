# Refresh prompt: testing

Generated 2026-11-15 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **testing** study guide (`app/testing/content.json`, 58 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. It was last reviewed on 2026-11-15 (full).

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('testing')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- Node.js: guide mentions major version(s) 26; current is 26.13.1 LTS (Lithium), current 26.13.1
- Vitest: guide mentions major version(s) 5; current is 5.1.0
- MSW: guide mentions major version(s) 3; current is 3.0.6
- Testing Library: guide mentions major version(s) 16; current is 16.3.3
- Playwright: guide mentions major version(s) 1; current is 1.65.1
- Jest: guide mentions major version(s) 30; current is 30.5.2


## Cards with time-sensitive wording (check each still holds)

- `te2:5` Vitest, Jest or node:test?  (check the current)
- `te5:7` Playwright or Cypress?  (check the current)
- `te7:4` What testing happens after deployment?  (canary)

## Sections

- `te1` 1. Test Strategy (7)
- `te2` 2. Unit Testing (7)
- `te3` 3. React Testing Library (9)
- `te4` 4. Mocking the Network with MSW (7)
- `te5` 5. End-to-End Testing with Playwright (9)
- `te6` 6. Testing a Node.js Back End (7)
- `te7` 7. Tests in CI and After Deployment (6)
- `te8` 8. Interview Scenarios (6)

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
3. Run `npm run study:freshness -- --mark testing` to record the review date.
4. Do not commit or push unless asked.
