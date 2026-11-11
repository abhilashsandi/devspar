// Crash Course, part A: JavaScript, TypeScript, React, Next.js.
import D from './dg.mjs';
import { CS } from './dg-cs.mjs';
import { P, L, N, C, T, H, SAY, TRAP, K, RAPID, GO, S } from './cc-kit.mjs';

// ───────────────────────────────────────────── JavaScript
export const javascript = S('js', 'JavaScript', 10, [
  K('JS 1/6 · Scope, hoisting and closures',
    P('`var` is function-scoped and hoisted as `undefined`. `let` and `const` are block-scoped and hoisted into the **temporal dead zone**: touching them before the declaration line throws a `ReferenceError`. Function declarations are hoisted whole.',
      'A **closure** is a function plus a live reference to the variables of the scope it was created in. That is how you get private state, memoisation, factories, and why a stale callback in React can see an old value.'),
    CS.closure,
    C(`function counter() {
  let n = 0;                 // private: only the returned functions can reach it
  return { inc: () => ++n, get: () => n };
}

for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3  (one shared i)
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2  (new j per iteration)`),
    SAY('A closure captures variables, not values, so it always sees the latest value of the binding it closed over.'),
  ),
  K('JS 2/6 · this, prototypes and classes',
    P('`this` is decided by **how a function is called**, not where it is written. Check the rules in order:'),
    N('`new Fn()` → the new object.',
      '`fn.call(obj)` / `apply` / `bind` → `obj`.',
      '`obj.fn()` → `obj` (the thing left of the dot).',
      'Plain `fn()` → `undefined` in strict mode (the global object otherwise).',
      'Arrow functions have no own `this`: they use the enclosing scope\'s `this`, forever.'),
    P('Objects inherit through the **prototype chain**: a property lookup walks `obj → obj.__proto__ → … → Object.prototype → null`. `class` is syntax over that same mechanism; methods live on `Class.prototype`, shared by every instance.'),
    C(`const user = { name: 'Ada', hi() { return this.name; } };
const f = user.hi;
f();                    // undefined: the call site lost its "user."
setTimeout(user.hi);    // same problem
setTimeout(() => user.hi()); // fine
const bound = user.hi.bind(user);`),
    TRAP('An arrow function as an object method does **not** get the object as `this`.'),
  ),
  K('JS 3/6 · The event loop: stack, microtasks, macrotasks',
    P('JavaScript runs one call stack. When it empties, the loop **drains every microtask** (promise callbacks, `queueMicrotask`, `await` continuations), then takes **one macrotask** (`setTimeout`, I/O, events), and the browser may render between macrotasks.'),
    CS.eventLoop,
    C(`console.log('A');
setTimeout(() => console.log('B'));
Promise.resolve().then(() => console.log('C'));
(async () => { console.log('D'); await null; console.log('E'); })();
console.log('F');
// A D F C E B`, 'The classic output puzzle'),
    SAY('Synchronous code first, then all microtasks, then the next timer. Code after an await is a microtask.'),
  ),
  K('JS 4/6 · Promises and async/await',
    T(['Combinator', 'Resolves when', 'Rejects when'], [
      ['`Promise.all`', 'all fulfil (array of values)', 'the first one rejects (fail fast)'],
      ['`Promise.allSettled`', 'all settle (array of `{status, value|reason}`)', 'never'],
      ['`Promise.race`', 'the first one settles, either way', 'the first one settles with a rejection'],
      ['`Promise.any`', 'the first one fulfils', 'all reject (`AggregateError`)'],
    ]),
    C(`// Sequential (slow): each await waits for the previous call
const a = await getA(); const b = await getB();

// Parallel: start both, then wait
const [a2, b2] = await Promise.all([getA(), getB()]);

// Timeout any promise
const withTimeout = (p, ms) => Promise.race([
  p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
]);`),
    L('`async` functions always return a promise; a `throw` inside becomes a rejection.',
      'Use `try/catch` around `await`, or `.catch()` on the promise. An unhandled rejection crashes Node by default.',
      '`forEach` does not wait for async callbacks; use `for...of` (sequential) or `Promise.all(arr.map(...))` (parallel).',
      'Cancel with `AbortController`: pass `signal` to `fetch` and call `controller.abort()`.'),
  ),
  K('JS 5/6 · Types, equality and copying',
    L('Primitives (`string number bigint boolean undefined null symbol`) are copied by value; objects, arrays and functions by **reference**.',
      '`===` compares without coercion; `==` coerces (`0 == \'\'` is true). Only use `==` for `x == null` (matches null and undefined).',
      '`typeof null === \'object\'` (historic bug); `NaN !== NaN`, so use `Number.isNaN` or `Object.is`.',
      'Spread `{...o}` and `Object.assign` are **shallow**. Use `structuredClone(o)` for a deep copy (handles Dates, Maps, cycles; not functions).',
      '`??` falls back only on null/undefined; `||` also on `0`, `\'\'` and `false`. `?.` short-circuits on null/undefined.',
      'Truthy traps: `[]` and `{}` are truthy; `0`, `\'\'`, `NaN`, `null`, `undefined`, `false` are falsy.'),
    C(`const a = { tags: ['x'] };
const b = { ...a };
b.tags.push('y');        // a.tags is now ['x', 'y'] too: shallow copy
const c = structuredClone(a);`),
  ),
  K('JS 6/6 · Write these from memory: debounce and throttle',
    P('**Debounce** waits until calls stop for `ms` (search box). **Throttle** runs at most once per `ms` (scroll, resize).'),
    C(`function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}`),
    C(`// Promise.all from scratch: a favourite follow-up
function all(promises) {
  return new Promise((resolve, reject) => {
    const out = []; let left = promises.length;
    if (!left) return resolve(out);
    promises.forEach((p, i) => Promise.resolve(p).then((v) => {
      out[i] = v; if (--left === 0) resolve(out);
    }, reject));
  });
}`),
  ),
  RAPID('JS rapid-fire', [
    ['`map` vs `forEach`?', '`map` returns a new array; `forEach` returns undefined and is for side effects.'],
    ['What is event delegation?', 'One listener on a parent handles events from many children via `event.target`, thanks to bubbling.'],
    ['ES modules vs CommonJS?', 'ESM is static (`import`/`export`, tree-shakable, async loading); CJS is `require` at run time, synchronous.'],
    ['What is a generator?', 'A function (`function*`) that pauses at `yield` and resumes on `next()`; the basis of lazy iterators.'],
    ['`Map` vs object?', '`Map` keeps insertion order, allows any key type, has `size`, and is faster for frequent add/remove.'],
    ['`WeakMap` use case?', 'Attach data to objects without preventing garbage collection (caches, private data).'],
    ['What is currying?', 'Turning `f(a, b)` into `f(a)(b)`, so arguments can be supplied one at a time.'],
    ['`Object.freeze`?', 'Shallow: prevents adding, removing or changing own properties; nested objects stay mutable.'],
    ['Memory leak sources?', 'Forgotten timers and listeners, growing caches/globals, closures holding big objects, detached DOM nodes.'],
  ]),
  K('JS · Go deeper', GO(['/javascript', 'JavaScript guide'], ['/javascript/labs', 'JavaScript labs'], ['/interview-cheatsheet#javascript', 'Cheatsheet: JavaScript'])),
]);

// ───────────────────────────────────────────── TypeScript
export const typescript = S('ts', 'TypeScript', 8, [
  K('TS 1/5 · The mental model',
    L('**Types are erased.** TypeScript checks at build time and emits plain JS; nothing validates data at run time.',
      '**Structural typing:** two types are compatible when their shapes match; names do not matter.',
      '**Start strict:** `strict: true` (+ `noUncheckedIndexedAccess`). `strictNullChecks` is the flag that catches the most bugs.',
      '`any` switches checking off. `unknown` accepts anything but forces you to narrow first. `never` means "cannot happen".'),
    D.tsLattice,
    SAY('`unknown` is the type-safe `any`: both accept everything, but `unknown` makes me prove what it is before I use it.'),
  ),
  K('TS 2/5 · Unions, narrowing and discriminated unions',
    P('Model states as a **discriminated union** and let control flow narrow it. A `never` default makes the compiler list every place that must handle a new case.'),
    C(`type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ok'; data: User[] };

function render(s: State) {
  switch (s.status) {
    case 'ok': return s.data.length;        // s is narrowed to the 'ok' member
    case 'error': return s.error.message;
    case 'idle': case 'loading': return 0;
    default: { const x: never = s; return x; } // compile error if a case is missing
  }
}

// Custom type guard
const isUser = (v: unknown): v is User =>
  typeof v === 'object' && v !== null && 'id' in v;`),
    P('Narrowing tools: `typeof`, `instanceof`, `in`, equality, truthiness, discriminant checks, type predicates (`v is T`) and assertion functions (`asserts v is T`).'),
  ),
  K('TS 3/5 · Generics and utility types',
    C(`function first<T>(xs: T[]): T | undefined { return xs[0]; }

function pluck<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
pluck({ id: 1, name: 'a' }, 'name'); // string;  'nope' is a compile error`),
    T(['Utility', 'Does'], [
      ['`Partial<T>` / `Required<T>`', 'all props optional / required'],
      ['`Readonly<T>`', 'all props readonly (compile time only)'],
      ['`Pick<T, K>` / `Omit<T, K>`', 'keep / drop some keys'],
      ['`Record<K, V>`', 'object with keys K and values V'],
      ['`Exclude<U, X>` / `Extract<U, X>`', 'remove / keep union members'],
      ['`NonNullable<T>`', 'drop null and undefined'],
      ['`ReturnType<F>` / `Parameters<F>`', 'a function\'s return / parameter types'],
      ['`Awaited<T>`', 'unwrap a promise type'],
    ]),
    P('Mapped and conditional types power all of these: `{ [K in keyof T]?: T[K] }` is `Partial`; `T extends (...a: any) => infer R ? R : never` is `ReturnType`.'),
  ),
  K('TS 4/5 · Patterns interviewers like',
    C(`// satisfies: validate without widening
const routes = { home: '/', admin: '/admin' } satisfies Record<string, string>;
routes.admin;            // still the literal key; routes.nope is an error

// as const → a union from runtime values
const ROLES = ['admin', 'editor'] as const;
type Role = typeof ROLES[number];         // 'admin' | 'editor'

// Branded types: stop mixing up ids that are both strings
type UserId = string & { readonly __brand: 'UserId' };
const asUserId = (s: string) => s as UserId;

// Validate at the edge, infer the type from the schema
import { z } from 'zod';
const User = z.object({ id: z.string(), email: z.string().email() });
type User = z.infer<typeof User>;
const user = User.parse(await res.json());   // throws on bad data`),
    L('`type` vs `interface`: interface for extendable object shapes (and declaration merging); type for unions, tuples, mapped and conditional types.',
      'Prefer string-literal unions or `as const` objects over `enum` (enums emit runtime code and break type stripping).',
      '`x as T` is a promise you make, not a check. Validate network data with a schema (zod, valibot).'),
  ),
  RAPID('TS rapid-fire', [
    ['Excess property check?', 'Only on fresh object literals: extra keys error when assigned directly, not via a variable.'],
    ['`void` vs `undefined` return?', '`void` means "ignore the result"; a `() => void` callback may still return something.'],
    ['What does `keyof typeof obj` give?', 'The union of the object\'s keys as literal types.'],
    ['Function overloads?', 'Several call signatures above one implementation; callers see only the signatures.'],
    ['`readonly` arrays?', '`readonly T[]` removes mutating methods; it is not assignable to `T[]`.'],
    ['Declaration files?', '`.d.ts` describe JS shapes; `@types/*` packages supply them for untyped libraries.'],
    ['How to migrate JS → TS?', '`allowJs` + `checkJs`, convert leaf files first, turn strict flags on one by one, `strictNullChecks` last.'],
    ['Variance in one line?', 'Return types are covariant; parameters are contravariant under `strictFunctionTypes` (methods are bivariant).'],
  ]),
  K('TS · Go deeper', GO(['/typescript', 'TypeScript guide'], ['/reactjs', 'React + TypeScript'], ['/interview-cheatsheet#typescript', 'Cheatsheet: TypeScript'])),
]);

// ───────────────────────────────────────────── React
export const react = S('react', 'React', 12, [
  K('React 1/7 · How rendering works',
    N('**Trigger:** initial mount, a `setState`, a parent re-render, or a context value change.',
      '**Render:** React calls your components (pure functions of props + state) and builds a new element tree.',
      '**Reconcile:** it diffs the new tree against the old one. Different element type → unmount and remount; same type → update props. `key` identifies list items.',
      '**Commit:** it applies the minimal DOM changes, then runs layout effects, paints, then runs `useEffect`.'),
    L('A re-render is not a DOM update: re-rendering is cheap unless the component does heavy work.',
      'State updates are **batched** (in events, timeouts and promises since React 18) and the new value shows up on the next render, not on the next line.',
      'Use a stable unique id as `key`. An index key breaks state when items are reordered, inserted or removed.'),
    SAY('A component re-renders when its state changes, its parent re-renders, or a context it reads changes. Props changing is a consequence of the parent re-rendering, not a separate trigger.'),
  ),
  K('React 2/7 · Hooks you must explain',
    T(['Hook', 'Use it for', 'Watch out'], [
      ['`useState`', 'local UI state', 'use the updater `setN(n => n + 1)` when the next value depends on the previous'],
      ['`useReducer`', 'several related values, explicit transitions', 'keep the reducer pure'],
      ['`useEffect`', 'syncing with something **outside** React (subscriptions, DOM APIs, timers)', 'not for derived data or event logic; return a cleanup'],
      ['`useLayoutEffect`', 'measure the DOM before paint', 'blocks paint; rarely needed'],
      ['`useRef`', 'a mutable box that survives renders (DOM nodes, timers, latest value)', 'changing it does not re-render'],
      ['`useMemo` / `useCallback`', 'cache an expensive value / a stable function identity', 'only helps with memoised children or effect deps'],
      ['`useContext`', 'read a value without prop drilling', 'every consumer re-renders when the value changes'],
      ['`useTransition` / `useDeferredValue`', 'mark updates as non-urgent so typing stays responsive', 'not a debounce'],
    ]),
    C(`useEffect(() => {
  const ctrl = new AbortController();
  fetch('/api/user/' + id, { signal: ctrl.signal })
    .then((r) => r.json()).then(setUser).catch(() => {});
  return () => ctrl.abort();        // cleanup: runs before the next effect and on unmount
}, [id]);                           // re-run only when id changes`),
    TRAP('Rules of hooks: call them at the top level of a component or custom hook, never in conditions or loops, because React matches hooks by call order.'),
  ),
  K('React 3/7 · State: where should it live?',
    CS.state,
    L('**Derive, do not store:** anything computable from props or state is computed during render, not synced with an effect.',
      '**Lift state up** to the closest common parent when siblings need it; push it down again when only one child does.',
      '**Server state is not UI state:** use TanStack Query / SWR (or Server Components) for caching, dedup, refetching and invalidation.',
      '**Context** is for low-frequency values (theme, user, locale). For high-frequency shared state use a store (Zustand, Redux Toolkit) with selectors.',
      '**URL state** (filters, pagination, tabs) belongs in the query string so it survives reloads and can be shared.'),
  ),
  K('React 4/7 · Performance toolkit',
    N('**Measure first:** React DevTools Profiler ("why did this render?") and the browser Performance panel.',
      '**Move state down** or pass components as `children` so fewer things re-render.',
      '`React.memo` a child + stable props (`useCallback`, `useMemo`) when the child is expensive.',
      '**Virtualise** long lists (TanStack Virtual, react-window).',
      '**Code-split** routes and heavy widgets with `lazy` + `Suspense`.',
      '`useTransition` / `useDeferredValue` keep input responsive during heavy re-renders.',
      'The **React Compiler** auto-memoises components and hooks, so most manual `memo`/`useCallback` becomes unnecessary.'),
    C(`const Chart = lazy(() => import('./Chart'));

function Dashboard() {
  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q);        // input stays snappy
  return (
    <>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <Suspense fallback={<Spinner />}>
        <Chart filter={deferredQ} />
      </Suspense>
    </>
  );
}`),
  ),
  K('React 5/7 · React 19 in one card',
    L('**Actions:** pass an async function to `<form action={fn}>` or `startTransition`; React tracks pending state and errors.',
      '`useActionState(fn, initial)` → `[state, formAction, isPending]` for form results and validation errors.',
      '`useOptimistic` shows the expected result immediately and rolls back if the action fails.',
      '`useFormStatus` reads the pending state of the parent form from inside a button.',
      '`use(promise)` / `use(context)`: read a promise (suspends until resolved) or context, even conditionally.',
      '`ref` is a normal prop for function components (no more `forwardRef`); `<Context>` works as a provider.',
      'Server Components and Server Actions (`"use server"`) are stable for frameworks such as Next.js.'),
    C(`function AddTodo() {
  const [state, action, pending] = useActionState(async (prev, form) => {
    const res = await createTodo(form.get('title'));
    return res.ok ? { error: null } : { error: res.message };
  }, { error: null });

  return (
    <form action={action}>
      <input name="title" />
      <button disabled={pending}>Add</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`),
  ),
  K('React 6/7 · Patterns and testing',
    L('**Composition over configuration:** `children` and compound components (`<Tabs><Tabs.List/>…`) instead of a dozen boolean props.',
      '**Custom hooks** share stateful logic (`useDebounce`, `useFetch`), not state itself: each caller gets its own copy.',
      '**Controlled vs uncontrolled:** controlled inputs read from state on every keystroke; uncontrolled read via `ref`/FormData on submit (lighter for big forms; React Hook Form uses this).',
      '**Error boundaries** catch render errors in a subtree and show a fallback (they do not catch event-handler or async errors).',
      '**Portals** render into another DOM node (modals) while keeping React context and event bubbling.',
      '**Testing:** React Testing Library; query by role and label like a user (`getByRole(\'button\', { name: /save/i })`), `userEvent` for interactions, `findBy*` for async, MSW to mock the network.'),
  ),
  RAPID('React rapid-fire', [
    ['Virtual DOM?', 'An in-memory element tree React diffs to compute the minimal real DOM changes.'],
    ['Why is setState "async"?', 'Updates are batched and applied on the next render; the variable in this render never changes.'],
    ['Stale closure?', 'An effect/callback captured an old value; fix with correct deps, a functional update or a ref.'],
    ['`useEffect` with `[]`?', 'Runs after the first commit and cleans up on unmount (twice in Strict Mode dev to surface bugs).'],
    ['Lifting state vs context?', 'Lift for a few nearby components; context to avoid drilling through many layers.'],
    ['Hydration error?', 'Server HTML differs from the first client render (dates, `window`, random ids); use `useId`/effects.'],
    ['Keys on fragments?', '`<Fragment key={id}>` when mapping to multiple siblings.'],
    ['How to prevent a child re-render?', '`memo` + stable props, or restructure so state lives below it.'],
    ['Accessibility basics?', 'Semantic elements, labels, focus management in dialogs, keyboard support, `aria-*` only when needed.'],
  ]),
  K('React · Go deeper', GO(['/react-training', 'React guide'], ['/react-training/labs', 'React labs'], ['/reactjs', 'React + TypeScript'], ['/interview-cheatsheet#react', 'Cheatsheet: React'])),
]);

// ───────────────────────────────────────────── Next.js
export const nextjs = S('next', 'Next.js', 10, [
  K('Next 1/6 · Rendering strategies',
    D.nextRender,
    P('Pick per route (or per component with Cache Components): **static** when the content is the same for everyone, **ISR / revalidate** when it changes occasionally, **dynamic** when it depends on the request (cookies, headers, search params), **client** for highly interactive, user-only widgets.'),
  ),
  K('Next 2/6 · Server and Client Components',
    D.nextBoundary,
    L('Everything in `app/` is a **Server Component** by default: it can be `async`, read the DB directly, and ships zero JS.',
      '`"use client"` marks a boundary: that file and its imports are bundled for the browser. Put it on the **leaves** that need state, effects or event handlers.',
      'Props crossing the boundary must be serialisable. Pass Server Components into Client Components as `children`.',
      'Keep secrets server-only: import `server-only` in modules that must never be bundled for the client.'),
  ),
  K('Next 3/6 · Data fetching, caching and mutations',
    C(`// app/products/[id]/page.tsx  (Next.js 15+: params is a Promise)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();
  return <ProductView product={product} />;
}

// A cached function (Next.js 16, cacheComponents: true)
async function getCategories() {
  'use cache';
  cacheLife('hours');
  cacheTag('categories');
  return db.category.findMany();
}

// A Server Action: a mutation called from a form
async function rename(formData: FormData) {
  'use server';
  await db.category.update({ where: { id: String(formData.get('id')) }, data: { name: String(formData.get('name')) } });
  revalidateTag('categories');     // or revalidatePath('/products')
}`),
    L('Fetch in parallel (`Promise.all`) and stream slow parts with `<Suspense>` / `loading.tsx` instead of waterfalls.',
      'Next 16 makes caching **explicit**: nothing is cached unless you opt in with `"use cache"`. In 13–15, `fetch` caching and the Full Route Cache are the defaults to explain.',
      'Server Actions are public POST endpoints: **validate input and check auth inside every one.**'),
  ),
  K('Next 4/6 · Routing files and the request path',
    T(['File', 'Purpose'], [
      ['`layout.tsx`', 'shared UI that persists across navigations (does not re-render)'],
      ['`page.tsx`', 'the route\'s UI; makes the segment publicly reachable'],
      ['`loading.tsx`', 'instant Suspense fallback while the segment streams'],
      ['`error.tsx`', 'error boundary for the segment (a Client Component)'],
      ['`not-found.tsx`', 'UI for `notFound()`'],
      ['`route.ts`', 'an API endpoint (GET, POST …) using Web Request/Response'],
      ['`proxy.ts`', 'runs before routing (auth redirects, rewrites, headers); was `middleware.ts` before Next 16'],
      ['`(group)` / `[slug]` / `[...all]` / `@slot`', 'route groups, dynamic segments, catch-all, parallel routes'],
    ]),
    D.nextRequest,
  ),
  K('Next 5/6 · Performance and production',
    L('`next/image` (sizing, lazy loading, AVIF/WebP), `next/font` (self-hosted, no layout shift), `next/script` strategies.',
      'Keep client bundles small: push `"use client"` down, `dynamic(() => import(…))` heavy widgets, analyse with the bundle analyzer.',
      '`generateStaticParams` prebuilds dynamic routes; `generateMetadata` for SEO tags.',
      'Turbopack is the default bundler in Next 16 for dev and build.',
      'Deploy on Vercel, or self-host with `output: \'standalone\'` in a container behind a CDN; static assets go to the CDN, the Node server handles dynamic routes.'),
    SAY('I default to Server Components, stream slow data behind Suspense, cache explicitly with tags, and invalidate from the Server Action that changed the data.'),
  ),
  RAPID('Next.js rapid-fire', [
    ['App Router vs Pages Router?', 'App Router: nested layouts, RSC, streaming, Server Actions; Pages Router: `getServerSideProps`/`getStaticProps`.'],
    ['How does `revalidatePath` differ from `revalidateTag`?', 'Path invalidates one route\'s cached output; tag invalidates every cached entry with that tag, wherever it is used.'],
    ['Where do you check auth?', 'In `proxy.ts` for cheap redirects, and again in the data layer / every Server Action (the real gate).'],
    ['What makes a route dynamic?', 'Reading `cookies()`, `headers()`, `searchParams`, or uncached data at request time.'],
    ['`router.refresh()`?', 'Re-fetches the current route\'s Server Components without losing client state.'],
    ['Edge vs Node runtime?', 'Edge: fast start, near users, limited APIs. Node: full APIs and drivers. Most apps use Node.'],
    ['Hydration in RSC world?', 'Only Client Components hydrate; Server Components arrive as HTML + RSC payload with no JS.'],
  ]),
  K('Next.js · Go deeper', GO(['/nextjs', 'Next.js 16 guide'], ['/interview-cheatsheet#next-js', 'Cheatsheet: Next.js'])),
]);
