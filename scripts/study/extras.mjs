// The answer-extras overlay: a 15-second and a 60-second spoken version of a card, and a ladder of
// follow-up questions. It is kept apart from the guide's own text: one entry per card, applied to a
// guide's data as a marked block at the end of the card's answer. The engine (block `depths` and
// `ladder`) turns the block into a length switch and a one-rung-at-a-time ladder.
import { md } from './cc-kit.mjs';
import { plainTitle } from './parsePage.mjs';

/** @typedef {{card: string, sec: string, s15: string, s60: string, ladder: [string, string][]}} Extra */

const BLOCK = /<!--x:extras-->[\s\S]*?<!--\/x:extras-->/g;
const same = (a, b) => key(a) === key(b);
const key = (t) => plainTitle(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

/** The answer without its extras block (used by every summary). */
export const stripExtras = (html) => html.replace(BLOCK, '');

/** @param {Extra} e */
export function extrasHtml(e) {
  return '<!--x:extras--><div class="xdepths" hidden>' +
    '<div data-depth="15"><p>' + md(e.s15) + '</p></div>' +
    '<div data-depth="60"><p>' + md(e.s60) + '</p></div></div>' +
    '<div class="xladder" hidden>' +
    e.ladder.map(([q, a]) => '<details class="reveal rung"><summary>' + md(q) + '</summary><p>' + md(a) + '</p></details>').join('') +
    '</div><!--/x:extras-->';
}

/**
 * @param {{id: string, questions: {q: string, a: string}[]}[]} data
 * @param {Extra[]} entries
 */
export function applyExtras(data, entries) {
  const seen = new Set();
  let applied = 0;
  for (const e of entries) {
    const id = e.sec + '|' + key(e.card);
    if (seen.has(id)) throw new Error('extras: two entries for "' + e.card + '"');
    seen.add(id);
    const sec = data.find((s) => s.id === e.sec);
    const card = sec && sec.questions.find((q) => same(q.q, e.card));
    if (!card) throw new Error('extras: no card "' + e.card + '" in ' + e.sec);
    card.a = stripExtras(card.a) + extrasHtml(e);
    applied++;
  }
  return { applied };
}

/** One message per breach of the word budgets. @param {Extra} e */
export function validateExtra(e) {
  const out = [];
  const n15 = words(e.s15), n60 = words(e.s60);
  if (n15 < 20 || n15 > 45) out.push('s15 is ' + n15 + ' words (want 20 to 45)');
  if (n60 < 110 || n60 > 170) out.push('s60 is ' + n60 + ' words (want 110 to 170)');
  if (!Array.isArray(e.ladder) || e.ladder.length < 2 || e.ladder.length > 3) out.push('ladder has ' + (e.ladder ? e.ladder.length : 0) + ' rung(s) (want 2 or 3)');
  (e.ladder || []).forEach(([q, a], i) => {
    const nq = words(q), na = words(a);
    if (!/\?\s*$/.test(q)) out.push('rung ' + (i + 1) + ' question does not end with ?');
    if (nq > 25) out.push('rung ' + (i + 1) + ' question is ' + nq + ' words (max 25)');
    if (na < 15 || na > 60) out.push('rung ' + (i + 1) + ' answer is ' + na + ' words (want 15 to 60)');
  });
  return out;
}
