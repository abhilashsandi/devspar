import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCards, kindOf, readProgress, addWeak, deckHref, mulberry32, seedFrom, shuffle } from '../../app/lib/bank.mjs';
import { titleKey } from '../../app/lib/studyKeys.mjs';

const index = {
  pages: { 'interview-prep': 'Interview Prep', sql: 'Data and SQL', behavioural: 'Behavioural', 'bug-clinic': 'Bug Clinic', whiteboard: 'Whiteboard' },
  items: [
    ['sql', 'sq4', 1, '4. Query Puzzles', 'Puzzle: Find the second-highest salary', 'Return it.', 0, 120],
    ['sql', 'sq2', 0, '2. Indexing', 'Quiz: which index?', 'B.', 0, 60],
    ['sql', 'sq2', 1, '2. Indexing', 'Diagram: a B-tree', 'Shows it.', 0, 40],
    ['bug-clinic', 'bc1', 0, 'JavaScript: 15 Bugs', 'Bug: Three timers all log the same number', 'var.', 0, 80],
    ['behavioural', 'bh3', 2, '3. Ownership and Delivery', 'Tell me about a time you owned a delivery.', 'STAR.', 0, 500],
    ['whiteboard', 'wb2', 0, '2. JavaScript and the Browser', 'Explain the event loop', 'Draw it.', 0, 300],
    ['interview-prep', 'js', 3, 'JavaScript', 'What is a closure?', 'A function with its scope.', 1, 400],
  ],
};

test('kindOf applies the rules in order', () => {
  assert.equal(kindOf('sql', 'sq4', 'Quiz: x'), 'quiz');
  assert.equal(kindOf('sql', 'sq2', 'Diagram: x'), 'diagram');
  assert.equal(kindOf('sql', 'sq4', 'Puzzle: x'), 'sql-puzzle');
  assert.equal(kindOf('javascript', 'js', 'Puzzle: x'), 'concept');
  assert.equal(kindOf('bug-clinic', 'bc1', 'Bug: x'), 'bug');
  assert.equal(kindOf('behavioural', 'bh2', 'Tell me'), 'behavioural');
  assert.equal(kindOf('behavioural', 'bh8', 'Tell me'), 'behavioural');
  assert.equal(kindOf('behavioural', 'bh1', 'How it works'), 'concept');
  assert.equal(kindOf('whiteboard', 'wb7', 'Explain'), 'whiteboard');
  assert.equal(kindOf('whiteboard', 'wb1', 'How to'), 'concept');
});

test('toCards builds typed cards', () => {
  const cards = toCards(index);
  assert.equal(cards.length, 7);
  assert.deepEqual(cards.map((c) => c.kind), ['sql-puzzle', 'quiz', 'diagram', 'bug', 'behavioural', 'whiteboard', 'concept']);
  const c = cards[6];
  assert.equal(c.core, true);
  assert.equal(c.words, 400);
  assert.equal(c.key, 'js:3');
  assert.equal(c.href, '/interview-prep#js:3');
  assert.equal(c.guide, 'Interview Prep');
  assert.equal(c.secTitle, 'JavaScript');
  assert.equal(c.tkey, titleKey('What is a closure?'));
});

test('an item with the old six fields still works', () => {
  const c = toCards({ pages: {}, items: [['sql', 'sq1', 0, 'Basics', 'What is a join?', 'It joins.']] })[0];
  assert.equal(c.core, false);
  assert.equal(c.words, 0);
  assert.equal(c.guide, 'sql');
});

test('an explicit title key in the ninth field wins', () => {
  const c = toCards({ pages: {}, items: [['nextjs', 'a', 0, 'S', 'A plain <img> tag', '', 0, 5, 'a plain img tag']] })[0];
  assert.equal(c.tkey, 'a plain img tag');
});

const store = (init) => ({ data: { ...init }, getItem(k) { return k in this.data ? this.data[k] : null; }, setItem(k, v) { this.data[k] = String(v); } });

test('readProgress is empty when storage throws or holds junk', () => {
  const bad = { getItem() { throw new Error('blocked'); } };
  const r = readProgress(bad);
  assert.equal(r.reviewed.size, 0);
  assert.equal(r.weak.size, 0);
  const junk = readProgress(store({ 'study-reviewed-titles-v1': '{bad', 'study-weak-titles-v1': '[1,2]' }));
  assert.equal(junk.reviewed.size, 0);
  assert.equal(junk.weak.size, 0);
});

test('readProgress reads both stores', () => {
  const r = readProgress(store({ 'study-reviewed-titles-v1': '{"a b":1}', 'study-weak-titles-v1': '{"c d":2}' }));
  assert.equal(r.reviewed.has('a b'), true);
  assert.equal(r.weak.get('c d'), 2);
});

test('addWeak adds one to each key', () => {
  const s = store({ 'study-weak-titles-v1': '{"c d":2}' });
  addWeak(s, ['c d', 'e f']);
  assert.deepEqual(JSON.parse(s.data['study-weak-titles-v1']), { 'c d': 3, 'e f': 1 });
});

test('deckHref lists at most 40 keys', () => {
  const many = toCards({ pages: {}, items: Array.from({ length: 45 }, (_, i) => ['sql', 'sq1', i, 'B', 'Q' + i, '', 0, 10]) });
  const h = deckHref('sql', many);
  assert.ok(h.startsWith('/sql#deck='));
  assert.equal(h.split('#deck=')[1].split(',').length, 40);
});

test('the random helpers are repeatable and lossless', () => {
  const a = mulberry32(42), b = mulberry32(42);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  const items = [1, 2, 3, 4, 5, 6];
  const out = shuffle(items, mulberry32(7));
  assert.deepEqual([...out].sort(), items);
  assert.deepEqual(items, [1, 2, 3, 4, 5, 6]);
  assert.equal(seedFrom('check'), seedFrom('check'));
  assert.notEqual(seedFrom('check'), seedFrom('other'));
});
