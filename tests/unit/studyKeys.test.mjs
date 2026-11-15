import { test } from 'node:test';
import assert from 'node:assert/strict';
import { titleKey, fnv } from '../../app/lib/studyKeys.mjs';
import { loadBlock } from './helpers/engine-block.mjs';

test('titleKey strips tags, entities and punctuation', () => {
  assert.equal(titleKey('What is a closure?'), 'what is a closure');
  assert.equal(titleKey('Tell me about <code>this</code> &amp; bind()'), 'tell me about this bind');
});
test('fnv matches the values the index builder writes', () => {
  assert.equal(fnv('what is a closure'), 'l1zofj');
  assert.equal(fnv('tell me about this bind'), '8zil8y');
});
test('loadBlock runs a marked block of the engine', () => {
  const ctx = loadBlock('sketch', { document: {}, localStorage: { getItem: () => null } });
  assert.equal(typeof ctx.sketchIsCode, 'function');
  assert.equal(ctx.sketchIsCode('UPDATE accounts SET balance_cents = 5;'), true);
  assert.throws(() => loadBlock('no-such-block'), /engine block not found/);
});
