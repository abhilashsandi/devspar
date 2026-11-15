// Applies a guide's answer extras (scripts/study/extras/<slug>.mjs) to its content.json.
//   node scripts/study/add-extras.mjs interview-prep      (npm run study:extras)
// Re-running replaces each card's block, it never adds a second one.
import * as lib from './lib.mjs';
import { applyExtras } from './extras.mjs';

const slug = process.argv[2];
if (!slug) { console.error('usage: node scripts/study/add-extras.mjs <slug>'); process.exit(1); }
const { default: entries } = await import('./extras/' + slug + '.mjs');
const { html, data } = await lib.load(slug);
const { applied } = applyExtras(data, entries);
await lib.save(slug, await lib.upgrade(lib.withData(html, data)));
console.log(slug + ': extras on ' + applied + ' card(s)');
