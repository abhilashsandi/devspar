// The interview-date planner: from today, a date, a role and the minutes a reader has each day, build a
// day-by-day plan out of their weak cards, the unreviewed core cards and the rest. Pure: today, the card bank
// and the reader's progress are passed in, so the plan is recomputed on every visit and corrects itself when
// the reader falls behind or gets ahead (today is always the first day).
import { deckHref, mulberry32, seedFrom, shuffle } from './bank.mjs';

/** @typedef {import('./bank.mjs').Card} Card */
/** @typedef {{kind: 'weak'|'core'|'other'|'review'|'mock'|'eve', label: string, minutes: number, cards: Card[], href: string}} Block */
/** @typedef {{date: string, kind: 'study'|'mock'|'eve', minutes: number, blocks: Block[]}} Day */
/** @typedef {{status: 'ok'|'today'|'past', daysLeft: number, days: Day[], totals: {cards: number, minutes: number, fits: boolean, dropped: {core: number, other: number}}}} Plan */

export const ROLES = [
  { id: 'frontend', label: 'Frontend', guides: ['javascript', 'typescript', 'react-training', 'nextjs', 'tailwind-css', 'web-platform', 'testing', 'performance-optimization', 'behavioural', 'whiteboard', 'bug-clinic'], crash: ['js', 'ts', 'react', 'next', 'css', 'web', 'test', 'soft'] },
  { id: 'fullstack', label: 'Full-stack', guides: ['interview-prep', 'javascript', 'typescript', 'react-training', 'nextjs', 'nodejs', 'sql', 'testing', 'web-platform', 'system-design', 'behavioural', 'whiteboard', 'bug-clinic'], crash: ['js', 'ts', 'react', 'next', 'node', 'db', 'web', 'test', 'sd', 'soft'] },
  { id: 'backend', label: 'Backend', guides: ['nodejs', 'sql', 'system-design', 'system-design-scale', 'architecture', 'aws', 'performance-optimization', 'testing', 'typescript', 'behavioural', 'whiteboard'], crash: ['node', 'db', 'sd', 'arch', 'scale', 'perf', 'aws', 'soft'] },
  { id: 'senior', label: 'Senior or lead full-stack', guides: ['interview-prep', 'react-training', 'nextjs', 'nodejs', 'sql', 'system-design', 'system-design-scale', 'architecture', 'aws', 'performance-optimization', 'ai-dev', 'behavioural', 'whiteboard'], crash: ['js', 'react', 'next', 'node', 'db', 'sd', 'arch', 'scale', 'perf', 'aws', 'soft'] },
];
export const MINUTES_CHOICES = [20, 30, 45, 60, 90];

const MS_DAY = 86400000;
const parts = (d) => d.split('-').map(Number);
/** Whole days from one YYYY-MM-DD date to another. Uses UTC on the parts, so daylight saving never shifts it. */
export function dayDiff(from, to) {
  const [fy, fm, fd] = parts(from), [ty, tm, td] = parts(to);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / MS_DAY);
}
export function addDays(date, n) {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
/** Minutes to read and say one card. */
export function minutesFor(card) {
  if (!card.words) return 2;
  return Math.min(6, Math.max(1, Math.round(card.words / 200 * 1.5)));
}

const SKIP_KINDS = new Set(['quiz', 'diagram']);
const plannable = (c) => c.sec !== 'review' && !SKIP_KINDS.has(c.kind);

function split(label, kind, cards, minutes) {
  const out = [];
  for (let i = 0; i < cards.length; i += 40) {
    const part = cards.slice(i, i + 40);
    out.push({ kind, label: cards.length > 40 ? `${label} · Part ${i / 40 + 1}` : label, minutes: part.reduce((a, c) => a + minutes(c), 0), cards: part, href: deckHref(part[0].slug, part) });
  }
  return out;
}

/** Cards of one day as blocks: weak first, then core, then the rest, each grouped by guide in order of appearance. */
function blocksFor(weakCards, others) {
  const out = [];
  const groups = (cards, kind, label) => {
    const by = new Map();
    for (const c of cards) { if (!by.has(c.slug)) by.set(c.slug, []); by.get(c.slug).push(c); }
    for (const list of by.values()) out.push(...split(`${label} · ${list[0].guide}`, kind, list, minutesFor));
  };
  groups(weakCards, 'weak', 'Weak cards');
  groups(others.filter((c) => c.core), 'core', 'Core');
  groups(others.filter((c) => !c.core), 'other', 'More');
  return out;
}

/** @param {{today: string, date: string, role: string, minutesPerDay: number, cards: Card[], reviewed: Set<string>, weak: Map<string, number>}} input @returns {Plan} */
export function buildPlan({ today, date, role, minutesPerDay, cards, reviewed, weak }) {
  const empty = (status, daysLeft) => ({ status, daysLeft, days: [], totals: { cards: 0, minutes: 0, fits: true, dropped: { core: 0, other: 0 } } });
  const daysLeft = dayDiff(today, date);
  if (daysLeft < 0) return empty('past', daysLeft);
  if (daysLeft === 0) return empty('today', 0);
  const r = ROLES.find((x) => x.id === role) || ROLES[1];

  // kinds of day
  const kinds = Array.from({ length: daysLeft }, () => 'study');
  kinds[daysLeft - 1] = 'eve';
  if (daysLeft >= 4) kinds[daysLeft - 2] = 'mock';
  if (daysLeft >= 10) kinds[Math.floor((daysLeft - 2) / 2)] = 'mock';

  // the queue: one entry per title, from the role's earliest guide
  const order = new Map(r.guides.map((g, i) => [g, i]));
  const roleCards = cards.filter((c) => order.has(c.slug) && plannable(c)).sort((a, b) => order.get(a.slug) - order.get(b.slug));
  const seen = new Set();
  const unique = [];
  for (const c of [...roleCards, ...cards.filter((c) => !order.has(c.slug) && plannable(c))]) {
    if (seen.has(c.tkey)) continue;
    seen.add(c.tkey); unique.push(c);
  }
  const isRole = (c) => order.has(c.slug);
  let weakQ = unique.filter((c) => weak.has(c.tkey));
  let coreQ = unique.filter((c) => isRole(c) && c.core && !reviewed.has(c.tkey) && !weak.has(c.tkey));
  let otherQ = unique.filter((c) => isRole(c) && !c.core && !reviewed.has(c.tkey) && !weak.has(c.tkey));

  const takeWeak = (budget, cap) => {
    const taken = [];
    let used = 0;
    while (weakQ.length && used + minutesFor(weakQ[0]) <= cap) { used += minutesFor(weakQ[0]); taken.push(weakQ.shift()); }
    if (!taken.length && weakQ.length && minutesFor(weakQ[0]) <= budget) taken.push(weakQ.shift());   // a single weak card is all that fits
    return taken;
  };

  const reviewGuides = r.guides.filter((g) => cards.some((c) => c.slug === g));
  let reviewAt = 0;
  const days = kinds.map((kind, i) => {
    const date2 = addDays(today, i);
    if (kind === 'eve') return { date: date2, kind, minutes: 0, blocks: [{ kind: 'eve', label: 'Night before', minutes: 0, cards: [], href: '/plan#eve' }] };
    if (kind === 'mock') {
      const blocks = [{ kind: 'mock', label: 'Mock round', minutes: 45, cards: [], href: '/mock' }];
      let minutes = 45;
      if (minutesPerDay > 45) {
        const w = takeWeak(minutesPerDay - 45, minutesPerDay - 45);
        blocks.push(...blocksFor(w, []));
        minutes += w.reduce((a, c) => a + minutesFor(c), 0);
      }
      return { date: date2, kind, minutes, blocks };
    }
    // a study day
    if (!weakQ.length && !coreQ.length && !otherQ.length) {
      const slug = reviewGuides.length ? reviewGuides[reviewAt++ % reviewGuides.length] : r.guides[0];
      const name = (cards.find((c) => c.slug === slug) || { guide: slug }).guide;
      return { date: date2, kind, minutes: minutesPerDay, blocks: [{ kind: 'review', label: `Flashcards: ${name}`, minutes: minutesPerDay, cards: [], href: '/' + slug }] };
    }
    const w = takeWeak(minutesPerDay, Math.floor(minutesPerDay * 0.3));
    let used = w.reduce((a, c) => a + minutesFor(c), 0);
    const rest = [];
    const queue = [coreQ, otherQ];
    outer: for (const q of queue) {
      while (q.length) {
        const m = minutesFor(q[0]);
        if (used + m > minutesPerDay) break outer;      // stop at the first card that does not fit
        used += m; rest.push(q.shift());
      }
    }
    if (!w.length && !rest.length) {                    // always take at least one card
      const fromQueue = coreQ.length || otherQ.length;
      const first = coreQ.length ? coreQ.shift() : otherQ.length ? otherQ.shift() : weakQ.shift();
      (fromQueue ? rest : w).push(first);
      used += minutesFor(first);
    }
    return { date: date2, kind, minutes: used, blocks: blocksFor(w, rest) };
  });

  const dropped = { core: weakQ.length + coreQ.length, other: otherQ.length };
  return {
    status: 'ok', daysLeft, days,
    totals: { cards: days.reduce((a, d) => a + d.blocks.reduce((b, k) => b + k.cards.length, 0), 0), minutes: days.reduce((a, d) => a + d.minutes, 0), fits: dropped.core === 0 && dropped.other === 0, dropped },
  };
}

/** The night-before list: crash-course sections, the weakest guides, the introduction, questions to ask, and a few practicalities. */
export function eveList(role, cards, weak) {
  const r = ROLES.find((x) => x.id === role) || ROLES[1];
  const items = r.crash.map((id) => {
    const c = cards.find((x) => x.slug === 'crash-course' && x.sec === id);
    return { label: 'Crash course: ' + (c ? c.secTitle : id), href: '/crash-course#' + id };
  });
  const byGuide = new Map();
  for (const c of cards) {
    if (!weak.has(c.tkey)) continue;
    const g = byGuide.get(c.slug) || { n: 0, name: c.guide };
    g.n++; byGuide.set(c.slug, g);
  }
  [...byGuide.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 3).forEach(([slug, g]) => items.push({ label: 'Weak cards: ' + g.name, href: `/${slug}#weak` }));
  items.push({ label: 'Your introduction', href: '/behavioural#bh2' }, { label: 'Questions to ask them', href: '/interview-prep#behavioral' });
  items.push(
    { label: 'Check the time, the link or the address, and who you are meeting.', href: null },
    { label: 'Have water, a charger, a pen and paper ready.', href: null },
    { label: 'Stop studying an hour before bed.', href: null },
  );
  return items;
}

/** Ten cards for the last half hour: weak core first, then reviewed core (shuffled by the date), then the rest of the core. */
export function warmupList({ role, date, cards, reviewed, weak }) {
  const r = ROLES.find((x) => x.id === role) || ROLES[1];
  const order = new Map(r.guides.map((g, i) => [g, i]));
  const pool = cards.filter((c) => order.has(c.slug) && c.core && c.kind === 'concept' && plannable(c)).sort((a, b) => order.get(a.slug) - order.get(b.slug));
  const seen = new Set();
  const core = pool.filter((c) => { if (seen.has(c.tkey)) return false; seen.add(c.tkey); return true; });
  const weakCore = core.filter((c) => weak.has(c.tkey));
  const done = shuffle(core.filter((c) => !weak.has(c.tkey) && reviewed.has(c.tkey)), mulberry32(seedFrom(date)));
  const rest = core.filter((c) => !weak.has(c.tkey) && !reviewed.has(c.tkey));
  const ten = [...weakCore, ...done, ...rest].slice(0, 10);
  const by = new Map();
  for (const c of ten) { if (!by.has(c.slug)) by.set(c.slug, []); by.get(c.slug).push(c); }
  const blocks = [...by.values()].flatMap((list) => split(`Warm-up · ${list[0].guide}`, 'core', list, minutesFor));
  return { blocks, prompts: ['Say your introduction once, out loud.', 'Pick the two questions you will ask.', 'One slow breath. Then read each question twice before you answer.'] };
}

const KEY = 'study-plan-v1';
/** @returns {{date: string, role: string, minutesPerDay: number} | null} */
export function readSettings(storage) {
  try {
    const v = JSON.parse(storage.getItem(KEY) || 'null');
    if (!v || typeof v.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return null;
    if (addDays(v.date, 0) !== v.date) return null;
    if (!ROLES.some((x) => x.id === v.role)) return null;
    if (!MINUTES_CHOICES.includes(v.minutesPerDay)) return null;
    return { date: v.date, role: v.role, minutesPerDay: v.minutesPerDay };
  } catch { return null; }
}
export function saveSettings(storage, settings) {
  try { storage.setItem(KEY, JSON.stringify(settings)); } catch { /* storage unavailable */ }
}
