// Bug Clinic, part A: the method, 15 JavaScript bugs and 15 React bugs.
// Each bug card shows the symptom and the code; the diagnosis and the fix sit inside a closed
// <details>, so you can try first in both the list view and the flashcards.
import { P, L, N, T, C, K, md } from './cc-kit.mjs';

// title: the SYMPTOM (never the answer). why: one or more paragraphs (cheatsheet markup).
export const BUG = (title, symptom, buggy, why, fixed, say) => ({
  q: 'Bug: ' + md(title),
  a: '<p>' + md(symptom) + '</p>' + C(buggy, 'Find the bug') +
    '<details class="reveal"><summary>Show the bug and the fix</summary>' +
    [].concat(why).map((x) => '<p>' + md(x) + '</p>').join('') + C(fixed, 'Fix') +
    (say ? '<div class="callout"><strong>Say it like this:</strong> ' + md(say) + '</div>' : '') + '</details>',
});

// ───────────────────────────────────────────── 0. method
export const method = [
  K('How do you approach a “find the bug” question in an interview?',
    P('These questions test whether you can **reason about code out loud**. Spotting the bug in silence earns less than a clear walk-through that arrives a little later.'),
    N('**Say what the code is meant to do.** One sentence.', '**Trace it** with a concrete input, line by line, saying the values as they change.', '**Name the bug and the mechanism**: not “this is wrong” but “this closure captured the first render’s value”.', '**Fix it** with the smallest change, and say why that works.', '**Say how you would stop it recurring**: a lint rule, a type, a test.'),
    T(['If you are stuck, check', 'Typical culprit'], [
      ['What does this value refer to **at the time it runs**?', 'Closures, `this`, stale state'],
      ['Is something **mutated** that should be copied?', 'State updates, shared objects, `sort`'],
      ['Is async work **awaited**, and can it finish **out of order**?', 'Missing `await`, race conditions'],
      ['What happens on the **second** render, call or request?', 'Effects, keys, caches, module-level state'],
      ['What about **empty, zero, null**?', '`||`, `&&`, truthiness checks'],
      ['Is anything **never cleaned up**?', 'Listeners, timers, subscriptions'],
    ]),
    P('Every card here hides the answer behind “Show the bug and the fix”. Read the code, say your diagnosis out loud, then open it.'),
  ),
];

// ───────────────────────────────────────────── 1. JavaScript
export const js = [
  BUG('Three timers all log the same number',
    'This should log 0, 1, 2. It logs 3, 3, 3.',
    `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}`,
    ['`var` is function-scoped, so there is **one** `i` shared by all three callbacks. By the time the timers fire the loop has finished and `i` is 3. A closure captures the variable, not its value at that moment.'],
    `for (let i = 0; i < 3; i++) {          // let creates a new binding per iteration
  setTimeout(() => console.log(i), 100);   // 0, 1, 2
}`,
    'Each callback closes over the same variable. With `let`, every iteration gets its own.'),
  BUG('A method works when called directly but crashes as a callback',
    '`user.greet()` works. Passing it to a timer or an event handler throws “Cannot read properties of undefined”.',
    `const user = {
  name: 'Ada',
  greet() { console.log('Hi ' + this.name); },
};
setTimeout(user.greet, 100);
button.addEventListener('click', user.greet);`,
    ['`this` is decided by **how a function is called**, not where it is defined. `user.greet` passes the bare function; the timer calls it with no receiver, so `this` is `undefined` (in modules and strict mode), and in the click handler `this` is the button.'],
    `setTimeout(() => user.greet(), 100);                 // call it as a method
button.addEventListener('click', user.greet.bind(user));   // or bind the receiver`,
    '`this` comes from the call site. Detach a method from its object and it loses its receiver, so I wrap it in an arrow function or bind it.'),
  BUG('“Done” is logged before anything is saved',
    'The function should save every user and then report. It reports immediately, and errors from `save` are never caught.',
    `async function saveAll(users) {
  users.forEach(async (user) => {
    await save(user);
  });
  console.log('Done');
}`,
    ['`forEach` ignores what its callback returns. Each async callback returns a promise that nobody awaits, so `saveAll` carries straight on to the log, and a rejection becomes an unhandled promise rejection.'],
    `async function saveAll(users) {
  for (const user of users) await save(user);        // one at a time, in order
  // or, in parallel:  await Promise.all(users.map((user) => save(user)));
  console.log('Done');
}`,
    '`forEach` does not wait for async callbacks. I use `for…of` for sequential work or `Promise.all` with `map` for parallel.'),
  BUG('A doubled array comes back full of undefined',
    'Expected `[2, 4, 6]`, got `[undefined, undefined, undefined]`.',
    `const doubled = [1, 2, 3].map((n) => {
  n * 2;
});`,
    ['An arrow function with **braces** has a block body and needs an explicit `return`. Without braces the expression is returned implicitly. The same slip in a `.then()` breaks a promise chain: the next step receives `undefined`.'],
    `const doubled = [1, 2, 3].map((n) => n * 2);
// returning an object literal needs parentheses:  .map((n) => ({ value: n }))`),
  BUG('A cart total fails an equality check',
    'Two items at 0.10 and 0.20 should total 0.30, but the comparison is false and the receipt shows 0.30000000000000004.',
    `const total = 0.1 + 0.2;
if (total === 0.3) applyFreeShipping();`,
    ['JavaScript numbers are binary floating point. 0.1 and 0.2 have no exact binary form, so their sum is not exactly 0.3. This is true in almost every language; it matters most for money.'],
    `// money: integers in the smallest unit
const totalCents = 10 + 20;                       // 30
const display = (totalCents / 100).toFixed(2);    // "0.30"

// other decimals: compare with a tolerance
const equal = Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;`,
    'Never store money as a float. I keep integer cents and format at the edge.'),
  BUG('A quantity of zero turns into ten',
    'When the user sets the quantity to 0, the form shows 10 again. An empty string for a nickname is also replaced.',
    `function normalise(input) {
  return {
    quantity: input.quantity || 10,
    nickname: input.nickname || 'Anonymous',
  };
}`,
    ['`||` falls back for **any falsy value**: `0`, `\'\'`, `false`, `NaN`, `null`, `undefined`. Zero is a valid quantity here. `??` falls back only for `null` and `undefined`.'],
    `function normalise(input) {
  return {
    quantity: input.quantity ?? 10,
    nickname: input.nickname ?? 'Anonymous',
  };
}`,
    'I use `??` for defaults, because zero and the empty string are real values.'),
  BUG('Numbers come out in the wrong order after sorting',
    '`[10, 9, 1, 100]` sorts to `[1, 10, 100, 9]`. The original list on screen has changed order too.',
    `const prices = [10, 9, 1, 100];
const sorted = prices.sort();`,
    ['Two bugs. Without a comparator `sort` converts items to **strings** and compares them, so "10" comes before "9". And `sort` **mutates** the array in place and returns the same array, so `prices` is reordered too.'],
    `const sorted = prices.toSorted((a, b) => a - b);    // new array, numeric order
// older runtimes:  [...prices].sort((a, b) => a - b)`,
    'Always pass a comparator for numbers, and copy first, because `sort` mutates.'),
  BUG('Editing a copy changes the original',
    'The form edits a copy of the user so that Cancel can discard changes. After editing the city and cancelling, the original shows the new city.',
    `const original = { name: 'Ada', address: { city: 'Paris' } };
const draft = { ...original };
draft.address.city = 'Rome';
console.log(original.address.city);   // "Rome"`,
    ['Spread (and `Object.assign`) make a **shallow** copy: top-level properties are copied, but `address` is the same object in both. Changing it through `draft` changes it for `original`.'],
    `const draft = structuredClone(original);                 // deep copy
// or copy each level you change:
const draft2 = { ...original, address: { ...original.address, city: 'Rome' } };`,
    'Spread copies one level. For nested data I copy each level I touch, or use `structuredClone`.'),
  BUG('An event listener cannot be removed',
    'After the panel closes, the resize handler keeps running. Opening it five times runs the handler five times per resize.',
    `function open() {
  window.addEventListener('resize', () => layout());
}
function close() {
  window.removeEventListener('resize', () => layout());
}`,
    ['`removeEventListener` needs the **same function reference** that was added. Each arrow function expression creates a new function, so the removal matches nothing and the listeners pile up: a memory leak and duplicated work.'],
    `const onResize = () => layout();
function open() { window.addEventListener('resize', onResize); }
function close() { window.removeEventListener('resize', onResize); }

// or cancel a group of listeners at once:
const controller = new AbortController();
window.addEventListener('resize', onResize, { signal: controller.signal });
controller.abort();`),
  BUG('A check for “is it an object” crashes on null',
    'The function should read a nested setting when `config` is an object. It throws when `config` is `null`, and treats arrays as plain objects.',
    `function theme(config) {
  if (typeof config === 'object') {
    return config.ui.theme;
  }
  return 'light';
}`,
    ['`typeof null` is `"object"` (a historical quirk), and `typeof []` is `"object"` too. So `null` passes the check and `config.ui` throws. A missing `ui` would throw as well.'],
    `function theme(config) {
  if (config !== null && typeof config === 'object' && !Array.isArray(config)) {
    return config.ui?.theme ?? 'light';
  }
  return 'light';
}`),
  BUG('A try/catch does not catch the error',
    'When the request fails the catch block never runs, and the process logs an unhandled promise rejection.',
    `async function load() {
  try {
    fetchData();              // returns a promise
    render('loaded');
  } catch (err) {
    render('failed');
  }
}`,
    ['`try/catch` only catches a rejection if the promise is **awaited** inside the `try`. Here the promise is created and dropped: `load` moves on, renders “loaded”, and the failure arrives later with nobody listening. The same happens with `return fetchData()` inside a `try`: use `return await` if this function should handle the error.'],
    `async function load() {
  try {
    await fetchData();
    render('loaded');
  } catch (err) {
    render('failed');
  }
}`,
    'An un-awaited promise escapes the `try`. The no-floating-promises lint rule catches this.'),
  BUG('Converting strings to numbers gives NaN',
    'Expected `[1, 2, 3]`, got `[1, NaN, NaN]`.',
    `const ids = ['1', '2', '3'].map(parseInt);`,
    ['`map` calls its callback with **three** arguments: value, index, array. `parseInt` takes a second argument, the radix. So the calls are `parseInt("1", 0)`, `parseInt("2", 1)` and `parseInt("3", 2)`: radix 1 is invalid and "3" is not a binary digit.'],
    `const ids = ['1', '2', '3'].map(Number);
// or be explicit:  .map((s) => parseInt(s, 10))`,
    'Passing a function straight to `map` hands it the index too. I wrap it when its extra parameters mean something.'),
  BUG('Search results sometimes show an older query',
    'Typing “react” quickly sometimes ends with the results for “rea”.',
    `input.addEventListener('input', async (e) => {
  const res = await fetch('/search?q=' + encodeURIComponent(e.target.value));
  renderResults(await res.json());
});`,
    ['A **race condition**. Each keystroke starts a request, and responses can arrive in any order. If the reply for “rea” is slower than the one for “react”, it lands last and overwrites the newer results.'],
    `let controller;
input.addEventListener('input', async (e) => {
  controller?.abort();                              // cancel the request that is now out of date
  controller = new AbortController();
  try {
    const res = await fetch('/search?q=' + encodeURIComponent(e.target.value), { signal: controller.signal });
    renderResults(await res.json());
  } catch (err) {
    if (err.name !== 'AbortError') throw err;
  }
});`,
    'Whenever requests can overlap, the last response is not always the latest request. I cancel the previous one, or ignore any reply that is not for the current query. A debounce reduces the traffic but does not remove the race.'),
  BUG('Changing one row of a grid changes every row',
    'Marking one cell marks the same cell in all three rows.',
    `const grid = Array(3).fill([]);
grid[0].push('X');
console.log(grid);   // [['X'], ['X'], ['X']]`,
    ['`fill` puts the **same array object** into every slot. There is one inner array with three references to it. The same trap applies to `fill({})`.'],
    `const grid = Array.from({ length: 3 }, () => []);   // a new array per row
grid[0].push('X');                                  // [['X'], [], []]`),
  BUG('A date shows as the previous day for some users',
    'A booking for 1 March shows as 28 February for users in the Americas, and correctly in Europe and Asia.',
    `const day = new Date('2026-03-01');
label.textContent = day.toLocaleDateString();`,
    ['A date-only ISO string is parsed as **midnight UTC**. Displayed in a timezone behind UTC, that instant is still the evening of the day before. With a time and no offset (`2026-03-01T00:00:00`) the string is parsed as **local** time instead.'],
    `// a calendar date with no time: build it in local time, or keep it as a string
const [y, m, d] = '2026-03-01'.split('-').map(Number);
const day = new Date(y, m - 1, d);

// or format the UTC instant in UTC
new Date('2026-03-01').toLocaleDateString('en-US', { timeZone: 'UTC' });`,
    'A date and a moment in time are different things. I keep calendar dates as dates and only use instants for real timestamps, stored in UTC and formatted at the edge.'),
];

// ───────────────────────────────────────────── 2. React
export const react = [
  BUG('Deleting a row leaves its text in the wrong row',
    'Each row has a text input. Type in the first row, delete that row, and the typed text now appears in the row that moved up.',
    `function TodoList({ todos, onDelete }) {
  return todos.map((todo, index) => (
    <li key={index}>
      {todo.title} <input placeholder="note" />
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  ));
}`,
    ['The key tells React which element is which between renders. With the **index** as the key, after a delete the item that moved up now has the key the deleted one had, so React keeps that DOM node and its state (the uncontrolled input’s text, focus) and just updates the title. The same happens when a list is sorted, filtered or prepended to.'],
    `<li key={todo.id}>`,
    'Keys must identify the item, not its position. I use a stable id from the data; the index is only safe for a static list that never reorders.'),
  BUG('A counter stops at 1',
    'The counter should go up every second. It goes from 0 to 1 and stays there.',
    `function Timer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{count}</p>;
}`,
    ['A **stale closure**. The effect runs once (empty dependency array), so its callback closes over `count` from the first render, which is 0. Every tick calls `setCount(0 + 1)`.'],
    `useEffect(() => {
  const id = setInterval(() => setCount((c) => c + 1), 1000);   // read the latest value
  return () => clearInterval(id);
}, []);`,
    'The effect captured the first render’s state. An updater function reads the current value, so the effect does not need `count` at all.'),
  BUG('The profile does not change when another user is selected',
    'Clicking a different user changes the `userId` prop, but the page keeps showing the first user.',
    `function Profile({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/users/' + userId).then((r) => r.json()).then(setUser);
  }, []);
  return <h1>{user?.name}</h1>;
}`,
    ['The effect uses `userId` but does not list it as a dependency, so it runs only on mount. React has no reason to re-run it when the prop changes.'],
    `useEffect(() => {
  fetch('/api/users/' + userId).then((r) => r.json()).then(setUser);
}, [userId]);   // every value the effect reads belongs here`,
    'Everything an effect reads from props or state goes in the dependency array. The exhaustive-deps lint rule finds these.'),
  BUG('The component re-renders forever',
    'The browser tab freezes and React reports too many re-renders, or the network tab shows the same request in a loop.',
    `function Products({ category }) {
  const [items, setItems] = useState([]);
  const filters = { category, inStock: true };
  useEffect(() => {
    fetchProducts(filters).then(setItems);
  }, [filters]);
  return <List items={items} />;
}`,
    ['`filters` is a **new object on every render**. Dependencies are compared by reference, so the effect sees a change each time: fetch, `setItems`, re-render, new `filters`, fetch again.'],
    `useEffect(() => {
  fetchProducts({ category, inStock: true }).then(setItems);
}, [category]);   // depend on the primitive, build the object inside`,
    'Objects and functions created during render are new every time. I depend on the primitives inside them, or memoise the object.'),
  BUG('Adding an item does not update the list',
    'The handler runs and the array grows, but nothing new appears on screen.',
    `function Cart() {
  const [items, setItems] = useState([]);
  const add = (item) => {
    items.push(item);
    setItems(items);
  };
  return <ItemList items={items} onAdd={add} />;
}`,
    ['State was **mutated**. `setItems(items)` passes the same array reference React already has, so it sees no change and skips the render. Mutating state also breaks memoised children and anything that compares previous and next values.'],
    `const add = (item) => setItems((prev) => [...prev, item]);   // a new array`,
    'React compares by reference. I treat state as immutable and create a new array or object for every change.'),
  BUG('An edit form keeps showing the previous record',
    'Selecting another user in the list changes the `user` prop, but the name field still shows the first user’s name.',
    `function EditUser({ user }) {
  const [name, setName] = useState(user.name);
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}`,
    ['The argument to `useState` is only the **initial** value, used on the first render. When the prop changes, the state keeps what it had. Copying props into state creates two sources of truth.'],
    `// reset the form when the record changes: a new key gives a new component instance
<EditUser key={user.id} user={user} />

// and if the value is not edited at all, do not copy it: use the prop directly`,
    'Initial state is read once. To reset state when the identity changes I change the key; I avoid mirroring props in state.'),
  BUG('The wrong user’s data flashes up after switching quickly',
    'Click user A, then quickly user B. Sometimes A’s details replace B’s a moment later.',
    `useEffect(() => {
  fetch('/api/users/' + userId)
    .then((r) => r.json())
    .then((data) => setUser(data));
}, [userId]);`,
    ['A race between two requests. If A’s response arrives after B’s, it calls `setUser` last and wins. The effect has no cleanup, so the out-of-date request is never cancelled or ignored.'],
    `useEffect(() => {
  const controller = new AbortController();
  fetch('/api/users/' + userId, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((err) => { if (err.name !== 'AbortError') throw err; });
  return () => controller.abort();     // runs before the next effect and on unmount
}, [userId]);`,
    'Every effect that starts async work needs a cleanup that cancels or ignores it. A data library such as TanStack Query handles this for me.'),
  BUG('A handler keeps firing after the component is gone',
    'After navigating away and back several times, each scroll triggers the handler many times, and memory grows.',
    `useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  const id = setInterval(refresh, 5000);
}, []);`,
    ['The effect subscribes and starts a timer but returns **no cleanup**. Each mount adds another listener and another interval, and none are ever removed. Strict Mode’s double mount in development makes this visible straight away.'],
    `useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  const id = setInterval(refresh, 5000);
  return () => {
    window.removeEventListener('scroll', handleScroll);
    clearInterval(id);
  };
}, []);`),
  BUG('A stray 0 appears on the page',
    'When the cart is empty, the page shows the digit 0 where the list would be.',
    `function Cart({ items }) {
  return <div>{items.length && <ItemList items={items} />}</div>;
}`,
    ['`&&` returns its left side when that is falsy. `items.length` is `0`, and React **renders the number 0** (it skips `false`, `null` and `undefined`, not `0` or `NaN`).'],
    `{items.length > 0 && <ItemList items={items} />}
// or:  {items.length ? <ItemList items={items} /> : null}`,
    'With `&&` the left side must be a real boolean, or a number can leak into the output.'),
  BUG('A click handler runs as soon as the page renders',
    'The delete request fires for every row when the list renders, before anyone clicks.',
    `<button onClick={handleDelete(item.id)}>Delete</button>`,
    ['`handleDelete(item.id)` **calls** the function during render and passes its return value as the handler. If the function sets state, it also causes a render loop.'],
    `<button onClick={() => handleDelete(item.id)}>Delete</button>`,
    '`onClick` needs a function, not the result of calling one.'),
  BUG('Clicking once should add 3, but adds 1',
    'The handler calls `setCount` three times, yet the count goes up by one. The log after it shows the old value.',
    `const [count, setCount] = useState(0);
const addThree = () => {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  console.log(count);
};`,
    ['State is a **snapshot per render**. `count` is 0 for the whole handler, so each call is `setCount(1)`. Updates are batched and applied on the next render, which is also why the log shows 0.'],
    `const addThree = () => {
  setCount((c) => c + 1);
  setCount((c) => c + 1);
  setCount((c) => c + 1);   // each updater receives the result of the one before
};`,
    'Setting state does not change the variable in the running handler. When the next value depends on the previous one I pass an updater function.'),
  BUG('“Rendered more hooks than during the previous render”',
    'The component works for a signed-out user and crashes with this error once `user` loads. Signing out again crashes with “Rendered fewer hooks than expected”.',
    `function Dashboard({ user }) {
  const [tab, setTab] = useState('overview');
  if (!user) return <SignIn />;
  useEffect(() => { track('dashboard', user.id); }, [user.id]);
  return <Tabs value={tab} onChange={setTab} />;
}`,
    ['React identifies hooks by the **order they are called in**, and expects the same hooks on every render. Signed out, this component calls one hook and returns; with a user it calls two. The count changed between renders, so React cannot match the effect to its stored state. Hooks may not be called conditionally, in loops, or after an early return.'],
    `function Dashboard({ user }) {
  const [tab, setTab] = useState('overview');
  useEffect(() => { if (user) track('dashboard', user.id); }, [user]);
  if (!user) return <SignIn />;                 // early return AFTER the hooks
  return <Tabs value={tab} onChange={setTab} />;
}`,
    'Hooks go at the top level, in the same order every render. Conditions go inside the hook, and early returns come after all of them.'),
  BUG('An input loses focus after every keystroke',
    'Typing one character in the field drops the cursor out of it. The input’s own state resets on each render of the parent.',
    `function Form() {
  const [value, setValue] = useState('');
  function Field() {
    return <input value={value} onChange={(e) => setValue(e.target.value)} />;
  }
  return <Field />;
}`,
    ['`Field` is **defined inside** `Form`, so every render of `Form` creates a new function. React sees a different component type each time, unmounts the old one and mounts a new one, destroying its DOM node, focus and state.'],
    `function Field({ value, onChange }) {            // defined once, at module level
  return <input value={value} onChange={onChange} />;
}
function Form() {
  const [value, setValue] = useState('');
  return <Field value={value} onChange={(e) => setValue(e.target.value)} />;
}`,
    'A component defined during render is a new type on every render, so it remounts. Components belong at the top level of a module.'),
  BUG('“A component is changing an uncontrolled input to be controlled”',
    'The console warns on the first keystroke, and the field cannot be cleared properly.',
    `function NameField() {
  const [name, setName] = useState();
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}`,
    ['`value={undefined}` means the input is **uncontrolled** (the DOM owns the value). Once `name` becomes a string, the input switches to controlled, and React warns. The same warning appears when `value` comes from data that has not loaded yet.'],
    `const [name, setName] = useState('');             // a string from the first render
// for loaded data:  <input value={user.name ?? ''} ... />`,
    'A controlled input needs a defined value on every render, so I initialise to an empty string.'),
  BUG('“Hydration failed because the server rendered HTML didn’t match the client”',
    'The page works, but React logs a hydration error and re-renders the whole section on load.',
    `function Greeting() {
  const hour = new Date().getHours();
  const theme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light';
  return <p className={theme}>{hour < 12 ? 'Good morning' : 'Hello'} at {new Date().toLocaleTimeString()}</p>;
}`,
    ['The server and the browser must produce **the same HTML** for the first render. Here the output depends on the clock, the timezone and `localStorage`, which differ between the two. `typeof window` checks make it worse: they are exactly a server/client difference.'],
    `function Greeting() {
  const [now, setNow] = useState(null);                 // same on server and first client render
  useEffect(() => { setNow(new Date()); }, []);         // browser-only values after hydration
  if (!now) return <p>Hello</p>;
  return <p>{now.getHours() < 12 ? 'Good morning' : 'Hello'} at {now.toLocaleTimeString()}</p>;
}`,
    'The first client render has to match the server. Anything that depends on the browser, the time or randomness moves into an effect, or the server is given the same input.'),
];
