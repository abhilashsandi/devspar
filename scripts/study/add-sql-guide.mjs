// Builds the Data and SQL guide (app/sql/content.json) from sql-content-a/b/c.mjs.
//   node scripts/study/add-sql-guide.mjs && npm run study:build
// Re-running rebuilds the guide from scratch, so edit the content files and run it again.
import { mkdir } from 'node:fs/promises';
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { basics, indexing, transactions } from './sql-content-a.mjs';
import { puzzles } from './sql-content-b.mjs';
import { schema, performance, fromNode, nosql } from './sql-content-c.mjs';

const data = [
  { id: 'quickref', title: 'Quick Reference', questions: [] },
  { id: 'sq1', title: '1. Relational Basics', questions: basics },
  { id: 'sq2', title: '2. Indexing', questions: indexing },
  { id: 'sq3', title: '3. Transactions and Isolation', questions: transactions },
  { id: 'sq4', title: '4. Query Puzzles', questions: puzzles },
  { id: 'sq5', title: '5. Schema Design and Migrations', questions: schema },
  { id: 'sq6', title: '6. Performance and Scaling', questions: performance },
  { id: 'sq7', title: '7. PostgreSQL from Node.js', questions: fromNode },
  { id: 'sq8', title: '8. Beyond Relational', questions: nosql },
];
H.regenQuickRef(data);

const html = await H.newPage(
  {
    key: 'sql',
    title: 'Data and SQL: Interview Prep',
    brand: 'Data and SQL',
    brandSub: 'indexes, transactions, queries',
    h1: 'Data and SQL',
    eyebrow: 'Prep guide',
    lede: 'Indexes, transactions and isolation, query puzzles, schema changes without downtime, and PostgreSQL from Node.js. Every statement was run on a real PostgreSQL 17.6 database and every result shown is pasted from that run. You can also run every puzzle in your browser.',
  },
  data,
);

await mkdir(new URL('../../app/sql/', import.meta.url), { recursive: true });
const total = await lib.save('sql', await lib.upgrade(html));
console.log('sql guide written: ' + data.length + ' sections, ' + total + ' cards');
