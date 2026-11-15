import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { loadBlock } from './helpers/engine-block.mjs';

const ctx = loadBlock('predict', {});
const { predictFormat, predictSource, predictCompare } = ctx;

// runs the program text in a real worker, the way the browser runs it in a Web Worker
export function runProgram(code) {
  const program = "const { parentPort } = require('node:worker_threads'); const post = (m) => parentPort.postMessage(m);\n" + predictSource(code, 'post');
  return new Promise((resolve, reject) => {
    const lines = [];
    const w = new Worker(program, { eval: true });
    w.on('message', (m) => { if (m.line !== undefined) lines.push(m.line); if (m.done) { w.terminate(); resolve(lines); } });
    w.on('error', reject);
    setTimeout(() => { w.terminate(); reject(new Error('no done message')); }, 5000);
  });
}

test('predictFormat follows the stated rules', () => {
  assert.equal(predictFormat('a'), 'a');
  assert.equal(predictFormat(['a', 1, null]), "[ 'a', 1, null ]");
  assert.equal(predictFormat([]), '[]');
  assert.equal(predictFormat({ a: 1, b: 'x' }), "{ a: 1, b: 'x' }");
  assert.equal(predictFormat({}), '{}');
  assert.equal(predictFormat(undefined), 'undefined');
  assert.equal(predictFormat(10n), '10n');
  assert.equal(predictFormat(new TypeError('no')), 'TypeError: no');
  assert.equal(predictFormat(function go() {}), '[Function: go]');
  assert.equal(predictFormat(true), 'true');
  assert.equal(predictFormat(NaN), 'NaN');
  assert.equal(predictFormat([[1, 2], { k: [3] }]), '[ [ 1, 2 ], { k: [ 3 ] } ]');
});

test('the program prints in event-loop order', async () => {
  const lines = await runProgram('console.log(1); setTimeout(() => console.log(3), 0); Promise.resolve().then(() => console.log(2));');
  assert.deepEqual(lines, ['1', '2', '3']);
});

test('several arguments are joined by one space', async () => {
  assert.deepEqual(await runProgram("console.log('a', 1, [2])"), ['a 1 [ 2 ]']);
});

test('an uncaught error is reported, not thrown', async () => {
  const lines = await runProgram('null.x');
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^Uncaught TypeError: /);
});

test('an unhandled rejection and a late throw are reported', async () => {
  const lines = await runProgram("Promise.reject(new RangeError('late')); setTimeout(() => { throw new Error('boom'); }, 10);");
  assert.deepEqual(lines, ['Uncaught (in promise) RangeError: late', 'Uncaught Error: boom']);
});

test('the code runs in strict mode', async () => {
  assert.deepEqual(await runProgram("try { undeclared = 1; console.log('sloppy'); } catch (e) { console.log(e.name); }"), ['ReferenceError']);
});

test('predictCompare judges the answer, not the spacing', () => {
  // JSON round trip: the engine block runs in another realm, so its objects have another prototype
  assert.deepEqual(JSON.parse(JSON.stringify(predictCompare('1\n2', ['1', '2', '3']).rows[2])), { said: '', printed: '3', ok: false });
  const a = predictCompare('1\n2', ['1', '2', '3']);
  assert.equal(a.right, 2);
  assert.equal(a.total, 3);
  assert.equal(predictCompare('[1,2]', ['[ 1, 2 ]']).right, 1);
  assert.equal(predictCompare('"a"\n\n', ['a']).right, 1);
  assert.equal(predictCompare('[“5”,5]', ["[ '5', 5 ]"]).right, 1);
  assert.equal(predictCompare('[5,5]', ["[ '5', 5 ]"]).right, 0);
  assert.equal(predictCompare('1\n2\n3', ['1']).rows.length, 3);
  assert.equal(predictCompare('1\n2\n3', ['1']).right, 1);
  assert.equal(predictCompare('', ['x']).right, 0);
});
