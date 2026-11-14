// Writes a gallery page of diagrams so you can check them in a browser (text inside its box, both themes)
// before they ship in a guide.
//   node scripts/study/preview-diagrams.mjs dg-ai            every diagram in scripts/study/dg-ai.mjs
//   node scripts/study/preview-diagrams.mjs dg loop,context  only the named ones
// Output: .diagram-preview.html in the repo root (git-ignored). Open it, and use the button to flip the theme.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const [mod = 'dg', only] = process.argv.slice(2);
const m = await import(pathToFileURL(path.join(here, mod + '.mjs')).href);
const set = m.default ?? Object.values(m).find((v) => v && typeof v === 'object');
const keys = Object.keys(set).filter((k) => typeof set[k] === 'string' && (!only || only.split(',').includes(k)));
const css = await readFile(path.join(here, 'theme.css'), 'utf8');
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Diagram preview: ' + mod + '</title>' +
  '<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;500;700&family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">' +
  '<style>' + css + '</style></head><body style="padding:20px;max-width:980px;margin:0 auto">' +
  '<button onclick="var r=document.documentElement;r.dataset.theme=r.dataset.theme===\'dark\'?\'light\':\'dark\'" style="position:fixed;top:10px;right:10px">light / dark</button>' +
  keys.map((k) => '<p class="codelabel">' + mod + ' · ' + k + '</p>' + set[k]).join('') + '</body></html>';
const out = path.resolve(here, '..', '..', '.diagram-preview.html');
await writeFile(out, html);
console.log(keys.length + ' diagram(s) -> ' + out);
