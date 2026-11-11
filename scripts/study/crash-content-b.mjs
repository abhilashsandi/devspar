// Crash Course, part B: Node.js, CSS, Web platform & security, Testing, Databases.
import D from './dg.mjs';
import { CS } from './dg-cs.mjs';
import { P, L, N, C, T, SAY, TRAP, K, RAPID, GO, S } from './cc-kit.mjs';

// ───────────────────────────────────────────── Node.js
export const node = S('node', 'Node.js', 10, [
  K('Node 1/6 · Architecture and the event loop',
    P('Node is V8 plus **libuv**: one JavaScript thread runs your code, while libuv does non-blocking network I/O through the OS and runs file system, DNS and crypto work on a **thread pool** (4 threads by default, `UV_THREADPOOL_SIZE`).'),
    CS.nodePhases,
    L('Phases: **timers** → pending callbacks → **poll** (I/O) → **check** (`setImmediate`) → close callbacks.',
      'Between every callback: `process.nextTick` queue first, then promise microtasks.',
      'Blocking the one thread (big `JSON.parse`, sync crypto, a heavy loop, a catastrophic regex) blocks **every** request.'),
    SAY('Node is great for I/O-bound concurrency because one thread juggles thousands of sockets; CPU-bound work goes to worker threads or another service.'),
  ),
  K('Node 2/6 · Streams and backpressure',
    P('Streams process data in chunks so memory stays flat: Readable, Writable, Duplex (sockets), Transform (gzip, parsing). Use `pipeline` so errors and backpressure are handled and every stream is destroyed on failure.'),
    CS.backpressure,
    C(`import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';

await pipeline(
  createReadStream('big.log'),
  createGzip(),
  createWriteStream('big.log.gz'),
);`),
  ),
  K('Node 3/6 · Errors and graceful shutdown',
    L('Operational errors (timeouts, bad input, ECONNREFUSED) are expected: handle and return a proper status. Programmer errors (undefined is not a function) mean a bug: log and crash.',
      'Express 5 forwards rejected promises from async handlers to the error middleware; centralise error formatting there.',
      'On `uncaughtException` / `unhandledRejection`: log, then exit and let the orchestrator restart you. State may be corrupt.',
      'On `SIGTERM` (deploys, scale-in): stop accepting connections, finish in-flight requests, close DB pools, then exit before the kill timeout.'),
    C(`const server = app.listen(3000);
process.on('SIGTERM', () => {
  server.close(async () => {          // stops new connections, waits for open ones
    await db.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // hard stop
});`),
  ),
  K('Node 4/6 · Scaling and CPU work',
    T(['Tool', 'What it is', 'Use for'], [
      ['`cluster` / PM2', 'several processes sharing a port', 'use all cores on one VM (containers usually run one process each instead)'],
      ['`worker_threads`', 'threads with their own V8 isolate, message passing, `SharedArrayBuffer`', 'CPU-heavy JS: image work, parsing, hashing'],
      ['`child_process`', 'a separate OS process', 'run other binaries (ffmpeg), isolate risky work'],
      ['Horizontal scaling', 'many stateless instances behind a load balancer', 'the default in production; keep sessions in Redis/JWT'],
    ]),
    D.nodeThreads,
  ),
  K('Node 5/6 · Production API checklist',
    L('**Validate** every input (zod) and return consistent errors; set body size limits.',
      '**Security:** `helmet` headers, rate limiting, parameterised queries, secrets from env/secret manager, `npm audit` in CI.',
      '**DB:** a connection pool sized below the database\'s limit; timeouts on every outbound call.',
      '**Observability:** structured JSON logs with a request id (`AsyncLocalStorage`), metrics (latency, errors), traces (OpenTelemetry), `/health` and `/ready` endpoints.',
      '**Memory:** watch heap growth; take heap snapshots (`--inspect`, `--heapsnapshot-signal`) to find leaks (listeners, caches, closures).'),
    C(`import { AsyncLocalStorage } from 'node:async_hooks';
export const ctx = new AsyncLocalStorage();
app.use((req, _res, next) => ctx.run({ reqId: crypto.randomUUID() }, next));
// anywhere later: ctx.getStore()?.reqId`, 'Request ids that follow async calls'),
  ),
  RAPID('Node rapid-fire', [
    ['`nextTick` vs `setImmediate`?', '`nextTick` runs before the loop continues (can starve I/O); `setImmediate` runs in the check phase.'],
    ['ESM vs CJS in Node?', '`"type": "module"` or `.mjs` for ESM; `require(esm)` works in modern Node for sync ESM graphs.'],
    ['Express vs Fastify vs NestJS?', 'Express: minimal and ubiquitous; Fastify: faster, schema-based; NestJS: opinionated DI/modules on top of either.'],
    ['Built-in test runner?', '`node --test` with `node:test` and `node:assert`; mocking and coverage built in.'],
    ['Run TypeScript directly?', 'Modern Node strips types natively (erasable syntax only: no enums/namespaces).'],
    ['EventEmitter leak warning?', 'More than 10 listeners on one event: usually listeners added per request and never removed.'],
    ['Buffer?', 'A fixed-size chunk of raw bytes (Uint8Array subclass) for binary data.'],
  ]),
  K('Node · Go deeper', GO(['/nodejs', 'Node.js guide'], ['/interview-cheatsheet#node-js', 'Cheatsheet: Node.js'])),
]);

// ───────────────────────────────────────────── CSS
export const css = S('css', 'CSS & Tailwind', 7, [
  K('CSS 1/4 · Box model, cascade and specificity',
    D.twBox,
    L('`box-sizing: border-box` makes `width` include padding and border (set it globally).',
      'Cascade order: origin and `!important` → **cascade layers** (`@layer`) → **specificity** (inline > id > class/attr/pseudo-class > element) → source order.',
      'Vertical margins between blocks **collapse** (the larger wins); flex and grid children do not collapse.',
      'Units: `rem` for type and spacing, `%`/`fr`/`vw` for layout, `ch` for line length, `dvh` for mobile full-height.'),
  ),
  K('CSS 2/4 · Flexbox vs Grid',
    D.twFlex,
    C(`/* Flex: one dimension, content-sized */
.toolbar { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
.grow    { flex: 1 1 0; min-width: 0; }   /* min-width: 0 lets text truncate */

/* Grid: two dimensions, layout-first */
.cards { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }

/* Center anything */
.center { display: grid; place-items: center; }`),
    SAY('Flex for a row or column of items that size to content; Grid when I am laying out rows and columns together.'),
  ),
  K('CSS 3/4 · Positioning, stacking and responsive design',
    L('`relative` (offset from itself, anchors absolute children), `absolute` (to the nearest positioned ancestor), `fixed` (viewport), `sticky` (scrolls until a threshold).',
      '`z-index` only competes **inside a stacking context**. New contexts come from `position` + `z-index`, `opacity < 1`, `transform`, `filter`, `isolation: isolate`.',
      'Mobile-first: base styles, then `@media (min-width: …)`. **Container queries** (`@container`) size components by their container, not the viewport.',
      'Fluid type: `font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem)`.',
      'Performance: animate `transform` and `opacity` only (compositor), avoid layout thrashing, reserve space for images (`aspect-ratio`) to avoid CLS.'),
    TRAP('"My z-index: 9999 does not work" is almost always a parent creating a stacking context.'),
  ),
  K('CSS 4/4 · Tailwind v4 essentials',
    L('Utility-first: compose styles in markup; the compiler emits only the classes you use.',
      'v4 config lives in CSS: `@import "tailwindcss";` and design tokens in `@theme { --color-brand: … }`, which also become CSS variables.',
      'Variants: `hover:`, `focus-visible:`, `md:`, `dark:`, `group-hover:`, `@container` + `@md:`.',
      'Merge conditional classes with `clsx` + `tailwind-merge` (`cn()` helper); extract repeated UI into components, not `@apply`.'),
    C(`@import "tailwindcss";
@theme {
  --color-brand: oklch(0.62 0.19 260);
  --font-display: "Inter", sans-serif;
}
/* <button class="bg-brand text-white px-4 py-2 rounded-lg hover:opacity-90 md:px-6"> */`),
  ),
  RAPID('CSS rapid-fire', [
    ['`em` vs `rem`?', '`em` is relative to the element\'s font size (compounds); `rem` to the root.'],
    ['`display: none` vs `visibility: hidden`?', 'none removes it from layout and the accessibility tree; hidden keeps its space.'],
    ['BEM?', 'Block__element--modifier naming to keep specificity flat and intent clear.'],
    ['CSS-in-JS trade-off?', 'Scoped and dynamic, but runtime cost and RSC friction; zero-runtime options (Tailwind, CSS Modules, vanilla-extract) win today.'],
    ['`:is()` vs `:where()`?', 'Same matching; `:where()` has zero specificity.'],
    ['`:has()`?', 'A parent/relational selector: `.card:has(img)`.'],
  ]),
  K('CSS · Go deeper', GO(['/tailwind-css', 'CSS & Tailwind guide'], ['/interview-cheatsheet#css', 'Cheatsheet: CSS'])),
]);

// ───────────────────────────────────────────── Web platform & security
export const web = S('web', 'Web Platform & Security', 10, [
  K('Web 1/5 · What happens when you type a URL',
    N('**DNS** resolves the host (browser → OS → resolver cache → authoritative).',
      '**TCP + TLS** handshake (HTTP/3 uses QUIC over UDP: one round trip, no head-of-line blocking).',
      '**HTTP request** goes via CDN edge → load balancer → app; the response streams back.',
      'Browser parses **HTML → DOM**, **CSS → CSSOM**, runs scripts (`defer`/`async`/modules), builds the render tree.',
      '**Layout → paint → composite**; then hydration makes it interactive.'),
    T(['Version', 'Key idea'], [
      ['HTTP/1.1', 'one request at a time per connection; browsers open ~6 connections'],
      ['HTTP/2', 'multiplexed streams on one TCP connection, header compression'],
      ['HTTP/3', 'QUIC over UDP: faster setup, no TCP head-of-line blocking, survives network changes'],
    ]),
  ),
  K('Web 2/5 · HTTP caching',
    C(`Cache-Control: public, max-age=31536000, immutable      # hashed static assets
Cache-Control: no-cache                                  # HTML: always revalidate (ETag)
Cache-Control: private, max-age=0, must-revalidate       # per-user responses
Cache-Control: public, s-maxage=60, stale-while-revalidate=300   # CDN caches 60s, serves stale while refreshing
ETag: "abc123"   →   If-None-Match: "abc123"   →   304 Not Modified`),
    L('`no-cache` = store but revalidate every time; `no-store` = never store.',
      '`s-maxage` applies to shared caches (CDN); `max-age` to the browser too.',
      'Fingerprint asset filenames so you can cache them forever and still ship updates.'),
  ),
  K('Web 3/5 · CORS, cookies and CSRF',
    D.webCors,
    L('**Same-origin** = same scheme + host + port. CORS lets a server opt in to cross-origin reads with `Access-Control-Allow-Origin`.',
      'A **preflight** `OPTIONS` happens for non-simple requests (custom headers, JSON content type, PUT/DELETE).',
      'CORS protects **users\' data in the browser**, not your API: curl ignores it.',
      'Session cookies: `HttpOnly` (no JS access), `Secure` (HTTPS only), `SameSite=Lax` (blocks most CSRF).',
      '**CSRF:** another site makes the browser send your cookies. Defend with SameSite, CSRF tokens, and checking `Origin`.'),
  ),
  K('Web 4/5 · Auth: sessions, JWT, OAuth',
    T(['', 'Server session', 'JWT access token'], [
      ['Stored', 'id in an HttpOnly cookie; data in Redis/DB', 'signed token held by the client'],
      ['Revocation', 'delete the session: instant', 'hard: keep it short-lived (5–15 min) + refresh token rotation'],
      ['Scale', 'needs shared session store', 'stateless verification anywhere'],
      ['Best for', 'web apps on one domain', 'service-to-service, mobile, third-party APIs'],
    ]),
    CS.jwt,
    L('**OAuth 2.0** delegates authorization; **OpenID Connect** adds identity (the ID token). Browser and mobile apps use **Authorization Code + PKCE**.',
      'Never put JWTs in `localStorage` if you can avoid it (XSS can read it); prefer HttpOnly cookies.',
      'Hash passwords with **argon2id** or bcrypt; add MFA/passkeys (WebAuthn) for strong auth.'),
  ),
  K('Web 5/5 · OWASP top risks and defences',
    T(['Risk', 'Defence'], [
      ['XSS (injected script)', 'React escapes by default; avoid `dangerouslySetInnerHTML` or sanitise (DOMPurify); a strict **CSP** with nonces'],
      ['SQL / NoSQL injection', 'parameterised queries or an ORM; never string-concatenate input'],
      ['Broken access control (IDOR)', 'authorise every request server-side: does **this user** own **this resource**?'],
      ['CSRF', 'SameSite cookies, CSRF tokens, Origin checks'],
      ['SSRF', 'allow-list outbound hosts; block metadata IPs (169.254.169.254)'],
      ['Secrets leakage', 'secret manager, never in git or client bundles; rotate'],
      ['Vulnerable dependencies', 'lockfiles, `npm audit`, Dependabot/Renovate, SBOM'],
      ['Brute force / abuse', 'rate limiting, lockouts, CAPTCHA on risky flows, WAF'],
    ]),
    SAY('Authentication proves who you are; authorization decides what you may do, and it must be checked on the server for every request.'),
  ),
  RAPID('Web rapid-fire', [
    ['`defer` vs `async` scripts?', '`defer` runs in order after parsing; `async` runs as soon as downloaded, in any order.'],
    ['Service worker?', 'A proxy script between page and network: offline caching, push, background sync.'],
    ['WebSocket vs SSE?', 'WebSocket is two-way; SSE is server→client over HTTP, auto-reconnects, ideal for streams like LLM tokens.'],
    ['Status codes 401 vs 403?', '401: not authenticated; 403: authenticated but not allowed.'],
    ['Idempotent methods?', 'GET, PUT, DELETE (and HEAD, OPTIONS); POST is not unless you add an idempotency key.'],
    ['REST vs GraphQL?', 'REST: resources + HTTP caching; GraphQL: client-shaped queries, one endpoint, watch N+1 and caching.'],
  ]),
  K('Web · Go deeper', GO(['/web-platform', 'Web Platform & Tooling'], ['/interview-cheatsheet#security', 'Cheatsheet: Security'])),
]);

// ───────────────────────────────────────────── Testing
export const testing = S('test', 'Testing', 5, [
  K('Testing 1/3 · Strategy: the testing trophy',
    CS.trophy,
    L('**Static:** TypeScript + ESLint catch whole classes of bugs for free.',
      '**Unit:** pure logic (reducers, utils, validators). Fast, many.',
      '**Integration (biggest slice):** a component with its children, or an API route with a real test DB. Best confidence per minute.',
      '**E2E:** a few critical journeys (sign-up, checkout) with Playwright, run in CI against a deployed preview.'),
    SAY('Test behaviour, not implementation: if a refactor that keeps behaviour breaks a test, the test was coupled to internals.'),
  ),
  K('Testing 2/3 · Tools and examples',
    C(`// Vitest + React Testing Library + user-event
test('shows an error for an invalid email', async () => {
  const user = userEvent.setup();
  render(<SignupForm />);
  await user.type(screen.getByLabelText(/email/i), 'nope');
  await user.click(screen.getByRole('button', { name: /sign up/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
});

// API integration test (supertest) against a real test database
test('POST /orders is idempotent', async () => {
  const key = crypto.randomUUID();
  const a = await request(app).post('/orders').set('Idempotency-Key', key).send(body);
  const b = await request(app).post('/orders').set('Idempotency-Key', key).send(body);
  expect(b.body.id).toBe(a.body.id);
});`),
    L('Mock at the **network boundary** with MSW rather than mocking your own modules.',
      'Playwright: auto-waiting locators, traces on failure, parallel shards in CI.',
      'Contract tests (Pact) between services; load tests (k6) before launches.'),
  ),
  RAPID('Testing rapid-fire', [
    ['Mock vs stub vs spy?', 'Stub returns canned data; spy records calls; mock is a stub with expectations.'],
    ['Flaky test fixes?', 'Wait for state, not time; isolate data; control clocks and randomness; retry only as a stopgap.'],
    ['TDD?', 'Red → green → refactor: write a failing test, make it pass, clean up.'],
    ['Coverage target?', 'A signal, not a goal: cover risky logic and critical paths; ~70–80% is typical.'],
    ['Snapshot tests?', 'Fine for small stable output; large snapshots get rubber-stamped.'],
  ]),
  K('Testing · Go deeper', GO(['/react-training', 'React guide (RTL section)'], ['/interview-cheatsheet#testing', 'Cheatsheet: Testing'])),
]);

// ───────────────────────────────────────────── Databases
export const databases = S('db', 'Databases', 9, [
  K('DB 1/5 · SQL vs NoSQL',
    T(['', 'Relational (Postgres, MySQL)', 'Document (MongoDB, DynamoDB)', 'Key-value / cache (Redis)'], [
      ['Model', 'tables, joins, constraints', 'nested documents, denormalised', 'keys → values/structures'],
      ['Strength', 'ACID transactions, ad-hoc queries, integrity', 'flexible schema, horizontal scale, predictable key lookups', 'sub-ms reads, counters, queues, locks'],
      ['Weakness', 'sharding is hard', 'joins and cross-item transactions are limited; design for access patterns', 'memory-bound, not a primary store by default'],
    ]),
    SAY('I start with Postgres unless the access pattern clearly needs something else; it covers relational, JSONB, full-text and vectors (pgvector) well.'),
  ),
  K('DB 2/5 · Indexes and query performance',
    L('A **B-tree index** makes lookups O(log n) and supports ranges and sorting; every index slows writes and costs space.',
      '**Composite index** order matters: `(tenant_id, created_at)` serves `WHERE tenant_id = ? ORDER BY created_at` but not `WHERE created_at > ?` alone (leftmost prefix rule).',
      '**Covering index** includes all needed columns, so the table is never read.',
      'Read the plan: `EXPLAIN ANALYZE`; look for sequential scans on big tables and row estimate mismatches.',
      'Use **keyset pagination** (`WHERE id > $last ORDER BY id LIMIT 20`) instead of large `OFFSET`s.'),
    CS.n1,
    TRAP('The N+1 problem: one query for the list, then one per row. Fix with a join, `IN (...)`, the ORM\'s eager loading, or DataLoader.'),
  ),
  K('DB 3/5 · Transactions and isolation',
    P('**ACID:** Atomic (all or nothing), Consistent (constraints hold), Isolated (concurrent transactions do not see each other\'s partial work), Durable (committed survives crashes).'),
    T(['Isolation level', 'Prevents', 'Still allows'], [
      ['Read committed (Postgres default)', 'dirty reads', 'non-repeatable reads, phantoms'],
      ['Repeatable read', '+ non-repeatable reads (snapshot)', 'write skew'],
      ['Serializable', 'everything: as if run one at a time', 'nothing, but transactions may need retry'],
    ]),
    C(`-- Optimistic locking: fail if someone else changed the row
UPDATE accounts SET balance = balance - 100, version = version + 1
WHERE id = $1 AND version = $2;   -- 0 rows updated → conflict, retry

-- Pessimistic: lock the row for the transaction
SELECT * FROM accounts WHERE id = $1 FOR UPDATE;`),
  ),
  K('DB 4/5 · Scaling a database',
    CS.dbScale,
    L('**Read replicas** offload reads (replication lag → read-your-writes issues).',
      '**Connection pooling** (PgBouncer, RDS Proxy) protects the DB from thousands of serverless/app connections.',
      '**Cache** hot reads (cache-aside with TTL + invalidation on write).',
      '**Partition** big tables by time or tenant; **shard** across servers only when one primary cannot take the writes (pick a shard key that spreads load and keeps queries local).',
      '**Zero-downtime migrations:** expand → dual-write/backfill → switch reads → contract.'),
  ),
  K('DB 5/5 · CAP and consistency',
    L('**CAP:** during a network partition you choose consistency (refuse some requests) or availability (serve possibly stale data).',
      '**PACELC:** else (no partition) you trade latency against consistency.',
      '**Eventual consistency** is fine for feeds, counts, search; use strong consistency for money, inventory and uniqueness.',
      'DynamoDB / Cassandra: tunable consistency; Postgres primary: strong for reads on the primary.'),
  ),
  RAPID('DB rapid-fire', [
    ['Normalisation?', 'Remove duplication into related tables (3NF); denormalise selectively for read speed.'],
    ['Primary key choice?', 'Surrogate ids; UUIDv7/ULID sort by time and index well; avoid random UUIDv4 on hot B-trees.'],
    ['Soft delete?', 'A `deleted_at` column; remember partial unique indexes and filtering everywhere.'],
    ['ORM vs query builder?', 'ORM (Prisma, Drizzle) for productivity; drop to SQL for complex/hot queries.'],
    ['When Redis?', 'Cache, sessions, rate limits, leaderboards, pub/sub, distributed locks, simple queues.'],
    ['Vector database?', 'Stores embeddings for similarity search (pgvector, OpenSearch, Pinecone) used by RAG.'],
  ]),
  K('DB · Go deeper', GO(['/interview-prep#db', 'Interview Prep: Databases'], ['/interview-cheatsheet#databases', 'Cheatsheet: Databases'])),
]);
