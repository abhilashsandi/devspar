// Bug Clinic, part B: Node.js, TypeScript, Next.js and CSS bugs.
import { BUG } from './bug-content-a.mjs';

// ───────────────────────────────────────────── 3. Node.js
export const node = [
  BUG('A “not found” check never triggers',
    'Requests for users that do not exist return 200 with an empty object instead of 404.',
    `app.get('/users/:id', async (req, res) => {
  const user = db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'not found' });
  res.json(user);
});`,
    ['`findById` returns a **promise**, and the `await` is missing. A promise object is always truthy, so the check never fires, and `res.json` serialises the promise as `{}`.'],
    `const user = await db.users.findById(req.params.id);`,
    'A forgotten `await` hands you a promise, which is truthy. TypeScript and the no-floating-promises rule catch it.'),
  BUG('One slow request makes the whole API unresponsive',
    'While a report is being generated, health checks time out and every other request waits.',
    `app.get('/report', (req, res) => {
  const rows = JSON.parse(fs.readFileSync('./big-export.json', 'utf8'));
  const hash = crypto.pbkdf2Sync(req.query.key, salt, 500_000, 64, 'sha512');
  res.json(summarise(rows, hash));
});`,
    ['Node runs JavaScript on **one thread**. `readFileSync`, `pbkdf2Sync` and a large `JSON.parse` all run on it and block the event loop: no other request, timer or callback can run until they finish.'],
    `app.get('/report', async (req, res) => {
  const hash = await pbkdf2(req.query.key, salt, 500_000, 64, 'sha512');   // promisified: runs on the thread pool
  const rows = await loadRowsStreaming('./big-export.json');                // stream, do not load it whole
  res.json(await runInWorker(summarise, rows, hash));                       // CPU-heavy work in a worker thread
});`,
    'Anything synchronous and slow in a request handler stops the whole server. I use the async APIs, streams, and a worker or a queue for CPU-heavy work.'),
  BUG('“Cannot set headers after they are sent to the client”',
    'Invalid requests get the 400, and then the server logs this error.',
    `app.post('/orders', (req, res) => {
  if (!req.body.items?.length) {
    res.status(400).json({ error: 'no items' });
  }
  const order = createOrder(req.body);
  res.status(201).json(order);
});`,
    ['Sending a response does not end the function. After the 400, execution continues, creates the order anyway, and tries to send a second response.'],
    `if (!req.body.items?.length) {
  return res.status(400).json({ error: 'no items' });   // return to stop here
}`,
    'Every early response needs a `return`. The worse half of this bug is the order that was created for an invalid request.'),
  BUG('Users occasionally see someone else’s data',
    'Under load, a response sometimes contains another user’s profile.',
    `let currentUser;

app.use(async (req, res, next) => {
  currentUser = await authenticate(req);
  next();
});

app.get('/me', async (req, res) => {
  const profile = await loadProfile(currentUser.id);
  res.json(profile);
});`,
    ['`currentUser` is **module-level state**, shared by every request in the process. Request A sets it and awaits; request B overwrites it; A resumes and reads B’s user. Requests interleave at every `await`.'],
    `app.use(async (req, res, next) => {
  req.user = await authenticate(req);       // state that belongs to a request lives on the request
  next();
});
app.get('/me', async (req, res) => res.json(await loadProfile(req.user.id)));
// for context deep in the call stack: AsyncLocalStorage`,
    'A Node process serves many requests at once on one thread, so module-level variables are shared. Per-request data goes on the request object or in AsyncLocalStorage.'),
  BUG('A failing request hangs until it times out',
    'When the database is down, the client waits 30 seconds and gets nothing; the process logs an unhandled rejection. (Express 4.)',
    `app.get('/products', async (req, res) => {
  const products = await db.products.list();   // rejects when the database is down
  res.json(products);
});`,
    ['Express 4 does not look at the promise an async handler returns. When it rejects, nothing calls `next(err)`, so no response is ever sent. Express 5 forwards rejected promises to the error handler automatically.'],
    `// Express 4: forward the error yourself
app.get('/products', async (req, res, next) => {
  try { res.json(await db.products.list()); } catch (err) { next(err); }
});
// one error-handling middleware then sends a consistent 500
app.use((err, req, res, next) => { res.status(500).json({ error: 'internal error' }); });`,
    'In Express 4 an async handler needs a try/catch or a wrapper that calls `next(err)`. In Express 5 it is built in, and I still keep one central error handler.'),
  BUG('A search endpoint can be used to read any table',
    'A tester sends `?name=%27%20OR%20%271%27=%271` and receives every user.',
    `app.get('/users', async (req, res) => {
  const rows = await db.query(
    "SELECT id, name FROM users WHERE name = '" + req.query.name + "'"
  );
  res.json(rows);
});`,
    ['**SQL injection.** User input is concatenated into the SQL text, so input can change the query itself. `\' OR \'1\'=\'1` turns the condition into something always true.'],
    `const rows = await db.query('SELECT id, name FROM users WHERE name = $1', [req.query.name]);
// the value is sent separately from the SQL text; validate the input shape as well`,
    'Never build SQL from strings. Parameterised queries, or a query builder or ORM that uses them, keep data out of the query text.'),
];

// ───────────────────────────────────────────── 4. TypeScript
export const ts = [
  BUG('The code type-checks and crashes on real data',
    'TypeScript reports no errors, but production throws “Cannot read properties of undefined (reading \'toUpperCase\')”.',
    `interface User { id: string; name: string }

async function getUser(id: string): Promise<User> {
  const res = await fetch('/api/users/' + id);
  return (await res.json()) as User;
}
const user = await getUser('42');
console.log(user.name.toUpperCase());`,
    ['Types are erased at build time. `res.json()` returns `any`, and `as User` is a promise to the compiler, not a check. If the API returns an error object or renames a field, nothing notices until the property is used.'],
    `import { z } from 'zod';
const User = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof User>;

async function getUser(id: string): Promise<User> {
  const res = await fetch('/api/users/' + id);
  if (!res.ok) throw new Error('request failed: ' + res.status);
  return User.parse(await res.json());        // fails here, with a clear message
}`,
    'Types describe what I expect; only a run-time check proves it. I validate at the boundary and derive the type from the schema.'),
  BUG('A “safe” lookup crashes when the item is missing',
    'The page crashes for a product that has been removed from the catalogue.',
    `const product = products.find((p) => p.id === id)!;
return product.price * quantity;`,
    ['`find` returns `T | undefined`. The `!` (non-null assertion) removes `undefined` from the type without checking anything, so a missing product reaches `product.price` at run time.'],
    `const product = products.find((p) => p.id === id);
if (!product) throw new NotFoundError('product ' + id);   // or return a fallback
return product.price * quantity;`,
    '`!` and `as` silence the compiler; they do not make the value exist. I handle the missing case.'),
  BUG('A new status shows a blank label',
    'After “refunded” was added to the union, the UI shows nothing for refunded orders, and the compiler did not complain.',
    `type Status = 'pending' | 'paid' | 'refunded';

function label(status: Status) {
  switch (status) {
    case 'pending': return 'Waiting for payment';
    case 'paid': return 'Paid';
  }
}`,
    ['The switch is not exhaustive, and without an explicit return type the function is inferred as returning `string | undefined`, which the JSX happily renders as nothing.'],
    `function label(status: Status): string {
  switch (status) {
    case 'pending': return 'Waiting for payment';
    case 'paid': return 'Paid';
    case 'refunded': return 'Refunded';
    default: { const unhandled: never = status; throw new Error('unhandled status: ' + unhandled); }
  }
}`,
    'A `never` check in the default branch turns “someone added a case” into a compile error at every switch.'),
  BUG('A dictionary lookup returns undefined that the types said was there',
    'The compiler is happy, and `rate.toFixed` throws for a currency that is not in the table.',
    `const rates: Record<string, number> = { USD: 1, EUR: 0.92 };

function convert(amount: number, currency: string) {
  const rate = rates[currency];
  return (amount * rate).toFixed(2);
}`,
    ['`Record<string, number>` claims that **every** string key has a number. Indexing gives `number`, not `number | undefined`, unless `noUncheckedIndexedAccess` is on. The same applies to `array[i]`.'],
    `// tsconfig: "noUncheckedIndexedAccess": true  -> rate is number | undefined
const rate = rates[currency];
if (rate === undefined) throw new Error('unsupported currency: ' + currency);

// better: make the keys a known set
type Currency = 'USD' | 'EUR';
const table: Record<Currency, number> = { USD: 1, EUR: 0.92 };`),
  BUG('An error handler crashes on the error',
    'The catch block itself throws “Cannot read properties of undefined (reading \'data\')”.',
    `try {
  await api.save(order);
} catch (err: any) {
  showToast(err.response.data.message);
}`,
    ['Anything can be thrown: an `Error`, a string, a network failure with no `response`. Typing the catch variable as `any` switches off the checks that would have forced you to look. Under `strict`, `err` is `unknown` for exactly this reason.'],
    `} catch (err: unknown) {
  const message = err instanceof HttpError ? err.message
    : err instanceof Error ? err.message
    : 'Something went wrong';
  showToast(message);
}`,
    'A caught value is `unknown`. I narrow it before reading anything from it.'),
];

// ───────────────────────────────────────────── 5. Next.js
export const next = [
  BUG('“You’re importing a component that needs useState”',
    'The build fails on a page in the App Router as soon as a counter is added.',
    `// app/products/page.tsx
import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`,
    ['In the App Router, components are **Server Components** by default. They run only on the server, so they cannot use state, effects or event handlers.'],
    `// app/products/Counter.tsx
'use client';
import { useState } from 'react';
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// app/products/page.tsx stays a Server Component and renders <Counter />`,
    'I keep the page on the server and move only the interactive leaf into a Client Component, so the least JavaScript ships.'),
  BUG('“window is not defined” (or “localStorage is not defined”) during build',
    'The component is marked `"use client"`, yet the build or the first request fails.',
    `'use client';
export function ThemeSwitch() {
  const saved = localStorage.getItem('theme') ?? 'light';
  const [theme, setTheme] = useState(saved);
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</button>;
}`,
    ['A Client Component is still **rendered on the server** to produce the initial HTML, and hydrated in the browser afterwards. Browser-only APIs do not exist during that server render.'],
    `'use client';
export function ThemeSwitch() {
  const [theme, setTheme] = useState('light');                    // same on server and client
  useEffect(() => { setTheme(localStorage.getItem('theme') ?? 'light'); }, []);   // browser only
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</button>;
}`,
    '“use client” means “also runs in the browser”, not “only in the browser”. Browser APIs go in effects or event handlers.'),
  BUG('An API key shows up in the browser bundle',
    'A security scan finds the payment provider’s secret key in the JavaScript served to users.',
    `// .env
NEXT_PUBLIC_PAYMENTS_SECRET=sk_live_...

// components/Checkout.tsx
'use client';
const client = new Payments(process.env.NEXT_PUBLIC_PAYMENTS_SECRET);`,
    ['Variables prefixed `NEXT_PUBLIC_` are **inlined into client code at build time**. That prefix exists to publish values. A secret must never have it, and must never be read in a Client Component.'],
    `// .env
PAYMENTS_SECRET=sk_live_...                      // no prefix: server only

// app/api/checkout/route.ts (or a Server Action)
import 'server-only';
const client = new Payments(process.env.PAYMENTS_SECRET);
export async function POST(req: Request) { /* validate, authorise, call the provider */ }`,
    'Secrets stay on the server: no public prefix, used only in route handlers, Server Actions or Server Components. And a leaked key gets rotated, not just removed.'),
  BUG('The page keeps showing data from the day it was deployed',
    'New products are in the database but the product list page does not show them until the next deployment.',
    `// app/products/page.tsx
export default async function Page() {
  const products = await db.product.findMany();
  return <ProductList products={products} />;
}`,
    ['Nothing in this page depends on the request (no cookies, headers or search params), so Next.js can **prerender it at build time** and serve that HTML to everyone. The query ran once, during the build.'],
    `// regenerate in the background at most once a minute
export const revalidate = 60;

// or refresh exactly when the data changes, from the mutation:
//   revalidatePath('/products')

// or render on every request when it must always be fresh
// export const dynamic = 'force-dynamic';`,
    'I decide per route how fresh it must be: static with revalidation for a catalogue, per-request for anything personal. The options differ between Next.js versions (with Cache Components in 16 it is `"use cache"` and `cacheLife`), so I check the docs for the one in use.'),
  BUG('Any signed-in user can delete any post',
    'The delete button is only shown to the author, but a crafted request deletes other people’s posts.',
    `'use server';
export async function deletePost(postId: string) {
  await db.post.delete({ where: { id: postId } });
  revalidatePath('/posts');
}`,
    ['A Server Action is a **public HTTP endpoint**. Hiding the button is not access control: anyone can call the action with any id. There is no check of who is calling or whether the post is theirs, and the input is not validated.'],
    `'use server';
export async function deletePost(postId: string) {
  const session = await auth();
  if (!session) throw new Error('unauthenticated');
  const id = z.string().uuid().parse(postId);
  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.authorId !== session.user.id) throw new Error('forbidden');   // check the object
  await db.post.delete({ where: { id } });
  revalidatePath('/posts');
}`,
    'Every Server Action and route handler authenticates, validates its input, and checks that this user may act on this specific record.'),
];

// ───────────────────────────────────────────── 6. CSS
export const css = [
  BUG('A dropdown with z-index 9999 still hides behind the header',
    'The menu is positioned and has a huge z-index, but the page header covers it.',
    `.header { position: sticky; top: 0; z-index: 10; }
.card   { transform: translateZ(0); }            /* the menu lives inside .card */
.menu   { position: absolute; z-index: 9999; }`,
    ['`z-index` only competes **within a stacking context**. `transform` (and `opacity` below 1, `filter`, `position` with a z-index, `isolation`) creates a new one on `.card`. The menu’s 9999 is ranked inside the card; the card itself has no z-index and sits below the header’s 10.'],
    `/* render the menu outside the card (a portal to <body>), or raise the context itself */
.card { position: relative; z-index: 20; }
/* or stop creating a stacking context if the transform is not needed */`,
    'A z-index is local to its stacking context. I find which ancestor created the context, and usually render overlays in a portal.'),
  BUG('Text will not truncate inside a flex row',
    'A long file name pushes the row wider than its container instead of showing an ellipsis.',
    `<div class="row">
  <img class="icon" src="file.svg" alt="">
  <div class="info">
    <div class="name">a-very-long-file-name-that-does-not-fit.pdf</div>
  </div>
</div>

.row  { display: flex; width: 200px; }
.info { flex: 1; }
.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`,
    ['The truncation styles are on `.name`, but the **flex item** is `.info`. A flex item has `min-width: auto` by default, which means it will not shrink below the width of its content, so `.info` grows to fit the whole file name and `.name` never has less room than it needs. (If the flex item itself has `overflow: hidden`, its automatic minimum is already zero, which is why the bug only shows up with a wrapper in between.)'],
    `.info { flex: 1; min-width: 0; }   /* now the item may shrink, and .name can overflow and truncate */`,
    'Flex and grid children do not shrink below their content unless `min-width` is 0. It is the usual cause of overflow in a row.'),
  BUG('A full-height screen is cut off on phones',
    'The button at the bottom of a “100% height” page is hidden behind the mobile browser’s toolbar.',
    `.screen { height: 100vh; display: flex; flex-direction: column; }
.footer { margin-top: auto; }`,
    ['On mobile browsers `100vh` is the height with the toolbars **retracted**, so with them visible the element is taller than what you can see.'],
    `.screen { min-height: 100vh; min-height: 100dvh; }   /* dvh tracks the visible viewport; vh is the fallback */`),
  BUG('A sticky table header scrolls away',
    '`position: sticky` is set, but the header moves off screen with the rows.',
    `.table-wrap { overflow: hidden; }
thead th   { position: sticky; }`,
    ['Two things. Sticky needs an **offset** (`top: 0`) to know where to stick. And it sticks within its nearest **scrolling ancestor**: any ancestor with `overflow` other than `visible` becomes that container, so `overflow: hidden` on the wrapper means it sticks inside a box that does not scroll.'],
    `.table-wrap { overflow: visible; }        /* or make this the scroll container on purpose: overflow: auto; max-height: … */
thead th    { position: sticky; top: 0; background: var(--surface); }`,
    'Sticky needs a `top` value and no clipping ancestor between it and the thing that scrolls.'),
];
