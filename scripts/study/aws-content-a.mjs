// AWS guide, part A: foundations, IAM & security, compute, networking, storage.
import { AWS } from './dg-aws.mjs';
import { CS } from './dg-cs.mjs';
import { P, L, N, C, T, H, SAY, TRAP, K } from './cc-kit.mjs';

export const quiz = (question, options, right, why) => ({
  q: 'Quiz: ' + question + ' <span class="quizopts">' + options.map((o, i) => '(' + 'ABCD'[i] + ') ' + o).join(' &nbsp;·&nbsp; ') + '</span>',
  a: '<ol class="quiz" type="A">' + options.map((o, i) => '<li' + (i === right ? ' class="right"' : '') + '>' + o + '</li>').join('') + '</ol><p><strong>Answer: ' + 'ABCD'[right] + '.</strong> ' + why + '</p>',
});
export const diagram = (title, svg) => ({ q: 'Diagram: ' + title, a: svg });

// ───────────────────────────────────────────── 1. Foundations
export const foundations = [
  K('What are Regions, Availability Zones and edge locations, and how do they shape a design?',
    L('**Region:** a separate geographic area (us-east-1, eu-west-1) with its own copy of most services. Data stays in the region unless you move it.',
      '**Availability Zone (AZ):** one or more data centres with independent power, cooling and networking, linked to the other AZs in the region by low-latency fibre (single-digit ms). A region has 3+ AZs.',
      '**Edge locations / PoPs:** hundreds of sites used by CloudFront, Route 53, Global Accelerator and Lambda@Edge to serve users close to them.',
      '**Local Zones / Wavelength / Outposts:** compute closer to specific cities, 5G networks, or inside your own data centre.'),
    T(['Scope', 'Examples'], [
      ['Global', 'IAM, Route 53, CloudFront, Organizations'],
      ['Regional', 'S3 buckets (names are global), DynamoDB, Lambda, SQS, VPC'],
      ['Zonal (one AZ)', 'EC2 instances, EBS volumes, subnets'],
    ]),
    SAY('I pick a region for latency to users, data-residency rules, service availability and price, and I spread every tier across at least two, preferably three, AZs.'),
  ),
  K('What is the shared responsibility model?',
    P('AWS secures **the cloud** (hardware, facilities, the hypervisor, managed-service internals). You secure what you put **in the cloud**: data, IAM, network rules, OS patches on EC2, application code and encryption choices.'),
    T(['Service type', 'You still own'], [
      ['EC2 (IaaS)', 'OS patching, firewall/SGs, runtime, app, data, IAM'],
      ['RDS / ECS Fargate (managed)', 'DB users, parameters, network access, app, data, IAM'],
      ['Lambda / DynamoDB / S3 (serverless)', 'code, IAM permissions, data classification, encryption settings, bucket policies'],
    ]),
    TRAP('"AWS is secure, so my S3 bucket is secure" is wrong. Misconfigured access (public buckets, over-broad IAM) is the classic cloud breach.'),
  ),
  K('How should a company structure AWS accounts?',
    L('Use **AWS Organizations** with many accounts: the account is the strongest isolation boundary (blast radius, quotas, billing).',
      'Typical layout: a management account (billing only), security/audit and log-archive accounts, shared networking, then **dev / staging / prod accounts per workload**.',
      '**Service Control Policies (SCPs)** are guardrails for whole OUs: e.g. deny leaving the organisation, deny regions you do not use, deny disabling CloudTrail.',
      '**IAM Identity Center** (SSO) gives people short-lived access to each account via permission sets; no IAM users per person.',
      '**Control Tower** automates this "landing zone" setup.'),
  ),
  K('How does AWS pricing work, and what are the big cost levers?',
    T(['Model', 'Discount', 'Use for'], [
      ['On-Demand', '0%', 'spiky, short-lived or unknown workloads'],
      ['Savings Plans (Compute / EC2)', 'up to ~66–72%', 'a steady baseline of compute ($/hour commitment for 1–3 years; covers EC2, Fargate, Lambda)'],
      ['Reserved Instances', 'up to ~72%', 'specific instance families, RDS, ElastiCache, Redshift'],
      ['Spot', 'up to ~90%', 'interruptible work: batch, CI, stateless workers, with a 2-minute reclaim notice'],
    ]),
    L('Hidden costs to name: **data transfer out** and cross-AZ traffic, **NAT gateway** processing, idle resources, unbounded CloudWatch logs, over-provisioned RDS.',
      'Practices: tag everything (team, env, service), Cost Explorer + Budgets alerts, right-size with Compute Optimizer, S3 lifecycle rules, Graviton (ARM) instances for ~20–40% better price-performance.'),
  ),
  K('What are the six pillars of the Well-Architected Framework?',
    T(['Pillar', 'Key practices'], [
      ['Operational excellence', 'everything as code, small frequent reversible changes, observability, runbooks, post-incident learning'],
      ['Security', 'strong identity, least privilege, traceability (CloudTrail), defence in depth, encryption at rest and in transit, automated guardrails'],
      ['Reliability', 'multi-AZ, auto-recovery, horizontal scaling, quotas management, tested backups and DR'],
      ['Performance efficiency', 'pick the right service and size, serverless/managed, global CDN, measure and experiment'],
      ['Cost optimization', 'consumption-based, right-sizing, purchase options, remove waste, cost allocation tags'],
      ['Sustainability', 'maximise utilisation, managed services, efficient hardware (Graviton), regions with cleaner energy'],
    ]),
    P('The Well-Architected Tool runs a structured review of a workload against these pillars; there are also "lenses" for serverless, SaaS, ML and more.'),
  ),
];

// ───────────────────────────────────────────── 2. IAM & security
export const security = [
  K('IAM users, groups, roles and policies: what is each for?',
    T(['Thing', 'What it is', 'Guidance'], [
      ['Root user', 'the account owner, unlimited power', 'MFA, lock away, use only for the few root-only tasks'],
      ['IAM user', 'long-lived identity with password/access keys', 'avoid for people (use Identity Center); avoid keys for apps'],
      ['Group', 'a set of users sharing policies', 'only matters if you still have IAM users'],
      ['**Role**', 'an identity anyone trusted can **assume** to get temporary credentials (STS)', 'the default for services (EC2, Lambda, ECS tasks), CI pipelines and cross-account access'],
      ['Policy', 'JSON document of Effect / Action / Resource / Condition', 'identity-based (on a principal) or resource-based (on S3 bucket, SQS queue, KMS key)'],
    ]),
    C(`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["dynamodb:GetItem", "dynamodb:Query"],
    "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Orders",
    "Condition": { "ForAllValues:StringEquals": { "dynamodb:LeadingKeys": ["\${aws:PrincipalTag/tenant}"] } }
  }]
}`, 'Least privilege with a condition: a tenant can only read its own partition'),
  ),
  diagram('How IAM decides allow or deny', AWS.iam),
  K('How does a role work: trust policy, permissions policy and STS?',
    N('A role has a **trust policy** (who may assume it: a service like `lambda.amazonaws.com`, another account, a federated identity such as GitHub OIDC).',
      'And a **permissions policy** (what it can do once assumed).',
      'The caller calls **STS AssumeRole** (or the service does it for you) and receives temporary credentials (access key, secret, session token) that expire in 15 min–12 h.',
      'SDKs pick these up automatically from the environment (instance metadata, ECS task role, Lambda execution role).'),
    C(`{
  "Effect": "Allow",
  "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": { "StringLike": { "token.actions.githubusercontent.com:sub": "repo:my-org/my-app:ref:refs/heads/main" } }
}`, 'Trust policy: only the main branch of one GitHub repo can deploy, no stored keys'),
    SAY('Applications never hold access keys: they get temporary credentials through a role, and CI uses OIDC federation to assume a deploy role.'),
  ),
  K('How do you encrypt data on AWS, and what is envelope encryption?',
    L('**KMS** manages keys (AWS-owned, AWS-managed, or customer-managed keys with your own key policy and rotation). Keys never leave KMS unencrypted.',
      '**Envelope encryption:** KMS generates a data key; the service encrypts your data with the data key locally and stores the data key encrypted by the KMS key. Big data never travels to KMS, only the small key.',
      'At rest: S3 (SSE-S3 default, SSE-KMS for audit/control), EBS, RDS, DynamoDB all encrypt with a click or by default.',
      'In transit: TLS everywhere; **ACM** issues and renews certificates for ALB, CloudFront and API Gateway for free.',
      '**CloudHSM** when you need dedicated, single-tenant HSMs (compliance).'),
    TRAP('With SSE-KMS, the reader needs **both** S3 permissions and `kms:Decrypt` on the key; a missing KMS permission looks like an S3 AccessDenied.'),
  ),
  K('Secrets Manager vs Parameter Store, and how should an app load secrets?',
    T(['', 'Secrets Manager', 'SSM Parameter Store'], [
      ['Built for', 'credentials, API keys', 'config and secrets (SecureString)'],
      ['Rotation', 'built-in (RDS, custom Lambda)', 'no built-in rotation'],
      ['Cost', 'per secret per month + API calls', 'standard tier free'],
      ['Cross-account / replication', 'yes', 'limited'],
    ]),
    L('Grant the task/function role read access to **only its** secrets; load at start-up and cache with a TTL (the Lambda Parameters & Secrets extension does this).',
      'ECS can inject secrets into env vars from Secrets Manager/SSM at task start; never bake them into images.'),
  ),
  K('How do Cognito, WAF, Shield and GuardDuty fit together?',
    T(['Service', 'Job'], [
      ['**Cognito User Pools**', 'user directory + sign-up/sign-in, MFA, social/SAML/OIDC federation; issues JWTs (ID, access, refresh)'],
      ['**Cognito Identity Pools**', 'exchange a login for temporary AWS credentials (e.g. upload straight to S3 from a mobile app)'],
      ['**WAF**', 'layer-7 firewall on CloudFront/ALB/API Gateway: managed rule sets (OWASP, bad bots), rate-based rules, geo blocks'],
      ['**Shield** Standard / Advanced', 'DDoS protection: Standard is automatic and free; Advanced adds response team and cost protection'],
      ['**GuardDuty**', 'threat detection from CloudTrail, VPC flow and DNS logs (crypto-mining, credential exfiltration)'],
      ['**Security Hub / Config / Inspector / Macie**', 'posture findings, resource compliance rules, vulnerability scans, PII discovery in S3'],
    ]),
  ),
  quiz('An app on EC2 needs to read from one S3 bucket. What is the right way to give it access?',
    ['Create an IAM user and put its keys in an env var', 'Attach an instance role with a policy scoped to that bucket', 'Make the bucket public-read', 'Store keys in the AMI'],
    1, 'An instance profile (role) delivers rotating temporary credentials through the instance metadata service, scoped by least privilege. No long-lived keys anywhere.'),
  quiz('A policy allows s3:* on a bucket, but an SCP on the account denies s3:DeleteObject. Can the user delete objects?',
    ['Yes, the identity policy allows it', 'No, an explicit deny anywhere wins', 'Only the root user can', 'Only with MFA'],
    1, 'Explicit deny always wins, and SCPs set the maximum permissions for every principal in the account (even admins).'),
];

// ───────────────────────────────────────────── 3. Compute
export const compute = [
  K('Which compute service should you choose?',
    T(['Service', 'You manage', 'Scales', 'Best for'], [
      ['EC2', 'OS, patching, AMIs, capacity', 'Auto Scaling groups', 'legacy apps, special hardware (GPU), full control'],
      ['ECS on EC2', 'container hosts', 'tasks + capacity providers', 'containers with cost control at high, steady load'],
      ['**ECS on Fargate**', 'only the task definition', 'per task', 'most containerised web apps and workers'],
      ['EKS', 'K8s manifests, add-ons (Fargate or nodes)', 'HPA, Karpenter', 'teams standardised on Kubernetes'],
      ['**Lambda**', 'only code', 'per request, to thousands of concurrent copies', 'event-driven, spiky, glue, APIs with modest latency needs'],
      ['App Runner', 'source or image', 'automatic', 'simple web services with minimal ops'],
    ]),
    SAY('My default for a web API is containers on Fargate behind an ALB; I use Lambda for event-driven glue and spiky workloads, and EKS only when the organisation already runs Kubernetes.'),
  ),
  K('EC2 essentials: instance families, AMIs, storage and placement',
    L('Families: **general** (m7g/m7i), **compute** (c7), **memory** (r7, x2), **storage** (i4), **accelerated** (p5, g5, inf2, trn1). The `g` suffix means Graviton ARM.',
      '**AMI** = the image an instance boots from; bake with EC2 Image Builder or Packer for immutable deploys.',
      '**User data** runs a script at first boot; **instance metadata** (IMDSv2 with a session token) supplies role credentials.',
      '**EBS** volumes (gp3 for most, io2 for high IOPS) live in one AZ; **instance store** is fast but ephemeral.',
      '**Placement groups:** cluster (low latency, one AZ), spread (separate hardware), partition (big distributed systems like Kafka/HDFS).'),
    TRAP('Enforce **IMDSv2**: SSRF bugs against IMDSv1 were how attackers stole instance-role credentials (the Capital One breach).'),
  ),
  K('How do Auto Scaling groups and scaling policies work?',
    L('An ASG keeps a **desired** number of instances between min and max, spread across AZs, replacing unhealthy ones (EC2 or ELB health checks).',
      '**Launch template** defines the instance (AMI, type, SG, role, user data).',
      '**Target tracking:** keep a metric at a target (CPU 50%, requests per target 1000) — the default choice.',
      '**Step/simple scaling** on CloudWatch alarms; **scheduled** scaling for known peaks; **predictive** scaling learns daily patterns.',
      '**Instance refresh** rolls a new launch template across the group; **warm pools** cut scale-out time; lifecycle hooks drain or bootstrap.'),
    P('ECS services use the same idea (Service Auto Scaling on CPU, memory or ALB requests per target), and Lambda scales by concurrency automatically.'),
  ),
  K('Lambda in depth: invocation models, concurrency and cold starts',
    T(['Invocation', 'Examples', 'Retries'], [
      ['Synchronous', 'API Gateway, ALB, SDK invoke', 'the caller handles errors'],
      ['Asynchronous', 'S3, SNS, EventBridge', 'Lambda retries twice; then a DLQ or on-failure destination'],
      ['Poll-based (event source mapping)', 'SQS, Kinesis, DynamoDB Streams, Kafka', 'Lambda polls in batches; failed batches retry; use partial batch responses'],
    ]),
    L('**Concurrency** = requests in flight. Account default limit ~1,000 per region (raisable). **Reserved concurrency** caps or guarantees a function; **provisioned concurrency** keeps instances warm.',
      '**Cold start** = new execution environment + runtime init + your init code (100 ms to seconds). Reduce with small bundles, lazy imports, SnapStart (Java/Python/.NET), provisioned concurrency, and init work outside the handler (reused across invocations).',
      'Limits: 15 min timeout, up to 10 GB memory (CPU scales with memory), 6 MB sync payload, 250 MB unzipped package (10 GB container image), `/tmp` up to 10 GB.'),
    C(`import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
const db = new DynamoDBClient({});          // created once per environment, reused while warm

export const handler = async (event) => {
  const failures = [];
  for (const r of event.Records) {           // SQS batch
    try { await process(JSON.parse(r.body)); }
    catch { failures.push({ itemIdentifier: r.messageId }); }
  }
  return { batchItemFailures: failures };    // needs ReportBatchItemFailures on the event source mapping
};`),
  ),
  K('ECS concepts: cluster, task definition, service, and Fargate vs EC2 launch type',
    L('**Task definition:** the container spec (image, CPU/memory, ports, env, secrets, log config, **task role** for app permissions, **execution role** for pulling images/secrets).',
      '**Task:** a running copy. **Service:** keeps N tasks running, registers them with an ALB target group, does rolling or blue/green (CodeDeploy) deployments with circuit-breaker rollback.',
      '**Fargate:** AWS runs the hosts; you pay per task vCPU/GB-second. **EC2 launch type:** you run the hosts (cheaper at scale, more ops). Fargate Spot for interruptible tasks.',
      'Networking mode `awsvpc` gives each task its own ENI and security group.',
      'Images live in **ECR** (scan on push, lifecycle policies to delete old tags).'),
  ),
  quiz('An image-resize function times out under a burst of uploads and throttles other functions in the account. What helps most?',
    ['Increase the timeout to 15 minutes', 'Put SQS in front and set reserved concurrency on the function', 'Move it to a bigger EC2 instance', 'Turn on provisioned concurrency for every function'],
    1, 'A queue absorbs the burst and retries failures; reserved concurrency caps how much of the account\'s concurrency this function can use, protecting the others.'),
];

// ───────────────────────────────────────────── 4. Networking
export const networking = [
  diagram('A three-tier app in a VPC across two AZs', AWS.vpc),
  K('VPC building blocks: subnets, route tables, gateways',
    L('A **VPC** is your private network in a region (a CIDR such as `10.0.0.0/16`). **Subnets** live in one AZ each.',
      'A subnet is **public** only because its route table sends `0.0.0.0/0` to an **Internet Gateway**. Private subnets route `0.0.0.0/0` to a **NAT gateway** (outbound only), one per AZ for resilience.',
      'Put only load balancers and NAT gateways in public subnets; app servers and databases in private subnets.',
      'Plan CIDRs that do not overlap with other VPCs or on-prem networks, so you can connect them later.',
      '**VPC Flow Logs** record accepted/rejected traffic for debugging and security.'),
  ),
  K('Security groups vs network ACLs',
    T(['', 'Security group', 'Network ACL'], [
      ['Level', 'ENI / instance / task', 'subnet'],
      ['State', '**stateful**: return traffic allowed automatically', '**stateless**: must allow return (ephemeral ports) explicitly'],
      ['Rules', 'allow only', 'allow and deny, evaluated in number order'],
      ['Typical use', 'the main firewall: "DB allows 5432 from app-SG"', 'coarse subnet guardrails, blocking a bad IP range'],
    ]),
    SAY('Security groups referencing other security groups are the cleanest least-privilege network design: no IP lists to maintain as tasks scale.'),
  ),
  K('Connecting VPCs and reaching AWS services privately',
    T(['Option', 'What it does'], [
      ['**Gateway endpoint** (S3, DynamoDB)', 'route-table entry to the service, free, avoids NAT charges'],
      ['**Interface endpoint / PrivateLink**', 'an ENI with a private IP for an AWS service (SQS, Secrets Manager, ECR) or a partner/your own service'],
      ['**VPC peering**', '1:1 private connection between two VPCs; not transitive'],
      ['**Transit Gateway**', 'hub-and-spoke router for many VPCs and on-prem connections'],
      ['**Site-to-Site VPN / Direct Connect**', 'encrypted tunnel over the internet / dedicated private line to on-prem'],
    ]),
  ),
  K('ALB vs NLB vs Gateway Load Balancer',
    T(['', 'ALB', 'NLB', 'GWLB'], [
      ['Layer', '7 (HTTP/HTTPS, gRPC, WebSocket)', '4 (TCP/UDP/TLS)', '3 (IP packets)'],
      ['Routing', 'host, path, header, query, weighted target groups', 'by port', 'to inspection appliances'],
      ['Extras', 'auth with Cognito/OIDC, WAF, redirects, fixed responses', 'static/Elastic IPs, millions of req/s, preserves client IP, PrivateLink', 'firewalls, IDS'],
      ['Use for', 'web apps and APIs', 'extreme throughput, non-HTTP protocols, static IPs', 'third-party network appliances'],
    ]),
    L('Health checks remove bad targets; **connection draining (deregistration delay)** lets in-flight requests finish during deploys.',
      'Cross-zone load balancing spreads evenly across AZs (on by default for ALB).'),
  ),
  K('Route 53 routing policies and health checks',
    T(['Policy', 'Use'], [
      ['Simple', 'one record, no health checks'],
      ['Weighted', 'canary or A/B between endpoints (e.g. 90/10)'],
      ['Latency', 'send users to the region with lowest latency'],
      ['Failover', 'primary/secondary with health checks for DR'],
      ['Geolocation / geoproximity', 'by user country / distance (compliance, localisation)'],
      ['Multivalue answer', 'up to 8 healthy records, simple client-side spreading'],
    ]),
    P('**Alias records** point the zone apex (`example.com`) at AWS resources (ALB, CloudFront, S3 website) for free; a CNAME cannot be used at the apex.'),
  ),
  K('CloudFront: what it does beyond caching',
    CS.cdn,
    L('Caches at 600+ edge locations; origins can be S3 (with **Origin Access Control**, bucket stays private), ALB, API Gateway or any HTTP server.',
      '**Cache policies** decide the cache key (which headers, cookies, query strings). Fewer keys = higher hit ratio.',
      'Invalidate paths after deploys, or better, use content-hashed filenames and long TTLs.',
      'Edge compute: **CloudFront Functions** (tiny JS, header rewrites, redirects) and **Lambda@Edge** (heavier logic).',
      'TLS via ACM (certificate in us-east-1), HTTP/3, WAF and Shield attached at the edge, signed URLs/cookies for private content.'),
  ),
  K('API Gateway: REST vs HTTP vs WebSocket APIs',
    T(['', 'HTTP API', 'REST API', 'WebSocket API'], [
      ['Cost / latency', 'cheaper, faster', 'more expensive', 'per message + connection minutes'],
      ['Features', 'JWT authorizers, Lambda/HTTP integrations, CORS', 'API keys + usage plans, request validation, transformations, caching, WAF, private APIs', 'persistent two-way connections; routes by message'],
      ['Pick when', 'most new Lambda-backed APIs', 'you need its extra features', 'chat, live dashboards'],
    ]),
    L('Throttling per account/stage/route (token bucket); returns 429.',
      'Default integration timeout 29 s: long work goes async (queue + polling/WebSocket).'),
  ),
  quiz('Lambda functions in private subnets need to read from S3 and DynamoDB. NAT costs are high. What should you add?',
    ['An Internet Gateway on the private subnets', 'Gateway VPC endpoints for S3 and DynamoDB', 'A second NAT gateway', 'VPC peering to S3'],
    1, 'Gateway endpoints add routes to S3/DynamoDB inside the VPC at no charge, so that traffic no longer goes through the NAT gateway.'),
];

// ───────────────────────────────────────────── 5. Storage
export const storage = [
  K('S3 fundamentals: buckets, keys, consistency and durability',
    L('Objects (up to 5 TB) in buckets; keys are just strings (`/` is a convention, not a folder).',
      '**Durability** 11 nines (data copied across ≥3 AZs in most classes); availability 99.9–99.99%.',
      '**Strong read-after-write consistency** for every PUT, DELETE and LIST.',
      'Upload big files with **multipart upload** (parallel parts, resumable); speed up distant uploads with Transfer Acceleration.',
      'Performance: thousands of requests/s **per prefix**; spread hot keys across prefixes if you need more.'),
    C(`import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({});
export async function uploadUrl(userId, fileName, type) {
  const Key = \`uploads/\${userId}/\${crypto.randomUUID()}-\${fileName}\`;
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: 'my-uploads', Key, ContentType: type }), { expiresIn: 300 });
  return { url, key: Key };      // the browser PUTs the file straight to S3
}`, 'Presigned upload URL (Node, AWS SDK v3)'),
  ),
  K('S3 storage classes and lifecycle rules',
    T(['Class', 'For', 'Retrieval'], [
      ['Standard', 'hot data', 'ms'],
      ['Intelligent-Tiering', 'unknown/changing access: moves objects between tiers automatically', 'ms (archive tiers optional)'],
      ['Standard-IA / One Zone-IA', 'infrequent access, still needs ms reads (One Zone: one AZ, cheaper, re-creatable data)', 'ms, per-GB retrieval fee'],
      ['Glacier Instant Retrieval', 'archives read a few times a year', 'ms'],
      ['Glacier Flexible Retrieval', 'backups/archives', 'minutes to hours'],
      ['Glacier Deep Archive', 'compliance archives, cheapest', 'up to 12–48 hours'],
    ]),
    P('**Lifecycle rules** transition objects between classes after N days and expire old objects or old versions, e.g. logs: Standard → IA at 30 days → Glacier at 90 → delete at 365.'),
  ),
  K('S3 security and data protection',
    L('**Block Public Access** on (account level). Serve public content through CloudFront with Origin Access Control instead of public buckets.',
      'Access = IAM policies **and** bucket policies (resource-based; needed for cross-account). ACLs are legacy: keep "bucket owner enforced".',
      'Encryption: SSE-S3 by default; SSE-KMS for key control and audit; enforce TLS with a bucket policy condition `aws:SecureTransport`.',
      '**Versioning** protects from overwrites/deletes; **MFA delete** and **Object Lock** (WORM) for ransomware/compliance protection.',
      '**Replication** (same-region or cross-region) for DR, compliance or latency.',
      '**Event notifications** (to Lambda, SQS, SNS or EventBridge) on object create/delete drive processing pipelines.'),
  ),
  diagram('Direct upload to S3 and event-driven processing', AWS.upload),
  K('EBS vs EFS vs instance store vs FSx',
    T(['Storage', 'Type', 'Shared?', 'Use for'], [
      ['EBS (gp3, io2)', 'block, one AZ', 'one instance (io2 Multi-Attach is niche)', 'boot volumes, databases on EC2'],
      ['Instance store', 'block, physically attached', 'no, lost on stop', 'caches, scratch, replicated data stores'],
      ['EFS', 'NFS file system, multi-AZ', 'yes, thousands of clients incl. Lambda and Fargate', 'shared content, CMS uploads, ML data'],
      ['FSx (Windows, Lustre, NetApp ONTAP, OpenZFS)', 'managed file systems', 'yes', 'Windows SMB, HPC (Lustre), lift-and-shift NAS'],
    ]),
    P('Back everything up with **AWS Backup** (central policies, cross-region and cross-account copies, vault lock).'),
  ),
  quiz('Users upload 2 GB videos through your API servers, which run out of memory and bandwidth. Best fix?',
    ['Bigger instances', 'Presigned S3 URLs so clients upload directly, with multipart upload', 'Store videos in DynamoDB', 'Use EFS'],
    1, 'The file bypasses your servers entirely; S3 scales the upload, and an S3 event can trigger processing afterwards.'),
];
