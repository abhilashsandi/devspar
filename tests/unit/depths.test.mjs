import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadBlock } from './helpers/engine-block.mjs';

test('depthSeconds speaks 150 words a minute', () => {
  const ctx = loadBlock('depths', {});
  assert.equal(ctx.depthSeconds(40), 16);
  assert.equal(ctx.depthSeconds(150), 60);
  assert.equal(ctx.depthSeconds(0), 0);
});
