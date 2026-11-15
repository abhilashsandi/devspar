// Builds the Bug Clinic guide (app/bug-clinic/content.json) from bug-content-a/b.mjs.
//   node scripts/study/add-bug-clinic-guide.mjs && npm run study:build
// Re-running rebuilds the guide from scratch, so edit the content files and run it again.
import { mkdir } from 'node:fs/promises';
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { method, js, react } from './bug-content-a.mjs';
import { node, ts, next, css } from './bug-content-b.mjs';

const data = [
  { id: 'bc0', title: 'How to Find a Bug Out Loud', questions: method },
  { id: 'bc1', title: 'JavaScript: 15 Bugs', questions: js },
  { id: 'bc2', title: 'React: 15 Bugs', questions: react },
  { id: 'bc3', title: 'Node.js: 6 Bugs', questions: node },
  { id: 'bc4', title: 'TypeScript: 5 Bugs', questions: ts },
  { id: 'bc5', title: 'Next.js: 5 Bugs', questions: next },
  { id: 'bc6', title: 'CSS: 4 Bugs', questions: css },
];

const html = await H.newPage(
  {
    key: 'bug-clinic',
    title: 'Bug Clinic: Find the Bug',
    brand: 'Bug Clinic',
    brandSub: 'find it, explain it, fix it',
    h1: 'Bug clinic',
    eyebrow: 'Practice',
    lede: 'Fifty short pieces of broken code, the kind interviewers put on a screen and ask “what is wrong here?”. Each card gives the symptom and the code. Work out the cause and say it out loud, then open the answer for the mechanism, the fix and a one-line way to explain it.',
  },
  data,
);

await mkdir(new URL('../../app/bug-clinic/', import.meta.url), { recursive: true });
const total = await lib.save('bug-clinic', await lib.upgrade(html));
console.log('bug-clinic guide written: ' + data.length + ' sections, ' + total + ' cards');
