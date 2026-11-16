// Audio overview of the SQL and Databases guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the SQL and Databases guide. Everything in the guide was run against a real PostgreSQL database, so the behaviour described here is what the database actually did, not what a textbook says it should do.

There are eight sections. Relational basics, indexing, transactions and isolation, query puzzles, schema design and migrations, performance and scaling, using PostgreSQL from Node, and finally what lies beyond relational databases.

Database questions in interviews are rarely about syntax. They are about predicting what the database will do: which rows come back, which index is used, and what happens when two requests arrive at the same moment. Listen for those predictions.`,

  chapters: {
    sq1: `Relational basics begin with constraints. A constraint is a rule the database checks on every write, from every application, every script and every person who connects. Your application can check too, but only the database sees all the writes. That is the reason to let it enforce primary keys, foreign keys and uniqueness.

Normalising means storing each fact once, so that changing it is one update and two copies can never disagree. You denormalise on purpose, when you have measured a read that is too slow, and you accept the job of keeping the copies in step.

Joins are best remembered with one awkward example: an employee with no department, and a department with no employees. An inner join drops both. A left join keeps the employee. A right join keeps the department. A full join keeps both.

Then NULL. It means unknown, not empty. Comparing anything with an unknown gives unknown, and a WHERE clause treats that as not true. So SQL has three valued logic, and you test for NULL with IS NULL, never with equals.

The order of evaluation explains most confusing errors. You write SELECT first, but the database runs it near the end. FROM and JOIN build the rows, WHERE filters them, GROUP BY groups them, HAVING filters the groups, and only then does SELECT run. So WHERE filters rows before grouping, and HAVING filters groups after.

One quiz to keep: counting a column skips NULLs, and counting rows does not. With twelve employees and one missing department, the two counts are eleven and twelve.`,

    sq2: `Indexing is the section most likely to come up in a backend interview.

The default index is a B tree. It keeps keys sorted in a shallow, wide tree, so finding one key takes three or four page reads, even with millions of rows, instead of reading the whole table.

A composite index covers more than one column, and its order matters. An index on customer and then date is sorted by customer first, and by date only within each customer. It can search on the first column, or on both, but not on the second column alone. That is the leftmost prefix rule.

Two refinements. A covering index holds every column a query needs, so the database answers from the index without touching the table. A partial index covers only the rows that match a condition, such as unpaid orders, which keeps it small.

When a query is not using your index, look at the plan before guessing. A common cause is a function wrapped around the column, which hides it from the index. To read a plan, ask the database to explain and analyse the query. Read the result as a tree from the leaves up, and compare the rows it estimated with the rows it actually found.

Other index types exist for data you do not compare as a simple value: documents, arrays, text search and ranges. The default is right far more often than not.

And indexes are not free. Each one is another structure to update on every insert, on updates to its columns, and on delete. Reads get faster and writes get slower.`,

    sq3: `Transactions and isolation is where senior candidates are separated from the rest.

ACID in practice: atomicity and durability are what people mean when they say it is safe once the commit returns. Isolation is the subtle one. It is a dial, not a switch.

The classic bug is the lost update. The application reads a balance, computes a new value and writes it back. Two requests interleave, and one overwrites the other. There are two ways to prevent it. Do the arithmetic inside a single update statement, so the database does the read and write together. Or lock the row when you read it.

PostgreSQL has three useful levels. Read committed is the default, and each statement sees data committed before it began. Repeatable read gives the whole transaction one snapshot. Serializable behaves as if transactions ran one after another. PostgreSQL never allows a dirty read, even if you ask for the weakest level. The rule to say: if you use repeatable read or serializable, wrap the transaction in a retry loop, because the database will sometimes abort one transaction to stay correct.

Write skew is the anomaly to name. The rule is that at least one doctor stays on call. Two transactions each see two doctors, each takes a different one off, and now nobody is on call. Only serializable prevents it.

Underneath is multi version concurrency control. An update writes a new version of a row instead of changing it in place, so readers and writers do not block each other.

Last, row locks. Locking rows for update makes other writers wait. Skip locked passes over rows already locked, which is how a job queue is built on a table.`,

    sq4: `The query puzzles section starts with a method. Restate the question and ask about the edge cases: ties, NULLs, empty groups and duplicates. Then name the grain of the result. One row per what? Per customer, per month, per department? Most wrong answers have the wrong grain.

Now the patterns, without the syntax.

Second highest salary: decide what happens with ties, and work with distinct values. Top two per department: number the rows within each department using a window function, then keep the first two. A running total: a window function that sums in date order. Month over month change: a window function that looks back one row.

Finding duplicates: group and keep the groups with more than one row. To delete all but the lowest id, delete rows for which a lower id with the same email exists.

Customers who never ordered: use NOT EXISTS. The guide explains why NOT IN is dangerous. If the list contains a single NULL, the comparison becomes unknown and you get no rows at all.

Counts by status as columns: a conditional count for each status. The latest order per customer is the top one per group again. Everyone who reports to a manager, directly or indirectly: a recursive query that walks down the chain and counts depth. Overlapping bookings: two bookings overlap when each starts before the other ends. And the longest login streak is the classic gaps and islands puzzle.

One rule to keep from the quiz. You cannot filter on a window function in the same WHERE, because WHERE runs first. Wrap it in an outer query.`,

    sq5: `Schema design and migrations is a short section with practical rules.

Relationships first. For one to many, the many side holds a foreign key to the one side. For many to many, a join table holds a pair of foreign keys, with a composite primary key so the same pair cannot be stored twice.

Keys. The guide measured two tables of two hundred thousand rows. The index on random identifiers was about twice the size of the one on integers, and random inserts touch pages all over the index. Random identifiers still have their uses, such as when ids are created outside the database or must not be guessable. Know the cost when you choose them.

A JSON column is right for data whose shape varies or is owned by someone else: webhook payloads, user defined fields, a document you only store and display. It is wrong for data you filter, join and constrain. That belongs in real columns.

Changing a schema with no downtime rests on one fact. During a deploy, old and new versions of the application run against the same database, so every migration must work for both. The pattern is expand, migrate, contract. Add the new structure, move the data and switch the code over, and only then remove the old structure.

Finally, pagination. An offset makes the database produce and throw away all the earlier rows, so deep pages get slow. Keyset pagination remembers the last row you saw and asks for the rows after it, which stays fast however deep you go.`,

    sq6: `Performance and scaling opens with a scenario. A query that took fifty milliseconds now takes five seconds. What do you do?

Reproduce it with the real parameters, and ask the database for the plan with actual timings. Read from the leaves up, and compare estimated rows with actual rows. A big gap points at stale statistics, and that is the quiz answer too: if the plan expected a hundred rows and found a hundred thousand, refresh the table's statistics.

The N plus one problem is one query to fetch a list, then one more query per row to fetch something related. Each query is fast, so nothing looks slow in isolation. You find it by counting queries per request.

Connection pooling matters because a PostgreSQL connection is a whole process. It costs memory and a handshake to open, and the server allows a fixed number. Serverless functions and many Node instances can exhaust that number quickly, so they share connections through a pool.

Read replicas. A primary accepts writes and streams its changes to replicas that serve reads. Reads scale out and writes do not. Replication is usually asynchronous, so a replica can be slightly behind, and a user may not see what they just saved. Read your own writes from the primary.

Then partitioning and sharding. Partitioning splits one big table into pieces inside one database. Sharding spreads data across several databases. The order of escalation is: fix queries and indexes, add a cache, add read replicas, partition big tables, and only then consider sharding. Most systems never reach the last step.`,

    sq7: `Section seven is about using PostgreSQL from Node, and it starts with injection.

SQL injection happens when user input is joined into the text of a query, so the input is parsed as SQL. It is prevented by parameters. The query text and the values travel separately, so a value can never become code.

Transactions have a trap in Node. A transaction belongs to one connection. So you must check one client out of the pool, run begin, every statement and commit on that same client, and then release it. If you send those statements through the pool directly, each may run on a different connection, and you do not have a transaction at all.

Serialization failures and deadlocks are expected, not bugs. The database aborts one transaction to keep the data correct, and gives you a specific error code. The right response is to retry the whole transaction, a limited number of times.

Idempotent writes. A request can arrive twice: a client retries after a timeout, or a queue redelivers. An idempotent write has the same effect once or many times. The simplest tool is a unique constraint, with an insert that does nothing on conflict.

And the tooling question: an object relational mapper, a query builder or raw SQL. A common answer is to use the mapper or builder for ordinary create, read, update and delete, and raw SQL for reports and hard queries. Whatever you pick, look at the SQL it generates.`,

    sq8: `The final section looks beyond relational databases.

When is a relational database the wrong default? Less often than people think. PostgreSQL has document columns, full text search, notifications and extensions. So the honest first question is whether you have outgrown it, or just not used what it offers. The quiz makes the same point. For a new product with relational data and no extreme scale, the defensible default is PostgreSQL: integrity, transactions and rich queries.

In a document database, modelling turns around. In SQL you model the entities and join when you read. In a document store you model the queries, and shape the data so that one read returns what a screen needs. Embedding related data makes reads fast, and it makes updates to shared data harder.

The CAP theorem says that when the network partitions, a distributed store must choose between consistency, where every read sees the latest write, and availability, where every request gets an answer. PACELC adds the everyday case. Even without a partition, you trade latency against consistency.

Then Redis. It keeps data in memory, so it is fast, and the data set must fit in memory. It has options for persistence, but it is usually a secondary store whose contents can be rebuilt. Beyond caching, it is used for rate limiting, short lived locks, queues and counters.

That is the whole guide. The best next step is to open the SQL cards and run the queries yourself.`,
  },
};
