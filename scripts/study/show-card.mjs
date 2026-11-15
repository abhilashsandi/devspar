// Prints cards as plain text, for writing their short answers (scripts/study/extras.mjs).
//   node scripts/study/show-card.mjs <slug> <from> <to> [--max N]   core cards number <from> to <to> of `check-extras --list` (1-based)
//   node scripts/study/show-card.mjs <slug> <sec> <title prefix>    one card
// Code blocks print as [code]; --max cuts each card at N characters (default 2400).
import * as lib from './lib.mjs';
import { plainTitle } from './parsePage.mjs';

const args = process.argv.slice(2);
const mi = args.indexOf('--max');
const max = mi >= 0 ? Number(args[mi + 1]) : 2400;
if (mi >= 0) args.splice(mi, 2);
const [slug, a, b, ...rest] = args;
const { data } = await lib.load(slug);

const text = (h) => h.replace(/<!--x:extras-->[\s\S]*?<!--\/x:extras-->/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '[diagram]').replace(/<pre[\s\S]*?<\/pre>/g, '[code]\n')
  .replace(/<\/(p|li|tr|h3|div)>/g, '\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/[ \t]+\n/g, '\n').replace(/\n\s*\n+/g, '\n').trim();
const show = (sec, q) => { const t = text(q.a); console.log('### ' + sec + ' | ' + plainTitle(q.q) + '\n' + (t.length > max ? t.slice(0, max) + ' […]' : t) + '\n'); };

if (/^\d+$/.test(a || '')) {
  const keys = [];
  const review = data.find((s) => s.id === 'review');
  const core = new Set();
  for (const q of review.questions) for (const m of q.a.match(/data-go="[^"]+"/g) || []) core.add(m.slice(9, -1));
  for (const s of data) s.questions.forEach((q, i) => { if (core.has(s.id + ':' + i)) keys.push([s.id, q]); });
  keys.slice(Number(a) - 1, Number(b)).forEach(([sec, q]) => show(sec, q));
} else {
  const want = [b, ...rest].join(' ').toLowerCase();
  const s = data.find((x) => x.id === a);
  const hits = s.questions.filter((q) => plainTitle(q.q).toLowerCase().startsWith(want));
  if (hits.length !== 1) { console.error('matched ' + hits.length); process.exit(1); }
  show(a, hits[0]);
}
