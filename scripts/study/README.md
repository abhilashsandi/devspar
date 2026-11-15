# Study guide toolkit

Everything needed to edit, add to, or extend the interview-prep guides (`/interview-prep`,
`/nextjs`, `/genai`, ...) without hand-editing the JSON files.

## How a guide works

- `app/<guide>/content.json` is the source of truth: `{ "html": "<!doctype html>..." }`, a
  complete, self-contained document — its own `<style>`, a `DATA` array of
  `{ id, title, questions: [{ q, a }] }`, and (historically) an embedded copy of the card engine.
- `scripts/study/engine.js` is the **shared** engine now: search, flashcards, the phone-width
  section menu, and progress *and weak-cards* shared between guides by matching question title
  (a card marked "Again" on one guide shows up as weak everywhere it appears; "Got it" clears
  it). Every guide loads the exact same file, so a fix or feature here reaches all of them at once.
  After editing it, re-run `npm run study:build` and `npm test` — see "Tests" below, which
  includes an automated accessibility pass (axe-core) and the flashcard dialog's keyboard focus
  handling (Tab trap, focus returned to its opener on close).
- `app/components/StaticPrepClient.tsx` renders a guide in an iframe, either from a static file
  (`src="/study/<guide>.html"`, what every public guide uses) or from an inline string
  (`html={...}`, what the password-gated `/my-prep` page uses, since its content only exists
  client-side after decryption and must never become a public file).
- `public/study/<guide>.html` + `public/study/engine.js` are **generated**, not edited directly —
  see "Commands" below. They're what the browser actually fetches; the Next.js page itself stays
  tiny (a few KB) instead of embedding the whole guide.

## Commands

```bash
npm run study:emit    # app/*/content.json -> public/study/*.html + engine.js
npm run study:index   # app/*/content.json -> public/search-index.json + app/lib/studyMeta.json
npm run study:build   # both of the above (also runs automatically before `npm run build`)
npm run study:upgrade # re-apply theme.css + engine.js to every guide's content.json (after changing either)
npm run study:audit   # prove every hand-drawn diagram keeps every detail of its tidy original
```

Run `study:build` after editing any `content.json` by hand or by script. If you only change
`scripts/study/engine.js` (a feature for every guide, not a content change), `study:emit` alone
is enough.

## Editing content: the modules

- `parsePage.mjs` — reads/writes the `DATA` array inside a page's HTML, and small text helpers
  (`stripTags`, `plainTitle`, `norm`).
- `lib.mjs` — `load(slug)`, `withData(html, data)`, `upgrade(html)` (applies the current shared
  engine; idempotent), `save(slug, html)` (also runs a duplicate-title and syntax check before
  writing).
- `helpers.mjs` — the day-to-day editing API: `section`, `findCard`, `addCards`, `addSection`,
  `appendHtml`, `regenQuickRef`, `newPage` (scaffold a brand-new guide from the same shell every
  other guide uses).
- `hx.mjs` — tiny HTML builders for a card's answer body: `card(q, ...)`, `p`, `ul`, `ol`,
  `table`, `code`, `tip`, `callout`. Produces the same markup the existing cards use.
- `dg.mjs` — the SVG diagram library (one shared visual language: `box`, `arrow`, `txt`, `wrap`,
  ...) with every diagram already on the site as `D.<name>`. Add a new one the same way, and open
  it in a browser to check text doesn't overflow its box before shipping it (see "Checking a new
  diagram" below).

## Adding cards to an existing guide

```js
// scripts/study/my-edit.mjs   (delete after running, or keep it — see note below)
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { card, p, ul, code, tip } from './hx.mjs';

const { html, data } = await lib.load('nodejs');

const newCard = card(
  'What does AsyncLocalStorage do?',
  p('Request-scoped context that follows the async call chain...'),
  code(`const als = new AsyncLocalStorage();`),
  tip('Good for request ids and tracing.'),
);

H.addCards(data, 's2', [newCard]);   // 's2' is the section id; addCards skips a title that already exists
H.regenQuickRef(data);               // if the guide has a Quick Reference section, refresh it

await lib.save('nodejs', await lib.upgrade(lib.withData(html, data)));
```

```bash
node scripts/study/my-edit.mjs
npm run study:build
npm test   # optional but recommended: npm run build && npm test
```

Card scripts are one-off by nature (`addCards`/`addSection` are idempotent, so re-running is
always safe, but there's no need to keep them once applied). Whether to delete or keep a given
one is a judgment call — a script that's still a useful reference for a similar future edit is
worth keeping; a narrow one-off isn't.

## Adding a whole new guide

```js
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';

const data = [{ id: 'quickref', title: 'Quick Reference', questions: [] }, /* ...sections... */];
H.regenQuickRef(data);

const html = await H.newPage(
  {
    key: 'graphql',                 // localStorage key prefix; must be unique across guides
    title: 'GraphQL — Interview Prep',
    brand: 'GraphQL', brandSub: 'schemas · resolvers · federation',
    h1: 'GraphQL interview prep', eyebrow: 'Prep guide',
    lede: 'Schema design, resolvers, N+1 and DataLoader, federation, and REST vs GraphQL trade-offs.',
  },
  data,
);
await lib.save('graphql', await lib.upgrade(html));
```

Pass `openAll: true` in that config to render every card expanded by default (the Crash Course
uses it so it reads top to bottom; see `add-crash-course.mjs`). The Crash Course and AWS guides are
built by `add-crash-course.mjs` / `add-aws-guide.mjs` from `crash-content-*.mjs` / `aws-content-*.mjs`
(authoring helpers in `cc-kit.mjs`, AWS diagrams in `dg-aws.mjs`).

Then create `app/graphql/page.tsx` (copy an existing one, e.g. `app/nextjs/page.tsx`, and change
the slug/title/description), add it to the homepage's `GROUPS` in `app/page.tsx`, and run
`npm run study:build`.

## Checking a new diagram

```js
import D from './dg.mjs';
import { writeFile } from 'node:fs/promises';
// wrap D.myNewDiagram in a page that has the guides' CSS tokens (any generated public/study/*.html
// has them in its <style>), open it in a browser, and zoom in on the SVG: text must stay inside
// its box at the widths the site actually uses (desktop ~900px, phone ~370px).
```

## Tests

`npm test` (`tests/run-all.mjs`) builds nothing itself — run `npm run build` first — starts a
production server, and runs every check in `tests/checks/`: every guide loads with the expected
card counts, the phone menu and cross-guide search work, progress and weak cards are shared
between guides, the static-file architecture is actually being used (not a silent fallback to
embedding), the homepage's links and search work, and an axe-core accessibility pass plus the
flashcard dialog's keyboard focus handling (Tab trap, focus restored on close) come back clean.
`09-diagrams.mjs` checks the whiteboard diagrams: sketched by default with every label, `Tidy`
restores the authored SVG exactly, the choice carries to another guide, and `Enlarge` opens and
closes. (Whether each label still fits its box is the slower `npm run study:audit`.)
`tests/checks/05-private-page.mjs` additionally checks `/my-prep` when `PRIVATE_PASSWORD` is set
in the environment (it never is in CI, since the real password lives outside the repo); it skips
itself otherwise.

## Design: one theme for every guide

`scripts/study/theme.css` is the only stylesheet the guides use (whiteboard in light mode,
chalkboard in dark). `lib.upgrade()` swaps each guide's `<style>` for it, along with the font
link and the engine, so a design change is one file:

```bash
npm run study:upgrade     # re-apply theme.css, fonts and engine.js to every guide's content.json
npm run study:build
```

Token names (`--panel`, `--accent`, `--gold`, …) are also used inside the SVG diagrams, so change
their values, not their names. The site's own pages use the same palette through the tokens in
`app/globals.css` (`bg-board`, `text-ink`, `bg-marker`, …).

The private `/my-prep` page is encrypted, so `study:upgrade` cannot reach it; run
`PRIVATE_PASSWORD='…' node scripts/update-my-prep.mjs` to merge the private sections and restyle it.

## Checking diagrams

```bash
node scripts/study/preview-diagrams.mjs dg-arch            # every diagram in dg-arch.mjs
node scripts/study/preview-diagrams.mjs dg eventLoop,keys  # only the named ones
```

It writes `.diagram-preview.html` (git-ignored) with a light/dark switch. Check that text stays
inside its box in both themes before a diagram ships.

## Whiteboard diagrams (and the tidy original)

You author a diagram once, as tidy boxes and arrows (`box`, `arrow`, `txt`, `wrap` in `dg.mjs`).
Readers see it **drawn by hand**, like the event loop sketch on the homepage:

- `engine.js` (the `sketch` block) redraws each SVG when its card renders: edges bow, corners drift,
  arrowheads become open chevrons, neutral outlines become marker ink, strokes draw in when the card
  opens. The wobble is seeded from each shape's coordinates, so a diagram never changes between visits.
- `theme.css` sets the board, the handwriting face (Caveat, sized by x-height) and the draw-in.
- **Code is never handwritten.** A label that looks like a snippet (SQL, a call with arguments, a tag,
  a path, `snake_case`, operators) keeps the type it was authored in, because code is read character
  by character. Plain words and short calls such as `main()` are written by hand. The rule is
  `sketchIsCode` in `engine.js`; `AUDIT_LIST=1 npm run study:audit` lists every label it catches.
- **Nothing is thrown away.** The authored SVG is kept, and the switch under every diagram
  (`✎ Whiteboard` / `▭ Tidy`) flips all diagrams between the two. The choice is remembered across
  guides. `⤢ Enlarge` opens the diagram as wide as the window, which is where small labels are
  easiest to read. On a phone a diagram keeps a readable size and scrolls sideways.

So there is no second copy of a diagram to maintain, and nothing to do when you add one. What you do
need is proof that the handwriting still fits:

```bash
npm run study:audit            # every diagram in every guide
npm run study:audit -- sql aws # only these guides
```

It renders every diagram both ways in a real browser and fails if the sketch drops a label or a
shape, lets a label spill out of the box it sat in, or lets two labels on one line run into each
other. It writes `.diagram-audit.html` (git-ignored) with each pair side by side. Run it after
adding a diagram and after any change to the sketch code or the handwriting sizes in `theme.css`
(those sizes are the largest that pass). It needs network access for the fonts.

`preview-diagrams.mjs` runs the same sketch, so the gallery shows what readers will see.

## Keeping content fresh

```bash
npm run study:freshness                    # look up current versions, scan every guide
npm run study:freshness -- --guide nodejs  # one guide
npm run study:freshness -- --offline       # no network: wording scan only
npm run study:freshness -- --mark nodejs   # record that you reviewed it today
```

It writes `docs/freshness/report.md` (what is behind, where, and how long since each guide was
reviewed) and one ready-to-run prompt per guide in `docs/freshness/prompts/`. Give a prompt to a
coding agent in this repository, or run `/refresh-guides [guide]` in Claude Code
(`.claude/commands/refresh-guides.md`). The tool only reports: version numbers are a hint that
something may be stale, and the prompts tell the agent to verify against official docs first.
Add a technology to track by adding a line to `TRACKED` in `freshness.mjs`.

## Card building blocks added for the newer guides

- `<pre class="plain">` for prompts and sample files: never syntax-coloured.
- `<details class="reveal"><summary>…</summary>…</details>`: an answer the reader opens after
  trying (Bug Clinic). Text inside it is left out of the card summary and the search index summary.
- `<ol class="draw">` numbered drawing steps and `<div class="say">` a script to say out loud
  (Whiteboard guide).

## Practice tools and shared seams

Pages that work across guides (`/mock`, `/plan`, `/match`, `/drills`, `/stories`) cannot reach inside a guide's
iframe, so they use these seams. Plans for each live in `docs/superpowers/plans/`.

- **Index fields.** Every `public/search-index.json` item is `[slug, sectionId, index, sectionTitle, question,
  summary, flags, words, titleKey?]`. Positions 0 to 5 are read by the guides' search and the homepage search;
  never move them. `flags` bit 1 is ★ core (the card is linked from the guide's `review` section), `words` is the
  card's word count, and the optional ninth field is the title key when the displayed question would key
  differently from the real title (escaped markup).
- **`app/lib/bank.mjs`.** Turns the index into typed cards (`kindOf`), reads reviewed and weak progress from
  `localStorage`, builds `#deck=` links and has the seeded shuffle the tools share. No DOM and no clock, so Node tests it.
- **Open a deck from a link.** `/<guide>#deck=sec:i,sec:j` opens exactly those cards as a flashcard deck
  (up to 40). `StaticPrepClient` turns the hash into a `start-deck` message; the engine ignores repeats.
- **Embed one card.** `/study/<guide>.html?card=sec:idx` renders only that card; `app/components/CardEmbed.tsx`
  shows it in a frame that follows the card's height (`solo-height` messages).
- **`app/lib/tools.mjs`.** The list of practice tools. A tool's `ready` flag drives the homepage section, the
  sitemap and the accessibility check. `app/components/ToolShell.tsx` is the page frame they share.
- **Engine blocks.** A feature of the shared engine lives between `// ---- <name>:start` and `// ---- <name>:end`.
  `tests/unit/helpers/engine-block.mjs` (`loadBlock`) runs one block in Node so its pure functions get unit tests;
  only `function` declarations are visible to the test, not top-level `const`/`let`.
- **Tests.** `npm run test:unit` runs `tests/unit/*.test.mjs` (no browser, no build). `npm run build && npm test`
  still runs the browser checks.
