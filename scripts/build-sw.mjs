// Writes public/sw.js from scripts/sw-template.js: the files to keep ready, the routes "Save for offline" saves,
// and a version that changes whenever any of those files change (so an old worker never serves a new build).
// Runs at the end of `npm run study:build`, which also runs before every `npm run build`.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOLS } from '../app/lib/tools.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const list = async (dir) => (existsSync(dir) ? (await readdir(dir)).sort() : []);

const guides = (await list(path.join(PUBLIC, 'study'))).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5));
const precache = [
  ...guides.map((g) => `/study/${g}.html`),
  '/study/engine.js',
  ...(await list(path.join(PUBLIC, 'study', 'audio'))).map((f) => `/study/audio/${f}`),
  ...(await list(path.join(PUBLIC, 'study', 'sqlrun'))).map((f) => `/study/sqlrun/${f}`),   // small files; the 15 MB engine is only saved once it has been used
  '/search-index.json',
  ...(await list(path.join(PUBLIC, 'icons'))).map((f) => `/icons/${f}`),
];
const routes = ['/', '/offline', ...guides.map((g) => `/${g}`), ...TOOLS.filter((t) => t.ready).map((t) => t.href)];

const template = await readFile(path.join(ROOT, 'scripts', 'sw-template.js'), 'utf8');
const hash = createHash('sha1');
hash.update(template);
for (const url of precache) { const file = path.join(PUBLIC, url); if (existsSync(file)) hash.update(await readFile(file)); }
const version = hash.digest('hex').slice(0, 10);

// replace the declarations, not the first mention of a placeholder
const fill = (text, name, value) => {
  const decl = `= ${name};`;
  if (!text.includes(decl)) throw new Error('sw-template.js has no ' + name);
  return text.replace(decl, () => `= ${value};`);
};
let out = template;
out = out.replace("'__VERSION__'", () => `'${version}'`);
out = fill(out, '__PRECACHE__', JSON.stringify(precache, null, 2));
out = fill(out, '__ROUTES__', JSON.stringify(routes, null, 2));
if (/__[A-Z]+__/.test(out)) throw new Error('an unfilled placeholder is left in sw.js');
await writeFile(path.join(PUBLIC, 'sw.js'), out);
console.log(`sw: ${precache.length} precached files, ${routes.length} routes, version ${version}`);
