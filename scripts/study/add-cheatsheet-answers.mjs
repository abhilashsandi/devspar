// Replaces the one-line answers in the Interview Cheatsheet (every section except the Last-2-Hours plan and
// the TypeScript section, which has its own script) with 2 to 3 sentence answers, adds a diagram where one
// helps, and keeps each card's existing "Full answer" link.
//   node scripts/study/add-cheatsheet-answers.mjs && npm run study:build
// Idempotent: the new text is built from the content files each time and the link paragraph is preserved.
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { plainTitle } from './parsePage.mjs';
import D from './dg.mjs';
import CS from './dg-cs.mjs';
import { A } from './cheatsheet-content-a.mjs';
import { B } from './cheatsheet-content-b.mjs';
import { C } from './cheatsheet-content-c.mjs';

const CONTENT = { ...A, ...B, ...C };
const SKIP = new Set(['review', 'typescript']);
const norm = (s) => plainTitle(s).replace(/&amp;/g, '&').replace(/&rarr;/g, '→').toLowerCase();

const { html, data } = await lib.load('interview-cheatsheet');
let updated = 0, diagrams = 0;
const problems = [];
const used = new Set();

for (const sec of data) {
  if (SKIP.has(sec.id)) continue;
  const content = CONTENT[sec.id];
  if (!content) { problems.push('no content for section ' + sec.id); continue; }
  for (const q of sec.questions) {
    const title = norm(q.q);
    const keys = Object.keys(content).filter((k) => title.startsWith(k.toLowerCase()));
    if (keys.length !== 1) { problems.push(sec.id + ': "' + plainTitle(q.q) + '" matched ' + keys.length + ' keys'); continue; }
    const { a, d } = content[keys[0]];
    used.add(sec.id + '|' + keys[0]);
    const deeper = (q.a.match(/<p class="deeper">[\s\S]*?<\/p>/) || [''])[0];
    let diagram = '';
    if (d) {
      diagram = CS[d] ?? D[d];
      if (!diagram) { problems.push('unknown diagram ' + d); continue; }
      diagrams++;
    }
    q.a = a + diagram + deeper;
    updated++;
  }
}
for (const [sid, content] of Object.entries(CONTENT)) {
  for (const k of Object.keys(content)) if (!used.has(sid + '|' + k)) problems.push('content key never matched a card: ' + sid + ' / ' + k);
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

const total = await lib.save('interview-cheatsheet', await lib.upgrade(lib.withData(html, data)));
console.log('cheatsheet: ' + updated + ' answers expanded, ' + diagrams + ' diagrams added (' + total + ' cards on the page)');
