// Builds the Architecture Patterns guide (app/architecture/content.json): frontend and full-stack
// (Node.js) architecture patterns, AI-era patterns, how to choose, and three worked design answers.
//   node scripts/study/add-architecture-guide.mjs && npm run study:build
// Re-running rebuilds the guide from scratch, so edit this file and run it again.
import { mkdir } from 'node:fs/promises';
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import D from './dg.mjs';
import CS from './dg-cs.mjs';
import AI from './dg-ai.mjs';
import AR from './dg-arch.mjs';
import { P, L, N, T, C, SAY, TRAP, K, GO, RAPID, md } from './cc-kit.mjs';

const DIAGRAM = (title, svg, ...after) => ({ q: 'Diagram: ' + title, a: svg + after.join('') });
const QUIZ = (question, options, right, why) => ({
  q: 'Quiz: ' + md(question) + ' <span class="quizopts">' + options.map((o, i) => '(' + 'ABCD'[i] + ') ' + md(o)).join(' &nbsp;·&nbsp; ') + '</span>',
  a: '<ol class="quiz" type="A">' + options.map((o, i) => '<li' + (i === right ? ' class="right"' : '') + '>' + md(o) + '</li>').join('') + '</ol><p><strong>Answer: ' + 'ABCD'[right] + '.</strong> ' + md(why) + '</p>',
});
// What it is / use it when / it costs you: the same three rows for every pattern.
const FIT = (what, when, cost) => T(['', ''], [['**What it is**', what], ['**Use it when**', when], ['**It costs you**', cost]]);

// ───────────────────────────────────────────── 1. frontend
const frontend = [
  DIAGRAM('How frontend architecture evolved', AR.frontEvolution,
    P('Know this as one story, because “why not just build a SPA?” and “why Next.js?” are the same question.'),
    N('**Static pages**: HTML files. Fast and cacheable, with no interactivity.', '**Server MVC** (Rails, Django, Express with templates): the server builds HTML per request. Dynamic, but every action reloads the page.', '**SPA** (React, Angular, Vue): the app runs in the browser and talks to an API. Rich interaction; the cost is a large bundle, a slow first load and weak SEO.', '**SSG / ISR / SSR** in a meta-framework (Next.js, Nuxt, Remix): the server sends real HTML again, chosen per route, and the client takes over.', '**Server Components**: components run on the server by default and only the interactive parts ship JavaScript.'),
    SAY('Each generation fixed the previous one’s main problem and added a cost. I choose by product: a marketing site is static, a dashboard behind a login can be a SPA, and a shop wants server rendering for speed and SEO.'),
  ),
  K('Static pages, server MVC and the SPA: when is each still the right choice?',
    T(['Architecture', 'Still right for', 'Wrong for'], [
      ['**Static pages**', 'Docs, blogs, marketing: content that changes at deploy time', 'Anything personalised or interactive'],
      ['**Server MVC**', 'Internal tools and CRUD apps with a small team; add HTMX or a few islands for interactivity', 'App-like interaction, offline use, a mobile app sharing the API'],
      ['**SPA**', 'Apps behind a login: dashboards, editors, admin panels, where SEO does not matter and interaction is constant', 'Content sites that need fast first paint and search indexing'],
    ]),
    P('In server MVC the **Model** holds data and rules, the **View** is a template, and the **Controller** takes the request, calls the model and picks the view. The idea survives in every framework since: keep data, presentation and request handling apart.'),
    TRAP('“SPAs are dead” is as wrong as “everything should be a SPA”. An internal dashboard does not need server rendering, and adding it buys complexity and a server bill for nothing.'),
  ),
  K('SSG, ISR, SSR and CSR: how do you choose a rendering strategy per route?',
    D.nextRender,
    T(['Ask', 'If yes'], [
      ['Is the page the same for everyone and rarely changes?', '**SSG**: build once, serve from the CDN'],
      ['Same for everyone, but changes during the day?', '**ISR**: regenerate on a timer or on demand'],
      ['Depends on the user or must be fresh on every request?', '**SSR** (or a static shell with the personal parts streamed in)'],
      ['Highly interactive and private, no SEO need?', '**CSR** for that part'],
    ]),
    P('A real application mixes them: static marketing pages, ISR product pages, SSR for the basket, and client-rendered widgets inside any of them.'),
    GO(['/nextjs', 'Next.js guide'], ['/whiteboard', 'Whiteboard: SSG, ISR, SSR and CSR']),
  ),
  K('How do you structure a large frontend? The modular monolith on the client',
    P('Most frontends that become hard to change are organised by **file type** (`components/`, `hooks/`, `utils/`), so one feature is spread across the tree and everything can import everything. Organise by **domain** instead, and give each feature a front door.'),
    C(`src/
  app/                     routes only: compose features, no business logic
  features/
    checkout/
      index.ts             the ONLY file other features may import from
      components/
      hooks/
      api.ts               this feature's server calls
      model.ts             types, validation, pure logic
    catalog/
    account/
  shared/
    ui/                    design-system components (no feature knowledge)
    lib/                   date, money, http client`, 'Feature-based structure'),
    L('**Rule 1:** a feature imports from `shared/` and from another feature’s `index.ts`, never from its internals.', '**Rule 2:** `shared/` never imports from `features/`.', '**Rule 3:** enforce it with a lint rule (import restrictions, or Nx module boundaries), because a convention nobody checks is gone in a month.', '**Result:** teams work in parallel, a feature can be deleted or extracted, and build tools can split bundles along the same lines.'),
    SAY('Before reaching for micro-frontends I get the boundaries right inside one app. A modular frontend gives most of the team independence at a fraction of the cost.'),
  ),
  DIAGRAM('Micro-frontends', AR.mfe,
    P('Micro-frontends apply the microservice idea to the UI: a **shell** provides routing, sign-in and layout, and each feature area is built, tested and **deployed independently** by its own team.'),
    T(['Integration style', 'How', 'Trade-off'], [
      ['Build-time packages', 'Each feature is an npm package the shell installs', 'Simple; but a release of the shell is needed for every change, so deploys are not independent'],
      ['Run-time module loading', 'The shell loads each feature’s bundle at run time (Module Federation, native ES modules, import maps)', 'Truly independent deploys; needs version discipline for shared libraries'],
      ['Server or edge composition', 'Fragments are stitched into one HTML response', 'Good first paint and SEO; more infrastructure'],
      ['Iframes', 'Each feature is its own page', 'Strong isolation; poor UX and accessibility across the boundary'],
    ]),
    T(['It gives you', 'It costs you'], [
      ['Independent deploys and team autonomy', 'Duplicate dependencies and larger pages unless shared carefully'],
      ['Incremental migration of a legacy frontend', 'A consistent look needs a shared design system that everyone upgrades'],
      ['Fault isolation between features', 'Cross-feature state, routing and testing all get harder'],
    ]),
    TRAP('It is an organisational pattern. With one or two teams it only adds cost; reach for it when many teams are blocked on one release train.'),
  ),
  K('What is a BFF, and how would you build one with Node.js?',
    P('A **Backend for Frontend** is a small server owned by the frontend team that sits between one client and the backend services. It calls the services, combines and trims their responses, and returns exactly what a screen needs.'),
    L('**Why:** web and mobile need different payloads; pages need data from several services; and tokens and secrets should stay on a server, not in the browser.', '**What belongs in it:** aggregation, shaping, auth and session handling, caching. **What does not:** business rules, which stay in the services.'),
    C(`// app/api/dashboard/route.ts — a Next.js route handler acting as the web BFF
import { cookies } from 'next/headers';

export async function GET() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  const headers = { authorization: \`Bearer \${await tokenFor(session)}\` };   // token never reaches the browser

  // call the services in parallel; one slow or failed optional call must not fail the page
  const [account, orders, offers] = await Promise.allSettled([
    fetch(\`\${process.env.ACCOUNTS_URL}/me\`, { headers }).then((r) => r.json()),
    fetch(\`\${process.env.ORDERS_URL}/orders?limit=5\`, { headers }).then((r) => r.json()),
    fetch(\`\${process.env.OFFERS_URL}/offers\`, { headers, signal: AbortSignal.timeout(300) }).then((r) => r.json()),
  ]);
  if (account.status === 'rejected') return Response.json({ error: 'unavailable' }, { status: 502 });

  return Response.json({
    name: account.value.displayName,                                   // only the fields this screen uses
    recentOrders: orders.status === 'fulfilled' ? orders.value.items : [],
    offers: offers.status === 'fulfilled' ? offers.value : [],          // degrade, do not fail
  });
}`, 'A BFF endpoint'),
    P('GraphQL can play the same role: one schema in front of several services, with each client asking for the fields it needs.'),
    TRAP('One BFF shared by every client is just another general API. And a BFF that grows business logic becomes a second backend nobody planned.'),
  ),
  K('Where should state live in a frontend architecture?',
    T(['Kind of state', 'Home', 'Example'], [
      ['Server state', 'A query cache (TanStack Query, RTK Query) or the server itself (Server Components)', 'The list of orders'],
      ['URL state', 'The path and query string', 'Filters, sort, page, selected tab'],
      ['Local UI state', '`useState` / `useReducer` in the component', 'Is the menu open?'],
      ['Shared client state', 'Context for rarely changing values; a store (Zustand, Redux) for busy ones', 'Theme, a multi-step form draft, a cart'],
      ['Form state', 'A form library', 'Field values, touched, errors'],
    ]),
    P('Most “state management problems” come from putting server data in a global store and then keeping it in sync by hand. Classify first; the tool follows.'),
  ),
];

// ───────────────────────────────────────────── 2. backend / full stack
const backend = [
  DIAGRAM('Monolith, modular monolith, microservices', AR.monoliths,
    P('Three points on one line. The question is always where the **boundaries** are and whether they are enforced by convention, by the build, or by the network.'),
  ),
  K('What is a monolithic architecture, and when is it the right answer?',
    FIT('One codebase and one deployable containing the UI or API, the business logic and the data access, usually with one database.',
      'A new product, a small team, a domain you are still learning. One deploy, one place to debug, transactions that just work.',
      'As it grows: slower builds and tests, teams stepping on each other, and you can only scale or deploy the whole thing.'),
    P('The monolith is not the problem; the **big ball of mud** is. A monolith with clear internal structure serves many companies at large scale.'),
    SAY('I start with a monolith unless there is a concrete reason not to. It is the cheapest architecture to change, and the early life of a product is mostly change.'),
  ),
  K('What is layered (MVC-style) architecture in a Node.js API, and where does it hurt?',
    P('Code is split into horizontal layers, each allowed to call only the one below it.'),
    C(`// routes -> controller -> service -> repository -> database
// routes/orders.ts
router.post('/orders', authenticate, validate(CreateOrder), ordersController.create);

// controllers/orders.controller.ts — HTTP in, HTTP out; no business rules
export const create = async (req, res) => {
  const order = await ordersService.create(req.user.id, req.body);
  res.status(201).json(order);
};

// services/orders.service.ts — the business rules; knows nothing about HTTP
export async function create(userId: string, input: CreateOrderInput) {
  const product = await productsRepo.findById(input.productId);
  if (!product || product.stock < input.quantity) throw new ConflictError('out of stock');
  return ordersRepo.insert({ userId, ...input, total: product.price * input.quantity });
}

// repositories/orders.repo.ts — the only layer that talks to the database
export const insert = (o: NewOrder) => db.order.create({ data: o });`, 'A layered Express API'),
    T(['Good', 'Hurts when'], [
      ['Easy to learn; everyone knows where a file goes', 'One feature touches four folders: a change is spread across the tree'],
      ['Business rules are testable without HTTP', 'Layers are global, so every service can call every repository and coupling creeps in'],
      ['Fine for small and medium APIs', 'The domain is large: you need vertical boundaries too, which is the modular monolith'],
    ]),
  ),
  K('What is a modular monolith, and how do you build one in Node.js?',
    P('One deployable, split into **modules by business capability**, each with a public interface and private internals. It keeps the monolith’s simplicity (one deploy, in-process calls, real transactions) and adds the boundaries that let teams work in parallel.'),
    C(`src/
  modules/
    orders/
      index.ts            public API: createOrder(), getOrder(), events
      orders.service.ts   private
      orders.repo.ts      private; owns the orders_* tables
      orders.routes.ts
    billing/
      index.ts            public API: charge(), refund()
    users/
  shared/                 logger, db client, event bus, errors
  app.ts                  wires the module routers together`, 'Module layout'),
    C(`// modules/orders/orders.service.ts
import { charge } from '../billing';            // allowed: another module's public API
// import { paymentsRepo } from '../billing/payments.repo';   // forbidden: its internals
import { events } from '../../shared/events';

export async function createOrder(input: CreateOrder) {
  const order = await ordersRepo.insert(input);
  await charge({ orderId: order.id, amount: order.total });
  events.emit('order.placed', { orderId: order.id });   // other modules react without being called
  return order;
}`, 'Modules talk through public interfaces or events'),
    L('**Each module owns its tables.** No joins into another module’s tables; ask the module.', '**Enforce the boundary** with lint rules, package boundaries in a monorepo, or a dependency checker in CI.', '**Extraction is then cheap:** a module that needs its own scaling or deploy cadence becomes a service, because its interface and data are already separate.'),
    SAY('A modular monolith is my default for a growing product. If I cannot keep modules apart inside one process, splitting them across a network will not fix that; it will hide it behind latency.'),
  ),
  K('What are microservices, and what do they really cost?',
    FIT('Small services, each owning a business capability and its own database, deployed independently and talking over the network (HTTP, gRPC or messages).',
      'Several teams need to deploy independently; parts of the system have very different scaling or reliability needs; the domain boundaries are well understood.',
      'Network latency and partial failure on every call, no cross-service transactions (sagas instead), harder debugging (you need tracing), contract versioning, and a real platform: CI/CD per service, service discovery, observability.'),
    T(['You need before you start', 'Why'], [
      ['Automated deploys and infrastructure', 'Ten services by hand is ten times the toil'],
      ['Centralised logs, metrics and distributed tracing', 'A request crosses many processes'],
      ['Timeouts, retries with backoff, circuit breakers', 'Something is always down'],
      ['Clear ownership per service', 'A service without an owner is a liability'],
    ]),
    TRAP('The **distributed monolith**: services that must be deployed together, share a database or call each other in long synchronous chains. It has the costs of both architectures and the benefits of neither.'),
    GO(['/system-design', 'System Design guide']),
  ),
  DIAGRAM('API gateway versus BFF', AR.gatewayBff,
    T(['', 'API gateway', 'BFF'], [
      ['Purpose', 'One entry point in front of many services', 'A backend shaped for one client'],
      ['Does', 'TLS, authentication, rate limiting, routing, request logging', 'Aggregation and response shaping, session handling'],
      ['Owned by', 'Platform team', 'The frontend team for that client'],
      ['Count', 'One (or one per environment)', 'One per client type: web, mobile, partner'],
      ['Examples', 'Kong, AWS API Gateway, NGINX, Envoy', 'A Next.js server, a small Node or NestJS service, a GraphQL layer'],
    ]),
    P('They are complementary: requests commonly pass through the gateway (cross-cutting concerns) and then a BFF (screen-specific data).'),
    TRAP('Keep business logic out of both. A gateway that knows about orders becomes the bottleneck every team has to change.'),
  ),
  DIAGRAM('Event-driven architecture', AR.eventDriven,
    P('Services communicate by publishing **events** (facts that have happened) to a broker; other services subscribe. The producer does not know or wait for the consumers.'),
    C(`// producer: say what happened, not who should do what
await broker.publish('order.placed', { eventId: randomUUID(), orderId, userId, total });

// consumer (email service): idempotent, because delivery is at-least-once
broker.subscribe('order.placed', async (event) => {
  if (await processed.has(event.eventId)) return;          // seen it already: skip
  await sendConfirmation(event.orderId);
  await processed.add(event.eventId);
});`, 'Publish and consume'),
    T(['Use it when', 'It costs you'], [
      ['Several things must happen after one action, and they need not finish before the response', 'Eventual consistency: readers may briefly see old data'],
      ['You want to add reactions without changing the producer', 'Duplicates and out-of-order delivery: consumers must be idempotent'],
      ['Load is spiky and a queue can smooth it', 'A flow is harder to follow; tracing and a dead-letter queue are essential'],
    ]),
    L('**Queue** (RabbitMQ, SQS): each message goes to one worker and is removed. Good for jobs.', '**Log** (Kafka, Kinesis): ordered events are kept; many consumer groups read and replay. Good for streams and analytics.', '**Outbox pattern:** write the event in the same database transaction as the data, and publish it afterwards, so an event is never lost or sent for a rolled-back change.'),
    GO(['/whiteboard', 'Whiteboard: queue and worker'], ['/system-design', 'System Design guide']),
  ),
  K('Hexagonal, onion and clean architecture: what is the shared idea?',
    P('All three say the same thing with different drawings: **business rules in the middle, technology on the outside, and dependencies pointing inward.** The core defines interfaces for what it needs (**ports**); the outside provides implementations (**adapters**).'),
    CS.hex,
    C(`// core/ports.ts — the core states what it needs, in its own words
export interface OrderRepository { save(o: Order): Promise<void>; byId(id: string): Promise<Order | null>; }
export interface PaymentGateway { charge(orderId: string, cents: number): Promise<'paid' | 'declined'>; }

// core/placeOrder.ts — pure business logic: no Express, no SQL, no SDK
export const placeOrder = (repo: OrderRepository, payments: PaymentGateway) => async (input: NewOrder) => {
  const order = Order.create(input);                       // rules live in the domain object
  if ((await payments.charge(order.id, order.totalCents)) === 'declined') throw new PaymentDeclined();
  await repo.save(order.markPaid());
  return order;
};

// adapters/postgresOrderRepo.ts, adapters/stripeGateway.ts implement the ports
// main.ts — the only place that knows about everything
const handler = placeOrder(new PostgresOrderRepo(db), new StripeGateway(key));

// test — swap the adapters for fakes; no database, no network
const handlerUnderTest = placeOrder(new InMemoryOrderRepo(), { charge: async () => 'paid' });`, 'Ports and adapters in Node.js'),
    T(['Name', 'Emphasis'], [
      ['Hexagonal (ports and adapters)', 'The application has sides: things that drive it (HTTP, CLI, tests) and things it drives (database, APIs)'],
      ['Onion', 'Concentric layers with the domain model at the centre'],
      ['Clean', 'Entities → use cases → interface adapters → frameworks, with the dependency rule made explicit'],
    ]),
    TRAP('It is overhead for a CRUD service with no real rules: you write interfaces that have exactly one implementation forever. Use it where the domain logic is valuable and must outlive the framework.'),
  ),
  K('What is CQRS, and how far should you take it?',
    P('**Command Query Responsibility Segregation** separates the model that changes data (commands) from the models that read it (queries), because the two often want different shapes and scale differently.'),
    CS.cqrs,
    T(['Level', 'What you do', 'When'], [
      ['1. In the code', 'Separate command handlers from query functions; queries may read with plain SQL shaped for the screen', 'Almost always worthwhile; no new infrastructure'],
      ['2. In the database', 'Writes go to the primary; reads go to replicas or materialised views', 'Read-heavy systems'],
      ['3. Separate stores', 'Events from the write side build read models in another store (a search index, a cache, a document store)', 'Very different read needs: search, dashboards, feeds'],
    ]),
    L('The cost rises with each level: at level 3 the read side is **eventually consistent**, so the UI must cope with “I saved it, but the list has not updated yet”.', 'CQRS is often paired with **event sourcing** (store the events, derive the state), but neither requires the other.'),
    TRAP('Do not present full CQRS with event sourcing as the default for a normal CRUD application. Say “separate read and write paths where the shapes differ”, and escalate only with a reason.'),
  ),
  DIAGRAM('Microkernel (plugin) architecture', AR.microkernel,
    FIT('A small, stable core that knows how to load and run plugins, and features delivered as plugins written against a published contract.',
      'A product others must extend or that ships in many variants: editors, build tools, CMSs, checkout or rules engines with per-customer behaviour.',
      'Designing the plugin API is hard, and it is a compatibility promise. Plugins can conflict, slow the host down, or become a security risk.'),
    C(`// a minimal plugin host
type Plugin = { name: string; setup(api: HostApi): void };
type HostApi = { on(event: string, fn: (payload: unknown) => void): void; addRoute(path: string, h: Handler): void };

export function createHost() {
  const listeners = new Map<string, Array<(p: unknown) => void>>();
  const routes = new Map<string, Handler>();
  const api: HostApi = {
    on: (event, fn) => { listeners.set(event, [...(listeners.get(event) ?? []), fn]); },
    addRoute: (path, h) => { routes.set(path, h); },
  };
  return {
    use(plugin: Plugin) { plugin.setup(api); return this; },                 // the core only knows the contract
    emit(event: string, payload: unknown) { listeners.get(event)?.forEach((fn) => fn(payload)); },
    routes,
  };
}

createHost().use({ name: 'audit', setup: (api) => api.on('order.placed', (e) => console.log('audit', e)) });`, 'The core knows the contract, not the plugins'),
    P('You already use this pattern daily: Express middleware, ESLint rules, Vite and webpack plugins, Fastify plugins and VS Code extensions.'),
  ),
];

// ───────────────────────────────────────────── 3. AI-era patterns
const aiPatterns = [
  DIAGRAM('Rules-first (“zero-token”) architecture', AR.rulesFirst,
    P('An LLM call is slow, costs money per request and is not deterministic. A rules-first design handles the bulk of requests with ordinary code and sends only the cases the rules cannot handle to a model.'),
    C(`export async function classifyTicket(text: string): Promise<Category> {
  // 1. deterministic path: free, instant, testable
  if (/refund|charge(d)? twice|money back/i.test(text)) return 'billing';
  if (/password|log ?in|2fa|locked out/i.test(text)) return 'access';

  // 2. a cache of earlier model answers
  const cached = await cache.get(hash(text));
  if (cached) return cached;

  // 3. only now pay for a model call, and validate what comes back
  const answer = CategorySchema.safeParse(await llm.classify(text));
  const category = answer.success ? answer.data : 'needs-human';
  await cache.set(hash(text), category);
  return category;
}`, 'Rules first, model as the fallback'),
    L('Measure what share of traffic each path handles; turn frequent model answers into new rules.', 'Always validate model output against a schema and have a non-AI fallback.', 'The reverse also works: the model **proposes**, deterministic code **decides** (limits, permissions, calculations).'),
    SAY('I use the model where language understanding is needed and plain code everywhere else. Most of a production AI feature is ordinary engineering around a small model call.'),
  ),
  K('What is agent architecture?',
    P('An agent is a model run **in a loop** with tools and memory, working towards a goal instead of answering once.'),
    AI.loop,
    T(['Part', 'Job'], [
      ['Model', 'Reads the context and chooses the next step'],
      ['Tools', 'Functions the model may call: search, read, write, run, call an API'],
      ['Memory', 'The context window for this run, plus files or a store for anything that must persist'],
      ['Loop control', 'Step and cost limits, a stop condition, error handling when a tool fails'],
      ['Guardrails', 'Permissions, human approval for side effects, output validation'],
    ]),
    L('Use an agent when the steps cannot be known in advance. If they can, a fixed **workflow** (a pipeline of prompts and code) is cheaper, faster and easier to test.', 'The quality of an agent depends more on its tools and its verification step than on the model.'),
    GO(['/ai-dev', 'AI-Assisted Development'], ['/genai', 'GenAI Explained']),
  ),
  DIAGRAM('Multi-agent architecture', AR.multiAgent,
    P('A **supervisor** agent breaks the goal into tasks and delegates each to a specialised sub-agent with its own instructions, tools and **context window**. Each returns a short result, so no single context has to hold everything.'),
    T(['Good for', 'Poor for'], [
      ['Broad research where branches are independent', 'Tightly coupled work: agents that cannot see each other’s changes make conflicting decisions'],
      ['Parallel, separable tasks', 'Simple tasks: several agents cost several times the tokens'],
      ['An independent reviewer with fresh context', 'Anything where the hand-off summary loses a detail that mattered'],
    ]),
    SAY('I start with one agent and good tools. I add agents only when a single context window is the limit, or when I want a reviewer that has not seen the author’s reasoning.'),
  ),
];

// ───────────────────────────────────────────── 4. choosing
const choosing = [
  K('How do you choose an architecture?',
    P('From constraints, not fashion. Ask these in order:'),
    T(['Question', 'Points towards'], [
      ['How many teams must ship independently?', 'One or two: monolith or modular monolith. Many: services, maybe micro-frontends'],
      ['How well do we know the domain boundaries?', 'Poorly: keep it in one deployable so boundaries are cheap to move'],
      ['Do parts have very different load or reliability needs?', 'Extract those parts only'],
      ['How many client types?', 'More than one with different needs: a BFF per client'],
      ['Must work continue when a dependency is slow or down?', 'Queues and events between those parts'],
      ['Are reads and writes very different in shape or volume?', 'CQRS, at the lowest level that solves it'],
      ['Is the business logic complex and long-lived?', 'Hexagonal or clean boundaries around the core'],
      ['Must third parties or customers extend it?', 'Microkernel'],
    ]),
    P('Then state the cost of what you chose. An answer without a trade-off sounds like a brochure.'),
  ),
  K('“What architecture did your last project use, and why?” How do you answer?',
    N('**Name it** in one sentence, in plain terms.', '**Say why** it fitted: team size, scale, constraints.', '**Say what it cost** and how you handled that.', '**Say what you would change** with hindsight.'),
    SAY('It was a Node.js monorepo: several Express services behind a gateway, a React and Next.js frontend, and a queue for slow work. That fitted because the third-party integrations were slow and unreliable, so they ran as background jobs with live progress in the UI. The cost was more moving parts to observe, which we paid for with tracing and dashboards. With hindsight I would have defined the module boundaries earlier.'),
    P('The words above are an example of the shape. Use your own project and be exact about your part in the decisions.'),
  ),
  K('What are the common architecture mistakes?',
    L('**Microservices first.** Splitting before the boundaries are understood, then paying to move them across a network.', '**The distributed monolith.** Services sharing one database or deployed together.', '**Layers without modules.** Tidy folders, and every service calling every repository.', '**A shared “common” package** that everything depends on and nobody dares change.', '**Micro-frontends for one team.**', '**Synchronous chains** of service calls where one slow link stalls everything; no timeouts.', '**Events for everything**, including work that needs an immediate answer.', '**Clean architecture for CRUD**: interfaces with one implementation, forever.', '**An LLM where an `if` would do.**'),
  ),
  RAPID('Rapid-fire: architecture patterns', [
    ['Monolith?', 'One deployable for everything; simplest to build and change.'],
    ['Modular monolith?', 'One deployable with enforced module boundaries and module-owned data.'],
    ['Microservices?', 'Independently deployed services with their own data; you pay in network and operations.'],
    ['Distributed monolith?', 'Services that must change or deploy together: the worst of both.'],
    ['API gateway?', 'One entry point for cross-cutting concerns: auth, limits, routing.'],
    ['BFF?', 'A backend per client type that aggregates and shapes responses.'],
    ['Micro-frontends?', 'Independently deployed UI features composed by a shell; for many teams.'],
    ['Event-driven?', 'Services publish facts to a broker; consumers react asynchronously.'],
    ['Hexagonal?', 'Core logic depends on ports; adapters plug technology in from outside.'],
    ['CQRS?', 'Separate write and read models, taken only as far as needed.'],
    ['Event sourcing?', 'Store the events as the source of truth; state is derived.'],
    ['Microkernel?', 'A small core plus plugins against a stable contract.'],
    ['Rules-first AI?', 'Deterministic code for the common case; the model for the rest.'],
    ['Multi-agent?', 'A supervisor delegating to sub-agents with separate contexts.'],
  ]),
  QUIZ('Three services share one database and must be released together. What is this usually called?',
    ['A modular monolith', 'A distributed monolith', 'Event-driven architecture', 'CQRS'], 1,
    'They have the operational cost of services without independence. A modular monolith would give the same coupling with one deploy and no network.'),
  QUIZ('A team of five is starting a new product whose domain they do not know well yet. Which is the most defensible starting point?',
    ['Twelve microservices, one per noun', 'Micro-frontends with a shell', 'A modular monolith', 'Event sourcing with CQRS'], 2,
    'Boundaries will move while the team learns the domain, and inside one deployable that is a refactor, not a migration. Services can be extracted later along the module lines.'),
];

// ───────────────────────────────────────────── 5. design answers
const designs = [
  K('How do you turn a design question into an architecture? A quick map',
    T(['The question stresses', 'Lead with'], [
      ['Money, correctness, audit (banking, payments, booking)', 'Strong consistency, idempotency, a ledger, an audit trail'],
      ['Large data volumes on screen (dashboards, analytics)', 'Server-side aggregation, caching, and rendering techniques in the browser'],
      ['Collaboration and workflow (tickets, boards, docs)', 'The data model, permissions, real-time updates and conflict handling'],
      ['Huge read traffic (feeds, catalogues)', 'Caching layers, CDNs, read replicas'],
      ['Spiky or slow work (uploads, reports, emails)', 'Queues and workers'],
    ]),
    P('For each of the three answers below, the order is the same: requirements, numbers, API and data, the diagram, the hard parts, then trade-offs. Draw the diagram; do not read out a list.'),
    GO(['/whiteboard', 'Whiteboard: laying out a system design answer'], ['/system-design-scale', 'System Design at Scale']),
  ),
  K('Design a banking application (accounts, balances, transfers)',
    P('**1. Requirements.** Ask before drawing.'),
    T(['Functional', 'Non-functional'], [
      ['View accounts, balances and transactions', 'Money is never lost or created: correctness over speed'],
      ['Transfer between own accounts and to others', 'Strong consistency for balances'],
      ['Statements, notifications', 'Full audit trail; regulatory retention'],
      ['Login with multi-factor authentication', 'High availability; security at every layer'],
    ]),
    P('Say what is out of scope: loans, cards, the core-banking system itself.'),
    AR.bank,
    P('**2. The data model is the answer.** Do not store a balance and update it. Store a **ledger**: every movement is two entries, a debit on one account and a credit on another, that sum to zero and are written in **one database transaction**. Entries are append-only. A balance is the sum of an account’s entries (cached, but always reproducible).'),
    C(`-- one transfer = one row here + two ledger entries, in ONE transaction
CREATE TABLE transfers (
  id              uuid PRIMARY KEY,
  idempotency_key text NOT NULL UNIQUE,        -- a retried request finds the first result
  from_account    uuid NOT NULL, to_account uuid NOT NULL,
  amount_cents    bigint NOT NULL CHECK (amount_cents > 0),
  status          text NOT NULL,               -- pending | completed | failed
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE ledger_entries (
  id           bigserial PRIMARY KEY,
  transfer_id  uuid NOT NULL REFERENCES transfers(id),
  account_id   uuid NOT NULL,
  amount_cents bigint NOT NULL,                -- negative = debit, positive = credit
  created_at   timestamptz NOT NULL DEFAULT now()
);  -- no UPDATE, no DELETE: corrections are new entries`, 'Double-entry ledger'),
    P('**3. The transfer flow.**'),
    N('The client sends `POST /transfers` with an **Idempotency-Key** header.', 'The API authenticates, checks the user owns the source account, and applies limits and fraud rules.', 'In one transaction: insert the transfer (the unique key rejects a duplicate), lock the source account row, check the balance, insert the two ledger entries, write an outbox row.', 'Commit. Reply `201` (or `202` if an external payment rail must confirm).', 'A worker reads the outbox: notifications, and the external rail for outgoing payments, with retries.'),
    T(['Hard part', 'How you handle it'], [
      ['Double submission, retries, timeouts', 'Idempotency key with a unique constraint; the retry returns the original result'],
      ['Two transfers racing on one account', 'Row lock (`SELECT … FOR UPDATE`) or serializable isolation; a check constraint that the balance cannot go negative'],
      ['Money as numbers', 'Integer minor units (cents) and a currency code; never floats'],
      ['External systems failing mid-transfer', 'A state machine per transfer (pending → completed / failed), an outbox, compensating entries, reconciliation jobs'],
      ['Audit and compliance', 'Append-only ledger and audit log: who did what, when, from where'],
    ]),
    P('**4. Security and the frontend.**'),
    L('Short sessions in `httpOnly`, `Secure`, `SameSite` cookies; **step-up authentication** (re-enter MFA) before a transfer or adding a payee.', 'Authorise every request against the **specific account**, on the server.', 'Encryption in transit and at rest; mask account numbers in the UI and in logs.', 'In the browser: an inactivity timeout with a warning, no sensitive data in `localStorage`, a strict Content Security Policy, and **no optimistic UI for money**: show “pending” until the server confirms.', 'Accessibility is a legal requirement for banks: forms, errors and focus must work with a keyboard and a screen reader.'),
    P('**5. Trade-offs to say out loud.** Strong consistency and a single ledger database limit write throughput, which is acceptable: banks trade latency for correctness. Reads (statements, history) can scale on replicas and caches; notifications are eventually consistent. Architecture: a **modular monolith or a few services** around the ledger, not dozens.'),
    GO(['/system-design', 'System Design: sagas and outbox'], ['/whiteboard', 'Whiteboard: queue, worker and retries']),
  ),
  K('Design a dashboard with heavy data (many charts, large tables, live updates)',
    P('**1. Requirements.** How much data (rows per chart, time range)? How fresh must it be (seconds, minutes)? How many concurrent users and how many widgets per page? Which filters? Export?'),
    AR.dashboard,
    P('**2. The principle:** a screen has about two thousand pixels across. Sending a million rows to draw a line is waste at every layer. **Aggregate on the server; send what can be drawn.**'),
    T(['Layer', 'Technique'], [
      ['Storage', 'A columnar or time-partitioned analytics store, separate from the transactional database; pre-computed **rollup tables** per minute, hour and day'],
      ['Query API', 'The client sends a time range, filters and a width; the API picks the rollup grain so each series has a few hundred to a couple of thousand points; hard limits on range and rows'],
      ['Caching', 'Cache results by query key with a short TTL; identical widgets across users share a result; HTTP caching for immutable past periods'],
      ['Transport', 'One request per widget in parallel (so a slow chart does not block the page); cursor pagination for tables; compact JSON or a binary format for large series'],
      ['Live data', 'SSE or WebSocket carrying **deltas**, not full reloads; or polling every N seconds if freshness allows'],
    ]),
    C(`GET /api/metrics/orders?from=2026-11-01&to=2026-11-14&interval=auto&maxPoints=800&region=eu
→ { "interval": "1h", "points": [[1793491200, 412], …] }     // ~336 points, not 2.4 million rows`, 'The API returns drawable data'),
    P('**3. In the browser.**'),
    T(['Problem', 'Fix'], [
      ['Thousands of points per chart', 'Render on **canvas or WebGL** (SVG creates one DOM node per point); downsample to the pixel width (for example the LTTB algorithm keeps the visual shape)'],
      ['Big tables', '**Virtualise**: render only the visible rows; paginate or infinite-scroll on the server'],
      ['Heavy transforms freeze the page', 'Do them on the server, or in a **Web Worker**'],
      ['Every update re-renders every chart', 'Each widget owns its query; memoise chart props; batch live updates with `requestAnimationFrame` and throttle to a few per second'],
      ['Twenty widgets load at once', 'Load what is in view first (IntersectionObserver), lazy-load chart code, limit concurrent requests'],
      ['Filters', 'Keep them in the **URL**: shareable, survives refresh; debounce changes and cancel superseded requests'],
      ['Waiting', 'A skeleton per widget, keep the previous data while refetching, and an error state per widget so one failure does not blank the page'],
    ]),
    P('**4. Trade-offs.** Rollups make queries fast and make very fine-grained ad-hoc questions slower or impossible, so keep raw data for drill-down on a narrower range. Live updates cost connections and render time: ask whether “updated every 30 seconds” is enough. Pre-aggregation trades storage and pipeline complexity for latency.'),
    SAY('I design it backwards from the pixels: decide what each chart can actually show, make the API return exactly that, cache it, and render it on canvas. Most dashboard performance problems are too much data sent, not slow charts.'),
    GO(['/performance-optimization', 'Performance guide'], ['/react-training', 'React guide: rendering performance']),
  ),
  K('Design a Jira-style ticket application (support tickets, boards, workflows)',
    P('**1. Requirements.** Create, assign, comment on and search tickets; a board with columns per status and drag and drop; configurable workflows; notifications; attachments; roles per project. Non-functional: multi-tenant (many customer organisations), full history of changes, near-real-time boards, search over millions of tickets.'),
    AR.tickets,
    P('**2. Data model.** This is where the design is won.'),
    C(`organisations(id, name)                                   -- the tenant; every table below carries org_id
projects(id, org_id, key, name, workflow_id)
workflow_states(id, workflow_id, name, category)          -- todo | in_progress | done
workflow_transitions(workflow_id, from_state, to_state, required_role)
tickets(id, org_id, project_id, number, title, description, state_id, assignee_id,
        priority, rank, custom jsonb, version int, created_at, updated_at)
comments(id, ticket_id, author_id, body, created_at)
ticket_history(id, ticket_id, actor_id, field, old_value, new_value, created_at)   -- append-only
memberships(user_id, project_id, role)                    -- viewer | agent | admin
attachments(id, ticket_id, storage_key, size, content_type)`, 'Core tables (PostgreSQL)'),
    L('`project.key` + `ticket.number` gives the readable id (**SUP-142**); allocate the number per project inside the insert transaction.', '**Custom fields** in a `jsonb` column with a per-project schema, indexed where they are filtered on.', '**History** is written in the same transaction as every change: it is the audit log and the activity feed.', '**Indexes** follow the screens: `(project_id, state_id, rank)` for the board, `(assignee_id, state_id)` for “my tickets”.'),
    P('**3. The hard parts.**'),
    T(['Problem', 'Approach'], [
      ['**Ordering cards on a board**', 'A `rank` column that sorts lexically (fractional indexing, as in LexoRank): moving a card writes one row, between its neighbours’ ranks, instead of renumbering the column'],
      ['**Two people edit one ticket**', 'Optimistic concurrency: send the `version` you read; the update succeeds only if it still matches, otherwise `409` and the UI shows the newer change'],
      ['**Drag and drop feels instant**', 'Optimistic update in the client, rollback on error; the server validates the transition against the workflow and the user’s role'],
      ['**Boards update live**', 'After commit, publish a change event (Redis pub/sub); API instances push it to subscribed browsers over SSE or WebSocket; clients patch their cache'],
      ['**Search**', 'Postgres full-text to start; a search index (OpenSearch) fed from the outbox when volume or relevance demands it; search is eventually consistent'],
      ['**Permissions**', 'Role per project, checked on the server for every read and write, and always scoped by `org_id` (row-level security is a good backstop)'],
      ['**Notifications and SLAs**', 'Outbox → queue → workers for email and webhooks; SLA timers as scheduled jobs that escalate when a due time passes'],
      ['**Attachments**', 'Upload straight to object storage with a pre-signed URL; store only metadata; scan files'],
    ]),
    P('**4. Architecture choice.** A **modular monolith** in Node.js (tickets, workflow, comments, users, notifications, search) with PostgreSQL, Redis and a queue. It handles a large product; extract search or notifications later if their load demands it. The frontend is a Next.js app: server-rendered ticket pages (shareable, fast), a client-rendered board with a query cache, virtualised lists, and filters in the URL.'),
    P('**5. Trade-offs.** JSONB custom fields are flexible and harder to query and validate than columns. Real-time adds connection management; polling the board every few seconds is a legitimate first version. Per-tenant databases isolate customers better and cost far more to operate than a shared schema with `org_id`.'),
    GO(['/system-design-scale', 'System Design at Scale'], ['/whiteboard', 'Whiteboard: async result with SSE']),
  ),
];

// ───────────────────────────────────────────── assemble
const data = [
  { id: 'quickref', title: 'Quick Reference', questions: [] },
  { id: 'ar1', title: '1. Frontend Architecture', questions: frontend },
  { id: 'ar2', title: '2. Backend and Full-Stack Patterns (Node.js)', questions: backend },
  { id: 'ar3', title: '3. AI-Era Patterns', questions: aiPatterns },
  { id: 'ar4', title: '4. Choosing and Defending an Architecture', questions: choosing },
  { id: 'ar5', title: '5. Design Answers: Banking, Dashboard, Ticketing', questions: designs },
];
H.regenQuickRef(data);

const html = await H.newPage(
  {
    key: 'architecture',
    title: 'Architecture Patterns: Interview Prep',
    brand: 'Architecture Patterns',
    brandSub: 'frontend and full-stack',
    h1: 'Architecture patterns',
    eyebrow: 'Prep guide',
    lede: 'The architecture patterns a full-stack developer is asked about, for the frontend and for a Node.js back end: what each one is, when it fits and what it costs, with diagrams and code. Ends with worked answers to three design questions: a banking application, a data-heavy dashboard and a Jira-style ticket system.',
  },
  data,
);

await mkdir(new URL('../../app/architecture/', import.meta.url), { recursive: true });
const total = await lib.save('architecture', await lib.upgrade(html));
console.log('architecture guide written: ' + data.length + ' sections, ' + total + ' cards');
