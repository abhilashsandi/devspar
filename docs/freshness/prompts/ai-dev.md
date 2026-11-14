# Refresh prompt: ai-dev

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **ai-dev** study guide (`app/ai-dev/content.json`, 80 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('ai-dev')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- Node.js: guide mentions major version(s) 24; current is 26.13.1 LTS (Lithium), current 26.13.1  ← BEHIND

## Cards that mention the newest-known version of something that has since moved on

### Node.js (guide: 24, current: 26.13.1 LTS (Lithium), current 26.13.1)
- `ai6:6` What is project-context.md, and how does BMad stop agents contradicting each other?

## Cards with time-sensitive wording (check each still holds)

- `ai2:3` How do you prompt for debugging?  (recently)
- `ai6:0` What is the BMad Method?  (check the current)
- `ai10:2` “Would you let an AI agent merge to main or deploy to production?”  (canary)
- `ai10:5` An interview allows AI tools during live coding. How do you approach it?  (is being)

## Sections

- `ai1` 1. How AI-Assisted Development Works (7)
- `ai2` 2. Prompting for Code (8)
- `ai3` 3. Context Engineering (8)
- `ai4` 4. The Harness: Tools, MCP, Permissions, Hooks (7)
- `ai5` 5. Spec-Driven Development (8)
- `ai6` 6. The BMad Method (9)
- `ai7` 7. Skills, Rules and Reusable Workflows (6)
- `ai8` 8. A Full-Stack Workflow, End to End (10)
- `ai9` 9. Quality, Security and Guardrails (9)
- `ai10` 10. Interview Questions (8)

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
3. Run `npm run study:freshness -- --mark ai-dev` to record the review date.
4. Do not commit or push unless asked.
