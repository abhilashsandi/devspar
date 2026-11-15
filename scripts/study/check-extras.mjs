// Checks a guide's answer extras.
//   node scripts/study/check-extras.mjs <slug> [--list] [--require-all]
// --list prints the core cards (the work list). Default: every entry meets its word budgets and matches
// a card. --require-all also fails unless every core card has an entry.
import * as lib from './lib.mjs';
import { validateExtra } from './extras.mjs';
import { plainTitle } from './parsePage.mjs';

const key = (t) => plainTitle(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const [slug, ...flags] = process.argv.slice(2);
if (!slug) { console.error('usage: node scripts/study/check-extras.mjs <slug> [--list] [--require-all]'); process.exit(1); }
const { data } = await lib.load(slug);

const coreKeys = new Set();
const review = data.find((s) => s.id === 'review');
if (review) for (const q of review.questions) for (const m of q.a.match(/data-go="[^"]+"/g) || []) coreKeys.add(m.slice(9, -1));
const core = [];
for (const s of data) s.questions.forEach((q, i) => { if (coreKeys.has(s.id + ':' + i)) core.push({ sec: s.id, title: plainTitle(q.q) }); });

if (flags.includes('--list')) {
  for (const c of core) console.log(c.sec + ' | ' + c.title);
  process.exit(0);
}

let entries = [];
try { entries = (await import('./extras/' + slug + '.mjs')).default; } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }

const problems = [];
const have = new Set();
for (const e of entries) {
  const where = e.sec + ' | ' + key(e.card);
  const sec = data.find((s) => s.id === e.sec);
  if (!sec || !sec.questions.some((q) => key(q.q) === key(e.card))) problems.push(where + ': no such card');
  if (have.has(where)) problems.push(where + ': duplicate entry');
  have.add(where);
  for (const m of validateExtra(e)) problems.push(where + ': ' + m);
  if (!core.some((c) => c.sec === e.sec && key(c.title) === key(e.card))) problems.push(where + ': not a core card');
}
if (flags.includes('--require-all')) {
  for (const c of core) if (!have.has(c.sec + ' | ' + key(c.title))) problems.push(c.sec + ' | ' + c.title + ': no entry');
}
if (problems.length) {
  console.log('check-extras ' + slug + ': FAIL\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
console.log('check-extras ' + slug + ': OK (' + entries.length + ' of ' + core.length + ' core cards)');
