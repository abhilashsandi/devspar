// Content refresh, November 2026: what `npm run study:freshness` flagged and was verified.
//   node scripts/study/refresh-2026-11.mjs && npm run study:build
// Idempotent: each replacement is skipped once applied. Checked against nodejs.org (Node 26 is the
// active LTS line) and the TypeScript 7.0 sources (see the TypeScript guide's own script for that card).
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';

// [guide, section id, start of the card title, text to find, replacement]
const EDITS = [
  ['interview-prep', 'review', '5. Node.js runtime and API design',
    'Node 24 is the active LTS line and Node 20 reached end of life in April 2026',
    'Node 26 is the active LTS line, Node 24 is in maintenance, and Node 20 reached end of life in April 2026'],
  ['nodejs', 'deep-prod', 'Can Node.js run TypeScript directly now',
    'In the Node 24 documentation this works by default',
    'In current Node releases (the 24 and 26 lines) this works by default'],
];

const pages = new Map();
const page = async (slug) => { if (!pages.has(slug)) pages.set(slug, await lib.load(slug)); return pages.get(slug); };

for (const [slug, sid, title, from, to] of EDITS) {
  const { data } = await page(slug);
  const { q } = H.findCard(data, title, sid);
  if (q.a.includes(to)) { console.log('already applied: ' + slug + ' / ' + title); continue; }
  if (!q.a.includes(from)) throw new Error('text not found in ' + slug + ' / ' + title + ': ' + from);
  q.a = q.a.replace(from, to);
  console.log('updated: ' + slug + ' / ' + title);
}

// The TypeScript 7 card also belongs in the main prep guide's TypeScript section (same title, so
// progress is shared between the two guides).
{
  const ts = await lib.load('typescript');
  const { q } = H.findCard(ts.data, 'TypeScript 7: what changed with the native compiler');
  const { data } = await page('interview-prep');
  const added = H.addCards(data, 'ts', [{ q: q.q, a: q.a }]);
  console.log(added ? 'added the TypeScript 7 card to interview-prep' : 'interview-prep already has the TypeScript 7 card');
}

for (const [slug, { html, data }] of pages) {
  H.regenQuickRef(data);
  await lib.save(slug, await lib.upgrade(lib.withData(html, data)));
}
