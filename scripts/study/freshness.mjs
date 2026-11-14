// Freshness check and prompt builder for the study guides.
//
//   npm run study:freshness                 check every guide, write the report and the prompts
//   npm run study:freshness -- --guide nodejs     one guide only
//   npm run study:freshness -- --offline          skip the version lookups (no network)
//   npm run study:freshness -- --mark nodejs      record that you reviewed a guide today (after a refresh)
//
// What it does:
//   1. Looks up the current version of each technology in TRACKED (npm registry, nodejs.org).
//   2. Scans every guide for version mentions and time-sensitive wording, card by card.
//   3. Writes docs/freshness/report.md: what is behind, where, and how long since each guide was reviewed.
//   4. Writes docs/freshness/prompts/<guide>.md: a ready-to-run prompt for a coding agent (Claude Code or
//      similar) that tells it exactly what to verify and how to edit the guide with this toolkit.
//
// It reports; it never edits content. Version numbers are evidence that something may be stale, not proof:
// the prompts tell the agent to check the official docs before changing a card.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadData, MARK, plainTitle } from './parsePage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = path.join(ROOT, 'app');
const OUT = path.join(ROOT, 'docs', 'freshness');
const STATE = path.join(ROOT, 'scripts', 'study', 'freshness-state.json');
const args = process.argv.slice(2);
const flag = (name) => args.includes('--' + name);
const opt = (name) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : undefined; };
const today = new Date().toISOString().slice(0, 10);

// ---- what we track: name, where the current version comes from, and how a guide mentions it.
// `re` must capture the major version in group 1. Add a line here when a guide starts covering a new tool.
const TRACKED = [
  { name: 'Node.js', src: 'node', re: /\bNode(?:\.js)?\s+v?(\d{2})\b/g },
  { name: 'TypeScript', npm: 'typescript', re: /\bTypeScript\s+v?(\d)(?:\.\d+)?\b/g },
  { name: 'React', npm: 'react', re: /\bReact\s+v?(1\d)\b/g },
  { name: 'Next.js', npm: 'next', re: /\bNext(?:\.js)?\s+v?(1\d)\b/g },
  { name: 'Tailwind CSS', npm: 'tailwindcss', re: /\bTailwind(?:\s+CSS)?\s+v?(\d)\b/g },
  { name: 'Vite', npm: 'vite', re: /\bVite\s+v?(\d{1,2})\b/g },
  { name: 'Vitest', npm: 'vitest', re: /\bVitest\s+v?(\d)\b/g },
  { name: 'Jest', npm: 'jest', re: /\bJest\s+v?(\d{2})\b/g },
  { name: 'ESLint', npm: 'eslint', re: /\bESLint\s+v?(\d{1,2})\b/g },
  { name: 'React Router', npm: 'react-router', re: /\bReact Router\s+v?(\d)\b/g },
  { name: 'TanStack Query', npm: '@tanstack/react-query', re: /\b(?:TanStack|React) Query\s+v?(\d)\b/g },
  { name: 'Express', npm: 'express', re: /\bExpress\s+v?(\d)\b/g },
  { name: 'Fastify', npm: 'fastify', re: /\bFastify\s+v?(\d)\b/g },
  { name: 'NestJS', npm: '@nestjs/core', re: /\bNestJS\s+v?(\d{1,2})\b/g },
  { name: 'Zod', npm: 'zod', re: /\bZod\s+v?(\d)\b/g },
  { name: 'Redux Toolkit', npm: '@reduxjs/toolkit', re: /\bRedux Toolkit\s+v?(\d)\b/g },
  { name: 'Zustand', npm: 'zustand', re: /\bZustand\s+v?(\d)\b/g },
  { name: 'Playwright', npm: 'playwright', re: /\bPlaywright\s+v?(\d)\.\d+\b/g },
  { name: 'ECMAScript', src: 'year', re: /\bES(20\d\d)\b/g },
];
// Wording that tends to age: worth a human or agent look even when no version number is involved.
const AGING = /\b(as of 20\d\d|in 20(?:2[0-9])|recently|new in|newly|latest|upcoming|soon|experimental|beta|canary|preview|release candidate|is being|will be (?:released|removed|deprecated)|deprecated|currently|at the time of writing|check (?:the )?(?:current|latest))\b/gi;

const text = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ');

async function latestVersions() {
  const out = {};
  if (flag('offline')) return out;
  const get = async (url) => { const r = await fetch(url, { signal: AbortSignal.timeout(15000) }); if (!r.ok) throw new Error(r.status + ' ' + url); return r.json(); };
  await Promise.all(TRACKED.map(async (t) => {
    try {
      if (t.npm) {
        const j = await get('https://registry.npmjs.org/' + t.npm.replace('/', '%2F') + '/latest');
        out[t.name] = { version: j.version, major: Number(String(j.version).split('.')[0]) };
      } else if (t.src === 'node') {
        const j = await get('https://nodejs.org/dist/index.json');
        const lts = j.find((x) => x.lts), cur = j.find((x) => !/alpha|beta|rc|nightly/.test(x.version)) ?? j[0];
        out[t.name] = { version: lts.version.replace(/^v/, '') + ' LTS (' + lts.lts + '), current ' + cur.version.replace(/^v/, ''), major: Number(lts.version.replace(/^v/, '').split('.')[0]) };
      } else if (t.src === 'year') {
        // The ECMAScript edition is finalised each June and named after that year.
        const d = new Date(); const y = d.getFullYear() - (d.getMonth() < 5 ? 1 : 0);
        out[t.name] = { version: 'ES' + y, major: y };
      }
    } catch (e) { out[t.name] = { error: String(e.message || e) }; }
  }));
  return out;
}

async function scanGuide(slug, latest) {
  const html = JSON.parse(await readFile(path.join(APP, slug, 'content.json'), 'utf8')).html;
  if (!html.includes(MARK)) return null;
  const data = loadData(html);
  const cards = [];
  const tech = {};   // name -> { majors:Set, max, cards: [{ ref, major }] }
  const aging = [];
  let total = 0;
  for (const s of data) {
    if (s.id === 'quickref') continue;   // generated from the other sections
    s.questions.forEach((q, i) => {
      total++;
      const ref = s.id + ':' + i;
      const title = plainTitle(q.q).slice(0, 90);
      const body = text(q.q + ' ' + q.a);
      cards.push({ ref, title, section: plainTitle(s.title) });
      for (const t of TRACKED) {
        t.re.lastIndex = 0;
        let m;
        while ((m = t.re.exec(body))) {
          const major = Number(m[1]);
          const rec = (tech[t.name] ??= { majors: new Set(), cards: [] });
          rec.majors.add(major);
          if (!rec.cards.some((c) => c.ref === ref && c.major === major)) rec.cards.push({ ref, title, major });
        }
      }
      const hits = [...new Set((body.match(AGING) || []).map((x) => x.toLowerCase()))];
      if (hits.length) aging.push({ ref, title, hits });
    });
  }
  const behind = [];
  for (const [name, rec] of Object.entries(tech)) {
    rec.max = Math.max(...rec.majors);
    const cur = latest[name];
    if (cur && !cur.error && rec.max < cur.major) behind.push({ name, mentioned: rec.max, latest: cur.version, cards: rec.cards.filter((c) => c.major === rec.max) });
  }
  return { slug, sections: data.filter((s) => s.id !== 'quickref').map((s) => ({ id: s.id, title: plainTitle(s.title), cards: s.questions.length })), total, tech, behind, aging };
}

const days = (d) => Math.round((Date.parse(today) - Date.parse(d)) / 86400000);

function reportMd(results, latest, state) {
  const lines = ['# Study guide freshness report', '', 'Generated ' + today + ' by `npm run study:freshness`. This file is rebuilt on every run.', ''];
  lines.push('## Current versions', '', '| Technology | Current | Guides that mention an older major as their newest |', '| --- | --- | --- |');
  for (const t of TRACKED) {
    const cur = latest[t.name];
    const who = results.filter((r) => r.behind.some((b) => b.name === t.name)).map((r) => r.slug + ' (' + r.behind.find((b) => b.name === t.name).mentioned + ')');
    const used = results.some((r) => r.tech[t.name]);
    if (!used && !who.length) continue;
    lines.push('| ' + t.name + ' | ' + (cur ? (cur.error ? 'lookup failed' : cur.version) : 'not checked (offline)') + ' | ' + (who.join(', ') || 'none') + ' |');
  }
  lines.push('', '## Guides', '', '| Guide | Cards | Versions behind | Time-sensitive wording | Last reviewed | Prompt |', '| --- | --- | --- | --- | --- | --- |');
  for (const r of results) {
    const st = state[r.slug];
    const age = st ? days(st.reviewed) + ' days ago (' + st.reviewed + (st.scope ? ', ' + st.scope : '') + ')' : 'never recorded';
    lines.push('| ' + r.slug + ' | ' + r.total + ' | ' + (r.behind.map((b) => b.name).join(', ') || 'none') + ' | ' + r.aging.length + ' cards | ' + age + ' | [prompt](prompts/' + r.slug + '.md) |');
  }
  lines.push('', '## Details');
  for (const r of results) {
    if (!r.behind.length) continue;
    lines.push('', '### ' + r.slug);
    for (const b of r.behind) {
      lines.push('', '**' + b.name + '**: newest version mentioned is ' + b.mentioned + ', current is ' + b.latest + '.', '');
      for (const c of b.cards.slice(0, 12)) lines.push('- `' + c.ref + '` ' + c.title);
      if (b.cards.length > 12) lines.push('- and ' + (b.cards.length - 12) + ' more');
    }
  }
  lines.push('', '## How to act on this', '', '1. Open the prompt for a guide in `docs/freshness/prompts/` and give it to a coding agent in this repository (or run `/refresh-guides <guide>` in Claude Code).', '2. Review its change list and the diff.', '3. Run `npm run study:build && npm run build && npm test`.', '4. Run `npm run study:freshness -- --mark <guide>` to record the review date.', '');
  return lines.join('\n');
}

function promptMd(r, latest, state) {
  const st = state[r.slug];
  const versions = Object.entries(r.tech).map(([name, rec]) => {
    const cur = latest[name];
    return '- ' + name + ': guide mentions major version(s) ' + [...rec.majors].sort((a, b) => a - b).join(', ') + (cur && !cur.error ? '; current is ' + cur.version : '') + (r.behind.some((b) => b.name === name) ? '  ← BEHIND' : '');
  });
  const behind = r.behind.flatMap((b) => ['', '### ' + b.name + ' (guide: ' + b.mentioned + ', current: ' + b.latest + ')', ...b.cards.map((c) => '- `' + c.ref + '` ' + c.title)]);
  const aging = r.aging.slice(0, 60).map((a) => '- `' + a.ref + '` ' + a.title + '  (' + a.hits.join(', ') + ')');
  return `# Refresh prompt: ${r.slug}

Generated ${today} by \`npm run study:freshness\`. Paste this into a coding agent opened at the repository root.

## Task

Bring the **${r.slug}** study guide (\`app/${r.slug}/content.json\`, ${r.total} cards) up to date. It is interview-prep content for full-stack developers, so a wrong or outdated answer is worse than a missing one.${st ? ' It was last reviewed on ' + st.reviewed + ' (' + (st.scope || 'full') + ').' : ' No review has been recorded for it yet.'}

## Rules

1. **Verify before you change anything.** Do not rely on what you remember: for every library, framework or runtime claim, read the official documentation or release notes for the current version first (use the \`ctx7\` CLI per the user's rules: \`npx ctx7@latest library <name> "<question>"\`, then \`npx ctx7@latest docs <id> "<question>"\`; fall back to the project's own release notes).
2. **Change only what is wrong, outdated or missing.** Keep the guide's voice and structure. Do not rewrite cards that are still correct.
3. **Keep older versions when they are still asked about.** If a card compares versions (for example Next.js 14 vs 15 vs 16), add the new version; do not delete the history.
4. **Edit through the toolkit, never by hand-editing JSON.** Read \`scripts/study/README.md\`. Load with \`lib.load('${r.slug}')\`, change cards with the helpers in \`helpers.mjs\` (\`findCard\`, \`addCards\`, \`appendHtml\`) or by editing the guide's content script if it has one (\`scripts/study/add-*.mjs\`, \`*-content-*.mjs\`), then \`lib.save(slug, await lib.upgrade(lib.withData(html, data)))\`. If the guide has a Quick Reference section, call \`H.regenQuickRef(data)\` before saving.
5. **New diagrams** go in a \`scripts/study/dg-*.mjs\` module and are checked with \`node scripts/study/preview-diagrams.mjs <module>\` in both themes.
6. **Code samples must run.** Compile or execute any snippet you add or change.
7. Writing style: plain sentences, no filler, no em dashes as separators, British or American spelling consistent with the card you are editing.

## What the scan found

Versions mentioned in this guide:
${versions.join('\n') || '- none of the tracked technologies are mentioned by version'}
${behind.length ? '\n## Cards that mention the newest-known version of something that has since moved on\n' + behind.join('\n') : ''}
${aging.length ? '\n## Cards with time-sensitive wording (check each still holds)\n\n' + aging.join('\n') + (r.aging.length > 60 ? '\n- and ' + (r.aging.length - 60) + ' more' : '') : ''}

## Sections

${r.sections.map((s) => '- `' + s.id + '` ' + s.title + ' (' + s.cards + ')').join('\n')}

## Beyond the scan

The scan only sees version numbers and wording. Also check, for this guide's subject:

- **What is new** since the last review that an interviewer would now expect (new stable APIs, new defaults, renamed concepts).
- **What is deprecated or removed** that the guide still recommends.
- **Best practice that has shifted** (recommended tools, patterns the official docs now discourage).
- **Missing questions** that have become common for this topic.
- **Diagrams and whiteboard value**: any card that explains a mechanism in prose only and would be clearer with a diagram.

## When you are done

1. Run \`npm run study:build && npm run build && npm test\` and fix anything that fails.
2. Report: a table of every card changed (ref, what changed, the source you verified it against), anything you could not verify, and suggestions you did not act on.
3. Run \`npm run study:freshness -- --mark ${r.slug}\` to record the review date.
4. Do not commit or push unless asked.
`;
}

async function main() {
  const state = existsSync(STATE) ? JSON.parse(await readFile(STATE, 'utf8')) : {};
  const mark = opt('mark');
  if (mark) {
    for (const slug of mark.split(',')) state[slug] = { reviewed: today, scope: opt('scope') || 'full' };
    await writeFile(STATE, JSON.stringify(state, null, 2) + '\n');
    console.log('recorded ' + mark + ' as reviewed on ' + today);
    return;
  }
  const only = opt('guide');
  const slugs = (await readdir(APP, { withFileTypes: true })).filter((d) => d.isDirectory() && existsSync(path.join(APP, d.name, 'content.json'))).map((d) => d.name).filter((s) => !only || only.split(',').includes(s));
  const latest = await latestVersions();
  const results = (await Promise.all(slugs.map((s) => scanGuide(s, latest)))).filter(Boolean);
  await mkdir(path.join(OUT, 'prompts'), { recursive: true });
  await writeFile(path.join(OUT, 'report.md'), reportMd(results, latest, state));
  for (const r of results) await writeFile(path.join(OUT, 'prompts', r.slug + '.md'), promptMd(r, latest, state));
  if (flag('json')) await writeFile(path.join(OUT, 'report.json'), JSON.stringify({ generated: today, latest, results: results.map((r) => ({ ...r, tech: Object.fromEntries(Object.entries(r.tech).map(([k, v]) => [k, { majors: [...v.majors], cards: v.cards }])) })) }, null, 2));

  const failed = Object.entries(latest).filter(([, v]) => v.error).map(([k]) => k);
  console.log('freshness: ' + results.length + ' guide(s) scanned' + (flag('offline') ? ' (offline: versions not checked)' : '') + (failed.length ? '; lookups failed for ' + failed.join(', ') : ''));
  for (const r of results) {
    const st = state[r.slug];
    console.log('  ' + r.slug.padEnd(26) + (r.behind.length ? 'BEHIND: ' + r.behind.map((b) => b.name + ' ' + b.mentioned + ' → ' + String(b.latest).split(' ')[0]).join(', ') : 'versions ok').padEnd(64) + ' ' + String(r.aging.length).padStart(3) + ' time-sensitive  ' + (st ? days(st.reviewed) + 'd since review' : 'never reviewed'));
  }
  console.log('report: docs/freshness/report.md   prompts: docs/freshness/prompts/<guide>.md');
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
