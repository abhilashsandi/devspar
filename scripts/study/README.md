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
`tests/checks/05-private-page.mjs` additionally checks `/my-prep` when `PRIVATE_PASSWORD` is set
in the environment (it never is in CI, since the real password lives outside the repo); it skips
itself otherwise.
