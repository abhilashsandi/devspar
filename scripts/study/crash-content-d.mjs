// Crash Course, part D: GenAI, AWS, behavioural.
import { AWS } from './dg-aws.mjs';
import { CS } from './dg-cs.mjs';
import { P, L, N, C, T, SAY, TRAP, K, RAPID, GO, S } from './cc-kit.mjs';

// ───────────────────────────────────────────── GenAI
export const genai = S('ai', 'GenAI & LLM Apps', 12, [
  K('AI 1/6 · How an LLM works (enough for an interview)',
    L('A transformer predicts the **next token** (≈ ¾ of a word) given all previous tokens; generation repeats that one token at a time.',
      'The **context window** is everything the model sees: system prompt + history + retrieved docs + tool results + output. Cost and latency grow with tokens.',
      '**Temperature** / top-p control randomness: low for extraction and code, higher for brainstorming.',
      'The model has no memory between calls and no knowledge after its cutoff; **you** supply state and fresh facts.',
      '**Hallucination** = fluent but unsupported output. Reduce it with grounding (RAG), citations, structured output and evals.'),
    T(['Lever', 'Use when'], [
      ['Prompting (+ few-shot examples)', 'always first: cheapest, fastest to iterate'],
      ['RAG', 'the model needs your private or fresh data'],
      ['Tools / function calling', 'the model must act or fetch live data'],
      ['Fine-tuning', 'consistent style/format at scale or a narrow task where prompts plateau (not for adding facts)'],
    ]),
  ),
  K('AI 2/6 · RAG: retrieval-augmented generation',
    N('**Ingest:** load docs → split into chunks (~300–800 tokens, with overlap, respecting headings) → embed each chunk → store vectors + metadata.',
      '**Retrieve:** embed the question → vector search (cosine similarity) top-k, ideally **hybrid** with keyword/BM25 → filter by tenant and permissions → **rerank**.',
      '**Generate:** put the best chunks in the prompt with instructions to answer only from them and cite sources.',
      '**Evaluate:** retrieval recall@k, answer faithfulness and relevance on a fixed test set.'),
    C(`const q = await embed(question);
const hits = await db.query(
  \`SELECT id, text, source FROM chunks
   WHERE tenant_id = $1
   ORDER BY embedding <=> $2  -- pgvector cosine distance
   LIMIT 20\`, [tenantId, q]);
const top = await rerank(question, hits).then((r) => r.slice(0, 5));
const answer = await llm({
  system: 'Answer only from the context. Cite [source]. Say "I don\\'t know" if it is not there.',
  messages: [{ role: 'user', content: format(top) + '\\n\\nQuestion: ' + question }],
});`),
    TRAP('Most RAG failures are retrieval failures (bad chunking, no hybrid search, missing permission filters), not model failures. Debug retrieval first.'),
  ),
  K('AI 3/6 · Tool calling, agents and MCP',
    L('**Tool calling:** you describe functions with a JSON schema; the model replies with a tool name + arguments; **your code** runs it and sends the result back; loop until the model answers.',
      '**Agent** = an LLM in that loop choosing tools toward a goal. Add step limits, timeouts, budgets and human approval for side-effects.',
      '**MCP (Model Context Protocol):** a standard way to expose tools, resources and prompts to any compatible AI client, like a USB port for context.',
      '**Structured output:** ask for JSON matching a schema and validate it (zod) before use.'),
    C(`const tools = [{
  name: 'get_order',
  description: 'Look up an order by id for the signed-in user',
  input_schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
}];

let msgs = [{ role: 'user', content: 'Where is order 123?' }];
for (let step = 0; step < 5; step++) {
  const res = await llm({ tools, messages: msgs });
  if (res.stop_reason !== 'tool_use') return res.text;
  const call = res.toolUse;                       // { name, input }
  const result = await runTool(call, { userId }); // authorise with the USER's rights
  msgs.push(res.asMessage, toolResult(call.id, result));
}`),
  ),
  K('AI 4/6 · Streaming LLM output to React',
    CS.queueSse,
    L('Stream tokens with **SSE** (or a streamed `fetch` body) so the first words appear in ~1 s instead of waiting for the full answer.',
      'In React: read the stream with `res.body.getReader()`, append chunks to state, render markdown progressively, support **Stop** via `AbortController`.',
      'Long jobs (agents, documents): enqueue, return a job id, push progress over SSE/WebSocket, persist results.'),
    C(`const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages }), signal });
const reader = res.body.getReader();
const dec = new TextDecoder();
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  setAnswer((a) => a + dec.decode(value, { stream: true }));
}`),
  ),
  K('AI 5/6 · Safety, evals and production',
    T(['Concern', 'What you do'], [
      ['Prompt injection', 'treat retrieved text and tool output as data; least-privilege tools; confirm side-effects; never let the model hold secrets'],
      ['PII / data leakage', 'redact before sending, tenant filters in retrieval, provider data-retention settings'],
      ['Quality', 'golden test set, LLM-as-judge with a rubric + human spot checks, run evals in CI on every prompt/model change'],
      ['Cost', 'smaller model for easy steps (routing), prompt caching, shorter context, batch APIs, cache answers'],
      ['Latency', 'streaming, smaller models, parallel tool calls, precomputed embeddings'],
      ['Reliability', 'timeouts, retries with backoff on 429/5xx, fallback model/provider, schema validation of outputs'],
      ['Observability', 'log prompts, tokens, latency, cost, tool calls and user feedback per request (with redaction)'],
    ]),
    SAY('I treat the model as an unreliable, expensive dependency: validate its output, bound what it can do, measure quality with evals, and watch cost and latency per request.'),
  ),
  RAPID('GenAI rapid-fire', [
    ['Embedding?', 'A vector that places text so similar meanings are close; used for search, clustering, RAG.'],
    ['Chunk size trade-off?', 'Small: precise but loses context; large: more context but noisier and costlier.'],
    ['Context window full?', 'Summarise older turns, retrieve instead of stuffing, trim tool output.'],
    ['Why rerank?', 'A cross-encoder scores query+chunk together, far more accurate than vector distance alone.'],
    ['Fine-tune vs RAG?', 'RAG for knowledge; fine-tune for behaviour/format.'],
    ['Temperature 0 = deterministic?', 'Mostly, not guaranteed; do not rely on it for correctness.'],
  ]),
  K('GenAI · Go deeper', GO(['/genai', 'GenAI Explained'], ['/interview-cheatsheet', 'Interview Cheatsheet'])),
]);

// ───────────────────────────────────────────── AWS
export const aws = S('aws', 'AWS', 12, [
  K('AWS 1/7 · Global infrastructure and IAM',
    L('**Region** = a geographic area (pick for latency, data residency, service availability, price). **Availability Zone** = one or more isolated data centres in a region; deploy across **at least 2–3 AZs**. **Edge locations** serve CloudFront and Route 53.',
      '**IAM:** users (avoid long-lived keys), **roles** (temporary credentials for services, CI and people via SSO), **policies** (JSON allow/deny on actions + resources).',
      'Least privilege, MFA, no root usage, separate **accounts** per environment under **AWS Organizations** with SCPs as guardrails.'),
    AWS.iam,
    C(`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::my-uploads/\${aws:PrincipalTag/team}/*"
  }]
}`, 'An IAM policy: allow read/write on one prefix only'),
  ),
  K('AWS 2/7 · Compute: which one?',
    T(['Service', 'What it is', 'Pick it when'], [
      ['**EC2** + Auto Scaling', 'virtual machines you manage', 'full control, special hardware/OS, long-running steady load'],
      ['**ECS on Fargate**', 'containers without managing servers', 'the default for containerised web apps and APIs'],
      ['**EKS**', 'managed Kubernetes', 'you need the Kubernetes ecosystem or multi-cloud portability'],
      ['**Lambda**', 'functions run per event, up to 15 min', 'spiky/event-driven work, glue, low-traffic APIs, scale to zero'],
      ['**App Runner / Beanstalk**', 'PaaS-style deploy from code/image', 'small teams wanting the simplest path'],
    ]),
    L('Lambda gotchas: **cold starts** (use provisioned concurrency or SnapStart for latency-sensitive paths), concurrency limits, 15-min max, and DB connection storms (use **RDS Proxy** or DynamoDB).',
      'EC2 pricing: On-Demand, **Savings Plans / Reserved** (1–3 yr, up to ~70% off), **Spot** (up to ~90% off, can be reclaimed: batch, CI, stateless workers).'),
  ),
  K('AWS 3/7 · Networking: VPC, load balancers, DNS, CDN',
    AWS.vpc,
    L('**Public subnet** = route to an Internet Gateway. **Private subnet** = no inbound from the internet; outbound via a **NAT gateway**; reach AWS services privately with **VPC endpoints**.',
      '**Security groups:** stateful, allow-only, attached to resources (reference other SGs: "DB allows 5432 from app-SG"). **NACLs:** stateless, subnet-level, allow + deny.',
      '**ALB** (layer 7: HTTP paths/hosts, WebSockets, gRPC) vs **NLB** (layer 4: TCP/UDP, static IPs, extreme throughput).',
      '**Route 53:** DNS with routing policies (latency, weighted, failover, geolocation) + health checks. **CloudFront:** CDN + TLS + WAF at the edge.',
      '**API Gateway:** managed API front door (auth, throttling, usage plans) for Lambda or HTTP backends.'),
  ),
  K('AWS 4/7 · Storage and databases',
    T(['Need', 'Service', 'Notes'], [
      ['Files / objects / static sites / backups', '**S3**', '11 nines durability; storage classes (Standard → IA → Glacier) + lifecycle rules; presigned URLs; Block Public Access on'],
      ['Disk for one EC2 instance', '**EBS**', 'block storage in one AZ; snapshots to S3'],
      ['Shared file system', '**EFS**', 'NFS across AZs and many instances'],
      ['Relational', '**RDS** / **Aurora**', 'managed Postgres/MySQL; Multi-AZ for HA, read replicas for reads; Aurora: 6 copies across 3 AZs, fast failover, Serverless v2'],
      ['Key-value at any scale', '**DynamoDB**', 'single-digit-ms, partition key (+ sort key), on-demand or provisioned, GSIs, Streams, global tables'],
      ['Cache', '**ElastiCache** (Redis/Valkey)', 'sessions, hot reads, rate limits, leaderboards'],
      ['Search / logs analytics', '**OpenSearch**', 'full-text search, also vector search'],
      ['Analytics', '**Redshift**, **Athena** (SQL on S3)', 'warehousing vs ad-hoc queries on a data lake'],
    ]),
    TRAP('DynamoDB is designed from **access patterns**: decide the queries first, then the keys. A hot partition key (e.g. today\'s date) throttles everything.'),
  ),
  K('AWS 5/7 · Messaging and integration',
    T(['Service', 'Model', 'Use for'], [
      ['**SQS**', 'queue, pull; Standard (at-least-once, best-effort order) or FIFO (ordered per group, exactly-once processing)', 'decoupling, buffering, background jobs; visibility timeout + DLQ'],
      ['**SNS**', 'pub/sub push to many subscribers', 'fan-out to SQS queues, Lambda, email/SMS'],
      ['**EventBridge**', 'event bus with content-based rules, schedules, SaaS events', 'event-driven architectures between services and accounts'],
      ['**Kinesis Data Streams** / **MSK** (Kafka)', 'ordered, replayable streams with shards/partitions', 'clickstreams, telemetry, high-volume ordered events'],
      ['**Step Functions**', 'managed state machine', 'orchestrated workflows and sagas with retries and compensation'],
    ]),
    AWS.upload,
    P('**SNS → SQS fan-out:** publish once to a topic; each consumer service has its own queue, so a slow consumer never affects the others.'),
  ),
  K('AWS 6/7 · Security, observability, delivery',
    L('**Encryption:** KMS keys for data at rest (S3, EBS, RDS, DynamoDB), TLS in transit (certificates from **ACM**).',
      '**Secrets Manager** (rotation) or **SSM Parameter Store** for config; never in code or env files in git.',
      '**Cognito** for user sign-up/sign-in (OIDC, social, MFA). **WAF** (rules, rate limits, bot control) + **Shield** (DDoS) at CloudFront/ALB.',
      '**CloudTrail** = who called which API (audit). **GuardDuty** = threat detection. **Config** = resource compliance.',
      '**CloudWatch:** metrics, logs, alarms, dashboards. **X-Ray** / OpenTelemetry for traces.',
      '**IaC:** CloudFormation, **CDK** (TypeScript → CloudFormation) or Terraform. CI/CD with CodePipeline or GitHub Actions using **OIDC roles** (no stored keys).'),
    C(`// AWS CDK (TypeScript): a queue + worker in a few lines
const dlq = new sqs.Queue(this, 'Dlq');
const queue = new sqs.Queue(this, 'Jobs', {
  visibilityTimeout: Duration.seconds(60),
  deadLetterQueue: { queue: dlq, maxReceiveCount: 5 },
});
const worker = new NodejsFunction(this, 'Worker', { entry: 'src/worker.ts' });  // aws-cdk-lib/aws-lambda-nodejs
worker.addEventSource(new SqsEventSource(queue, { batchSize: 10 }));`),
  ),
  K('AWS 7/7 · Reference architectures and Well-Architected',
    AWS.serverless,
    T(['Well-Architected pillar', 'One-line meaning'], [
      ['Operational excellence', 'IaC, small reversible changes, runbooks, learn from incidents'],
      ['Security', 'least privilege, encryption everywhere, traceability, automate guardrails'],
      ['Reliability', 'multi-AZ, auto-recovery, scale horizontally, test recovery'],
      ['Performance efficiency', 'right service and size, go global with CDN, experiment'],
      ['Cost optimization', 'pay for use, right-size, Savings Plans/Spot, turn off idle, tag and watch spend'],
      ['Sustainability', 'maximise utilisation, managed services, efficient regions and hardware'],
    ]),
    SAY('For a typical web app I would use CloudFront + S3 for the frontend, an ALB with ECS Fargate (or API Gateway + Lambda) across three AZs, Aurora Postgres Multi-AZ, ElastiCache, SQS for background jobs, Cognito for auth, everything in CDK with CloudWatch alarms.'),
  ),
  RAPID('AWS rapid-fire', [
    ['SG vs NACL?', 'SG: stateful, instance-level, allow only. NACL: stateless, subnet-level, allow and deny.'],
    ['Multi-AZ vs read replica?', 'Multi-AZ = HA standby (failover); read replica = scale reads (async).'],
    ['SQS visibility timeout?', 'How long a received message is hidden; must exceed processing time or it is redelivered.'],
    ['S3 consistency?', 'Strong read-after-write for all operations.'],
    ['How do Lambda functions get permissions?', 'An execution role; never access keys in code.'],
    ['Reduce NAT gateway cost?', 'VPC gateway endpoints for S3/DynamoDB, keep traffic in-AZ.'],
    ['DR strategies?', 'Backup & restore → pilot light → warm standby → multi-site active-active (cheaper → faster).'],
    ['Cross-account access?', 'Assume an IAM role in the other account (trust policy + permissions).'],
  ]),
  K('AWS · Go deeper', GO(['/aws', 'AWS study guide'], ['/system-design', 'System Design (AWS building blocks)'])),
]);

// ───────────────────────────────────────────── Behavioural
export const behavioral = S('soft', 'Behavioral & Engineering Practice', 5, [
  K('Soft 1/2 · Stories that land',
    P('Answer with **STAR** (Situation, Task, Action, Result), 60–90 seconds each, with **your** actions and a real result. Prepare 5 stories you can bend to most questions:'),
    T(['Story', 'Covers'], [
      ['A hard technical problem you solved', 'debugging, ownership, depth'],
      ['A project you led end to end', 'leadership, planning, trade-offs, delivery'],
      ['A disagreement or pushback', 'collaboration, influence, handling conflict'],
      ['A failure or production incident', 'accountability, learning, blameless postmortem'],
      ['Mentoring / raising the bar', 'seniority: reviews, standards, helping others grow'],
    ]),
    C(`60-second intro:
"I'm a <role> with <N> years building <kind of products> with <stack>.
Most recently at <company> I <biggest relevant achievement + impact>.
I enjoy <thing that matches this role>, which is why this role interests me."`),
    TRAP('Say "I" for what you did and "we" for the team. Never invent numbers: if you are unsure, describe the effect instead.'),
  ),
  K('Soft 2/2 · Engineering practice and questions to ask',
    L('**Code review:** correctness and design first, then readability; be kind and specific; automate style with linters.',
      '**Estimates:** break work down, give ranges, flag unknowns early, re-estimate as you learn.',
      '**Tech debt:** make it visible, tie it to business cost, pay it down alongside features.',
      '**Incidents:** mitigate first, communicate, then root-cause and blameless postmortem with action items.',
      '**Trade-offs:** say what you chose, what you gave up, and when you would revisit it.'),
    P('**Questions to ask them:** What does success look like in the first 90 days? What is the biggest technical challenge right now? How do you deploy and how often? How are decisions made when engineers disagree? What would you change about the team?'),
  ),
  K('Behavioral · Go deeper', GO(['/interview-prep#behavioral', 'Interview Prep: Engineering Practice'], ['/interview-cheatsheet#review', 'Cheatsheet: Last 2 Hours'])),
]);
