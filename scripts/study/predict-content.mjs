// Predict-the-output cards for the JavaScript guide (see add-predict-cards.mjs and check-predict.mjs).
// Every `expect` was captured by really running the snippet: `node scripts/study/check-predict.mjs --print <n>`.
// Snippets are deterministic, log only strings, numbers, booleans, null, undefined, arrays and plain objects,
// and use timers of at most 300 ms.
import { P, SAY, PREDICT } from './cc-kit.mjs';

export const predict = [
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

  PREDICT('`var` in a loop with a timer',
`for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
`3
3
3`,
    P('`var` is function-scoped, so there is **one** `i` shared by all three callbacks. The loop has finished and `i` is 3 by the time the timers run. A closure captures the variable, not its value at that moment.'),
    SAY('With var every callback shares one variable; with let each iteration gets its own.')),
];
