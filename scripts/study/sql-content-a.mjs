// Data and SQL guide, part A: relational basics, indexing, transactions.
// Every statement and output was run on PostgreSQL 17.6 (Docker) on 15 Nov 2026 against a seeded lab database
// (12 employees, 2,000 customers, 200,000 orders). Plans are trimmed; timings and costs vary between runs.
import { P, L, N, T, C, SAY, TRAP, K, GO, RAPID, QUIZ, DIAGRAM, NOTE, SAMPLE } from './cc-kit.mjs';
import { SQ } from './dg-sql.mjs';
import { WB } from './dg-wb.mjs';

// ───────────────────────────────────────────── 1. relational basics
export const basics = [
  K('What do primary keys, foreign keys and constraints guarantee, and why let the database enforce them?',
    P('A **constraint** is a rule the database checks on every write, from every application, script and person that connects. The application can check too, but only the database cannot be bypassed.'),
    T(['Constraint', 'Guarantees', 'Violation in the lab'], [
      ['`PRIMARY KEY`', 'Each row is unique and not null; gives a stable identity', ''],
      ['`FOREIGN KEY`', 'A reference points at a row that exists, and a referenced row cannot vanish', '`Key (department_id)=(99) is not present in table "departments".`'],
      ['`UNIQUE`', 'No two rows share the value', '`Key (email)=(user1@example.com) already exists.`'],
      ['`CHECK`', 'A rule about the row, such as `balance_cents >= 0`', '`Failing row contains (1, Ada, -5).`'],
      ['`NOT NULL`', 'A value must be present', '`null value in column "name" of relation "departments" violates not-null constraint`'],
    ]),
    SAMPLE('Two real errors', `insert into employees (name, department_id, salary, hired_on) values ('Zed', 99, 1, '2020-01-01');
ERROR: insert or update on table "employees" violates foreign key constraint "employees_department_id_fkey"
DETAIL: Key (department_id)=(99) is not present in table "departments".

delete from departments where id = 1;
ERROR: update or delete on table "departments" violates foreign key constraint "employees_department_id_fkey" on table "employees"
DETAIL: Key (id)=(1) is still referenced from table "employees".`),
    L('**Why enforce in the database:** two services, a migration script and a late-night fix by hand will all write to the same tables. Application-only checks drift apart.', '**Cost:** a check on every write, and a foreign key needs an index on the referencing column or deletes from the parent get slow.', 'Application validation still matters for friendly error messages. The constraint is the backstop.'),
    NOTE('Every output in this guide was captured on 15 Nov 2026 from PostgreSQL 17.6 in Docker, on a seeded database with 200,000 orders. Plans are trimmed and the timings vary from run to run, so read the plan shape and the row counts, not the milliseconds. Other databases and versions differ, and where it matters the card says so.'),
  ),
  K('What is normalisation, and when do you denormalise on purpose?',
    P('**Normalising** means storing each fact once, so that changing it is one update and cannot leave two copies disagreeing.'),
    T(['Form', 'Rule', 'A violation'], [
      ['**1NF**', 'One value per column, no repeating groups', 'A `phones` column holding `"555-1, 555-2"`'],
      ['**2NF**', 'Every column depends on the whole key', 'In `order_items(order_id, product_id, product_name)`, the name depends on `product_id` only'],
      ['**3NF**', 'Columns depend on the key, not on each other', '`employees` holding both `department_id` and `department_name`'],
    ]),
    P('**Denormalise on purpose** when you have measured a read that is too slow and a join cannot fix it:'),
    L('A stored `order_total` copied from the line items, so a list page does not sum them.', 'A counter such as `comment_count`, updated in the same transaction.', 'A read model or cache built for one screen.'),
    TRAP('Every copy is a promise to keep it in sync. Say who updates it, in which transaction, and what repairs it when it drifts.'),
    GO(['/system-design', 'System Design: data modelling']),
  ),
  DIAGRAM('Inner, left, right and full joins', SQ.joins,
    P('The tables are the lab’s `employees` and `departments`. One employee (Nora) has no department and one department (Finance) has no employees. Each join answers a different question about those two unmatched rows.'),
    C(`select e.name, d.name as department
from employees e
inner join departments d on d.id = e.department_id
where e.id in (1, 6, 12) order by e.id;`, 'INNER: only matched rows'),
    SAMPLE('Result', `name | department
-----+------------
Ada  | Engineering
Sam  | Sales
(2 rows)`),
    C(`-- LEFT: every employee, department or not
... from employees e left join departments d on d.id = e.department_id ...`, 'LEFT: keep the left side'),
    SAMPLE('Result', `name | department
-----+------------
Ada  | Engineering
Sam  | Sales
Nora | NULL
(3 rows)`),
    C(`-- RIGHT: every department, employee or not
... from employees e right join departments d on d.id = e.department_id ...`, 'RIGHT: keep the right side'),
    SAMPLE('Result', `name | department
-----+------------
Ada  | Engineering
Sam  | Sales
NULL | Finance
(3 rows)`),
    L('**FULL** keeps both unmatched rows: Nora with a NULL department and Finance with a NULL employee, alongside the matched rows. In the lab it returned Ada, Sam, Finance and Nora for the same three employees plus the Finance department.', 'In practice `LEFT` covers most needs. Rewrite a `RIGHT` join as a `LEFT` by swapping the tables, and keep one direction through a query so it reads one way.', 'A filter on the right table in the `WHERE` of a `LEFT JOIN` turns it back into an inner join. Put it in the `ON` clause to keep the unmatched rows.'),
  ),
  K('Why does a comparison with NULL not behave like true or false?',
    P('`NULL` means **unknown**, not “empty”. Comparing anything with an unknown gives unknown, which `WHERE` treats as not true. SQL therefore has **three-valued logic**: true, false and unknown.'),
    C(`select null = null as eq,
       null is null as is_null,
       null is distinct from null as distinct_from,
       1 is distinct from null as one_vs_null;`, 'NULL = NULL is not true'),
    SAMPLE('Result', `eq   | is_null | distinct_from | one_vs_null
-----+---------+---------------+------------
NULL | true    | false         | true
(1 row)`),
    C(`select name from employees where department_id <> 1;            -- 5 rows, Nora missing
select name from employees where department_id is distinct from 1;  -- 6 rows, Nora included`, 'The row that disappears'),
    SAMPLE('Result of the first query', `name
----
Sam
Sue
Sid
Cora
Cal
(5 rows)`),
    L('Nora’s `department_id` is NULL, so `department_id <> 1` is unknown and her row is dropped. `IS DISTINCT FROM` treats NULL as an ordinary value and returns her.', '`count(*)` counts rows; `count(column)` counts non-null values; `NOT IN (subquery containing NULL)` returns nothing (see the puzzles).', 'Aggregates such as `sum` and `avg` skip NULLs. `sum` of no rows is NULL, not 0: use `coalesce(sum(x), 0)`.'),
  ),
  DIAGRAM('The order a SELECT is evaluated in', SQ.selectOrder,
    P('You write `SELECT` first, but the database evaluates it near the end. That explains most “why can’t I use this here” errors.'),
    N('**FROM and JOIN** build the set of rows.', '**WHERE** filters rows, before any grouping.', '**GROUP BY** collapses rows into groups.', '**HAVING** filters groups, after aggregation.', '**SELECT** computes the output columns, including window functions and aliases.', '**ORDER BY** sorts, and can use output aliases.', '**LIMIT** cuts the result.'),
    C(`select department_id as dept, count(*)
from employees where dept = 1 group by department_id;`, 'An alias in WHERE'),
    SAMPLE('Result', `ERROR: column "dept" does not exist`),
    P('The alias is created in step 5, after `WHERE` ran in step 2. `ORDER BY dept` works because sorting is step 6. PostgreSQL also lets `GROUP BY` use an alias, which is a convenience the standard does not promise.'),
  ),
  K('WHERE or HAVING: which filter goes where?',
    P('`WHERE` filters **rows before** they are grouped. `HAVING` filters **groups after** they are aggregated. A condition on a plain column belongs in `WHERE`, because it discards rows early and lets an index help.'),
    C(`-- WHERE: only well-paid rows are counted
select department_id, count(*) as n from employees
where salary > 80000 group by department_id order by department_id;

-- HAVING: departments that have more than 2 people, whatever they earn
select department_id, count(*) as n from employees
group by department_id having count(*) > 2 order by department_id;`, 'Two different questions'),
    SAMPLE('Result of the first query', `department_id | n
--------------+--
            1 | 5
            2 | 3
(2 rows)`),
    SAMPLE('Result of the second query', `department_id | n
--------------+--
            1 | 6
            2 | 3
(2 rows)`),
    L('Department 1 has 5 people earning over 80,000 but 6 people in total: Fiona earns 60,000. Same grouping, different question.', 'Rule: if the condition mentions an aggregate such as `count` or `sum`, it goes in `HAVING`. Otherwise it goes in `WHERE`.'),
  ),
  QUIZ('Eleven of twelve employees have a department_id; one has NULL. What does count(department_id) return?',
    ['12', '11', '1', 'NULL'], 1,
    'count(column) skips NULLs, so it returns 11. count(*) counts rows and returns 12. The lab printed all_rows 12 and with_department 11.'),
];

// ───────────────────────────────────────────── 2. indexing
export const indexing = [
  DIAGRAM('How a B-tree index makes a lookup fast', WB.btree,
    P('A B-tree keeps the keys **sorted** in a shallow, wide tree. Finding one key takes a few page reads (usually three or four, even for millions of rows) instead of reading the table.'),
    P('The lab’s `orders` table has 200,000 rows, and customer 42 has 102 of them.'),
    C(`explain (analyze, buffers) select * from orders where customer_id = 42;`, 'Before the index'),
    SAMPLE('Plan (trimmed)', `Seq Scan on orders  (cost=0.00..3992.00 rows=101 width=29) (actual rows=102 loops=1)
  Filter: (customer_id = 42)
  Rows Removed by Filter: 199898
  Buffers: shared hit=1492
Execution Time: 55.181 ms`),
    C(`create index orders_customer_id_idx on orders (customer_id);
analyze orders;
explain (analyze, buffers) select * from orders where customer_id = 42;`, 'After the index'),
    SAMPLE('Plan (trimmed)', `Bitmap Heap Scan on orders  (cost=5.09..325.86 rows=102 width=29) (actual rows=102 loops=1)
  Recheck Cond: (customer_id = 42)
  Heap Blocks: exact=102
  ->  Bitmap Index Scan on orders_customer_id_idx  (actual rows=102 loops=1)
        Index Cond: (customer_id = 42)
Execution Time: 1.365 ms`),
    L('Before: it read every row and threw away 199,898. After: it read the index, then 102 table blocks. About 55 ms became about 1.4 ms here (timings vary).', 'PostgreSQL chose a **bitmap** scan, not a plain index scan. It collects the matching row locations from the index, sorts them by page, then reads each page once. It is the usual choice when a lookup returns a hundred rows rather than one.', '**Cost:** the index takes space (the primary key index on this table is 4408 kB) and every insert, update of the column and delete must maintain it.'),
  ),
  DIAGRAM('A composite index and the leftmost-prefix rule', SQ.compositeIndex,
    P('A composite index on `(customer_id, created_at)` is sorted by `customer_id` first, and by `created_at` only **within** each customer. It can seek on the first column, or on both, but not on the second alone.'),
    C(`create index orders_cust_created_idx on orders (customer_id, created_at);
explain (analyze) select * from orders
where customer_id = 42 and created_at > '2025-01-01';`, 'Both columns: the index is used'),
    SAMPLE('Plan (trimmed)', `Bitmap Heap Scan on orders  (cost=4.54..49.49 rows=12 width=29) (actual rows=12 loops=1)
  ->  Bitmap Index Scan on orders_cust_created_idx  (actual rows=12 loops=1)
        Index Cond: ((customer_id = 42) AND (created_at > '2025-01-01 00:00:00+00'::timestamp with time zone))
Execution Time: 0.121 ms`),
    C(`explain (analyze) select * from orders where created_at > '2025-02-10';`, 'The second column alone'),
    SAMPLE('Plan (trimmed)', `Seq Scan on orders  (cost=0.00..3992.00 rows=4986 width=29) (actual rows=5120 loops=1)
  Filter: (created_at > '2025-02-10 00:00:00+00'::timestamp with time zone)
  Rows Removed by Filter: 194880
Execution Time: 43.036 ms`),
    L('**Order the columns** by equality first, then range, then sort: `(customer_id, created_at)` serves “this customer’s recent orders” and also `ORDER BY created_at` for one customer.', 'A query on `created_at` alone needs its own index. Do not assume one composite index covers both.'),
  ),
  K('What are covering and partial indexes?',
    P('A **covering index** holds every column a query needs, so PostgreSQL answers from the index without touching the table (an **index-only scan**). A **partial index** indexes only the rows that match a condition, so it is small and cheap.'),
    C(`create index orders_cust_cover_idx on orders (customer_id) include (total_cents);
vacuum analyze orders;
explain (analyze, buffers) select customer_id, total_cents from orders where customer_id = 42;`, 'Covering with INCLUDE'),
    SAMPLE('Plan (trimmed)', `Index Only Scan using orders_cust_cover_idx on orders  (actual rows=102 loops=1)
  Index Cond: (customer_id = 42)
  Heap Fetches: 0
Execution Time: 0.136 ms`),
    P('Ask for a column the index does not hold (`status`) and it goes back to the table:'),
    SAMPLE('Plan (trimmed)', `Bitmap Heap Scan on orders  (cost=5.20..323.12 rows=101 width=9) (actual rows=102 loops=1)
  Heap Blocks: exact=102
  ->  Bitmap Index Scan on orders_cust_cover_idx ...`),
    C(`create index orders_refunded_idx on orders (created_at) where status = 'refunded';
explain (analyze) select id from orders
where status = 'refunded' and created_at > '2025-02-01';`, 'Partial index'),
    SAMPLE('Plan (trimmed)', `Index Scan using orders_refunded_idx on orders  (cost=0.28..12.41 rows=179 width=8) (actual rows=189 loops=1)
  Index Cond: (created_at > '2025-02-01 00:00:00+00'::timestamp with time zone)
Execution Time: 0.224 ms`),
    L('The partial index is **104 kB**, against 4408 kB for the primary key index: only 4,000 of the 200,000 rows are refunded.', 'The query must repeat the index’s condition (`status = \'refunded\'`) or the planner cannot use it.', 'An index-only scan needs the **visibility map** to be current, which `VACUUM` maintains. On a table with heavy writes, `Heap Fetches` rises and the benefit shrinks.', 'Partial indexes also enforce rules such as “one active subscription per user”: `create unique index ... where status = \'active\'`.'),
  ),
  K('Why is my query not using the index?',
    P('Look at the plan before guessing. These are the usual reasons, and the first three were run in the lab.'),
    T(['Reason', 'Fix'], [
      ['A **function on the column**: `lower(email) = ...`', 'Index the expression, or store the value normalised'],
      ['A **type mismatch**: `customer_id = 42.0`', 'Compare like with like: `customer_id = 42`'],
      ['A **leading wildcard**: `like \'%42@example.com\'`', 'Use a trigram (GIN) index, or search differently'],
      ['**Low selectivity**: most rows match', 'The planner is right: a full scan is cheaper'],
      ['**Stale statistics**', '`ANALYZE`, and check autovacuum'],
    ]),
    C(`explain (analyze) select id from customers where lower(email) = 'user42@example.com';`, 'A function on the column'),
    SAMPLE('Plan (trimmed)', `Seq Scan on customers  (cost=0.00..47.00 rows=10 width=4) (actual rows=1 loops=1)
  Filter: (lower(email) = 'user42@example.com'::text)
  Rows Removed by Filter: 1999`),
    C(`create index customers_lower_email_idx on customers (lower(email));
explain (analyze) select id from customers where lower(email) = 'user42@example.com';`, 'After indexing the expression'),
    SAMPLE('Plan (trimmed)', `Index Scan using customers_lower_email_idx on customers  (cost=0.28..8.29 rows=1 width=4) (actual rows=1 loops=1)
  Index Cond: (lower(email) = 'user42@example.com'::text)`),
    C(`-- with an index on orders(customer_id) in place:
explain select * from orders where customer_id = 42.0;`, 'A type mismatch'),
    SAMPLE('Plan', `Gather  (cost=1000.00..4356.71 rows=1000 width=29)
  Workers Planned: 1
  ->  Parallel Seq Scan on orders  (cost=0.00..3256.71 rows=588 width=29)
        Filter: ((customer_id)::numeric = 42.0)`),
    P('The literal `42.0` is a `numeric`, so PostgreSQL cast the **column** to numeric for every row, which an index on the integer column cannot serve. The same happens with `customer_id::text = \'42\'`.'),
    C(`explain (analyze) select id from customers where email like '%42@example.com';`, 'A leading wildcard'),
    SAMPLE('Plan (trimmed)', `Seq Scan on customers  (cost=0.00..42.00 rows=20 width=4) (actual rows=20 loops=1)
  Filter: (email ~~ '%42@example.com'::text)
  Rows Removed by Filter: 1980`),
    L('A B-tree is sorted from the left, so it cannot find “ends with” or “contains”. For prefix matches such as `like \'user42%\'`, the index needs `text_pattern_ops` in a database with a non-C collation: without it the lab used a Seq Scan, with it a `Bitmap Index Scan` with `Index Cond: ((email ~>=~ \'user42\') AND (email ~<~ \'user43\'))`.', '**Low selectivity:** on the lab’s `status` column, `status = \'paid\'` (93% of rows) used a Seq Scan even with an index, while `status = \'refunded\'` (2%) used the index. The planner compares costs; it is not being stubborn.'),
  ),
  DIAGRAM('Reading EXPLAIN ANALYZE', SQ.planTree,
    P('`EXPLAIN` shows the plan the database *would* use. `EXPLAIN (ANALYZE, BUFFERS)` **runs** the query and adds what actually happened. Read it as a tree from the leaves up: each node passes its rows to its parent.'),
    SAMPLE('The index-only scan from earlier, annotated', `Index Only Scan using orders_cust_cover_idx on orders       <- scan type
  (cost=0.42..6.19 rows=101 width=8)                            <- estimate: 101 rows
  (actual time=0.083..0.104 rows=102 loops=1)                   <- reality: 102 rows
  Index Cond: (customer_id = 42)                                <- what the index used
  Heap Fetches: 0                                               <- table pages visited
  Buffers: shared hit=1 read=3                                  <- 1 page from cache, 3 from disk`),
    L('**Estimated versus actual rows** is the first thing to compare. 101 against 102 is healthy. A thousand-fold gap means stale or missing statistics, and the planner chose on bad information.', '**Scan type:** `Seq Scan` reads everything, `Bitmap Heap Scan` and `Index Scan` follow an index, `Index Only Scan` never visits the table.', '**`Rows Removed by Filter`** is wasted work: a large number on a small result says “you need an index”.', '**`Buffers`** counts pages. It is steadier than time, so use it to compare two plans.', '**`ANALYZE` executes the statement.** Wrap an `UPDATE` or `DELETE` in `BEGIN` and `ROLLBACK`.'),
    NOTE('Costs and times in the captured plans changed from run to run. Compare plan shapes and row counts.'),
  ),
  K('Which index types exist beyond B-tree?',
    T(['Type', 'Good for', 'Example'], [
      ['**B-tree** (default)', 'Equality, ranges, sorting, prefix `LIKE`', '`created_at > ...`, `ORDER BY`'],
      ['**Hash**', 'Equality only; rarely better than a B-tree', '`session_token = ...`'],
      ['**GIN**', 'Values that contain many keys: arrays, `jsonb`, full-text, trigrams', '`tags @> \'{sql}\'`'],
      ['**GiST**', 'Ranges, geometry, nearest-neighbour', 'Overlapping time ranges, locations'],
      ['**BRIN**', 'Huge tables whose values follow the physical order, at tiny size', 'An append-only log by timestamp'],
    ]),
    P('The default is right far more often than not. Reach for another type when the data is not a scalar you compare: a `jsonb` document, an array, text you search, or a range.'),
  ),
  K('What do indexes cost on writes, and how many is too many?',
    P('Every index is another structure to update on each insert, on each update of an indexed column, and on delete. Reads get faster and writes get slower.'),
    C(`-- 100,000-row insert into orders, rolled back afterwards
explain (analyze, timing off) insert into orders (customer_id, status, total_cents, created_at)
select 1 + i % 1960, 'paid', 1000, now() from generate_series(1, 100000) i;`, 'Measuring the write cost'),
    SAMPLE('Execution time, same statement', `with only the primary key and the foreign keys:   4172 ms
after adding three more indexes:                    5556 ms`),
    L('Three extra indexes made this insert about a third slower in this run (timings vary, but the direction is stable).', '**How many is too many:** when writes slow measurably or the indexes together rival the table in size. Find the unused ones with `pg_stat_user_indexes` (`idx_scan = 0`) and drop them.', '**Prefer fewer, wider composite indexes** designed around your real queries over one index per column.', '**Foreign keys:** index the referencing column when you delete from the parent or join on it.'),
    GO(['/performance-optimization', 'Performance Optimisation']),
  ),
  RAPID('Rapid-fire: indexing', [
    ['What data structure is a default index?', 'A B-tree: sorted keys in a shallow, wide tree.'],
    ['Does an index always get used?', 'No. The planner chooses the cheapest plan; a full scan wins when most rows match.'],
    ['Composite index (a, b): which queries can seek?', '`a`, and `a` with `b`. Not `b` alone.'],
    ['What is an index-only scan?', 'The query is answered from the index; the table is not visited.'],
    ['What is a partial index?', 'An index on only the rows matching a condition, which makes it small.'],
    ['Why can `lower(col) = x` not use an index on `col`?', 'The index holds `col`, not `lower(col)`. Index the expression.'],
    ['Which node in a plan shows wasted work?', '`Rows Removed by Filter`.'],
    ['What do indexes cost?', 'Disk space and slower writes.'],
  ]),
];

// ───────────────────────────────────────────── 3. transactions and isolation
export const transactions = [
  K('What does ACID mean in practice?',
    T(['Letter', 'Promise', 'What it looks like'], [
      ['**Atomicity**', 'All of a transaction happens or none of it', 'A transfer debits and credits, or does neither'],
      ['**Consistency**', 'Constraints hold before and after', 'A `CHECK (balance_cents >= 0)` rejects an overdraft'],
      ['**Isolation**', 'Concurrent transactions do not see each other’s half-done work', 'Governed by the isolation level'],
      ['**Durability**', 'Once committed, it survives a crash', 'Written to the write-ahead log (WAL) before `COMMIT` returns'],
    ]),
    L('Atomicity and durability are what people mean by “it is safe once the commit returns”.', 'Isolation is the subtle one: it is a **dial**, not a switch, and the next cards show what each setting allows.', 'Consistency here means the database’s own rules. Your business rules count only if you express them as constraints or enforce them in the transaction.'),
  ),
  K('Which anomalies can happen between concurrent transactions?',
    P('Each row below was reproduced with two real connections on PostgreSQL 17.6.'),
    T(['Anomaly', 'READ COMMITTED (default)', 'REPEATABLE READ', 'SERIALIZABLE'], [
      ['**Dirty read** (see uncommitted data)', 'Never', 'Never', 'Never'],
      ['**Non-repeatable read** (a row changes between two reads)', 'Happens', 'Prevented', 'Prevented'],
      ['**Phantom** (new rows appear between two reads)', 'Happens', 'Prevented in PostgreSQL', 'Prevented'],
      ['**Lost update** (read, then write a stale value)', 'Happens if you read then write', 'Prevented by an error', 'Prevented by an error'],
      ['**Write skew** (two writes break a shared rule)', 'Happens', 'Happens', 'Prevented by an error'],
    ]),
    L('PostgreSQL **never allows a dirty read**. Asking for `READ UNCOMMITTED` gives you `READ COMMITTED`: in the lab, a transaction set a balance to 0 without committing, and a second transaction at `READ UNCOMMITTED` still read 100.', 'The SQL standard allows phantoms at `REPEATABLE READ`; PostgreSQL’s snapshots do not. Do not assume another database matches.', '“Prevented by an error” means the database aborts one transaction with SQLSTATE `40001` and **you must retry it**.'),
    SAMPLE('Non-repeatable read and phantom, READ COMMITTED', `A read balance         100
B update to 70 (committed)
A read balance again   70            <- the row changed inside A's transaction

A count queued jobs    3
B insert a queued job (committed)
A count again          4             <- a new row appeared`),
    SAMPLE('The same two tests at REPEATABLE READ', `A read balance 100, B updates to 70, A read again 100, after A commits: 70
A count 3, B inserts a job, A count again 3`),
  ),
  DIAGRAM('A lost update, and two ways to prevent it', SQ.lostUpdate,
    P('The classic bug: the application reads a balance, computes a new value, and writes it back. Two requests interleave and one overwrites the other.'),
    SAMPLE('Captured with two connections, READ COMMITTED', `A begin, B begin
A read balance         100
B read balance         100
A write 70             UPDATE 1
A commit
B write 50             UPDATE 1          <- B never saw A's change
B commit
final balance          50                <- should be 20: A's 30 is lost`),
    P('**Fix 1: let the database do the arithmetic.** The second `UPDATE` waits for the first to commit, then re-reads the row and applies its change to the new value.'),
    SAMPLE('Same scenario with set balance_cents = balance_cents - 30 and - 50', `A update                UPDATE 1
B update                -- WAITING       <- blocked on A's row lock
A commit
B update                UPDATE 1         <- applied to 70, not to 100
B commit
final balance           20`),
    P('**Fix 2: lock the row when you read it** with `SELECT ... FOR UPDATE`, when the new value needs logic in the application.'),
    SAMPLE('Captured', `A read for update        100
B read for update        -- WAITING
A write 70, A commit
B read for update        70               <- B now sees A's committed value
B write 20, B commit
final balance            20`),
    L('A third fix is a version column and `UPDATE ... WHERE id = 1 AND version = 7`: **optimistic locking**, which retries when it updates zero rows.'),
  ),
  K('What do READ COMMITTED, REPEATABLE READ and SERIALIZABLE give you in PostgreSQL?',
    T(['Level', 'Each statement sees', 'Use it for', 'Cost'], [
      ['**READ COMMITTED** (default)', 'Everything committed when that **statement** started', 'Most web requests', 'You must lock or write atomically to avoid lost updates'],
      ['**REPEATABLE READ**', 'One snapshot, taken at the first statement', 'Reports and multi-query reads that must agree', 'Conflicting writes abort with a serialization error'],
      ['**SERIALIZABLE**', 'A snapshot, plus conflict detection', 'Rules that span rows', 'More aborts; every transaction needs a retry'],
    ]),
    SAMPLE('A write that conflicts with a committed change, REPEATABLE READ (captured)', `A begin repeatable read
A read balance             100
B update balance to 70     (committed)
A update balance - 30      ERROR: could not serialize access due to concurrent update (SQLSTATE 40001)`),
    L('**The rule:** if you use `REPEATABLE READ` or `SERIALIZABLE`, wrap the transaction in a **retry loop** for SQLSTATE `40001` (and `40P01`, the deadlock). The cards on Node.js show one.', 'Most applications stay on `READ COMMITTED` and use `FOR UPDATE`, atomic `UPDATE` statements and unique constraints for the few places that need more.', 'Other databases name the same levels differently. MySQL’s InnoDB defaults to `REPEATABLE READ` and behaves differently in places.'),
  ),
  DIAGRAM('Write skew', SQ.writeSkew,
    P('The rule is “at least one doctor stays on call”. Each transaction checks the count (2), sees that it is safe to take one doctor off, and updates a **different row**. Neither write conflicts with the other, yet together they break the rule.'),
    SAMPLE('REPEATABLE READ, captured', `A begin, B begin (both repeatable read)
A count on call   2
B count on call   2
A set Alice off   UPDATE 1
B set Bob off     UPDATE 1
A commit          COMMIT
B commit          COMMIT              <- both succeed
on call now       0                   <- the rule is broken`),
    SAMPLE('SERIALIZABLE, same steps, captured', `A commit          COMMIT
B commit          ERROR: could not serialize access due to read/write dependencies among transactions (SQLSTATE 40001)
                  DETAIL: Reason code: Canceled on identification as a pivot, during commit attempt.
on call now       1`),
    L('`SERIALIZABLE` detects that each transaction read what the other wrote, and aborts one. Retrying it then sees the changed count and refuses.', 'Alternatives that stay on a lower level: lock the rows that form the rule (`SELECT ... FOR UPDATE` on all on-call rows), or move the rule into a constraint or a single row (a counter row, an exclusion constraint).'),
  ),
  DIAGRAM('How MVCC lets readers and writers not block each other', SQ.mvcc,
    P('PostgreSQL uses **multi-version concurrency control**. An `UPDATE` does not change a row in place: it writes a **new version** and marks the old one as ended. Each transaction reads the versions visible to its snapshot.'),
    L('**Readers never block writers, and writers never block readers.** A long report does not stop updates.', '**Writers on the same row still queue.** The second `UPDATE` waits for the first to commit or roll back (you saw this as `-- WAITING`).', '**Old versions pile up** as dead rows until `VACUUM` removes the ones no snapshot can see. A transaction left open for hours keeps old versions alive and the table bloats.', 'This is also why `count(*)` on a big table is slow: it must check which versions are visible.'),
    GO(['/system-design', 'System Design: databases']),
  ),
  DIAGRAM('Row locks, SKIP LOCKED and a deadlock', SQ.deadlock,
    P('`SELECT ... FOR UPDATE` locks the rows it returns, so other writers (and other `FOR UPDATE` readers) wait until you finish. **`SKIP LOCKED`** skips rows that are already locked, which is the standard way to build a job queue in a table.'),
    C(`select id from jobs where status = 'queued' order by id limit 1 for update skip locked;`, 'Take the next free job'),
    SAMPLE('Two workers, captured', `A take a job   id 1
B take a job   id 2          <- B skipped the row A holds instead of waiting`),
    P('A **deadlock** happens when two transactions each hold a lock the other needs.'),
    SAMPLE('Captured', `A update row 1     UPDATE 1
B update row 2     UPDATE 1
A update row 2     -- WAITING
B update row 1     -- WAITING
A update row 2     ERROR: deadlock detected (SQLSTATE 40P01)
                   DETAIL: Process 113 waits for ShareLock on transaction 880; blocked by process 114.
                           Process 114 waits for ShareLock on transaction 879; blocked by process 113.
B update row 1     UPDATE 1                <- the survivor continues`),
    L('PostgreSQL waits `deadlock_timeout` (1 second by default), finds the cycle and aborts one transaction. Which one is not something to rely on: in this run it was A.', '**Prevent them** by always locking rows in the same order (for example by id), keeping transactions short, and retrying on `40P01`.'),
  ),
  QUIZ('Which isolation level prevents write skew in PostgreSQL?',
    ['READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE', 'None: it needs application locks'], 2,
    'Only SERIALIZABLE. At REPEATABLE READ the lab let both transactions commit and left nobody on call. At SERIALIZABLE the second commit failed with SQLSTATE 40001 and had to be retried. Locking the rows is another valid fix, but the level itself that prevents it is SERIALIZABLE.'),
];
