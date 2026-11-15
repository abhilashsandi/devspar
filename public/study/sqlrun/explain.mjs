// Turns EXPLAIN (ANALYZE, FORMAT JSON) into a tree a person can read: where the time went, and what looks wrong.

/** @typedef {{type: string, target: string, estRows: number, rows: number, ms: number, selfMs: number, share: number, flags: string[], children: PlanNode[]}} PlanNode */

export const FLAG_TEXT = {
  'seq-scan-filter': 'Reads the whole table and throws most of it away: an index on the filter column would help.',
  misestimate: 'The planner’s row estimate is off by ten times or more.',
  'disk-sort': 'The sort did not fit in memory and spilled to disk.',
};

function node(p) {
  const rows = p['Actual Rows'] ?? 0, est = p['Plan Rows'] ?? 0;
  const children = (p.Plans || []).map(node);
  const ms = (p['Actual Total Time'] ?? 0) * (p['Actual Loops'] ?? 1);
  const selfMs = Math.max(0, ms - children.reduce((a, c) => a + c.ms, 0));
  const flags = [];
  const removed = p['Rows Removed by Filter'] ?? 0;
  if (p['Node Type'] === 'Seq Scan' && removed > 1000 && removed > 9 * rows) flags.push('seq-scan-filter');
  const hi = Math.max(est, rows, 1), lo = Math.max(Math.min(est, rows), 1);
  if (hi / lo >= 10) flags.push('misestimate');
  if (String(p['Sort Method'] || '').includes('external')) flags.push('disk-sort');
  return {
    type: p['Node Type'],
    target: (p['Relation Name'] || '') + (p['Index Name'] ? ' using ' + p['Index Name'] : ''),
    estRows: est, rows, ms, selfMs, share: 0, flags, children,
  };
}

/** @param {any} explain the parsed value (or its JSON text) of EXPLAIN (ANALYZE, FORMAT JSON) @returns {PlanNode} */
export function planTree(explain) {
  const parsed = typeof explain === 'string' ? JSON.parse(explain) : explain;
  const root = node((Array.isArray(parsed) ? parsed[0] : parsed).Plan);
  const total = root.ms;
  (function share(n) { n.share = total ? n.selfMs / total : 0; n.children.forEach(share); })(root);
  return root;
}
