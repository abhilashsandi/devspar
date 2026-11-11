// Builds the Crash Course guide (app/crash-course/content.json): one short, timed section per
// stream, every card open by default, meant to be read top to bottom as a pre-interview refresher.
//   node scripts/study/add-crash-course.mjs && npm run study:build
// Re-running rebuilds the guide from scratch; edit the crash-content-*.mjs files and run it again.
import { mkdir } from 'node:fs/promises';
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { plainTitle } from './parsePage.mjs';
import { md } from './cc-kit.mjs';
import { javascript, typescript, react, nextjs } from './crash-content-a.mjs';
import { node, css, web, testing, databases } from './crash-content-b.mjs';
import { sysdesign, arch, scale, perf } from './crash-content-c.mjs';
import { genai, aws, behavioral } from './crash-content-d.mjs';

const sections = [javascript, typescript, react, nextjs, node, css, web, testing, databases, sysdesign, arch, scale, perf, genai, aws, behavioral];
const mins = (s) => Number(s.title.match(/· (\d+) min$/)[1]);
const link = (s) => '<a class="go" href="#' + s.id + ':0" data-go="' + s.id + ':0">' + H.esc(s.title.replace(/ · \d+ min$/, '')) + '</a>';

const start = {
  id: 'start',
  title: 'Start Here · 2 min',
  questions: [
    {
      q: 'How to use this crash course',
      a: '<p class="lede">' + md('Each section is a **5–12 minute refresher** of one stream: the ideas, the code and the one-liners you are most likely to need in the room. Read it top to bottom; every card is already open.') + '</p>' +
        '<table class="cmp"><tr><th>Time you have</th><th>Read</th></tr>' +
        [
          ['15 min', 'the section for the role\'s main stack (e.g. React or Node.js) + its rapid-fire table'],
          ['30 min', 'main stack + System Design: the Method + Architecture & Reliability rapid-fire'],
          ['60 min', 'every section the job description mentions; skip the code, read the "Say it like this" lines'],
          ['Night before', 'everything once, then flashcards (▶ Flashcards in the toolbar) on the rapid-fire cards'],
        ].map((r) => '<tr><td>' + r[0] + '</td><td>' + md(r[1]) + '</td></tr>').join('') + '</table>' +
        '<p>' + md('Each section ends with **Go deeper** links to the full guide and the matching Cheatsheet section, for anything that did not stick.') + '</p>',
    },
    {
      q: 'All sections and their reading time',
      a: '<table class="cmp"><tr><th>Section</th><th>Minutes</th><th>Cards</th></tr>' +
        sections.map((s) => '<tr><td>' + link(s) + '</td><td>' + mins(s) + '</td><td>' + s.questions.length + '</td></tr>').join('') +
        '<tr><td><strong>Total</strong></td><td><strong>' + sections.reduce((n, s) => n + mins(s), 0) + '</strong></td><td><strong>' +
        sections.reduce((n, s) => n + s.questions.length, 0) + '</strong></td></tr></table>',
    },
  ],
};

const data = [start, ...sections];

// Card titles must be unique on the page (and progress is shared across guides by title).
const seen = new Set();
for (const s of data) for (const q of s.questions) {
  const t = plainTitle(q.q);
  if (seen.has(t)) throw new Error('duplicate card title: ' + t);
  seen.add(t);
}

const html = await H.newPage(
  {
    key: 'crash-course',
    openAll: true,
    core: 'the Start Here section',
    title: 'Interview Crash Course',
    brand: 'Crash Course',
    brandSub: '5–12 min per stream',
    h1: 'Interview crash course',
    eyebrow: 'Pre-interview refresher',
    lede: 'One short, timed refresher per stream: JavaScript, TypeScript, React, Next.js, Node.js, CSS, web and security, testing, databases, system design, reliability, performance, GenAI and AWS. Every card is open: read top to bottom, code and diagrams included.',
  },
  data,
);

await mkdir(new URL('../../app/crash-course/', import.meta.url), { recursive: true });
const total = await lib.save('crash-course', await lib.upgrade(html));
console.log('crash-course written: ' + data.length + ' sections, ' + total + ' cards');
