// Testing guide, part C: back end, CI, interview scenarios. API samples were run on 15 Nov 2026
// (Node.js 26, node:test, supertest 7.3.2, Express 5.3.0).
import { P, L, N, T, C, SAY, TRAP, K, GO, RAPID, QUIZ, DIAGRAM, NOTE, SAMPLE } from './cc-kit.mjs';
import { TE } from './dg-test.mjs';

// ───────────────────────────────────────────── 6. back end
export const backend = [
  K('How do you test an HTTP API in Node.js?',
    P('Build the app from a **factory that receives its dependencies**, so a test can pass fakes and never opens a port or a database connection. Then use `supertest` to call it.'),
    C(`// app.mjs
export function createApp({ users, orders }) {
  const app = express();
  app.use(express.json());

  app.get('/users/:id', async (req, res, next) => {
    try {
      const user = await users.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'not found' });
      res.json(user);
    } catch (err) { next(err); }
  });

  app.use((err, _req, res, _next) => { res.status(500).json({ error: 'internal error' }); });   // never leak err.message
  return app;
}`, 'An app that takes its dependencies'),
    C(`import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from './app.mjs';

const fakeUsers = { findById: async (id) => (id === '1' ? { id: '1', name: 'Ada' } : null) };
const fakeOrders = { create: async (o) => ({ id: 'o-1', ...o }) };

test('GET /users/:id returns the user', async () => {
  const res = await request(createApp({ users: fakeUsers, orders: fakeOrders })).get('/users/1');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: '1', name: 'Ada' });
});

test('GET /users/:id returns 404 for a missing user', async () => {
  const res = await request(createApp({ users: fakeUsers, orders: fakeOrders })).get('/users/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'not found' });
});`, 'supertest against the app (both pass, no server listening)'),
    L('The same shape works with Fastify (`app.inject`) and NestJS (`Test.createTestingModule`).', 'Test each route for success, validation failure, unauthenticated, forbidden, not found and conflict.'),
  ),
  K('Fake the database or use a real one?',
    T(['', 'Fake / in-memory', 'Real database in a container'], [
      ['**Speed**', 'Milliseconds', 'Seconds to start; fast once running'],
      ['**Confidence**', 'Tests your handler logic', 'Tests your SQL, constraints, transactions and migrations'],
      ['**Use for**', 'Handlers and business rules', 'Repository and query code'],
      ['**Risk**', 'A fake that behaves differently from the real thing', 'Slower suites, container setup'],
    ]),
    L('**Handler tests:** pass a fake repository (as above) so they run in milliseconds.', '**Repository tests:** run against the same database engine you use in production, in a throwaway container (for example with Testcontainers), because a fake cannot prove a unique constraint or an index.', '**Isolation:** wrap each test in a transaction and roll it back, or truncate tables between tests.'),
    TRAP('SQLite standing in for PostgreSQL passes tests and fails in production on types, locking and SQL differences. Test against the engine you deploy.'),
    GO(['/sql', 'Data and SQL guide']),
  ),
  K('What is a contract test, and when do you need one?',
    P('When two services (or a front end and an API) agree on a request and response shape, a **contract test** checks that each side still honours it, without running both together.'),
    L('**Consumer-driven contracts** (for example Pact): the consumer records what it needs; the provider verifies it can meet it.', '**Schema validation** is the light version: validate real responses against an OpenAPI or JSON Schema in the provider’s tests, and generate types or MSW handlers from the same schema for the consumer.', 'You need them when teams deploy independently and an integration environment is slow or unreliable.'),
    P('Without them, a field renamed by one team is found by another team’s production error.'),
  ),
  K('How do you test code that publishes to or consumes from a queue?',
    L('**Publisher:** inject the publish function and assert it was called with the right event (a mock is appropriate here: the call is the outcome).', '**Consumer:** call the handler directly with a sample message and assert the outcome. Test the **idempotency**: handling the same message twice must give the same result.', '**Failure paths:** a handler that throws should result in a retry and, after the limit, a dead-letter message. Test that your code throws, and leave retry mechanics to the broker.', '**One integration test** with a real broker in a container proves the wiring, so the rest can stay fast.'),
    C(`test('handling the same message twice has the same effect', async () => {
  const msg = { eventId: 'e-1', orderId: 'o-1' };
  await handleOrderPlaced(msg, deps);
  await handleOrderPlaced(msg, deps);
  assert.equal(deps.emailsSent.length, 1);
});`, 'An idempotency test (sketch: deps is your fake)'),
  ),
  K('What does Node’s built-in test runner give you?',
    C(`test('mock.fn records calls without a library', async (t) => {
  const create = t.mock.fn(async (o) => ({ id: 'o-2', ...o }));
  await request(createApp({ users: fakeUsers, orders: { create } })).post('/orders').send({ sku: 'KB-2', quantity: 1 });
  assert.equal(create.mock.callCount(), 1);
  assert.deepEqual(create.mock.calls[0].arguments[0], { sku: 'KB-2', quantity: 1 });
});

test('built-in timers let a test skip waiting', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let fired = false;
  setTimeout(() => { fired = true; }, 10_000);
  t.mock.timers.tick(10_000);
  assert.equal(fired, true);
});`, 'Mocks and fake timers in node:test (both pass)'),
    L('Run with `node --test`; it discovers files, runs them in parallel and reports in TAP or a readable format.', '`node:assert/strict`, mocks, fake timers, test hooks and a coverage flag are included. There is nothing to install.', 'It is enough for services and libraries. A framework such as Vitest adds a richer API, watch mode and a larger ecosystem.'),
    NOTE('Run on Node.js 26 on 15 Nov 2026. APIs under `t.mock` have changed between Node versions, so check the documentation for yours.'),
  ),
  K('How do you test error handling and timeouts?',
    C(`test('an internal error does not leak its message', async () => {
  const broken = { findById: async () => { throw new Error('password=hunter2 connection refused'); } };
  const res = await request(createApp({ users: broken, orders: fakeOrders })).get('/users/1');
  assert.equal(res.status, 500);
  assert.deepEqual(res.body, { error: 'internal error' });
});`, 'The internal message never reaches the client (passes)'),
    L('Make the dependency **throw** or **never resolve** with a fake, and assert on the response and on the logging.', 'Test the **timeout behaviour** with fake timers, not by waiting: advance the clock and assert the request was cancelled.', 'Assert that secrets and stack traces are absent from responses.'),
  ),
  RAPID('Rapid-fire: testing a back end', [
    ['How do you test a route without a server?', 'Build the app from a factory and call it with supertest or the framework’s `inject`.'],
    ['What do you fake?', 'Repositories and external services in handler tests.'],
    ['What do you run for real?', 'The database engine for repository tests, in a container.'],
    ['What is a contract test?', 'A check that a consumer and a provider still agree on the request and response shape.'],
    ['How do you test idempotency?', 'Send the same request or message twice and assert one effect.'],
    ['How do you test a timeout?', 'Fake timers and a dependency that never resolves.'],
    ['What must an error response never contain?', 'The internal message, a stack trace or a secret.'],
  ]),
];

// ───────────────────────────────────────────── 7. CI and after deployment
export const ci = [
  DIAGRAM('Tests in the pipeline', TE.pipeline,
    P('Order stages by **cost and speed**: the cheapest checks first, so a failure costs seconds, not the full run.'),
    L('**Pull request:** types, lint, unit and integration tests, and a handful of end-to-end tests on the critical journeys.', '**Before release:** the full end-to-end suite, accessibility and visual checks, dependency scanning.', '**After deploy:** a smoke test of the live system, then monitoring.'),
  ),
  K('The suite takes 40 minutes. How do you make it faster?',
    N('**Measure first:** which files and which tests take the time? Most suites have a few slow offenders.', '**Parallelise and shard:** run test files in parallel, and split the suite across CI machines.', '**Move checks down a level:** a case covered by a 30-second end-to-end test can usually be a 30-millisecond unit test.', '**Cache:** dependencies, build output and browser binaries.', '**Run only what changed:** affected tests on a pull request, the full suite on main.', '**Fix the setup cost:** one expensive `beforeAll` shared safely beats a slow `beforeEach`.'),
    TRAP('Do not delete slow tests before asking why they are slow. The cause is often one shared fixture or a real network call.'),
  ),
  K('How do you manage test data?',
    L('**Create data in the test** with a factory (`buildUser({ role: "admin" })`), so the test shows what matters about it.', '**Isolate:** each test creates what it needs and does not depend on rows from another test. Run in random order to prove it.', '**Reset cheaply:** roll back a transaction or truncate tables between tests rather than rebuilding the database.', '**Seed only what is shared and read-only** (reference data), and version it with the code.', '**Never use production data**: it holds personal information and makes tests unrepeatable.'),
  ),
  K('How do you deal with a flaky test in CI?',
    N('**Detect it:** track tests that needed a retry or failed and then passed with no change.', '**Quarantine it:** move it out of the blocking path so it stops blocking everyone, with an **owner and a deadline** to fix it.', '**Find the cause** using the flaky-test causes: sleeps, shared state, time, network, order.', '**Fix or delete it:** a test nobody trusts is worse than none.'),
    TRAP('A blanket “retry three times” setting hides the problem. It makes the suite green and the flakiness invisible until it hits a real bug.'),
  ),
  K('What testing happens after deployment?',
    L('**Smoke tests:** a few quick requests or a single end-to-end journey against the live environment.', '**Canary or staged rollout:** release to a small share of traffic and compare error rates and latency before going wider.', '**Feature flags:** separate deploying code from releasing it, so a bad feature is switched off without a rollback.', '**Synthetic monitoring:** scripted journeys that run continuously and alert when they fail.', '**Observability:** logs, metrics and traces tell you what tests could not predict.'),
    GO(['/system-design-scale', 'System Design at Scale'], ['/web-platform', 'Web Platform: CI/CD']),
  ),
  QUIZ('Which check belongs first in a CI pipeline?',
    ['The full end-to-end suite', 'Type-check and lint', 'The visual regression suite', 'A load test'], 1,
    'They are the cheapest and fastest, and catch a large share of mistakes in seconds. Expensive stages run only if the cheap ones pass.'),
];

// ───────────────────────────────────────────── 8. interview scenarios
export const scenarios = [
  K('How would you test this login form?',
    P('Start by **listing the cases**, then say which level covers each. That structure is the answer.'),
    T(['Case', 'Level'], [
      ['Empty and invalid email, short password show messages and do not submit', 'Component test (RTL)'],
      ['Valid input calls `onSubmit` with the values', 'Component test'],
      ['A server error is shown to the user; the button is disabled while pending', 'Component test with a fake `onSubmit` or MSW'],
      ['The form is keyboard accessible and fields have labels', 'Component test with `getByLabelText`, plus an axe scan'],
      ['A real user can sign in and see their account; a wrong password shows an error', 'End-to-end (Playwright)'],
      ['Password rules and rate limiting', 'Unit and API tests on the server'],
    ]),
    P('Then show one of each. At the component level it is the form test from the React Testing Library section. At the end-to-end level:'),
    C(`test('a wrong password shows the server error', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Wrong email or password');
});`, 'The end-to-end half (passes)'),
    SAY('I would cover the validation and error states with fast component tests, prove the real sign-in journey once end to end, and leave password rules to server tests.'),
  ),
  K('How would you test a checkout flow end to end?',
    P('Checkout is high risk (money), so it earns an end-to-end test, but not every combination does.'),
    T(['Level', 'What to cover'], [
      ['**Unit**', 'Pricing, discounts, tax, rounding (with integer cents), stock rules'],
      ['**Component / integration**', 'Cart and form states, validation, error messages, loading and empty states, with MSW'],
      ['**API**', 'Order creation, idempotency, payment failure handling, inventory race'],
      ['**End-to-end**', 'One happy path through a test payment provider; one declined-payment path'],
      ['**After deploy**', 'A smoke test that a test order can be placed; monitoring on error rate and conversion'],
    ]),
    L('Stub the **payment provider** in most tests and use its sandbox for a single real run.', 'Leave out: every shipping option, every coupon, every browser. They belong lower down.'),
  ),
  K('You inherit a project with no tests. Where do you start?',
    N('**Make it safe to change:** add a type-checker and linter; set up CI so something runs on every change.', '**Characterise before you change:** write a few tests that pin current behaviour of the riskiest or most-changed code, even if the behaviour is odd.', '**Cover the critical journey end to end,** one test, so a catastrophic break is caught.', '**Add a test with every bug fix and every change** (the “boy scout” rule); do not stop to write tests for everything.', '**Use the data:** coverage and the bug history show where to look.'),
    TRAP('Do not propose a big-bang “write tests for the whole app”. It never finishes and the tests encode bugs. Grow coverage where change happens.'),
  ),
  K('How do you test code that an AI assistant wrote?',
    L('**Write the test first** (or at least decide the cases), then let the assistant implement against them. Failing tests give it a goal and you a check.', '**Review the assertions as carefully as the code:** an assistant will happily weaken a test to make it pass, mock the thing under test, or assert on nothing.', '**Ask for the edge cases** (empty, large, invalid, concurrent) and read them.', '**Break it on purpose:** change the code and confirm a test fails.', '**Run the suite yourself** and require the command output, not a claim.'),
    GO(['/ai-dev', 'AI-Assisted Development guide']),
  ),
  K('What is your testing strategy for a new full-stack project?',
    P('A 60-second answer, by level, with tools. Adapt it to your stack.'),
    SAMPLE('An answer to adapt', `
"I start with TypeScript strict and ESLint in CI as the base layer.
For logic I write unit tests with Vitest, using test.each for tables of cases.
For the UI, most of my tests are component tests with React Testing Library and
MSW: they render real screens, replace only the network, and assert on what the
user sees. For the API I build the app from a factory and test routes with
supertest against fakes, and run repository tests against a real database in a
container. Then a small Playwright suite covers the two or three critical
journeys, with a saved login and traces on failure. In CI the cheap checks run
first, and I track flaky tests and quarantine them with an owner. After
deploy, a smoke test and monitoring."`),
    P('Say **why** at each level (cost versus confidence), and mention what you would not test.'),
  ),
  RAPID('Rapid-fire: testing interview questions', [
    ['Unit or integration for a UI?', 'Mostly integration: real components, fake network.'],
    ['What do you mock?', 'The network and the clock, not your own code.'],
    ['How do you stop flaky tests?', 'Wait for conditions, isolate data, fake time, mock the boundary, run in random order.'],
    ['TDD: when?', 'For logic with clear inputs and outputs, and for bug fixes: write the failing test first.'],
    ['What is a good test name?', 'It states the behaviour: “shows an error when the email is invalid”.'],
    ['Biggest testing mistake?', 'Testing implementation details, so refactors break tests.'],
    ['What do you do with a flaky test?', 'Quarantine with an owner, find the cause, fix or delete.'],
    ['How do you know tests are good?', 'They fail when behaviour breaks and survive refactors.'],
  ]),
];
