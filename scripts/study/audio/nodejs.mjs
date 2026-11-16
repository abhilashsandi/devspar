// Audio overview of the Node.js guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the Node.js guide. Node has one idea at its centre, and nearly every interview question is a consequence of it. Your JavaScript runs on a single thread, and it must never wait. Slow work is handed to the system, and a loop calls you back when the work is done.

From that one idea come the questions about the event loop, streams, blocking code, clustering, worker threads and graceful shutdown.

The guide has sixteen sections, so the chapters here are short. They run from architecture and the event loop, through async patterns, streams, memory, errors, security, scaling and databases, to workers, testing, frameworks, microservices, modules, built in features, and a deep dive into production problems.`,

  chapters: {
    s1: `Section one is the overview and architecture.

Node is a JavaScript runtime built on the V8 engine, with a non blocking, event driven design made for network applications that handle many connections at once.

The guide opens with a good question: when would you not use Node? For heavy computation. Video encoding, image processing, large numerical work. Anything that keeps the processor busy for a long time blocks the single thread, and every other request waits. Node is excellent when the work is mostly waiting on input and output, and poor when the work is mostly calculating.

Two pieces make up the runtime. V8 parses and runs your JavaScript. Libuv is a library written in C that provides the event loop and asynchronous input and output for files and the network. It also manages a small pool of threads for work the operating system cannot do asynchronously, such as some file operations and hashing.

V8 collects garbage by generation. Most objects die young, so new objects live in a small area that is collected often and quickly. Objects that survive are moved to the old area, which is collected less often with a more thorough method.

And the other runtimes. Node has the mature ecosystem and the long track record. Deno was designed around security, with permissions and TypeScript built in. Bun is built for speed, and bundles a package manager and test runner. For most production work, Node is still the safe default.`,

    s2: `Section two is the event loop, the centre of the guide.

The loop has six phases, and it runs them in order. Timers, where callbacks from timeouts and intervals run. Pending callbacks, for some deferred system operations. An internal idle and prepare phase. Poll, where the loop collects new input and output events and runs their callbacks. This is where the loop waits when there is nothing else to do. Check, where callbacks scheduled with set immediate run. And close callbacks, such as a socket closing.

Between phases, the microtask queue is drained. And within the microtasks there is an order: callbacks scheduled with next tick run before promise callbacks. That is a quiz answer: next tick has the higher priority.

So the order for the classic puzzle is: synchronous code first, then next tick callbacks, then promise callbacks, then timers, then set immediate.

One more quiz fact. A timer of zero against set immediate is unpredictable when both are called from the main module. But inside an input and output callback, set immediate always fires first, because the check phase comes straight after poll.

Starvation happens when something monopolises the loop. A recursive next tick keeps the microtask queue from ever emptying. A tight synchronous loop has the same effect. Either way, no callbacks for input and output can run. To prevent it, break long work into pieces and yield between them with set immediate, or move the work to a worker thread.`,

    s3: `Section three is async patterns and error handling.

Callbacks, promises and async await all handle asynchronous work, with different ergonomics. Callbacks are the original style, where the first argument is the error. They nest quickly and make error handling repetitive. Promises give you chaining and a single place to catch errors. Async await is written on top of promises, and reads like synchronous code. Use async await for new code. You still need to understand promises, because that is what it is underneath, and you will still meet callbacks in older APIs and in event emitters.

The four promise combinators differ in how they treat failure, and choosing the wrong one can lose data silently or fail when it need not. All resolves when everything succeeds, and rejects as soon as one fails. All settled waits for everything and never rejects. It gives you an array with a status of fulfilled or rejected for each promise. That is the right choice when partial success is acceptable, such as sending a batch of notifications. Race settles with whichever finishes first, success or failure, which is how a timeout is built. Any resolves with the first success and only rejects if all of them fail.

Unhandled promise rejections crash the process in recent versions of Node. So always handle rejections. Also set up process level handlers for unhandled rejections and uncaught exceptions. Their job is to log the error and shut down cleanly, not to carry on as if nothing happened. After an uncaught exception, the process is in an unknown state, and restarting is the safe move.`,

    s4: `Section four is streams and buffers.

A stream processes data in pieces as it arrives, instead of loading the whole thing into memory. That is the difference between a server that can send a file of several gigabytes using a few megabytes of memory, and one that falls over.

There are four kinds. Readable streams produce data. Writable streams consume it. Duplex streams do both. Transform streams change data as it flows through, which makes them ideal for parsing, compression and encryption.

Backpressure is the key concept. It occurs when a readable stream produces data faster than the writable stream can consume it. If nothing is done, the unwritten chunks pile up in memory, and memory grows without limit. That is the quiz answer. The stream API handles it for you if you let it: the write call tells you when the buffer is full, the source pauses, and it resumes when the destination signals that it has drained.

You rarely do that by hand, because you connect streams with the pipeline function. And always use pipeline in place of the older pipe method. Pipeline handles errors and cleanup automatically. If the client disconnects, or any stage fails, every stream in the chain is destroyed. With pipe, an error in one stream leaves the others open, and that leaks file handles and memory.

A custom transform stream is small to write. You receive a chunk, do your work, and push the result on.`,

    s5: `Section five is memory management and profiling.

Start with the quickest tool, the memory usage call on the process. It reports several numbers. The resident set size is the total memory the process holds. Heap total is what V8 has reserved for JavaScript objects, and heap used is how much of that is actually in use. External is memory used by objects outside the V8 heap but tied to JavaScript, such as buffers.

A healthy process has a sawtooth pattern. Memory climbs, the garbage collector runs, and it drops back to about the same floor. A leak shows up as a floor that keeps rising. After each collection, memory never fully returns to where it was.

Finding a leak follows a routine. First detect it, by monitoring memory over time under real traffic. Then take heap snapshots at intervals and compare them, looking for the kinds of object whose count keeps growing. Then follow what is holding on to those objects.

The usual causes are worth knowing by heart. A cache with no size limit and no expiry, often just a plain object or a map at module level. Event listeners added on every request and never removed. Timers that are never cleared. And closures that keep a large object alive longer than anyone intended.

The fixes match the causes. Give every cache a maximum size and an expiry. Remove listeners. Clear timers. And for data attached to objects you do not own, use a weak map, so the entry goes when the object does.`,

    s6: `Section six is error handling and graceful shutdown.

Every Express app needs one central error handler. All errors should flow to a single piece of middleware, registered last, which logs the error and sends a consistent response. Route handlers do not format error responses themselves. They pass the error on.

The distinction that interviewers listen for is between operational errors and programmer errors. An operational error is expected in normal running: invalid input, a record that is not found, a service that timed out. You handle it and respond with the right status. A programmer error is a bug, such as reading a property of undefined. You cannot handle it sensibly. Log it, return a generic error, never leak the internal message to the client, and let the process restart if its state is in doubt.

Graceful shutdown matters on every deploy. When the platform wants to stop your container, it sends a termination signal. A naive service dies at once, and drops every request it was in the middle of. A production service does four things in order. It stops accepting new connections. It lets the requests already in flight finish. It closes its resources: database pools, queue connections, and so on. Then it exits. And it sets a timer, so that if this takes too long, it exits anyway before the platform kills it by force.

Pair that with health checks. As soon as shutdown begins, the readiness check should fail, so the load balancer stops sending new traffic.`,

    s7: `Section seven is API security.

The principle is defence in depth, several layers, and being able to list them from memory impresses interviewers. Security headers, set with a standard middleware. A cross origin policy that names the allowed origins, not a wildcard. Rate limiting, especially on sign in and other expensive endpoints. A limit on the size of request bodies. Validation of every input against a schema. And a dependency audit in the pipeline.

Then the classic comparison: tokens or sessions. A JSON web token is stateless. The server signs the token and keeps nothing. Any instance can verify it with the key, which makes scaling out easy. Its main disadvantage is the quiz answer: a token cannot be revoked before it expires, unless you keep a blocklist on the server, which brings the state back. So keep access tokens short lived, and pair them with a refresh token that can be revoked.

A session keeps the state on the server, in a shared store, and gives the browser only an id in a cookie. Revocation is immediate: delete the session. The cost is a lookup on every request, and a store that every instance must reach.

Whichever you choose, keep the credential in a cookie that scripts cannot read, and that only travels over an encrypted connection.

Finally, injection. Never join user input into a query. Use parameterised queries or a query builder, and validate input types. Document databases need the same care, because an attacker can send an object containing an operator where you expected a string.`,

    s8: `Section eight is scaling, clustering and caching.

Node runs your code on one thread, so one process uses one processor core. The cluster module forks several worker processes that share the same server port. Each worker is a complete Node process, with its own V8 instance and its own memory. Incoming connections are distributed among them. Because the workers share nothing, any state that must be common, such as sessions, has to live outside, in a shared store. In container platforms, people often get the same effect by running several single process containers and letting the platform balance between them.

The cache stampede is a failure you should be able to describe. A popular cache key expires. Thousands of requests arrive at that moment, all miss the cache, and all go to the database to rebuild the same value at once. The database can be overwhelmed. There are three standard defences. A lock, so only one request rebuilds the value while the others wait or get the stale copy. Serving stale data while refreshing in the background. And adding a random amount to each expiry time, so that many keys do not expire together.

Then the data loader pattern for the N plus one problem. You resolve a list of a hundred posts, and each needs its author. Naive code runs a hundred separate queries. A data loader collects all the author ids requested during one turn of the event loop, and makes a single query for all of them. It also caches within the request, so the same author is fetched once.`,

    s9: `Section nine is database patterns.

First, the tools. They differ in philosophy. Prisma is schema first. You describe your models in its own schema file, and it generates a client with precise types. It gives an excellent developer experience. TypeORM and Sequelize are the older, class based mappers. Drizzle is the lightweight one: you write the schema in TypeScript, the queries read almost like SQL, and there is very little between you and the database. A fair interview answer names what your team values: type safety and convenience, or closeness to SQL and control. And whichever you choose, look at the queries it generates.

Second, connection pooling. Opening a new database connection for each request is expensive. It takes tens of milliseconds, and the database only allows a limited number. A pool keeps a fixed set of connections open and lends them out. When all are busy, requests queue for one.

Sizing the pool is a real question. Bigger is not better. Remember that the total is the pool size multiplied by the number of instances of your service, and that total must stay under the database's limit. Always release a connection, in a finally block, or a leak will slowly empty the pool. And set a timeout for acquiring one, so a full pool fails fast instead of hanging.

Third, the N plus one query problem. You load a list with one query, then run one more query per item for related data. It looks fine with ten rows and collapses with ten thousand. Fix it with a join, with one query for all the ids, or with a data loader.`,

    s10: `Section ten is worker threads and child processes.

Both run code away from the main thread, with different levels of isolation and different ways of communicating.

Worker threads run inside the same process. Each worker has its own V8 instance and its own event loop, so it can keep a processor core busy without blocking your server. They start quickly, and they can share memory. Use them for heavy computation in JavaScript: image processing, parsing very large files, cryptography, compression.

Child processes are separate operating system processes. They are more isolated: if one crashes, the parent survives. They cost more to start and use more memory. Use them to run another program, such as a command line tool or a script in a different language, or when you want that strong isolation.

How data crosses to a worker is the whole design decision, and there are three ways. By default a message is copied, using the structured clone algorithm. That is simple, and slow for large data. Some objects, such as an array buffer, can be transferred. Ownership moves to the other side with no copy, and the sender can no longer use it. And a shared array buffer is true shared memory, visible to both sides at once, which needs atomic operations to be used safely.

Starting a worker for every task is wasteful, since each one takes time and memory to create. So for a steady flow of tasks, keep a pool of workers alive and hand tasks to whichever is free. A pool is worth it when tasks are frequent. For rare, long tasks, a single worker on demand is fine.`,

    s11: `Section eleven is testing in Node.

An integration test sends real requests through your application and checks that the routes, the middleware, the validation and the database work together. The tip from the guide is to test the contract of the API, not the implementation. Assert on the status, the shape of the body and the side effects, and not on which internal function was called.

To make that easy, export the app, not the server. Build the application in one module, and call listen in another. Tests then import the app without starting anything, and nothing has to open a real port. Frameworks offer a way to inject a request directly. And replace outside dependencies, such as a payment provider, at the boundary.

The three test doubles again, because they are asked about constantly. A stub replaces a function with a fake that returns fixed values, when you do not care how it is called. A spy wraps the real function and records its calls, when you want the real behaviour and also want to verify it was used. A mock is a fake with built in expectations about how it must be called.

Node now has its own test runner. A single command finds the test files and runs them in isolated processes, and a watch flag reruns them when files change. It includes mock functions, method mocks and mock timers, and you pair it with the built in strict assertion module. For a service with modest needs, that means no test framework to install or configure at all.`,

    s12: `Section twelve compares the three main frameworks.

Express is the industry standard. It is minimal and has few opinions. Its ecosystem of middleware is enormous, and almost every Node developer knows it. The cost of that freedom is that structure is your job. Two Express codebases can look nothing alike.

Fastify is built for performance and a good developer experience. Validation and serialisation are driven by schemas, which is a large part of why it is fast, and it has a clean plugin system and good TypeScript support. Choose it for a new service where throughput matters, and where you like the idea of schemas at the edge.

NestJS is a full framework with strong opinions: modules, controllers, providers and dependency injection, in a style familiar to anyone who has used Angular or Spring. It gives large teams a consistent structure. The cost is more abstraction and more to learn. Choose it for a big codebase with many developers.

So the choice follows team size and project complexity. Small service or prototype, Express or Fastify. Many teams in one codebase, NestJS.

Whichever you use, understand the pipeline underneath. In Express, a request flows through middleware in the order it was registered. Each function either ends the response or calls next to pass control on. Error handling middleware is recognised by having four parameters, and it is registered last. Calling next with an error skips the remaining ordinary middleware and goes straight to it. In Express four, an error thrown in an async handler must be passed to next yourself. Express five does that for you.`,

    s13: `Section thirteen is architecture and microservices.

How services talk to each other affects reliability, coupling and scaling more than any other choice.

Synchronous communication, over REST or gRPC, means service A calls service B and waits. It is simple to reason about, and you get an immediate answer. But the two are coupled in time. If B is slow, A is slow. If B is down, A fails, unless you have planned for it.

Asynchronous communication goes through a queue or an event stream. Service A publishes a message and moves on. B processes it when it can. The two are decoupled: B can be down for a while and nothing is lost. The costs are eventual consistency, harder debugging, and the need for consumers to be idempotent, because messages can be delivered more than once.

A reasonable rule: synchronous for queries where the user is waiting for an answer, asynchronous for commands and events that can complete in the background.

To make synchronous calls resilient, start with timeouts on everything. A missing timeout turns one slow dependency into an outage of your own service, as requests pile up waiting. Then retries, only for failures that are likely to pass, with a growing delay and some randomness, and only for operations that are safe to repeat. Then a circuit breaker. When a downstream service keeps failing, the breaker opens: calls fail fast, without waiting. After a pause it lets a trial request through, and closes again if that succeeds. That protects both the caller and the struggling service.`,

    s14: `Section fourteen is modules and package management.

CommonJS and ES modules load differently. CommonJS uses require. It is synchronous and dynamic: you can require inside a condition, and the module is evaluated when that line runs. ES modules use import and export. They are static, so the structure is known before anything runs, which enables tree shaking. They load asynchronously, and they allow await at the top level of a module.

The package file controls which system a file uses. Setting the type field to module makes plain JavaScript files ES modules. Without it, they are CommonJS. Two file extensions override that: one is always an ES module, the other is always CommonJS.

The exports field is the public surface of a package. It lists exactly which entry points can be imported, and anything not listed is private. It can also offer different files for import and for require, which is how a library supports both systems.

Then versions. Semantic versioning has three numbers: major for breaking changes, minor for features, and patch for fixes. A caret range allows new minor and patch versions. A tilde range allows only new patches. The lockfile records the exact version of every dependency, including dependencies of dependencies, so that every install is identical. Commit it, and use the clean install command in the pipeline, which fails if the lockfile and the package file disagree.

For supply chain safety: audit dependencies, keep them few, be wary of install scripts, and review what an update actually changes before you accept it.`,

    s15: `Section fifteen is core modules and built in features.

The event emitter is the publish and subscribe primitive underneath streams, servers and sockets. You register listeners and you emit events. It has classic gotchas. Listeners run synchronously, in the order they were registered, so a slow listener blocks the emit. An event named error with no listener throws, and can crash the process. And adding listeners repeatedly without removing them is a leak. Node prints a warning when one event has more than ten listeners, and that warning is usually telling you the truth.

Async local storage gives you context that is scoped to a request and follows the chain of async calls. It is like thread local storage in other languages, but for async code. You start a context when a request arrives, store a request id or the current user in it, and any function called later in that request can read it without it being passed as an argument. Its main use is logging and tracing: every log line can carry the request id automatically. It is also the safe answer to a bug you may remember from the bug clinic, where request data kept in a module level variable leaked between users.

Finally, modern Node covers a lot that used to need packages. Fetch is built in. So are a test runner, a watch mode, loading of environment files, and argument parsing. Check the documentation for your exact version. But before adding a dependency for something basic, see whether the platform already does it.`,

    'deep-prod': `The deep dive is production Node, five problems you only meet with real traffic.

Random 502 errors behind a load balancer. The balancer keeps idle connections to your service open, to reuse them. If Node closes an idle connection first, the balancer may send a new request down a connection that has just gone, and the client gets a 502. The fix is to make Node's keep alive timeout longer than the load balancer's idle timeout, so that the balancer is always the one to close.

Finding out why a service is slow. Ask three questions in order. Is the event loop blocked? Measure event loop delay. A high delay at the ninety ninth percentile means synchronous work is starving requests. Where is the processor time going? Take a CPU profile and read the flame graph. Is memory the problem? Take heap snapshots and compare them.

Processing large data. Use the pipeline function to connect streams, because it propagates errors from every stage and destroys every stream on failure. Async generators are a pleasant way to write a stage: a function that loops over its input and yields its output, with backpressure handled for you.

Running TypeScript directly. Recent Node versions can run TypeScript files by stripping the type annotations, without compiling. It does not check types, so you still run the compiler for that, and it supports only syntax that can simply be erased.

And the permission model. Start Node with the permission flag, and access to sensitive capabilities, such as the file system and child processes, is denied by default. You grant exactly what the process needs, which limits the damage a compromised dependency can do.`,
  },
};
