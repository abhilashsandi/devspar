// Runs the Data and SQL guide's seed and puzzle file on PGlite (PostgreSQL compiled to WebAssembly, the
// engine the in-browser runner uses) and compares each result's row count, and the errors raised, with the
// PostgreSQL 17.6 run the cards were written from (scripts/study/sql-lab/b-puzzles.out).
//   npm run study:sql-lab
// It reports differences for a person to look at; it never edits a card, and it exits 0 either way.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';   // the guide's exclusion-constraint example needs it

const lab = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'sql-lab');
const db = new PGlite({ extensions: { btree_gist } });
const version = (await db.query('select version() as v')).rows[0].v;
console.log('engine: ' + version.split(' on ')[0]);

const t0 = Date.now();
await db.exec(await readFile(path.join(lab, 'seed.sql'), 'utf8'));
console.log('seed loaded in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');

const chunks = (await readFile(path.join(lab, 'b-puzzles.sql'), 'utf8')).split(/^-- >>>\s*$/m).map((c) => c.trim()).filter(Boolean);
const out = await readFile(path.join(lab, 'b-puzzles.out'), 'utf8');
const printedRows = [...out.matchAll(/^\((\d+) rows?\)$/gm)].map((m) => Number(m[1]));
const printedErrors = [...out.matchAll(/^ERROR: .*\(SQLSTATE (\w+)\)$/gm)].map((m) => m[1]);

const rowSets = [], errors = [];
for (const chunk of chunks) {
  let results;
  try { results = await db.exec(chunk); } catch (e) { errors.push({ chunk, error: e.message, code: e.code }); continue; }
  const r = results[results.length - 1];
  if (r && r.fields && r.fields.length) rowSets.push({ chunk, rows: r.rows.length });
}

let same = 0;
const diffs = [];
rowSets.forEach((m, i) => {
  if (m.rows === printedRows[i]) same++;
  else diffs.push(`result set ${i + 1}: PGlite returned ${m.rows} row(s), the printed run has ${printedRows[i]}\n    ${m.chunk.split('\n')[0]}`);
});
if (rowSets.length !== printedRows.length) diffs.push(`result sets: ${rowSets.length} here, ${printedRows.length} printed`);
const mineCodes = errors.map((e) => e.code).filter(Boolean).sort().join(',');
if (mineCodes !== [...printedErrors].sort().join(',')) diffs.push(`errors: here ${errors.map((e) => e.error).join('; ') || 'none'}; printed SQLSTATE ${printedErrors.join(', ') || 'none'}`);
console.log(`sql-lab: ${same} of ${printedRows.length} result sets match, ${errors.length} of ${printedErrors.length} printed errors raised` + (diffs.length ? '\n  differences:\n  - ' + diffs.join('\n  - ') : ''));
await db.close();
