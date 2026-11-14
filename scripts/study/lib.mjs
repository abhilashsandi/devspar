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

// The one stylesheet and font link every guide uses. upgrade() swaps each guide's own <style> for
// theme.css, so a design change is one file plus `npm run study:upgrade`.
const THEME_PATH = path.join(ROOT, 'scripts', 'study', 'theme.css');
const FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,400;0,500;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">';
let _theme;
async function theme() {
  if (!_theme) _theme = '<style>\n' + (await readFile(THEME_PATH, 'utf8')).trimEnd() + '\n</style>';
  return _theme;
}

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

// Applies everything shared: the theme (scripts/study/theme.css), the font link, the phone menu
// markup (once), and the engine script itself from scripts/study/engine.js. So a design change, an
// engine fix or a feature reaches every guide by editing one file and re-running this
// (`npm run study:upgrade` does it for every guide).
export async function upgrade(html) {
  const mi = html.indexOf(MARK);
  if (mi < 0) throw new Error('no engine marker');
  let h = html.slice(0, mi);

  // Config: prefer an existing window.__STUDY__ assignment; else fall back to the old
  // per-page literal engine text, for a page that predates the shared engine.
  const cfgMatch = h.match(CFG_RE);
  let key, core, extra = {};
  if (cfgMatch) {
    ({ key, core, ...extra } = JSON.parse(cfgMatch[1]));
    h = h.slice(0, cfgMatch.index);
  } else {
    const eng = html.slice(mi);
    key = (eng.match(/STORAGE_KEY = '([a-z0-9-]+)-reviewed-v1'/) || [])[1];
    core = (eng.match(/marked ★ core \(linked from ([^)]+)\)/) || [])[1] || 'the 2-Hour Review';
  }
  if (!key) throw new Error('storage key not found');

  // Styling: always the current shared theme and fonts.
  const styleRe = /<style>[\s\S]*?<\/style>/;
  if (!styleRe.test(h)) throw new Error('no style');
  const css = await theme();
  h = h.replace(styleRe, () => css);
  h = h.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>/, () => FONTS_LINK);

  // Markup that a page from before the phone menu / cross-guide search needs, once.
  if (!h.includes('id="navToggle"')) {
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
  return h + 'window.__STUDY__ = ' + JSON.stringify({ key, core, ...extra }) + ';\n' + engine;
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
