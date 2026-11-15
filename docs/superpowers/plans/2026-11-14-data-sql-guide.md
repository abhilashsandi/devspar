# Data and SQL Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Data and SQL guide at `/sql`: about 55 cards on indexing, transactions and isolation, query puzzles, schema design, performance, and using PostgreSQL from Node.js, with every statement and output taken from a real run.

**Architecture:** A DevSpar study guide is one generated `app/<slug>/content.json`, built by a script from content modules with the toolkit in `scripts/study/`. This plan first creates a small SQL lab outside the repository (a PostgreSQL container, a seed file and a runner) so that results are captured, not remembered; then a diagram module, three content modules and a builder; then registers the guide.

**Tech Stack:** PostgreSQL in Docker (`postgres:17`), Node.js with `pg` for the runner (installed in the lab folder, not in the repo), the `scripts/study` toolkit, Next.js 16 for the route wrapper.

**Spec:** `docs/superpowers/specs/2026-11-14-three-new-guides.md`

## Global Constraints

- Work in `C:\Users\abhilashsandi\Documents\projects\merge-csvs`. Commit after each task. Never push. Never touch `private/`.
- Read `scripts/study/README.md` first. Copy patterns from `scripts/study/add-architecture-guide.mjs`, `scripts/study/dg-arch.mjs` and `scripts/study/bug-content-a.mjs`.
- Never edit `app/*/content.json` or `public/study/*` by hand.
- Authoring kit, all from `./cc-kit.mjs`: `P`, `L`, `N`, `T(headRow, rows)`, `C(code, label?)`, `SAY`, `TRAP`, `K(title, ...parts)`, `GO([href, label], ...)`, `RAPID(title, pairs)`, `QUIZ(question, options[4], rightIndex, why)`, `DIAGRAM(title, svg, ...parts)`, `NOTE(text)`, `SAMPLE(label, text)` (plain output, never coloured), `REVEAL(summary, ...parts)`, `md`.
- Kit text markup: `` `code` `` and `**bold**`; everything else is escaped. Double-quoted strings; typographic quotes (“ ”) inside text. SQL goes in `C(...)` using template literals.
- Style: second person, plain sentences, British spelling (normalise, optimise). No " — " separators. Say the trade-off.
- **Nothing from memory.** Every SQL statement in a card is run in the lab first. Every result table, error message and `EXPLAIN` plan shown is pasted from the lab's output (trim long plans; never edit numbers). PostgreSQL is the reference; say so when another database differs.
- The lab lives in the session scratch directory, not in the repo. The repo gets no new dependency.
- Diagrams: `wrap('0 0 900 H', body, caption)`; helpers `box`, `txt`, `arrow`, `rect`, `line`, `M` from `./dg.mjs`; colours only through styles `'n' | 'a' | 'g' | 'd'` and text colours `'text' | 'muted' | 'accent' | 'gold' | 'danger'`; monospace text about 6.3px per character at size 10.5, bold sans size 12 about 6.8px per character; text fits its box with 8px to spare.
- Reuse existing diagrams where the plan names them: `WB.btree` (`./dg-wb.mjs`), `CS.n1`, `CS.cacheAside`, `CS.expandContract`, `CS.dbScale` (`./dg-cs.mjs`).
- Acceptance commands: `node scripts/study/check-guide.mjs sql --min 55 --sections sq1:7,sq2:8,sq3:8,sq4:13,sq5:6,sq6:6,sq7:6,sq8:5` prints `check-guide sql: OK`; `npm run study:build && npm run build && npm test` ends `ALL CHECKS PASSED`.

## Review Focus

1. **A result shown in a card is wrong** because it was typed, not captured. Tasks 3 to 5 each end with a step that re-runs the lab file for that task and diffs it against the cards.
2. **`NOT IN` with a NULL** returns no rows: the anti-join puzzle must show that real output. Pinned in Task 4.
3. **A concurrency card describes behaviour PostgreSQL does not have** (for example a dirty read, which PostgreSQL never allows). Task 3 runs each anomaly with two real connections and reports what happened at each isolation level.
4. **A puzzle answer leaks** into the collapsed summary or search results. Puzzles use `REVEAL`; Task 6 checks one in the browser.
5. **`EXPLAIN` output differs between runs** (costs, timings). Cards show the plan shape and the row counts, and say timings vary; Task 2 pins the seed so shapes are stable.

---

### Task 1: The SQL lab (outside the repo)

**Files:**
- Create (in the session scratch directory, referred to below as `$LAB`): `$LAB/sql-lab/package.json`, `$LAB/sql-lab/seed.sql`, `$LAB/sql-lab/run.mjs`

**Interfaces:**
- Produces: `node run.mjs <file.sql>` prints each statement followed by its result as an aligned text table (or the error message); `node run.mjs --two <file.mjs>` runs a scripted two-connection scenario. A database `lab` on `localhost:55432`.

- [ ] **Step 1: Start PostgreSQL**

Run: `docker ps` first. If it fails, ask the user to start Docker Desktop and wait. Then:

```bash
docker run -d --name sql-lab -e POSTGRES_PASSWORD=lab -e POSTGRES_DB=lab -p 55432:5432 postgres:17
docker exec sql-lab psql -U postgres -d lab -tc "select version()"
```
Expected: one line starting `PostgreSQL 17`. Note the exact version; the guide's `NOTE` cites it.

- [ ] **Step 2: Create the lab runner**

In `$LAB/sql-lab`: `npm init -y && npm install pg`. Write `run.mjs`:
- `node run.mjs file.sql`: split the file on lines that are exactly `-- >>>`, run each chunk in one session, print the chunk, then either the rows as a padded text table with a `(N rows)` footer, the command tag, or `ERROR: <message>`.
- `node run.mjs --two scenario.mjs`: import the scenario's default export `async (a, b, log) => {}` with two connected `pg` clients `a` and `b` and a `log(label, promiseOrValue)` helper that prints the label and the rows or error; used for isolation demos. Print `-- WAITING` when a query has not returned after 500 ms, then its result when it does.

- [ ] **Step 3: Write `seed.sql` and load it**

Tables and exact data sizes (deterministic: use `generate_series` and arithmetic, never `random()`):

```sql
departments(id serial pk, name text)                                   -- 4 rows: Engineering, Sales, Support, Finance
employees(id serial pk, name text, department_id int null fk, manager_id int null fk, salary int, hired_on date)  -- 12 rows; 2 share the top salary in Engineering; 1 has NULL department_id; a 3-level manager chain
customers(id serial pk, email text unique, country text, created_at timestamptz)   -- 2000 rows
orders(id bigserial pk, customer_id int fk, status text, total_cents int, created_at timestamptz)  -- 200000 rows; 40 customers have no orders; status mostly 'paid'
logins(user_id int, day date)                                          -- 3 users, runs of consecutive days with gaps
bookings(id serial pk, room int, starts_at timestamptz, ends_at timestamptz)   -- 8 rows, two overlapping pairs
accounts(id int pk, owner text, balance_cents int check (balance_cents >= 0))  -- 2 rows, for transactions
```
Finish with `ANALYZE;`. Load: `docker exec -i sql-lab psql -U postgres -d lab < seed.sql`.
Verify: `node run.mjs` on a one-line file `select count(*) from orders;` prints `200000`.

- [ ] **Step 4: No commit**

The lab is not part of the repository. Keep the container running until Task 6.

---

### Task 2: Diagrams (`scripts/study/dg-sql.mjs`)

**Files:**
- Create: `scripts/study/dg-sql.mjs`

**Interfaces:**
- Produces: `export const SQ = { joins, selectOrder, compositeIndex, planTree, lostUpdate, writeSkew, mvcc, deadlock, keyset, replication }`, `export default SQ`.

- [ ] **Step 1: Run the acceptance check to see it fail**

Run: `node scripts/study/check-guide.mjs sql --min 55`
Expected: `check-guide sql: FAIL`, `guide not found: app/sql/content.json`

- [ ] **Step 2: Write the ten diagrams**

| Key | viewBox | Content | Caption |
|---|---|---|---|
| `joins` | `0 0 900 300` | Two small tables side by side (employees: 4 rows, one with NULL department; departments: 3 rows, one with no employees) and, below, four result strips labelled INNER, LEFT, RIGHT, FULL showing which rows survive (matched rows plain, NULL-filled rows in gold). | How inner, left, right and full joins treat unmatched rows |
| `selectOrder` | `0 0 900 190` | Seven boxes in a row: FROM + JOIN, WHERE, GROUP BY, HAVING, SELECT (window functions here), ORDER BY, LIMIT. Footer: “This is why WHERE cannot use an alias or an aggregate, and HAVING can.” | The logical order in which a SELECT is evaluated |
| `compositeIndex` | `0 0 900 280` | A sorted list of `(customer_id, created_at)` pairs as rows; three brackets: `customer_id = 7` (contiguous: uses the index), `customer_id = 7 AND created_at > …` (contiguous range), `created_at > …` alone (scattered: cannot seek). | A composite index is sorted by its first column, then the second |
| `planTree` | `0 0 900 300` | A plan drawn as a tree, read bottom-up: Limit ← Sort ← Hash Join ← (Seq Scan on customers, Index Scan on orders). Label each node with “rows: estimated vs actual”. Side note listing scan types: Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan. | Reading an EXPLAIN plan as a tree from the leaves up |
| `lostUpdate` | `0 0 900 280` | Two transaction lanes over time: both read balance 100, A writes 100 − 30, B writes 100 − 50; final 50, and 30 was lost. Under it, the fix lane: `UPDATE … SET balance = balance - 30` or `SELECT … FOR UPDATE`. | A lost update between two transactions, and the fix |
| `writeSkew` | `0 0 900 280` | Two lanes: each checks “at least one doctor on call” (count = 2), each sets a different row off call, both commit; the rule is broken. Note: allowed under snapshot isolation, prevented by SERIALIZABLE. | Write skew: two transactions each valid alone break a rule together |
| `mvcc` | `0 0 900 260` | One logical row shown as three physical versions with `xmin` / `xmax` values; two reader transactions with snapshots pointing at different versions; VACUUM removing the oldest. | MVCC: writers create new row versions and readers see a snapshot |
| `deadlock` | `0 0 900 230` | Two transactions and two rows in a cycle: A holds row 1 and waits for row 2; B holds row 2 and waits for row 1. Footer: “PostgreSQL detects the cycle and aborts one. Lock rows in a consistent order.” | A deadlock cycle between two transactions |
| `keyset` | `0 0 900 250` | Two strips of rows. OFFSET 100000: scan and discard 100000 rows, return 20. Keyset: seek in the index to `(created_at, id) < (last seen)`, read 20. | Offset pagination scans and discards; keyset pagination seeks |
| `replication` | `0 0 900 240` | Primary (writes) streaming WAL to two replicas (reads), with a “lag” label on the arrows; a client that writes then reads from a replica sees old data. | A primary with read replicas and replication lag |

- [ ] **Step 3: Check the diagrams in both themes**

Run: `node scripts/study/preview-diagrams.mjs dg-sql`
Expected: `10 diagram(s) -> …`. Open the file, flip the theme, fix any text that crosses a box or sits on an arrow.

- [ ] **Step 4: Commit**

```bash
git add scripts/study/dg-sql.mjs
git commit -m "Add diagrams for the Data and SQL guide"
```

---

### Task 3: Content, part A (`scripts/study/sql-content-a.mjs`): relational basics, indexing, transactions

**Files:**
- Create: `scripts/study/sql-content-a.mjs`; lab files `$LAB/sql-lab/a-basics.sql`, `a-index.sql`, `a-tx-*.mjs`

**Interfaces:**
- Consumes: `SQ`, `WB.btree`, the kit.
- Produces: `export const basics, indexing, transactions`.

- [ ] **Step 1: Write and run the lab files for this task, and save the output**

`a-basics.sql`: the four joins on employees/departments; `NULL = NULL`, `NULL IS NULL`, `count(*)` vs `count(department_id)`; a `WHERE` versus `HAVING` pair. `a-index.sql`: `EXPLAIN (ANALYZE, BUFFERS)` for a lookup on `orders(customer_id)` before and after `CREATE INDEX`; a composite index `(customer_id, created_at)` used and not used; a covering index with `INCLUDE (total_cents)` giving an Index Only Scan; a partial index on `status = 'refunded'`; an expression (`lower(email)`) that defeats and then uses an index; a leading-wildcard `LIKE`. `a-tx-*.mjs` (two connections each): lost update under READ COMMITTED and its two fixes; non-repeatable read under READ COMMITTED versus REPEATABLE READ; a concurrent update under REPEATABLE READ (serialization error text); write skew under REPEATABLE READ versus SERIALIZABLE; `FOR UPDATE` blocking and `SKIP LOCKED`; a deadlock (error text).

Run each with `node run.mjs …` and keep the output files; cards quote them.

- [ ] **Step 2: Write `basics` (7 cards, id `sq1`)**

1. “What do primary keys, foreign keys and constraints guarantee, and why let the database enforce them?”
2. “What is normalisation, and when do you denormalise on purpose?” (1NF to 3NF in one table; the cost of each direction)
3. `DIAGRAM("Inner, left, right and full joins", SQ.joins, …)` with the four queries and their captured outputs.
4. “Why does a comparison with NULL not behave like true or false?” (three-valued logic; captured outputs; `IS DISTINCT FROM`)
5. `DIAGRAM("The order a SELECT is evaluated in", SQ.selectOrder, …)`
6. “WHERE or HAVING: which filter goes where?”
7. `QUIZ`: what `count(column)` returns when some values are NULL.

- [ ] **Step 3: Write `indexing` (8 cards, id `sq2`)**

1. “How does a B-tree index make a lookup fast, and what does it cost?” with `WB.btree` and the before/after plans.
2. `DIAGRAM("A composite index and the leftmost-prefix rule", SQ.compositeIndex, …)` with the two captured plans.
3. “What are covering and partial indexes?” (captured Index Only Scan; when the visibility map matters)
4. “Why is my query not using the index?” (table: function on the column, type mismatch, leading wildcard, low selectivity, stale statistics; one captured example each for the first three)
5. `DIAGRAM("Reading EXPLAIN ANALYZE", SQ.planTree, …)` with one captured plan annotated: estimated versus actual rows, scan types, buffers.
6. “Which index types exist beyond B-tree?” (GIN, GiST, BRIN, hash: one use each)
7. “What do indexes cost on writes, and how many is too many?”
8. `RAPID("Rapid-fire: indexing", …)`

- [ ] **Step 4: Write `transactions` (8 cards, id `sq3`)**

1. “What does ACID mean in practice?”
2. “Which anomalies can happen between concurrent transactions?” (table: dirty read, non-repeatable read, phantom, lost update, write skew; which PostgreSQL level prevents each, from the lab runs. State plainly that PostgreSQL never allows a dirty read.)
3. `DIAGRAM("A lost update, and two ways to prevent it", SQ.lostUpdate, …)` with the captured two-connection transcript.
4. “What do READ COMMITTED, REPEATABLE READ and SERIALIZABLE give you in PostgreSQL?” (table plus the captured serialization error; the retry rule)
5. `DIAGRAM("Write skew", SQ.writeSkew, …)`
6. `DIAGRAM("How MVCC lets readers and writers not block each other", SQ.mvcc, …)`
7. “Row locks: FOR UPDATE, SKIP LOCKED and deadlocks” with `SQ.deadlock`, the queue-worker pattern, and the captured deadlock error.
8. `QUIZ`: which isolation level prevents write skew in PostgreSQL.

- [ ] **Step 5: Re-run the lab and compare with the cards**

Run each lab file again. Every output block quoted in `sql-content-a.mjs` must still match what the lab prints (row values, row counts, error text; timings and costs excluded). Fix the card, never the output.

- [ ] **Step 6: Commit**

```bash
git add scripts/study/sql-content-a.mjs
git commit -m "Add Data and SQL content: basics, indexing, transactions"
```

---

### Task 4: Content, part B (`scripts/study/sql-content-b.mjs`): query puzzles

**Files:**
- Create: `scripts/study/sql-content-b.mjs`; lab file `$LAB/sql-lab/b-puzzles.sql`

**Interfaces:**
- Consumes: the kit (`REVEAL`, `SAMPLE`, `C`).
- Produces: `export const PUZZLE`, `export const puzzles`.

- [ ] **Step 1: Define `PUZZLE` and export it**

```js
// title: the task, never the technique. answerSql and output come from the lab run.
export const PUZZLE = (title, task, tables, answerSql, output, why) => ({
  q: 'Puzzle: ' + md(title),
  a: '<p>' + md(task) + '</p>' + SAMPLE('Tables', tables) +
    REVEAL('Show a solution', C(answerSql, 'SQL'), SAMPLE('Result', output), ...[].concat(why).map((x) => '<p>' + md(x) + '</p>')),
});
```

- [ ] **Step 2: Write `b-puzzles.sql`, run it, keep the output**

One statement (or two alternatives) per puzzle below, against the seed.

- [ ] **Step 3: Write `puzzles` (13 cards, id `sq4`)**

First a plain `K` card “How do you approach a SQL question in an interview?” (restate, name the grain of the result, write the simplest correct query, then discuss indexes). Then eleven `PUZZLE` cards, then a quiz:

1. Second-highest salary (ties handled; `DENSE_RANK` and the subquery form)
2. Top two earners in each department (window function)
3. Running total of order value per customer by date
4. Find duplicate emails; then delete all but the lowest id
5. Customers with no orders: `NOT EXISTS`, `LEFT JOIN … IS NULL`, and why `NOT IN` returns nothing when the subquery contains a NULL (show the captured empty result)
6. Orders per status as columns (conditional aggregation with `FILTER`)
7. Month-over-month revenue change (`LAG`)
8. Longest streak of consecutive login days per user (gaps and islands)
9. The latest order per customer (`DISTINCT ON` and `ROW_NUMBER`)
10. Everyone under a given manager, with depth (recursive CTE)
11. Bookings that overlap for the same room
12. `QUIZ`: which clause filters on the result of a window function (a subquery or CTE, since `WHERE` runs before it).

That is 1 + 11 + 1 = 13 cards.

- [ ] **Step 4: Re-run the lab and compare**

Run: `node run.mjs b-puzzles.sql` and compare every `Result` block with the output. They must match exactly.

- [ ] **Step 5: Commit**

```bash
git add scripts/study/sql-content-b.mjs
git commit -m "Add Data and SQL content: query puzzles"
```

---

### Task 5: Content, part C (`scripts/study/sql-content-c.mjs`): schema design, performance, Node.js, NoSQL

**Files:**
- Create: `scripts/study/sql-content-c.mjs`; lab files `$LAB/sql-lab/c-*.sql`, `c-node.mjs`

**Interfaces:**
- Consumes: `SQ`, `CS` (`./dg-cs.mjs`), the kit.
- Produces: `export const schema, performance, fromNode, nosql`.

- [ ] **Step 1: Lab runs**

`c-keyset.sql`: `EXPLAIN (ANALYZE)` for `ORDER BY created_at, id OFFSET 150000 LIMIT 20` versus the keyset form with an index on `(created_at, id)`. `c-migrate.sql`: add a `NOT NULL` column safely (nullable, backfill in batches, `ADD CONSTRAINT … NOT VALID`, `VALIDATE`), and `CREATE INDEX CONCURRENTLY`. `c-node.mjs`: with `pg`, a parameterised query; the same query built by string concatenation with an injection input (show it returning every row); a `withTransaction(pool, fn)` helper that commits or rolls back; a retry loop on SQLSTATE `40001`; an idempotent insert with `ON CONFLICT DO NOTHING`. Before writing the ORM card, check current Prisma and Drizzle transaction APIs with the `ctx7` CLI (`npx ctx7@latest library <name> "<question>"`, then `npx ctx7@latest docs <id> "<question>"`).

- [ ] **Step 2: Write `schema` (6 cards, id `sq5`)**

1. “How do you model one-to-many and many-to-many relationships?”
2. “UUID or integer keys? Natural or surrogate?”
3. “When is a JSONB column the right choice?”
4. “How do you change a schema with no downtime?” with `CS.expandContract` and the captured migration steps.
5. `DIAGRAM("Offset versus keyset pagination", SQ.keyset, …)` with both captured plans.
6. `RAPID("Rapid-fire: schema design", …)` (soft deletes, audit tables, enums versus lookup tables, timestamps with time zone, money as integers, multi-tenant `tenant_id`).

- [ ] **Step 3: Write `performance` (6 cards, id `sq6`)**

1. “A query that took 50 ms now takes 5 s. What do you do?” (method: `EXPLAIN (ANALYZE, BUFFERS)`, estimates versus actuals, `pg_stat_statements`, locks, bloat)
2. “What is the N+1 problem, and how do you find it?” with `CS.n1`.
3. “Why do you need connection pooling, especially from serverless or many Node.js instances?”
4. `DIAGRAM("Read replicas and replication lag", SQ.replication, …)`, including read-your-own-writes.
5. “Partitioning and sharding: what is the difference, and when is each worth it?” with `CS.dbScale`.
6. `QUIZ`: the first thing to check when a plan's estimated and actual row counts differ by 1000 times (statistics).

- [ ] **Step 4: Write `fromNode` (6 cards, id `sq7`)**

1. “How does SQL injection happen, and what actually prevents it?” (captured injection result, then the parameterised query)
2. “How do you run a transaction from Node.js?” (the `withTransaction` helper from the lab; one connection for the whole transaction)
3. “How do you handle serialization failures and deadlocks in application code?” (the retry loop)
4. “How do you make a write idempotent?” (unique key plus `ON CONFLICT`; the outbox in one line)
5. “ORM, query builder or raw SQL?” (table; Prisma and Drizzle as checked; `NOTE` with the date and versions)
6. `RAPID("Rapid-fire: PostgreSQL from Node.js", …)`

- [ ] **Step 5: Write `nosql` (5 cards, id `sq8`)**

1. “When is a relational database the wrong default?” (table by access pattern: document, key-value, wide-column, search, graph)
2. “How does data modelling change in a document database?” (embed versus reference)
3. “What do CAP and PACELC actually say?”
4. “What is Redis for, beyond a cache?” (data structures and one use each)
5. `QUIZ`: for a new product with relational data and no extreme scale, what is the defensible default (PostgreSQL).

Each card that overlaps an existing guide ends with `GO(...)` to it (`/system-design`, `/performance-optimization`, `/aws`, `/whiteboard`).

- [ ] **Step 6: Re-run the lab files for this task and compare; then commit**

```bash
git add scripts/study/sql-content-c.mjs
git commit -m "Add Data and SQL content: schema, performance, Node.js, NoSQL"
```

---

### Task 6: Builder, registration and verification

**Files:**
- Create: `scripts/study/add-sql-guide.mjs`, `app/sql/page.tsx`
- Modify: `app/page.tsx` (the `backend` group and the icon import), `app/sitemap.ts`, `scripts/study/build-index.mjs`, `scripts/study/freshness.mjs` (`TRACKED`)
- Generated and committed: `app/sql/content.json`, `public/study/sql.html`, `public/search-index.json`, `app/lib/studyMeta.json`, `scripts/study/freshness-state.json`, `docs/freshness/*`

- [ ] **Step 1: Write the builder**

Same shape as `add-architecture-guide.mjs`. Sections: `quickref`, `sq1` “1. Relational Basics”, `sq2` “2. Indexing”, `sq3` “3. Transactions and Isolation”, `sq4` “4. Query Puzzles”, `sq5` “5. Schema Design and Migrations”, `sq6` “6. Performance and Scaling”, `sq7` “7. PostgreSQL from Node.js”, `sq8` “8. Beyond Relational”. The first card of `sq1` ends with a `NOTE(...)` saying which PostgreSQL version every output in the guide was captured on, and the date. `H.newPage` config: `key: 'sql'`, `title: 'Data and SQL: Interview Prep'`, `brand: 'Data and SQL'`, `brandSub: 'indexes, transactions, queries'`, `h1: 'Data and SQL'`, `eyebrow: 'Prep guide'`, a two-sentence `lede`. Log: `sql guide written: N sections, M cards`.

- [ ] **Step 2: Build and run the acceptance check**

Run: `node scripts/study/add-sql-guide.mjs && node scripts/study/check-guide.mjs sql --min 55 --sections sq1:7,sq2:8,sq3:8,sq4:13,sq5:6,sq6:6,sq7:6,sq8:5`
Expected: `check-guide sql: OK (59 cards in 8 sections)`. Titles that collide with the `interview-prep`, `interview-cheatsheet`, `aws` or `whiteboard` guides are renamed here.

- [ ] **Step 3: Register the guide**

- `app/sql/page.tsx`: copy `app/architecture/page.tsx`; title `Data and SQL`, `src="/study/sql.html"`.
- `app/page.tsx`: add `Database` to the `lucide-react` import; add to the `backend` group after the `nodejs` entry: `{ slug: 'sql', title: 'Data and SQL', desc: 'Indexes, transactions and isolation, query puzzles, schema changes without downtime, and PostgreSQL from Node.js. Every result comes from a real run.', icon: Database }`.
- `app/sitemap.ts`: add `['sql', 0.8]`. `scripts/study/build-index.mjs`: add `sql: 'Data and SQL'`.
- `scripts/study/freshness.mjs`: add to `TRACKED`: `{ name: 'Prisma', npm: 'prisma', re: /\bPrisma\s+v?(\d)\b/g }` and `{ name: 'Drizzle', npm: 'drizzle-orm', re: /\bDrizzle\s+v?(\d)\b/g }`.

- [ ] **Step 4: Full build, tests, and a browser check**

Run: `npm run study:build && npm run build && npm test`
Expected: includes `PASS sql: card/section counts match studyMeta`, ends `ALL CHECKS PASSED`.

Start `npx next start -p 3011`, open `http://localhost:3011/sql`, go to section 4. Confirm a puzzle shows the task and tables, hides the solution until “Show a solution” is opened, and that its collapsed summary line contains no SQL from the answer. Check one wide result at 390px (it scrolls inside its own box). Stop the server.

- [ ] **Step 5: Tear down the lab, record freshness, commit**

```bash
docker rm -f sql-lab
npm run study:freshness -- --mark sql
npm run study:freshness
git add app/sql app/page.tsx app/sitemap.ts app/lib/studyMeta.json public/study public/search-index.json scripts/study docs/freshness
git commit -m "Add the Data and SQL guide"
```
