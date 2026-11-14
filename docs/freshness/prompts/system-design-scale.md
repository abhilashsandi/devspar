# Refresh prompt: system-design-scale

Generated 2026-11-14 by `npm run study:freshness`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **system-design-scale** study guide (`app/system-design-scale/content.json`, 45 cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one. No review has been recorded for it yet.

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the `ctx7` CLI per the user's rules: `npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read `scripts/study/README.md`. Load with `lib.load('system-design-scale')`, change cards with the helpers in `helpers.mjs` (`findCard`, `addCards`, `appendHtml`) or by editing the guide's content script if it has one (`scripts/study/add-*.mjs`, `*-content-*.mjs`), then `lib.save(slug, await lib.upgrade(lib.withData(html, data)))`. If the guide has a Quick Reference section, call `H.regenQuickRef(data)` before saving.
5. **New diagrams** go in a `scripts/study/dg-*.mjs` module and are checked with `node scripts/study/preview-diagrams.mjs <module>` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
- Next.js: guide mentions major version(s) 15; current is 16.4.6  ← BEHIND
- React Router: guide mentions major version(s) 7; current is 8.5.1  ← BEHIND

## Cards that mention the newest-known version of something that has since moved on

### Next.js (guide: 15, current: 16.4.6)
- `client:0` Which web framework would you choose, and why?

### React Router (guide: 7, current: 8.5.1)
- `client:0` Which web framework would you choose, and why?

## Cards with time-sensitive wording (check each still holds)

- `overview:0` What's the one-page version of this entire answer?  (canary)
- `overview:1` How do the design flow and the optimization flow line up, layer by layer?  (canary)
- `overview:9` How do you operate it safely: health checks, canary releases with auto-rollback, and golde  (canary)
- `edge:1` How do you version an API without breaking existing clients?  (deprecated)
- `data:3` What is the CAP theorem, and does it actually matter day to day?  (latest)
- `deploy:0` What does the path from a merged PR to production look like?  (canary)
- `deploy:2` How does load balancing work, and which algorithm do you pick?  (canary)
- `together:1` Walk me through a full production architecture, from the browser to the message broker.  (canary)

## Sections

- `overview` The Complete Flow (10)
- `framing` Framing the Problem (2)
- `client` Client Layer & Web Framework (2)
- `auth` Auth & Identity (2)
- `edge` Edge, CDN & API Gateway (3)
- `services` Service Architecture (3)
- `data` Data Layer (6)
- `caching` Caching Strategy (1)
- `async` Async & Messaging (3)
- `deploy` Deployment & Infrastructure (3)
- `reliability` Reliability & Observability (2)
- `security` Security (1)
- `together` Putting It All Together (7)

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
3. Run `npm run study:freshness -- --mark system-design-scale` to record the review date.
4. Do not commit or push unless asked.
