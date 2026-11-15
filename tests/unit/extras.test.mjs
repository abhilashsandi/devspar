import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extrasHtml, applyExtras, validateExtra, stripExtras } from '../../scripts/study/extras.mjs';
import { firstSentence } from '../../scripts/study/helpers.mjs';

const w = (n, word = 'word') => Array(n).fill(word).join(' ');
const good = (over = {}) => ({
  card: 'What is a closure?', sec: 'js',
  s15: w(30) + '.', s60: w(140) + '.',
  ladder: [[w(10) + '?', w(30) + '.'], [w(12) + '?', w(40) + '.']],
  ...over,
});
const fixture = () => [{ id: 'js', title: 'JS', questions: [{ q: 'What is a <code>closure</code>?', a: '<p>Full.</p>' }] }];

test('applyExtras appends one block and re-applying replaces it', () => {
  const data = fixture();
  applyExtras(data, [good()]);
  assert.equal((data[0].questions[0].a.match(/<!--x:extras-->/g) || []).length, 1);
  assert.ok(data[0].questions[0].a.startsWith('<p>Full.</p>'));
  applyExtras(data, [good({ s15: 'A new fifteen second script ' + w(20) + '.' })]);
  const a = data[0].questions[0].a;
  assert.equal((a.match(/<!--x:extras-->/g) || []).length, 1);
  assert.ok(a.includes('A new fifteen second script'));
});

test('an entry whose card is missing fails loudly with its title', () => {
  assert.throws(() => applyExtras(fixture(), [good({ card: 'Nope' })]), /no card "Nope" in js/);
});

test('two entries for one card are refused', () => {
  assert.throws(() => applyExtras(fixture(), [good(), good()]), /two entries for "What is a closure\?"/);
});

test('extrasHtml escapes markup and renders code spans', () => {
  const html = extrasHtml(good({ s15: 'Use `x` and a <b> tag ' + w(20) }));
  assert.ok(html.includes('<code>x</code>'));
  assert.ok(html.includes('&lt;b&gt;'));
  assert.ok(!html.includes('<b>'));
  assert.ok(html.startsWith('<!--x:extras--><div class="xdepths" hidden>'));
  assert.ok(html.includes('<details class="reveal rung"><summary>'));
  assert.ok(html.endsWith('<!--/x:extras-->'));
});

test('validateExtra accepts the budgets and names each breach', () => {
  assert.deepEqual(validateExtra(good()), []);
  assert.equal(validateExtra(good({ s15: w(46) })).length, 1);
  assert.equal(validateExtra(good({ s60: w(109) })).length, 1);
  assert.equal(validateExtra(good({ ladder: [[w(10) + '?', w(30)]] })).length, 1);
  assert.equal(validateExtra(good({ ladder: [[w(10), w(30)], [w(10) + '?', w(30)]] })).length, 1);
  assert.equal(validateExtra(good({ ladder: [[w(10) + '?', w(61)], [w(10) + '?', w(30)]] })).length, 1);
  assert.equal(validateExtra(good({ ladder: [[w(26) + '?', w(30)], [w(10) + '?', w(30)]] })).length, 1);
});

test('the block never leaks into summaries', () => {
  const a = '<table class="cmp"><tr><td>x</td></tr></table>' + extrasHtml(good());
  assert.equal(stripExtras(a), '<table class="cmp"><tr><td>x</td></tr></table>');
  assert.equal(firstSentence(a), '');
});
