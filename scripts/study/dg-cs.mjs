// Diagrams for the Interview Cheatsheet answers (all prefixed cs*). Same visual language as dg.mjs.
import D, { box, txt, arrow, rect, wrap, M } from './dg.mjs';

// A left-to-right row of boxes joined by arrows: items are [title, sub, style]; returns the svg fragment.
const chain = (mk, y, items, o = {}) => {
  const w = o.w || 150, h = o.h || 64, x0 = o.x0 ?? 20, total = o.total ?? 860;
  const gap = items.length > 1 ? (total - items.length * w) / (items.length - 1) : 0;
  return items.map((it, i) => {
    const x = x0 + i * (w + gap);
    return box(x, y, w, h, it[0], it[1] || '', it[2] || 'n') + (i < items.length - 1 ? arrow(`M${x + w + 2} ${y + h / 2} L${x + w + gap - 4} ${y + h / 2}`, mk) : '');
  }).join('');
};
const defs1 = (id) => `<defs>${M(id, 'muted')}${M(id + 'a', 'accent')}${M(id + 'd', 'danger')}</defs>`;
const C = { color: 'text' };

export const CS = {};

CS.closure = wrap('0 0 900 230', `${defs1('cc')}
${rect(20, 20, 400, 190, 'panel-2', 'border')}${txt(36, 42, 'outer() scope  (has already returned)', { color: 'accent', size: 10 })}
${box(60, 80, 150, 60, 'count = 0', 'a captured variable', 'a')}
${box(520, 80, 180, 60, 'inc()', 'returned to the caller', 'g')}
${arrow('M518 110 L214 110', 'ccd', 'accent', true)}${txt(366, 98, 'still sees it', { anchor: 'middle', color: 'accent', size: 10 })}
${txt(36, 176, 'The variable lives on, because inc() holds a reference to it.', { size: 10.5, ...C })}
${txt(36, 196, 'A shared variable, not a copy: calls see the latest value.', { size: 10.5 })}
`, 'A returned inner function keeps a live reference to a variable of the scope that created it');

CS.eventLoop = wrap('0 0 900 300', `${defs1('el')}
${box(30, 60, 210, 170, 'Call stack', 'runs one thing at a time', 'a')}
${box(380, 40, 250, 80, 'Microtask queue', 'promise callbacks, queueMicrotask', 'g')}
${box(380, 150, 250, 80, 'Macrotask queue', 'setTimeout, I/O, UI events', 'n')}
${arrow('M378 80 C310 80 300 110 244 120', 'ela')}${txt(300, 70, '1  drain ALL', { anchor: 'middle', color: 'accent', size: 10.5, weight: 700 })}
${arrow('M378 190 C310 190 300 170 244 165', 'el')}${txt(300, 216, '2  take ONE', { anchor: 'middle', ...C, size: 10.5, weight: 700 })}
${txt(670, 90, 'When the stack is empty:', { color: 'accent', size: 10.5 })}
${txt(670, 112, '1  run every microtask', { size: 10.5, ...C })}
${txt(670, 132, '2  run one macrotask', { size: 10.5, ...C })}
${txt(670, 152, '3  repeat', { size: 10.5, ...C })}
${txt(450, 278, 'Hence: a resolved promise runs before setTimeout(fn, 0), and a long sync task freezes both queues.', { anchor: 'middle', size: 10.5 })}
`, 'The event loop drains all microtasks and then takes one macrotask whenever the call stack is empty');

CS.nodePhases = wrap('0 0 900 190', `${defs1('np')}
${chain('np', 30, [['Sync code', 'runs first', 'n'], ['nextTick', 'queue', 'g'], ['Promises', 'microtasks', 'g'], ['Timers', 'setTimeout', 'n'], ['Poll', 'I/O callbacks', 'n'], ['Check', 'setImmediate', 'n']], { w: 128, h: 66 })}
${txt(450, 136, 'Then the loop starts again; the nextTick and promise queues are drained after every callback.', { anchor: 'middle', size: 10.5 })}
${txt(450, 160, 'From the main module, timers vs setImmediate can go either way. Inside an I/O callback setImmediate is first.', { anchor: 'middle', size: 10.5 })}
`, 'The order Node runs synchronous code, nextTick, promise microtasks and then the loop phases');

CS.backpressure = wrap('0 0 900 230', `${defs1('bp')}
${box(20, 40, 190, 70, 'Readable', 'fast producer (file, network)', 'n')}
${box(330, 40, 240, 70, 'Internal buffer', 'fills up to highWaterMark', 'g')}
${box(690, 40, 190, 70, 'Writable', 'slow consumer (disk, client)', 'n')}
${arrow('M212 75 L326 75', 'bp')}${arrow('M572 75 L686 75', 'bp')}
${arrow('M450 114 C450 170 115 170 115 114', 'bpa', 'accent', true)}
${txt(450, 176, 'write() returns false: pause the source, resume on "drain"', { anchor: 'middle', color: 'accent', size: 10.5 })}
${txt(450, 208, 'pipeline() does this for you. Ignore it and the buffer grows until the process runs out of memory.', { anchor: 'middle', size: 10 })}
`, 'A full buffer tells the readable to pause until the writable drains');

CS.state = wrap('0 0 900 230', `${defs1('st')}
${chain('st', 40, [['useState / useReducer', 'one component owns it', 'n'], ['Context', 'rarely changing, cross-cutting', 'n'], ['Zustand / Redux', 'complex shared client state', 'a'], ['React Query / SWR', 'server state: a cache', 'g']], { w: 190, h: 72, total: 860 })}
${txt(20, 146, 'wider scope  →', { color: 'accent', size: 10.5 })}
${txt(20, 172, 'Pick the smallest tool that works. Do not copy server data into a global store;', { size: 10.5, ...C })}
${txt(20, 192, 'let the query cache own loading, error, staleness and refetching.', { size: 10.5, ...C })}
`, 'State ladder from local component state to Context, a store and a server-state cache');

CS.optimistic = wrap('0 0 900 260', `${defs1('op')}
${chain('op', 30, [['Click', 'user acts', 'n'], ['onMutate', 'cancel, snapshot, apply guess', 'a'], ['Request', 'server decides', 'n'], ['onSettled', 'invalidate and refetch', 'g']], { w: 190, h: 72 })}
${box(330, 150, 230, 64, 'onError', 'restore the snapshot', 'd')}
${arrow('M460 104 C460 126 450 134 450 146', 'opd', 'danger', true)}${txt(500, 130, 'request fails', { color: 'danger', size: 10.5 })}
${arrow('M562 182 C700 182 770 150 770 104', 'op', 'muted', true)}
${txt(450, 244, 'Cancelling first stops a slow older fetch from overwriting the optimistic value.', { anchor: 'middle', size: 10.5 })}
`, 'Optimistic update lifecycle in React Query with rollback on error');

CS.n1 = wrap('0 0 900 270', `${defs1('n1')}
${rect(20, 20, 410, 230, 'panel-2', 'border')}${txt(36, 42, 'WITHOUT batching: N+1', { color: 'danger', size: 10.5, weight: 700 })}
${box(50, 70, 120, 44, 'Resolver', '', 'n')}
${[0, 1, 2, 3].map((i) => arrow(`M172 ${88 + i * 4} L260 ${82 + i * 36}`, 'n1') + box(262, 66 + i * 36, 150, 30, `SELECT … id = ${i + 1}`, '', i === 0 ? 'g' : 'n')).join('')}
${txt(36, 232, '1 query for the list + 1 per item = slow', { size: 10.5, ...C })}
${rect(470, 20, 410, 230, 'panel-2', 'border')}${txt(486, 42, 'WITH DataLoader', { color: 'accent', size: 10.5, weight: 700 })}
${box(500, 70, 120, 44, 'Resolver', '.load(1..N)', 'n')}
${arrow('M622 92 L668 92', 'n1')}${box(670, 66, 190, 52, 'One tick later', 'WHERE id IN (1..N)', 'a')}
${txt(486, 232, '1 batched query, results mapped back in key order', { size: 10.5, ...C })}
`, 'N+1 queries compared with one DataLoader batched query');

CS.cacheAside = wrap('0 0 900 260', `${defs1('ca')}
${box(30, 100, 150, 64, 'Application', '', 'n')}${box(360, 30, 170, 64, 'Cache', 'Redis', 'g')}${box(360, 170, 170, 64, 'Database', 'source of truth', 'n')}
${arrow('M182 116 L356 70', 'ca')}${txt(236, 78, '1  read', { size: 10.5, ...C })}
${arrow('M356 200 L182 150', 'ca')}${txt(236, 196, '3  on miss, read', { size: 10.5, ...C })}
${arrow('M444 168 L444 98', 'caa', 'accent', true)}${txt(452, 136, '4  fill', { color: 'accent', size: 10.5 })}
${txt(250, 128, '2  hit: done', { color: 'accent', size: 10.5, anchor: 'middle' })}
${txt(570, 50, 'Cache-aside: the app manages it (most common).', { size: 10.5, ...C })}
${txt(570, 78, 'Read-through: the cache loads on a miss.', { size: 10.5, ...C })}
${txt(570, 106, 'Write-through: cache + DB together.', { size: 10.5, ...C })}
${txt(570, 134, 'Write-behind: DB later (can lose data).', { size: 10.5, ...C })}
${txt(570, 176, 'Invalidation is the hard part.', { size: 10.5, color: 'accent' })}
`, 'Cache-aside read path with notes on read-through, write-through and write-behind');

CS.expandContract = wrap('0 0 900 170', `${defs1('ec')}
${chain('ec', 26, [['1 Expand', 'add nullable column', 'a'], ['2 Dual-write', 'write old + new', 'n'], ['3 Backfill', 'old rows, in batches', 'n'], ['4 Switch reads', 'read the new column', 'n'], ['5 Contract', 'drop old, later', 'g']], { w: 148, h: 66, x0: 14, total: 872 })}
${txt(450, 130, 'Every step is a separate deploy that is safe on its own, so any step can be rolled back.', { anchor: 'middle', size: 10.5 })}
`, 'Expand and contract migration: add, dual-write, backfill, switch reads, drop');

CS.cdn = wrap('0 0 900 230', `${defs1('cd')}
${box(20, 60, 150, 64, 'Users', 'near the edge', 'n')}${box(320, 60, 220, 64, 'Edge location (PoP)', 'cache HIT: served here', 'a')}${box(690, 60, 190, 64, 'Origin', 'only on a MISS', 'n')}
${arrow('M172 92 L316 92', 'cd')}${arrow('M542 92 L686 92', 'cd', 'muted', true)}
${txt(244, 80, 'fast', { anchor: 'middle', color: 'accent', size: 10.5 })}${txt(614, 80, 'miss', { anchor: 'middle', size: 10.5 })}
${txt(450, 166, 'Cache-Control decides what the edge keeps and for how long:', { anchor: 'middle', size: 10.5, ...C })}
${txt(450, 188, 'max-age=31536000, immutable for fingerprinted assets  ·  short TTL + stale-while-revalidate for the rest', { anchor: 'middle', size: 10 })}
`, 'A CDN edge serves cache hits near the user and goes to the origin only on a miss');

const cells = (x, y, kinds) => kinds.map((k, i) => `<rect x="${x + i * 26}" y="${y}" width="22" height="22" rx="4" fill="var(--${k === 'n' ? 'accent' : 'panel-2'})" stroke="var(--${k === 'n' ? 'accent' : 'border'})" stroke-width="1.2"/>`).join('');
CS.deploy = wrap('0 0 900 290', `${defs1('dp')}
${txt(20, 24, 'old version', { size: 10 })}<rect x="90" y="14" width="14" height="14" rx="3" fill="var(--panel-2)" stroke="var(--border)"/>${txt(130, 24, 'new version', { color: 'accent', size: 10 })}<rect x="205" y="14" width="14" height="14" rx="3" fill="var(--accent)"/>
${txt(20, 78, 'Blue-green', { font: 'sans', size: 12, ...C, weight: 700 })}${txt(20, 96, 'switch all at once', { size: 9.5 })}
${cells(210, 66, ['o', 'o', 'o', 'o'])}${arrow('M330 77 L420 77', 'dp')}${cells(430, 66, ['n', 'n', 'n', 'n'])}${txt(560, 82, 'instant rollback, 2x infrastructure', { size: 10, ...C })}
${txt(20, 158, 'Canary', { font: 'sans', size: 12, ...C, weight: 700 })}${txt(20, 176, 'grow a small slice', { size: 9.5 })}
${cells(210, 146, ['o', 'o', 'o', 'o'])}${arrow('M330 157 L360 157', 'dp')}${cells(366, 146, ['o', 'o', 'o', 'n'])}${arrow('M470 157 L500 157', 'dp')}${cells(506, 146, ['o', 'n', 'n', 'n'])}${arrow('M610 157 L640 157', 'dp')}${cells(646, 146, ['n', 'n', 'n', 'n'])}${txt(756, 162, 'safest for risk', { size: 10, ...C })}
${txt(20, 238, 'Rolling', { font: 'sans', size: 12, ...C, weight: 700 })}${txt(20, 256, 'replace a few at a time', { size: 9.5 })}
${cells(210, 226, ['n', 'o', 'o', 'o'])}${arrow('M330 237 L360 237', 'dp')}${cells(366, 226, ['n', 'n', 'o', 'o'])}${arrow('M470 237 L500 237', 'dp')}${cells(506, 226, ['n', 'n', 'n', 'o'])}${arrow('M610 237 L640 237', 'dp')}${cells(646, 226, ['n', 'n', 'n', 'n'])}${txt(756, 242, 'no second environment', { size: 10, ...C })}
`, 'Blue-green, canary and rolling deployments shown as old and new instances over time');

CS.circuit = wrap('0 0 900 256', `${defs1('cb')}
${box(40, 50, 190, 70, 'CLOSED', 'calls pass, failures counted', 'a')}${box(355, 50, 190, 70, 'OPEN', 'fail fast, no calls', 'd')}${box(670, 50, 190, 70, 'HALF-OPEN', 'one probe call', 'g')}
${arrow('M232 85 L351 85', 'cb')}${txt(292, 74, 'failures ≥ N', { anchor: 'middle', size: 10, ...C })}
${arrow('M547 85 L666 85', 'cb')}${txt(607, 74, 'after cooldown', { anchor: 'middle', size: 10, ...C })}
${arrow('M765 122 C765 214 135 214 135 124', 'cba', 'accent')}${txt(450, 206, 'probe succeeds: back to CLOSED', { anchor: 'middle', size: 10, color: 'accent' })}
${arrow('M720 122 C715 150 560 150 520 124', 'cbd', 'danger', true)}${txt(620, 168, 'probe fails: OPEN again', { anchor: 'middle', size: 10, color: 'danger' })}
${txt(450, 240, 'Stops you hammering a dependency that is already down, and gives it time to recover.', { anchor: 'middle', size: 10.5 })}
`, 'Circuit breaker states closed, open and half-open and what moves between them');

CS.gatewayMesh = wrap('0 0 900 300', `${defs1('gm')}
${box(20, 120, 110, 60, 'Clients', 'browser, app', 'n')}${box(190, 110, 150, 80, 'API gateway', 'north-south', 'a')}
${arrow('M132 150 L186 150', 'gm')}
${rect(390, 20, 490, 260, 'panel-2', 'border', { dash: true })}${txt(406, 42, 'cluster: service mesh (east-west)', { color: 'accent', size: 10 })}
${box(430, 60, 120, 44, 'Service A', '', 'n')}${box(430, 126, 120, 44, 'Service B', '', 'n')}${box(430, 192, 120, 44, 'Service C', '', 'n')}
${box(580, 60, 100, 44, 'sidecar', 'proxy', 'g')}${box(580, 126, 100, 44, 'sidecar', 'proxy', 'g')}${box(580, 192, 100, 44, 'sidecar', 'proxy', 'g')}
${arrow('M342 150 L426 82', 'gm')}${arrow('M682 82 C730 82 730 148 684 148', 'gm', 'muted', true)}${arrow('M682 148 C730 148 730 214 684 214', 'gm', 'muted', true)}
${txt(742, 114, 'mTLS, retries,', { size: 10, ...C })}${txt(742, 130, 'timeouts, traffic', { size: 10, ...C })}${txt(742, 146, 'splitting, telemetry', { size: 10, ...C })}
${txt(20, 240, 'Gateway: auth, rate limits, routing and', { size: 10 })}${txt(20, 256, 'versions for traffic from outside.', { size: 10 })}
`, 'An API gateway handles traffic entering the system while a service mesh handles traffic between services');

CS.rabbit = wrap('0 0 900 260', `${defs1('rb')}
${box(20, 60, 140, 66, 'Publisher', 'waits for confirm', 'n')}${box(220, 60, 120, 66, 'Exchange', 'routes', 'n')}${box(400, 60, 190, 66, 'Durable queue', 'quorum + persistent msg', 'a')}${box(650, 60, 140, 66, 'Consumer', 'idempotent', 'n')}
${arrow('M162 93 L216 93', 'rb')}${arrow('M342 93 L396 93', 'rb')}${arrow('M592 93 L646 93', 'rb')}
${txt(20, 40, '1  publisher confirms', { color: 'accent', size: 10 })}${txt(400, 40, '2  survives a restart', { color: 'accent', size: 10 })}${txt(650, 40, '3  manual ack', { color: 'accent', size: 10 })}
${txt(720, 150, 'ack only after the', { anchor: 'middle', size: 10, ...C })}${txt(720, 166, 'result is stored', { anchor: 'middle', size: 10, ...C })}
${box(400, 170, 190, 56, 'Dead-letter queue', 'poison messages', 'd')}${arrow('M495 128 L495 166', 'rbd', 'danger', true)}${txt(504, 150, 'after N retries', { color: 'danger', size: 10 })}
${txt(20, 218, 'At-least-once delivery: duplicates can happen,', { size: 10 })}${txt(20, 234, 'so the consumer must be idempotent.', { size: 10 })}
`, 'RabbitMQ reliability: publisher confirms, durable queue, manual acknowledgement and a dead-letter queue');

CS.queueSse = wrap('0 0 900 300', `${defs1('qs')}
${box(20, 110, 130, 66, 'Browser', 'EventSource open', 'n')}${box(210, 110, 130, 66, 'API', 'returns 202 fast', 'a')}${box(400, 50, 130, 60, 'Queue', 'RabbitMQ', 'g')}${box(590, 50, 130, 60, 'Worker', 'does the work', 'n')}${box(590, 180, 130, 60, 'Redis', 'pub/sub or stream', 'g')}
${arrow('M152 135 L206 135', 'qs')}${txt(180, 124, 'POST', { anchor: 'middle', size: 9.5, ...C })}
${arrow('M342 124 C380 124 380 90 396 85', 'qs')}${arrow('M532 80 L586 80', 'qs')}
${arrow('M655 112 L655 176', 'qs')}${txt(664, 148, 'result', { size: 9.5, ...C })}
${arrow('M586 214 C470 214 300 214 280 180', 'qsa', 'accent')}${txt(430, 232, 'API instance holding the SSE connection', { anchor: 'middle', size: 10, color: 'accent' })}
${arrow('M208 160 L154 160', 'qsa', 'accent', true)}${txt(180, 182, 'event', { anchor: 'middle', size: 9.5, color: 'accent' })}
${txt(20, 270, 'The 202 carries an orderId; the SSE event carries the same id so the UI can match them.', { size: 10 })}
${txt(20, 288, 'GET /orders/:id is the fallback if the connection drops.', { size: 10 })}
`, 'A queue moves slow work off the request while Redis and SSE push the result back to the browser');

CS.jwt = wrap('0 0 900 190', `
${box(40, 30, 220, 70, 'Header', '{ alg: RS256, typ: JWT }', 'n')}${txt(272, 72, '.', { size: 26, ...C })}${box(290, 30, 320, 70, 'Payload (claims)', '{ sub, exp, aud, roles }', 'a')}${txt(622, 72, '.', { size: 26, ...C })}${box(640, 30, 220, 70, 'Signature', 'signed with the private key', 'g')}
${txt(40, 132, 'Header and payload are only base64url-encoded: anyone can read them. Never put secrets in a JWT.', { size: 10.5, ...C })}
${txt(40, 154, 'The signature proves it was not altered. It cannot be revoked before exp without a denylist: keep it short-lived.', { size: 10.5 })}
`, 'A JWT has three base64url parts: header, payload and signature');

CS.trophy = wrap('0 0 900 290', `
${[
  ['E2E', 'few, critical user paths: slow, can be flaky', 250, 'g'],
  ['Integration', 'the biggest slice: best confidence per cost', 560, 'a'],
  ['Unit', 'pure logic, utilities, edge cases', 420, 'n'],
  ['Static analysis', 'TypeScript + ESLint: every keystroke', 500, 'n'],
].map((r, i) => {
  const y = 16 + i * 68, x = 450 - r[2] / 2;
  const fill = { g: 'var(--gold-soft)', a: 'var(--accent-soft)', n: 'var(--panel)' }[r[3]], stroke = { g: 'var(--gold)', a: 'var(--accent)', n: 'var(--border)' }[r[3]];
  return `<rect x="${x}" y="${y}" width="${r[2]}" height="56" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>` +
    txt(450, y + 24, r[0], { anchor: 'middle', font: 'sans', size: 13, ...C, weight: 700 }) + txt(450, y + 43, r[1], { anchor: 'middle', size: 10 });
}).join('')}
`, 'The testing trophy with static analysis at the base and integration tests as the largest slice');

CS.saga = wrap('0 0 900 280', `${defs1('sg')}
${chain('sg', 30, [['Create order', 'local transaction', 'n'], ['Reserve stock', 'local transaction', 'n'], ['Charge payment', 'fails', 'd']], { w: 170, h: 66, x0: 20, total: 620 })}
${txt(670, 66, 'a step fails, so run', { size: 10.5, color: 'danger' })}${txt(670, 84, 'the compensations in reverse', { size: 10.5, color: 'danger' })}
${box(470, 160, 170, 66, 'Release stock', 'compensating action', 'g')}${box(245, 160, 170, 66, 'Cancel order', 'compensating action', 'g')}
${arrow('M555 98 L555 156', 'sgd', 'danger', true)}${arrow('M468 193 L418 193', 'sg', 'muted', true)}
${txt(450, 260, 'No cross-service ACID transaction: each service commits locally; undo steps must be idempotent.', { anchor: 'middle', size: 10.5 })}
`, 'A saga of local transactions with compensating actions run in reverse when a step fails');

CS.outbox = wrap('0 0 900 260', `${defs1('ob')}
${box(20, 90, 140, 70, 'Service', 'handles the request', 'n')}
${rect(230, 50, 270, 150, 'panel-2', 'accent', { dash: true })}${txt(246, 72, 'ONE database transaction', { color: 'accent', size: 10 })}
${box(250, 90, 100, 60, 'orders', 'business row', 'n')}${box(380, 90, 100, 60, 'outbox', 'event row', 'a')}
${arrow('M162 125 L226 125', 'ob')}
${box(570, 90, 120, 70, 'Relay', 'polls unsent rows', 'g')}${box(760, 90, 120, 70, 'Broker', 'RabbitMQ / Kafka', 'n')}
${arrow('M502 125 L566 125', 'ob')}${arrow('M692 125 L756 125', 'ob')}
${txt(450, 232, 'No dual write: the event cannot be lost or published for a rolled-back change.', { anchor: 'middle', size: 10.5, ...C })}
${txt(450, 250, 'At-least-once delivery, so consumers deduplicate.', { anchor: 'middle', size: 10 })}
`, 'Transactional outbox: the business row and the event row are written in one transaction and a relay publishes it');

CS.cqrs = wrap('0 0 900 270', `${defs1('cq')}
${box(20, 40, 130, 56, 'Command', 'change something', 'n')}${box(210, 40, 150, 56, 'Write model', 'enforces the rules', 'a')}${box(420, 40, 150, 56, 'Event store', 'source of truth', 'g')}
${arrow('M152 68 L206 68', 'cq')}${arrow('M362 68 L416 68', 'cq')}
${box(630, 40, 160, 56, 'Projector', 'builds read models', 'n')}${arrow('M572 68 L626 68', 'cq')}
${box(630, 150, 160, 56, 'Read model', 'shaped for queries', 'a')}${arrow('M710 98 L710 146', 'cq')}
${box(420, 150, 150, 56, 'Query', 'read something', 'n')}${arrow('M572 178 L626 178', 'cq', 'muted', true)}
${txt(20, 150, 'Writes and reads scale separately.', { size: 10.5, ...C })}${txt(20, 170, 'The read side is eventually consistent.', { size: 10.5, ...C })}${txt(20, 190, 'Replaying events rebuilds any state.', { size: 10.5, ...C })}
${txt(450, 246, 'Worth the complexity for audit-heavy, complex domains. Not for simple CRUD.', { anchor: 'middle', size: 10.5 })}
`, 'CQRS: commands go to a write model and an event store, projectors build read models used by queries');

CS.hex = wrap('0 0 900 304', `${defs1('hx')}
${box(20, 40, 150, 50, 'HTTP controller', 'driving adapter', 'n')}${box(20, 120, 150, 50, 'Queue consumer', 'driving adapter', 'n')}${box(20, 200, 150, 50, 'CLI / tests', 'driving adapter', 'n')}
${rect(280, 20, 340, 250, 'accent-soft', 'accent')}${txt(450, 46, 'Application core', { anchor: 'middle', font: 'sans', size: 13, ...C, weight: 700 })}
${txt(450, 66, 'domain rules, use cases', { anchor: 'middle', size: 10 })}
${box(298, 100, 150, 44, 'Port: OrderRepository', '', 'g')}${box(452, 100, 150, 44, 'Port: PaymentGateway', '', 'g')}${box(298, 170, 150, 44, 'Port: Notifier', '', 'g')}
${box(730, 40, 150, 50, 'Postgres adapter', 'implements the port', 'n')}${box(730, 120, 150, 50, 'Payment API adapter', 'implements the port', 'n')}${box(730, 200, 150, 50, 'Email adapter', 'implements the port', 'n')}
${arrow('M172 65 L278 100', 'hx')}${arrow('M172 145 L278 140', 'hx')}${arrow('M172 225 L278 200', 'hx')}
${arrow('M726 65 L622 110', 'hxa', 'accent', true)}${arrow('M726 145 L622 135', 'hxa', 'accent', true)}${arrow('M726 225 L622 190', 'hxa', 'accent', true)}
${txt(450, 294, 'Dependencies point inward; test the core with fake adapters.', { anchor: 'middle', size: 10 })}
`, 'Hexagonal architecture: adapters on the outside implement ports defined by the application core');

CS.dbScale = wrap('0 0 900 170', `${defs1('db')}
${chain('db', 26, [['1 Indexes + queries', 'fix the plan first', 'a'], ['2 Read replicas', 'offload reads', 'n'], ['3 Connection pooling', 'PgBouncer / RDS Proxy', 'n'], ['4 Cache in front', 'Redis for hot reads', 'n'], ['5 Shard', 'last resort', 'd']], { w: 150, h: 66, x0: 14, total: 872 })}
${txt(450, 130, 'Reach for them in this order: each step is cheaper and simpler than the next.', { anchor: 'middle', size: 10.5 })}
`, 'Database scaling order: indexes, read replicas, connection pooling, caching and finally sharding');

CS.cacheWaterfall = wrap('0 0 900 180', `${defs1('cw')}
${chain('cw', 26, [['Browser cache', 'hit: done', 'n'], ['CDN edge', 'hit: done', 'n'], ['API gateway', 'hit: done', 'n'], ['Redis', 'hit: done', 'g'], ['Database', 'only if all missed', 'a']], { w: 150, h: 66, x0: 14, total: 872 })}
${txt(450, 130, 'Each layer is cheaper than the next. For every layer decide what is cached, for how long,', { anchor: 'middle', size: 10.5 })}
${txt(450, 150, 'and how it is invalidated.', { anchor: 'middle', size: 10.5 })}
`, 'A request falls through browser, CDN, gateway and Redis caches before reaching the database');

CS.optLoop = wrap('0 0 900 190', `${defs1('ol')}
${chain('ol', 26, [['Measure', 'RUM, load test', 'n'], ['Profile', 'where does time go?', 'n'], ['Fix the biggest', 'one bottleneck', 'a'], ['Validate', 'same metric again', 'g']], { w: 180, h: 66, x0: 20, total: 860 })}
${arrow('M800 96 C800 150 110 150 110 98', 'ola', 'accent', true)}${txt(450, 168, 'repeat', { anchor: 'middle', size: 10.5, color: 'accent' })}
`, 'The optimization loop: measure, profile, fix the biggest bottleneck, validate and repeat');

CS.cwv = wrap('0 0 900 250', `
${[
  ['LCP', 'Largest Contentful Paint', '≤ 2.5 s', ['Fast TTFB (cache, CDN)', 'Preload the hero image', 'No render-blocking CSS / JS'], 20],
  ['INP', 'Interaction to Next Paint', '≤ 200 ms', ['Break up long tasks', 'Defer non-critical work', 'Keep handlers small'], 315],
  ['CLS', 'Cumulative Layout Shift', '≤ 0.1', ['Reserve space: width / height', 'aspect-ratio for embeds', 'Avoid late-injected content'], 610],
].map((c) => rect(c[4], 16, 270, 216, 'panel', 'border') + txt(c[4] + 135, 52, c[0], { anchor: 'middle', font: 'sans', size: 20, color: 'accent', weight: 700 }) + txt(c[4] + 135, 72, c[1], { anchor: 'middle', size: 10 }) + txt(c[4] + 135, 100, 'good: ' + c[2], { anchor: 'middle', size: 11, ...C, weight: 700 }) + c[3].map((l, i) => txt(c[4] + 16, 140 + i * 28, '· ' + l, { size: 10, ...C })).join('')).join('')}
`, 'Core Web Vitals LCP, INP and CLS with their good thresholds and the main fixes');

export default CS;
