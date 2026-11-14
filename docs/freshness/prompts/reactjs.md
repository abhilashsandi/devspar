# Refresh prompt: reactjs

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **reactjs** study guide (`app/reactjs/content.json`, 74 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('reactjs')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- React: guide mentions major version(s) 16, 18, 19; current is 19.3.1


## Cards with time-sensitive wording (check each still holds)

- `s1:1` React.FC vs plain function — which do you prefer and why?  (deprecated)
- `deep-react:1` What is useEffectEvent, and what problem does it solve?  (latest)

## Sections

- `s1` React + TypeScript Core (5)
- `s2` Hooks Deep Dive (11)
- `adv` Advanced Hooks & Rendering (9)
- `s3` State Management (7)
- `s4` React Rendering & Reconciliation (7)
- `s5` API Integration & Data Fetching (3)
- `s6` Performance & Optimization (6)
- `s7` Testing (Jest, RTL, Playwright) (3)
- `s8` React Design Patterns (3)
- `s9` Next.js & Server-Side Rendering (6)
- `s10` Security in React (3)
- `s11` Build Tooling & CSS (2)
- `s12` Accessibility (WCAG 2.1) (3)
- `deep-ts` Deep Dive: Advanced TypeScript Patterns (4)
- `deep-react` Deep Dive: React 19 APIs (2)

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
3. Run `npm run study:freshness -- --mark reactjs` to record the review date.
4. Do not commit or push unless asked.
