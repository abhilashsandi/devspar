// The card bank: every question of every public guide, as the search index lists it, plus helpers the
// practice tools share (progress, weak cards, deck links, seeded shuffling). No DOM, no clock, no
// Math.random: callers pass storage, fetch and a seeded generator in, so Node can test everything here.
import { titleKey } from './studyKeys.mjs';

/**
 * @typedef {'behavioural'|'whiteboard'|'bug'|'sql-puzzle'|'quiz'|'diagram'|'concept'} Kind
 * @typedef {{slug:string, sec:string, idx:number, secTitle:string, q:string, summary:string, core:boolean, words:number, tkey:string, kind:Kind, guide:string, key:string, href:string}} Card
 */

/** @returns {Kind} first matching rule wins */
export function kindOf(slug, sec, q) {
  if (/^Quiz:/.test(q)) return 'quiz';
  if (/^Diagram:/.test(q)) return 'diagram';
  if (/^Puzzle:/.test(q) && slug === 'sql') return 'sql-puzzle';
  if (/^Bug:/.test(q) && slug === 'bug-clinic') return 'bug';
  if (slug === 'behavioural' && /^bh[2-8]$/.test(sec)) return 'behavioural';
  if (slug === 'whiteboard' && /^wb[2-7]$/.test(sec)) return 'whiteboard';
  return 'concept';
}

/**
 * Items are [slug, sectionId, index, sectionTitle, question, summary, flags?, words?, titleKey?].
 * flags bit 1 = core. The ninth field is present only when the question's displayed text would key
 * differently from the original title (markup that was escaped in the title).
 * @param {{pages: Record<string,string>, items: any[][]}} index
 * @returns {Card[]}
 */
export function toCards(index) {
  return index.items.map((it) => {
    const [slug, sec, idx, secTitle, q, summary] = it;
    return {
      slug, sec, idx, secTitle, q, summary,
      core: ((it[6] || 0) & 1) === 1,
      words: it[7] || 0,
      tkey: it[8] || titleKey(q),
      kind: kindOf(slug, sec, q),
      guide: index.pages[slug] || slug,
      key: sec + ':' + idx,
      href: '/' + slug + '#' + sec + ':' + idx,
    };
  });
}

let bankPromise = null;
/** Fetches the index once per page load. */
export function loadBank(fetchImpl = fetch) {
  if (!bankPromise) {
    bankPromise = fetchImpl('/search-index.json').then((r) => {
      if (!r.ok) throw new Error('index ' + r.status);
      return r.json();
    }).then(toCards).catch((e) => { bankPromise = null; throw e; });
  }
  return bankPromise;
}

const REVIEWED_KEY = 'study-reviewed-titles-v1';
const WEAK_KEY = 'study-weak-titles-v1';

function readObject(storage, key) {
  try {
    const v = JSON.parse(storage.getItem(key) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch { return {}; }
}

/** @returns {{reviewed: Set<string>, weak: Map<string, number>}} */
export function readProgress(storage) {
  const reviewed = new Set(Object.keys(readObject(storage, REVIEWED_KEY)));
  const weak = new Map(Object.entries(readObject(storage, WEAK_KEY)).map(([k, v]) => [k, Number(v) || 1]));
  return { reviewed, weak };
}

/** Same shape the engine's markWeak writes: title key to a count. */
export function addWeak(storage, tkeys) {
  const weak = readObject(storage, WEAK_KEY);
  for (const k of tkeys) weak[k] = (Number(weak[k]) || 0) + 1;
  try { storage.setItem(WEAK_KEY, JSON.stringify(weak)); } catch { /* storage unavailable */ }
}

/** A link that opens up to 40 of the cards as a flashcard deck in their guide. */
export function deckHref(slug, cards) {
  return '/' + slug + '#deck=' + cards.slice(0, 40).map((c) => c.key).join(',');
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFrom(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

/** Fisher-Yates on a copy. */
export function shuffle(items, rng) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
