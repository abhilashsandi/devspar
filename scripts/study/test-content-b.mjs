// Testing guide, part B: MSW and Playwright. Samples were run on 15 Nov 2026 (MSW 3.0.6, Playwright 1.65.1).
import { P, L, N, T, C, SAY, TRAP, K, GO, RAPID, QUIZ, DIAGRAM, NOTE, SAMPLE } from './cc-kit.mjs';
import { TE } from './dg-test.mjs';

// ───────────────────────────────────────────── 4. MSW
export const msw = [
  DIAGRAM('Mocking at the network layer with MSW', TE.mswFlow,
    P('**Mock Service Worker** intercepts requests at the network level, so your component, your data-fetching code and `fetch` itself all run for real. Only the server is replaced.'),
    T(['Approach', 'What still runs for real', 'Problem'], [
      ['Mock the `fetch` function', 'The component', 'Your fetch wrapper, headers, URL building and response parsing are skipped'],
      ['Mock the data hook or API module', 'The component', 'You test the component against your own guess of the hook'],
      ['**MSW**', '**Component, hook, fetch wrapper, parsing**', 'You must write handlers (reusable in dev and Storybook)'],
    ]),
    SAY('I mock the network, not the code that calls it. That way my tests exercise the same request-building and parsing code as production.'),
  ),
  K('How do you set up MSW for tests?',
    C(`// tests/server.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw/http';

export const handlers = [
  http.get('/api/users', () => HttpResponse.json([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }])),
];
export const server = setupServer(...handlers);`, 'Default handlers (MSW 3 import paths)'),
    C(`// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './tests/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());`, 'Start, reset and stop the server around the tests'),
    L('**`onUnhandledRequest: "error"`** makes a request with no handler fail loudly instead of reaching the real network.', '**`resetHandlers()`** after each test removes per-test overrides, so tests cannot affect each other.', 'In MSW 3 the helpers are imported from `msw/http` and `msw/node` (and `delay` from `msw/utils/delay`); the older single `msw` import used in version 2 examples also still resolves. Check the docs for the version you use.'),
    NOTE('Import paths checked on 15 Nov 2026 against the MSW documentation and the installed package (3.0.6).'),
  ),
  K('How do you test loading, empty and error states?',
    P('Keep happy-path handlers as defaults and **override per test** with `server.use`. Overrides are put in front of the defaults and removed by `resetHandlers`.'),
    C(`import { delay } from 'msw/utils/delay';
import { http, HttpResponse } from 'msw/http';

test('error: a per-test override returns a 500', async () => {
  server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 })));
  render(<UserList />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load users');
});

test('empty: a per-test override returns an empty list', async () => {
  server.use(http.get('/api/users', () => HttpResponse.json([])));
  render(<UserList />);
  expect(await screen.findByText('No users yet')).toBeInTheDocument();
});

test('loading: a delayed response keeps the loading state visible', async () => {
  server.use(http.get('/api/users', async () => { await delay(200); return HttpResponse.json([{ id: 1, name: 'Ada' }]); }));
  render(<UserList />);
  expect(screen.getByText('Loading users…')).toBeInTheDocument();
  expect(await screen.findByText('Ada')).toBeInTheDocument();
});`, 'Error, empty and loading (all pass)'),
    P('The same technique covers a slow network, a 404, a malformed body, a timeout, and a network failure (`HttpResponse.error()`).'),
  ),
  K('How do you assert on the request your app sends?',
    P('A handler can read the incoming request. Capture it and assert on it afterwards, or return an error when it is wrong.'),
    C(`test('the request body the app sends is what the API expects', async () => {
  let received: unknown;
  server.use(http.post('/api/orders', async ({ request }) => {
    received = await request.json();
    return HttpResponse.json({ id: 'o-1' }, { status: 201 });
  }));
  await expect(createOrder({ sku: 'KB-1', quantity: 2 })).resolves.toEqual({ id: 'o-1' });
  expect(received).toEqual({ sku: 'KB-1', quantity: 2 });
});`, 'Assert on the request body (passes)'),
    SAMPLE('What an unhandled request looks like (onUnhandledRequest: "error")', `
[MSW] Warning: intercepted a request without a matching request handler:
  • POST /api/orders
If you still wish to intercept this unhandled request, please create a request handler for it.`),
    P('In that run the call itself rejected with `fetch failed`, so the test fails, which is the point: a request nobody planned for is a bug in the test setup or the app.'),
  ),
  K('How do you test a component that uses a data-fetching library?',
    P('Libraries such as TanStack Query keep a cache. Two settings stop it from leaking between tests or hiding failures:'),
    C(`function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });   // fresh cache, no retries
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}`, 'A new client per test, with retries off'),
    L('**A new client per test:** otherwise one test’s cached data answers the next test’s query.', '**`retry: false`:** by default a failed query is retried with a growing delay. In a check of this exact setup the error state had still not appeared after 1.5 seconds, so a `findBy` for it timed out.', 'Then use MSW exactly as above: the library makes real `fetch` calls and MSW answers them.'),
  ),
  K('Where else is MSW useful?',
    L('**Local development** (browser): develop the front end before the back end exists, with the same handlers.', '**Storybook:** render components in each network state.', '**End-to-end tests:** Playwright can also stub with `page.route`; MSW is the better fit when the same handlers should be shared with unit tests.', '**Demos and onboarding:** run the app offline.'),
    P('Share handlers in one folder and import them in every environment, so the mock server is a single source of truth that you keep in line with the real API (for example by validating handlers against the OpenAPI schema).'),
    GO(['/react-training', 'React guide: testing']),
  ),
  QUIZ('A test mocks `fetch` directly. What does an MSW-based test still exercise that it does not?',
    ['The assertion library', 'Your real request building and response parsing code', 'The CSS', 'The browser'], 1,
    'With MSW the request is really made and really parsed; only the server is replaced. A mocked `fetch` skips your wrapper’s URL building, headers and parsing.'),
];

// ───────────────────────────────────────────── 5. end to end
export const e2e = [
  K('What are end-to-end tests for, and how many should you have?',
    P('End-to-end tests drive the **real application in a real browser**, with a real (or realistic) back end. They prove that the pieces fit together: routing, the server, the database, the browser itself.'),
    L('**Few, valuable journeys:** sign up, sign in, the main purchase or task, anything that makes or loses money.', '**Not every case:** combinations and edge cases belong in unit and integration tests, which are faster and more precise.', '**Stable by design:** each test creates its own data and does not depend on another test.'),
    T(['Slower and more brittle than', 'But the only level that catches'], [
      ['A unit or component test', 'Bugs between layers: a wrong URL, a missing CORS header, a broken deploy, a route that does not exist'],
    ]),
    SAY('I keep a small end-to-end suite for the journeys that matter and push everything else down to faster tests.'),
  ),
  DIAGRAM('How Playwright runs a test', TE.playwright,
    P('Each test gets a fresh **browser context**, like a new incognito profile with its own cookies and storage, so tests are isolated without restarting the browser. Workers run files in parallel.'),
    C(`test('a user can sign in', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('correct-horse');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Welcome, Ada')).toBeVisible();          // web-first assertion: retries until true
  await expect(page.getByRole('listitem')).toHaveCount(2);
});`, 'A Playwright test (passes)'),
  ),
  K('Locators and auto-waiting: why should you never write a fixed sleep?',
    P('Playwright **locators** are lazy and re-evaluated on each use, and actions wait until the element is ready. **Web-first assertions** (`expect(locator).toBeVisible()`) retry until they pass or time out.'),
    C(`await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForTimeout(100);                                         // guessing
expect(await page.getByText('Welcome, Slow').count()).toBe(0);          // too early: the response takes 600 ms
await expect(page.getByText('Welcome, Slow')).toBeVisible();            // waits exactly as long as needed`, 'A sleep reads the page too early (run against a response that takes 600 ms)'),
    L('A fixed sleep is **too short** on a slow day and **too long** every other day.', 'Prefer role and label locators: they match what users see and survive markup changes.', '`page.getByTestId` is the escape hatch when nothing accessible identifies the element.', 'A non-retrying read such as `.count()` or `.textContent()` followed by an ordinary `expect` does not wait. Use the web-first form.'),
    TRAP('`waitForTimeout` is for debugging only. Every one left in a suite is a future flaky test.'),
  ),
  K('How do you sign in once and reuse it across tests?',
    P('Signing in through the UI in every test is slow. Sign in **once** in a setup project, save the browser state, and load it in the tests that need it.'),
    C(`// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('sign in once and save the session', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Password').fill('correct-horse');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Welcome, Ada')).toBeVisible();
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});`, 'The setup test'),
    C(`// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /auth\\.setup\\.ts/ },
  { name: 'chromium', testIgnore: /auth\\.setup\\.ts/, dependencies: ['setup'] },
],

// a test that starts signed in
test.use({ storageState: 'e2e/.auth/user.json' });`, 'A setup project, and a test that reuses the session (all pass)'),
    TRAP('The saved file contains real session cookies. Keep it out of git (`.gitignore`) and generate it in CI.'),
  ),
  K('When do you stub the network in an end-to-end test?',
    P('A true end-to-end test uses the real back end. Stubbing is useful for states that are hard to produce and for third parties you do not control.'),
    C(`await page.route('**/api/login', (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ name: 'Stubbed' }) }));
await page.route('**/api/users', (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));`, '`page.route` fulfils requests (passes)'),
    T(['Stub', 'Keep real'], [
      ['A payment provider, an email service, a maps API', 'Your own API and database for the journey under test'],
      ['A rare error response or a very slow response', 'Anything whose real behaviour is what you want to prove'],
    ]),
    P('What you lose by stubbing: the test no longer proves the integration it replaced. Keep at least one test of each critical journey running against the real thing.'),
  ),
  K('How do you debug a failing end-to-end test in CI?',
    N('Open the **trace** (`trace: "on-first-retry"` records it): a time-travel view with the DOM, network, console and screenshots at every step.', 'Check the failing step’s **screenshot and video**, if enabled.', 'Reproduce locally with `--ui` or `--debug` and the same seed data.', 'Decide whether it is a **real bug**, a **test bug** (a bad locator, a race) or **environment** (data, timing).'),
    L('**Retries** can hide flakiness: a test that passes on the second attempt is flaky, and a report that only counts failures will not tell you. Track tests that needed a retry.', 'Run with the same browser version and viewport as CI.', 'Keep traces as CI artefacts only for failures, to save space.'),
  ),
  K('Visual regression and accessibility checks in Playwright',
    C(`test('the login page has no detectable accessibility violations', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('visual snapshot of the form', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('form')).toHaveScreenshot('login-form.png');
});`, 'An axe scan and a screenshot assertion (both pass once a baseline exists)'),
    SAMPLE('The first run of the screenshot test', `
Error: A snapshot doesn't exist at ...\\b-login.spec.ts-snapshots\\login-form-chromium-win32.png, writing actual.`),
    L('The first run **fails and writes the baseline**; commit it and later runs compare against it.', 'Baselines depend on the operating system and browser, so generate them in the same environment as CI (a container) or screenshots will differ.', 'Screenshot a **component or region**, not a whole page, and mask dynamic parts such as dates.', 'Automated accessibility tools find only a share of problems. They catch missing labels and low contrast, not a confusing flow.'),
  ),
  K('Playwright or Cypress?',
    T(['', 'Playwright', 'Cypress'], [
      ['**Model**', 'A separate Node.js process drives the browser', 'Test code runs in the browser alongside your app'],
      ['**Tabs and origins**', 'Multiple pages, contexts and origins in one test', 'Historically one origin per test; check the current documentation for what is supported'],
      ['**Parallelism**', 'Built-in workers; sharding across machines', 'Parallel runs use `--record --parallel` with Cypress Cloud'],
      ['**Debugging**', 'Trace viewer, UI mode, codegen', 'Interactive runner with time travel'],
      ['**Network stubbing**', '`page.route`', '`cy.intercept`'],
      ['**Languages**', 'TypeScript, JavaScript, Python, Java, .NET', 'JavaScript and TypeScript'],
    ]),
    P('Both are mature and either is a defensible choice. Pick the one your team will actually maintain, and check the current documentation for browser support and pricing before committing.'),
    NOTE('Playwright facts from the lab runs (1.65.1). Cypress parallelism checked in its documentation on 15 Nov 2026; Cypress current version by registry lookup (16.3.0), not run. Verify the rest for the versions you use.'),
  ),
  RAPID('Rapid-fire: end-to-end testing', [
    ['How many end-to-end tests?', 'Few: the critical journeys only.'],
    ['What is auto-waiting?', 'Actions wait until the element is attached, visible, stable and enabled.'],
    ['Why never `waitForTimeout`?', 'It is a guess: too short when slow, wasteful when fast.'],
    ['How do you reuse a login?', '`storageState` saved by a setup project.'],
    ['When do you stub the network?', 'Third parties and hard-to-produce states, never your own core journey.'],
    ['What does a retry that passes mean?', 'The test is flaky. Track it and fix it.'],
    ['What is a trace?', 'A recording of a run with the DOM, network and screenshots at each step.'],
  ]),
];
