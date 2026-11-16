// Audio overview of the Interview Prep guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the Interview Prep guide, the largest guide on the site. It collects the questions most often asked of a full stack engineer, with a full answer to each, in eighteen sections.

It opens with a two hour review, then engineering practice, and then every track in turn: JavaScript, TypeScript, React, Next.js, Node, databases, cloud and deployment, coding exercises, architecture and reliability, security, the web platform, CSS, testing, system design, design at scale, and performance.

Several of these tracks have their own guide, and their own audio overview, which goes deeper. So this overview focuses on what is most likely to be asked, and on the way to answer it. If a chapter here feels thin on a subject you care about, listen to that subject's own overview next.`,

  chapters: {
    review: `The guide opens with a two hour review, thirteen blocks to read in order. If you only have thirty minutes, the guide suggests four blocks: how to answer well, what is current in React and Next.js, async workflows and reliability, and the system design framework.

The way to study each block matters. Read the heading, say your answer out loud before reading the points, and then read to check. Saying it is what makes it come out fluently later.

The first block is the answer formula, and it applies to every technical question. Lead with the direct answer: one sentence that would still be correct if they interrupted you. Then the mechanism: the sequence of inputs and outputs, named precisely. Then one concrete example. Then one trade off: what you give up, and what you would measure to decide. And then stop, and let the interviewer choose the follow up.

The same block asks you to prepare four stories in the STAR shape: your hardest technical problem, a conflict, a failure, and something you led.

The last block is the final five minutes. Pick three questions to ask them: what success looks like in the first ninety days, the biggest technical challenges the team faces now, how the team ships and handles incidents. And a checklist: real numbers written down for each story, only numbers you can reproduce, and the versions of the frameworks you will mention, checked.`,

    behavioral: `The engineering practice section has four questions, and they are about how you work.

How do you keep code quality up when a meaningful share of the code is written by AI? With the same layers that catch problems in human code, actually enforced, because AI code looks fluent and confident, and that makes a quick glance less reliable than usual. Static analysis first, as the cheapest check: types and a fast linter. Then tests that run in the pipeline. Then a human review that reads the whole diff.

How do you keep AI tools cost effective as a codebase grows? The lever people reach for last, a smaller model or a shorter prompt, matters less than one that comes before any prompt: how much of the codebase the AI must read to make a correct change. A modular codebase, with clear boundaries, means a typical change touches a handful of files, and the context fills with relevant code. A tangled component that owns styling, data fetching and unrelated concerns drags everything in with it.

What does a design system need beyond a component library? Three layers. Design tokens as the single source of truth. Accessible components built on a headless foundation, not hand rolled. And documentation with usage guidance.

And do you have questions for us? Yes, and tailor them to what the interviewer has already told you, so the questions show you were listening.`,

    js: `The JavaScript track has twenty six questions. These are the ones that come up again and again.

Closures: a function keeps access to the variables of the scope where it was created, by reference and not as a snapshot. They are used for privacy, factories, memoisation and hooks. The classic bug is var in a loop, which shares one variable. Let creates one per pass.

The event loop: run the synchronous code, then drain all microtasks, with next tick first in Node, then take one macrotask, and repeat. A long synchronous task blocks everything.

The promise combinators. All needs every input to succeed and fails fast. All settled reports every outcome. Race settles with the first to finish, which is how a timeout is built. Any resolves with the first success.

The keyword this is decided by how a function is called. Arrow functions take it from the surrounding scope.

Equality: use strict equality, and know where loose equality surprises people.

Copying: spread is shallow, and structured clone is deep.

Then the practical ones. Debounce against throttle, and how to cancel a stale request with an abort controller. Map against object, and map against weak map. How prototypes work. Event delegation. And the difference between ES modules and CommonJS, where the two points to remember are static structure, which enables tree shaking, and live bindings.

For each of these, the guide asks for one sentence that defines it, and one example of where it matters.`,

    ts: `The TypeScript track has fifteen questions.

It starts with why TypeScript at all: it catches a class of bugs before anything runs, makes refactoring safe, and documents the contracts between pieces of code.

The core distinctions. Unknown against any: both accept everything, and unknown makes you prove what a value is before using it. Type alias against interface: an interface for object shapes that may be extended, a type alias for unions and computed types. A union of string literals against an enum: the union is usually better, because an enum produces run time code.

Then generics, which let one function work over many types while remembering which one. A constraint limits what the type may be. And tying a key to its object gives you the exact type of that property.

Discriminated unions model states. Narrowing refines the type inside each branch. And an exhaustive switch, with a never check, stops compiling when a new state is added.

The utility types, Pick, Omit, Partial and Record, are worth naming with an example each.

And the point that comes up in every senior conversation. Types are erased at build time. A cast on parsed data is a promise to the compiler, not a check. Validate data at the boundary with a schema, and derive the type from the schema.

The track also covers typing React components: generic components, props as unions, and deriving prop types from native elements.`,

    react: `The React track is the largest, with sixty five questions, so here are the themes.

Rendering. A component renders again when its state changes, when its parent renders, or when a context it reads changes. Rendering is not the same as committing to the page. React compares, and applies only the changes. Keys tell React which list item is which. A changed key remounts a component and resets its state, which is a useful way to reset a form.

Effects are for synchronising with things outside React. List every value an effect reads, or you get a stale closure. The cleanup runs before the next run and on unmount, so abort requests and clear timers there.

State. Derive what you can during render. Keep state close to where it is used. Put server data in a server state library. Use context for values that rarely change.

Performance. Measure with the profiler first. Split code by route, virtualise long lists, and memoise only where a measurement says it helps.

React nineteen. Actions, with hooks for the action's state, the form's status and optimistic updates. The use function reads a promise or a context. A ref is an ordinary prop. And version nineteen point two added Activity, which hides interface while keeping its state, and the effect event hook.

Patterns. Compound components, controlled and uncontrolled inputs, error boundaries, and accessible components built on headless libraries.

And testing, by role and label, with the network mocked.`,

    nextjs: `The Next.js track has twenty seven questions, and the most important habit is to say which version you mean, because the defaults have changed.

Server and client components. Everything in the app directory is a server component by default: it can read data directly and ships no JavaScript. The use client directive marks interactive components. Keep that boundary low in the tree. A client component cannot import a server component, but it can receive one as children.

Rendering strategies. Static, regenerated, rendered per request, or rendered in the browser, chosen per route. In version sixteen, Cache Components let you make that choice per component, with the use cache directive.

Caching. There are four caches: request memoisation, the data cache, the full route cache and the router cache. In version fifteen, fetch stopped being cached by default. Invalidate by tag when data changes.

Request APIs. Since version fifteen, cookies, headers and route parameters are promises.

Mutations. Server actions are for changes from your own interface. Route handlers are public endpoints for webhooks and outside clients. And every server action must validate its input and check authorisation again, because it is a public endpoint.

The proxy file, which replaced middleware in version sixteen, is for redirects, rewrites and cheap checks.

And production. The image and font components, streaming with Suspense, environment variables that stay on the server unless they carry the public prefix, and self hosting with the standalone output.`,

    node: `The Node track has thirty eight questions.

The architecture. V8 runs JavaScript on one thread. Libuv provides the event loop and a thread pool, four threads by default, for file system work, name lookups, crypto and compression. Network input and output uses the operating system's own asynchronous mechanisms.

The event loop phases: timers, pending callbacks, poll, check and close. Next tick and promise microtasks run between callbacks.

The rule that follows. Do not block the loop. Send processor work to worker threads or a separate service. Avoid synchronous APIs on request paths. And scale out with more processes or containers, which must be stateless.

Streams process large data in chunks, and the pipeline function handles backpressure and errors.

Errors. Distinguish operational errors, which you handle, from programmer errors, which you log and restart from. Route everything through one central error handler. Unhandled rejections crash the process.

Graceful shutdown. On the termination signal, stop accepting connections, finish what is in flight, close the pools, and exit.

API design and security. Validate every input. Return consistent errors with a request id. Add security headers, rate limits and body size limits. Use parameterised queries. And put a timeout on every outbound call.

And the scaling questions: clustering, the cache stampede, data loaders for the N plus one problem, connection pool sizing, and when to use worker threads against child processes.`,

    db: `The databases track has sixteen questions.

SQL or NoSQL. Decide by access patterns, relationships and consistency, not by the fact that the input happens to be JSON. PostgreSQL is the default for relational data with rules that must hold, and its JSON columns cover flexible fields. A document or key value store fits data shaped as aggregates, very high write volume, or a specific access pattern.

Indexes. A B tree by default. Composite indexes follow the leftmost prefix rule, so put equality columns first and range columns after. Partial and covering indexes. And special index types for JSON documents and text search. Every index slows writes.

A slow query. Explain and analyse it, and compare estimated rows with actual rows. A big gap means stale statistics.

Transactions and isolation. What ACID means in practice, the lost update and how to prevent it, and which isolation level prevents which anomaly.

Scaling, in order: indexes and queries, read replicas with care for replication lag, caching, partitioning, and sharding last. Pool connections, especially from serverless functions.

Caching. Cache aside is the default. Plan invalidation, and defend against the stampede.

And the operational questions. Zero downtime schema changes with expand and contract. The N plus one problem and its fixes. Designing a document schema from its queries. And designing DynamoDB tables from access patterns.`,

    cloud: `The cloud and deployment track has thirteen questions.

The everyday services. A managed relational database, object storage for files, and a container service to run your application. For each, be ready to explain how it gets its secrets and its permissions.

Multi AZ protects against one data centre failing. Multi region protects against a whole region failing, and is used only when a regional outage is unacceptable.

The deployment workflow. Before merge: lint, type check, tests, security scans and review. After merge: build once, with the image tagged by the commit, deploy to staging, run a smoke test, promote that same artifact, monitor, and roll back quickly if needed. Use short lived credentials from the identity provider, not long lived keys stored in the pipeline.

Release strategies. Rolling is the default. Blue green gives an instant switch and rollback, at double the infrastructure. Canary sends a small share first, with automated checks. And feature flags separate deploying from releasing.

Observability. Logs, metrics and traces, and how telemetry gets from your code to a platform: instrumentation generates it, an exporter or collector sends it, and the platform stores and queries it.

A content delivery network caches near users, and dynamic content is harder to cache because it varies by user.

And the scenarios: a reference architecture, scaling to about a hundred thousand users, and reducing Lambda cold starts.`,

    coding: `The coding track has thirty exercises. The patterns behind them are covered in the Coding Practice overview, so here is the short version.

For arrays and strings, learn the trigger for each technique. A map for finding a complement in one pass. A stack for matching brackets. Sorting first for merging intervals. A sliding window for the longest substring without repeats. Two passes, from the left and the right, for the product of everything except the current element. Binary search when the input, or the answer, is monotonic.

For implementations, know what each must guarantee. Promise all keeps results in input order and rejects on the first failure. An error thrown in a then callback rejects the promise that then returned. The callback hook memoises a function's identity, not a value. A least recently used cache needs a hash map and a doubly linked list. And dynamic programming starts by defining the state in one sentence.

For React exercises, each one checks a habit. Live search derives the filtered list instead of storing it. A data table handles loading, error and empty states. A progress bar cleans up its interval. Tic tac toe keeps history and derives everything else. A modal traps and returns focus. Tabs use a roving tab index. A todo list uses stable ids and reads storage lazily.

And for plain JavaScript: change the data first, then render from it.`,

    arch: `The architecture and reliability track has twenty three questions, and the guide suggests anchoring every answer in one concrete async job: a long running import, document processing, or a slow third party integration.

The shape is this. The API answers at once with an accepted status and a job id. A job row in the database is the source of truth. A queue carries the work to a worker. The job records its state at each stage. And server sent events push progress to the browser.

Queue against publish and subscribe. A queue gives each message to one consumer, which distributes work. Publish and subscribe fans each message out to every subscriber. RabbitMQ can do both through exchanges. Kafka is a log you can replay.

Delivery in realistic systems is at least once, so consumers must be idempotent, using the job id, a check of the current state, or a unique constraint.

Retries are bounded, with backoff and jitter, and messages that keep failing go to a dead letter queue.

The resilience patterns, applied in order on every outbound call: a timeout, a retry, a circuit breaker and a bulkhead.

Then the vocabulary. Service level indicators, objectives and agreements, and the error budget. Rate limiting algorithms. An API gateway against a service mesh. Feature flags for safe rollouts. And agreeing an API contract before the backend exists.`,

    security: `The security track has thirteen questions.

Authentication against authorisation: who you are, against what you may do. Authenticate at the edge, at the gateway or the backend for frontend. Authorise inside the service, for every operation and every resource.

OAuth delegates access with access tokens. OpenID Connect adds identity with an ID token. Browser and mobile apps use the authorisation code flow with PKCE. And passkeys are the modern login that resists phishing.

Tokens against sessions. Tokens are stateless and hard to revoke, so keep them short lived, with a refresh token that can be revoked. Verify the signature, the expiry, the issuer and the audience, with a fixed algorithm. In browsers, store them in cookies that are HttpOnly, Secure and SameSite.

Cross site request forgery is prevented with the SameSite attribute, backed by a token or an origin check.

Symmetric encryption uses one shared key and is fast, for data at rest. Asymmetric encryption uses a key pair, for signatures and for exchanging keys.

Injection is prevented with parameterised queries. Secrets live in a secrets manager and are rotated. Server side request forgery is defended by allowlisting where your server may fetch from. Passwords are stored with a slow, memory hard hash, such as Argon2id.

And the OWASP top ten: do not recite it. Pick the risks that fit the system in front of you, and say how you address each.`,

    web: `The web platform track has fifteen questions. It matches the Web Platform guide, which has its own overview, so here are the headlines.

Security in the browser. CORS lets a server opt in to reads from other origins, and a preflight request asks permission first. A content security policy limits which scripts may run, which reduces the damage of injected script. Cookies that hold a session should be HttpOnly, Secure and SameSite. And the sentence to remember: the same origin policy and CORS are about reading, cross site request forgery is about causing actions.

The network. What happens when you type an address and press Enter. What changed between versions one, two and three of HTTP. How caching works with lifetimes, validators and stale while revalidate. And which status codes an API should return, with an idempotency key for safe retries.

Offline and storage. The service worker and its life cycle, and the choice between cookies, local storage, session storage, IndexedDB and the cache API. None of them is safe for secrets.

Delivery. Docker images, layers and multi stage builds. A pipeline and the rollout strategies. Feature flags without letting them pile up. Merge against rebase. And internationalisation: message catalogues, no glued fragments, and the platform's own formatting for dates, numbers and plurals.`,

    css: `The CSS track has twenty nine questions.

The fundamentals come first, because interviewers use them to check whether you understand what a utility class is doing. The box model, and the difference between content box and border box. Specificity, in order: inline styles, ids, classes, elements. The cascade, and cascade layers. Rem against em. Custom properties against preprocessor variables.

Layout. Flexbox is one dimensional and driven by content. Grid is two dimensional and driven by the layout. Positioning: static, relative, absolute, fixed and sticky. Stacking contexts, and why a huge z index sometimes does nothing.

Responsive design. Mobile first, with breakpoints that apply from a size upwards. Container queries, which respond to the size of a component's container. And fluid sizes with clamp.

Animation. Animate transform and opacity, which the compositor handles, not width or height, which trigger layout. Respect the user's reduced motion setting.

Tailwind. Utility first, with only the classes you use emitted. Version four is configured in CSS, with tokens in a theme block. Write class names out in full, because the scanner never runs your code. Prefer extracting components to using apply. Dark mode can follow the system, or a class you toggle. And use helpers to build conditional class lists and resolve conflicts.

And accessibility runs through all of it: visible focus, sufficient contrast, and never colour alone to carry meaning.`,

    testing: `The testing track has thirteen questions.

The strategy is the Testing Trophy: static analysis as the base, some unit tests, mostly integration tests, and a few end to end tests on the critical paths. Integration tests give the most confidence for their cost.

With React Testing Library, query by role and label first. Prefer user event to fire event, because it simulates the full sequence of a real interaction. Use find queries for elements that appear asynchronously, and query to assert that something is absent. And mock the network with Mock Service Worker, so your real request code runs.

Flaky tests come from fixed sleeps, shared data, real timers and state that leaks between tests. Fix the cause, and quarantine a test while you do.

On the backend, write integration tests against a real database running in a container, and contract tests where services meet.

Know the test doubles: a stub returns fixed values, a spy records calls, and a mock carries expectations.

Know where test driven development pays off: logic with clear inputs and outputs.

And know when snapshot tests help, for small, stable output, and when they hurt, for large trees that nobody reads.

In an interview, the strongest testing answer is a strategy, not a tool. Say what you would test at each level for the feature in front of you, why, and what you would deliberately not test.`,

    sysdesign: `The system design track has thirty questions. It shares most of its material with the System Design guide, which has its own overview.

The vocabulary to be fluent in. Monolith against microservices, and migrating with the strangler fig pattern. Bounded contexts for drawing service boundaries. Scaling up against scaling out. The CAP theorem. REST, gRPC and GraphQL, and when each fits. Kafka against a traditional broker.

The patterns for data across services. A saga replaces a distributed transaction with local steps and compensating actions. The transactional outbox solves the dual write problem. CQRS separates writes from reads. Hexagonal architecture keeps the domain independent of technology.

The operational pieces. Liveness against readiness checks. Layer four against layer seven load balancing. Service discovery in an environment that scales automatically. Kubernetes building blocks, and how the autoscaler decides when to scale.

The lessons from real outages: how tight coupling and hidden dependencies turn a small cause into a long incident.

And the classic designs: a rate limiter, a link shortener, a notification system, a news feed, real time collaborative editing, and a member portal for millions of users. Plus three building blocks to explain: consistent hashing, leader election, and the Bloom filter.

For every design, start with requirements and numbers, and finish with trade offs.`,

    sdscale: `The system design at scale track has fourteen questions, and they form one answer to one prompt: design a full stack application for millions of users. The structure matters more than the boxes.

Pace it for thirty to forty five minutes. About five minutes on requirements: two or three core flows, the number of users, the read and write ratio, latency and availability targets, consistency needs and compliance.

Then the estimate. Requests per second equals daily active users, times requests per user per day, divided by eighty six thousand four hundred, times three to five for the peak. Add storage per day. The result decides whether you need caching, replicas or sharding.

Then the API and the data model: the main endpoints, the entities, and which store owns what.

Then the high level design, drawn left to right: client, content delivery network, gateway or load balancer, stateless services, cache, database, and queues with workers.

Then go deep where it matters: authentication, the data layer, caching, async work, deployment, reliability and security.

And finish with the trade offs, the cost, how you would test it, and what you would build for a first version against what must be designed in from day one. Defer read replicas, sharding and multiple regions. Design in authorisation, idempotent writes, structured logs and backwards compatible migrations.`,

    perf: `The final track is performance optimisation, with eighteen questions. It matches the Performance guide, which has its own overview.

The loop: measure, find the biggest bottleneck, fix one thing, verify with the same metric, and repeat. Never optimise on intuition. And prevent regressions with budgets checked in the pipeline.

The latency numbers. Memory is about a hundred nanoseconds. Redis or a disk read is about a millisecond. A round trip within one region is one to two milliseconds. A round trip between continents is a hundred to a hundred and fifty milliseconds. Those gaps explain why caching works, and why you put content close to users.

Then the levers, layer by layer. In the browser: the Core Web Vitals, shipping less JavaScript, optimised images, and a free main thread. At the edge: long lived immutable assets and stale while revalidate. At the API: rate limiting and avoiding N plus one calls. On the server: keeping the event loop free and staying stateless. In the cache: choosing the right layer, and planning invalidation. In the database: the query plan, indexes, pooling and replicas. In the queues: batching and concurrency.

And to find the real bottleneck in a system of many services: the golden signals tell you which service, and a trace tells you why.

That is the guide. Start with the two hour review, and say every answer out loud.`,
  },
};
