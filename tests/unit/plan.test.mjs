import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, dayDiff, addDays, minutesFor, buildPlan, eveList, warmupList, readSettings, saveSettings } from '../../app/lib/plan.mjs';

let n = 0;
const names = { 'interview-prep': 'Interview Prep', javascript: 'JavaScript', sql: 'Data and SQL', behavioural: 'Behavioural', 'crash-course': 'Crash Course', nodejs: 'Node.js' };
const card = (over) => {
  n++;
  const c = { slug: 'interview-prep', sec: 'js', idx: n, secTitle: 'S', q: 'Question ' + n, summary: '', core: false, words: 400, kind: 'concept', ...over };
  c.guide = names[c.slug] || c.slug;
  c.tkey = c.tkey || 'question ' + n;
  c.key = c.sec + ':' + c.idx;
  c.href = '/' + c.slug + '#' + c.key;
  return c;
};
const many = (count, over) => Array.from({ length: count }, () => card(over));
const none = { reviewed: new Set(), weak: new Map() };
const base = { today: '2026-11-10', role: 'fullstack', minutesPerDay: 45 };
const flat = (plan) => plan.days.flatMap((d) => d.blocks.flatMap((b) => b.cards));

test('date arithmetic works on calendar days', () => {
  assert.equal(dayDiff('2026-12-30', '2027-01-02'), 3);
  assert.equal(dayDiff('2026-03-07', '2026-03-09'), 2);          // across a daylight-saving date in many zones
  assert.equal(dayDiff('2026-11-10', '2026-11-10'), 0);
  assert.equal(dayDiff('2026-11-10', '2026-11-09'), -1);
  assert.equal(addDays('2027-02-27', 2), '2027-03-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('minutesFor', () => {
  for (const [words, m] of [[0, 2], [100, 1], [400, 3], [2000, 6]]) assert.equal(minutesFor({ words }), m, String(words));
});

test('status: past, today, tomorrow', () => {
  const cards = many(3, { core: true });
  assert.equal(buildPlan({ ...base, date: '2026-11-09', cards, ...none }).status, 'past');
  assert.equal(buildPlan({ ...base, date: '2026-11-10', cards, ...none }).status, 'today');
  const t = buildPlan({ ...base, date: '2026-11-11', cards, ...none });
  assert.equal(t.status, 'ok');
  assert.deepEqual(t.days.map((d) => d.kind), ['eve']);
});

test('kinds of day', () => {
  const cards = many(3, { core: true });
  assert.deepEqual(buildPlan({ ...base, date: '2026-11-14', cards, ...none }).days.map((d) => d.kind), ['study', 'study', 'mock', 'eve']);
  const k = buildPlan({ ...base, date: '2026-11-22', cards, ...none }).days.map((d) => d.kind);
  assert.equal(k.length, 12);
  assert.deepEqual([k[5], k[10], k[11]], ['mock', 'mock', 'eve']);
  assert.equal(k.filter((x) => x === 'mock').length, 2);
});

test('weak cards first, then core, then the rest; core always before other', () => {
  const weak = many(2, { sec: 'react', core: true });
  const core = many(3, { slug: 'javascript', core: true });
  const other = many(5, { slug: 'sql' });
  const plan = buildPlan({ ...base, date: '2026-11-16', cards: [...other, ...core, ...weak], reviewed: new Set(), weak: new Map(weak.map((c) => [c.tkey, 1])) });
  const day1 = plan.days[0];
  assert.equal(day1.blocks[0].kind, 'weak');
  const seq = flat(plan);
  const lastCore = Math.max(...core.map((c) => seq.indexOf(c)));
  const firstOther = Math.min(...other.map((c) => seq.indexOf(c)).filter((i) => i >= 0));
  assert.ok(lastCore < firstOther, 'core before other');
});

test('weak cards take at most 30% of a study day, unless one card is all that fits', () => {
  const weak = many(10, { core: true, words: 400 });                      // 3 minutes each
  const p = buildPlan({ ...base, date: '2026-11-14', cards: weak, reviewed: new Set(), weak: new Map(weak.map((c) => [c.tkey, 1])) });
  const w = p.days[0].blocks.filter((b) => b.kind === 'weak').reduce((a, b) => a + b.minutes, 0);
  assert.ok(w <= 13 && w > 0, String(w));                                // 30% of 45 is 13
  const big = many(2, { core: true, words: 2000 });                      // 6 minutes each
  const q = buildPlan({ ...base, minutesPerDay: 20, date: '2026-11-14', cards: big, reviewed: new Set(), weak: new Map(big.map((c) => [c.tkey, 1])) });
  const w2 = q.days[0].blocks.filter((b) => b.kind === 'weak').reduce((a, b) => a + b.minutes, 0);
  assert.equal(w2, 6);
});

test('a title appears once, from the role’s earliest guide', () => {
  const a = card({ slug: 'javascript', tkey: 'same', core: true }), b = card({ slug: 'interview-prep', tkey: 'same', core: true });
  const full = flat(buildPlan({ ...base, date: '2026-11-14', cards: [a, b], ...none }));
  assert.deepEqual(full.map((c) => c.slug), ['interview-prep']);
  const front = flat(buildPlan({ ...base, role: 'frontend', date: '2026-11-14', cards: [a, b], ...none }));
  assert.deepEqual(front.map((c) => c.slug), ['javascript']);
});

test('review sections, quizzes and diagrams are never planned', () => {
  const skip = [card({ sec: 'review', core: true }), card({ kind: 'quiz', core: true }), card({ kind: 'diagram', core: true })];
  assert.equal(flat(buildPlan({ ...base, date: '2026-11-14', cards: [...skip, card({ core: true })], ...none })).length, 1);
});

test('a plan that does not fit says what is dropped, non-core first', () => {
  const core = many(10, { core: true });
  const other = many(290);
  const p = buildPlan({ ...base, minutesPerDay: 30, date: '2026-11-13', cards: [...core, ...other], ...none });
  assert.equal(p.daysLeft, 3);
  assert.equal(p.totals.fits, false);
  assert.ok(p.totals.dropped.other > 0);
  assert.equal(p.totals.dropped.core, 0);
});

test('everything reviewed: review blocks fill the study days', () => {
  const cards = many(6, { core: true });
  const p = buildPlan({ ...base, date: '2026-11-15', cards, reviewed: new Set(cards.map((c) => c.tkey)), weak: new Map() });
  assert.equal(p.totals.cards, 0);
  for (const d of p.days.filter((x) => x.kind === 'study')) assert.deepEqual(d.blocks.map((b) => b.kind), ['review']);
});

test('a block of more than 40 cards is split into parts that each fit a deck link', () => {
  const cards = many(45, { core: true, words: 0 });                       // 2 minutes each
  const p = buildPlan({ ...base, minutesPerDay: 200, date: '2026-11-15', cards, ...none });
  const blocks = p.days[0].blocks.filter((b) => b.kind === 'core');
  assert.deepEqual(blocks.map((b) => b.cards.length), [40, 5]);
  assert.match(blocks[0].label, /Part 1$/);
  for (const b of blocks) assert.ok(b.href.split('#deck=')[1].split(',').length <= 40);
});

test('a mock day holds a round, and weak cards in the spare minutes', () => {
  const weak = many(4, { core: true });
  const p = buildPlan({ ...base, minutesPerDay: 90, date: '2026-11-14', cards: weak, reviewed: new Set(), weak: new Map(weak.map((c) => [c.tkey, 1])) });
  const mock = p.days.find((d) => d.kind === 'mock');
  assert.equal(mock.blocks[0].kind, 'mock');
  assert.equal(mock.blocks[0].href, '/mock');
  assert.ok(mock.minutes >= 45);
});

test('the night-before list and the warm-up', () => {
  const crash = ['node', 'db', 'sd', 'arch', 'scale', 'perf', 'aws', 'soft'].map((sec) => card({ slug: 'crash-course', sec, secTitle: sec.toUpperCase() + ' · 10 min' }));
  const weakCards = many(3, { slug: 'sql' });
  const e = eveList('backend', [...crash, ...weakCards], new Map(weakCards.map((c) => [c.tkey, 1])));
  assert.equal(e[0].href, '/crash-course#node');
  assert.equal(e[0].label, 'Crash course: NODE · 10 min');
  assert.ok(e.some((x) => x.href === '/sql#weak'));
  assert.deepEqual(e.slice(-3).map((x) => x.href), [null, null, null]);
  assert.equal(e.slice(-3)[2].label, 'Stop studying an hour before bed.');

  const pool = many(20, { core: true });
  const reviewed = new Set(pool.map((c) => c.tkey));
  const w = warmupList({ role: 'fullstack', date: '2026-11-20', cards: pool, reviewed, weak: new Map() });
  const ten = w.blocks.flatMap((b) => b.cards).map((c) => c.tkey);
  assert.equal(ten.length, 10);
  assert.deepEqual(ten, warmupList({ role: 'fullstack', date: '2026-11-20', cards: pool, reviewed, weak: new Map() }).blocks.flatMap((b) => b.cards).map((c) => c.tkey));
  assert.notDeepEqual(ten, warmupList({ role: 'fullstack', date: '2026-11-21', cards: pool, reviewed, weak: new Map() }).blocks.flatMap((b) => b.cards).map((c) => c.tkey));
  assert.equal(w.prompts.length, 3);
});

test('settings: round trip, and bad values read as null', () => {
  const s = { d: {}, getItem(k) { return k in this.d ? this.d[k] : null; }, setItem(k, v) { this.d[k] = String(v); } };
  saveSettings(s, { date: '2026-12-01', role: 'senior', minutesPerDay: 60 });
  assert.deepEqual(readSettings(s), { date: '2026-12-01', role: 'senior', minutesPerDay: 60 });
  for (const bad of ['{bad', '{"date":"2026-13-01","role":"senior","minutesPerDay":60}', '{"date":"2026-12-01","role":"nobody","minutesPerDay":60}', '{"date":"2026-12-01","role":"senior","minutesPerDay":61}', '{"date":"tomorrow","role":"senior","minutesPerDay":60}']) {
    assert.equal(readSettings({ getItem: () => bad }), null, bad);
  }
  assert.equal(readSettings({ getItem() { throw new Error('blocked'); } }), null);
  assert.equal(ROLES.length, 4);
});
