SET timezone = 'UTC';

CREATE TABLE departments (id serial PRIMARY KEY, name text NOT NULL);
INSERT INTO departments (name) VALUES ('Engineering'), ('Sales'), ('Support'), ('Finance');

CREATE TABLE employees (
  id serial PRIMARY KEY,
  name text NOT NULL,
  department_id int REFERENCES departments(id),
  manager_id int REFERENCES employees(id),
  salary int NOT NULL,
  hired_on date NOT NULL
);
INSERT INTO employees (id, name, department_id, manager_id, salary, hired_on) VALUES
  (1,  'Ada',    1, NULL, 150000, '2015-03-01'),
  (2,  'Grace',  1, 1,    150000, '2016-06-15'),
  (3,  'Alan',   1, 1,    120000, '2018-01-10'),
  (4,  'Linus',  1, 2,    110000, '2019-09-01'),
  (5,  'Margaret', 1, 2,   95000, '2021-02-20'),
  (6,  'Sam',    2, 1,     90000, '2017-04-04'),
  (7,  'Sue',    2, 6,     85000, '2020-05-05'),
  (8,  'Sid',    2, 6,     85000, '2022-07-07'),
  (9,  'Cora',   3, 1,     70000, '2018-08-08'),
  (10, 'Cal',    3, 9,     65000, '2023-03-03'),
  (11, 'Fiona',  1, 3,     60000, '2024-01-15'),
  (12, 'Nora',   NULL, 6,  72000, '2023-11-11');
SELECT setval('employees_id_seq', 12);

CREATE TABLE customers (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  country text NOT NULL,
  created_at timestamptz NOT NULL
);
INSERT INTO customers (email, country, created_at)
SELECT 'user' || i || '@example.com',
       (ARRAY['GB','US','DE','IN','FR'])[1 + i % 5],
       timestamptz '2023-01-01 00:00+00' + i * interval '6 hours'
FROM generate_series(1, 2000) AS i;

CREATE TABLE orders (
  id bigserial PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers(id),
  status text NOT NULL,
  total_cents int NOT NULL,
  created_at timestamptz NOT NULL
);
-- customers 1961..2000 (40 customers) never order
INSERT INTO orders (customer_id, status, total_cents, created_at)
SELECT 1 + (i * 7919) % 1960,
       CASE WHEN i % 50 = 0 THEN 'refunded' WHEN i % 20 = 1 THEN 'cancelled' ELSE 'paid' END,
       1000 + (i * 37) % 9000,
       timestamptz '2024-01-01 00:00+00' + i * interval '3 minutes'
FROM generate_series(1, 200000) AS i;

CREATE TABLE logins (user_id int NOT NULL, day date NOT NULL);
INSERT INTO logins (user_id, day)
SELECT u, date '2024-03-01' + (d - 1)
FROM (VALUES
  (1, 1), (1, 2), (1, 3), (1, 5), (1, 6), (1, 8),
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 10),
  (3, 2), (3, 4), (3, 5), (3, 6), (3, 7), (3, 9)
) AS v(u, d);

CREATE TABLE bookings (id serial PRIMARY KEY, room int NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL);
INSERT INTO bookings (room, starts_at, ends_at) VALUES
  (1, '2024-05-01 09:00+00', '2024-05-01 10:00+00'),
  (1, '2024-05-01 09:30+00', '2024-05-01 10:30+00'),
  (1, '2024-05-01 11:00+00', '2024-05-01 12:00+00'),
  (2, '2024-05-01 09:00+00', '2024-05-01 10:00+00'),
  (2, '2024-05-01 10:00+00', '2024-05-01 11:00+00'),
  (2, '2024-05-01 13:00+00', '2024-05-01 14:00+00'),
  (2, '2024-05-01 13:30+00', '2024-05-01 14:30+00'),
  (3, '2024-05-01 09:00+00', '2024-05-01 10:00+00');

CREATE TABLE accounts (id int PRIMARY KEY, owner text NOT NULL, balance_cents int NOT NULL CHECK (balance_cents >= 0));
INSERT INTO accounts VALUES (1, 'Ada', 100), (2, 'Grace', 100);

CREATE TABLE on_call (doctor text PRIMARY KEY, on_call boolean NOT NULL);
INSERT INTO on_call VALUES ('Alice', true), ('Bob', true);

CREATE TABLE jobs (id serial PRIMARY KEY, status text NOT NULL DEFAULT 'queued');
INSERT INTO jobs (status) SELECT 'queued' FROM generate_series(1, 3);

CREATE TABLE contacts (id serial PRIMARY KEY, email text NOT NULL);
INSERT INTO contacts (email) VALUES
  ('ada@example.com'), ('grace@example.com'), ('ada@example.com'), ('alan@example.com'), ('grace@example.com'), ('ada@example.com');

ANALYZE;
