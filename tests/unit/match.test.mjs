import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKILLS } from '../../app/lib/skills.mjs';
import { extractSkills, cardsFor, analyse, deckLinks, saveResult, readResult } from '../../app/lib/match.mjs';
import { toCards } from '../../app/lib/bank.mjs';

const POSTING = `Senior Full-Stack Engineer. You will build customer-facing features in React and TypeScript on
Next.js, with Node.js services behind them. We run on AWS with Docker and Kubernetes, and ship
through CI/CD on GitHub Actions. You know PostgreSQL well and care about testing (Playwright).
Experience with React Native, C# or Java is a bonus. JavaScript fundamentals matter to us.
You enjoy mentoring and clear communication skills.`;

let n = 0;
const card = (over) => {
  n++;
  const c = { slug: 'react-training', sec: 'r1', idx: n, secTitle: 'Hooks', q: 'Question ' + n, summary: '', core: false, words: 100, kind: 'concept', ...over };
  c.guide = c.slug; c.tkey = c.tkey || 'question ' + n; c.key = c.sec + ':' + c.idx; c.href = '/' + c.slug + '#' + c.key;
  return c;
};
const many = (count, over) => Array.from({ length: count }, () => card(over));
const byId = (list) => Object.fromEntries(list.map((s) => [s.id, s]));

test('extractSkills finds what the posting asks for', () => {
  const found = byId(extractSkills(POSTING));
  for (const id of ['react', 'typescript', 'nextjs', 'node', 'aws', 'docker', 'kubernetes', 'cicd', 'sql', 'testing', 'e2e', 'mobile', 'dotnet', 'java', 'javascript', 'behavioural']) assert.ok(found[id], id);
  assert.equal(found.react.mentions, 1, 'the one in React Native belongs to mobile');
  assert.equal(found.java.mentions, 1, 'not the one inside JavaScript');
  assert.equal(found.cicd.mentions, 2);
  assert.equal(found.golang, undefined);
  assert.equal(found.git, undefined, 'GitHub is not Git');
});

test('whole terms only, symbols matched literally', () => {
  assert.deepEqual(extractSkills('We go fast. Git push daily.').map((s) => s.id), ['git']);
  assert.deepEqual(extractSkills('').map((s) => s.id), []);
  assert.deepEqual(extractSkills('Prior work with C#, .NET and ASP.NET.').map((s) => s.id), ['dotnet']);
  assert.equal(extractSkills('Prior work with C#, .NET and ASP.NET.')[0].mentions, 3);
  assert.deepEqual(extractSkills('the rest of the team will express concerns, spring forward').map((s) => s.id), []);
});

test('ordered by mentions, then by first position', () => {
  const ids = extractSkills('Docker. Kubernetes. Docker again. Python.').map((s) => s.id);
  assert.deepEqual(ids, ['docker', 'kubernetes', 'python']);
  assert.deepEqual(extractSkills('Rust and Python and Rust').map((s) => s.id), ['rust', 'python']);
});

test('cardsFor: guide pointers and title aliases, core first, no duplicates, no quizzes', () => {
  const react = SKILLS.find((s) => s.id === 'react');
  const bank = [
    card({ slug: 'react-training', core: false }), card({ slug: 'react-training', core: true }),
    card({ slug: 'nextjs', q: 'Why use React Server Components?' }),
    card({ slug: 'react-training', kind: 'quiz' }), card({ slug: 'react-training', sec: 'review' }),
    card({ slug: 'react-training', tkey: 'dup' }), card({ slug: 'reactjs', tkey: 'dup' }),
  ];
  const got = cardsFor(react, bank);
  assert.equal(got[0].core, true);
  assert.ok(got.some((c) => c.slug === 'nextjs'));
  assert.equal(got.some((c) => c.kind === 'quiz' || c.sec === 'review'), false);
  assert.equal(got.filter((c) => c.tkey === 'dup').length, 1);
});

test('analyse: covered, thin and missing, and a deck that starts with core', () => {
  const bank = [...many(3, { core: true }), ...many(2), ...many(2, { slug: 'aws', secTitle: 'Containers', q: 'Running Kubernetes on ECS' })];
  const a = analyse(POSTING, bank, new Set());
  const st = byId(a.found);
  assert.equal(st.react.status, 'covered');
  assert.equal(st.kubernetes.status, 'thin');
  assert.equal(st.java.status, 'missing');
  assert.equal(a.deck[0].core, true);
  assert.ok(a.gaps.missing.includes('Java'));
  assert.ok(a.gaps.thin.includes('Kubernetes'));
  assert.ok(a.gaps.unreviewed.includes('React'));
  assert.equal(a.truncated, false);
});

test('analyse: reviewed cards leave the unreviewed gap, and are ranked after unreviewed ones', () => {
  const bank = many(5, { core: true });
  const all = new Set(bank.map((c) => c.tkey));
  assert.equal(analyse(POSTING, bank, all).gaps.unreviewed.includes('React'), false);
  const some = new Set([bank[0].tkey]);
  const a = analyse(POSTING, bank, some);
  assert.notEqual(a.deck[0].tkey, bank[0].tkey);
  assert.equal(st(a, 'react').reviewed, 1);
  function st(x, id) { return x.found.find((s) => s.id === id); }
});

test('the deck is capped at 8 per skill and 60 in all, with no duplicate titles', () => {
  const guides = ['react-training', 'typescript', 'nextjs', 'nodejs', 'sql', 'testing', 'aws', 'genai', 'coding-questions', 'ai-dev'];
  const posting = 'React TypeScript Next.js Node.js PostgreSQL testing AWS generative AI algorithms Copilot';
  const bank = guides.flatMap((slug) => many(10, { slug, sec: 's1' }));
  const a = analyse(posting, bank, new Set());
  assert.equal(a.deck.length, 60);
  assert.equal(new Set(a.deck.map((c) => c.tkey)).size, 60);
  const per = {};
  for (const c of a.deck) per[c.slug] = (per[c.slug] || 0) + 1;
  for (const v of Object.values(per)) assert.ok(v <= 8, JSON.stringify(per));
});

test('long text is cut and flagged', () => {
  const a = analyse('React '.repeat(5000), many(3), new Set());
  assert.equal(a.truncated, true);
  assert.equal(extractSkills('x'.repeat(30000) + ' React')[0], undefined, 'text beyond 20,000 characters is not read');
});

test('deckLinks: one link per guide, in deck order', () => {
  const deck = [card({ slug: 'sql' }), card({ slug: 'nextjs' }), card({ slug: 'sql' })];
  const links = deckLinks(deck);
  assert.deepEqual(links.map((l) => [l.count, l.href.split('#')[0]]), [[2, '/sql'], [1, '/nextjs']]);
  assert.ok(links[0].href.includes('#deck='));
});

test('the saved result keeps skills and deck, never the posting', () => {
  const s = { d: {}, getItem(k) { return k in this.d ? this.d[k] : null; }, setItem(k, v) { this.d[k] = String(v); } };
  const a = analyse(POSTING, many(4, { core: true }), new Set());
  saveResult(s, a, '2026-11-15T10:00:00.000Z');
  const r = readResult(s);
  assert.equal(r.at, '2026-11-15T10:00:00.000Z');
  assert.ok(r.skills.includes('react'));
  assert.ok(r.deck.every((h) => h.startsWith('/')));
  assert.equal(JSON.stringify(s.d).includes('Senior Full-Stack'), false);
  assert.equal(readResult({ getItem: () => '{bad' }), null);
});

test('every guide pointer names a guide or section that exists in the real index', () => {
  const cards = toCards(JSON.parse(readFileSync('public/search-index.json', 'utf8')));
  for (const skill of SKILLS) for (const g of skill.guides || []) {
    const [slug, sec] = g.split(':');
    assert.ok(cards.some((c) => c.slug === slug && (!sec || c.sec === sec)), `${skill.id}: ${g}`);
  }
});
