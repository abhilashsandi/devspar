// Points the Interview Cheatsheet's opening card at the Crash Course (idempotent).
//   node scripts/study/link-crash-course.mjs && npm run study:build
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';

const { html, data } = await lib.load('interview-cheatsheet');
H.appendHtml(data, 'How do you spend the last two hours before the interview?',
  '<div class="callout"><strong>Short on time?</strong> The <a href="/crash-course" target="_top">Interview Crash Course</a> covers every stream in a 5–12 minute read each, with code and diagrams, top to bottom. New: the <a href="/aws" target="_top">AWS guide</a>.</div>',
  'review');
await lib.save('interview-cheatsheet', await lib.upgrade(lib.withData(html, data)));
console.log('cheatsheet linked to crash course');
