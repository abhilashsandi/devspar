// Diagrams for the Architecture Patterns guide (AR.*). Same visual language as dg.mjs.
import { box, txt, arrow, rect, wrap, M, line } from './dg.mjs';

const defs = (id) => `<defs>${M(id, 'muted')}${M(id + 'a', 'accent')}${M(id + 'd', 'danger')}</defs>`;
const T = { color: 'text' };
const chain = (mk, y, items, o = {}) => {
  const w = o.w || 150, h = o.h || 64, x0 = o.x0 ?? 20, total = o.total ?? 860;
  const gap = items.length > 1 ? (total - items.length * w) / (items.length - 1) : 0;
  return items.map((it, i) => {
    const x = x0 + i * (w + gap);
    return box(x, y, w, h, it[0], it[1] || '', it[2] || 'n') + (it[3] ? txt(x + w / 2, y + h + 20, it[3], { anchor: 'middle', size: 10, ...T }) : '') + (it[4] ? txt(x + w / 2, y + h + 38, it[4], { anchor: 'middle', size: 10, color: 'danger' }) : '') +
      (i < items.length - 1 ? arrow(`M${x + w + 2} ${y + h / 2} L${x + w + gap - 4} ${y + h / 2}`, mk) : '');
  }).join('');
};
const panel = (x, w, title, color = 'text') => rect(x, 14, w, 262, 'panel-2', 'border') + txt(x + 14, 38, title, { font: 'sans', size: 13, color, weight: 700 });
const db = (x, y, w, label) => box(x, y, w, 40, label, '', 'g');

export const AR = {};

AR.frontEvolution = wrap('0 0 900 190', `${defs('fe')}
${chain('fe', 30, [
  ['Static pages', 'HTML files', 'n', 'fast, cacheable', 'no interactivity'],
  ['Server MVC', 'HTML per request', 'n', 'dynamic content', 'full page reloads'],
  ['SPA', 'app runs in the browser', 'a', 'rich interaction', 'big bundle, weak SEO'],
  ['SSG / ISR / SSR', 'chosen per route', 'a', 'fast first paint, SEO', 'more moving parts'],
  ['Server Components', 'server first', 'g', 'less JavaScript shipped', 'new mental model'],
], { w: 152, h: 62, x0: 14, total: 872 })}
${txt(450, 168, 'Each step fixed the previous one’s main pain and added a cost of its own. Later does not mean better for every product.', { anchor: 'middle', size: 10.5 })}
`, 'How frontend architecture evolved: static pages, server MVC, single-page apps, per-route rendering strategies and server components');

AR.monoliths = wrap('0 0 900 290', `${defs('mo')}
${panel(14, 270, 'Monolith')}
${rect(34, 54, 230, 150, 'panel', 'border')}${box(48, 66, 202, 36, 'UI + routes', '', 'n')}${box(48, 108, 202, 36, 'Business logic', '', 'n')}${box(48, 150, 202, 36, 'Data access', '', 'n')}
${db(94, 222, 110, 'One database')}${arrow('M149 206 L149 218', 'mo')}
${panel(300, 290, 'Modular monolith', 'accent')}
${rect(318, 54, 254, 150, 'panel', 'accent')}${txt(330, 72, 'one deployable', { size: 9.5, color: 'accent' })}
${box(328, 82, 72, 108, 'Orders', 'own tables', 'a')}${box(408, 82, 72, 108, 'Billing', 'own tables', 'a')}${box(488, 82, 72, 108, 'Users', 'own tables', 'a')}
${line(404, 86, 404, 186, 'accent', true)}${line(484, 86, 484, 186, 'accent', true)}
${db(390, 216, 110, 'One database')}${arrow('M445 206 L445 213', 'mo')}
${txt(318, 270, 'modules talk through public interfaces only', { size: 9.5 })}
${panel(606, 280, 'Microservices')}
${box(620, 60, 78, 50, 'Orders', 'service', 'n')}${box(707, 60, 78, 50, 'Billing', 'service', 'n')}${box(794, 60, 78, 50, 'Users', 'service', 'n')}
${db(620, 150, 78, 'DB')}${db(707, 150, 78, 'DB')}${db(794, 150, 78, 'DB')}
${arrow('M659 112 L659 146', 'mo')}${arrow('M746 112 L746 146', 'mo')}${arrow('M833 112 L833 146', 'mo')}
${arrow('M700 85 L705 85', 'mo', 'muted', true)}${arrow('M787 85 L792 85', 'mo', 'muted', true)}
${txt(620, 222, 'network between them:', { size: 9.5 })}${txt(620, 238, 'latency, partial failure,', { size: 9.5 })}${txt(620, 254, 'independent deploys', { size: 9.5 })}
`, 'A monolith, a modular monolith with module boundaries, and microservices with a database each');

AR.gatewayBff = wrap('0 0 900 290', `${defs('gb')}
${rect(14, 14, 420, 262, 'panel-2', 'border')}${txt(28, 38, 'API gateway: one front door', { font: 'sans', size: 13, ...T, weight: 700 })}
${box(28, 70, 80, 44, 'Web', '', 'n')}${box(28, 150, 80, 44, 'Mobile', '', 'n')}
${box(150, 96, 120, 76, 'API gateway', 'auth, limits', 'a')}
${box(316, 60, 100, 40, 'Orders', '', 'n')}${box(316, 114, 100, 40, 'Users', '', 'n')}${box(316, 168, 100, 40, 'Search', '', 'n')}
${arrow('M110 92 L146 118', 'gb')}${arrow('M110 172 L146 150', 'gb')}${arrow('M272 118 L312 82', 'gb')}${arrow('M272 134 L312 134', 'gb')}${arrow('M272 150 L312 186', 'gb')}
${txt(28, 238, 'Same API for every client. Cross-cutting', { size: 10, ...T })}${txt(28, 254, 'concerns live in one place.', { size: 10, ...T })}
${rect(466, 14, 420, 262, 'panel-2', 'border')}${txt(480, 38, 'BFF: one backend per client', { font: 'sans', size: 13, ...T, weight: 700 })}
${box(480, 70, 80, 44, 'Web', '', 'n')}${box(480, 150, 80, 44, 'Mobile', '', 'n')}
${box(600, 62, 120, 58, 'Web BFF', 'shapes for pages', 'g')}${box(600, 144, 120, 58, 'Mobile BFF', 'small payloads', 'g')}
${box(768, 60, 100, 40, 'Orders', '', 'n')}${box(768, 114, 100, 40, 'Users', '', 'n')}${box(768, 168, 100, 40, 'Search', '', 'n')}
${arrow('M562 92 L596 92', 'gb')}${arrow('M562 172 L596 172', 'gb')}
${arrow('M722 84 L764 80', 'gb')}${arrow('M722 98 L764 128', 'gb')}${arrow('M722 166 L764 140', 'gb')}${arrow('M722 180 L764 188', 'gb')}
${txt(480, 238, 'Each client gets responses built for its', { size: 10, ...T })}${txt(480, 254, 'screens; the frontend team owns its BFF.', { size: 10, ...T })}
`, 'An API gateway as a single entry point compared with a backend-for-frontend per client');

AR.mfe = wrap('0 0 900 270', `${defs('mf')}
${rect(14, 14, 872, 170, 'panel-2', 'accent')}${txt(28, 38, 'Shell (host): routing, sign-in, layout, shared design system', { font: 'sans', size: 13, ...T, weight: 700 })}
${box(34, 56, 264, 110, 'Search', 'team A · /search', 'n')}${box(318, 56, 264, 110, 'Cart + checkout', 'team B · /cart', 'n')}${box(602, 56, 264, 110, 'Account', 'team C · /account', 'n')}
${box(34, 208, 264, 44, 'own repo, build, deploy', '', 'g')}${box(318, 208, 264, 44, 'own repo, build, deploy', '', 'g')}${box(602, 208, 264, 44, 'own repo, build, deploy', '', 'g')}
${arrow('M166 206 L166 170', 'mf', 'muted', true)}${arrow('M450 206 L450 170', 'mf', 'muted', true)}${arrow('M734 206 L734 170', 'mf', 'muted', true)}
`, 'Micro-frontends: a shell that hosts independently built and deployed features owned by separate teams');

AR.eventDriven = wrap('0 0 900 270', `${defs('ev')}
${box(20, 96, 170, 66, 'Orders service', 'producer', 'n')}
${box(330, 76, 240, 106, 'Event broker', 'topic: order.placed', 'g')}
${box(710, 30, 170, 56, 'Email', 'consumer', 'n')}${box(710, 100, 170, 56, 'Inventory', 'consumer', 'n')}${box(710, 170, 170, 56, 'Analytics', 'consumer', 'n')}
${arrow('M192 129 L326 129', 'ev')}${txt(259, 118, 'publish', { anchor: 'middle', size: 10, ...T })}
${arrow('M572 108 L706 62', 'ev')}${arrow('M572 129 L706 129', 'ev')}${arrow('M572 150 L706 196', 'ev')}
${txt(20, 216, 'The producer does not know who listens.', { size: 10.5, ...T })}
${txt(20, 234, 'Add a consumer without touching it.', { size: 10.5, ...T })}
${txt(330, 216, 'Costs: eventual consistency, duplicates', { size: 10.5 })}
${txt(330, 234, '(be idempotent), harder to trace a flow.', { size: 10.5 })}
`, 'Event-driven architecture: a producer publishes to a broker and independent consumers react');

AR.microkernel = wrap('0 0 900 290', `${defs('mk')}
${box(340, 86, 220, 88, 'Core (kernel)', 'lifecycle, registry, plugin API', 'a')}
${box(40, 30, 200, 54, 'Plugin: language support', '', 'n')}${box(660, 30, 200, 54, 'Plugin: themes', '', 'n')}
${box(40, 176, 200, 54, 'Plugin: git', '', 'n')}${box(660, 176, 200, 54, 'Plugin: your own', '', 'g')}
${line(242, 62, 338, 104, 'border')}${line(658, 62, 562, 104, 'border')}${line(242, 200, 338, 158, 'border')}${line(658, 200, 562, 158, 'border')}
${txt(450, 258, 'The core stays small and stable; features arrive as plugins against a contract.', { anchor: 'middle', size: 10.5 })}
${txt(450, 278, 'VS Code, browsers, bundlers (webpack, Vite) and ESLint are built this way.', { anchor: 'middle', size: 10.5 })}
`, 'Microkernel architecture: a small core extended by plugins through a stable contract');

AR.rulesFirst = wrap('0 0 900 250', `${defs('rf')}
${box(14, 80, 120, 60, 'Request', '', 'n')}
${box(196, 30, 250, 66, 'Deterministic path', 'rules, lookups, templates, state machine', 'a')}
${box(196, 146, 250, 66, 'LLM path', 'only what the rules cannot handle', 'g')}
${box(520, 146, 150, 66, 'Validate', 'schema, guardrails', 'n')}
${box(742, 80, 144, 60, 'Response', '', 'n')}
${arrow('M136 100 L192 70', 'rf')}${arrow('M448 63 C600 63 660 80 738 100', 'rfa', 'accent')}${txt(590, 58, 'most requests: zero tokens', { anchor: 'middle', size: 10.5, color: 'accent' })}
${arrow('M321 98 L321 142', 'rfd', 'danger', true)}${txt(332, 124, 'no rule matched', { size: 10, color: 'danger' })}
${arrow('M448 179 L516 179', 'rf')}${arrow('M672 179 C720 179 760 160 790 144', 'rf')}
${txt(14, 236, 'Cheaper, faster and testable for the common case; the model is the fallback, not the default. Cache its answers.', { size: 10.5 })}
`, 'Rules-first, sometimes called zero-token, architecture: deterministic code handles most requests and an LLM handles the rest');

AR.multiAgent = wrap('0 0 900 270', `${defs('ma')}
${box(14, 96, 110, 60, 'User goal', '', 'n')}
${box(190, 80, 200, 92, 'Supervisor agent', 'plans, delegates, merges', 'a')}
${box(520, 20, 220, 60, 'Research agent', 'own context + search tools', 'n')}${box(520, 98, 220, 60, 'Coding agent', 'own context + edit, run', 'n')}${box(520, 176, 220, 60, 'Review agent', 'own context, read-only', 'n')}
${arrow('M126 126 L186 126', 'ma')}${arrow('M392 104 L516 54', 'ma')}${arrow('M392 126 L516 128', 'ma')}${arrow('M392 148 L516 202', 'ma')}
${txt(770, 54, 'each returns', { size: 10, ...T })}${txt(770, 70, 'a short summary', { size: 10, ...T })}
${arrow('M742 206 C830 206 830 250 300 250 C280 250 280 200 290 176', 'maa', 'accent', true)}
${txt(540, 262, 'summaries, not transcripts, come back: the supervisor’s context stays small', { anchor: 'middle', size: 10, color: 'accent' })}
`, 'Multi-agent architecture: a supervisor delegates to specialised sub-agents that each have their own context window');

AR.bank = wrap('0 0 900 380', `${defs('bk')}
${box(14, 30, 110, 46, 'Web (Next.js)', '', 'n')}${box(14, 90, 110, 46, 'Mobile', '', 'n')}
${box(160, 44, 110, 78, 'CDN + WAF', 'TLS, bot rules', 'n')}
${box(306, 44, 130, 78, 'Gateway / BFF', 'session, MFA, limits', 'a')}
${arrow('M126 53 L156 70', 'bk')}${arrow('M126 113 L156 96', 'bk')}${arrow('M272 83 L302 83', 'bk')}
${box(486, 14, 120, 46, 'Accounts', 'balances, statements', 'n')}${box(486, 70, 120, 46, 'Transfers', 'idempotent', 'a')}${box(486, 126, 120, 46, 'Fraud / limits', 'rules, risk score', 'n')}
${arrow('M438 70 L482 40', 'bk')}${arrow('M438 86 L482 92', 'bk')}${arrow('M438 100 L482 144', 'bk')}
${box(660, 40, 226, 70, 'Ledger (Postgres)', 'double-entry, append-only, ACID', 'g')}
${arrow('M608 93 L656 82', 'bka', 'accent')}${arrow('M608 37 C630 37 640 50 656 58', 'bk', 'muted', true)}
${box(660, 140, 106, 50, 'Outbox', 'same transaction', 'n')}${box(780, 140, 106, 50, 'Queue', '', 'g')}${box(660, 224, 106, 46, 'Notify', 'push, email', 'n')}${box(780, 224, 106, 46, 'Payment rail', 'ACH, cards', 'n')}
${arrow('M713 112 L713 136', 'bk')}${arrow('M768 165 L776 165', 'bk')}${arrow('M833 192 L833 220', 'bk')}${arrow('M800 192 L734 220', 'bk')}
${box(306, 216, 130, 50, 'Audit log', 'who, what, when', 'd')}${arrow('M371 124 L371 212', 'bk', 'muted', true)}
${txt(14, 316, 'Money never moves by updating a balance: every transfer is two ledger entries (debit + credit) in one transaction.', { size: 10.5, ...T })}
${txt(14, 336, 'An idempotency key makes a retried transfer safe. Slow or external steps go through the outbox and a queue.', { size: 10.5, ...T })}
${txt(14, 356, 'Correctness and auditability outrank latency here: strong consistency for the ledger, eventual for notifications.', { size: 10.5 })}
`, 'A banking application: clients, edge, gateway, account and transfer services, a double-entry ledger, an outbox and queue, and an audit log');

AR.dashboard = wrap('0 0 900 340', `${defs('ds')}
${box(14, 40, 120, 50, 'Event sources', 'apps, services', 'n')}${box(170, 40, 120, 50, 'Stream / ETL', 'ingest', 'n')}${box(326, 40, 150, 50, 'Analytics store', 'columnar, partitioned', 'g')}${box(512, 40, 150, 50, 'Rollup tables', 'per minute / hour / day', 'a')}
${arrow('M136 65 L166 65', 'ds')}${arrow('M292 65 L322 65', 'ds')}${arrow('M478 65 L508 65', 'ds')}
${box(512, 130, 150, 56, 'Query API', 'picks grain, caps points', 'a')}${box(326, 130, 150, 56, 'Cache', 'Redis, keyed by query', 'g')}${box(716, 130, 170, 56, 'Live channel', 'SSE / WebSocket deltas', 'n')}
${arrow('M587 92 L587 126', 'ds')}${arrow('M508 158 L480 158', 'ds', 'muted', true)}
${rect(14, 216, 872, 80, 'panel-2', 'accent')}${txt(28, 238, 'BROWSER', { size: 9.5, color: 'accent' })}
${box(28, 246, 150, 40, 'Query cache', '', 'n')}${box(196, 246, 150, 40, 'Web Worker', '', 'n')}${box(364, 246, 160, 40, 'Canvas / WebGL charts', '', 'a')}${box(542, 246, 160, 40, 'Virtualised table', '', 'n')}${box(720, 246, 152, 40, 'Filters in the URL', '', 'n')}
${arrow('M587 188 C587 205 110 200 103 242', 'ds')}${arrow('M800 188 C800 205 460 205 444 242', 'ds', 'muted', true)}
${txt(14, 322, 'Never send raw rows to draw a chart: aggregate on the server to roughly one point per pixel, and render on canvas.', { size: 10.5 })}
`, 'A data-heavy dashboard: ingestion, an analytics store with rollups, a query API with a cache, a live channel, and browser-side rendering techniques');

AR.tickets = wrap('0 0 900 350', `${defs('tk')}
${box(14, 60, 120, 60, 'Web app', 'Next.js, board + list', 'n')}
${rect(180, 20, 330, 150, 'panel-2', 'accent', { dash: true })}${txt(194, 40, 'Node.js API: a modular monolith', { size: 10, color: 'accent' })}
${box(194, 50, 96, 48, 'Tickets', '', 'a')}${box(298, 50, 96, 48, 'Workflow', '', 'a')}${box(402, 50, 96, 48, 'Comments', '', 'a')}
${box(194, 108, 96, 48, 'Users + RBAC', '', 'n')}${box(298, 108, 96, 48, 'Notifications', '', 'n')}${box(402, 108, 96, 48, 'Search', '', 'n')}
${arrow('M136 82 L176 82', 'tk')}${arrow('M176 104 L136 104', 'tka', 'accent', true)}${txt(156, 122, 'SSE', { anchor: 'middle', size: 9.5, color: 'accent' })}
${box(566, 20, 150, 50, 'Postgres', 'tickets, history, outbox', 'g')}${box(566, 84, 150, 50, 'Redis', 'cache, pub/sub, limits', 'g')}${box(566, 148, 150, 50, 'Search index', 'full-text, filters', 'n')}${box(748, 20, 138, 50, 'Object storage', 'attachments', 'n')}
${arrow('M512 60 L562 46', 'tk')}${arrow('M512 96 L562 108', 'tk')}${arrow('M512 130 L562 168', 'tk', 'muted', true)}
${box(194, 216, 150, 54, 'Queue', 'jobs from the outbox', 'g')}${box(380, 216, 150, 54, 'Workers', 'email, webhooks, indexing', 'n')}${box(566, 216, 150, 54, 'SLA timers', 'due, breach, escalate', 'd')}
${arrow('M300 172 L272 212', 'tk')}${txt(214, 196, 'outbox rows', { size: 9.5 })}${arrow('M346 243 L376 243', 'tk')}${arrow('M532 243 L562 243', 'tk')}
${txt(14, 300, 'One deployable with clear modules is enough for most ticket systems. Every change writes a history row and an', { size: 10.5, ...T })}
${txt(14, 320, 'outbox row in the same transaction; workers send email, update search and push live updates to open boards.', { size: 10.5, ...T })}
`, 'A Jira-style ticket application: web app, a modular Node.js API, Postgres, Redis, a search index, object storage, and a queue with workers and SLA timers');

export default AR;
