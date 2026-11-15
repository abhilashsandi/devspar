// Compares a reader's query result with the solution's. No DOM: the browser runner and Node tests both use it.

/** @typedef {{fields: string[], rows: any[][]}} Result */

export const REASONS = {
  columns: 'Different: the number of columns is not the same.',
  'row-count': 'Different: the number of rows is not the same.',
  rows: 'Different: same shape, but some values differ.',
  order: 'Right rows, wrong order: this task asks for a specific order.',
};

/** A value as text, the way two results are compared. */
export function cell(v) {
  if (v === null || v === undefined) return 'NULL';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/**
 * Column names are ignored (an alias is not a wrong answer). Compares the number of columns, the number of
 * rows, then the rows as text; when the task names an order, the sequence has to match too.
 * @param {Result} mine @param {Result} theirs @param {boolean} ordered
 * @returns {{ok: true} | {ok: false, reason: 'columns'|'row-count'|'rows'|'order'}}
 */
export function sameResult(mine, theirs, ordered) {
  if (mine.fields.length !== theirs.fields.length) return { ok: false, reason: 'columns' };
  if (mine.rows.length !== theirs.rows.length) return { ok: false, reason: 'row-count' };
  const key = (row) => row.map(cell).join('\u0001');
  const a = mine.rows.map(key), b = theirs.rows.map(key);
  const sa = a.slice().sort(), sb = b.slice().sort();
  if (sa.some((k, i) => k !== sb[i])) return { ok: false, reason: 'rows' };
  if (ordered && a.some((k, i) => k !== b[i])) return { ok: false, reason: 'order' };
  return { ok: true };
}
