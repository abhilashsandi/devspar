import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMPETENCIES, countWords, analyse, coverage, upsert, remove, exportJson, importJson, toText, readStories, writeStories } from '../../app/lib/stories.mjs';

const w = (n, word = 'x') => Array(n).fill(word).join(' ');
const story = (over = {}) => ({ id: 'a', title: 'T', competencies: ['ownership'], s: w(20), t: w(20), a: 'I I I ' + w(137), r: '40% ' + w(19), updatedAt: '2026-11-01T00:00:00.000Z', ...over });
const check = (a, id) => a.checks.find((c) => c.id === id);

test('countWords counts runs of non-space characters', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('  one   two\nthree '), 3);
});

test('a well-shaped story passes every check', () => {
  const a = analyse(story());
  assert.deepEqual(a.words, { s: 20, t: 20, a: 140, r: 20, total: 200 });
  assert.equal(a.actionShare, 0.7);
  assert.equal(a.seconds, 80);
  assert.equal(a.ready, true);
  assert.equal(a.checks.length, 5);
  assert.ok(a.checks.every((c) => c.ok), JSON.stringify(a.checks));
  assert.equal(check(a, 'action-share').text, 'The action is 70% of the story.');
  assert.equal(check(a, 'number').text, 'The result has a number.');
  assert.equal(check(a, 'length').text, 'About 80 seconds to say.');
  assert.equal(check(a, 'first-person').text, 'You say “I” in the action.');
  assert.equal(check(a, 'setup-short').text, 'The set-up is 20% of the story.');
});

test('action share', () => {
  const a = analyse(story({ s: w(70), t: w(70), a: w(60), r: w(0) }));
  const c = check(a, 'action-share');
  assert.equal(c.ok, false);
  assert.equal(c.text, 'The action is 30% of the story. Aim for at least half: say what you did, step by step.');
  assert.equal(check(analyse(story({ s: w(50), t: w(50), a: w(100), r: w(0) })), 'action-share').ok, true);   // exactly half
});

test('a number in the result', () => {
  const c = check(analyse(story({ r: w(20) })), 'number');
  assert.equal(c.ok, false);
  assert.equal(c.text, 'Add a number to the result: a percentage, a time saved, a count.');
});

test('length: 180 to 400 words', () => {
  const total = (n) => analyse(story({ s: w(20), t: w(20), a: 'I ' + w(n - 61), r: w(20) }));
  assert.equal(check(total(179), 'length').ok, false);
  assert.equal(check(total(180), 'length').ok, true);
  assert.equal(check(total(400), 'length').ok, true);
  const long = check(total(401), 'length');
  assert.equal(long.ok, false);
  assert.equal(long.text, 'This takes about 160 seconds to say. Aim for 75 seconds to two and a half minutes.');
});

test('first person in the action', () => {
  const c = check(analyse(story({ a: 'we We I ' + w(137) })), 'first-person');
  assert.equal(c.ok, false);
  assert.equal(c.text, 'You say “we” more than “I” in the action. Say what you did yourself.');
  assert.equal(check(analyse(story({ a: 'It Item ' + w(138) })), 'first-person').ok, true, '"It" is not "I"');
  assert.equal(check(analyse(story({ a: 'we I I ' + w(137) })), 'first-person').ok, true);
});

test('the set-up must stay under a third', () => {
  assert.equal(check(analyse(story({ s: w(31), t: w(30), a: w(120), r: w(19) })), 'setup-short').ok, false);   // 61 of 200
  assert.equal(check(analyse(story({ s: w(30), t: w(30), a: w(121), r: w(19) })), 'setup-short').ok, true);    // 60 of 200
  assert.equal(check(analyse(story({ s: w(31), t: w(30), a: w(120), r: w(19) })), 'setup-short').text, 'The situation and task are 31% of the story. Keep them under a third.');
});

test('under 30 words nothing is judged yet', () => {
  const a = analyse(story({ s: w(10), t: w(10), a: w(9), r: '' }));
  assert.equal(a.words.total, 29);
  assert.equal(a.ready, false);
  assert.deepEqual(a.checks, []);
});

test('coverage counts a story under each competency it names', () => {
  const rows = coverage([story({ competencies: ['ownership', 'growth'] }), story({ id: 'b', competencies: ['ownership'] }), story({ id: 'c', competencies: [] })]);
  assert.deepEqual(rows.map((r) => [r.id, r.count]), [['ownership', 2], ['collaboration', 0], ['leadership', 0], ['growth', 1], ['judgement', 0]]);
  assert.deepEqual(COMPETENCIES.map((c) => c.sec), ['bh3', 'bh4', 'bh5', 'bh6', 'bh7']);
});

test('upsert and remove', () => {
  const a = story({ id: 'a', updatedAt: '2026-11-01T00:00:00.000Z' }), b = story({ id: 'b', updatedAt: '2026-11-02T00:00:00.000Z' });
  const list = upsert(upsert([], a), b);
  assert.deepEqual(list.map((s) => s.id), ['b', 'a']);
  assert.equal(upsert(list, { ...a, title: 'New', updatedAt: '2026-11-05T00:00:00.000Z' })[0].title, 'New');
  assert.deepEqual(remove(list, 'b').map((s) => s.id), ['a']);
});

test('export then import gives the same stories', () => {
  const stories = [story(), story({ id: 'b', title: 'Two' })];
  const text = exportJson(stories, '2026-11-15T00:00:00.000Z');
  assert.equal(JSON.parse(text).app, 'devspar-stories');
  const r = importJson(text, []);
  assert.equal(r.added, 2);
  assert.deepEqual(r.stories.map((s) => s.id).sort(), ['a', 'b']);
});

test('import refuses the wrong file and keeps markup as text', () => {
  for (const bad of ['[]', '{"app":"other"}', 'not json', '{"app":"devspar-stories","stories":"x"}']) assert.throws(() => importJson(bad, []), /That is not a DevSpar story file\./, bad);
  assert.throws(() => importJson(' '.repeat(1_000_001), []), /That is not a DevSpar story file\./);
  const markup = importJson(exportJson([story({ title: '<script>alert(1)</script>' })], 'now'), []);
  assert.equal(markup.stories[0].title, '<script>alert(1)</script>');
});

test('import merges: replaces only when newer, skips broken entries, drops unknown competencies', () => {
  const existing = [story({ id: 'a', title: 'Mine', updatedAt: '2026-11-05T00:00:00.000Z' })];
  const file = JSON.stringify({ app: 'devspar-stories', version: 1, stories: [
    story({ id: 'a', title: 'Older', updatedAt: '2026-11-01T00:00:00.000Z' }),
    story({ id: 'n', title: 'New', competencies: ['ownership', 'nonsense'] }),
    { id: 'broken', title: 'x' },
  ] });
  const r = importJson(file, existing);
  assert.equal(r.added, 1);
  assert.equal(r.updated, 0);
  assert.equal(r.skipped, 2);
  assert.equal(r.stories.find((s) => s.id === 'a').title, 'Mine');
  assert.deepEqual(r.stories.find((s) => s.id === 'n').competencies, ['ownership']);
  const newer = importJson(JSON.stringify({ app: 'devspar-stories', version: 1, stories: [story({ id: 'a', title: 'Newer', updatedAt: '2026-11-09T00:00:00.000Z' })] }), existing);
  assert.equal(newer.updated, 1);
  assert.equal(newer.stories[0].title, 'Newer');
});

test('toText', () => {
  const t = toText(story({ title: 'My story', s: 'S', t: 'T', a: 'A', r: 'R' }));
  assert.equal(t, 'My story\n\nSituation:\nS\n\nTask:\nT\n\nAction:\nA\n\nResult:\nR');
});

test('storage: blocked or broken storage is handled', () => {
  assert.deepEqual(readStories({ getItem: () => '{bad' }), []);
  assert.deepEqual(readStories({ getItem() { throw new Error('blocked'); } }), []);
  assert.equal(writeStories({ setItem() { throw new Error('full'); } }, [story()]), false);
  const s = { d: {}, getItem(k) { return k in this.d ? this.d[k] : null; }, setItem(k, v) { this.d[k] = String(v); } };
  assert.equal(writeStories(s, [story()]), true);
  assert.equal(readStories(s).length, 1);
});
