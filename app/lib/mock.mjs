// Mock rounds: build a 45-minute interview from the card bank, and score it. Pure: the caller passes the
// seed, the cards and the storage, so Node can test every rule here.
import { mulberry32, shuffle } from './bank.mjs';

/** @typedef {import('./bank.mjs').Card} Card */
/** @typedef {{at: string, seed: number, total: number, segments: {id: string, score: number|null, seconds: number}[], cards: {tkey: string, href: string, q: string, rating: number}[]}} Entry */

export const SEGMENTS = [
  { id: 'behavioural', label: 'Behavioural', minutes: 8, count: 1 },
  { id: 'concepts', label: 'Concepts', minutes: 12, count: 4 },
  { id: 'whiteboard', label: 'Whiteboard', minutes: 8, count: 1 },
  { id: 'bug', label: 'Find the bug', minutes: 7, count: 1 },
  { id: 'sql', label: 'SQL puzzle', minutes: 8, count: 1 },
  { id: 'wrap', label: 'Your questions for them', minutes: 2, count: 0 },
];

export const RATINGS = [
  { value: 0, label: 'Missed' },
  { value: 1, label: 'Partial' },
  { value: 2, label: 'Solid' },
  { value: 3, label: 'Strong' },
];

const NOT_CONCEPT_SECTIONS = new Set(['behavioral', 'coding', 'review']);

/** @param {string} segmentId @param {Card[]} cards @returns {Card[]} */
export function poolFor(segmentId, cards) {
  switch (segmentId) {
    case 'behavioural': return cards.filter((c) => c.kind === 'behavioural');
    case 'concepts': return cards.filter((c) => c.slug === 'interview-prep' && c.core && c.kind === 'concept' && !NOT_CONCEPT_SECTIONS.has(c.sec));
    case 'whiteboard': return cards.filter((c) => c.kind === 'whiteboard');
    case 'bug': return cards.filter((c) => c.kind === 'bug');
    case 'sql': return cards.filter((c) => c.kind === 'sql-puzzle');
    default: return [];
  }
}

/**
 * @param {Card[]} cards
 * @param {{seed: number, avoid?: Set<string>}} opts
 */
export function buildRound(cards, { seed, avoid }) {
  const rng = mulberry32(seed);
  const segments = SEGMENTS.map((seg) => {
    let pool = poolFor(seg.id, cards);
    if (avoid && avoid.size) {
      const fresh = pool.filter((c) => !avoid.has(c.tkey));
      if (fresh.length >= seg.count) pool = fresh;     // too few left after removing recent ones: use them all
    }
    const order = shuffle(pool, rng);
    let chosen = [];
    if (seg.id === 'concepts') {
      const used = new Set();
      for (const c of order) {
        if (chosen.length >= seg.count) break;
        if (!used.has(c.sec)) { chosen.push(c); used.add(c.sec); }
      }
      for (const c of order) {
        if (chosen.length >= seg.count) break;
        if (!chosen.includes(c)) chosen.push(c);
      }
    } else chosen = order.slice(0, seg.count);
    return { ...seg, cards: chosen };
  });
  return { seed, segments };
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

/** @param {{id: string, minutes: number, seconds: number, ratings: number[]}[]} segments */
export function scoreRound(segments) {
  let weighted = 0, minutes = 0, weak = 0;
  const bySegment = segments.map((s) => {
    const has = s.ratings.length > 0;
    if (has) { weighted += s.minutes * (mean(s.ratings) / 3); minutes += s.minutes; }
    weak += s.ratings.filter((r) => r <= 1).length;
    return { id: s.id, score: has ? Math.round(mean(s.ratings) / 3 * 100) : null, overSeconds: Math.max(0, s.seconds - s.minutes * 60) };
  });
  const total = minutes ? Math.round(100 * weighted / minutes) : 0;
  const verdict = total >= 80 ? 'Ready' : total >= 60 ? 'Close' : 'Keep practising';
  return { total, verdict, bySegment, weak };
}

const KEY = 'study-mock-history-v1';

/** @returns {Entry[]} */
export function readHistory(storage) {
  try {
    const v = JSON.parse(storage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((e) => e && typeof e.total === 'number' && Array.isArray(e.cards)) : [];
  } catch { return []; }
}

/** Newest first, at most 20. @param {Entry} entry @returns {Entry[]} */
export function saveRound(storage, entry) {
  const next = [entry, ...readHistory(storage)].slice(0, 20);
  try { storage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  return next;
}

/** Title keys of the cards in the newest rounds, to avoid asking them again. */
export function recentKeys(history, rounds = 3) {
  return new Set(history.slice(0, rounds).flatMap((e) => e.cards.map((c) => c.tkey)));
}
