// Emits the files the browser actually loads for each guide: public/study/<slug>.html (head,
// styles, sidebar markup and DATA — everything except the engine script) and public/study/engine.js
// (copied from the canonical scripts/study/engine.js, shared byte-for-byte by every guide).
//
// Why: app/<slug>/content.json keeps each guide fully self-contained (so it also works as an
// iframe srcDoc, which the encrypted /my-prep page needs), but that means embedding a ~26KB copy
// of the engine in every guide and, for a Server->Client component prop, serializing the whole
// multi-hundred-KB guide into the page's own payload. Loading a static file instead means the
// Next.js page itself stays tiny and the guide's HTML is fetched (and cached) like any other file.
//
// /my-prep is intentionally never emitted here: its content only exists client-side, decrypted
// from private.enc.json with the reader's password, and must never reach a public file.
//
// Runs automatically before every `npm run build` (see package.json's "prebuild"); run directly
// with `npm run study:emit` after an edit if you want the files without a full build.
import { mkdir, readdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MARK } from './parsePage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = path.join(ROOT, 'app');
const OUT = path.join(ROOT, 'public', 'study');
const SKIP = new Set(['my-prep']);

async function main() {
  await mkdir(OUT, { recursive: true });
  await copyFile(path.join(ROOT, 'scripts', 'study', 'engine.js'), path.join(OUT, 'engine.js'));

  const guides = (await readdir(APP, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !SKIP.has(d.name))
    .map((d) => d.name)
    .filter((slug) => existsSync(path.join(APP, slug, 'content.json')));

  let count = 0, totalBytes = 0;
  for (const slug of guides) {
    const html = JSON.parse(await readFile(path.join(APP, slug, 'content.json'), 'utf8')).html;
    const mi = html.indexOf(MARK);
    if (mi < 0) continue; // not on the card engine (shouldn't happen for a current guide)
    const head = html.slice(0, mi); // <head>, sidebar markup, DATA, and the window.__STUDY__ config
    const out = head + '</script>\n<script src="/study/engine.js"></script>\n</body>\n</html>\n';
    const file = path.join(OUT, slug + '.html');
    await writeFile(file, out);
    const { size } = await stat(file);
    totalBytes += size;
    count++;
  }
  const engineSize = (await stat(path.join(OUT, 'engine.js'))).size;
  console.log(`emit-static: ${count} guide(s) -> public/study/*.html (${(totalBytes / 1024).toFixed(0)} KB total) + engine.js (${(engineSize / 1024).toFixed(1)} KB, shared)`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
