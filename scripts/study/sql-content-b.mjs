// Data and SQL guide, part B: query puzzles. Every solution and result was run on PostgreSQL 17.6 on 15 Nov 2026
// against the seeded lab database. The lab data is synthetic and deterministic.
import { P, L, N, T, C, TRAP, K, GO, QUIZ, SAMPLE, REVEAL, md } from './cc-kit.mjs';

// title: the task, never the technique. answerSql and output come from the lab run.
export const PUZZLE = (title, task, tables, answerSql, output, why) => ({
  q: 'Puzzle: ' + md(title),
  a: '<p>' + md(task) + '</p>' + SAMPLE('Tables', tables) +
    REVEAL('Show a solution', C(answerSql, 'SQL'), SAMPLE('Result', output), ...[].concat(why).map((x) => '<p>' + md(x) + '</p>')),
});

const EMP = `employees(id, name, department_id, manager_id, salary, hired_on)  -- 12 rows
Ada 150000, Grace 150000, Alan 120000, Linus 110000, Margaret 95000, Sam 90000,
Sue 85000, Sid 85000, Nora 72000, Cora 70000, Cal 65000, Fiona 60000`;

export const puzzles = [
  K('How do you approach a SQL question in an interview?',
    N('**Restate it** and ask about the edge cases: ties, NULLs, empty groups, duplicates.', '**Name the grain** of the result: one row per what? Per customer, per month, per department?', '**Write the simplest correct query** first, on a small example you can check by eye. Say the plan aloud: “join, group, then filter”.', '**Check the traps:** `NULL` in a `NOT IN`, a `LEFT JOIN` filtered in `WHERE`, `COUNT(*)` against `COUNT(col)`, integer division, time zones.', '**Then talk about performance:** which index would serve it, what the plan would do on a hundred million rows.'),
    P('Interviewers mostly watch for the first two steps. A correct query reached by clear steps beats a clever one-liner you cannot explain.'),
    TRAP('Do not start typing at once. A candidate who asks “what if two people tie?” has already passed half the question.'),
    GO(['/coding-questions', 'Coding Questions']),
  ),
  PUZZLE('Find the second-highest salary',
    'Return the second-highest **distinct** salary. Two people tie for the top salary.',
    EMP,
    `select name, salary from (
  select name, salary, dense_rank() over (order by salary desc) as r
  from employees) x
where r = 2;`,
    `name | salary
-----+-------
Alan | 120000
(1 row)`,
    ['`dense_rank` gives tied rows the same rank and does not skip numbers, so rank 2 is the second distinct salary. `rank` would skip to 3 after a tie.', 'The subquery form also works: `select max(salary) from employees where salary < (select max(salary) from employees)` returned `120000`.', 'The trap is `order by salary desc limit 1 offset 1`: with the tie at the top it returned **Ada, 150000**, the top salary again.']),
  PUZZLE('List the two highest-paid people in each department',
    'One row per person, at most two per department. People with no department should be treated as their own group. If two people tie, any consistent choice is fine.',
    EMP + '\nNora has no department.',
    `select department_id, name, salary, rn from (
  select department_id, name, salary,
         row_number() over (partition by department_id order by salary desc, id) as rn
  from employees) x
where rn <= 2
order by department_id nulls last, rn;`,
    `department_id | name  | salary | rn
--------------+-------+--------+---
            1 | Ada   | 150000 |  1
            1 | Grace | 150000 |  2
            2 | Sam   |  90000 |  1
            2 | Sue   |  85000 |  2
            3 | Cora  |  70000 |  1
            3 | Cal   |  65000 |  2
         NULL | Nora  |  72000 |  1
(7 rows)`,
    ['`partition by` restarts the numbering for each department, and `NULL` values form a single partition, so Nora gets her own group.', '`row_number` always returns exactly two rows per department. With `rank` or `dense_rank` a tie at second place would return three. Choose by what the question means.', 'Without a tie-break in `order by` (here `id`), the choice between Ada and Grace is arbitrary and can change between runs.']),
  PUZZLE('Show each of customer 42’s orders with their running spend',
    'For customer 42, list orders in date order with the cumulative total so far. Show the first five.',
    `orders(id, customer_id, status, total_cents, created_at)  -- 200,000 rows`,
    `select id, created_at::date as day, total_cents,
       sum(total_cents) over (partition by customer_id order by created_at, id) as running_cents
from orders
where customer_id = 42
order by created_at, id
limit 5;`,
    `  id | day        | total_cents | running_cents
-----+------------+-------------+--------------
 199 | 2024-01-01 |        8363 |          8363
2159 | 2024-01-05 |        8883 |         17246
4119 | 2024-01-09 |        9403 |         26649
6079 | 2024-01-13 |        9923 |         36572
8039 | 2024-01-17 |        1443 |         38015
(5 rows)`,
    ['A window `sum` with an `order by` accumulates from the first row to the current one. The default frame treats rows with equal `created_at` as peers, so add `id` to break ties and get a strict running total.', 'Without `partition by customer_id` the total would run across all customers. The `where` runs first, so for one customer the partition is a convenience, but it is the form that works for all customers at once.']),
  PUZZLE('Find duplicate emails, then delete all but the lowest id',
    'In `contacts` some emails appear more than once. List them with how many copies there are, then delete every copy except the one with the lowest `id`.',
    `contacts(id, email)  -- 6 rows
1 ada@example.com   2 grace@example.com   3 ada@example.com
4 alan@example.com  5 grace@example.com   6 ada@example.com`,
    `select email, count(*) as copies, min(id) as keep_id
from contacts group by email having count(*) > 1 order by email;

delete from contacts c
using contacts d
where c.email = d.email and c.id > d.id;`,
    `email             | copies | keep_id
------------------+--------+--------
ada@example.com   |      3 |       1
grace@example.com |      2 |       2
(2 rows)

DELETE 3

id | email
---+------------------
 1 | ada@example.com
 2 | grace@example.com
 4 | alan@example.com
(3 rows)`,
    ['`group by ... having count(*) > 1` finds the duplicates. The delete joins the table to itself and removes every row that has a **smaller-id twin**.', 'Run the delete inside a transaction first and check the row count (here `DELETE 3`) before committing.', 'Then prevent it: `create unique index on contacts (lower(email))`. A cleanup query fixes today; the constraint fixes tomorrow.']),
  PUZZLE('List the customers who have never placed an order',
    'Return how many customers have no orders. Then explain why `NOT IN` can be dangerous here.',
    `customers(id, email, country, created_at)         -- 2,000 rows
orders(id, customer_id, status, total_cents, ...)  -- 200,000 rows; customer_id is NOT NULL`,
    `select count(*) as no_orders
from customers c
where not exists (select 1 from orders o where o.customer_id = c.id);`,
    `no_orders
---------
       40
(1 row)`,
    ['`left join orders o on o.customer_id = c.id where o.id is null` also returned 40, and so did `where id not in (select customer_id from orders)`.', '**The `NOT IN` trap.** `NOT IN` returns nothing at all if the subquery contains a single `NULL`, because `x <> NULL` is unknown. It worked above only because `orders.customer_id` is `NOT NULL`. The same pattern on a column that has a NULL, “employees who are nobody’s manager”, returned **0 rows**: `select name from employees where id not in (select manager_id from employees)` (Ada’s `manager_id` is NULL). The `not exists` version returned the seven people who manage nobody: Linus, Margaret, Sue, Sid, Cal, Fiona and Nora.', 'Default to `NOT EXISTS`. It is correct with NULLs and the planner turns it into an anti-join.']),
  PUZZLE('Show, for each country, how many orders are paid, refunded and cancelled as columns',
    'One row per country with three count columns. (The lab’s data is synthetic, so the counts follow a pattern.)',
    `orders(id, customer_id, status, ...)   customers(id, country, ...)`,
    `select c.country,
       count(*) filter (where o.status = 'paid')      as paid,
       count(*) filter (where o.status = 'refunded')  as refunded,
       count(*) filter (where o.status = 'cancelled') as cancelled
from orders o
join customers c on c.id = o.customer_id
group by c.country
order by c.country;`,
    `country |  paid | refunded | cancelled
--------+-------+----------+----------
DE      | 40000 |        0 |         0
FR      | 40000 |        0 |         0
GB      | 30000 |        0 |     10000
IN      | 40000 |        0 |         0
US      | 36000 |     4000 |         0
(5 rows)`,
    ['This is **conditional aggregation**: `count(*) filter (where ...)` counts only the matching rows in each group. `sum(case when status = \'paid\' then 1 else 0 end)` does the same in any database.', 'It turns rows into columns in one pass over the data. The columns are fixed in the query: for a variable set of statuses, return rows and pivot in the application.']),
  PUZZLE('Show monthly paid revenue and the change from the previous month',
    'One row per month, with revenue and the difference from the month before. Show the first six months.',
    `orders(id, customer_id, status, total_cents, created_at)  -- January 2024 to February 2025`,
    `with monthly as (
  select date_trunc('month', created_at) as m, sum(total_cents) as revenue
  from orders where status = 'paid' group by 1
)
select m::date as month, revenue,
       revenue - lag(revenue) over (order by m) as change
from monthly
order by m
limit 6;`,
    `month      |  revenue |   change
-----------+----------+---------
2024-01-01 | 75952502 |     NULL
2024-02-01 | 71099218 | -4853284
2024-03-01 | 76107302 |  5008084
2024-04-01 | 73712160 | -2395142
2024-05-01 | 76239462 |  2527302
2024-06-01 | 73568160 | -2671302
(6 rows)`,
    ['`lag(x) over (order by m)` reads the value from the previous row in that order. The first month has no previous row, so `change` is `NULL`: say so rather than hiding it, or pass a default as the third argument.', 'The `with` clause aggregates first, then the window runs over the monthly rows. A window function cannot see inside a `group by` in the same step.', 'For a percentage change, divide by `lag(revenue)` and guard against zero with `nullif(lag(revenue) over (order by m), 0)`.']),
  PUZZLE('Find each user’s longest run of consecutive login days',
    'For every user, return the length of their longest streak and the day it started.',
    `logins(user_id, day)  -- 18 rows, March 2024
user 1: 1, 2, 3, 5, 6, 8     user 2: 1, 2, 3, 4, 5, 10     user 3: 2, 4, 5, 6, 7, 9`,
    `with numbered as (
  select user_id, day,
         day - (row_number() over (partition by user_id order by day))::int as grp
  from logins
),
streaks as (
  select user_id, count(*) as days, min(day) as first_day
  from numbered group by user_id, grp
)
select distinct on (user_id) user_id, days, first_day
from streaks
order by user_id, days desc, first_day;`,
    `user_id | days | first_day
--------+------+-----------
      1 |    3 | 2024-03-01
      2 |    5 | 2024-03-01
      3 |    4 | 2024-03-04
(3 rows)`,
    ['This is the **gaps and islands** pattern. Subtract each row’s position in the sequence from its date. Consecutive days produce the **same** result, so that result labels the streak. For user 3 the labels were `2024-03-01` for the 2nd, `2024-03-02` for the 4th to 7th, and `2024-03-03` for the 9th.', 'Group by user and label to count each streak, then keep the longest per user with `distinct on`.', 'If a user could log in twice on one day, deduplicate first (`select distinct user_id, day`), or the counts break.']),
  PUZZLE('Return the most recent order for every customer',
    'One row per customer with their latest order. Show customers 1 to 3.',
    `orders(id, customer_id, status, total_cents, created_at)`,
    `select distinct on (customer_id) customer_id, id, created_at
from orders
where customer_id <= 3
order by customer_id, created_at desc, id desc;`,
    `customer_id |     id | created_at
------------+--------+-----------------------
          1 | 199920 | 2025-02-20 12:00:00+00
          2 | 199399 | 2025-02-19 09:57:00+00
          3 | 198878 | 2025-02-18 07:54:00+00
(3 rows)`,
    ['`distinct on (customer_id)` keeps the **first** row for each customer in the `order by`, so the order by decides which row wins. It is PostgreSQL-specific.', 'The portable form uses `row_number() over (partition by customer_id order by created_at desc, id desc)` and keeps `rn = 1`. It returned the same three rows in the lab.', 'Both are served by an index on `(customer_id, created_at DESC)`. Add `id` as a tie-break so the choice is deterministic.']),
  PUZZLE('List everyone who reports to Ada, directly or indirectly, with their depth',
    'Walk the management chain from Ada (id 1) down, showing how many levels below Ada each person is.',
    `employees(id, name, manager_id)
Ada (no manager) -> Grace, Alan, Sam, Cora -> Linus, Margaret (Grace), Fiona (Alan), Sue, Sid, Nora (Sam), Cal (Cora)`,
    `with recursive tree as (
  select id, name, manager_id, 0 as depth
  from employees where id = 1
  union all
  select e.id, e.name, e.manager_id, t.depth + 1
  from employees e
  join tree t on e.manager_id = t.id
)
select id, name, depth from tree order by depth, id;`,
    `id | name     | depth
---+----------+------
 1 | Ada      |     0
 2 | Grace    |     1
 3 | Alan     |     1
 6 | Sam      |     1
 9 | Cora     |     1
 4 | Linus    |     2
 5 | Margaret |     2
 7 | Sue      |     2
 8 | Sid      |     2
10 | Cal      |     2
11 | Fiona    |     2
12 | Nora     |     2
(12 rows)`,
    ['A **recursive CTE** has a starting query (the anchor) and a second query that joins to the CTE itself. PostgreSQL repeats the second query on the newest rows until it returns nothing.', 'Cycles (a manager chain that loops) would recurse forever. Add a depth limit (`where t.depth < 20`) or track visited ids in an array.', 'To start from someone else, change the anchor: `where id = 6` returns Sam’s team only.']),
  PUZZLE('Find bookings that overlap in the same room',
    'Return pairs of bookings in the same room whose times overlap. A booking that ends at 10:00 and one that starts at 10:00 do not overlap.',
    `bookings(id, room, starts_at, ends_at)  -- 8 rows, 1 May 2024
room 1: 09:00-10:00, 09:30-10:30, 11:00-12:00
room 2: 09:00-10:00, 10:00-11:00, 13:00-14:00, 13:30-14:30
room 3: 09:00-10:00`,
    `select a.room, a.id as first, b.id as second
from bookings a
join bookings b
  on a.room = b.room
 and a.id < b.id
 and a.starts_at < b.ends_at
 and b.starts_at < a.ends_at
order by a.room, a.id;`,
    `room | first | second
-----+-------+-------
   1 |     1 |      2
   2 |     6 |      7
(2 rows)`,
    ['Two ranges overlap when **each starts before the other ends**. Using `<` and not `<=` keeps back-to-back bookings (ids 4 and 5) apart. `a.id < b.id` lists each pair once and never pairs a booking with itself.', 'Better than finding overlaps afterwards is preventing them: an **exclusion constraint** (`exclude using gist (room with =, tstzrange(starts_at, ends_at) with &&)`, which needs the `btree_gist` extension) rejects the insert. In the lab, adding a 09:30-10:30 booking to a room already booked 09:00-10:00 failed with `conflicting key value violates exclusion constraint` (SQLSTATE `23P01`), while a booking from 10:00 to 11:00 was accepted.']),
  QUIZ('You need only the top three rows by a window function’s rank. Where do you filter on that rank?',
    ['In the WHERE of the same SELECT', 'In HAVING', 'In an outer query or CTE that wraps the window function', 'In GROUP BY'], 2,
    'WHERE runs before window functions are computed, so using one there fails. The lab printed: ERROR: window functions are not allowed in WHERE. Compute the rank in a subquery or CTE and filter in the outer query, as the earlier puzzles did.'),
];
