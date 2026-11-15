// Structural checks for one study guide, used as the acceptance test while writing a new guide.
//   node scripts/study/check-guide.mjs <slug> [--min 45] [--sections bh1:5,bh2:6]
//
// Fails (exit 1) with a list of problems when:
//   - the guide does not exist, or its first section is not a non-empty Quick Reference
//   - a section named in --sections is missing or has fewer cards than required; total is below --min
//   - a section's last card is not a "Quiz:" or "Rapid-fire:" card
//   - a card contains leftover placeholder text (TODO, TBD, [fill in, lorem ipsum) or an empty code block
//   - a title is used twice in the guide, or already exists in another guide (progress is shared by title)
//   - a link to another guide (/slug#section:index) points at a card that does not exist
//   - text uses " — " as a separator (house style: write a sentence, a colon or a comma instead)
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import * as lib from './lib.mjs';
import { plainTitle } from './parsePage.mjs';
import { TOOLS } from '../../app/lib/tools.mjs';

const [slug, ...rest] = process.argv.slice(2);
const opt = (name) => { const i = rest.indexOf('--' + name); return i >= 0 ? rest[i + 1] : undefined; };
if (!slug) { console.error('usage: node scripts/study/check-guide.mjs <slug> [--min N] [--sections id:n,id:n]'); process.exit(1); }

const problems = [];
const key = (t) => plainTitle(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();   // same idea as the engine's titleKey
const text = (h) => h.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ');

if (!existsSync(path.join(lib.APP, slug, 'content.json'))) {
  console.error('check-guide ' + slug + ': FAIL\n  - guide not found: app/' + slug + '/content.json');
  process.exit(1);
}
const { data } = await lib.load(slug);
const others = new Map();   // slug -> data
for (const d of await readdir(lib.APP, { withFileTypes: true })) {
  if (d.isDirectory() && d.name !== slug && existsSync(path.join(lib.APP, d.name, 'content.json'))) {
    try { others.set(d.name, (await lib.load(d.name)).data); } catch { /* not an engine guide */ }
  }
}

if (data[0]?.id !== 'quickref' || !data[0].questions.length) problems.push('the first section must be a non-empty Quick Reference (id "quickref"; call H.regenQuickRef(data))');
const sections = data.filter((s) => s.id !== 'quickref');
const total = sections.reduce((n, s) => n + s.questions.length, 0);
if (opt('min') && total < Number(opt('min'))) problems.push('only ' + total + ' cards; at least ' + opt('min') + ' required');
for (const spec of (opt('sections') || '').split(',').filter(Boolean)) {
  const [id, n] = spec.split(':');
  const s = sections.find((x) => x.id === id);
  if (!s) problems.push('section missing: ' + id);
  else if (s.questions.length < Number(n)) problems.push('section ' + id + ' has ' + s.questions.length + ' cards; at least ' + n + ' required');
}

const seen = new Map();
const foreign = new Map();
for (const [g, d] of others) for (const s of d) if (s.id !== 'quickref') for (const q of s.questions) foreign.set(key(q.q), g);
for (const s of sections) {
  const last = plainTitle(s.questions.at(-1)?.q ?? '');
  if (!/^(Quiz:|Rapid-fire:)/.test(last)) problems.push('section ' + s.id + ' must end with a "Quiz:" or "Rapid-fire:" card (ends with: ' + last.slice(0, 50) + ')');
  s.questions.forEach((q, i) => {
    const ref = s.id + ':' + i + ' "' + plainTitle(q.q).slice(0, 50) + '"';
    const k = key(q.q);
    if (seen.has(k)) problems.push('duplicate title in this guide: ' + ref + ' and ' + seen.get(k));
    seen.set(k, ref);
    if (foreign.has(k)) problems.push('title already exists in the ' + foreign.get(k) + ' guide: ' + ref);
    const body = text(q.q + ' ' + q.a);
    const left = body.match(/\bTODO\b|\bTBD\b|\[fill in|lorem ipsum/i);
    if (left) problems.push('placeholder text "' + left[0] + '" in ' + ref);
    if (/ — /.test(body)) problems.push('" — " used as a separator in ' + ref);
    if (/<pre[^>]*>\s*<\/pre>/.test(q.a)) problems.push('empty code block in ' + ref);
    for (const m of q.a.matchAll(/href="\/([a-z0-9-]+)#([a-z0-9-]+):(\d+)"/g)) {
      const target = m[1] === slug ? data : others.get(m[1]);
      const sec = target?.find((x) => x.id === m[2]);
      if (!sec || !sec.questions[Number(m[3])]) problems.push('broken link /' + m[1] + '#' + m[2] + ':' + m[3] + ' in ' + ref);
    }
    for (const m of q.a.matchAll(/href="\/([a-z0-9-]+)"/g)) if (m[1] !== slug && !others.has(m[1]) && !TOOLS.some((x) => x.href === '/' + m[1])) problems.push('link to unknown guide /' + m[1] + ' in ' + ref);
  });
}

if (problems.length) {
  console.error('check-guide ' + slug + ': FAIL (' + problems.length + ')\n' + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log('check-guide ' + slug + ': OK (' + total + ' cards in ' + sections.length + ' sections)');
