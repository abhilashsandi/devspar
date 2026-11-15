import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sameResult, REASONS, cell } from '../../scripts/study/sqlrun/compare.mjs';
import { planTree, FLAG_TEXT } from '../../scripts/study/sqlrun/explain.mjs';

const R = (rows, fields = ['a', 'b']) => ({ fields, rows });

test('reasons carry the exact copy', () => {
  assert.equal(REASONS.columns, 'Different: the number of columns is not the same.');
  assert.equal(REASONS['row-count'], 'Different: the number of rows is not the same.');
  assert.equal(REASONS.rows, 'Different: same shape, but some values differ.');
  assert.equal(REASONS.order, 'Right rows, wrong order: this task asks for a specific order.');
});

test('cell renders values the way a person compares them', () => {
  assert.equal(cell(null), 'NULL');
  assert.equal(cell(undefined), 'NULL');
  assert.equal(cell(1n), '1');
  assert.equal(cell(1), '1');
  assert.equal(cell(new Date('2024-05-01T09:00:00Z')), '2024-05-01T09:00:00.000Z');
  assert.equal(cell({ x: 1 }), '{"x":1}');
});

test('sameResult: each reason', () => {
  assert.deepEqual(sameResult(R([[1, 2]]), R([[1, 2]]), false), { ok: true });
  assert.deepEqual(sameResult(R([[1]], ['a']), R([[1, 2]]), false), { ok: false, reason: 'columns' });
  assert.deepEqual(sameResult(R([[1, 2]]), R([[1, 2], [3, 4]]), false), { ok: false, reason: 'row-count' });
  assert.deepEqual(sameResult(R([[1, 2], [3, 5]]), R([[1, 2], [3, 4]]), false), { ok: false, reason: 'rows' });
});

test('sameResult ignores column names, bigint against number, and NULL against undefined', () => {
  assert.equal(sameResult(R([[1n, null]], ['x', 'y']), R([[1, undefined]], ['a', 'b']), false).ok, true);
});

test('sameResult: sequence matters only when the task asks for an order', () => {
  const a = R([[1, 1], [2, 2]]), b = R([[2, 2], [1, 1]]);
  assert.equal(sameResult(a, b, false).ok, true);
  assert.deepEqual(sameResult(a, b, true), { ok: false, reason: 'order' });
  assert.equal(sameResult(a, a, true).ok, true);
});

const explain = [{
  'Execution Time': 12.5,
  Plan: {
    'Node Type': 'Sort', 'Actual Total Time': 12, 'Actual Loops': 1, 'Actual Rows': 1000, 'Plan Rows': 1000, 'Sort Method': 'quicksort',
    Plans: [{
      'Node Type': 'Seq Scan', 'Relation Name': 'orders', 'Actual Total Time': 9, 'Actual Loops': 1, 'Actual Rows': 1000, 'Plan Rows': 50, 'Rows Removed by Filter': 199000,
    }],
  },
}];

test('planTree computes self time, share, target and flags', () => {
  const root = planTree(explain);
  assert.equal(root.type, 'Sort');
  assert.equal(root.selfMs, 3);
  assert.equal(root.children.length, 1);
  const scan = root.children[0];
  assert.equal(scan.target, 'orders');
  assert.equal(scan.selfMs, 9);
  assert.equal(scan.share, 0.75);
  assert.deepEqual(scan.flags, ['seq-scan-filter', 'misestimate']);
  assert.deepEqual(root.flags, []);
  assert.ok(FLAG_TEXT['seq-scan-filter'].startsWith('Reads the whole table'));
});

test('planTree: index target, loops, disk sort, zero-time root', () => {
  const t = planTree([{ Plan: { 'Node Type': 'Sort', 'Sort Method': 'external merge', 'Actual Total Time': 0, 'Actual Loops': 1, 'Actual Rows': 5, 'Plan Rows': 5,
    Plans: [{ 'Node Type': 'Index Scan', 'Relation Name': 'orders', 'Index Name': 'orders_pkey', 'Actual Total Time': 2, 'Actual Loops': 3, 'Actual Rows': 5, 'Plan Rows': 5 }] } }]);
  assert.deepEqual(t.flags, ['disk-sort']);
  assert.equal(t.children[0].target, 'orders using orders_pkey');
  assert.equal(t.children[0].ms, 6);          // time x loops
  assert.equal(t.selfMs, 0);                  // never negative
  assert.equal(t.share, 0);                   // root of zero time
});

test('planTree accepts the JSON text too', () => {
  assert.equal(planTree(JSON.stringify(explain)).type, 'Sort');
});
