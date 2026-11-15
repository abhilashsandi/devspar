// Predict-the-output cards for the JavaScript guide (see add-predict-cards.mjs and check-predict.mjs).
// Every `expect` was captured by really running the snippet: `node scripts/study/check-predict.mjs --print <n>`.
// Snippets are deterministic, log only strings, numbers, booleans, null, undefined, arrays and plain objects,
// use timers of at most 300 ms, and avoid anything that reads the top-level `this` or an engine's error text.
import { P, SAY, PREDICT } from './cc-kit.mjs';

export const predict = [
  // ---- A. The event loop
  PREDICT('synchronous code, a timer and a promise',
`console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
`A
D
C
B`,
    P('The script itself is one macrotask, so `A` and `D` print first. Then the engine empties the microtask queue, which holds the promise callback, so `C` prints. Only then does the next macrotask, the zero-delay timer, run and print `B`.'),
    SAY('Synchronous code first, then promise callbacks, then timers, however short the timer is.')),

  PREDICT('a timer that queues a microtask, beside a second timer',
`setTimeout(() => {
  console.log('timer 1');
  Promise.resolve().then(() => console.log('microtask in timer 1'));
}, 0);
setTimeout(() => console.log('timer 2'), 0);`,
`timer 1
microtask in timer 1
timer 2`,
    P('Each timer callback is its own macrotask. After the first one finishes, the engine drains the microtask queue **before** it takes the next macrotask, so the promise callback created inside timer 1 runs before timer 2.'),
    SAY('Microtasks are drained after every macrotask, not once at the end of the script.')),

  PREDICT('an `async` function before and after its first `await`',
`async function f() {
  console.log('f start');
  await null;
  console.log('f after await');
}
console.log('before');
f();
console.log('after');`,
`before
f start
after
f after await`,
    P('An `async` function runs synchronously until its first `await`, so `f start` prints during the call to `f()`. The `await` hands the rest of the function to the microtask queue and returns control to the caller, which prints `after`. Then the continuation runs.'),
    SAY('Everything before the first await is synchronous; everything after it is a microtask.')),

  PREDICT('a promise executor and its `then`',
`const p = new Promise((resolve) => {
  console.log('executor');
  resolve('done');
  console.log('after resolve');
});
p.then((v) => console.log(v));
console.log('end');`,
`executor
after resolve
end
done`,
    P('The function you pass to `new Promise` runs immediately and synchronously, and `resolve` does not stop it, so `after resolve` still prints. The `then` callback is always asynchronous, even on an already-resolved promise, so `done` comes after `end`.'),
    SAY('The executor is synchronous; the then callback never is.')),

  PREDICT('two timers with a promise chain between them',
`setTimeout(() => console.log('timeout 10'), 10);
setTimeout(() => console.log('timeout 0'), 0);
Promise.resolve()
  .then(() => console.log('then 1'))
  .then(() => console.log('then 2'));
console.log('sync');`,
`sync
then 1
then 2
timeout 0
timeout 10`,
    P('`sync` is part of the script. Both `then` callbacks are microtasks, and the second is queued as soon as the first finishes, so both run before any timer. The timers then fire in order of their delays.'),
    SAY('A whole promise chain finishes before the next timer gets a turn.')),

  PREDICT('`queueMicrotask` against a two-step `then` chain',
`queueMicrotask(() => console.log('microtask A'));
Promise.resolve()
  .then(() => console.log('then 1'))
  .then(() => console.log('then 2'));
queueMicrotask(() => console.log('microtask B'));`,
`microtask A
then 1
microtask B
then 2`,
    P('The microtask queue is first in, first out. `A`, `then 1` and `B` are queued while the script runs. `then 2` is only queued once `then 1` has finished, so it goes to the back of the queue, behind `B`.'),
    SAY('Each link of a promise chain is queued only when the one before it is done.')),

  // ---- B. Scope and hoisting
  PREDICT('`var` in a loop with a timer',
`for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
`3
3
3`,
    P('`var` is function-scoped, so there is **one** `i` shared by all three callbacks. The loop has finished and `i` is 3 by the time the timers run. A closure captures the variable, not its value at that moment.'),
    SAY('With var every callback shares one variable; with let each iteration gets its own.')),

  PREDICT('`let` in a loop with a timer',
`for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
`0
1
2`,
    P('`let` creates a fresh binding for **each iteration** of the loop, so each callback closes over its own `i`. The timers fire in the order they were created, and each prints the value its iteration had.'),
    SAY('let in a for loop gives every iteration its own copy of the variable.')),

  PREDICT('reading a `var` and a `let` before their lines',
`console.log(typeof a);
var a = 1;
try {
  console.log(b);
} catch (e) {
  console.log(e.name);
}
let b = 2;`,
`undefined
ReferenceError`,
    P('Both declarations are hoisted, but differently. A `var` exists from the top of its scope and starts as `undefined`. A `let` exists too, but is in the temporal dead zone until its line runs, so reading it throws a `ReferenceError`.'),
    SAY('var is hoisted and undefined; let is hoisted but unusable until its declaration.')),

  PREDICT('calling a function declaration and a function expression early',
`console.log(typeof declared);
console.log(typeof expressed);
function declared() {}
var expressed = function () {};`,
`function
undefined`,
    P('A function **declaration** is hoisted with its body, so it can be used before its line. A function **expression** assigned to a `var` only hoists the variable, which is `undefined` until the assignment runs, so calling it early would throw.'),
    SAY('Declarations are hoisted whole; expressions are only as early as their assignment.')),

  PREDICT('two counters made by one factory',
`function makeCounter() {
  let n = 0;
  return () => ++n;
}
const a = makeCounter();
const b = makeCounter();
console.log(a(), a(), b(), a());`,
`1 2 1 3`,
    P('Every call to `makeCounter` creates a new `n`, and the returned function closes over that one. So `a` and `b` count independently: `a` gives 1, 2, then 3, while `b` has its own 1. `console.log` with several arguments prints them separated by spaces.'),
    SAY('A closure keeps its own copy of the variables from the call that created it.')),

  // ---- C. this
  PREDICT('a method copied into a variable',
`const user = {
  name: 'Ada',
  hello() {
    return this.name;
  },
};
const hello = user.hello;
try {
  console.log(hello());
} catch (e) {
  console.log(e.name);
}
console.log(user.hello());`,
`TypeError
Ada`,
    P('`this` is decided by **how a function is called**, not where it was written. `user.hello()` has `user` before the dot, so `this` is `user`. Calling the copied `hello()` has no object, so in strict mode `this` is `undefined`, and reading `.name` from it throws a `TypeError`.'),
    SAY('this comes from the call site: the object before the dot, or nothing at all.')),

  PREDICT('an arrow function and a regular function inside a method',
`const obj = {
  name: 'obj',
  arrow() {
    return [1].map(() => this.name)[0];
  },
  regular() {
    try {
      return [1].map(function () { return this.name; })[0];
    } catch (e) {
      return e.name;
    }
  },
};
console.log(obj.arrow());
console.log(obj.regular());`,
`obj
TypeError`,
    P('An arrow function has no `this` of its own: it uses the `this` of the code around it, here the method, so it sees `obj`. The regular function passed to `map` is called with no object, so in strict mode its `this` is `undefined` and `this.name` throws.'),
    SAY('Arrow functions inherit this; regular functions get it from the call.')),

  PREDICT('`bind`, then `call` with another object',
`function who() {
  return this.name;
}
const a = { name: 'a' };
const b = { name: 'b' };
const bound = who.bind(a);
console.log(bound());
console.log(bound.call(b));
console.log(who.call(b));`,
`a
a
b`,
    P('`bind` returns a new function with `this` fixed to `a` for good. Calling that function with `call(b)` cannot change it, so it still returns `a`. The original `who` has no fixed `this`, so `who.call(b)` uses `b`.'),
    SAY('bind fixes this permanently; call and apply only set it for that one call.')),

  PREDICT('a class method passed as a callback',
`class Button {
  label = 'ok';
  plain() {
    return this.label;
  }
  arrow = () => this.label;
}
const b = new Button();
const run = (fn) => {
  try {
    return fn();
  } catch (e) {
    return e.name;
  }
};
console.log(run(b.plain));
console.log(run(b.arrow));`,
`TypeError
ok`,
    P('Passing `b.plain` hands over the bare function, so `this` is lost when `run` calls it, and class code is always strict, giving `undefined` and a `TypeError`. The arrow function stored as a class field was created inside the constructor, so it keeps `this` pointing at the instance.'),
    SAY('To pass a method as a callback, bind it or use an arrow-function field.')),

  // ---- D. Coercion and equality
  PREDICT('plus and minus with strings',
`console.log('5' + 2);
console.log('5' - 2);
console.log([] + {});
console.log([1, 2] + [3]);`,
`52
3
[object Object]
1,23`,
    P('`+` joins as soon as either side is a string, so `52`. `-` has no string meaning, so both sides become numbers and give `3`. Objects and arrays are turned into strings before `+`: `[]` becomes an empty string and `{}` becomes `[object Object]`, and `[1, 2]` becomes `1,2`.'),
    SAY('Plus prefers strings; minus always means numbers.')),

  PREDICT('loose equality, `NaN` and `Object.is`',
`console.log(null == undefined);
console.log(null == 0);
console.log('' == 0);
console.log(NaN === NaN);
console.log(Object.is(NaN, NaN));`,
`true
false
true
false
true`,
    P('`null` and `undefined` are loosely equal only to each other, so `null == 0` is false. An empty string converts to `0`, so `\'\' == 0` is true. `NaN` is not equal to anything, itself included, even with `===`; `Object.is` treats `NaN` as the same value.'),
    SAY('Prefer `===`; use `Number.isNaN` or `Object.is` to test for `NaN`.')),

  PREDICT('`typeof` on awkward values',
`console.log(typeof null);
console.log(typeof []);
console.log(typeof function () {});
console.log(typeof undefined);
console.log(typeof NaN);`,
`object
object
function
undefined
number`,
    P('`typeof null` is `object`, a mistake from the first version of the language that can never be fixed. Arrays are objects, so use `Array.isArray` to tell them apart. Functions report `function`, and `NaN` is a number, the value you get from a failed numeric operation.'),
    SAY('typeof null is object; check arrays with Array.isArray.')),

  PREDICT('the default `sort` order',
`console.log([10, 9, 1].sort());
console.log([10, 9, 1].sort((a, b) => a - b));`,
`[ 1, 10, 9 ]
[ 1, 9, 10 ]`,
    P('Without a comparison function, `sort` turns the items into **strings** and compares them as text, so `10` comes before `9` because `"1"` sorts before `"9"`. A comparison function returning `a - b` sorts the numbers by value.'),
    SAY('sort is alphabetical by default; pass a comparator for numbers.')),

  // ---- E. Promises and errors
  PREDICT('a `then` that throws, and a `catch` that returns',
`Promise.resolve(1)
  .then((v) => {
    console.log('a', v);
    throw new Error('boom');
  })
  .then(() => console.log('skipped'))
  .catch((e) => {
    console.log('caught', e.message);
    return 'recovered';
  })
  .then((v) => console.log('after', v));`,
`a 1
caught boom
after recovered`,
    P('A throw inside a `then` rejects the promise it returns, and rejections skip every `then` until a `catch`. The `catch` handles it, and because it returns a value, the chain is fulfilled again with that value, so the last `then` runs with `recovered`.'),
    SAY('A catch that returns a value turns the chain back into a success.')),

  PREDICT('`Promise.all` against `Promise.allSettled`',
`const ok = (v) => new Promise((r) => setTimeout(() => r(v), 10));
const bad = () => new Promise((_, rej) => setTimeout(() => rej(new Error('no')), 20));
Promise.all([ok('a'), bad(), ok('c')]).then(
  (v) => console.log('all', v),
  (e) => console.log('all rejected', e.message),
);
Promise.allSettled([ok('a'), bad(), ok('c')]).then((r) =>
  console.log('settled', r.map((x) => x.status)),
);`,
`all rejected no
settled [ 'fulfilled', 'rejected', 'fulfilled' ]`,
    P('`Promise.all` rejects as soon as one input rejects and throws the other results away, so only the error is reported. `Promise.allSettled` waits for every input and reports a status for each, so the two good results are not lost.'),
    SAY('all fails fast; allSettled always tells you what happened to every promise.')),

  PREDICT('`try` and `catch` around an async call',
`async function fail() {
  throw new Error('x');
}
async function main() {
  try {
    fail();
    console.log('no await, no catch');
  } catch (e) {
    console.log('caught 1');
  }
  try {
    await fail();
  } catch (e) {
    console.log('caught 2');
  }
}
main();`,
`no await, no catch
caught 2
Uncaught (in promise) Error: x`,
    P('`fail()` returns a rejected promise instead of throwing, so without `await` the `try` block finishes normally and `catch` never runs. With `await`, the rejection is turned back into a throw at that line and the `catch` sees it. The first rejection was never handled, which a browser reports as an unhandled rejection. This page prints it as an `Uncaught (in promise)` line.'),
    SAY('A try/catch only catches an async failure if you await the call.')),

  PREDICT('what `finally` passes through',
`Promise.resolve('value')
  .finally(() => {
    console.log('finally runs');
    return 'ignored';
  })
  .then((v) => console.log('then gets', v));
Promise.reject(new Error('bad'))
  .finally(() => console.log('finally on reject'))
  .catch((e) => console.log('catch gets', e.message));`,
`finally runs
finally on reject
then gets value
catch gets bad`,
    P('`finally` runs whether the promise was fulfilled or rejected, but it does not change the outcome. Whatever it returns is ignored, so the original value `value` still reaches the `then`, and the original error still reaches the `catch`. Both `finally` callbacks run first because they were queued first.'),
    SAY('finally is for cleanup: it passes the value or the error straight through.')),

  // ---- F. Objects
  PREDICT('a spread copy is shallow',
`const a = { n: 1, inner: { m: 1 } };
const b = { ...a };
b.n = 2;
b.inner.m = 2;
console.log(a);
console.log(b);`,
`{ n: 1, inner: { m: 2 } }
{ n: 2, inner: { m: 2 } }`,
    P('Spread copies the top-level properties. `n` is a number, so `b` got its own copy and changing it leaves `a` alone. `inner` is an object, so both `a` and `b` hold a reference to the **same** object, and changing `b.inner.m` shows up in `a` too.'),
    SAY('Spread and Object.assign copy one level; nested objects are still shared.')),
];
