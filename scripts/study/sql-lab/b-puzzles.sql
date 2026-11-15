-- P1 second-highest salary, ties handled: subquery form
select max(salary) as second_highest from employees where salary < (select max(salary) from employees);
-- >>>
-- P1 DENSE_RANK form
select name, salary from (select name, salary, dense_rank() over (order by salary desc) as r from employees) x where r = 2;
-- >>>
-- P1 the trap: OFFSET 1 returns a tied top earner
select name, salary from employees order by salary desc limit 1 offset 1;
-- >>>
-- P2 top two earners per department
select department_id, name, salary, rn from (
  select department_id, name, salary,
         row_number() over (partition by department_id order by salary desc, id) as rn
  from employees) x
where rn <= 2 order by department_id nulls last, rn;
-- >>>
-- P3 running total per customer
select id, created_at::date::text as day, total_cents,
       sum(total_cents) over (partition by customer_id order by created_at, id) as running_cents
from orders where customer_id = 42 order by created_at, id limit 5;
-- >>>
-- P4 duplicate emails
select email, count(*) as copies, min(id) as keep_id from contacts group by email having count(*) > 1 order by email;
-- >>>
begin;
-- >>>
delete from contacts c using contacts d where c.email = d.email and c.id > d.id;
-- >>>
select id, email from contacts order by id;
-- >>>
rollback;
-- >>>
-- P5 customers with no orders: NOT EXISTS
select count(*) as no_orders from customers c where not exists (select 1 from orders o where o.customer_id = c.id);
-- >>>
-- P5 LEFT JOIN ... IS NULL
select count(*) as no_orders from customers c left join orders o on o.customer_id = c.id where o.id is null;
-- >>>
-- P5 NOT IN works here only because orders.customer_id is NOT NULL
select count(*) as no_orders from customers where id not in (select customer_id from orders);
-- >>>
-- P5 the trap: managers.manager_id contains a NULL (Ada has no manager)
select name from employees where id not in (select manager_id from employees);
-- >>>
select name from employees e where not exists (select 1 from employees m where m.manager_id = e.id) order by id;
-- >>>
-- P6 orders per status as columns
select c.country,
       count(*) filter (where o.status = 'paid') as paid,
       count(*) filter (where o.status = 'refunded') as refunded,
       count(*) filter (where o.status = 'cancelled') as cancelled
from orders o join customers c on c.id = o.customer_id
group by c.country order by c.country;
-- >>>
-- P7 month over month revenue change
with monthly as (
  select date_trunc('month', created_at) as m, sum(total_cents) as revenue
  from orders where status = 'paid' group by 1)
select m::date::text as month, revenue, revenue - lag(revenue) over (order by m) as change
from monthly order by m limit 6;
-- >>>
-- P8 longest login streak per user (gaps and islands)
with numbered as (
  select user_id, day, day - (row_number() over (partition by user_id order by day))::int as grp from logins),
streaks as (
  select user_id, count(*) as days, min(day) as first_day from numbered group by user_id, grp)
select distinct on (user_id) user_id, days, first_day::text from streaks order by user_id, days desc, first_day;
-- >>>
-- P8 the intermediate step, user 3
select user_id, day::text, day - (row_number() over (partition by user_id order by day))::int as grp from logins where user_id = 3 order by day;
-- >>>
-- P9 latest order per customer: DISTINCT ON
select distinct on (customer_id) customer_id, id, created_at::text from orders where customer_id <= 3 order by customer_id, created_at desc, id desc;
-- >>>
-- P9 ROW_NUMBER
select customer_id, id, created_at::text from (
  select customer_id, id, created_at, row_number() over (partition by customer_id order by created_at desc, id desc) as rn
  from orders where customer_id <= 3) x where rn = 1 order by customer_id;
-- >>>
-- P10 everyone under Ada with depth
with recursive tree as (
  select id, name, manager_id, 0 as depth from employees where id = 1
  union all
  select e.id, e.name, e.manager_id, t.depth + 1 from employees e join tree t on e.manager_id = t.id)
select id, name, depth from tree order by depth, id;
-- >>>
-- P11 overlapping bookings
select a.room, a.id as first, b.id as second
from bookings a join bookings b on a.room = b.room and a.id < b.id and a.starts_at < b.ends_at and b.starts_at < a.ends_at
order by a.room, a.id;
-- >>>
-- P11 prevent them with an exclusion constraint
create extension if not exists btree_gist;
-- >>>
create temp table bookings2 (id serial primary key, room int, starts_at timestamptz, ends_at timestamptz, exclude using gist (room with =, tstzrange(starts_at, ends_at) with &&));
-- >>>
insert into bookings2 (room, starts_at, ends_at) values (1, '2024-05-01 09:00+00', '2024-05-01 10:00+00'), (1, '2024-05-01 10:00+00', '2024-05-01 11:00+00');
-- >>>
insert into bookings2 (room, starts_at, ends_at) values (1, '2024-05-01 09:30+00', '2024-05-01 10:30+00');
-- >>>
-- P12 filtering on a window function result
select name, salary, row_number() over (order by salary desc) as rn from employees where row_number() over (order by salary desc) <= 3;
