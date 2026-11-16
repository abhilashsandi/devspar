// Audio overview of the AWS guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the AWS guide. AWS has hundreds of services, and nobody is asked about all of them. Interviews for full stack and backend roles come back to about twenty, and to one skill: choosing between them and saying why.

So this overview is organised around choices. Which compute service, which database, which load balancer, which queue, and what each choice costs.

There are eleven sections. Foundations and accounts, identity and security, compute, networking and the edge, storage, databases and caching, messaging, observability and delivery, reliability with disaster recovery and cost, reference architectures, and scenarios.

A warning that applies throughout: limits and prices change, so treat specific numbers as defaults to verify.`,

  chapters: {
    aws1: `Section one is foundations.

A Region is a separate geographic area with its own copy of most services. Data stays in a Region unless you move it. An Availability Zone is one or more data centres within a Region, isolated from the others, so that a failure in one does not take down the rest. Edge locations are the many smaller sites around the world that serve cached content close to users. The design consequence is simple: run in at least two zones for availability, and choose the Region for latency, for legal requirements about where data lives, and for cost.

The shared responsibility model says who secures what. AWS secures the cloud: the hardware, the facilities, and the internals of managed services. You secure what you put in the cloud: your data, your identity settings, your network rules and your configuration. Most breaches come from the customer's side of that line.

For structure, use many accounts under one organisation. The account is the strongest isolation boundary, for blast radius, for quotas and for billing. A typical layout separates production from development, and keeps security and logging in accounts of their own.

On cost, you pay for what you use, with discounts for commitment. Name the hidden costs: data transfer out, traffic between zones, NAT gateway processing, idle resources, logs that are kept forever, and oversized databases.

And the Well Architected Framework has six pillars: operational excellence, security, reliability, performance efficiency, cost optimisation and sustainability. It is a useful checklist for reviewing any design.`,

    aws2: `Section two is identity and security.

Four terms. A user is a long lived identity for a person. A group is a collection of users that share permissions. A role is an identity with no permanent credentials, which something assumes for a while. A policy is a document that says which actions are allowed on which resources. The principle is least privilege: grant only what is needed, on only the resources needed.

A role has two parts. The trust policy says who may assume it: a service such as Lambda, another account, or a federated identity such as a deployment pipeline. The permissions policy says what it may do once assumed. Assuming a role returns temporary credentials, which expire by themselves.

That gives the answer to a classic quiz. An application on a server needs to read one storage bucket. Do not create a user and put its keys in an environment variable. Attach a role to the instance, with a policy scoped to that bucket.

How does AWS decide? Everything is denied by default. An allow in a policy grants access. And an explicit deny anywhere wins over any allow. So if an organisation wide policy denies deleting objects, a user whose own policy allows everything still cannot delete.

For encryption, the key service manages keys, and they never leave it unencrypted. Envelope encryption means your data is encrypted with a data key, and that data key is itself encrypted with a key held in the key service.

For secrets, give each function or task read access to only its own, load them at start up, and cache them for a while. And at the edge, a web application firewall filters malicious requests.`,

    aws3: `Section three is compute, and the first question is which service to choose.

The guide gives a sentence you can say almost as it is. My default for a web API is containers on Fargate behind an application load balancer. I use Lambda for event driven glue and spiky workloads. And I use Kubernetes only when the organisation already runs it, or needs what it offers.

Behind that sentence are the services. EC2 is virtual machines. You choose an instance family for the workload: general purpose, compute, memory, storage or accelerated. You have full control, and the full burden of patching and scaling.

An Auto Scaling group keeps a desired number of instances between a minimum and a maximum, spread across zones, and replaces unhealthy ones. Scaling policies add or remove instances. The simplest tracks a target, such as average processor use.

ECS runs containers. The task definition is the specification of a container: the image, processor and memory, ports, environment and secrets. It names two roles that people confuse. The task role is what your application may do. The execution role is what the platform needs to pull the image and write logs. A service keeps a number of tasks running. With Fargate you do not manage servers at all.

Lambda runs a function per event. Concurrency means requests in flight, and there is an account wide default limit of about a thousand per Region. Reserved concurrency caps or guarantees a function. Provisioned concurrency keeps instances warm, to avoid cold starts.

The quiz ties this together. A resize function that floods under a burst of uploads and throttles other functions needs a queue in front of it, and reserved concurrency.`,

    aws4: `Section four is networking and the edge.

A VPC is your private network in a Region. It is divided into subnets, and each subnet lives in one zone. A subnet is public only because its route table has a route to an internet gateway. A private subnet reaches the internet outwards through a NAT gateway, and cannot be reached from outside. The standard three tier layout puts load balancers in public subnets, and application servers and databases in private ones, across at least two zones.

Two firewalls. A security group is attached to a resource and is stateful, so replies are allowed automatically. A network access list is attached to a subnet and is stateless. The cleanest design has security groups that refer to other security groups, so there are no address lists to maintain. The database accepts traffic only from the application's group.

Three load balancers. The application load balancer understands HTTP and routes by path or host. The network load balancer works at the connection level, handles extreme throughput and offers fixed addresses, which is the quiz answer when a partner needs addresses for their firewall. The gateway load balancer is for inserting security appliances.

Route 53 is the name service, with routing by latency, by weight or for failover, driven by health checks.

CloudFront caches at edge locations, and does more than cache. It terminates encryption close to users, can keep a storage bucket private behind it, and runs small functions at the edge.

API Gateway throttles requests, and has a default integration timeout of twenty nine seconds, so long work must go asynchronous.

One cost saving quiz: private functions that only need storage and DynamoDB should use gateway endpoints, not a NAT gateway.`,

    aws5: `Section five is storage, mostly S3.

S3 stores objects in buckets. An object can be up to five terabytes. A key is just a string. The slashes in it are a convention, not real folders. Durability is designed at eleven nines, because data is copied across at least three zones in most storage classes. And it now gives strong consistency: after a successful write, a read returns the new object.

Storage classes trade price against how quickly and how often you access the data. Standard for frequent access. Infrequent access for data you rarely read. The archive classes for data you almost never read, where retrieval can take minutes or hours. Lifecycle rules move objects between classes automatically as they age, and delete old ones. Logs are the classic example: standard at first, infrequent access after a month, archive later, deleted after a year or so.

For security, keep the block public access setting on at the account level. Serve public content through CloudFront, with the bucket kept private, and never through a public bucket. Turn on versioning to protect against accidental deletion, and encryption by default.

The pattern everyone should know is the direct upload. Do not push large files through your API servers. The client asks your API for a presigned address, and uploads straight to S3, in parts for large files. When the upload completes, an event triggers processing. That is also the answer to the quiz about servers running out of memory on two gigabyte videos.

The other storage types in brief. A block volume is a disk for one instance. A shared file system can be mounted by many. Instance store is fast and temporary, and its data is lost when the instance stops.`,

    aws6: `Section six is databases and caching.

The guide's sentence for choosing: I default to Aurora with PostgreSQL for core business data, and add DynamoDB where an access pattern needs massive scale with simple key lookups.

RDS is the managed relational service, and Aurora is the AWS built engine that is compatible with PostgreSQL and MySQL, with faster failover and storage that grows by itself. Two features are constantly confused. Multi AZ is for high availability: a standby that is kept in step synchronously, and takes over on failure. A read replica is for scaling reads: it is asynchronous, readable, and can be promoted. One protects you. The other speeds you up.

RDS Proxy pools connections. It is the first fix when a Lambda based API fails with too many connections during a spike, because each concurrent function instance opens its own.

DynamoDB is a key value and document store. Items are found by a partition key, with an optional sort key for range queries within a partition. A query reads one partition by key and is fast. A scan reads the whole table and is not. So you design from the access patterns: list every query first, then shape the keys. Choose a partition key with many distinct values. For orders queried by customer, that is the customer id, not the status or the country.

For capacity, on demand mode charges per request and scales instantly, which suits new or spiky tables. Provisioned mode is cheaper at steady load. Reads are eventually consistent by default, with strong consistency as an option.

And ElastiCache is managed Redis. The default pattern is cache aside with an expiry time.`,

    aws7: `Section seven is messaging and integration.

SQS is the queue. A consumer receives a message, which then becomes invisible to others for the visibility timeout. The consumer must delete it after success. If it does not, the message reappears and is retried. That explains a quiz: messages processed twice usually mean the visibility timeout is shorter than the processing time. A standard queue offers very high throughput, delivers at least once, and does not promise order. A FIFO queue preserves order and removes duplicates, at lower throughput. After a set number of failures, a message moves to a dead letter queue.

SNS is publish and subscribe. A topic pushes each message to all its subscribers. The fan out pattern puts a topic in front of several queues, one per consumer. Each consumer then has its own retries and its own pace, and one failing consumer does not affect the others. That is the quiz answer for an order service that must notify billing, email and analytics independently.

EventBridge is an event bus with rules that route events by their content, including events from AWS services and outside partners.

Kinesis is a stream: an ordered log, kept for a retention period, that several independent consumers can read and replay. Choose it over a queue when you need ordering per key and replay.

Step Functions is orchestration. A state machine of tasks, choices, parallel branches and waits, with retries and error handling built in. It is a natural home for a saga, with a compensating step for each action.

The rules that keep event driven systems sane: events are facts in the past tense, they carry a version and an id, and consumers are idempotent.`,

    aws8: `Section eight is observability and delivery.

Three services answer three different questions. CloudWatch answers: what is happening? It holds metrics, logs, dashboards and alarms. X-Ray answers: where did the time go? It traces a request across services. CloudTrail answers: who did what? It records every API call with the identity, the time and the source. So when someone asks who deleted a production bucket, you look in CloudTrail first.

The guide flags a trap that costs real money. Set a retention period on every log group, because the default is to keep logs forever. And avoid metrics with very high cardinality, such as one per user id.

Infrastructure as code. CloudFormation is the native service: you declare resources in a template, and AWS creates, updates and rolls them back as a stack. The CDK lets you define the same infrastructure in a programming language such as TypeScript, and generates CloudFormation. Terraform is the popular tool that works across cloud providers, with its own state. SAM is a shorthand for serverless applications. Whichever you use, the point is that infrastructure is reviewed, versioned and reproducible, and nobody makes changes by hand in the console.

A delivery pipeline looks like this. Build and test. Push the image to the container registry. Deploy to staging. Run automated tests. Then promote to production, automatically or after approval.

Safe deployment means limiting the damage of a bad release. Rolling updates replace tasks a few at a time. Blue green keeps the old version running until the new one is proven. Canary shifts a small share of traffic first, and rolls back automatically if alarms fire.`,

    aws9: `Section nine is reliability, disaster recovery and cost.

High availability starts with zones. Run every tier in at least two, ideally three: the load balancer, the application tier, the database with a standby or replicas, and the cache. Prefer managed regional services, which spread across zones for you. Make instances stateless and replaceable. And let health checks and automation do the recovery, because the quiz question says with no manual action.

Disaster recovery is defined by two numbers. The recovery time objective is how long until service is back. The recovery point objective is how much data, measured in time, you can afford to lose.

There are four strategies, in order of rising cost and falling recovery time. Backup and restore: cheapest, and recovery takes hours. Pilot light: the data is replicated continuously, and a minimal core is ready to be scaled up. Warm standby: a small but complete copy is always running. Multi site active active: full capacity in more than one Region, with almost no downtime, at the highest cost.

The quiz gives a worked example. A business that can tolerate fifteen minutes of downtime and one minute of data loss, at moderate cost, needs pilot light or warm standby with continuous replication. And whatever you choose, automate the failover and test it. An untested plan is a hope.

Cost optimisation is a checklist. Get visibility first, with tags, budgets and alerts. Right size what is oversized. Commit to steady usage for a discount, and use spare capacity for work that can be interrupted. Turn off what is idle. Move old data to cheaper storage. And watch data transfer.`,

    aws10: `Section ten is reference architectures, five shapes worth being able to draw.

The serverless API with an async worker. A gateway in front of a function for the fast path. Slow work goes onto a queue, and a second function consumes it. The client gets an immediate reply, and learns the result later.

The containerised web app for millions of users. The name service routes users, by latency or for failover. A content delivery network with a web application firewall sits at the front, serving static assets from a private storage bucket. An application load balancer in public subnets across three zones sends traffic to container services in private subnets. Behind them: a relational database with a standby and read replicas, a cache, and queues for background work.

Hosting a Next.js or React app. There are several options, from a managed hosting service to containers. Whatever the option, the rules are the same. Cache the hashed static assets for a year at the edge. Keep pages short lived or revalidated. And keep secrets in a secrets service, never in the build.

Multi tenant software as a service. Put the tenant id in the user's token. Then enforce it in every query, and back it with a second mechanism, such as conditions in identity policies or row level security in the database, so that one missed filter cannot leak another tenant's data.

And the data and analytics pipeline. Ingest events through a stream, and capture changes from databases. Land the raw data in a storage bucket, the data lake, partitioned by date in a columnar format. Then catalogue it, transform it, and query it in place or load it into a warehouse.`,

    aws11: `The final section is scenarios, where you apply the rest.

Our monthly bill doubled. What do you do? Open the cost explorer, group by service, then by usage type and by tag, and compare the two months. That narrows it quickly. The common culprits are NAT gateway data processing, data transfer, logs that grow without limit, a forgotten environment, or a database that was scaled up and never brought back down. Fix the cause, then add a budget alert, so that you hear about it within days next time.

The API is slow at peak. How do you investigate? Start from the dashboards: latency at the fiftieth, ninety fifth and ninety ninth percentiles, and the error rate, for each endpoint. Then traces, which show which hop is slow: the application's processor, the database, a cold start, or a downstream call. Then look at saturation: connections, concurrency limits and throttling. Fix the bottleneck you found, and not the one you guessed.

Design a simple file sharing service. Uploads and downloads use presigned addresses, in parts for large files, so files never pass through your servers. Metadata, meaning the owner, the folder tree, sharing and versions, lives in a database. Events from the storage bucket trigger scanning and thumbnails. Sharing is a short lived link, or a permission record that is checked before a link is issued.

Three quiz reminders to finish. Fixed addresses for a partner's allow list: the network load balancer. Ordering per key with several consumers that can replay: Kinesis. And surviving the loss of a whole zone with no manual action: every tier across several zones, with health checked load balancing and a multi zone data store.`,
  },
};
