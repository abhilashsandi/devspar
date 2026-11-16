// Audio overview of the React Training guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the React Training guide. Where the other React guide is organised around TypeScript, this one is organised around how React actually behaves: when it renders, what an effect is for, where state should live, and how the newer APIs change everyday code.

There are fourteen sections. Hooks and effects, advanced hooks, rendering and performance, state management, data fetching, React nineteen with Suspense and concurrent rendering, patterns, the router and forms, errors with security and accessibility, tooling, React Testing Library, testing strategy, and two deep dives on rendering internals and modern APIs.

If one idea ties them together, it is this: each render is a snapshot. Keep that in mind and many puzzles answer themselves.`,

  chapters: {
    'react-hooks': `Section one is hooks and effects.

Class components had three named phases: mounting, updating and unmounting. Function components get the same behaviour from one hook, the effect, and its dependency list. No list means the effect runs after every render. An empty list means it runs once after the first render. A list with values means it runs after the first render, and again after any render where one of those values changed.

The cleanup function matters as much as the effect. React runs it before the effect runs again, and when the component is removed. That is where you clear a timer, remove a listener or cancel a request. An effect that subscribes without a cleanup is a leak.

A better way to think than lifecycle phases is this: an effect synchronises something outside React with the current props and state. If nothing outside React is involved, you probably do not need an effect at all.

A ref stores a mutable value that survives renders without causing one. It is the instance variable of a function component.

The reducer hook fits when several values change together, or when the next state depends on the previous one through real logic. The guide includes a tracing exercise: dispatch a few actions through a reducer, including one it does not handle. The default case returns the state unchanged, so the unknown action does nothing.

And for a custom hook, the discipline is in the return type. Type it explicitly when other people will use it.`,

    'react-adv': `Section two is advanced hooks and rendering behaviour. These come up as follow up questions once you have answered the basics.

When do you use a layout effect? It has the same shape as an effect, but it runs synchronously after React has updated the page and before the browser paints. So it is for measuring and adjusting without a visible flicker: reading the size of an element and then positioning a popover. It blocks painting, so it is the exception.

The sync external store hook connects a component to state that lives outside React. A browser API, such as whether the user is online, or a store from a library. It takes a way to subscribe and a way to read the current value, and it keeps every component consistent even when rendering is interrupted.

The id hook produces a stable, unique id that is the same on the server and in the browser. Use it to connect a label to its field. A counter or a random number would differ between the two renders and cause a mismatch.

Why do effects run twice in development? Strict mode does it on purpose. It mounts, unmounts and mounts again, to show you an effect whose cleanup is missing or wrong. Production is unaffected. If the double run breaks something, the bug is in the effect.

Hydration mismatches come from output that differs between server and browser. And two history questions: higher order components wrapped a component to add behaviour, and hooks replaced most of them. The React Compiler now adds memoisation at build time, so much manual memoisation is no longer needed.`,

    'react-perf': `Section three is rendering and performance, the largest section in the guide.

Start with the Core Web Vitals, three measures of what a user feels. Largest contentful paint is loading: how quickly the main content appears. Interaction to next paint is responsiveness: how quickly the page reacts to a click or a key. Cumulative layout shift is visual stability: how much things jump around.

Then the process, which is the same whether the question is about a slow page, an inherited codebase, or a very large site. Measure first. Use real user monitoring, the browser's performance tools and the React profiler. Then work from the biggest lever to the smallest, and most of the biggest levers never touch a component. Ship less JavaScript. Optimise images. Cache well. Fix request waterfalls. Only then look at renders.

For renders, find the cause before adding memoisation everywhere. Keep state as local as possible, split large components, and virtualise long lists.

Use memo and use callback are often confused. One skips repeating an expensive calculation. The other keeps a function's identity stable, so it does not defeat a memoised child.

And know when not to memoise. Memoisation has a cost: comparison work, memory and complexity. It pays off only when it prevents work that is actually expensive. Bad dependencies make it worse. Leave one out and you get stale values. Include an object created during render and the memo never holds.

One last detail. A custom comparison function for memo lets you decide which prop changes matter. The risk is that you ignore a prop that does matter, and the component shows stale data.`,

    'react-state': `Section four is state management.

Begin with the vocabulary. Local state belongs to one component or a small part of the tree: an input's value, whether a menu is open. Global state is needed in many distant places: the signed in user, the theme, a basket. Prop drilling is passing data through several components that do not use it, only so that a deeply nested one can.

Data flows one way in React, from parent to child. So how does a child tell its parent something? The parent passes a function down, and the child calls it. And two siblings, such as a search box and a product list? The value has to live somewhere both can reach. The first answer is to lift the state up to their common parent. Other answers are context, a store, or the address bar, which also makes the search shareable as a link.

Redux has a fixed flow, and you should be able to say it in one breath. A component dispatches an action, a plain object describing what happened. A reducer, which is a pure function, takes the current state and the action and returns the next state. The store notifies the components that subscribed. Reducers must stay synchronous, so async work happens in middleware, which dispatches actions as the request starts, succeeds or fails.

Zustand is a lighter store. Components select only the part they need, and render again only when that part changes.

The senior framing for choosing: these tools solve different problems. The common mistake is to use one tool for everything, and especially to keep server data in a client store. And context is a poor home for fast changing values, because every consumer renders on every change.`,

    'react-data': `Section five is data fetching and async interfaces, with four scenarios.

The first is a small design puzzle. You call two independent APIs, and you want to show whichever result arrives first, then add the second. The mistake is to wait for both with a single combined promise, which holds the fast one back until the slow one finishes. Instead, start both requests at the same time, and let each one update the state in its own completion handler. Each part of the screen then has its own loading and error state.

The second is a search results page with pagination, sorting and filters, backed by GraphQL. The design principle is that the server owns the result set, the filter counts and the pagination state. The client sends the current criteria and renders what comes back. Keep those criteria in the address, so that a search can be shared, bookmarked and restored with the back button.

The third is optimistic updates with a server state library. Update the cache straight away and keep the previous value. If the request fails, roll back. When it settles, refetch, so the screen agrees with the server.

The fourth is the robust request. It can be cancelled, so that a late response never overwrites a newer one. It retries failures that are likely to be temporary, with a growing delay. And it validates the response against a schema at run time, because a type is only a claim about data from outside.

In all four, the interviewer is listening for the unhappy paths: slow, failed, out of order and empty.`,

    'react-r19': `Section six covers React nineteen, Suspense and concurrent rendering.

Server components are often confused with server side rendering. Traditional server rendering turns the whole tree into markup for the first load, and then ships the same component code to the browser to make it interactive. A server component runs only on the server, and its code is never sent to the browser. So it can read a database directly, and it adds nothing to the bundle.

Fiber is the engine underneath. It replaced an older design that rendered in one uninterruptible pass. With Fiber, rendering is split into units of work that React can pause, resume or abandon.

That enables transitions and deferred values. Neither makes anything faster. They let you say which updates are urgent. Typing in a field is urgent. Redrawing a long list of results is not. And the guide asks a sharp question: why defer a value instead of debouncing the input? Debouncing delays the start of the work by a fixed time, so every keystroke waits, even on a fast device. A deferred value has no fixed delay. React starts at once, and abandons the work if a new keystroke arrives.

Suspense lets a component wait for data while the nearest boundary shows a fallback, so loading states move out of the component.

Then the nineteen additions. The optimistic hook shows the expected result immediately and returns to the real state when the action finishes or fails. The action state hook pairs a form with an async action and holds its result. The form status hook tells a button that its form is submitting. And the use function reads a promise or a context during render.`,

    'react-patterns': `Section seven is patterns and components.

Compound components share implicit state through context between a parent and a set of children. The person using them composes the pieces freely, instead of configuring one giant component through dozens of props. It is worth reaching for when a component has several parts that must cooperate, such as tabs, an accordion or a menu. For a simple component, it is more machinery than you need.

A small question with a real answer: why must a component's name start with a capital letter? It is about how JSX is compiled. A tag that starts with a lower case letter is treated as a built in element, like a division or a span, and passed along as a string. A capitalised tag is treated as a reference to your component. Name a component in lower case and React tries to create an unknown element.

Then headless component libraries, with Radix as the example. They give you accessible behaviour for interactive components, such as dialogs, menus and tabs, with almost no styling. Focus handling, keyboard support and the right roles are done. You wrap the primitives in your own components and apply your own styles. Compared with building it yourself, you avoid getting accessibility wrong. Compared with a fully styled library, you are not fighting someone else's design.

On refs: in React nineteen a ref is a normal prop for function components, so the old wrapper is no longer needed and generics simply work.

And render props, passing a function as a prop to share logic, have mostly been replaced by custom hooks.`,

    'react-router': `Section eight is the router and forms.

Controlled or uncontrolled? In a controlled input, React state holds the value, and every keystroke goes through your handler and causes a render. In an uncontrolled input, the page holds the value, and you read it when you need it. In practice, most production forms use a form library that keeps the inputs uncontrolled, so typing does not render the whole form, and layers validation and error state on top. Say that, and say why: it is about performance on large forms, and about not writing the same wiring for every field.

React Router's main hooks each have one job. The navigate hook returns a function for moving from code: to a path, back one step, or replacing the current entry so the back button skips it. The params hook reads the dynamic parts of the path, such as a user id. The location hook gives you the current location object. The search params hook reads and writes the query string.

For changing data, the router offers two tools that both submit to a route's action. They differ in whether the page navigates. The form component submits and navigates, like a traditional form. A fetcher submits without navigating, which suits a like button, or an inline edit in a list.

And unsaved changes. The blocker hook intercepts navigation inside the app: link clicks, navigation from code, and the back and forward buttons. You can hold the transition and ask the user to confirm. It does not cover closing the tab or reloading. For that you need the browser's own before unload event.`,

    'react-safety': `Section nine brings together errors, security and accessibility.

How do you stop one component's error from crashing the whole app? With an error boundary. It catches errors thrown during rendering in the tree below it and shows a fallback. It has to be a class component, or come from a small library that wraps one. Place boundaries around independent parts of the screen, so that one failing widget does not take the page with it. And remember what they miss: errors in event handlers and in async code.

On security, React escapes every string it renders as text, which blocks the classic script injection. The protection breaks down where you hand React something raw: markup set directly, addresses that use the javascript scheme, and user content rendered on the server outside React. Sanitise markup, check the scheme of addresses, and add a content security policy as a second line of defence, with the other standard security headers.

On accessibility, follow the four principles, perceivable, operable, understandable and robust, and treat them as a default, not as a pass at the end. Semantic elements first. Labels on every field. Everything reachable by keyboard. Visible focus. Sufficient contrast.

A custom dropdown has to rebuild everything a native select gives you for free: roles, keyboard handling and focus management. That is the argument for using a tested headless library.

And the first rule of ARIA is not to use it when a native element will do. A real button already has its role, its keyboard behaviour and its focus.`,

    'react-tooling': `Section ten is short: two choices about tooling.

The build tool first. Vite serves your code as native modules during development, so for most of the working day nothing is bundled, and changes show up almost immediately. It uses a separate bundler for production builds. It is the default for new projects today. Webpack is the long established option, with a huge plugin ecosystem and a lot of configuration. You will meet it in older and larger codebases, and it is still the right call when a project depends on its particular plugins. Turbopack is the newer, Rust based bundler that comes with Next.js.

How do you choose? For a new project, take what your framework gives you. For an existing one, ask what a migration would cost, and what you would gain in developer time. Faster feedback is a real gain, but so is not breaking a build that works.

Then styling. Tailwind applies utility classes in the markup, with design tokens built in. CSS Modules give you plain CSS scoped to a component. CSS in JavaScript puts styles in your components, which makes dynamic styling easy, and often costs work at run time.

The guide offers a common senior default. Tailwind for product interfaces, often paired with a headless component library for the interaction logic. CSS Modules where a team prefers plain CSS. And caution with run time CSS in JavaScript in apps that use server components.

In both questions, the strong answer names the constraints first, the team, the codebase and the framework, and the tool second.`,

    'test-rtl': `Section eleven is React Testing Library.

The queries are not interchangeable. They come in a deliberate order of priority that mirrors how people and assistive technology perceive the page. First, by role with an accessible name. Then by label text for form fields. Then by visible text. A test id comes last, for when nothing else works.

Each query has three forms, and the difference matters. Get returns the element or throws at once, so use it for things that should be there now. Query returns null instead of throwing, so use it to assert that something is absent. Find returns a promise and retries until the element appears or a timeout passes, so use it for anything that shows up after an async update.

For async components, combine find queries with a mocked network, mocked at the network level so your real request code runs.

For interaction, user event simulates the full sequence of events a real action produces. Fire event sends a single event.

Act and wait for are often mixed up. Act makes sure that all the React updates triggered inside it have been applied before you assert. The library wraps its own helpers in act, so you rarely call it yourself. Wait for retries an assertion until it passes.

The guide also has a spot the bugs exercise, a test with five problems. Among them: selecting the wrong element, not waiting for an async update, and asserting on implementation details instead of what the user sees. It is a good one to try at a desk.`,

    'test-strategy': `Section twelve is testing strategy, including the back end.

The Testing Trophy reorders the old pyramid. Instead of mostly unit tests, it gives the most weight to integration tests, because they give the most confidence for what they cost.

Three kinds of test double, and they answer different questions. A stub replaces a function with a fake that returns fixed values. A spy wraps the real function and records how it was called. A mock is a fake with expectations about how it should be called.

An integration test for an API route sends real requests to the application and checks that routing, middleware, validation and the database all work together. That is closer to what a real client experiences than a unit test of a handler.

Contract testing checks that two services agree on the shape of their interaction, without running both together. In the consumer driven form, the consumer records what it expects, and the provider verifies that it meets those expectations in its own pipeline. Compared with end to end tests, it is faster, and it tells you exactly which side broke the agreement.

Flaky tests have familiar causes: fixed waits, shared state between tests, real network calls, and time. The fixes are queries that wait automatically, isolated data, a mocked network and a controlled clock.

Test driven development is a loop. Write a small failing test, write the least code to pass it, then tidy up with the tests as a safety net. It is most worthwhile for logic with clear inputs and outputs.

And snapshots are good for small, stable output, and bad for large component trees, where nobody reads the difference.`,

    'deep-render': `The first deep dive is rendering internals, four questions that separate people who use React from people who understand it.

What triggers a render? A state update in the component. A render of its parent, because children render by default even when their props are unchanged. And a change in a context it reads. React skips a render when you set state to the same value, and when a memoised component receives the same props.

How do snapshots and batching work? Each render sees a snapshot of state. Calling the setter does not change the variable in the current render. It queues an update. React batches all the updates from one event and renders once. So if you set a count three times from the same snapshot, you get one increment. The updater form, a function that receives the previous value, is how you queue three real increments.

Why does React keep or reset state? Because state is tied to a component's position in the tree, not to the variable or the markup you wrote. The same component type at the same position keeps its state. A different type at that position resets it. And a key lets you take control. Change the key, and React treats it as a new component with fresh state. That is the clean way to reset a form when the record being edited changes.

How do you structure context so it scales? Split it by how often things change. One context for rarely changing data, such as the user and the theme. Another for fast changing data. Then a keystroke does not render everything that only needs the theme. And keep the provider's value stable between renders.`,

    'deep-modern': `The last deep dive is four modern React APIs.

The effect event hook. Sometimes an effect must read the latest value of a prop or state without running again when that value changes. This hook extracts that piece of logic into a function that always sees current values and is not a dependency. It replaces the bad habit of leaving a value out of the dependency list and silencing the lint rule.

The Activity component hides part of the interface without unmounting it. Its elements and its state are kept, so switching back is instant and nothing is lost: a half filled form on another tab, a scroll position. That is the difference from conditional rendering, which destroys the component and its state and has to rebuild both. While hidden, the content is given low priority, and its effects are cleaned up.

Refs in React nineteen. A ref is now an ordinary prop for function components, so the forwarding wrapper is no longer needed, though it still works. And a ref callback may return a cleanup function, which React calls when the element is removed.

Finally, error boundaries in more detail. They catch errors during rendering in the tree below them. They miss event handlers, async code and errors in the boundary itself. They must be class components, or come from a library. Wrap independent widgets separately, so one failure stays contained. And for recovery, offer a retry that resets the boundary, usually by changing a key, so the failed part is mounted again from a clean state.

That is the whole guide. Pick the section you felt least sure about, and open its cards.`,
  },
};
