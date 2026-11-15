// The story bank: STAR stories a reader writes for themselves, checked for the shape interviewers look for
// (the action is most of it, the result has a number, it fits two minutes), and mapped to competencies.
// Stories live only in the reader's browser. Pure: no clock, no DOM, storage is passed in.

/** @typedef {{id: string, title: string, competencies: string[], s: string, t: string, a: string, r: string, updatedAt: string}} Story */

export const COMPETENCIES = [
  { id: 'ownership', label: 'Ownership and delivery', sec: 'bh3' },
  { id: 'collaboration', label: 'Collaboration and conflict', sec: 'bh4' },
  { id: 'leadership', label: 'Leadership and mentoring', sec: 'bh5' },
  { id: 'growth', label: 'Failure, growth and self-awareness', sec: 'bh6' },
  { id: 'judgement', label: 'Judgement and values', sec: 'bh7' },
];
const KNOWN = new Set(COMPETENCIES.map((c) => c.id));
const FILE_ERROR = 'That is not a DevSpar story file.';

export const countWords = (text) => String(text).trim().split(/\s+/).filter(Boolean).length;

/**
 * @param {Story} story
 * @returns {{words: {s: number, t: number, a: number, r: number, total: number}, actionShare: number, seconds: number, ready: boolean, checks: {id: string, ok: boolean, text: string}[]}}
 */
export function analyse(story) {
  const words = { s: countWords(story.s), t: countWords(story.t), a: countWords(story.a), r: countWords(story.r) };
  words.total = words.s + words.t + words.a + words.r;
  const total = words.total;
  const actionShare = total ? words.a / total : 0;
  const seconds = Math.round(total / 150 * 60);
  const pct = (x) => Math.round(x * 100);
  if (total < 30) return { words, actionShare, seconds, ready: false, checks: [] };

  const I = (String(story.a).match(/\bI\b/g) || []).length, we = (String(story.a).match(/\bwe\b/gi) || []).length;
  const setup = words.s + words.t;
  const checks = [
    words.a * 2 >= total
      ? { id: 'action-share', ok: true, text: `The action is ${pct(actionShare)}% of the story.` }
      : { id: 'action-share', ok: false, text: `The action is ${pct(actionShare)}% of the story. Aim for at least half: say what you did, step by step.` },
    /\d/.test(story.r)
      ? { id: 'number', ok: true, text: 'The result has a number.' }
      : { id: 'number', ok: false, text: 'Add a number to the result: a percentage, a time saved, a count.' },
    total >= 180 && total <= 400
      ? { id: 'length', ok: true, text: `About ${seconds} seconds to say.` }
      : { id: 'length', ok: false, text: `This takes about ${seconds} seconds to say. Aim for 75 seconds to two and a half minutes.` },
    I >= we
      ? { id: 'first-person', ok: true, text: 'You say “I” in the action.' }
      : { id: 'first-person', ok: false, text: 'You say “we” more than “I” in the action. Say what you did yourself.' },
    setup * 10 <= total * 3
      ? { id: 'setup-short', ok: true, text: `The set-up is ${pct(setup / total)}% of the story.` }
      : { id: 'setup-short', ok: false, text: `The situation and task are ${pct(setup / total)}% of the story. Keep them under a third.` },
  ];
  return { words, actionShare, seconds, ready: true, checks };
}

/** One row per competency, in table order, with how many stories name it. */
export function coverage(stories) {
  return COMPETENCIES.map((c) => ({ ...c, count: stories.filter((s) => s.competencies.includes(c.id)).length }));
}

const newestFirst = (list) => list.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));
export const upsert = (stories, story) => newestFirst([...stories.filter((s) => s.id !== story.id), story]);
export const remove = (stories, id) => stories.filter((s) => s.id !== id);

export const exportJson = (stories, now) => JSON.stringify({ app: 'devspar-stories', version: 1, exportedAt: now, stories }, null, 2);

const text = (v) => typeof v === 'string';
function clean(e) {
  if (!e || !['id', 'title', 's', 't', 'a', 'r', 'updatedAt'].every((k) => text(e[k])) || !Array.isArray(e.competencies)) return null;
  return { id: e.id, title: e.title, competencies: e.competencies.filter((c) => KNOWN.has(c)), s: e.s, t: e.t, a: e.a, r: e.r, updatedAt: e.updatedAt };
}

/**
 * Merges a story file into the stories already saved. An entry replaces one with the same id only when it is newer.
 * @returns {{stories: Story[], added: number, updated: number, skipped: number}}
 */
export function importJson(raw, existing) {
  if (typeof raw !== 'string' || raw.length > 1_000_000) throw new Error(FILE_ERROR);
  let file;
  try { file = JSON.parse(raw); } catch { throw new Error(FILE_ERROR); }
  if (!file || file.app !== 'devspar-stories' || !Array.isArray(file.stories)) throw new Error(FILE_ERROR);
  let list = existing.slice(), added = 0, updated = 0, skipped = 0;
  for (const entry of file.stories) {
    const s = clean(entry);
    if (!s) { skipped++; continue; }
    const have = list.find((x) => x.id === s.id);
    if (!have) { list.push(s); added++; }
    else if (s.updatedAt > have.updatedAt) { list = list.map((x) => (x.id === s.id ? s : x)); updated++; }
    else skipped++;
  }
  return { stories: newestFirst(list), added, updated, skipped };
}

export const toText = (s) => `${s.title}\n\nSituation:\n${s.s}\n\nTask:\n${s.t}\n\nAction:\n${s.a}\n\nResult:\n${s.r}`;

const KEY = 'study-stories-v1';
/** @returns {Story[]} */
export function readStories(storage) {
  try {
    const v = JSON.parse(storage.getItem(KEY) || '[]');
    return Array.isArray(v) ? newestFirst(v.map(clean).filter(Boolean)) : [];
  } catch { return []; }
}
/** @returns {boolean} false when the browser would not store it */
export function writeStories(storage, stories) {
  try { storage.setItem(KEY, JSON.stringify(stories)); return true; } catch { return false; }
}
