import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roleFor, pickAnswers, gapFrame, parsePayload, toText } from '../../app/lib/phone.mjs';

// invented pitches: nothing here comes from a real person
const P = (id, extra = {}) => ({ id, title: 'T ' + id, say: 'Say ' + id + '.', probes: ['probe ' + id], verify: '', ...extra });
const pitches = [
  P('intro', { always: true }),
  P('fullstack', { role: 'fullstack' }), P('frontend', { role: 'frontend' }), P('backend', { role: 'backend', skills: ['rest'] }),
  P('react', { skills: ['react', 'state'] }), P('node', { skills: ['node'] }), P('db', { skills: ['sql', 'nosql'] }),
];
const found = (...ids) => ids.map((id) => ({ id, label: id.toUpperCase() }));

test('roleFor reads the shape of the posting', () => {
  assert.equal(roleFor(['react', 'css']), 'frontend');
  assert.equal(roleFor(['node', 'sql']), 'backend');
  assert.equal(roleFor(['react', 'node']), 'fullstack');
  assert.equal(roleFor(['docker']), 'fullstack');
  assert.equal(roleFor([]), 'fullstack');
});

test('the introduction comes first, then the role, then one answer per pitch in posting order', () => {
  const r = pickAnswers(found('node', 'react', 'state', 'sql'), pitches);
  assert.deepEqual(r.answers.map((a) => a.pitch.id), ['intro', 'fullstack', 'node', 'react', 'db']);
  assert.deepEqual(r.answers[3].skills, ['REACT', 'STATE'], 'one pitch that answers two skills is listed once');
  assert.equal(r.answers[2].question, 'What is your experience with NODE?');
  assert.equal(r.answers[3].question, 'What is your experience with REACT and STATE?');
  assert.deepEqual(r.missing, []);
});

test('skills with no pitch are reported, not invented', () => {
  const r = pickAnswers(found('react', 'kubernetes', 'vue'), pitches);   // no backend language, so a frontend role
  assert.deepEqual(r.missing, ['KUBERNETES', 'VUE']);
  assert.deepEqual(r.answers.map((a) => a.pitch.id), ['intro', 'frontend', 'react']);
  assert.equal(gapFrame('Java'), 'I have not used Java in production. The closest I have done is ___. I would get productive by ___.');
});

test('a role pitch that also answers a skill is not listed twice', () => {
  const r = pickAnswers(found('node', 'rest'), pitches);
  assert.deepEqual(r.answers.map((a) => a.pitch.id), ['intro', 'backend', 'node']);
  const front = pickAnswers(found('react', 'rest'), pitches);
  assert.deepEqual(front.answers.map((a) => a.pitch.id), ['intro', 'fullstack', 'react', 'backend']);
});

test('no pitches at all still reports every skill as missing', () => {
  const r = pickAnswers(found('react'), []);
  assert.deepEqual(r.answers, []);
  assert.deepEqual(r.missing, ['REACT']);
});

test('parsePayload accepts only the expected shape', () => {
  assert.equal(parsePayload(JSON.stringify({ v: 1, pitches })).length, pitches.length);
  for (const bad of ['{bad', '[]', '{"v":1}', '{"v":1,"pitches":[{"id":1}]}']) assert.throws(() => parsePayload(bad), /could not be read/);
});

test('toText is plain text, ready to paste into notes', () => {
  const text = toText(pickAnswers(found('react', 'java'), pitches));
  assert.ok(text.includes('What is your experience with REACT?\nSay react.'));
  assert.ok(text.includes('If they probe: probe react'));
  assert.ok(text.includes('No answer written yet: JAVA'));
});
