import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadBlock } from './helpers/engine-block.mjs';

const { speakText, speakChunks, speakable } = loadBlock('listen', {});
const sentence = (n, ch = 'a') => ch.repeat(n - 1) + '.';

test('speakText reads prose and replaces code, diagrams and tables with a short marker', () => {
  assert.equal(speakText('<p>Use <code>let</code> &amp; <strong>const</strong>.</p><pre>let a = 1;</pre><pre>b</pre><p>Done.</p>'), 'Use let & const. Code example on the card. Done.');
  assert.equal(speakText('<p>See below.</p><div class="diagram"><svg><text>box</text></svg></div>'), 'See below. Diagram on the card.');
  assert.equal(speakText('<table class="cmp"><tr><td>x</td></tr></table><p>After.</p>'), 'Table on the card. After.');
});

test('speakText leaves out the extras block and decodes entities', () => {
  const html = '<p>Full answer.</p><!--x:extras--><div class="xdepths"><div data-depth="15"><p>Short.</p></div></div><!--/x:extras-->';
  assert.equal(speakText(html), 'Full answer.');
  assert.equal(speakText('<p>1 &lt; 2 &gt; 0 &mdash; &#65;&#x42; &nbsp;ok</p>'), '1 < 2 > 0 — AB ok');
});

test('revealed text follows the marker sentence The answer.', () => {
  const t = speakText('<p>Task.</p><details class="reveal"><summary>Show a solution</summary><p>Revealed text.</p></details>');
  assert.equal(t, 'Task. The answer. Revealed text.');
});

test('speakChunks packs sentences up to the limit', () => {
  const three = [120, 120, 120].map((n) => sentence(n)).join(' ');
  assert.equal(speakChunks(three).length, 3);
  const four = [50, 50, 50, 50].map((n) => sentence(n)).join(' ');
  assert.equal(speakChunks(four).length, 1);
  for (const c of speakChunks(three)) assert.ok(c.length <= 220);
});

test('a very long sentence is split at a comma or a space and loses no word', () => {
  const long = Array.from({ length: 150 }, (_, i) => 'word' + i).join(', ') + '.';
  const chunks = speakChunks(long);
  assert.ok(chunks.length > 3);
  for (const c of chunks) assert.ok(c.length <= 220, String(c.length));
  assert.equal(chunks.join(' ').replace(/[ ,]+/g, ' ').trim(), long.replace(/[ ,]+/g, ' ').trim());
});

const extras = '<!--x:extras--><div class="xdepths" hidden><div data-depth="15"><p>Fifteen second script.</p></div><div data-depth="60"><p>Sixty second script.</p></div></div><!--/x:extras-->';

test('speakable starts with the question and uses the 60-second script unless the full answer is asked for', () => {
  const a = '<p>The long answer. It goes on.</p>' + extras;
  const short = speakable('What is <code>x</code>?', a, false);
  assert.ok(short[0].startsWith('Question. '));
  assert.ok(short[0].includes('What is x?'));
  assert.deepEqual(Array.from(short.slice(1)), ['Sixty second script.']);   // Array.from: the block runs in another realm
  const full = speakable('What is x?', a, true);
  assert.deepEqual(Array.from(full.slice(1)), ['The long answer. It goes on.']);
  assert.deepEqual(Array.from(speakable('Q?', '<p>No extras here.</p>', false).slice(1)), ['No extras here.']);
});
