// The job-posting mapper: find the skills a posting asks for, the cards that cover them, and the gaps. Pure: no
// DOM, no storage unless handed one. The posting itself is never stored; only the result is.
import { SKILLS } from './skills.mjs';
import { deckHref } from './bank.mjs';

/** @typedef {import('./bank.mjs').Card} Card */
/** @typedef {import('./skills.mjs').Skill} Skill */

export const MAX_CHARS = 20000;
const PER_SKILL = 8, MAX_DECK = 60;
const alnum = /[a-z0-9]/;

/** Whole-term occurrences of `alias` in lower-case `text`: neither neighbour is a letter or a digit. */
function* occurrences(text, alias) {
  let from = 0;
  for (;;) {
    const i = text.indexOf(alias, from);
    if (i < 0) return;
    const before = i === 0 ? '' : text[i - 1], after = text[i + alias.length] || '';
    if (!alnum.test(before) && !alnum.test(after)) yield i;
    from = i + 1;
  }
}
const hasAlias = (text, alias) => !occurrences(text.toLowerCase(), alias).next().done;

/**
 * Skills mentioned in `text`, longest alias first so `react native` is not also `react` and `java` is not found
 * inside `javascript`. Most mentioned first, then earliest.
 * @param {string} text @param {Skill[]} [skills]
 * @returns {{id: string, label: string, mentions: number, first: number}[]}
 */
export function extractSkills(text, skills = SKILLS) {
  let s = String(text).slice(0, MAX_CHARS).toLowerCase();
  const pairs = skills.flatMap((sk, k) => sk.aliases.map((a) => [a.toLowerCase(), k])).sort((x, y) => y[0].length - x[0].length);
  const found = new Map();
  for (const [alias, k] of pairs) {
    const hits = [...occurrences(s, alias)];
    for (const i of hits) {
      s = s.slice(0, i) + '\u0000'.repeat(alias.length) + s.slice(i + alias.length);     // mask it: a shorter alias cannot match inside
      const f = found.get(k) || { id: skills[k].id, label: skills[k].label, mentions: 0, first: Infinity };
      f.mentions++; f.first = Math.min(f.first, i);
      found.set(k, f);
    }
  }
  return [...found.values()].sort((a, b) => b.mentions - a.mentions || a.first - b.first);
}

/**
 * Cards for a skill: in one of its guides (or `guide:section`), or an alias appears in the title or section title.
 * Core first, then titles that name the skill, then guide order; no quizzes, diagrams or review cards; one per title.
 * @param {Skill} skill @param {Card[]} cards @returns {Card[]}
 */
export function cardsFor(skill, cards) {
  const pointers = (skill.guides || []).map((g) => g.split(':'));
  const inGuide = (c) => pointers.some(([slug, sec]) => c.slug === slug && (!sec || c.sec === sec));
  const named = (c) => skill.aliases.some((a) => hasAlias(c.q, a.toLowerCase()));
  const matched = cards
    .filter((c) => c.sec !== 'review' && c.kind !== 'quiz' && c.kind !== 'diagram')
    .map((c, i) => ({ c, i, title: named(c), hit: inGuide(c) || named(c) || skill.aliases.some((a) => hasAlias(c.secTitle, a.toLowerCase())) }))
    .filter((x) => x.hit)
    .sort((a, b) => (a.c.core ? 0 : a.title ? 1 : 2) - (b.c.core ? 0 : b.title ? 1 : 2) || a.i - b.i);
  const seen = new Set();
  return matched.map((x) => x.c).filter((c) => (seen.has(c.tkey) ? false : (seen.add(c.tkey), true)));
}

/**
 * @typedef {{found: {id: string, label: string, mentions: number, status: 'covered'|'thin'|'missing', cards: number, reviewed: number}[], deck: Card[], gaps: {missing: string[], thin: string[], unreviewed: string[]}, truncated: boolean}} Analysis
 * @param {string} text @param {Card[]} cards @param {Set<string>} reviewed @param {Skill[]} [skills]
 * @returns {Analysis}
 */
export function analyse(text, cards, reviewed, skills = SKILLS) {
  const mentioned = extractSkills(text, skills);
  const lists = mentioned.map((m) => {
    const skill = skills.find((s) => s.id === m.id);
    const list = cardsFor(skill, cards);
    return { m, list, ordered: [...list.filter((c) => !reviewed.has(c.tkey)), ...list.filter((c) => reviewed.has(c.tkey))] };
  });
  const found = lists.map(({ m, list }) => ({
    id: m.id, label: m.label, mentions: m.mentions,
    status: list.length >= 3 ? 'covered' : list.length >= 1 ? 'thin' : 'missing',
    cards: list.length, reviewed: list.filter((c) => reviewed.has(c.tkey)).length,
  }));
  // round robin: each skill's next card in turn, so one big skill cannot crowd the others out
  const deck = [], taken = new Set(), per = new Map();
  for (let round = 0; deck.length < MAX_DECK; round++) {
    let any = false;
    for (const { m, ordered } of lists) {
      if (deck.length >= MAX_DECK) break;
      if ((per.get(m.id) || 0) >= PER_SKILL) continue;
      let i = per.get(m.id + ':at') || 0;
      while (i < ordered.length && taken.has(ordered[i].tkey)) i++;
      per.set(m.id + ':at', i + 1);
      if (i >= ordered.length) continue;
      taken.add(ordered[i].tkey); deck.push(ordered[i]);
      per.set(m.id, (per.get(m.id) || 0) + 1); any = true;
    }
    if (!any) break;
  }
  return {
    found, deck, truncated: String(text).length > MAX_CHARS,
    gaps: {
      missing: found.filter((f) => f.status === 'missing').map((f) => f.label),
      thin: found.filter((f) => f.status === 'thin').map((f) => f.label),
      unreviewed: found.filter((f) => f.status === 'covered' && f.reviewed * 2 < f.cards).map((f) => f.label),
    },
  };
}

/** One flashcard link per guide, in deck order. @param {Card[]} deck */
export function deckLinks(deck) {
  const by = new Map();
  for (const c of deck) { if (!by.has(c.slug)) by.set(c.slug, []); by.get(c.slug).push(c); }
  return [...by.entries()].map(([slug, list]) => ({ guide: list[0].guide, count: list.length, href: deckHref(slug, list) }));
}

const KEY = 'study-match-v1';
/** Saves the result (skills and deck), never the posting. */
export function saveResult(storage, analysis, now) {
  try { storage.setItem(KEY, JSON.stringify({ at: now, skills: analysis.found.map((f) => f.id), deck: analysis.deck.map((c) => c.href) })); } catch { /* storage unavailable */ }
}
/** @returns {{at: string, skills: string[], deck: string[]} | null} */
export function readResult(storage) {
  try {
    const v = JSON.parse(storage.getItem(KEY) || 'null');
    return v && typeof v.at === 'string' && Array.isArray(v.skills) && Array.isArray(v.deck) ? v : null;
  } catch { return null; }
}
export function clearResult(storage) { try { storage.removeItem(KEY); } catch { /* ignore */ } }
