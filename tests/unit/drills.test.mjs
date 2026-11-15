import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, makeSession, parseAmount, grade, formatAmount, readStats, recordResult, readable } from '../../app/lib/drills.mjs';

const T = (id) => TEMPLATES.find((t) => t.id === id);
// the table from the plan: id, example params, expected answer, unit, numbers the prompt must show
const EXAMPLES = [
  ['qps-peak', { D: 1e7, a: 20, p: 3 }, 6944.44, 'requests per second', ['10 million', '20', '3 times']],
  ['storage-year', { W: 1e7, S: 1000, r: 3 }, 10.95, 'terabytes', ['10 million', '1 KB', '3 copies']],
  ['bandwidth', { q: 2000, s: 50000 }, 800, 'megabits per second', ['2,000', '50 KB']],
  ['cache-memory', { N: 1e8, size: 1000, share: 20 }, 20, 'gigabytes', ['100 million', '1 KB', '20%']],
  ['servers', { peak: 20000, cap: 1000, util: 70 }, 29, 'servers', ['20,000', '1,000', '70%']],
  ['latency', { calls: [40, 120, 80], mode: 'sequential', own: 10 }, 250, 'milliseconds', ['40 ms', '120 ms', '80 ms', 'one after another']],
  ['latency', { calls: [40, 120, 80], mode: 'parallel', own: 10 }, 130, 'milliseconds', ['at the same time']],
  ['tail-fanout', { n: 10 }, 9.56, 'percent', ['10 services']],
  ['avail-serial', { avail: [99.9, 99.9, 99.9] }, 129.47, 'minutes', ['3 components', '99.9%']],
  ['avail-pair', { a: 99 }, 52.56, 'minutes', ['99%']],
  ['queue-drain', { backlog: 5e6, arrivals: 1000, consumers: 8, rate: 200 }, 138.89, 'minutes', ['5 million', '1,000', '8 consumers', '200']],
  ['read-replicas', { reads: 40000, hit: 90, per: 2000 }, 2, 'replicas', ['40,000', '90%', '2,000']],
  ['id-exhaust', { rate: 10000 }, 4.97, 'days', ['10,000']],
];

test('there are twelve templates', () => {
  assert.equal(TEMPLATES.length, 12);
  assert.equal(new Set(TEMPLATES.map((t) => t.id)).size, 12);
});

for (const [id, params, answer, unit, shown] of EXAMPLES) {
  test(`${id}: ${JSON.stringify(params).slice(0, 50)} gives ${answer} ${unit}`, () => {
    const r = T(id).solve(params);
    assert.ok(Math.abs(r.answer - answer) < 0.01, `${r.answer} vs ${answer}`);
    assert.equal(r.unit, unit);
    for (const s of shown) assert.ok(r.prompt.includes(s), `prompt lacks "${s}": ${r.prompt}`);
    assert.ok(r.steps.length >= 2);
  });
}

test('sessions: eight different templates, finite positive answers, repeatable', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const s = makeSession(seed);
    assert.equal(s.length, 8);
    assert.equal(new Set(s.map((d) => d.id)).size, 8, 'seed ' + seed);
    for (const d of s) assert.ok(Number.isFinite(d.answer) && d.answer > 0, `${d.id} seed ${seed}: ${d.answer}`);
  }
  assert.deepEqual(makeSession(5), makeSession(5));
  assert.notDeepEqual(makeSession(5).map((d) => d.prompt), makeSession(6).map((d) => d.prompt));
});

test('queue-drain refuses consumers that cannot keep up', () => {
  assert.throws(() => T('queue-drain').solve({ backlog: 1e6, arrivals: 2000, consumers: 4, rate: 200 }), /cannot keep up/);
});

test('parseAmount accepts the documented forms and nothing else', () => {
  const ok = { '6944': 6944, '6,944': 6944, '6.9k': 6900, '1.2M': 1200000, '3B': 3e9, '3G': 3e9, '2T': 2e12, '1e6': 1e6, '9.56%': 9.56, ' 29 ': 29, '5m': 5e6 };
  for (const [text, n] of Object.entries(ok)) assert.ok(Math.abs(parseAmount(text) - n) < 1e-6 * Math.max(1, n), text);
  for (const text of ['130 ms', 'about 7k', '', 'k', '1.2.3', '12 servers', '--3', '1e']) assert.equal(parseAmount(text), null, JSON.stringify(text));
});

test('grade: exact within 10%, close within 50%', () => {
  const d = { answer: 100 };
  for (const t of ['100', '109', '91']) assert.equal(grade(t, d), 'exact', t);
  for (const t of ['111', '150', '51']) assert.equal(grade(t, d), 'close', t);
  for (const t of ['151', '49']) assert.equal(grade(t, d), 'off', t);
  assert.equal(grade('x', d), 'invalid');
  const small = { answer: 2 };
  assert.equal(grade('2', small), 'exact');
  assert.equal(grade('3', small), 'close');
  assert.equal(grade('4', small), 'off');
});

test('weaker templates come up more often', () => {
  const count = (stats) => { let n = 0; for (let s = 1; s <= 200; s++) if (makeSession(s, stats).some((d) => d.id === 'servers')) n++; return n; };
  assert.ok(count({ servers: { seen: 5, exact: 1, close: 0 } }) >= count({}) + 20);
});

test('stats: bad storage reads as empty, results add up, invalid is ignored', () => {
  const store = (init) => ({ d: { ...init }, getItem(k) { return k in this.d ? this.d[k] : null; }, setItem(k, v) { this.d[k] = String(v); } });
  assert.deepEqual(readStats(store({ 'study-drills-v1': '{bad' })), {});
  assert.deepEqual(readStats(store({ 'study-drills-v1': '[1]' })), {});
  assert.deepEqual(readStats(store({ 'study-drills-v1': '{"servers":{"seen":"x"}}' })), {});
  const s = store({});
  recordResult(s, 'servers', 'exact');
  recordResult(s, 'servers', 'close');
  recordResult(s, 'servers', 'off');
  recordResult(s, 'servers', 'invalid');
  assert.deepEqual(readStats(s), { servers: { seen: 3, exact: 1, close: 1 } });
});

test('formatting', () => {
  assert.equal(formatAmount(6944.44), '6,944');
  assert.equal(formatAmount(138.89), '139');
  assert.equal(formatAmount(9.56), '9.56');
  assert.equal(formatAmount(29), '29');
  assert.equal(formatAmount(0.5), '0.5');
  assert.equal(readable(10000000), '10 million');
  assert.equal(readable(2000), '2,000');
});
