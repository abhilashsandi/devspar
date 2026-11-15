// Runs every "Predict the output" snippet (scripts/study/predict-content.mjs) in a real worker, five times, with
// the same harness and formatter the browser uses (the `predict` block of engine.js), and checks that every run
// prints exactly what the card says. A snippet whose runs differ is not deterministic and fails.
//   node scripts/study/check-predict.mjs            check every card
//   node scripts/study/check-predict.mjs --print 3  print what card 3 (0-based) prints, to paste into `expect`
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { predict } from './predict-content.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(here, 'engine.js'), 'utf8');
const ctx = vm.createContext({ console });
vm.runInContext(src.slice(src.indexOf('// ---- predict:start'), src.indexOf('// ---- predict:end')), ctx);

function runOnce(code) {
  const program = "const { parentPort } = require('node:worker_threads'); const post = (m) => parentPort.postMessage(m);\n" + ctx.predictSource(code, 'post');
  return new Promise((resolve, reject) => {
    const lines = [];
    const w = new Worker(program, { eval: true });
    w.on('message', (m) => { if (m.line !== undefined) lines.push(m.line); if (m.done) { w.terminate(); resolve(lines); } });
    w.on('error', reject);
    setTimeout(() => { w.terminate(); reject(new Error('no done message')); }, 8000);
  });
}
const five = (code) => Promise.all([0, 1, 2, 3, 4].map(() => runOnce(code)));

const pi = process.argv.indexOf('--print');
if (pi >= 0) {
  const card = predict[Number(process.argv[pi + 1])];
  if (!card) { console.error('no such card'); process.exit(1); }
  console.log((await runOnce(card.predict.code)).join('\n'));
  process.exit(0);
}

const problems = [];
for (const [i, card] of predict.entries()) {
  const title = i + ' ' + card.q.replace(/<[^>]+>/g, '');
  const want = card.predict.expect.replace(/\s+$/, '').split('\n');
  let runs;
  try { runs = await five(card.predict.code); } catch (e) { problems.push(title + ': ' + e.message); continue; }
  const first = runs[0].join('\n');
  if (runs.some((r) => r.join('\n') !== first)) { problems.push(title + ': the five runs differ (not deterministic)'); continue; }
  if (first !== want.join('\n')) problems.push(title + ': prints\n      ' + runs[0].join('\n      ') + '\n    but the card says\n      ' + want.join('\n      '));
}
if (problems.length) { console.log('check-predict: FAIL\n  - ' + problems.join('\n  - ')); process.exit(1); }
console.log(`check-predict: ${predict.length} of ${predict.length} match`);
