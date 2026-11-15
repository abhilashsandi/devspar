// Adds a "Go deeper: Estimation drills" line to the two cards that teach the arithmetic (idempotent).
//   node scripts/study/link-drills.mjs && npm run study:build
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { GO } from './cc-kit.mjs';

const line = GO(['/drills', 'Estimation drills: practise this arithmetic with new numbers']);
for (const [slug, sec, prefix] of [
  ['system-design-scale', 'framing', 'How would you size the system with a back-of-envelope estimate?'],
  ['performance-optimization', 'reference', 'What latency numbers should you just know, cold?'],
]) {
  const { html, data } = await lib.load(slug);
  H.appendHtml(data, prefix, line, sec);
  await lib.save(slug, await lib.upgrade(lib.withData(html, data)));
  console.log(slug + ': linked ' + prefix);
}
