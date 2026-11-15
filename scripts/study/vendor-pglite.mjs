// Copies the browser files of PGlite (PostgreSQL compiled to WebAssembly) from node_modules to
// public/vendor/pglite-<version>/, where the in-browser SQL runner imports them. The folder is generated
// (git-ignored) and its name carries the version, so it can be cached for a year.
//   node scripts/study/vendor-pglite.mjs      (also runs from emit-static.mjs, so every build has it)
import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(ROOT, 'node_modules', '@electric-sql', 'pglite');

export async function vendorPglite() {
  if (!existsSync(path.join(SRC, 'package.json'))) {
    console.warn('vendor-pglite: @electric-sql/pglite is not installed; the in-browser SQL runner will be unavailable (npm install --include=dev)');
    return null;
  }
  const { version } = JSON.parse(await readFile(path.join(SRC, 'package.json'), 'utf8'));
  const dist = path.join(SRC, 'dist');
  const out = path.join(ROOT, 'public', 'vendor', 'pglite-' + version);
  await rm(path.join(ROOT, 'public', 'vendor'), { recursive: true, force: true });   // no stale versions
  await mkdir(path.join(out, 'contrib'), { recursive: true });
  // the ES entry and its chunks, the WebAssembly engine and its data, initdb (first run), one small extension
  const keep = (await readdir(dist)).filter((f) => /^(index|initdb|chunk-[A-Z0-9]+)\.js$/.test(f) || /\.(wasm|data)$/.test(f) || f === 'btree_gist.tar.gz');
  for (const f of keep) await cp(path.join(dist, f), path.join(out, f));
  await cp(path.join(dist, 'contrib', 'btree_gist.js'), path.join(out, 'contrib', 'btree_gist.js'));
  let bytes = 0;
  for (const f of [...keep, 'contrib/btree_gist.js']) bytes += (await stat(path.join(out, f))).size;
  console.log(`vendor-pglite: PGlite ${version}, ${keep.length + 1} files, ${(bytes / 1048576).toFixed(1)} MB -> public/vendor/pglite-${version}/`);
  return version;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await vendorPglite();
