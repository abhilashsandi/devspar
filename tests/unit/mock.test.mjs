import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SEGMENTS, RATINGS, poolFor, buildRound, scoreRound, readHistory, saveRound, recentKeys } from '../../app/lib/mock.mjs';

let n = 0;
const card = (over) => {
  n++;
  const c = { slug: 'interview-prep', sec: 'js', idx: n, secTitle: 'S', q: 'Question ' + n, summary: '', core: false, words: 100, kind: 'concept', guide: 'G', ...over };
  c.tkey = c.tkey || 'question ' + n;
  c.key = c.sec + ':' + c.idx;
  c.href = '/' + c.slug + '#' + c.key;
  return c;
};
const many = (count, over) => Array.from({ length: count }, () => card(over));
const bank = () => [
  ...many(6, { slug: 'behavioural', sec: 'bh3', kind: 'behavioural' }),
  ...['js', 'react', 'node', 'db', 'sysdesign'].flatMap((sec) => many(4, { sec, core: true })),
  ...many(3, { sec: 'behavioral', core: true }),                      // excluded from concepts
  ...many(2, { sec: 'coding', core: true }),                          // excluded from concepts
  ...many(5, { slug: 'whiteboard', sec: 'wb2', kind: 'whiteboard' }),
  ...many(5, { slug: 'bug-clinic', sec: 'bc1', kind: 'bug' }),
  ...many(3, { slug: 'sql', sec: 'sq4', kind: 'sql-puzzle' }),
];
const keys = (round) => round.segments.flatMap((s) => s.cards.map((c) => c.key));

test('the segments add up to 45 minutes and eight questions', () => {
  assert.equal(SEGMENTS.reduce((a, s) => a + s.minutes, 0), 45);
  assert.equal(SEGMENTS.reduce((a, s) => a + s.count, 0), 8);
  assert.deepEqual(RATINGS.map((r) => r.value), [0, 1, 2, 3]);
});

test('pools follow the table', () => {
  const b = bank();
  assert.equal(poolFor('behavioural', b).length, 6);
  assert.equal(poolFor('concepts', b).length, 20);
  assert.equal(poolFor('whiteboard', b).length, 5);
  assert.equal(poolFor('bug', b).length, 5);
  assert.equal(poolFor('sql', b).length, 3);
  assert.equal(poolFor('wrap', b).length, 0);
});

test('the same seed gives the same round, another seed another', () => {
  const b = bank();
  assert.deepEqual(keys(buildRound(b, { seed: 7 })), keys(buildRound(b, { seed: 7 })));
  assert.notDeepEqual(keys(buildRound(b, { seed: 7 })), keys(buildRound(b, { seed: 8 })));
});

test('every segment has its count, no question repeats, concepts span four sections', () => {
  const round = buildRound(bank(), { seed: 3 });
  for (const s of round.segments) assert.equal(s.cards.length, s.count, s.id);
  const all = round.segments.flatMap((s) => s.cards.map((c) => c.tkey));
  assert.equal(new Set(all).size, all.length);
  const concepts = round.segments.find((s) => s.id === 'concepts').cards;
  assert.equal(new Set(concepts.map((c) => c.sec)).size, 4);
});

test('recently used cards are avoided, but a small pool still fills the segment', () => {
  const b = bank();
  const sql = b.filter((c) => c.kind === 'sql-puzzle');
  const all = buildRound(b, { seed: 1, avoid: new Set(sql.map((c) => c.tkey)) });
  assert.equal(all.segments.find((s) => s.id === 'sql').cards.length, 1);
  const two = buildRound(b, { seed: 1, avoid: new Set(sql.slice(0, 2).map((c) => c.tkey)) });
  assert.equal(two.segments.find((s) => s.id === 'sql').cards[0].tkey, sql[2].tkey);
});

test('scoreRound weights by minutes and counts weak ratings', () => {
  const r = scoreRound([
    { id: 'behavioural', minutes: 8, seconds: 480, ratings: [3] },
    { id: 'concepts', minutes: 12, seconds: 720, ratings: [3, 3, 0, 0] },
    { id: 'whiteboard', minutes: 8, seconds: 480, ratings: [2] },
    { id: 'bug', minutes: 7, seconds: 420, ratings: [1] },
    { id: 'sql', minutes: 8, seconds: 500, ratings: [0] },
    { id: 'wrap', minutes: 2, seconds: 100, ratings: [] },
  ]);
  assert.deepEqual(r.bySegment.map((s) => s.score), [100, 50, 67, 33, 0, null]);
  assert.equal(r.total, 50);
  assert.equal(r.verdict, 'Keep practising');
  assert.equal(r.weak, 4);
  assert.equal(r.bySegment[4].overSeconds, 20);
  assert.equal(r.bySegment[0].overSeconds, 0);
});

test('verdict bands', () => {
  const all = (v) => scoreRound([{ id: 'concepts', minutes: 12, seconds: 1, ratings: [v] }]);
  assert.deepEqual([all(3).total, all(3).verdict], [100, 'Ready']);
  assert.equal(all(2).verdict, 'Close');      // 67
  assert.equal(all(1).verdict, 'Keep practising');
  assert.equal(scoreRound([]).total, 0);
});

const store = (init) => ({ data: { ...init }, getItem(k) { return k in this.data ? this.data[k] : null; }, setItem(k, v) { this.data[k] = String(v); } });
const entry = (i, tkeys = []) => ({ at: '2026-11-0' + (i % 9 + 1), seed: i, total: 50 + i, segments: [], cards: tkeys.map((t) => ({ tkey: t, href: '/x', q: t, rating: 2 })) });

test('history: bad data reads as empty, saves newest first and keeps 20', () => {
  assert.deepEqual(readHistory(store({ 'study-mock-history-v1': '{bad' })), []);
  assert.deepEqual(readHistory(store({ 'study-mock-history-v1': '{"a":1}' })), []);
  const s = store({});
  let h = [];
  for (let i = 0; i < 21; i++) h = saveRound(s, entry(i));
  assert.equal(h.length, 20);
  assert.equal(h[0].seed, 20);
  assert.equal(readHistory(s).length, 20);
});

test('recentKeys unions the newest three rounds', () => {
  const h = [entry(4, ['a']), entry(3, ['b']), entry(2, ['c']), entry(1, ['d'])];
  assert.deepEqual([...recentKeys(h)].sort(), ['a', 'b', 'c']);
});
