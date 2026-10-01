// Load / edit / save study pages (app/<guide>/content.json), built on the shared card engine
// (search, flashcards, phone menu, progress shared across guides by question title).
//
//   import * as lib from './lib.mjs';
//   const { data } = await lib.load('nextjs');       // data: [{ id, title, questions: [{ q, a }] }]
//   ... edit `data` in place (see helpers.mjs for addCards / addSection / findCard) ...
//   await lib.save('nextjs', lib.upgrade(lib.withData((await lib.load('nextjs')).html, data)));
//
// lib.upgrade(html) is idempotent: safe to call on a page that already has the current engine.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadData, serialize, MARK } from './parsePage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const APP = path.join(ROOT, 'app');

const V3_CSS = `
  /* study-v3: compact phone menu + cross-guide search results */
  .nav-toggle{display:none;}
  .ghits{margin-top:22px;}
  .gh-head{display:flex; justify-content:space-between; gap:10px; font-family:var(--mono); font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); margin:0 0 8px;}
  .gh{display:block; text-decoration:none; color:var(--text); background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:10px 14px; margin-bottom:8px;}
  .gh:hover{border-color:var(--accent);}
  .gh-t{display:block; font-weight:600; font-size:14.5px;}
  .gh-m{display:block; font-family:var(--mono); font-size:11.5px; color:var(--accent); margin:2px 0;}
  .gh-s{display:block; font-size:13px; color:var(--muted);}
  .gh-note{font-size:13px; color:var(--muted);}
  @media (max-width: 820px){
    .sidebar{position:sticky; top:0; z-index:30; display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:10px 14px; background:var(--bg);}
    .sidebar .brand{display:none;}
    .sidebar .search{flex:1 1 130px; width:auto; min-width:0; margin:0;}
    .nav-toggle{display:flex; align-items:center; justify-content:space-between; gap:8px; flex:0 1 54%; min-width:0; padding:9px 12px; font:inherit; font-size:13.5px; font-weight:600; color:var(--text); background:var(--accent-soft); border:1px solid var(--accent); border-radius:8px; cursor:pointer;}
    .nav-toggle span{overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
    .nav-toggle i{font-style:normal; color:var(--accent); transition:transform .15s;}
    .sidebar.open .nav-toggle i{transform:rotate(180deg);}
    .nav-panel{display:none; flex:1 0 100%; max-height:calc(100vh - 96px); overflow-y:auto; border-top:1px solid var(--border); padding-top:8px;}
    .sidebar.open .nav-panel{display:block;}
    .hero{margin-top:0;}
  }
  button.fc-start.alt{background:var(--panel); color:var(--accent); border:1px solid var(--accent); cursor:pointer;}
  button.fc-start.alt:hover{background:var(--accent-soft);}
`;

const ENGINE_JS_PATH = path.join(ROOT, 'scripts', 'study', 'engine.js');
const CFG_RE = /window\.__STUDY__\s*=\s*(\{[^;]*\});\s*$/;

let _engineWithCloser;
async function engineWithCloser() {
  if (_engineWithCloser) return _engineWithCloser;
  const closer = '\n</script>\n</body>\n</html>\n';
  _engineWithCloser = (await readFile(ENGINE_JS_PATH, 'utf8')).trimEnd() + closer;
  return _engineWithCloser;
}

export async function load(page) {
  const html = JSON.parse(await readFile(path.join(APP, page, 'content.json'), 'utf8')).html;
  return { html, data: loadData(html) };
}

// Replace the DATA literal, keep everything else (styling, engine) as is. The page's
// window.__STUDY__ config sits between DATA and the marker, so it has to be carried over or
// upgrade() can no longer tell which guide (storage key) it is looking at.
export function withData(html, data) {
  const ds = html.indexOf('const DATA = ['), de = html.indexOf(MARK);
  if (ds < 0 || de < 0) throw new Error('DATA/marker not found');
  const cfg = html.slice(ds, de).match(CFG_RE);
  return html.slice(0, ds) + serialize(data) + '\n' + (cfg ? cfg[0] : '') + html.slice(de);
}

// Applies the shared engine: phone menu + cross-guide search markup/CSS (once), and always
// refreshes the engine script itself from scripts/study/engine.js (so an engine fix or feature
// reaches every guide by editing one file and re-running this).
export async function upgrade(html) {
  const mi = html.indexOf(MARK);
  if (mi < 0) throw new Error('no engine marker');
  let h = html.slice(0, mi);

  // Config: prefer an existing window.__STUDY__ assignment; else fall back to the old
  // per-page literal engine text, for a page that predates the shared engine.
  const cfgMatch = h.match(CFG_RE);
  let key, core;
  if (cfgMatch) {
    ({ key, core } = JSON.parse(cfgMatch[1]));
    h = h.slice(0, cfgMatch.index);
  } else {
    const eng = html.slice(mi);
    key = (eng.match(/STORAGE_KEY = '([a-z0-9-]+)-reviewed-v1'/) || [])[1];
    core = (eng.match(/marked ★ core \(linked from ([^)]+)\)/) || [])[1] || 'the 2-Hour Review';
  }
  if (!key) throw new Error('storage key not found');

  if (!h.includes('/* study-v3')) {
    const ce = h.indexOf('</style>');
    if (ce < 0) throw new Error('no style');
    h = h.slice(0, ce) + V3_CSS + h.slice(ce);
    const inp = /<input class="search" id="searchInput"[^>]*>\s*<div id="navList"><\/div>/;
    if (!inp.test(h)) throw new Error('sidebar markup not found');
    h = h.replace(inp, () =>
      '<input class="search" id="searchInput" type="search" placeholder="Search all guides   /" aria-label="Search all guides">\n' +
      '    <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="navPanel"><span id="navToggleLbl">Sections</span><i>▾</i></button>\n' +
      '    <div class="nav-panel" id="navPanel">\n    <div id="navList"></div>');
    const tail = /(<button class="reset-btn" id="resetBtn">Reset progress<\/button>\s*<\/div>)(\s*<\/nav>)/;
    if (!tail.test(h)) throw new Error('sidebar end not found');
    h = h.replace(tail, (m, a, b) => a + '\n    </div>' + b);
  }
  if (!h.includes('id="fcWeak"')) {
    const fcCoreBtn = /<button id="fcCore" class="fc-start" type="button">[\s\S]*?<\/button>/;
    if (!fcCoreBtn.test(h)) throw new Error('fcCore button not found');
    h = h.replace(fcCoreBtn, (m) => m + '\n      <button id="fcWeak" class="fc-start alt" type="button" hidden>↻ Review weak cards</button>');
  }
  const engine = await engineWithCloser();
  return h + 'window.__STUDY__ = ' + JSON.stringify({ key, core }) + ';\n' + engine;
}

export async function save(page, html) {
  // syntax + data sanity before anything is written
  const D = loadData(html);
  const titles = D.flatMap((s) => s.questions.map((q) => s.id + '|' + q.q));
  const dup = titles.filter((x, i) => titles.indexOf(x) !== i);
  if (dup.length) throw new Error(page + ' duplicate titles: ' + dup.join(' ; '));
  await writeFile(path.join(APP, page, 'content.json'), JSON.stringify({ html }));
  return D.reduce((n, s) => n + s.questions.length, 0);
}

export { serialize, loadData, MARK };
