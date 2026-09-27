// Higher-level helpers for editing a study page's `data` array in place. Used by scripts that
// add or update cards (see scripts/study/README.md for a worked example).
import { plainTitle, stripTags } from './parsePage.mjs';
import * as lib from './lib.mjs';

export const noLinks = (a) => a.replace(/<p class="deeper">[\s\S]*?<\/p>/g, '').replace(/<a class="go"[^>]*>([\s\S]*?)<\/a>/g, '$1');
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function section(data, id) {
  const s = data.find((x) => x.id === id);
  if (!s) throw new Error('section not found: ' + id);
  return s;
}

export function findCard(data, prefix, secId) {
  const want = plainTitle(prefix);
  const hits = [];
  for (const s of data) {
    if (secId && s.id !== secId) continue;
    s.questions.forEach((q, i) => { if (plainTitle(q.q).startsWith(want)) hits.push({ s, i, q }); });
  }
  if (hits.length !== 1) throw new Error('card prefix matched ' + hits.length + ': ' + prefix + (secId ? ' in ' + secId : ''));
  return hits[0];
}

export const hasTitle = (data, title) => data.some((s) => s.questions.some((q) => plainTitle(q.q) === plainTitle(title)));

// Appends cards to a section, skipping any whose title already exists anywhere on the page
// (so re-running a content script is safe). Returns how many were actually added.
export function addCards(data, secId, cards) {
  const s = section(data, secId);
  let n = 0;
  for (const c of cards) {
    if (hasTitle(data, c.q)) continue;
    s.questions.push({ q: c.q, a: c.a });
    n++;
  }
  return n;
}

// Inserts a new section after `afterId` (or at the end when null); if a section with that id
// already exists, merges in only the cards it doesn't already have.
export function addSection(data, afterId, sec) {
  const existing = data.find((s) => s.id === sec.id);
  if (existing) {
    for (const c of sec.questions) if (!hasTitle(data, c.q)) existing.questions.push(c);
    return existing;
  }
  const at = afterId ? data.findIndex((s) => s.id === afterId) + 1 : data.length;
  if (afterId && at === 0) throw new Error('after section not found: ' + afterId);
  const out = { id: sec.id, title: sec.title, questions: sec.questions.map((c) => ({ q: c.q, a: c.a })) };
  data.splice(at, 0, out);
  return out;
}

// Appends HTML to an existing card's answer, once (a no-op if already present).
export function appendHtml(data, prefix, html, secId) {
  const { q } = findCard(data, prefix, secId);
  if (!q.a.includes(html)) q.a += html;
}

// ---- the auto-generated "Quick Reference" section: one card per section, every question title
// linking to itself with a one-line summary. Call this after editing a page's sections.
function firstSentence(html) {
  const t = stripTags(html);
  const m = t.match(/^(.{40,230}?[.!?])(\s|$)/);
  return m ? m[1] : (t.length > 230 ? t.slice(0, 227).replace(/\s+\S*$/, '') + '…' : t);
}
export function regenQuickRef(data) {
  const qi = data.findIndex((s) => s.id === 'quickref');
  if (qi < 0) return;
  const cards = [];
  for (const s of data) {
    if (s.id === 'quickref' || s.id === 'review') continue;
    const rows = [];
    s.questions.forEach((q, i) => {
      const t = plainTitle(q.q);
      if (/^(Quiz:|Diagram:|Predict the output|Cheat sheet:)/.test(t)) return;
      rows.push('<tr><td><a class="go" href="#' + s.id + ':' + i + '" data-go="' + s.id + ':' + i + '">' + q.q.replace(/<span class="quizopts">[\s\S]*?<\/span>/, '') + '</a></td><td>' + esc(firstSentence(q.a)) + '</td></tr>');
    });
    if (!rows.length) continue;
    cards.push({ q: 'Cheat sheet: ' + plainTitle(s.title), a: '<table class="cmp"><tr><th>Question</th><th>One-line answer</th></tr>' + rows.join('') + '</table>' });
  }
  data[qi].questions = cards;
}
export { firstSentence };

// Builds a brand-new guide's HTML from the same shell every guide uses (its own <style>, sidebar
// markup and hero copy), ready for lib.upgrade() + lib.withData(). See README.md for a full example.
export async function newPage(cfg, data) {
  let h = (await lib.load('nextjs')).html;
  const rep = (re, to) => { if (!re.test(h)) throw new Error('shell anchor ' + re); h = h.replace(re, to); };
  rep(/<title>[\s\S]*?<\/title>/, () => '<title>' + esc(cfg.title) + '</title>');
  rep(/<div class="brand">[\s\S]*?<\/div>/, () => '<div class="brand"><b>' + esc(cfg.brand) + '</b><br>' + esc(cfg.brandSub) + '</div>');
  rep(/<h1>[\s\S]*?<\/h1>/, () => '<h1>' + esc(cfg.h1) + '</h1>');
  rep(/(<div class="hero">[\s\S]*?<\/h1>\s*)<p>[\s\S]*?<\/p>/, (m, a) => a + '<p>' + cfg.lede + '</p>');
  // The shell we copied from nextjs carries nextjs's own window.__STUDY__ config; replace it
  // with this new guide's, or lib.upgrade() would key its progress storage as "nextjs".
  rep(/window\.__STUDY__\s*=\s*\{[^;]*\};/, () => 'window.__STUDY__ = ' + JSON.stringify({ key: cfg.key, core: cfg.core || 'the 2-Hour Review' }) + ';');
  if (cfg.eyebrow) rep(/<p class="eyebrow-free">[\s\S]*?<\/p>/, () => '<p class="eyebrow-free">' + esc(cfg.eyebrow) + '</p>');
  return lib.withData(h, data);
}
