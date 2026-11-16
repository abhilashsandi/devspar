// Prints what a guide covers, section by section, as the material for writing its audio overview:
//   node scripts/study/audio-digest.mjs <slug> [sectionId ...] [--max 220]
// each card's title and the opening of its answer. Read the cards themselves for anything you are unsure of.
import * as lib from './lib.mjs';
import { plainTitle, stripTags } from './parsePage.mjs';

const args = process.argv.slice(2);
const mi = args.indexOf('--max');
const max = mi >= 0 ? Number(args.splice(mi, 2)[1]) : 220;
const [slug, ...secs] = args;
const { data } = await lib.load(slug);
for (const s of data) {
  if (s.id === 'quickref' || (secs.length && !secs.includes(s.id))) continue;
  console.log(`\n## ${s.id} | ${plainTitle(s.title)} (${s.questions.length})`);
  for (const q of s.questions) {
    const t = stripTags(q.a.replace(/<!--x:extras-->[\s\S]*?<!--\/x:extras-->/g, ' ').replace(/<details[\s\S]*?<\/details>/g, ' '));
    console.log(`- ${plainTitle(q.q).slice(0, 110)} :: ${t.slice(0, max)}`);
  }
}
