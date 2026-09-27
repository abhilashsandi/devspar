// Regenerates the files the site reads about the study guides. Run after editing any app/<guide>/content.json:
//   npm run study:index
//   public/search-index.json  cross-guide search (the guides' search box and the homepage search)
//   app/lib/studyMeta.json    question counts and title hashes (homepage cards and progress bars)
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = path.join(ROOT, 'app');
const MARK = '// ---------- render ----------';
const PAGES = {
  'interview-prep': 'Interview Prep', 'interview-cheatsheet': 'Cheatsheet', genai: 'GenAI', javascript: 'JavaScript', 'react-training': 'React',
  reactjs: 'React + TypeScript', nextjs: 'Next.js', nodejs: 'Node.js', 'tailwind-css': 'CSS & Tailwind', 'coding-questions': 'Coding Practice',
  'system-design': 'System Design', 'system-design-scale': 'System Design at Scale', 'performance-optimization': 'Performance', 'web-platform': 'Web Platform',
};

// A guide's content.json holds { html }; the questions are the DATA array inside its script.
function loadData(html) {
  let sc = html.slice(html.indexOf('<script>') + 8, html.indexOf('</script>'));
  sc = sc.slice(0, sc.indexOf(MARK)) + '\nglobalThis.__D__=DATA;';
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(sc, sandbox);
  return sandbox.__D__;
}

const ent = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&mdash;/g, '—').replace(/&rarr;/g, '→').replace(/&[a-z]+;/g, ' ');
const strip = (s) => ent(s.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// same keys the guides use for shared progress (see the engine: titleKey) and the homepage (fnv)
const titleKey = (t) => String(t).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };

function summary(a) {
  const prose = strip(a.replace(/<span class="tbadge">[\s\S]*?<\/span>/, '').replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/<div class="diagram[^"]*">[\s\S]*?<\/div>/g, ' '));
  let s = '';
  for (const x of prose.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)) { if (s.length >= 90) break; s = (s ? s + ' ' : '') + x; }
  s = s.replace(/^(Common follow-ups|Model answer:|Answer:)\s*/i, '');
  return s.length > 170 ? s.slice(0, 167).replace(/\s+\S*$/, '') + '…' : s;
}

const items = [], meta = {}, pages = {};
for (const slug of Object.keys(PAGES)) {
  const file = path.join(APP, slug, 'content.json');
  if (!existsSync(file)) continue;
  const html = JSON.parse(readFileSync(file, 'utf8')).html;
  if (!html.includes(MARK)) continue;
  const data = loadData(html);
  pages[slug] = PAGES[slug];
  let cards = 0, questions = 0;
  const keys = [];
  for (const s of data) {
    s.questions.forEach((q, i) => {
      cards++;
      if (s.id === 'quickref') return;            // auto-generated one-line tables duplicate the real cards
      questions++;
      keys.push(fnv(titleKey(q.q)));
      if (/^Cheat sheet:/.test(strip(q.q))) return;
      items.push([slug, s.id, i, strip(s.title), strip(q.q), summary(q.a)]);
    });
  }
  meta[slug] = { title: PAGES[slug], cards, questions, sections: data.length, keys };
}
const unique = new Set(items.map((it) => it[4].toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim())).size;
meta._all = { title: 'All guides', cards: unique, questions: unique, sections: 0 };

writeFileSync(path.join(ROOT, 'public', 'search-index.json'), JSON.stringify({ pages, items }));
writeFileSync(path.join(APP, 'lib', 'studyMeta.json'), JSON.stringify(meta) + '\n');
console.log(`search-index: ${items.length} items, ${(statSync(path.join(ROOT, 'public', 'search-index.json')).size / 1024).toFixed(0)} KB | guides: ${Object.keys(pages).length} | unique questions: ${unique}`);
