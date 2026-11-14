# Refresh prompt: genai

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **genai** study guide (`app/genai/content.json`, 140 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('genai')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- Node.js: guide mentions major version(s) 22; current is 26.13.1 LTS (Lithium), current 26.13.1  ← BEHIND

## Cards that mention the newest-known version of something that has since moved on

### Node.js (guide: 22, current: 26.13.1 LTS (Lithium), current 26.13.1)
- `cheatsheet:3` Facts, numbers and versions to know (verified 24 Sep 2026)
- `tools:2` Which current API conventions differ from older tutorials?

## Cards with time-sensitive wording (check each still holds)

- `review:10` 10. Evaluation and tuning (5 min)  (in 2026)
- `cheatsheet:3` Facts, numbers and versions to know (verified 24 Sep 2026)  (deprecated, latest)
- `rag:4` Which vector-search concepts must you distinguish?  (latest)
- `agents:2` What is MCP, how does it relate to tool calling and RAG, and is it required?  (deprecated)
- `agents:10` Does the LLM actually call your API?  (is being)
- `evals:4` When is model fine-tuning justified, and is it still available?  (deprecated)
- `tools:2` Which current API conventions differ from older tutorials?  (deprecated)
- `tools:3` Which package versions are current (npm, 24 Sep 2026)?  (latest)
- `tools:5` How do you verify library and provider APIs before coding?  (latest)
- `tools:6` Which official sources back this page?  (latest)
- `react-core:7` What belongs in useEffect?  (latest)

## Sections

- `review` Start Here: GenAI Explained (12)
- `cheatsheet` Cheatsheet (4)
- `foundations` LLM Foundations (12)
- `flow` Worked Example: AI Quote Comparison (16)
- `rag` RAG & Vectors (15)
- `agents` Tools, Agents & MCP (14)
- `conversation` Conversation & AI Features (9)
- `react-ai` React + LLM Integration (12)
- `safety` Prompts & Safety (8)
- `evals` Evaluation & Tuning (8)
- `production` Production (11)
- `tools` Tools, Providers & APIs (7)
- `react-core` React & Full-stack Essentials (9)
- `ownership` Answering Well (3)

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
3. Run `npm run study:freshness -- --mark genai` to record the review date.
4. Do not commit or push unless asked.
