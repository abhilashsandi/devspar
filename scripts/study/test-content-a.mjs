// Testing guide, part A: strategy, unit testing, React Testing Library.
// Every code sample in these cards was run in a scratch project on 14 to 15 Nov 2026 (Vitest 5.1.0,
// @testing-library/react 16.3.3, user-event 14.6.10, jest-dom 7.0.1, MSW 3.0.6); see the NOTE in the builder.
import { P, L, N, T, C, SAY, TRAP, K, GO, RAPID, QUIZ, DIAGRAM, NOTE } from './cc-kit.mjs';
import { BUG } from './bug-content-a.mjs';
import CS from './dg-cs.mjs';
import { TE } from './dg-test.mjs';

// ───────────────────────────────────────────── 1. strategy
export const strategy = [
  K('What is testing for, and how do you decide what to test?',
    P('Tests exist to give you **confidence to change code**. The question is never “how many tests?” but “what would hurt if it broke, and what is the cheapest test that would catch it?”.'),
    L('**Risk first:** money, security, data loss and the flows users depend on come before cosmetic details.', '**Behaviour, not code:** test what the code promises to do, so you can refactor without touching the tests.', '**Cheapest level that can catch it:** a pure function needs a unit test; a form needs a component test; a purchase needs one end-to-end test.', '**Bugs become tests:** when something breaks in production, add the test that would have caught it.'),
    SAY('I choose tests by risk and by cost. I want the smallest, fastest test that fails when the behaviour I care about breaks, and I do not want it to fail when I only refactor.'),
    NOTE('Every sample in this guide was run before it was written down, in a scratch project on 15 Nov 2026 with Vitest 5.1.0, React Testing Library 16.3.3, user-event 14.6.10, jest-dom 7.0.1, MSW 3.0.6, Playwright 1.65.1, supertest 7.3.2 and Node.js 26. Library APIs change, so check the documentation for your versions.'),
  ),
  DIAGRAM('The levels of testing', TE.levels,
    P('The **testing trophy** is a way to remember where to spend effort. For user interfaces, most of your confidence comes from the middle: integration tests that render real components and replace only the network.'),
    CS.trophy,
    L('**Static analysis** (TypeScript, ESLint) catches typos and wrong types for free, on every keystroke.', '**Unit tests** cover logic with many cases: pricing, parsing, validation.', '**Integration tests** render a screen with its real children and state, with a fake network.', '**End-to-end tests** prove the critical journeys in a real browser. Keep them few: they are slow and the most likely to flake.'),
    GO(['/interview-prep', 'Interview Prep: testing'], ['/interview-cheatsheet', 'Cheatsheet: testing']),
  ),
  DIAGRAM('Stub, spy, mock or fake?', TE.doubles,
    T(['Double', 'What it does', 'Use it when'], [
      ['**Stub**', 'Returns fixed answers', 'The code needs data but you do not care how it is produced'],
      ['**Spy**', 'Wraps a real function and records calls', 'You want real behaviour and to check it was called'],
      ['**Mock**', 'Replaces behaviour and records calls', 'The call itself is the outcome: an email was sent, an event published'],
      ['**Fake**', 'A working, simpler implementation', 'An in-memory repository or a fake clock: the best double when you can build one'],
    ]),
    TRAP('A test full of mocks mostly tests the mocks. If you replace everything the code touches, nothing real is left to fail.'),
  ),
  K('What should you not test?',
    L('**Implementation details:** a component’s state variable names, the order of internal calls, which hook it uses. A refactor then breaks the test although behaviour is identical.', '**Third-party code:** do not test that React renders or that `fetch` works.', '**Private functions:** test them through the public behaviour that uses them.', '**Trivial code:** a getter or a constant has nothing to fail.', '**Styling by snapshot:** large snapshots of rendered markup change constantly and get approved without reading.'),
    P('A useful check is the **refactor test**: if you rewrite the internals and keep the behaviour, no test should fail. If one does, it was testing the implementation.'),
  ),
  K('What does code coverage tell you, and what does it not?',
    P('Coverage tells you which lines **ran** during the tests. It does not tell you they were **checked**.'),
    C(`test('applyDiscount runs', () => {
  applyDiscount(1000, 'SAVE10');     // 100% of the line is covered, and nothing is asserted
});`, 'Full coverage, no assertion'),
    L('Use coverage to find **untested code**, not to prove quality.', 'A target such as 80% is a floor that stops decay, not a goal. Chasing 100% produces tests that assert nothing.', 'Better signals: mutation testing (does a deliberate bug make a test fail?), and how often bugs escape to production.'),
  ),
  DIAGRAM('Why tests go flaky', TE.flaky,
    P('A flaky test passes and fails without any code change. It is worse than no test: people stop trusting the suite, then stop reading failures.'),
    T(['Cause', 'Fix'], [
      ['Fixed sleeps (`sleep(500)`)', 'Wait for a condition: `findBy`, `waitFor`, Playwright’s web-first assertions'],
      ['State shared between tests', 'Reset in `afterEach`; create fresh data per test; never rely on order'],
      ['Real time and dates', 'Fake the clock (`vi.useFakeTimers`, `t.mock.timers`)'],
      ['Real network or services', 'Mock at the boundary (MSW, test containers)'],
      ['Test order dependence', 'Run in random order in CI to expose it'],
      ['Races and animations', 'Await a visible state, disable animations in tests'],
    ]),
  ),
  QUIZ('A test breaks when you rename an internal state variable, but the screen behaves exactly the same. What was the test checking?',
    ['User-visible behaviour', 'An implementation detail', 'The network layer', 'Accessibility'], 1,
    'Tests should survive refactors that do not change behaviour. One that fails on a rename is coupled to how the code works, not what it does.'),
];

// ───────────────────────────────────────────── 2. unit testing
export const unit = [
  K('What does a good unit test look like?',
    P('Arrange, act, assert. One reason to fail. A name that states the behaviour, so a failure reads like a bug report.'),
    C(`import { describe, expect, test } from 'vitest';
import { applyDiscount } from '../src/pricing';

describe('applyDiscount', () => {
  test('takes 10% off with the SAVE10 code', () => {
    // arrange
    const total = 1000;
    // act
    const result = applyDiscount(total, 'SAVE10');
    // assert
    expect(result).toBe(900);
  });

  test('rejects a fractional amount', () => {
    expect(() => applyDiscount(10.5, 'SAVE10')).toThrow(RangeError);
  });
});`, 'A unit test (passes)'),
    L('**Name it by behaviour:** “takes 10% off with the SAVE10 code”, not “test1” or “works”.', '**One concept per test.** Several assertions are fine if they describe one outcome.', '**No logic in tests:** no loops or conditionals that could hide a bug in the test itself.', '**Test the edges:** zero, empty, the largest value, invalid input.'),
  ),
  K('How do you mock a function, a module and a timer?',
    C(`import { expect, test, vi } from 'vitest';
import { welcome, mailer } from '../src/notify';

test('vi.fn records calls', () => {
  const onSave = vi.fn();
  [1, 2].forEach(onSave);
  expect(onSave).toHaveBeenCalledTimes(2);
  expect(onSave).toHaveBeenNthCalledWith(1, 1, 0, [1, 2]);   // forEach passes value, index, array
});

test('vi.spyOn replaces one method and can be restored', async () => {
  const send = vi.spyOn(mailer, 'send').mockResolvedValue(undefined);
  await expect(welcome({ email: 'ada@example.com' })).resolves.toBe('sent');
  expect(send).toHaveBeenCalledWith('ada@example.com', 'Welcome');
  send.mockRestore();
});

test('fake timers move time forward without waiting', () => {
  vi.useFakeTimers();
  const fn = vi.fn();
  setTimeout(fn, 5000);
  vi.advanceTimersByTime(4999);
  expect(fn).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(fn).toHaveBeenCalledOnce();
  vi.useRealTimers();
});`, 'vi.fn, vi.spyOn and fake timers (all pass)'),
    P('For a whole module, `vi.mock("./module")` replaces every export; it is hoisted to the top of the file, so it takes effect before imports run. Prefer replacing a **dependency you pass in** over mocking a module, because that needs no mocking tool at all.'),
    TRAP('Restore what you change (`mockRestore`, `vi.useRealTimers`). A spy or fake clock that leaks into the next test is a classic source of flakiness.'),
  ),
  K('How do you test asynchronous code?',
    C(`test('rejected promises are asserted with rejects', async () => {
  const fail = async () => { throw new Error('boom'); };
  await expect(fail()).rejects.toThrow('boom');
});`, 'Await the assertion (passes)'),
    L('**Always `await` or `return` the promise.** Without it, the test finishes before the assertion runs and passes whatever happens.', 'Use `await expect(...).rejects` or `resolves` for promises, not a `try/catch` that can pass silently.', 'For code that waits (debounce, retry), use fake timers instead of real waiting.'),
    TRAP('A missing `await` in front of an assertion on a promise makes the test pass even when the promise would fail. The lint rule `no-floating-promises` catches it.'),
  ),
  K('When are snapshot tests useful, and when are they a liability?',
    P('A snapshot stores a value’s output and fails when it changes. It is cheap to write and easy to abuse.'),
    T(['Useful', 'A liability'], [
      ['A **small** value: an error shape, a config object, a serialised result', 'A large rendered component tree'],
      ['Output you want to notice changing: a public API response shape', 'Anything that changes on every commit'],
      ['Reviewed on every change, with the diff read', '“Update all snapshots” pressed without reading'],
    ]),
    C(`expect({ total: applyDiscount(1000, 'SAVE10'), currency: 'USD' }).toMatchInlineSnapshot();`, 'Inline snapshots live in the test file and show up in review'),
    P('Rule of thumb: if you cannot say what a failing snapshot means, replace it with an assertion that says it.'),
  ),
  K('How do you run one test over many inputs?',
    C(`test.each([
  [1000, 'SAVE10', 900],
  [1000, 'FREE', 0],
  [1000, 'UNKNOWN', 1000],
  [999, 'SAVE10', 899],
])('applyDiscount(%i, %s) is %i', (total, code, expected) => {
  expect(applyDiscount(total, code)).toBe(expected);
});`, 'A table of cases (all pass)'),
    P('A table makes the cases visible and a failure names the exact row. Use it for pure functions with many inputs: validators, formatters, parsers, pricing rules.'),
  ),
  K('Vitest, Jest or node:test?',
    T(['', 'Vitest', 'Jest', 'node:test'], [
      ['**Where it runs**', 'Uses your Vite config and transforms', 'Its own runner and transform pipeline', 'Built into Node.js, no install'],
      ['**ESM and TypeScript**', 'First-class, works with Vite projects', 'Needs configuration or a transformer', 'ESM works; TypeScript through Node’s type stripping or a loader'],
      ['**API**', 'Jest-compatible (`expect`, `vi.fn`)', 'The long-standing reference', '`node:assert` and its own mocks'],
      ['**Best for**', 'Vite, Next.js or React apps and anything with modern ESM', 'Large existing suites, React Native', 'Libraries and back-end services with few dependencies'],
    ]),
    P('For a new React or Vite project, Vitest is usually the least friction. For a Node.js service, the built-in runner is often enough. The skills (arrange, act, assert, doubles, async) transfer between all three.'),
    NOTE('Versions run on 15 Nov 2026: Vitest 5.1.0, Jest 30.5.2 (by registry lookup, not run), Node.js 26. Check the current docs before choosing.'),
  ),
  RAPID('Rapid-fire: unit testing', [
    ['Arrange, act, assert?', 'Set up the input, call the code, check the result. One behaviour per test.'],
    ['Mock or fake?', 'A fake is a working simple version; a mock replaces behaviour and records calls. Prefer fakes.'],
    ['How do you test time?', 'Fake the clock and advance it.'],
    ['How do you test an error?', 'Assert it rejects or throws, and check the type or message.'],
    ['What is a good coverage target?', 'A floor that prevents decay, never a goal. It shows what ran, not what was checked.'],
    ['One test, many inputs?', '`test.each` with a table.'],
    ['Where do tests live?', 'Next to the code or in a tests folder, consistently.'],
  ]),
];

// ───────────────────────────────────────────── 3. React Testing Library
export const rtl = [
  K('What is the idea behind React Testing Library?',
    P('**The more your tests resemble the way your software is used, the more confidence they can give you.** RTL renders your component into a real DOM and gives you queries that find things the way a user or a screen reader would: by role, label and text.'),
    L('Do not reach into component state, instances or hooks. Click, type, and look at the screen.', 'Because the tests describe behaviour, a refactor from `useState` to a reducer does not break them.', 'Accessibility comes for free: if `getByRole("button", { name: "Save" })` works, the button has the right role and name.'),
    SAY('I test components the way a person uses them: find by role or label, interact with user-event, and assert on what is visible.'),
  ),
  DIAGRAM('Which query should you use?', TE.queryLadder,
    T(['Prefix', 'Throws if missing?', 'Async?', 'Use for'], [
      ['`getBy…`', 'Yes', 'No', 'An element that must be there now'],
      ['`queryBy…`', 'No, returns `null`', 'No', 'Proving an element is absent: `expect(queryBy…).not.toBeInTheDocument()`'],
      ['`findBy…`', 'Yes, after waiting', 'Yes (a promise)', 'An element that appears after an async step'],
      ['`…AllBy…`', 'Varies', 'Varies', 'Several matches; returns an array'],
    ]),
  ),
  K('`userEvent` or `fireEvent`?',
    P('`fireEvent` dispatches **one** DOM event. `userEvent` simulates what a user does, which is **several** events: typing a character fires keydown, keypress, input and keyup; clicking moves the pointer, presses, releases and clicks, and checks the element is not disabled or hidden.'),
    C(`const user = userEvent.setup();          // create one per test
await user.type(screen.getByLabelText('Email'), 'ada@example.com');
await user.click(screen.getByRole('button', { name: 'Sign in' }));`, 'Always await user-event calls'),
    L('Prefer `userEvent`: it catches bugs such as a click on a disabled button doing nothing.', 'Call `userEvent.setup()` before rendering, and `await` every interaction.', 'Use `fireEvent` only for events a user cannot produce directly, such as a scroll or a custom event.'),
  ),
  K('How do you test a form?',
    P('Test the behaviour the user sees: invalid input shows messages and does not submit; valid input submits the right values; a server error is shown.'),
    C(`test('shows validation messages and does not submit an invalid form', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'not-an-email');
  await user.type(screen.getByLabelText('Password'), 'short');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
  expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('submits the values and shows a server error', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockRejectedValue(new Error('Wrong email or password'));
  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.type(screen.getByLabelText('Password'), 'correct-horse');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'correct-horse' });
  expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password');
});`, 'Two form tests (both pass)'),
    P('Here the only thing replaced is the `onSubmit` prop: the form, its validation and its error display all run for real.'),
  ),
  K('How do you test UI that appears asynchronously?',
    C(`test('findBy waits for content that arrives after a fetch', async () => {
  render(<UserList />);
  expect(screen.getByText('Loading users…')).toBeInTheDocument();     // there immediately
  expect(await screen.findByText('Ada')).toBeInTheDocument();         // appears after the response
});

test('waitFor retries an assertion until it passes', async () => {
  render(<UserList />);
  await waitFor(() => expect(screen.getByText('Ada')).toBeInTheDocument());
});`, 'Waiting for content (both pass)'),
    L('**`findBy`** is a `getBy` that retries until the element appears or a timeout (one second by default) passes. Prefer it for “wait for this to appear”.', '**`waitFor`** retries any callback until it stops throwing. Use it for assertions that are not about one element appearing.', '**`act`** makes React apply updates before you assert. RTL wraps its helpers in it for you, so you rarely write it by hand (only around direct state changes, such as advancing fake timers).', 'Never put a side effect such as a click inside `waitFor`: it can run many times.'),
  ),
  K('How do you test a custom hook, and a component that needs providers?',
    C(`test('a custom wrapper supplies providers', () => {
  render(<ThemeBadge />, { wrapper: ({ children }) => <ThemeProvider value="dark">{children}</ThemeProvider> });
  expect(screen.getByText('Theme: dark')).toBeInTheDocument();
});

test('renderHook with fake timers', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } });
  rerender({ v: 'ab' });
  expect(result.current).toBe('a');                       // not updated yet
  act(() => { vi.advanceTimersByTime(300); });
  expect(result.current).toBe('ab');
  vi.useRealTimers();
});`, 'A wrapper and renderHook (both pass)'),
    L('Put providers (theme, router, query client) in a **wrapper** and share it as a custom `render`, so each test does not repeat them.', 'Test a hook through `renderHook` only when it is reusable on its own. Otherwise test it through the component that uses it.'),
  ),
  BUG('A test passes although the feature is broken',
    'The users endpoint returns a 500, so the screen shows an error. The test below is named “shows the users” and still passes.',
    `test('shows the users', () => {
  server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 })));   // the feature is broken
  render(<UserList />);
  screen.findByText('Ada');
});`,
    ['`findByText` returns a **promise**. It is neither awaited nor asserted on, so the test finishes immediately and nothing can fail. This was run: the test passes against a broken endpoint.'],
    `test('shows the users', async () => {
  render(<UserList />);
  expect(await screen.findByText('Ada')).toBeInTheDocument();   // await it, and assert
});`,
    'A `findBy` without `await` and an assertion tests nothing. The `no-floating-promises` and `testing-library/await-async-queries` lint rules catch it.'),
  BUG('A test fails with “unable to find an element” although it renders in the browser',
    'The list shows “Ada” on screen, but the test fails with `Unable to find an element with the text: Ada`.',
    `test('shows the users', () => {
  render(<UserList />);
  expect(screen.getByText('Ada')).toBeInTheDocument();
});`,
    ['The data arrives **after** a network request, but `getByText` looks at the DOM at that exact moment, when the component is still showing “Loading users…”. `getBy` does not wait. This was run, and fails with exactly that message.'],
    `test('shows the users', async () => {
  render(<UserList />);
  expect(await screen.findByText('Ada')).toBeInTheDocument();   // findBy waits for it
});`,
    'Content that arrives asynchronously needs `findBy` (or `waitFor`). `getBy` is for what is already there.'),
  RAPID('Rapid-fire: React Testing Library', [
    ['Which query first?', '`getByRole` with an accessible name.'],
    ['How do you prove something is not there?', '`queryBy…` with `not.toBeInTheDocument()`.'],
    ['How do you wait for async UI?', '`await screen.findBy…`, or `waitFor` for other assertions.'],
    ['userEvent or fireEvent?', 'userEvent, created with `setup()` and awaited.'],
    ['When do you write `act` yourself?', 'Rarely: only around direct updates such as advancing fake timers.'],
    ['What do you mock in a component test?', 'The network (MSW) and props such as callbacks, not child components.'],
    ['Why not test state directly?', 'It couples the test to the implementation; users cannot see state.'],
  ]),
];
