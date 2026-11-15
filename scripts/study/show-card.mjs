// Prints one card as plain text, for writing its short answers: node scripts/study/show-card.mjs <slug> <sec> <title prefix>
import * as lib from './lib.mjs';
import { plainTitle } from './parsePage.mjs';
const [slug, sec, ...rest] = process.argv.slice(2);
const want = rest.join(' ').toLowerCase();
const { data } = await lib.load(slug);
const s = data.find((x) => x.id === sec);
const hits = s.questions.filter((q) => plainTitle(q.q).toLowerCase().startsWith(want));
if (hits.length !== 1) { console.error('matched ' + hits.length); process.exit(1); }
const q = hits[0];
console.log(plainTitle(q.q) + '\n');
console.log(q.a.replace(/<!--x:extras-->[\s\S]*?<!--\/x:extras-->/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '[diagram]').replace(/<\/(p|li|tr|h3|pre)>/g, '\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n'));
