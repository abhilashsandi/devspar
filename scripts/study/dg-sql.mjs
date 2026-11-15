// Diagrams for the Data and SQL guide (SQ.*). Same visual language as dg.mjs.
import { box, txt, arrow, rect, line, wrap, M } from './dg.mjs';

const defs = (id) => `<defs>${M(id, 'muted')}${M(id + 'a', 'accent')}${M(id + 'd', 'danger')}</defs>`;
const T = { color: 'text' };

export const SQ = {};

// ───────────────────────────────────────────── joins
const strip = (x, title, rows) =>
  rect(x, 150, 204, 140, 'panel', 'border') +
  txt(x + 12, 172, title, { font: 'sans', size: 12, color: 'accent', weight: 700 }) +
  rows.map((r, i) => txt(x + 12, 194 + i * 19, r[0], { size: 10.5, color: r[2] ? 'gold' : 'text' }) + txt(x + 100, 194 + i * 19, r[1], { size: 10.5, color: r[2] ? 'gold' : 'text' })).join('');

SQ.joins = wrap('0 0 900 300', `
${rect(14, 10, 262, 124, 'panel', 'border')}
${txt(26, 30, 'employees', { font: 'sans', size: 12, color: 'accent', weight: 700 })}${txt(130, 30, 'department_id', { size: 9.5 })}
${[['Ada', 'Eng'], ['Grace', 'Eng'], ['Sam', 'Sales'], ['Nora', 'NULL']].map((r, i) => txt(26, 52 + i * 20, r[0], { size: 10.5, ...T }) + txt(130, 52 + i * 20, r[1], { size: 10.5, color: r[1] === 'NULL' ? 'gold' : 'text' })).join('')}
${rect(300, 10, 220, 124, 'panel', 'border')}
${txt(312, 30, 'departments', { font: 'sans', size: 12, color: 'accent', weight: 700 })}${txt(430, 30, 'id', { size: 9.5 })}
${[['Eng', '1'], ['Sales', '2'], ['Finance', '3']].map((r, i) => txt(312, 52 + i * 20, r[0], { size: 10.5, ...T }) + txt(430, 52 + i * 20, r[1], { size: 10.5, ...T })).join('')}
${txt(312, 120, 'Finance has no employees', { size: 9.5, color: 'gold' })}
${txt(560, 52, 'ON employees.department_id = departments.id', { size: 10.5, ...T })}
${txt(560, 76, 'Nora has no department.', { size: 10.5, color: 'gold' })}
${txt(560, 96, 'Finance has no employees.', { size: 10.5, color: 'gold' })}
${txt(560, 116, 'Gold rows are the ones padded with NULL.', { size: 10.5 })}
${strip(14, 'INNER', [['Ada', 'Eng'], ['Grace', 'Eng'], ['Sam', 'Sales']])}
${strip(236, 'LEFT', [['Ada', 'Eng'], ['Grace', 'Eng'], ['Sam', 'Sales'], ['Nora', 'NULL', 1]])}
${strip(458, 'RIGHT', [['Ada', 'Eng'], ['Grace', 'Eng'], ['Sam', 'Sales'], ['NULL', 'Finance', 1]])}
${strip(680, 'FULL', [['Ada', 'Eng'], ['Grace', 'Eng'], ['Sam', 'Sales'], ['Nora', 'NULL', 1], ['NULL', 'Finance', 1]])}
`, 'How inner, left, right and full joins treat unmatched rows');

// ───────────────────────────────────────────── selectOrder
SQ.selectOrder = wrap('0 0 900 190', `${defs('so')}
${[
  ['FROM + JOIN', 'build the rows', 'n'], ['WHERE', 'filter rows', 'a'], ['GROUP BY', 'make groups', 'n'], ['HAVING', 'filter groups', 'a'],
  ['SELECT', 'windows, aliases', 'g'], ['ORDER BY', 'sort', 'n'], ['LIMIT', 'cut', 'n'],
].map((b, i) => txt(70 + i * 125, 30, String(i + 1), { anchor: 'middle', size: 10.5, color: 'accent' }) + box(14 + i * 125, 42, 112, 56, b[0], b[1], b[2]) + (i < 6 ? arrow(`M${127 + i * 125} 70 L${137 + i * 125} 70`, 'so') : '')).join('')}
${txt(450, 140, 'This is why WHERE cannot use an alias or an aggregate, and HAVING can.', { anchor: 'middle', size: 11, ...T })}
${txt(450, 162, 'It is also why a window function result cannot be filtered in the same SELECT.', { anchor: 'middle', size: 10.5 })}
`, 'The logical order in which a SELECT is evaluated');

// ───────────────────────────────────────────── compositeIndex
const IX = [['6', 'Mar 02', 0, 0, 1], ['6', 'Apr 11', 0, 0, 1], ['7', 'Jan 05', 1, 0, 0], ['7', 'Feb 14', 1, 0, 0], ['7', 'Mar 21', 1, 1, 1], ['7', 'May 30', 1, 1, 1], ['8', 'Jan 09', 0, 0, 0], ['8', 'Mar 03', 0, 0, 1], ['9', 'Feb 20', 0, 0, 0], ['9', 'Jun 01', 0, 0, 1], ['10', 'Jan 30', 0, 0, 0]];
SQ.compositeIndex = wrap('0 0 900 300', `
${txt(14, 20, '(customer_id, created_at)', { size: 10.5, color: 'accent' })}${txt(250, 20, 'A', { anchor: 'middle', size: 11, color: 'accent', weight: 700 })}${txt(280, 20, 'B', { anchor: 'middle', size: 11, color: 'accent', weight: 700 })}${txt(310, 20, 'C', { anchor: 'middle', size: 11, color: 'accent', weight: 700 })}
${IX.map((r, i) => {
  const y = 30 + i * 22;
  return rect(14, y, 210, 20, r[2] ? 'accent-soft' : 'panel', r[2] ? 'accent' : 'border', { rx: 4 }) + txt(26, y + 14, `(${r[0]}, ${r[1]})`, { size: 10.5, ...T }) +
    [r[2], r[3], r[4]].map((on, k) => on ? `<circle cx="${250 + k * 30}" cy="${y + 10}" r="5" fill="var(--${k === 2 ? 'danger' : 'accent'})"/>` : '').join('');
}).join('')}
${txt(14, 292, 'sorted by customer_id, then by created_at', { size: 10 })}
${txt(370, 44, 'A   WHERE customer_id = 7', { size: 11, ...T, weight: 700 })}
${txt(370, 62, 'The matches sit together: one seek, then read along the index.', { font: 'sans', size: 11 })}
${txt(370, 108, 'B   WHERE customer_id = 7 AND created_at > Mar 01', { size: 11, ...T, weight: 700 })}
${txt(370, 126, 'Still contiguous: seek to the block, then to the date inside it.', { font: 'sans', size: 11 })}
${txt(370, 172, 'C   WHERE created_at > Mar 01', { size: 11, ...T, weight: 700 })}
${txt(370, 190, 'The matches are scattered through the whole index.', { font: 'sans', size: 11 })}
${txt(370, 208, 'It cannot seek on a second column alone, so the planner', { font: 'sans', size: 11 })}
${txt(370, 226, 'reads the index end to end or the table instead.', { font: 'sans', size: 11 })}
${txt(370, 258, 'Put the equality column first, the range column second.', { size: 10.5, color: 'accent' })}
`, 'A composite index is sorted by its first column, then the second');

// ───────────────────────────────────────────── planTree
SQ.planTree = wrap('0 0 900 300', `${defs('pt')}
${box(130, 10, 240, 44, 'Limit', 'rows: est vs actual', 'n')}
${box(130, 72, 240, 44, 'Sort', 'rows: est vs actual', 'n')}
${box(130, 134, 240, 44, 'Hash Join', 'rows: est vs actual', 'a')}
${box(14, 220, 230, 52, 'Seq Scan on customers', 'rows: est vs actual', 'n')}
${box(262, 220, 230, 52, 'Index Scan on orders', 'rows: est vs actual', 'g')}
${arrow('M250 72 L250 58', 'pt')}${arrow('M250 134 L250 120', 'pt')}${arrow('M129 220 L200 182', 'pt')}${arrow('M377 220 L300 182', 'pt')}
${txt(14, 292, 'read from the leaves up: each node hands its rows to its parent', { size: 10 })}
${rect(540, 10, 346, 168, 'panel', 'border')}
${txt(556, 32, 'Scan types, slowest to fastest for a few rows', { font: 'sans', size: 11.5, color: 'accent', weight: 700 })}
${[['Seq Scan', 'reads every row of the table'], ['Bitmap Heap Scan', 'index finds pages, then reads them'], ['Index Scan', 'follows the index to each row'], ['Index Only Scan', 'answers from the index alone']].map((r, i) => txt(556, 62 + i * 28, r[0], { size: 10.5, ...T, weight: 700 }) + txt(556, 77 + i * 28, r[1], { size: 9.5 })).join('')}
${txt(540, 206, 'If estimated and actual rows differ by', { font: 'sans', size: 11, ...T })}
${txt(540, 224, 'a large factor, the statistics are stale', { font: 'sans', size: 11, ...T })}
${txt(540, 242, 'and the planner chose on bad information.', { font: 'sans', size: 11, ...T })}
`, 'Reading an EXPLAIN plan as a tree from the leaves up');

// ───────────────────────────────────────────── lostUpdate and writeSkew (two lanes)
const lanes = (id, rowA, rowB, final, foot) => `${defs(id)}
${txt(110, 28, 'time', { size: 10, color: 'accent' })}${arrow('M140 24 L880 24', id)}
${txt(14, 86, 'Tx A', { font: 'sans', size: 12, ...T, weight: 700 })}${txt(14, 146, 'Tx B', { font: 'sans', size: 12, ...T, weight: 700 })}
${rowA.map((c, i) => c ? box(70 + i * 180, 60, 160, 44, c[0], c[1], c[2]) : '').join('')}
${rowB.map((c, i) => c ? box(70 + i * 180, 120, 160, 44, c[0], c[1], c[2]) : '').join('')}
${box(650, 60, 236, 104, final[0], final[1], 'd')}
${[[rowA, 82, 100], [rowB, 142, 126]].map(([r, y, ty]) => arrow(`M${70 + r.map((c) => !!c).lastIndexOf(true) * 180 + 162} ${y} L646 ${ty}`, id + 'd', 'danger')).join('')}
${foot}`;

SQ.lostUpdate = wrap('0 0 900 280', lanes('lu',
  [['read balance', 'sees 100', 'n'], ['write 70', '100 - 30', 'a'], null],
  [['read balance', 'sees 100', 'n'], null, ['write 50', '100 - 50', 'a']],
  ['final balance 50', 'A’s change is lost', 'd'],
  `${rect(14, 190, 872, 78, 'panel', 'border')}
${txt(28, 212, 'Fix 1  do the arithmetic in the database, in one statement:', { size: 10.5, ...T })}${txt(28, 230, 'UPDATE accounts SET balance_cents = balance_cents - 30 WHERE id = 1', { size: 10.5, color: 'accent' })}
${txt(28, 250, 'Fix 2  lock the row before reading it: SELECT ... FOR UPDATE, then write.', { size: 10.5, ...T })}`),
'A lost update between two transactions, and the fix');

SQ.writeSkew = wrap('0 0 900 280', lanes('ws',
  [['count on call', 'sees 2', 'n'], ['Alice off call', 'rule looks safe', 'a'], ['COMMIT', '', 'n']],
  [['count on call', 'sees 2', 'n'], ['Bob off call', 'rule looks safe', 'a'], ['COMMIT', '', 'n']],
  ['nobody on call', 'the rule is broken', 'd'],
  `${rect(14, 190, 872, 78, 'panel', 'border')}
${txt(28, 212, 'Each transaction was correct on its own snapshot and wrote a different row, so there was no conflict.', { size: 10.5, ...T })}
${txt(28, 232, 'Allowed under snapshot isolation (REPEATABLE READ in PostgreSQL).', { size: 10.5, ...T })}
${txt(28, 252, 'SERIALIZABLE detects the pattern and aborts one: retry it.', { size: 10.5, color: 'accent' })}`),
'Write skew: two transactions each valid alone break a rule together');

// ───────────────────────────────────────────── mvcc
SQ.mvcc = wrap('0 0 900 260', `${defs('mv')}
${txt(14, 22, 'one logical row, three physical versions', { size: 10.5, color: 'accent' })}
${[['v1  balance 100', 'xmin 100, xmax 120'], ['v2  balance 70', 'xmin 120, xmax 150'], ['v3  balance 50', 'xmin 150, xmax none']].map((r, i) => box(14, 34 + i * 62, 230, 48, r[0], r[1], i === 2 ? 'a' : 'n')).join('')}
${[['Snapshot at 110', 'sees v1'], ['Snapshot at 130', 'sees v2'], ['New transaction', 'sees v3']].map((r, i) => box(340, 34 + i * 62, 220, 48, r[0], r[1], 'g') + arrow(`M338 ${58 + i * 62} L248 ${58 + i * 62}`, 'mv')).join('')}
${rect(620, 34, 266, 172, 'panel', 'border')}
${txt(634, 56, 'What this means', { font: 'sans', size: 12, color: 'accent', weight: 700 })}
${['An UPDATE writes a new version.', 'Readers keep their snapshot,', 'so they never wait for writers.', 'Writers do not wait for readers.', 'VACUUM removes v1 once no', 'snapshot can still see it.'].map((s, i) => txt(634, 80 + i * 20, s, { font: 'sans', size: 11, ...T })).join('')}
${txt(14, 240, 'Two writers on the same row still queue: the second waits for the first to finish.', { size: 10.5, ...T })}
`, 'MVCC: writers create new row versions and readers see a snapshot');

// ───────────────────────────────────────────── deadlock
SQ.deadlock = wrap('0 0 900 230', `${defs('dl')}
${box(30, 80, 150, 60, 'Transaction A', '', 'n')}${box(370, 14, 160, 50, 'Row 1', '', 'g')}${box(370, 150, 160, 50, 'Row 2', '', 'g')}${box(720, 80, 150, 60, 'Transaction B', '', 'n')}
${arrow('M180 96 L366 54', 'dl', 'accent')}${txt(250, 60, 'A holds row 1', { size: 10, color: 'accent' })}
${arrow('M180 126 L366 162', 'dl', 'danger', true)}${txt(190, 170, 'A waits for row 2', { size: 10, color: 'danger' })}
${arrow('M720 126 L534 162', 'dl', 'accent')}${txt(580, 188, 'B holds row 2', { size: 10, color: 'accent' })}
${arrow('M720 96 L534 54', 'dl', 'danger', true)}${txt(578, 60, 'B waits for row 1', { size: 10, color: 'danger' })}
${txt(450, 224, 'PostgreSQL detects the cycle and aborts one. Lock rows in a consistent order.', { anchor: 'middle', size: 10.5, ...T })}
`, 'A deadlock cycle between two transactions');

// ───────────────────────────────────────────── keyset
SQ.keyset = wrap('0 0 900 250', `${defs('ks')}
${txt(14, 22, 'OFFSET 100000 LIMIT 20', { size: 11, ...T, weight: 700 })}
${rect(14, 34, 640, 40, 'panel-2', 'border')}${txt(334, 59, 'scan and throw away 100,000 rows', { anchor: 'middle', size: 10.5, ...T })}
${box(660, 34, 226, 40, 'return 20', '', 'a')}
${txt(14, 112, 'WHERE (created_at, id) < (last seen) ORDER BY created_at DESC, id DESC LIMIT 20', { size: 11, ...T, weight: 700 })}
${box(14, 126, 150, 40, 'index seek', '', 'g')}${arrow('M166 146 L190 146', 'ks')}${box(194, 126, 226, 40, 'read 20', '', 'a')}
${txt(440, 150, 'the rows before the seek point are never read', { size: 10.5 })}
${txt(14, 206, 'Offset gets slower the deeper the page, and rows can shift between pages.', { size: 10.5, ...T })}
${txt(14, 226, 'Keyset stays fast and stable, but you can only go to the next or previous page.', { size: 10.5, ...T })}
`, 'Offset pagination scans and discards; keyset pagination seeks');

// ───────────────────────────────────────────── replication
SQ.replication = wrap('0 0 900 250', `${defs('rp')}
${box(14, 80, 170, 60, 'Client', 'writes, then reads', 'n')}
${box(290, 80, 170, 60, 'Primary', 'accepts writes', 'a')}
${box(660, 14, 226, 60, 'Replica 1', 'serves reads', 'g')}${box(660, 146, 226, 60, 'Replica 2', 'serves reads', 'g')}
${arrow('M186 110 L286 110', 'rp', 'accent')}${txt(236, 100, 'write', { anchor: 'middle', size: 10, color: 'accent' })}
${arrow('M462 96 L656 54', 'rp')}${arrow('M462 124 L656 166', 'rp')}
${txt(468, 62, 'WAL stream', { size: 10, ...T })}${txt(468, 176, 'lag: ms to seconds', { size: 10, color: 'gold' })}
${`<path d="M99 142 L99 238 L773 238 L773 210" fill="none" stroke="var(--danger)" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#rpd)"/>`}
${txt(430, 230, 'read straight after the write: the replica may not have it yet', { anchor: 'middle', size: 10, color: 'danger' })}
`, 'A primary with read replicas and replication lag');

export default SQ;
