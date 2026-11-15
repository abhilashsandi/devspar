// Builds the Behavioural Interviews guide (app/behavioural/content.json) from bh-content-a/b.mjs.
//   node scripts/study/add-behavioural-guide.mjs && npm run study:build
// Re-running rebuilds the guide from scratch, so edit the content files and run it again.
import { mkdir } from 'node:fs/promises';
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { method, aboutYou, ownership, collaboration } from './bh-content-a.mjs';
import { leadership, growth, judgement, tricky, practice } from './bh-content-b.mjs';

const data = [
  { id: 'quickref', title: 'Quick Reference', questions: [] },
  { id: 'bh1', title: '1. How Behavioural Interviews Work', questions: method },
  { id: 'bh2', title: '2. Introducing Yourself', questions: aboutYou },
  { id: 'bh3', title: '3. Ownership and Delivery', questions: ownership },
  { id: 'bh4', title: '4. Collaboration and Conflict', questions: collaboration },
  { id: 'bh5', title: '5. Leadership and Mentoring', questions: leadership },
  { id: 'bh6', title: '6. Failure, Growth and Self-Awareness', questions: growth },
  { id: 'bh7', title: '7. Judgement and Values', questions: judgement },
  { id: 'bh8', title: '8. Tricky and Closing Questions', questions: tricky },
  { id: 'bh9', title: '9. Practice: Rewrite the Answer', questions: practice },
];
H.regenQuickRef(data);

const html = await H.newPage(
  {
    key: 'behavioural',
    title: 'Behavioural Interviews: Interview Prep',
    brand: 'Behavioural Interviews',
    brandSub: 'STAR stories that hold up',
    h1: 'Behavioural interviews',
    eyebrow: 'Prep guide',
    lede: 'A STAR question bank organised by competency. Each question shows what the interviewer is checking, the shape of a strong answer, a worked example and the follow-ups to expect. The examples are fictional: use them to see the shape, then tell your own story.',
  },
  data,
);

await mkdir(new URL('../../app/behavioural/', import.meta.url), { recursive: true });
const total = await lib.save('behavioural', await lib.upgrade(html));
console.log('behavioural guide written: ' + data.length + ' sections, ' + total + ' cards');
