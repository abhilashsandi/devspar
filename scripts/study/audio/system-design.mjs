// Audio overview of the System Design guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the System Design guide. System design interviews reward a way of thinking more than a list of facts. Every answer has the same skeleton: what are the requirements, what are the numbers, what does the picture look like, and what does each choice cost.

The guide has four sections. First, the core vocabulary of distributed systems and a set of classic design questions. Second, architecture and reliability: queues, retries, and the patterns that stop one failure from becoming an outage. Third, cloud and deployment. And last, five worked designs.

As you listen, practise finishing each idea with its trade off. That habit is what interviewers score.`,

  chapters: {
    sysdesign: `The first section is the vocabulary, starting with the question that never goes away: monolith or microservices. Neither is better. The question is which set of problems you would rather have. When you do split, do it gradually with the strangler fig pattern: route one piece of traffic at a time to a new service until the old system is gone. And draw the lines around bounded contexts, areas of the business with their own language.

Scaling up means a bigger machine. Scaling out means more machines, which needs stateless servers. The CAP theorem says that when the network splits, a data store must choose between consistency and availability.

Between services, REST is the default, gRPC is for fast internal calls, and GraphQL lets a client ask for exactly the fields it needs. For messaging, choose Kafka when you need a log you can replay, and a traditional broker when you need work routed to consumers.

Once each service owns its database, you lose transactions across services. A saga replaces one with a chain of local steps, each with a compensating action. The outbox pattern solves the dual write: save the change and the event in one transaction, and publish the event afterwards.

Two health checks. Liveness asks whether to restart an instance. Readiness asks whether to send it traffic.

Then the classic designs: a rate limiter, a link shortener, a notification system and a news feed. And three building blocks. Consistent hashing, so adding a server moves only a few keys. Consensus, for electing a leader. And the Bloom filter, which answers definitely not, or probably yes.`,

    arch: `Section two is about work that takes a long time, and about failure.

The shape to know is the async workflow. The frontend collects and validates input. The backend saves a job and puts it on a queue. A worker does the slow work. And progress is pushed back to the browser, usually with server sent events, which are one way, run over plain HTTP and reconnect by themselves.

Retries must be bounded and idempotent. Keep the job state and the attempt count, and acknowledge a message only after the result is safely saved. A message that keeps failing goes to a dead letter queue, so it stops blocking the others and a person can look at it. For APIs, accept an idempotency key from the client and store it with a unique constraint, so a repeated request returns the first result.

Then four defences, applied in order on every outbound call. A timeout, so you never wait forever. A retry with backoff and jitter, only for failures that are likely to pass. A circuit breaker, which stops calling a dependency that is failing and fails fast. And a bulkhead, which gives each dependency its own limited pool, so one slow service cannot use up everything.

If a cache fails, treat it by its real job. If it only speeds things up, keep serving from the database.

Know three terms. The indicator is the measurement. The objective is the target. The agreement is the contract with consequences. The error budget is how much failure the objective allows.

And place two pieces. An API gateway handles traffic coming into the system. A service mesh handles traffic between services.`,

    cloud: `Section three is cloud and deployment, mostly in AWS terms.

Three services cover a lot of ground. RDS is the managed relational database. S3 is object storage for files. ECS runs your containers. For each, be ready to say how it gets its secrets and its permissions, because that is usually the follow up. Multi AZ means redundant copies in separate data centres within one region, which protects you from a data centre failing. Multi region protects you from a whole region failing, and costs much more in complexity.

A deployment flows like this. You push code and open a pull request. After review and merge, the pipeline runs the tests and builds an image. The image goes to a registry, and the running service is updated from it.

There are three rollout styles. Rolling replaces instances a few at a time. Blue green runs two full environments and switches traffic between them, which makes rollback instant. Canary sends a small share of traffic to the new version first, and rolls back automatically if errors or latency rise. They are often combined.

Observability has three pillars. Logs tell you what happened in one event. Metrics tell you how much and how often. Traces follow one request across services, using an id passed along in headers.

A content delivery network caches content close to users. Dynamic content is harder to cache, because it varies by user, and the wrong cache key can show one person's data to another.

Finally, a cold start is the delay when Lambda has to create a new execution environment. Smaller packages and provisioned concurrency reduce it.`,

    'deep-designs': `The last section works through five designs. In each one, a single idea carries the answer.

A chat system. Messages travel over a persistent connection, and each user's connection lives on some server, so you need a way to route a message to the right one. Messages are stored so that people who are offline get them later. Presence, delivery receipts and read receipts are separate, lighter signals.

A file upload service. The idea is: do not stream uploads through your API servers. The client asks your API for a pre signed address, then uploads straight to object storage. Processing, such as scanning or resizing, happens afterwards in the background.

Search autocomplete. Suggestions must arrive within about a tenth of a second of each keystroke. So the client waits briefly before sending, and the server answers from data that was ranked by popularity ahead of time, not computed per request.

A payment and wallet system. Money never moves twice. Every request carries an idempotency key, and the first result is stored and returned for any retry. Balances come from a double entry ledger, where every movement is recorded as two entries that cancel out. And a reconciliation job compares your records with the payment provider's.

A distributed job scheduler. Jobs are stored with their next run time, and the table is indexed by it. Workers claim the jobs that are due, in a way that stops two workers taking the same one. Each job has a retry policy and a timeout.

For all five, start with requirements and numbers, and end with what you would do differently at ten times the scale.`,
  },
};
