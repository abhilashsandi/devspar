---
description: Check the study guides for outdated content and refresh one (or the most stale one)
argument-hint: "[guide slug, or empty to pick the most stale]"
---

Keep the DevSpar study guides current. Work in this repository root.

1. Run `npm run study:freshness` and read `docs/freshness/report.md`.
2. Choose the guide: `$ARGUMENTS` if given; otherwise the guide with versions behind, or failing that the one reviewed longest ago. Tell the user which one and why, in one line.
3. Open `docs/freshness/prompts/<guide>.md` and follow it exactly. In short:
   - Verify every change against current official documentation before making it (use the `ctx7` CLI for library docs). Do not update from memory.
   - Change only what is wrong, outdated or missing. Keep history that interviews still ask about.
   - Edit through the toolkit in `scripts/study/` (see its README), never by hand-editing `content.json`.
   - Compile or run any code sample you add or change.
4. Run `npm run study:build && npm run build && npm test`. Fix anything that fails.
5. Report a table of each card changed, what changed and the source it was checked against; list anything you could not verify.
6. Run `npm run study:freshness -- --mark <guide>` to record the review.
7. Do not commit or push unless the user asks.

If several guides are behind on the same technology (for example a new Node.js LTS), fix that one fact across all of them in a single small script, like `scripts/study/refresh-2026-11.mjs`.
