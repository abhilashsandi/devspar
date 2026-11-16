// Audio overview of the React.js guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the React guide, the one that pairs React with TypeScript. It is a wide guide, fifteen sections, so each chapter here is short and picks out what an interviewer is listening for.

The order is: typing components, hooks, advanced hooks and rendering, state management, reconciliation, data fetching, performance, testing, design patterns, Next.js and server rendering, security, build tooling and styling, accessibility, and two deep dives on advanced types and on React nineteen.

A thread runs through all of it. Senior answers name the trade off. When you say you would memoise something, or reach for a library, also say what it costs and when you would not.`,

  chapters: {
    s1: `Section one is React with TypeScript, the core habits.

A generic component is one that works for any item type and remembers which. A list, a table or a dropdown takes its items and a function to render one, and the type of the item flows through, so nothing is typed as any. Interviewers want to see that you can keep a component reusable and still fully typed.

Prefer plain function declarations over the older function component type. The plain form handles generics better and does not add things you did not ask for. This question checks whether you follow current practice.

Discriminated unions for props make impossible states unrepresentable. A button that is either a link with an address, or a real button with a click handler, is described as two shapes with one shared literal field. The compiler then refuses a mix of the two.

Forwarding a ref used to break generic inference, and the workaround was a cast or a wrapper. In React nineteen a ref is an ordinary prop for function components, so this problem mostly disappears.

Last, there are utility types that extract the props of any component or element. They let you build a wrapper that accepts everything a native button accepts, plus your own options, without listing them by hand.`,

    s2: `Section two is the hooks deep dive.

Use memo caches a computed value. Use callback caches a function's identity. Both exist to avoid unnecessary work, and both have a cost, so use them only when there is a measurable problem. The quiz gives the clearest case for use callback: when you pass a callback to a child that is wrapped in memo. Without a stable function, the child's memo is defeated.

The reducer hook is better than plain state when the logic is complex, when several values change together, or when the next state depends on the previous one in ways that are easier to read as named actions.

A ref holds any mutable value that persists across renders without causing a render. It is an instance variable for a function component: a timer id, the previous value, a flag. Changing it does not update the screen.

Transitions and deferred values belong to concurrent rendering. A transition marks a state update as not urgent, so typing stays responsive while a heavy list updates behind it. A deferred value lets part of the screen lag behind on purpose.

For custom hooks, give a public hook an explicit return type.

Two quiz facts. Setting state to the same value makes React bail out and skip the render. And the cleanup function of an effect runs before the effect runs again and when the component unmounts. That is where you unsubscribe and remove listeners.`,

    adv: `Section three covers advanced hooks and rendering behaviour.

The layout effect has the same shape as an ordinary effect, but it runs synchronously after React updates the page and before the browser paints. Use it when you must measure something and adjust before the user sees a flicker, such as positioning a tooltip. Otherwise use the ordinary effect, which does not block painting.

The sync external store hook subscribes a component to state that lives outside React, such as a browser API or a third party store, in a way that stays consistent during concurrent rendering.

The id hook generates a stable, unique id for accessibility attributes. The same component gets the same id on the server and in the browser, which a counter or a random number cannot promise.

Strict mode adds checks in development only. It runs components and effects twice on purpose, to expose code that is not pure or that forgets its cleanup. Nothing changes in production.

A hydration mismatch happens when the first render in the browser does not produce exactly what the server sent. The usual causes are dates, random values and browser only data.

A higher order component is a function that takes a component and returns a new one with extra behaviour. Hooks replaced most of them, because hooks share logic without wrapping the tree.

And the React Compiler is a build time tool that adds memoisation automatically. It removes most manual memoisation. It does not fix code that breaks React's rules.`,

    s3: `Section four is state management, and the senior answer is to pick the right tool for each type of state.

Redux Toolkit is for global client state with complex transitions, where you want one predictable flow and good debugging tools. A server state library, such as TanStack Query, is for data that lives on a server: it handles caching, refetching, deduplication and staleness. That is the quiz answer for caching API data. Zustand is a small store with almost no ceremony, just a hook, with no provider and no reducers. Context is for values that change rarely, such as the theme, the current user or the language.

The most common mistake is putting server data into a client store and then keeping it in sync by hand.

Why is context bad for state that changes often? Because every consumer renders again whenever the provider's value changes, even a consumer that uses only a small part of it. Put a fast changing value in context and a keystroke can render half the app.

Optimistic updates make an interface feel instant. You update the cache before the server answers, and you keep a copy of the old value. If the request fails, you roll back to the copy. When it settles, you refetch so the screen matches the server. Interviewers ask for exactly those three steps.

One more point from the section: since React eighteen, several state updates in the same event, or the same async callback, are batched into a single render.`,

    s4: `Section five is rendering and reconciliation.

When state changes, React builds a new description of the screen and compares it with the previous one. A full comparison of two trees would be far too slow, so React uses a heuristic that runs in linear time. It compares level by level. If the type of an element changed, it throws that subtree away and builds a new one. And within a list, it uses keys.

The key is the identity hint. It tells React which elements are the same item across renders. With stable ids, an item that moves is moved. With the index as key, a reorder or a delete makes React reuse state for the wrong item. That is a quiz question, and a very common real bug.

Fiber is React's internal engine since version sixteen. It makes rendering interruptible. React can pause work, drop it, or give some updates priority over others, and that is what makes concurrent features possible.

When does a component render again? When its own state changes, when its parent renders, or when a context it reads changes. To prevent unnecessary renders, first find them with the profiler. Then keep state close to where it is used, and only after that reach for memo.

And know what memo compares. It does a shallow comparison of props, one by one. So a new object or a new function created during the parent's render counts as a change, even when its contents are identical.`,

    s5: `Section six is API integration and data fetching.

A production grade request needs three things that a simple fetch does not have, and interviewers look for all three. The first is cancellation. When the component unmounts or the input changes, abort the request, so an old response cannot overwrite a new one. The second is retries, for failures that are likely to pass, such as a network blip or a server that was briefly overloaded. Retry with a growing delay, and never retry a request the server rejected as invalid. The third is validation at run time. TypeScript types say what you expect, and a schema checks what actually arrived.

Error handling works in layers. Error boundaries catch errors thrown while rendering, and show a fallback instead of a blank page. They do not catch errors in event handlers or in async code, so those need try and catch. And across the app, errors are normalised into one shape, so every screen can show them the same way.

Then Suspense for data. It lets you declare a loading state instead of managing a loading flag in every component. A component suspends while its data is not ready, the nearest Suspense boundary shows its fallback, and the real content replaces it when the data arrives. Under the surface, the component signals this by throwing a promise.

The benefit is that the component itself is written as if the data were always there, and the loading and error states live in the boundaries around it.`,

    s6: `Section seven is performance.

The checklist for a slow page starts with one rule: measure first. Use the React profiler to see which components render most often and take longest. That is also the quiz answer for the fastest way to diagnose renders. Then work from the largest lever to the smallest. Look at the bundle: is too much JavaScript shipped up front? Look at the network: are requests running one after another when they could run together? Then look at rendering: unnecessary renders, expensive calculations, and very long lists.

Lazy loading splits code. A lazily loaded component is fetched the first time it is rendered. It must sit inside a Suspense boundary, which shows a fallback while the code loads, and inside an error boundary, in case the download fails.

Virtualisation is for long lists. It renders only the rows visible in the viewport, plus a few either side, and reuses them as you scroll. For a list of ten thousand items, that is around twenty elements in the page instead of ten thousand. Libraries do the arithmetic for you. Mention the costs too: searching within the page and accessibility need extra care.

Finally layout shift, which is caused by elements changing size or position after the first render. Reserve the space up front. Give images and video explicit dimensions, keep room for content that loads late, such as advertisements and banners, and avoid inserting content above what the user is already reading.`,

    s7: `Section eight is testing.

To test a component that fetches data, use the find queries, which wait for an element to appear. And mock the network at the network level, with Mock Service Worker, not by replacing the fetch function. Then your real request code and your real parsing code run in the test. The key principle is to test what the user sees, not how the component is built.

The Testing Trophy puts most weight on integration tests, because they give the most confidence for their cost. Static analysis is the base: types and lint. Unit tests cover pure logic. Integration tests render components together and use them as a person would. A small number of end to end tests cover the critical journeys.

Flaky tests erode trust in the whole suite, and preventing them is better than chasing them. Use locators and queries that wait automatically, and never a fixed sleep. Keep tests independent, so that each one creates its own data and none relies on the order in which they run. Control time and randomness. And mock the network, so that a test does not depend on a real service being up.

When a test is flaky anyway, do not just retry it until it passes. Find out whether it is the test or the product that has the race, because sometimes the flaky test is telling you about a real bug.`,

    s8: `Section nine is design patterns, three of them.

Compound components are a set of components that work together and share state implicitly through context. Think of tabs: a tabs container, a list, a tab and a panel. The person using them arranges the pieces however they like, and does not pass the active tab to each one by hand. The pattern gives flexible composition with no prop drilling, which is why component libraries use it so heavily.

Controlled against uncontrolled components. In a controlled input, React state is the source of truth. The value comes from state, and every change goes through a handler. That suits validation as you type, fields that depend on each other, and formatting. In an uncontrolled input, the page itself holds the value, and you read it through a ref or when the form is submitted. That is simpler, and it avoids a render on each keystroke. In practice, form libraries keep inputs uncontrolled for speed, and add validation on top.

Render props pass a function as a prop, so that a component can share its logic and let the caller decide what to draw. Custom hooks have replaced most uses, because a hook shares logic without adding a layer to the tree. Render props are still useful when a component must control where and how something is rendered, such as a virtualised list that calls your function for each visible row.`,

    s9: `Section ten is Next.js and server rendering, as seen from React.

Four strategies, each with its own balance of speed, search visibility and freshness. Server side rendering produces the page on every request: always fresh, and each request pays for it. Static generation produces it once at build time: as fast as possible, and only as fresh as the last build. Incremental static regeneration serves a stored page and rebuilds it in the background after a set time. Server components render on the server and send no JavaScript for themselves at all.

The quiz gives a good worked example. A product page that changes twice a day is best served by regeneration with a time of about an hour. Rendering on every request would be wasted work, and build time only would be stale.

In the App Router, every component is a server component by default. You add the use client directive only when you need state, effects or browser APIs. And you push that directive as far down the tree as you can, so the interactive piece is small and the rest stays on the server.

Streaming sends the page to the browser in pieces. Suspense boundaries mark where React may break the stream. The shell arrives first with fallbacks in place, and each slow part is filled in as its data becomes ready. The user sees something useful long before the slowest query has finished.`,

    s10: `Section eleven is security in React.

React escapes every string value it renders, by default. If a user's name contains a script tag, it is shown as text and not run. That blocks the classic form of cross site scripting.

But there are holes, and they are the places where you hand React something raw. The first is the property for setting inner markup directly. Its name literally warns you that it is dangerous. If you must use it, sanitise the content first with a well known library. The second is addresses. A link whose address begins with the javascript scheme will run code when clicked, so check that addresses supplied by users use a safe scheme. The third is anything that injects content outside React's control, including third party scripts.

Then security headers, your first line of defence, set on the web server or in the framework. A content security policy lists which sources of script are allowed, so an injected script does not run. Strict transport security forces an encrypted connection. Others stop the browser from guessing content types, and stop other sites from putting your pages inside a frame.

One more thing an interviewer may ask: where do you keep a session token? Not in local storage, where any script on the page can read it. Put it in a cookie that scripts cannot read.

The summary sentence is: React protects text. You have to protect markup, addresses and everything else.`,

    s11: `Section twelve is build tooling and styling, two comparison questions.

Vite, Webpack and Turbopack are all bundlers, with very different designs. Vite serves your source as native modules during development, so there is no bundling step while you work and updates appear almost instantly. It uses a separate bundler for production builds. It is the default for new projects that do not use a framework with its own tooling. Webpack is the mature one, with the largest ecosystem of plugins and the most configuration. You meet it in established codebases. Turbopack is the newer bundler written in Rust, built into Next.js.

The interview answer is not that one of them wins. For a new project you take the default of your framework. For an existing project, the cost of migrating has to be weighed against the time developers lose waiting.

Styling is the same kind of question. Tailwind gives you utility classes with design tokens built in, and no unused CSS. Its cost is crowded markup. CSS Modules give you ordinary CSS that is scoped to a component, with no run time cost. CSS in JavaScript libraries make dynamic styles easy, but many of them do work at run time, and they fit poorly with server components.

A common senior default is Tailwind for product screens, often with a headless component library for behaviour. Whatever you choose, give a reason that fits the team and the project.`,

    s12: `Section thirteen is accessibility.

Accessibility is a legal requirement in many places, and it is a signal of quality. The guidelines rest on four principles, remembered as POUR. Perceivable: people can perceive the content, so images have text alternatives and colour contrast is sufficient. Operable: everything works from a keyboard, and focus is always visible. Understandable: labels and error messages are clear. Robust: the markup works with assistive technology.

What you do by default follows from that. Use semantic elements: a real button, a real link, real headings in order. Give every form field a label. Manage focus when a dialog opens and closes. And never rely on colour alone to carry meaning.

A custom dropdown shows how much a native element gives you for free. You have to supply the roles, the expanded state, arrow key navigation, Escape to close, selection with Enter, and the return of focus afterwards. The honest interview answer is that in a real project you would use a well tested headless library for this, and that you know what it is doing for you.

Then the rules of ARIA, and the first rule is: do not use it if a native element works. A real button already has the role, keyboard support and focus. A generic element pretending to be a button needs all three added by hand. ARIA changes what assistive technology announces. It adds no behaviour of its own.`,

    'deep-ts': `The first deep dive is advanced TypeScript patterns for React.

A polymorphic component renders a different element depending on a prop. A text component might render as a paragraph, a heading or a label. Typed well, it accepts exactly the props of the element you chose. Ask for a label, and you may pass the attribute that points it at a field. Ask for a paragraph, and that attribute is rejected.

A generic list or table infers its type parameter from its props, so callers rarely write it out. The column definitions are restricted to real fields of the row type, so a typo in a column name is a compile error.

Typing context without assertions everywhere. Create the context with a default of null, which is honest, because there is no value outside a provider. Then write one small hook that reads the context, throws a clear error if it is null, and returns the narrowed value. Every consumer uses that hook. The error then points at the real bug, a missing provider, and no component needs an exclamation mark.

Finally, a reducer typed with a discriminated union of actions. The type field is the discriminant, so inside each case the compiler knows exactly which action you have and what payload it carries. Add a never check in the default branch, and forgetting to handle a new action becomes a compile error.

All four patterns have the same aim: the caller gets precise types, and never has to write a cast.`,

    'deep-react': `The last deep dive is two React nineteen APIs.

First, refs. In React nineteen a ref is an ordinary prop for function components. You declare it in the props and pass it to the element, and that is all. The forward ref wrapper still works, so a codebase can migrate gradually, but it is no longer necessary. This also removes the old problem with generic components, where the wrapper lost the type parameter.

Ref callbacks changed too. A ref callback can now return a cleanup function. React calls that cleanup when the element is removed. Before, React called your callback again with null, and you had to handle that case yourself. The new form matches how effects work, which makes it easier to set something up on an element and tear it down again, such as an observer.

Second, the effect event hook. It solves a specific and common problem. Sometimes an effect needs to read the latest value of a prop or a piece of state, without running again when that value changes. The classic example is a chat connection. The effect should reconnect when the room changes. It should not reconnect just because the notification setting changed, and yet when a message arrives, it must use the current setting.

Before this hook, people left the value out of the dependency list and silenced the lint rule, which hid real bugs. The effect event hook extracts that non reactive piece of logic into a function that always sees the latest values and is not a dependency.`,
  },
};
