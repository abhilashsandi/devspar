# Refresh prompt: nodejs

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **nodejs** study guide (`app/nodejs/content.json`, 62 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('nodejs')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- Express: guide mentions major version(s) 4, 5; current is 5.3.0
- Node.js: guide mentions major version(s) 24; current is 26.13.1 LTS (Lithium), current 26.13.1  ← BEHIND

## Cards that mention the newest-known version of something that has since moved on

### Node.js (guide: 24, current: 26.13.1 LTS (Lithium), current 26.13.1)
- `deep-prod:3` Can Node.js run TypeScript directly now, and what are the limits?

## Cards with time-sensitive wording (check each still holds)

- `s4:4` Quiz: Why should you use pipeline() instead of .pipe()? (A) pipeline() is faster · (B) pip  (deprecated)
- `s14:0` CommonJS vs ES Modules — what are the key differences?  (in 2024)
- `s15:2` Which features are built into Node.js now that used to need packages?  (experimental)
- `deep-prod:0` Why do Node services behind a load balancer return random 502s, and how do keep-alive time  (is being)
- `deep-prod:3` Can Node.js run TypeScript directly now, and what are the limits?  (experimental)

## Sections

- `s1` Node.js Overview & Architecture (5)
- `s2` The Event Loop (8)
- `s3` Async Patterns & Error Handling (4)
- `s4` Streams & Buffers (5)
- `s5` Memory Management & Profiling (3)
- `s6` Error Handling & Graceful Shutdown (3)
- `s7` API Security (4)
- `s8` Scaling, Clustering & Caching (4)
- `s9` Database Patterns (4)
- `s10` Worker Threads & Child Processes (2)
- `s11` Testing in Node.js (4)
- `s12` Express vs Fastify vs NestJS (2)
- `s13` Architecture & Microservices (3)
- `s14` Modules & Package Management (3)
- `s15` Core Modules & Built-ins (3)
- `deep-prod` Deep Dive: Production Node.js (5)

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
3. Run `npm run study:freshness -- --mark nodejs` to record the review date.
4. Do not commit or push unless asked.
