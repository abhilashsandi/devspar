// Builds the Testing guide (app/testing/content.json) from test-content-a/b/c.mjs.
//   node scripts/study/add-testing-guide.mjs && npm run study:build
// Re-running rebuilds the guide from scratch, so edit the content files and run it again.
import { mkdir } from 'node:fs/promises';
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { strategy, unit, rtl } from './test-content-a.mjs';
import { msw, e2e } from './test-content-b.mjs';
import { backend, ci, scenarios } from './test-content-c.mjs';

const data = [
  { id: 'quickref', title: 'Quick Reference', questions: [] },
  { id: 'te1', title: '1. Test Strategy', questions: strategy },
  { id: 'te2', title: '2. Unit Testing', questions: unit },
  { id: 'te3', title: '3. React Testing Library', questions: rtl },
  { id: 'te4', title: '4. Mocking the Network with MSW', questions: msw },
  { id: 'te5', title: '5. End-to-End Testing with Playwright', questions: e2e },
  { id: 'te6', title: '6. Testing a Node.js Back End', questions: backend },
  { id: 'te7', title: '7. Tests in CI and After Deployment', questions: ci },
  { id: 'te8', title: '8. Interview Scenarios', questions: scenarios },
];
H.regenQuickRef(data);

const html = await H.newPage(
  {
    key: 'testing',
    title: 'Testing: Interview Prep',
    brand: 'Testing',
    brandSub: 'strategy, RTL, MSW, Playwright',
    h1: 'Testing',
    eyebrow: 'Prep guide',
    lede: 'Test strategy, unit tests, React Testing Library, MSW, Playwright and back-end tests in Node.js. Every code sample was run before it was written down, and the mistakes were run to show the real failure.',
  },
  data,
);

await mkdir(new URL('../../app/testing/', import.meta.url), { recursive: true });
const total = await lib.save('testing', await lib.upgrade(html));
console.log('testing guide written: ' + data.length + ' sections, ' + total + ' cards');
