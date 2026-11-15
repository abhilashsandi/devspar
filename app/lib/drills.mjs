// Estimation drills: capacity, latency and availability sums whose numbers change every time. Each template
// picks its numbers from fixed lists with a seeded generator and solves them with one formula, so a reader
// practises the arithmetic and not a memorised answer. Units are decimal: 1 KB = 1,000 bytes, 1 GB = 10^9,
// 1 TB = 10^12; a day is 86,400 seconds, a 30-day month 43,200 minutes, a year 525,600 minutes.
import { mulberry32 } from './bank.mjs';

/** @typedef {{id: string, params: any, prompt: string, answer: number, unit: string, steps: string[]}} Drill */
/** @typedef {{id: string, title: string, pick: (rng: () => number) => any, solve: (p: any) => {prompt: string, answer: number, unit: string, steps: string[]}}} Template */
/** @typedef {{[id: string]: {seen: number, exact: number, close: number}}} Stats */

const DAY = 86400, MONTH_MIN = 43200, YEAR_MIN = 525600;
const pick = (rng, list) => list[Math.floor(rng() * list.length)];

/** 10000000 -> "10 million", 2000 -> "2,000". */
export function readable(n) {
  if (n >= 1e9 && n % 1e9 === 0) return n / 1e9 + ' billion';
  if (n >= 1e6 && n % 1e6 === 0) return n / 1e6 + ' million';
  return n >= 1000 ? n.toLocaleString('en-US') : String(n);
}
export function sizeText(bytes) {
  if (bytes >= 1e6) return bytes / 1e6 + ' MB';
  if (bytes >= 1000) return bytes / 1000 + ' KB';
  return bytes + ' bytes';
}
/** Up to three significant figures below 1,000, thousands separators above. */
export function formatAmount(n) {
  if (!Number.isFinite(n)) return String(n);
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString('en-US');
  return String(Number(n.toPrecision(3)));
}
const approx = (n) => formatAmount(n);
// a decimal for the worked steps, without floating-point noise: 0.0009999999999998899 -> 0.001
const plain = (x) => x.toFixed(9).replace(/0+$/, '').replace(/[.]$/, '');

/** @type {Template[]} */
export const TEMPLATES = [
  {
    id: 'qps-peak', title: 'Peak requests per second',
    pick: (rng) => ({ D: pick(rng, [1e6, 5e6, 1e7, 5e7, 1e8]), a: pick(rng, [5, 10, 20, 50]), p: pick(rng, [2, 3, 5]) }),
    solve: ({ D, a, p }) => {
      const perDay = D * a, avg = perDay / DAY, answer = D * a / DAY * p;
      return {
        prompt: `${readable(D)} people use an app each day, and each makes ${a} requests a day. Traffic at peak is ${p} times the daily average. What is the peak load, in requests per second?`,
        answer, unit: 'requests per second',
        steps: [`Requests a day: ${readable(D)} × ${a} = ${readable(perDay)}.`, `Per second: ${readable(perDay)} ÷ 86,400. Round 86,400 to 10^5 for the mental route: about ${approx(perDay / 1e5)}. Exactly ${approx(avg)}.`, `Peak: × ${p} = ${approx(answer)} requests per second.`],
      };
    },
  },
  {
    id: 'storage-year', title: 'Storage for a year',
    pick: (rng) => ({ W: pick(rng, [1e6, 1e7, 1e8]), S: pick(rng, [200, 1000, 5000]), r: pick(rng, [1, 3]) }),
    solve: ({ W, S, r }) => {
      const answer = W * S * 365 * r / 1e12, perDay = W * S;
      return {
        prompt: `A service stores ${readable(W)} new records a day, each ${sizeText(S)}, and keeps ${r} cop${r === 1 ? 'y' : 'ies'} of everything. How much storage does one year of writes need, in terabytes?`,
        answer, unit: 'terabytes',
        steps: [`Bytes a day: ${readable(W)} × ${S} = ${readable(perDay)} bytes, about ${approx(perDay / 1e9)} GB.`, `A year: × 365 ≈ × 400 for the mental route, then × ${r} copies. Exactly ${readable(perDay)} × 365 × ${r} = ${approx(perDay * 365 * r)} bytes.`, `In terabytes (÷ 10^12): ${approx(answer)}.`],
      };
    },
  },
  {
    id: 'bandwidth', title: 'Outbound bandwidth',
    pick: (rng) => ({ q: pick(rng, [500, 2000, 10000]), s: pick(rng, [2000, 50000, 1e6]) }),
    solve: ({ q, s }) => {
      const bytes = q * s, answer = bytes * 8 / 1e6;
      return {
        prompt: `A service answers ${readable(q)} requests a second, each response ${sizeText(s)}. How much outbound bandwidth does it use, in megabits per second?`,
        answer, unit: 'megabits per second',
        steps: [`Bytes a second: ${readable(q)} × ${readable(s)} = ${readable(bytes)} bytes.`, `Bits: × 8 = ${readable(bytes * 8)} bits a second.`, `In megabits (÷ 10^6): ${approx(answer)}.`],
      };
    },
  },
  {
    id: 'cache-memory', title: 'Memory for the hot set',
    pick: (rng) => ({ N: pick(rng, [1e7, 1e8, 1e9]), size: pick(rng, [500, 1000, 2000]), share: pick(rng, [10, 20]) }),
    solve: ({ N, size, share }) => {
      const hot = N * share / 100, answer = hot * size / 1e9;
      return {
        prompt: `A catalogue has ${readable(N)} items of ${sizeText(size)} each. The hottest ${share}% of items take almost all the reads. How much memory does it take to cache them, in gigabytes?`,
        answer, unit: 'gigabytes',
        steps: [`Hot items: ${share}% of ${readable(N)} = ${readable(hot)}.`, `Bytes: ${readable(hot)} × ${size} = ${readable(hot * size)}.`, `In gigabytes (÷ 10^9): ${approx(answer)}.`],
      };
    },
  },
  {
    id: 'servers', title: 'Servers at peak',
    pick: (rng) => ({ peak: pick(rng, [5000, 20000, 100000]), cap: pick(rng, [500, 1000, 2000]), util: pick(rng, [50, 70]) }),
    solve: ({ peak, cap, util }) => {
      const usable = cap * util / 100, answer = Math.ceil(peak * 100 / (cap * util));
      return {
        prompt: `Peak load is ${readable(peak)} requests a second. One server handles ${readable(cap)} requests a second flat out, but you keep each at ${util}% utilisation for headroom. How many servers do you need?`,
        answer, unit: 'servers',
        steps: [`Usable per server: ${readable(cap)} × ${util}% = ${approx(usable)} requests a second.`, `Servers: ${readable(peak)} ÷ ${approx(usable)} = ${approx(peak / usable)}.`, `Round up, because you cannot run part of a server: ${answer}.`],
      };
    },
  },
  {
    id: 'latency', title: 'Total latency',
    pick: (rng) => {
      const n = pick(rng, [3, 4]);
      return { calls: Array.from({ length: n }, () => pick(rng, [20, 40, 80, 120, 200])), mode: pick(rng, ['sequential', 'parallel']), own: 10 };
    },
    solve: ({ calls, mode, own }) => {
      const list = calls.map((c) => c + ' ms').join(', ').replace(/, ([^,]*)$/, ' and $1');
      const sum = calls.reduce((a, b) => a + b, 0), max = Math.max(...calls);
      const answer = (mode === 'sequential' ? sum : max) + own;
      return {
        prompt: `A request makes ${calls.length} downstream calls that take ${list}, and does ${own} ms of its own work. The calls run ${mode === 'sequential' ? 'one after another' : 'at the same time'}. What is the total latency, in milliseconds?`,
        answer, unit: 'milliseconds',
        steps: mode === 'sequential'
          ? [`One after another, the times add: ${calls.join(' + ')} = ${sum} ms.`, `Add the request’s own work: ${sum} + ${own} = ${answer} ms.`]
          : [`At the same time, the slowest call decides: the longest is ${max} ms.`, `Add the request’s own work: ${max} + ${own} = ${answer} ms.`],
      };
    },
  },
  {
    id: 'tail-fanout', title: 'Chance of hitting a slow call',
    pick: (rng) => ({ n: pick(rng, [5, 10, 20, 50, 100]) }),
    solve: ({ n }) => {
      const ok = Math.pow(0.99, n), answer = (1 - ok) * 100;
      return {
        prompt: `A request fans out to ${n} services in parallel. Each one is slow (over its latency target) 1% of the time, independently. What is the chance that a request hits at least one slow call, in percent?`,
        answer, unit: 'percent',
        steps: [`The chance that one call is fine is 0.99. All ${n} fine: 0.99^${n} ≈ ${approx(ok)}.`, `At least one slow is the opposite: 1 − ${approx(ok)} = ${approx(1 - ok)}, which is ${approx(answer)}%.`, `Rule of thumb for small chances: about ${n} × 1% = ${n}%, which overstates it once ${n} is large.`],
      };
    },
  },
  {
    id: 'avail-serial', title: 'Downtime of components in series',
    pick: (rng) => ({ avail: Array.from({ length: pick(rng, [2, 3, 4]) }, () => pick(rng, [99.9, 99.95, 99.99])) }),
    solve: ({ avail }) => {
      const all = avail.reduce((a, x) => a * (x / 100), 1), answer = (1 - all) * MONTH_MIN;
      return {
        prompt: `A request needs ${avail.length} components in a row, with availability ${avail.map((a) => a + '%').join(', ').replace(/, ([^,]*)$/, ' and $1')}. If any one is down the request fails. How many minutes of downtime is that in a 30-day month?`,
        answer, unit: 'minutes',
        steps: [`Availabilities multiply: ${avail.map((a) => plain(a / 100)).join(' × ')} = ${plain(all)}.`, `Unavailability: 1 − ${plain(all)} = ${plain(1 - all)}.`, `A 30-day month has 43,200 minutes: ${plain(1 - all)} × 43,200 = ${approx(answer)} minutes.`],
      };
    },
  },
  {
    id: 'avail-pair', title: 'Downtime of two replicas',
    pick: (rng) => ({ a: pick(rng, [99, 99.5, 99.9]) }),
    solve: ({ a }) => {
      const down = Math.round((100 - a) * 1000) / 100000, answer = down * down * YEAR_MIN;
      return {
        prompt: `Two independent replicas each have ${a}% availability, and the service is up if at least one is up. How many minutes a year is it down?`,
        answer, unit: 'minutes',
        steps: [`Each is down ${plain(down * 100)}% of the time, which is ${plain(down)}.`, `Both down at once: ${plain(down)} × ${plain(down)} = ${plain(down * down)}.`, `A year has 525,600 minutes: ${plain(down * down)} × 525,600 = ${approx(answer)} minutes.`],
      };
    },
  },
  {
    id: 'queue-drain', title: 'Time to drain a backlog',
    pick: (rng) => {
      for (;;) {
        const p = { backlog: pick(rng, [1e6, 5e6, 2e7]), arrivals: pick(rng, [500, 1000, 2000]), consumers: pick(rng, [4, 8, 16]), rate: pick(rng, [200, 500]) };
        if (p.consumers * p.rate > p.arrivals) return p;
      }
    },
    solve: ({ backlog, arrivals, consumers, rate }) => {
      const capacity = consumers * rate;
      if (capacity <= arrivals) throw new Error('the consumers cannot keep up with the arrivals');
      const spare = capacity - arrivals, answer = backlog / spare / 60;
      return {
        prompt: `A queue holds ${readable(backlog)} messages and ${readable(arrivals)} more arrive every second. ${consumers} consumers each process ${rate} a second. How long until the backlog is gone, in minutes?`,
        answer, unit: 'minutes',
        steps: [`Capacity: ${consumers} × ${rate} = ${readable(capacity)} a second.`, `Spare capacity after new arrivals: ${readable(capacity)} − ${readable(arrivals)} = ${readable(spare)} a second.`, `Seconds: ${readable(backlog)} ÷ ${readable(spare)} = ${approx(backlog / spare)}. Minutes (÷ 60): ${approx(answer)}.`],
      };
    },
  },
  {
    id: 'read-replicas', title: 'Replicas for reads',
    pick: (rng) => ({ reads: pick(rng, [10000, 40000, 100000]), hit: pick(rng, [0, 80, 90, 95]), per: pick(rng, [2000, 5000]) }),
    solve: ({ reads, hit, per }) => {
      const reaching = reads * (100 - hit) / 100, answer = Math.ceil(reads * (100 - hit) / (100 * per));
      return {
        prompt: `A service gets ${readable(reads)} reads a second and a cache absorbs ${hit}% of them. Each database replica can serve ${readable(per)} reads a second. How many replicas does it need?`,
        answer, unit: 'replicas',
        steps: [`Reads that miss the cache: ${100 - hit}% of ${readable(reads)} = ${readable(reaching)} a second.`, `Replicas: ${readable(reaching)} ÷ ${readable(per)} = ${approx(reaching / per)}.`, `Round up: ${answer}.`],
      };
    },
  },
  {
    id: 'id-exhaust', title: 'Days until a 32-bit counter runs out',
    pick: (rng) => ({ rate: pick(rng, [1000, 10000, 100000]) }),
    solve: ({ rate }) => {
      const total = Math.pow(2, 32), seconds = total / rate, answer = seconds / DAY;
      return {
        prompt: `A table uses a 32-bit unsigned integer id and creates ${readable(rate)} rows a second. How many days until the ids run out?`,
        answer, unit: 'days',
        steps: [`A 32-bit id has 2^32 ≈ 4.3 billion values (4,294,967,296).`, `Seconds: 4.3 billion ÷ ${readable(rate)} = ${approx(seconds)}.`, `Days: ÷ 86,400 ≈ ÷ 10^5 for the mental route; exactly ${approx(answer)}.`],
      };
    },
  },
];

/** Eight drills from eight different templates; templates you get wrong come up more often. */
export function makeSession(seed, stats = {}) {
  const rng = mulberry32(seed);
  const pool = TEMPLATES.slice();
  const chosen = [];
  while (chosen.length < 8) {
    const weights = pool.map((t) => { const s = stats[t.id]; return 1 + (s ? Math.min(3, Math.max(0, s.seen - s.exact)) : 0); });
    let r = rng() * weights.reduce((a, b) => a + b, 0), i = 0;
    while (i < pool.length - 1 && r >= weights[i]) { r -= weights[i]; i++; }
    chosen.push(pool.splice(i, 1)[0]);
  }
  return chosen.map((t) => { const params = t.pick(rng); return { id: t.id, params, ...t.solve(params) }; });
}

/**
 * 6944, 6,944, 6.9k, 1.2M, 3B or 3G, 2T, 1e6, 9.56%. Anything else, a unit or words included, is null.
 * @returns {number | null}
 */
export function parseAmount(text) {
  const m = /^\s*(\d[\d,]*(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?\s*([kKmMbBgGtT])?\s*%?\s*$/.exec(String(text));
  if (!m) return null;
  const base = Number(m[1].replace(/,/g, ''));
  if (!Number.isFinite(base)) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9, g: 1e9, t: 1e12 }[(m[3] || '').toLowerCase()] || 1;
  const value = base * (m[2] ? Math.pow(10, Number(m[2])) : 1) * mult;
  return Number.isFinite(value) ? value : null;
}

/** Within 10% is exact, within 50% is close enough for an interview. @returns {'exact'|'close'|'off'|'invalid'} */
export function grade(text, drill) {
  const x = parseAmount(text);
  if (x === null) return 'invalid';
  const err = Math.abs(x - drill.answer) / drill.answer;
  return err <= 0.10 ? 'exact' : err <= 0.5 ? 'close' : 'off';
}

const KEY = 'study-drills-v1';
/** @returns {Stats} */
export function readStats(storage) {
  try {
    const v = JSON.parse(storage.getItem(KEY) || '{}');
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
    const out = {};
    for (const [id, s] of Object.entries(v)) if (s && Number.isFinite(s.seen) && Number.isFinite(s.exact) && Number.isFinite(s.close)) out[id] = { seen: s.seen, exact: s.exact, close: s.close };
    return out;
  } catch { return {}; }
}
/** Adds one result for a template. 'invalid' is not an attempt and is ignored. @returns {Stats} */
export function recordResult(storage, id, result) {
  const stats = readStats(storage);
  if (result === 'invalid') return stats;
  const s = stats[id] || { seen: 0, exact: 0, close: 0 };
  s.seen++;
  if (result === 'exact') s.exact++;
  else if (result === 'close') s.close++;
  stats[id] = s;
  try { storage.setItem(KEY, JSON.stringify(stats)); } catch { /* storage unavailable */ }
  return stats;
}
