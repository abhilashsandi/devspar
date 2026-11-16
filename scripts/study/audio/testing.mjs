// Audio overview of the Testing guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the Testing guide. Testing questions in interviews are less about tools than about judgment. What would you test, at which level, and what would you leave alone? A candidate who can answer that sounds like someone who has maintained a real test suite.

There are eight sections. Test strategy, unit testing, React Testing Library, mocking the network, end to end testing with Playwright, testing a Node back end, tests in the pipeline and after deployment, and finally interview scenarios.

One sentence runs through the whole guide: tests exist to give you the confidence to change code. Hold every other idea up against that.`,

  chapters: {
    te1: `Test strategy starts with the purpose. Tests give you confidence to change code. So the question is never how many tests. It is what would hurt if it broke, and what is the cheapest test that would catch it.

The levels are static checks, unit tests, integration tests and end to end tests. The testing trophy is a way to remember where to spend effort. For user interfaces, most of your confidence comes from the middle: integration tests that render real components together and use them the way a person would.

Know the four kinds of test double. A stub returns canned answers. A spy records how it was called. A mock is set up with expectations about calls. A fake is a working, simpler implementation, such as a database held in memory. And know the trap: a test full of mocks mostly tests the mocks. If you replace everything the code touches, nothing real is left to fail.

What should you not test? Implementation details: the names of a component's state variables, the order of internal calls, which hook it uses. If a refactor breaks the test while the behaviour is identical, the test was checking the wrong thing.

Coverage tells you which lines ran during the tests. It does not tell you they were checked. Use coverage to find untested code, not to prove quality.

And flaky tests. A flaky test passes and fails with no change to the code. It is worse than no test, because people stop trusting the suite, and then stop reading the failures.`,

    te2: `Section two is unit testing.

A good unit test follows three steps: arrange, act, assert. It has one reason to fail. And its name states the behaviour, so a failure reads like a bug report. Name it for what the code does, such as takes ten percent off for members, not for the function it calls.

For mocking there are three tools. A mock function, which you pass in and inspect afterwards. A spy on an existing method, which watches it or replaces it for one test. And a module mock, which replaces every export of a module. Fake timers let you move the clock forward yourself, so a test of a one second delay does not take a second.

Async tests have one rule that prevents a whole class of false passes. Always await the promise or return it. Without that, the test finishes before the assertion runs, and it passes whatever happens.

Snapshot tests store a value's output and fail when it changes. They are cheap to write and easy to abuse. A large snapshot gets approved without being read. Keep them small, and prefer the inline kind, which sits in the test file and shows up in code review.

When a pure function has many inputs, such as a validator, a formatter or a parser, run one test over a table of cases. The table makes the cases visible, and a failure names the exact row.

On choosing a runner: for a new React or Vite project, Vitest is usually the least friction. For a Node service, the built in runner is often enough. The skills carry over between all of them.`,

    te3: `Section three is React Testing Library, and its idea fits in one sentence. The more your tests resemble the way your software is used, the more confidence they can give you.

So the library renders your component into a real document, and gives you queries that find elements the way a person would. That decides which query to use. First choice is by role and accessible name, such as a button called Save. Then by label for form fields, then by visible text. A test id is the last resort. A useful side effect: if you cannot find an element by its role, a screen reader user probably cannot either.

For interaction, prefer user event over fire event. Fire event dispatches a single event. User event simulates what a person does, which is several events. Typing a character produces a key down, an input and a key up.

Testing a form means testing what the user sees. Invalid input shows messages and does not submit. Valid input submits the right values. A server error is shown.

For content that appears later, use the find queries. A find query retries until the element appears or a timeout passes, which is one second by default.

A component that needs providers, such as a theme, a router or a query client, gets a wrapper, shared as a custom render function.

The section ends with two bugs to diagnose. A test named shows the users that passes even though the screen shows an error, because nothing it asserts depends on the users arriving. And a test that cannot find text that is plainly on screen, because it looked before the data had loaded.`,

    te4: `Section four is about mocking the network with Mock Service Worker.

The idea is where you put the fake. If you mock the fetch function directly, your test skips the code that builds the request and reads the response. Mock Service Worker intercepts requests at the network level instead. Your component, your data fetching code and fetch itself all run for real. Only the server is replaced. That is the quiz answer in this section too: a test built this way still exercises your real request building and response parsing.

Setup has three parts. Define default handlers for the happy path. Start the server before the tests, reset the handlers after each test, and stop it at the end. And turn on the option that makes a request with no handler fail loudly, so a forgotten endpoint does not pass silently.

To test loading, empty and error states, keep the happy path handlers as defaults, and override one handler inside the test that needs something different. The override sits in front of the defaults and is removed by the reset.

You can also check what your app sent. A handler can read the incoming request, so capture the body and assert on it afterwards.

With a data fetching library that keeps a cache, two settings matter. Create a new client for each test, so the cache does not leak between tests. And turn retries off, so a failure shows up at once instead of after several attempts.

The same handlers are useful elsewhere: for developing the front end before the back end exists, and for showing components in each network state.`,

    te5: `Section five is end to end testing with Playwright.

End to end tests drive the real application in a real browser, with a real or realistic back end. They prove that the pieces fit together: routing, the server, the database, the browser. They are also the slowest and most fragile kind of test, so you keep a small number, for the journeys that matter most.

Playwright gives each test a fresh browser context, like a new private window with its own cookies and storage. So tests are isolated without restarting the browser, and they can run in parallel.

The most important habit is to never write a fixed sleep. Playwright's locators are evaluated again each time they are used, actions wait until the element is ready, and assertions retry until they pass or time out. A fixed sleep is either too short, which makes the test flaky, or too long, which makes it slow.

Signing in through the screen in every test is slow. Sign in once in a setup step, save the browser state, and load that state in the tests that need it.

A true end to end test uses the real back end. Stub the network only for states that are hard to produce, and for third parties you do not control.

When a test fails in the pipeline, open the trace. It is a time travel view, with the page, the network, the console and a screenshot at every step.

Playwright can also run accessibility scans and compare screenshots. And for the question of Playwright or Cypress: both are mature, and either is defensible. Pick the one your team will actually maintain.`,

    te6: `Section six covers testing a Node back end.

To test an API, build the application from a factory that receives its dependencies. Then a test can pass in fakes, and it never opens a port or a database connection. A helper library calls the app directly and lets you assert on the status and the body.

Should you fake the database or use a real one? Both, at different levels. Handler tests get a fake repository, so they run in milliseconds. Repository tests, the ones that contain real queries, run against the same database engine you use in production, in a throwaway instance. A different engine in tests will lie to you about how your queries behave.

A contract test is for two sides that agree on the shape of a request and response, such as two services, or a front end and an API. It checks that each side still honours the agreement, without running both together.

For queues, test the two ends differently. For the publisher, inject the publish function and assert that it was called with the right event. A mock is appropriate here, because the call is the outcome. For the consumer, call the handler directly with a message, and also call it twice with the same message, to prove that a redelivery does no harm.

Node's built in runner finds test files, runs them in parallel, and includes mocks and fake timers.

Finally, test the failures. Make a dependency throw, or never answer, and assert on the response and the logging. In particular, check that the internal error message never reaches the client.`,

    te7: `Section seven is about tests in the pipeline and after deployment.

Order the stages by cost and speed. The cheapest checks go first, so a failure costs seconds and not the full run. On a pull request: types, lint, unit and integration tests, and a handful of end to end tests. The full end to end suite and the slower checks run after merge or on a schedule. The quiz makes the same point: type checking and linting belong first, because they are fast and catch a large share of mistakes.

Suppose the suite takes forty minutes. Measure first. Which files and which tests take the time? Most suites have a few slow offenders. Then run test files in parallel and split the suite across machines. Move checks down a level where you can, replacing a slow end to end test with a faster integration test that proves the same thing.

For test data, create it inside the test with a small factory function, so the test shows what matters about the data. Each test creates what it needs and does not depend on what another test left behind.

A flaky test needs a process. Detect it, by tracking tests that failed and then passed with no change. Quarantine it, moving it out of the blocking path so it stops blocking everyone, with an owner and a deadline. Then fix the cause or delete the test.

Testing continues after deployment. Smoke tests make a few quick requests against the live environment. A canary release sends a small share of traffic to the new version and compares error rates before going further.`,

    te8: `The final section turns all of this into interview answers.

How would you test this login form? Start by listing the cases, then say which level covers each. That structure is the answer. Empty fields and a badly formed email belong in a component test. Wrong credentials and a server error belong in a component test with the network mocked. One real sign in belongs in an end to end test.

How would you test a checkout flow? Checkout is high risk because it involves money, so it earns an end to end test, but not every combination does. Stub the payment provider in most tests, and use its sandbox for a single real journey.

You inherit a project with no tests. Where do you start? First make it safe to change: add a type checker and a linter, and set up a pipeline so something runs on every change. Then characterise before you change: write a few tests that pin down the current behaviour of the riskiest parts. After that, add a test with every bug you fix.

How do you test code that an AI assistant wrote? Decide the cases first, or write the tests first, and let the assistant implement against them. Failing tests give it a goal, and give you a check. And review the assertions as carefully as the code, because a generated test can assert very little.

Last, your strategy for a new full stack project. Give a sixty second answer, level by level, with a tool for each. Say why at each level, cost against confidence, and say what you would not test.`,
  },
};
