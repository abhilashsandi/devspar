// Audio overview of the Crash Course. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the Crash Course. It is the guide for the last day before an interview, or the drive there. Each section is a short refresher of one subject: the ideas and the one line answers you are most likely to need.

Because it covers every subject, it goes fast. If a chapter leaves you unsure, that is useful information. It tells you which full guide to open when you are back at a desk.

There are seventeen chapters: a start here note, then JavaScript, TypeScript, React, Next.js, Node, CSS and Tailwind, the web platform and security, testing, databases, the system design method, architecture and reliability, design at scale, performance, generative AI, AWS, and behavioural questions.`,

  chapters: {
    start: `The first chapter is how to use this crash course.

Each section of the guide is a refresher of five to twelve minutes on one stream. It holds the ideas, the code and the one liners you are most likely to need. It is not where you learn a subject for the first time. It is where you bring back what you already know, so that it is at the front of your mind when the question comes.

So use it in a particular way. Go through the sections for the role you are interviewing for first. A frontend role means JavaScript, TypeScript, React, Next.js, CSS and the web platform. A full stack role adds Node, databases and system design. Then the sections you feel weakest in. Leave the ones you use every day until last, or skip them.

As you go, do one thing actively. When a chapter states a rule, try to say the example or the reason before I give it. Recall is what makes this stick. Passive listening feels productive and fades by the afternoon.

Every section in the guide ends with links to go deeper: the full guide on that subject, the labs and the cheatsheet. If a chapter here surprises you, follow that link later.

And a word about time. The whole written course is about two and a half hours of reading. This audio version is shorter, because it leaves out the code. Listen to the chapters you need, and stop when you have had enough.`,

    js: `JavaScript in a few minutes.

Scope. Var is function scoped, and reads as undefined before its line. Let and const are block scoped, and cannot be touched before their line. A closure is a function that remembers the variables of the scope where it was created.

This. It is decided by how a function is called, not where it is written. Check in order: called with new, it is the new object. Called with call, apply or bind, it is what you passed. Called as a method, it is the object before the dot. Otherwise it is undefined in strict mode. Arrow functions take this from the surrounding scope.

The event loop. JavaScript runs one call stack. When it empties, the loop drains every microtask, meaning promise callbacks and code after an await. Then it takes one macrotask, such as a timer. So a promise callback always beats a timer of zero.

Promises. An async function always returns a promise, and a throw inside becomes a rejection. Use try and catch around an await. Run independent work together, not one after another.

Types and copying. Primitives are copied by value, and objects by reference. Spread makes a shallow copy. Structured clone makes a deep one. Use strict equality.

And the two functions to be able to write from memory. Debounce waits until calls stop for a set time, which suits a search box. Throttle runs at most once per interval, which suits scrolling and resizing.`,

    ts: `TypeScript in a few minutes.

The mental model first. Types are erased. TypeScript checks at build time and emits plain JavaScript, and nothing validates data at run time. So data from outside, such as an API response, needs a run time check with a schema. And typing is structural: two types are compatible when their shapes match, whatever they are called.

Unions and narrowing. Model the states of something as a discriminated union: each state has a shared field with a different literal value. Then let control flow narrow it. Inside each branch, the compiler knows which state you have. A never check in the default branch makes the compiler list every place you forgot when a new state is added.

Generics let a function work over many types while remembering which one. The utility types are worth knowing by name: Partial makes every property optional, Pick keeps some keys, Omit removes some, and Record builds a dictionary. Mapped and conditional types are what they are built from.

The patterns interviewers like. Type alias or interface: an interface for object shapes that may be extended, and a type alias for unions, tuples and computed types. Unknown over any: unknown accepts everything, and makes you prove what it is before you use it. Marking a value as const keeps its literal types. The satisfies keyword checks a value against a type without widening it. And avoid the non null assertion and casts, which silence the compiler without making the code safe.`,

    react: `React in a few minutes.

How rendering works. A render is triggered by the first mount, a state update, a parent rendering, or a context value changing. React calls your components to get a description of the screen, compares it with the previous one, and commits only the differences to the page. Rendering is not the same as updating the page.

Hooks. The rules: call them at the top level of a component or a custom hook, never inside conditions or loops, because React identifies them by their order. State is a snapshot for each render. An effect synchronises with something outside React, and returns a cleanup.

Where should state live? Derive, do not store: anything you can compute from props or state is computed during render, not copied with an effect. Keep state as close as possible to where it is used, and lift it only as far as the nearest common parent. Server data belongs in a server state library, not in a global store.

Performance. Measure first with the profiler. Move state down, or pass children through, before reaching for memo. Virtualise long lists, and split code by route.

React nineteen. Actions let you pass an async function to a form, and React tracks the pending state and errors. There are hooks for the action's state, for the form's status and for optimistic updates. A ref is an ordinary prop.

Patterns and testing. Prefer composition to configuration: children and compound components in place of a dozen boolean props. Test the way a user uses the screen, finding elements by role and label.`,

    next: `Next.js in a few minutes.

Rendering strategies. Pick one per route. Static when the content is the same for everyone. Regenerated in the background when it changes now and then. Rendered per request when it depends on the user or must be fresh. With Cache Components in version sixteen, you can make that choice per component.

Server and client components. Everything in the app directory is a server component by default. It can be async, it can read the database directly, and it ships no JavaScript. The use client directive marks a component that needs state, effects or browser APIs. Push that boundary as low in the tree as you can. A client component cannot import a server component, but it can receive one as children.

Data. Fetch in parallel, and stream the slow parts with Suspense, to avoid a waterfall. Know that caching defaults have changed between versions, so say which version you mean. Mutations go through server actions, which must always validate their input and check authorisation again, because a server action is a public endpoint.

Routing files. Page is the screen. Layout wraps it and persists. Loading is the fallback. Error catches failures. And in version sixteen, the proxy file replaces middleware.

Performance and production. The image component handles sizing, lazy loading and modern formats. The font module hosts fonts on your own site, with no layout shift. Keep client components small. Variables with the public prefix are sent to the browser, so secrets never have it.`,

    node: `Node in a few minutes.

Architecture. Node is the V8 engine plus a library called libuv. One JavaScript thread runs your code. Libuv does non blocking network input and output through the operating system, and uses a small thread pool for file work and some crypto. The rule that follows: never block the event loop with synchronous or processor heavy work, because every other request waits.

Streams. They process data in chunks, so memory stays flat however large the file. Readable, writable, duplex and transform. Backpressure means the destination tells the source to slow down. Connect streams with the pipeline function, which handles errors and cleanup.

Errors and shutdown. Operational errors, such as timeouts and bad input, are expected: handle them and return a proper status. Programmer errors are bugs: log, and restart. On a termination signal, stop accepting new connections, finish the requests in flight, close the database pool, and exit, with a timer as a backstop.

Scaling and processor work. One process uses one core. Scale across cores with the cluster module or several containers, and keep the process stateless. Send heavy computation to worker threads or a queue.

And the production checklist for an API. Validate every input and return consistent errors. Set limits on body size. Add security headers and rate limiting. Use parameterised queries. Put a timeout on every outbound call. Log in a structured form with a request id. And expose health checks.`,

    css: `CSS and Tailwind in a few minutes.

The box model. Content, padding, border, margin. With border box, the width you set includes padding and border, so set it globally.

The cascade decides which rule wins, in this order: where the style comes from and whether it is marked important, then cascade layers, then specificity, then source order. For specificity, ids beat classes, and classes beat elements. Keep it low and flat.

Flexbox against Grid. Say it like this: Flex for a row or column of items that size to their content, and Grid when I am laying out rows and columns together. They combine well: a grid of cards, where each card is a flex column.

Positioning. Relative offsets an element from itself, and anchors its absolutely positioned children. Absolute places an element against its nearest positioned ancestor. Fixed places it against the viewport. Sticky sticks within its scrolling container, and needs an offset. A z index only competes inside its stacking context, which is why a huge number sometimes does nothing.

Responsive design is mobile first: base styles for the small screen, and breakpoints that add on the way up. Container queries let a component respond to its own container.

Tailwind version four. It is utility first: you compose styles in the markup, and the compiler emits only the classes you use. Configuration now lives in CSS, with a single import and a theme block of variables. Remember that class names must appear whole in your source, because the scanner does not run your code.`,

    web: `The web platform and security in a few minutes.

What happens when you type an address. The name is resolved, through the browser, the operating system and a resolver, to an address. A connection is opened and encrypted. The newest protocol combines those handshakes. The request goes out, the response comes back, and the browser parses the markup, builds the page, lays it out and paints.

Caching. No cache means store it but revalidate every time. No store means never store it. Max age applies to the browser, and the shared variant applies to caches such as a content delivery network. Give hashed assets a long life, and keep pages short or revalidated.

Origins. Same origin means the same scheme, host and port. CORS lets a server opt in to reads from other origins, and the browser enforces it. Cross site request forgery makes a logged in browser send a request the user did not intend. The main defence is the SameSite cookie attribute, backed by a token. Session cookies should be HttpOnly and Secure.

Authentication. OAuth delegates authorisation, and OpenID Connect adds identity. Browser and mobile apps use the authorisation code flow with PKCE. A session is simple to revoke. A token is simple to verify anywhere.

Security. Say it like this: authentication proves who you are. Authorisation decides what you may do, and it must be checked on the server for every request. Then the usual risks and their defences: broken access control, injection, cross site scripting, and vulnerable dependencies. Validate input, escape output, use parameters in queries, and keep dependencies current.`,

    test: `Testing in a few minutes.

The strategy is the testing trophy, four levels with most of the weight in the middle.

Static checks are the base. TypeScript and a linter catch whole classes of bug for free, before anything runs.

Unit tests cover pure logic: reducers, utilities, validators. They are fast, and they are the right place for many edge cases.

Integration tests are where most of your confidence should come from. Render a component with its children, its state and its data fetching, interact with it as a user would, and assert on what the user sees.

End to end tests drive the real application in a real browser. Keep a small number, for the journeys that must never break, such as signing in and checking out.

The principles. Test behaviour, not implementation: a refactor that does not change behaviour should not break a test. Find elements the way a user would, by role and label. And remember that coverage tells you which lines ran, not whether they were checked.

The tools. Mock at the network boundary with Mock Service Worker, in place of mocking your own modules, so your real request code runs. In Playwright, locators wait automatically, so never write a fixed sleep, and turn on traces to debug failures in the pipeline. For asynchronous screens, use the queries that wait for an element to appear.

And flaky tests. Find the cause, which is usually timing, shared state or a real network call. Do not paper over it with retries.`,

    db: `Databases in a few minutes.

SQL or NoSQL. Say it like this: I start with PostgreSQL unless the access pattern clearly needs something else. It covers relational data, documents and full text search. Choose a key value or document store for huge scale with simple lookups by key, where you design from the queries.

Indexes. A B tree index makes lookups fast, and supports ranges and sorting. Every index slows writes and costs space. In a composite index the column order matters: it can serve queries on the leftmost columns. A covering index answers a query without touching the table. And you check with the query plan, never by guessing.

Transactions. ACID stands for atomic, all or nothing. Consistent, the constraints hold. Isolated, concurrent transactions do not see each other's unfinished work. Durable, a commit survives a crash. Isolation comes in levels, and the default in PostgreSQL is read committed. The classic bug is the lost update, fixed by doing the change in one statement or locking the row.

Scaling. Read replicas take the reads, and bring replication lag, so read your own writes from the primary. Connection pooling protects the database from too many connections. Partitioning splits a large table. Sharding spreads data across databases, and is the last resort.

CAP. During a network partition, you choose consistency, which means refusing some requests, or availability, which means serving data that may be stale. Decide per feature. Money wants consistency. A feed can be eventually consistent.

And the N plus one problem: one query for a list, then one per item. Fix it with a join or a batched query.`,

    sd: `The system design method in a few minutes.

The forty five minute script. Spend the first five minutes on requirements: what it does, who uses it, how many of them, and what matters most, such as latency, consistency or availability. Then a rough estimate. Then the interface and the data model. Then a high level diagram. Then go deep on the two or three hardest parts. And finish with bottlenecks, failures and what you would do next. The sentence to remember: every choice is a trade off. Name what you gain, what you give up, and when you would revisit it.

Numbers. Estimate only what changes the design: whether it fits on one machine, whether it needs a cache, whether it needs sharding, whether it needs a content delivery network. A day has about a hundred thousand seconds, so a million requests a day is about twelve per second.

The building blocks. A load balancer spreads traffic. A content delivery network serves static content from the edge. A cache absorbs reads. A queue absorbs bursts and decouples services. A relational database is the default store, with replicas for reads. Object storage holds files. And a search index handles text queries.

The classic designs, in one line each. A link shortener: generate a short key, store the mapping, and cache the redirects heavily. A rate limiter: a token bucket per client, in a shared store. A news feed: precompute feeds for most users, and merge at read time for accounts with huge followings. A chat system: persistent connections, with a way to route a message to the right server. A file upload service: presigned addresses, straight to object storage.`,

    arch: `Architecture and reliability in a few minutes.

Timeouts, retries and idempotency. Every network call has a timeout. Without one, threads and sockets pile up during an outage. Retry only transient failures, with exponential backoff and jitter, and with a limit. And retries are only safe when the operation is idempotent, so give write requests an idempotency key.

Circuit breakers, bulkheads and fallbacks. A circuit breaker fails fast after a number of failures, waits for a cool down, then lets a few test requests through. That state is called half open. A bulkhead gives each dependency its own limited pool, so one slow service cannot drain everything. A fallback returns something useful, such as a cached value or a reduced feature.

Messaging. Delivery is at least once in practice, so consumers must be idempotent, removing duplicates by message id. Ordering is only guaranteed within a partition or a key. Messages that keep failing go to a dead letter queue. And the outbox pattern publishes an event reliably together with a database change.

Distributed transactions. A saga is a sequence of local transactions. On failure, you run compensating actions in reverse: refund the payment, release the stock.

Architecture styles. Start with a modular monolith. Move to microservices when teams need to deploy independently, or parts need to scale differently. Event driven design decouples services, at the cost of eventual consistency.

Deploys and observability. Blue green switches all traffic to a new stack, with instant rollback. Canary goes from one percent to ten to a hundred, with automatic rollback on errors. Then logs, metrics and traces, with alerts tied to service level objectives.`,

    scale: `System design at scale in a few minutes. The prompt is: design an application for millions of users.

The full picture, from the outside in. At the edge, the name service routes by latency and checks health. Then a content delivery network with a web application firewall, serving static assets from object storage. At the entry, a load balancer or an API gateway, which authenticates and rate limits. Behind that, stateless application services that scale horizontally. Then the data: a cache, a primary database with read replicas, and object storage for files. And off to the side, queues and workers for everything that can happen later.

What changes at each ten times growth. At first, one server and one database is fine. Then you separate the database, add a cache and a content delivery network. Then you add a load balancer, several stateless servers and read replicas. Then queues, and services split out where they need to scale independently. Then partitioning or sharding, and more than one region. The skill is in not jumping ahead.

The resilience map. Protect the entrance with a firewall, rate limits and authentication at the gateway. Contain failure with timeouts, circuit breakers and bulkheads. Absorb bursts with queues and autoscaling. And degrade gracefully, serving a reduced page in place of an error.

Multiple regions and disaster recovery. The data is the hard part. Asynchronous replication between regions means a small amount of possible data loss. Writes that are active in two regions at once need conflict resolution. Know the two numbers: recovery time, how long until you are back, and recovery point, how much data you can lose. And choose a strategy that matches what the business will pay for.`,

    perf: `Performance in a few minutes.

The method. Measure, with real user data and with laboratory tools such as profilers. Define the target as a number: latency at the ninety fifth percentile, the largest paint, throughput. Find the biggest bottleneck. Fix that one thing. Measure again. And add a budget to the pipeline so it does not regress.

The frontend, and the Core Web Vitals. Largest contentful paint measures loading. Interaction to next paint measures responsiveness. Cumulative layout shift measures stability. To improve them: ship less JavaScript, by splitting code, removing unused dependencies and using server components. Lazy load images below the visible area, and give the main image priority. Serve images at the right size in a modern format. Reserve space for images and late content, so the layout does not jump. Break up long tasks so the main thread can respond to input. And virtualise long lists.

The backend and the database. Cache at every layer: browser, content delivery network, gateway, Redis, database. The fastest request is one that never reaches the origin. Kill N plus one queries. Add the right indexes, and check the query plan. Pool connections. Run independent calls together. Move slow work to a queue. Compress responses, and paginate.

And the mindset. Averages hide problems, so look at percentiles. A fix that is not measured is a guess. And the largest gains usually come from doing less: fewer bytes, fewer requests and fewer queries, not from making the same work slightly faster.`,

    ai: `Generative AI in a few minutes.

How a model works, enough for an interview. A transformer predicts the next token, which is roughly three quarters of a word, given all the previous tokens. Generation repeats that, one token at a time. The context window is how much it can see at once. Temperature controls how varied the output is. And it can produce confident, wrong text, because it is predicting what is plausible, not checking facts.

Retrieval augmented generation. To ingest: load the documents, split them into chunks of a few hundred tokens with some overlap, respecting headings, embed each chunk and store the vectors. To answer: embed the question, find the nearest chunks, put them in the prompt, and ask the model to answer only from them, with citations. Improve it with hybrid search and reranking.

Tool calling. You describe functions with a schema. The model replies with a tool name and arguments. Your code validates and runs it, and returns the result. An agent is that loop repeated, with the model choosing the next step. The Model Context Protocol is a standard way to connect tools.

Streaming to React. Stream tokens from your own server route, so the first words appear in about a second. The provider's key stays on the server. Let the user stop the response.

Safety, evaluation and production. Say it like this: I treat the model as an unreliable, expensive dependency. I validate its output, bound what it can do, measure quality with a test set, and watch cost and latency. Treat retrieved text as data, never as instructions.`,

    aws: `AWS in a few minutes.

Global infrastructure and identity. A Region is a geographic area, chosen for latency, data residency, available services and price. An Availability Zone is one or more data centres within it, so run in at least two. For identity: roles, not long lived keys. Least privilege. And an explicit deny always wins.

Compute. Containers on Fargate are a good default for a web API. Lambda suits event driven and spiky work, and its gotchas are cold starts, concurrency limits and a maximum run time. Virtual machines give full control and full responsibility.

Networking. A public subnet has a route to an internet gateway. A private subnet has no inbound access from the internet, and reaches out through a NAT gateway. An application load balancer routes HTTP by path and host. A network load balancer handles raw connections and offers fixed addresses. The name service routes by latency or for failover, and the content delivery network caches at the edge.

Storage and databases. Object storage for files, uploaded directly with presigned addresses. A managed relational database, with a standby for availability and replicas for reads. DynamoDB is designed from access patterns: decide the queries first, then the keys, and avoid a hot partition key.

Messaging. A topic fanning out to queues: publish once, and each consumer has its own queue, so a slow consumer never affects the others.

Security and operations. Encrypt at rest with managed keys, and in transit. Keep secrets in a secrets service. Use metrics, logs and traces, and an audit trail of API calls.

And the reference sentence: for a typical web app, a content delivery network with object storage for the frontend, a load balancer with containers for the API, and a managed database across zones.`,

    soft: `Behavioural questions and engineering practice, in a few minutes.

Stories that land. Answer with STAR: situation, task, action, result. Sixty to ninety seconds each, with your own actions and a real result. Spend most of the time on the action, and say I, not we. Prepare about five stories that you can turn to different questions: a hard technical problem, a conflict or disagreement, a failure and what you learned, a time you led or influenced without authority, and a time you delivered under pressure. End each one with a number if you have it, and with what you would do differently.

A few traps. Do not blame other people. Do not pick a failure that was not really yours, or a weakness that is a strength in disguise. And stop when the result is told. Let them ask.

Engineering practice. On code review: correctness and design first, then readability. Be kind and specific, and automate style with a linter so that people do not argue about it. On estimates: break the work down, give a range, state your assumptions, and update the estimate as you learn. On technical debt: record it, attach it to its cost, and pay it down next to feature work. On incidents: stop the damage first, then find the cause, then hold a review without blame that produces actions.

And have questions ready for them. What does success look like in the first six months? How does the team decide what to build? How do you ship: how often, and with what safety net? And what is the hardest problem the team has right now?

That is the crash course. Good luck. Take a breath before you walk in.`,
  },
};
