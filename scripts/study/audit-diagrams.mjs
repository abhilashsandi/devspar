// Checks that the hand-drawn ("whiteboard") version of every diagram keeps every detail of the tidy original.
//   node scripts/study/audit-diagrams.mjs            every guide
//   node scripts/study/audit-diagrams.mjs sql aws    only these guides
// For each diagram it renders the authored SVG, then the sketched one, in a real browser and compares them:
//   - the same text, in the same order, with nothing dropped
//   - the same number of drawn shapes
//   - every label still inside the box it sat in, and inside the drawing
//   - no two labels on one line running into each other
// Writes .diagram-audit.html (git-ignored) with every diagram side by side, and exits 1 on a failure.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';
import * as lib from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const slugs = (await readdir(lib.APP, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && existsSync(path.join(lib.APP, d.name, 'content.json')) && d.name !== 'my-prep')
  .map((d) => d.name).filter((s) => !only.length || only.includes(s));

const items = [];
for (const slug of slugs) {
  const { data } = await lib.load(slug);
  for (const sec of data) sec.questions.forEach((q, qi) => {
    for (const m of q.a.matchAll(/<div class="diagram[^>]*>[\s\S]*?<\/svg>\s*<\/div>/g)) items.push({ where: slug + '#' + sec.id + ':' + qi, html: m[0] });
  });
}

const css = await readFile(path.join(here, 'theme.css'), 'utf8');
const engine = await readFile(path.join(here, 'engine.js'), 'utf8');
const sketchJs = engine.slice(engine.indexOf('// ---- sketch:start'), engine.indexOf('// ---- sketch:end'));
const page_html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Diagram audit</title>' +
  '<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;500;700&family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Mono:wght@400;500;600&family=Caveat:wght@600;700&display=swap" rel="stylesheet">' +
  '<style>' + css + (process.env.AUDIT_CSS || '') + ' .pair{display:grid;grid-template-columns:1fr 1fr;gap:12px} .pair .diagram svg{width:100%} .bad{outline:3px solid var(--danger)}</style></head>' +
  '<body style="padding:20px;max-width:1900px;margin:0 auto">' +
  '<button onclick="var r=document.documentElement;r.dataset.theme=r.dataset.theme===\'dark\'?\'light\':\'dark\'" style="position:fixed;top:10px;right:10px;z-index:9">light / dark</button>' +
  items.map((it, i) => '<p class="codelabel" id="l' + i + '">' + it.where + '</p><div class="pair" data-i="' + i + '"><div class="t">' + it.html.replace('class="diagram', 'class="diagram tidy') + '</div><div class="s">' + it.html + '</div></div>').join('') +
  '<script>' + sketchJs + '</script></body></html>';
const out = path.resolve(here, '..', '..', '.diagram-audit.html');
await writeFile(out, page_html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1900, height: 1000 } });
await page.goto(pathToFileURL(out).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// 1. measure the authored drawing, then sketch the copy beside it
await page.evaluate(() => {
  const shapes = (svg) => [...svg.querySelectorAll('rect, path, line, circle, ellipse, polygon, polyline')].filter((e) => !e.closest('defs, marker')).length;
  const bb = (e) => { const r = e.getBBox(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
  window.__tidy = [...document.querySelectorAll('.pair')].map((pair) => {
    const tidy = pair.querySelector('.t svg');
    const rects = [...tidy.querySelectorAll('rect')].filter((e) => !e.closest('defs, marker')).map(bb);
    const texts = [...tidy.querySelectorAll('text')].map((t) => {
      const box = bb(t);
      // the smallest box this label sits inside, if any
      const home = rects.filter((r) => box.x >= r.x - 0.5 && box.x + box.w <= r.x + r.w + 0.5 && box.y >= r.y - 0.5 && box.y + box.h <= r.y + r.h + 0.5).sort((p, q) => p.w * p.h - q.w * q.h)[0] || null;
      return { s: t.textContent, box, home };
    });
    pair.querySelectorAll('.s svg').forEach(sketch);
    return { shapes: shapes(tidy), texts };
  });
});
// 2. the handwriting face is only requested once something uses it, so wait for it before measuring
await page.evaluate(() => Promise.all([document.fonts.load('600 12px Caveat'), document.fonts.load('700 12px Caveat')]).then(() => document.fonts.ready));
await page.waitForTimeout(300);
if (!(await page.evaluate(() => document.fonts.check('600 12px Caveat')))) throw new Error('the Caveat font did not load, so the measurements would be wrong');
// 3. compare
const report = await page.evaluate(() => {
  const shapes = (svg) => [...svg.querySelectorAll('rect, path, line, circle, ellipse, polygon, polyline')].filter((e) => !e.closest('defs, marker')).length;
  return [...document.querySelectorAll('.pair')].map((pair, pi) => {
    const was = window.__tidy[pi], sk = pair.querySelector('.s svg');
    const vb = (sk.getAttribute('viewBox') || '').split(/s+/).map(Number);
    const st = [...sk.querySelectorAll('text')].map((t) => { const r = t.getBBox(); return { s: t.textContent, box: { x: r.x, y: r.y, w: r.width, h: r.height } }; });
    const problems = [], ratios = [];
    if (was.texts.length !== st.length) problems.push('label count ' + was.texts.length + ' -> ' + st.length);
    if (was.shapes !== shapes(sk)) problems.push('shape count ' + was.shapes + ' -> ' + shapes(sk));
    was.texts.forEach((t, k) => {
      const s = st[k]; if (!s) return;
      if (t.s !== s.s) problems.push('label changed: ' + t.s.slice(0, 40));
      if (t.box.w > 4) ratios.push(s.box.w / t.box.w);
      const b = s.box, h = t.home;
      if (h) { if (b.x < h.x - 1.5 || b.x + b.w > h.x + h.w + 1.5) problems.push('spills out of its box by ' + Math.max(h.x - b.x, b.x + b.w - h.x - h.w).toFixed(1) + 'px: ' + t.s.slice(0, 50)); }
      else if (vb.length === 4) {
        const a = t.box, wasIn = a.x >= vb[0] - 1 && a.x + a.w <= vb[0] + vb[2] + 1;
        if (wasIn && (b.x < vb[0] - 1 || b.x + b.w > vb[0] + vb[2] + 1)) problems.push('now outside the drawing: ' + t.s.slice(0, 50));
      }
    });
    // two labels on one line that did not touch must still not touch
    for (let i = 0; i < st.length && i < was.texts.length; i++) for (let j = 0; j < st.length && j < was.texts.length; j++) {
      if (i === j) continue;
      const a = was.texts[i].box, c = was.texts[j].box;
      if (Math.abs((a.y + a.h) - (c.y + c.h)) > 3 || a.x + a.w > c.x) continue;      // same baseline, i left of j, apart
      const overlap = st[i].box.x + st[i].box.w - st[j].box.x;
      if (overlap > 1) problems.push('runs into the next label by ' + overlap.toFixed(1) + 'px: ' + st[i].s.slice(0, 40) + ' | ' + st[j].s.slice(0, 20));
    }
    if (problems.length) pair.classList.add('bad');
    return { i: Number(pair.dataset.i), problems, ratios };
  });
});
await browser.close();

const all = report.flatMap((r) => r.ratios).sort((a, b) => a - b);
const pct = (p) => (all.length ? all[Math.min(all.length - 1, Math.floor(all.length * p))].toFixed(2) : 'n/a');
const bad = report.filter((r) => r.problems.length);
console.log(`audit: ${items.length} diagram(s) in ${slugs.length} guide(s), ${all.length} labels`);
console.log(`label width, sketch / tidy: median ${pct(0.5)}, 95th percentile ${pct(0.95)}, widest ${pct(0.9999)}`);
for (const r of bad) console.log('  FAIL ' + items[r.i].where + '\n    - ' + r.problems.slice(0, 6).join('\n    - ') + (r.problems.length > 6 ? '\n    - … ' + (r.problems.length - 6) + ' more' : ''));
console.log(bad.length ? `audit: FAIL (${bad.length} diagram(s))  see ${out}` : `audit: OK  (side by side: ${out})`);
process.exitCode = bad.length ? 1 : 0;
