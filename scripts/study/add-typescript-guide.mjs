// Builds the standalone TypeScript guide (app/typescript/content.json).
//   node scripts/study/add-typescript-guide.mjs && npm run study:build
// Re-running rebuilds the guide from scratch, so edit this file and run it again to change content.
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import D from './dg.mjs';
import { c, card, p, lede, ul, ol, code, table, tip, callout } from './hx.mjs';

// A multiple-choice card in the same markup the other guides use (see the Node.js guide's quizzes).
const quiz = (question, options, right, why) => ({
  q: 'Quiz: ' + question + ' <span class="quizopts">' + options.map((o, i) => '(' + 'ABCD'[i] + ') ' + o).join(' &nbsp;·&nbsp; ') + '</span>',
  a: '<ol class="quiz" type="A">' + options.map((o, i) => '<li' + (i === right ? ' class="right"' : '') + '>' + o + '</li>').join('') + '</ol><p><strong>Answer: ' + 'ABCD'[right] + '.</strong> ' + why + '</p>',
});
const diagram = (title, svg) => ({ q: 'Diagram: ' + title, a: svg });

// ───────────────────────────────────────────── 1. the model
const model = [
  card('What does TypeScript do at build time, and what does it do at run time?',
    lede('TypeScript is a static checker plus a compiler that <strong>erases</strong> types. At run time there is only JavaScript.'),
    p('At build time the compiler reads your code, builds a type for every expression, reports mismatches and then emits plain JavaScript with every annotation removed. At run time nothing knows about your types: there is no <code>instanceof</code> for an interface, no validation of data that arrives over the network, and no overhead.'),
    ul(
      '<strong>What types give you:</strong> errors before running, safe refactors, autocompletion, documentation that cannot drift from the code.',
      '<strong>What they do not give you:</strong> protection from bad data at the edges. <code>JSON.parse</code> returns <code>any</code>, and <code>x as User</code> is a promise you make, not a check the program performs.',
    ),
    code(`interface User { name: string }

// Compiles, and is a lie at run time:
const u = JSON.parse('{"name": 42}') as User;
u.name.toUpperCase(); // TypeError: u.name.toUpperCase is not a function`),
    tip('Say "types are erased" early. It sets up the follow-up about validating external data with a runtime schema, which is what interviewers are usually fishing for.'),
  ),
  diagram('From a .ts file to running JavaScript', D.tsPipeline),
  card('Why does TypeScript use structural typing, and how do you get nominal behaviour when you need it?',
    lede('Two types are compatible when their <em>shapes</em> match; names do not matter.'),
    code(`interface Point { x: number; y: number }
class Vec { constructor(public x: number, public y: number) {} }

const p: Point = new Vec(1, 2); // fine: Vec has the same shape`),
    p('This suits JavaScript, where code is written against shapes, and it makes test doubles easy: any object with the right members is a valid argument. The cost is that two unrelated concepts with the same shape are interchangeable, for example a <code>UserId</code> and an <code>OrderId</code> that are both <code>string</code>.'),
    p('Two related rules to know:'),
    ul(
      '<strong>Excess property checks</strong> apply only to fresh object literals. <code>const a: Point = { x: 1, y: 2, z: 3 }</code> is an error, but passing a variable that holds the same object is not.',
      '<strong>Branding</strong> adds a phantom property so the shapes differ (see the branded-types card). It costs nothing at run time.',
    ),
    tip('Contrast with Java or C#, where <code>implements</code> is required. In TypeScript <code>implements</code> only asks the compiler to double-check; the class is compatible either way.'),
  ),
  card('Which tsconfig options should every new project turn on, and why?',
    lede('Start strict and stay strict. Loosening a flag later is easy; tightening it in a large codebase is a migration project.'),
    table(['Option', 'What it does', 'Why'], [
      [c('strict'), 'Turns on the whole strict family (next card)', 'The baseline. Without it much of the type system is switched off.'],
      [c('noUncheckedIndexedAccess'), c('arr[i]') + ' and ' + c('record[key]') + ' include <code>undefined</code>', 'Catches real out-of-range bugs. Not part of <code>strict</code>.'],
      [c('exactOptionalPropertyTypes'), c('a?: string') + ' means "absent", not "may be undefined"', 'Distinguishes "not provided" from "provided as undefined".'],
      [c('noImplicitOverride'), 'Requires the <code>override</code> keyword', 'Renaming a base method breaks subclasses loudly.'],
      [c('noFallthroughCasesInSwitch'), 'Flags a <code>case</code> that falls through', 'Accidental fall-through is a classic bug.'],
      [c('verbatimModuleSyntax'), 'Imports and exports are kept exactly as written; type-only ones need <code>import type</code>', 'Predictable output, works with every transpiler.'],
      [c('isolatedModules'), 'Every file must be compilable on its own', 'Required by esbuild, swc and Babel, which transpile file by file.'],
      [c('erasableSyntaxOnly'), 'Bans syntax that has run-time output (enums, namespaces, parameter properties)', 'Lets Node and other tools simply strip types.'],
      [c('skipLibCheck'), 'Skips type-checking <code>.d.ts</code> files', 'Faster, and avoids errors you cannot fix in other people\'s packages.'],
    ]),
    code(`{
  "compilerOptions": {
    "target": "ES2023",
    "module": "nodenext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}`, 'A solid starting tsconfig.json for a Node project'),
  ),
  card('What exactly does "strict" switch on?',
    p('<code>strict: true</code> is a bundle. Each member can be switched off individually, which is how a gradual migration works.'),
    table(['Flag', 'What it catches'], [
      [c('strictNullChecks'), '<code>null</code> and <code>undefined</code> are separate types, so you cannot use a possibly-missing value without checking. The single most valuable flag.'],
      [c('noImplicitAny'), 'A parameter or variable with no inferable type is an error instead of silently <code>any</code>.'],
      [c('strictFunctionTypes'), 'Function parameters are compared contravariantly (see the variance card).'],
      [c('strictBindCallApply'), c('bind') + ', ' + c('call') + ' and ' + c('apply') + ' check their arguments.'],
      [c('strictPropertyInitialization'), 'A class property that is not assigned in the constructor must say so (<code>!</code>) or allow <code>undefined</code>.'],
      [c('noImplicitThis'), c('this') + ' must have a known type.'],
      [c('useUnknownInCatchVariables'), c('catch (e)') + ' gives <code>e: unknown</code>, because anything can be thrown.'],
      [c('alwaysStrict'), 'Emits <code>"use strict"</code>.'],
      [c('strictBuiltinIteratorReturn'), 'Built-in iterators return <code>undefined</code> when done, not <code>any</code>.'],
    ]),
    tip('A good migration answer: turn on <code>strictNullChecks</code> last, because it produces the most errors, and enable the others one at a time.'),
  ),
  card('When is each of any, unknown, never, void, object, {} and Object the right choice?',
    table(['Type', 'Meaning', 'Use it for'], [
      [c('any'), 'Switches checking off, both in and out', 'Almost never: a temporary escape hatch while migrating.'],
      [c('unknown'), 'Any value, but you must narrow before use', 'Data from outside: <code>JSON.parse</code>, <code>catch</code>, third-party callbacks.'],
      [c('never'), 'No value exists', 'A function that always throws, an impossible branch, an exhaustiveness check.'],
      [c('void'), '"The return value is not used"', 'Functions that return nothing. A callback typed <code>() => void</code> may still return something.'],
      [c('object'), 'Any non-primitive (object, array, function)', 'Rarely; prefer a real shape or <code>Record&lt;string, unknown&gt;</code>.'],
      [c('{}'), 'Any value except <code>null</code> and <code>undefined</code>', 'Almost never. It does <em>not</em> mean "empty object".'],
      [c('Object'), 'The wrapper type, accepts primitives too', 'Never. Linters ban it.'],
    ]),
    tip('The sentence interviewers like: "<code>unknown</code> is the type-safe <code>any</code>: both accept everything, but <code>unknown</code> makes me prove what it is before I use it."'),
  ),
  diagram('The type lattice: what can be assigned to what', D.tsLattice),
  card('Why does TypeScript accept some code that is obviously wrong? Name the unsound spots.',
    lede('TypeScript is deliberately <em>not</em> fully sound: usability for real JavaScript wins over a proof. Know where the holes are.'),
    ul(
      '<strong>Array covariance:</strong> a <code>Dog[]</code> is accepted where an <code>Animal[]</code> is expected, and then someone pushes a <code>Cat</code>.',
      '<strong>Assertions:</strong> <code>x as T</code> and the non-null <code>x!</code> are trusted without any check.',
      '<strong>Index signatures:</strong> <code>record[key]</code> is typed as present unless <code>noUncheckedIndexedAccess</code> is on.',
      '<strong>Method bivariance:</strong> parameters declared with method syntax (<code>m(x: T)</code>) are compared bivariantly even under <code>strictFunctionTypes</code>.',
      '<strong>Object.keys</strong> returns <code>string[]</code> because an object may have more keys than its type says.',
      '<strong>Mutation through an alias:</strong> a <code>readonly</code> view of an array does not stop another reference from mutating it.',
      '<strong>Narrowing across calls:</strong> after a function call the compiler keeps the narrowing even though the function might have changed the property.',
    ),
    code(`class Animal { name = 'animal' }
class Dog extends Animal { bark() {} }
class Cat extends Animal { meow() {} }

const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs;   // allowed: arrays are covariant
animals.push(new Cat());          // compiles
dogs[1]!.bark();                  // run time: dogs[1].bark is not a function`),
    tip('Answering with specific holes (and the flag that closes each one) is far stronger than "it is not 100% sound".'),
  ),
  card('Why is my literal inferred as string, and how do widening, const and "as const" work?',
    p('A <code>const</code> keeps the narrowest type; a <code>let</code> or a mutable object property widens, because it could be reassigned later.'),
    code(`const a = 'hi';                // type 'hi'
let b = 'hi';                  // type string
const o = { mode: 'dark' };    // o.mode is string (the property is mutable)
const k = { mode: 'dark' } as const; // { readonly mode: 'dark' }

const tuple = [1, 'x'] as const;     // readonly [1, 'x']
const list = [1, 'x'];               // (string | number)[]`),
    p('<code>as const</code> turns an object into a readonly value with literal types. It is the cheapest way to get a union from a runtime value:'),
    code(`const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = typeof ROLES[number];  // 'admin' | 'editor' | 'viewer'

function can(role: Role) {}
can('editor'); // ok
can('guest');  // error`),
    p('A <code>const</code> type parameter (TypeScript 5.0) applies the same idea to a generic call: <code>function f&lt;const T&gt;(x: T)</code> infers <code>f(["a", "b"])</code> as <code>readonly ["a", "b"]</code> without the caller writing <code>as const</code>.'),
    callout('<code>as const</code> is erased: it gives <em>compile-time</em> readonly only. Use <code>Object.freeze</code> if you also need run-time immutability.'),
  ),
  card('satisfies, a type annotation and "as": which one when?',
    table(['Form', 'What happens', 'Use it when'], [
      [c('const x: T = v'), 'Checks <code>v</code> against <code>T</code>, then the variable has type <code>T</code> (the specific type is lost)', 'You want the variable to be exactly <code>T</code>.'],
      [c('const x = v satisfies T'), 'Checks <code>v</code> against <code>T</code> but keeps the <em>inferred</em> narrow type', 'You want validation <em>and</em> precise autocompletion, such as config objects and lookup tables.'],
      [c('v as T'), 'Overrides the compiler without checking', 'After you have verified something it cannot see. Treat each one as a small risk.'],
    ]),
    code(`type Route = { path: string; auth?: boolean };

const routes = {
  home: { path: '/' },
  admin: { path: '/admin', auth: true },
} satisfies Record<string, Route>;

routes.admin.auth;      // boolean (not boolean | undefined)
routes.nope;            // error: no such key  (a plain annotation would have allowed any key)`),
    tip('<code>satisfies</code> arrived in TypeScript 4.9. It is the right answer to "how do you check an object against a type without widening it?"'),
  ),
];

// ───────────────────────────────────────────── 2. declaring types
const declaring = [
  card('type or interface: when does the choice actually matter?',
    lede('For plain object shapes they are almost interchangeable. The differences are small but real.'),
    table(['', 'interface', 'type alias'], [
      ['Declaration merging', 'Yes: two declarations with one name are combined', 'No: duplicate identifier error'],
      ['Unions, tuples, primitives, mapped and conditional types', 'No', 'Yes'],
      ['Extending', c('extends') + ': conflicts are reported at the declaration', c('&') + ': conflicting members quietly become <code>never</code>'],
      ['Class <code>implements</code>', 'Yes', 'Yes (for object shapes)'],
      ['Compiler performance', 'Slightly better: named and cached', 'Large intersections can be slower'],
    ]),
    p('A common team rule: <strong>interface for public object shapes that others may extend or merge</strong> (library APIs, <code>Window</code>, Express <code>Request</code>), <strong>type for everything else</strong>. The point of the rule is consistency, not correctness.'),
    code(`interface Window { analytics: Analytics }       // merges into the global Window

type Result<T> = { ok: true; value: T } | { ok: false; error: Error }; // only a type can be a union`),
  ),
  card('Why do many teams avoid enum, and what do they use instead?',
    ul(
      'A regular <code>enum</code> is one of the few TypeScript features that <strong>emits run-time code</strong> (an object with reverse mappings for numbers), so it cannot be erased.',
      'That conflicts with <code>erasableSyntaxOnly</code> and with Node\'s built-in type stripping, which refuse enums.',
      '<code>const enum</code> is inlined at compile time, which breaks under <code>isolatedModules</code> and for libraries consumed by other projects.',
      'Before TypeScript 5.0, any number was assignable to a numeric enum. That is fixed, but numeric enums still leak magic numbers into logs and APIs.',
    ),
    p('The usual replacement is a union of string literals, or an <code>as const</code> object when you also need the values at run time:'),
    code(`// A union: zero run-time cost
type Status = 'idle' | 'loading' | 'error';

// An as const object: values at run time, a union for the type
const Status = { Idle: 'idle', Loading: 'loading', Error: 'error' } as const;
type Status = typeof Status[keyof typeof Status];   // 'idle' | 'loading' | 'error'`),
    tip('The honest trade-off: enums give you a namespace-like object and can iterate their members. If you need that, the <code>as const</code> object does too.'),
  ),
  card('Tuples, readonly arrays and variadic tuple types',
    code(`type Pair = [string, number];                        // fixed length and position types
type Named = [name: string, age: number];            // labelled elements show up in tooltips
type Opt = [string, number?];                        // optional element
type Rest = [first: string, ...rest: number[]];      // rest element

const xs: readonly number[] = [1, 2, 3];
xs.push(4);                                          // error: push does not exist on readonly number[]

// Variadic tuples: spread one tuple type into another
type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];
type R = Concat<[1, 2], ['a']>;                      // [1, 2, 'a']`),
    p('Tuples are how a typed <code>useState</code> returns <code>[value, setter]</code> and how <code>Parameters&lt;F&gt;</code> represents an argument list. Prefer <code>ReadonlyArray</code> (or <code>readonly T[]</code>) for function parameters you do not mutate: callers can then pass either kind of array.'),
  ),
  card('Index signatures, Record and Map: which one models a dictionary correctly?',
    code(`type Scores = Record<string, number>;       // any string key
const s: Scores = {};
const n = s['alice'];                        // number, but may be undefined at run time

// With "noUncheckedIndexedAccess": true, n is number | undefined and you must check it.

type ByStatus = Partial<Record<Status, Order[]>>;   // a known set of keys, some may be missing
const m = new Map<string, number>();                // frequent adds and deletes, non-string keys`),
    ul(
      '<strong>Record with a literal union key</strong> checks that every key is present (use <code>Partial</code> if some may be absent).',
      '<strong>Record&lt;string, T&gt;</strong> is an open dictionary and trusts that every key you read exists unless <code>noUncheckedIndexedAccess</code> is on.',
      '<strong>Map</strong> is the better tool for non-string keys, many insertions and deletions, and keys like <code>"__proto__"</code>, which on a plain object can cause prototype pollution.',
    ),
  ),
  card('Optional with ?, | undefined and | null: what is the difference?',
    table(['Declaration', 'Meaning'], [
      [c('a?: string'), 'The key may be missing. Without <code>exactOptionalPropertyTypes</code> it can also be set to <code>undefined</code>.'],
      [c('a: string | undefined'), 'The key must be present, and its value may be <code>undefined</code>.'],
      [c('a: string | null'), 'Present, with an explicit "no value" that survives JSON (JSON has <code>null</code>, never <code>undefined</code>).'],
    ]),
    p('With <code>exactOptionalPropertyTypes</code>, <code>{ a?: string }</code> rejects <code>{ a: undefined }</code>. That matters for PATCH-style updates, where "leave unchanged" (key absent) and "clear it" (<code>null</code>) mean different things.'),
    tip('A simple convention: <code>null</code> for "intentionally empty" in data that crosses the network, <code>undefined</code> for "not provided" inside your own code.'),
  ),
  card('Function types: overloads, call signatures, this parameters and void',
    code(`// Overloads: several public signatures, one implementation (which callers cannot see)
function parse(input: string): number;
function parse(input: string[]): number[];
function parse(input: string | string[]) {
  return Array.isArray(input) ? input.map(Number) : Number(input);
}

// A call signature on an object type
type Counter = { (): number; reset(): void };

// A fake "this" parameter: checked, but erased, so it is not an argument
function click(this: HTMLButtonElement, e: MouseEvent) { this.disabled = true; }

// void return: the callback may return something and the caller must ignore it
const out: number[] = [];
[1, 2, 3].forEach((x) => out.push(x));   // push returns number, still fine for a () => void callback`),
    ul(
      'Overloads are tried <strong>top to bottom</strong>; put the most specific first.',
      'If the return type depends on the input type, a generic or a conditional type is often clearer than a pile of overloads (see the later card).',
    ),
  ),
  card('Classes in TypeScript: private vs #private, parameter properties, abstract and override',
    code(`class Account {
  #balance = 0;                       // truly private at run time (JavaScript private field)
  private audit: string[] = [];       // private only at compile time: still readable from JS
  constructor(public readonly id: string) {}   // parameter property: declares and assigns
  deposit(n: number) { this.#balance += n; }
}

abstract class Shape {
  abstract area(): number;
}
class Sq extends Shape {
  constructor(private side: number) { super(); }
  override area() { return this.side ** 2; }   // "override" catches a renamed base method
}`),
    ul(
      '<strong>private</strong> is erased and can be bypassed; <strong>#private</strong> is enforced by the runtime.',
      '<strong>Parameter properties</strong> are shorthand that emits code, so they are not allowed with <code>erasableSyntaxOnly</code>. Declare the field and assign it explicitly instead.',
      '<strong>abstract</strong> classes cannot be instantiated; a plain interface is usually lighter when you only need a contract.',
    ),
  ),
  quiz('const cfg = { port: 3000 } as const; then cfg.port = 4000;. What happens?',
    ['It compiles: cfg is a const', 'A compile error: port is a read-only property', 'The type of port widens to number', 'A run-time error: the object is frozen'], 1,
    '<code>as const</code> makes every property <code>readonly</code> with a literal type, so the assignment is a <em>compile-time</em> error. Nothing is frozen at run time (D is wrong), and <code>const</code> only stops reassigning the variable, not mutating the object (A is wrong).'),
  quiz('interface A { x: number } and later interface A { y: number }. What is A?',
    ['A duplicate identifier error', 'Only { y: number }, the last one wins', 'A merged type: { x: number; y: number }', 'Never'], 2,
    'Interfaces with the same name in the same scope <strong>merge</strong>. The same two declarations written as <code>type</code> aliases would be a duplicate identifier error. Merging is what lets libraries extend global interfaces like <code>Window</code>.'),
];

// ───────────────────────────────────────────── 3. narrowing
const narrowing = [
  card('How does narrowing work? Which checks does the compiler understand?',
    lede('Control-flow analysis refines a variable\'s type inside a branch, based on the checks you wrote.'),
    code(`function show(x: string | number | Date | null) {
  if (x === null) return;                  // equality: removes null
  if (typeof x === 'string') x.trim();     // typeof: string here
  else if (x instanceof Date) x.getTime(); // instanceof: Date here
  else x.toFixed(1);                       // number is all that is left
}

type Fish = { swim(): void };
type Bird = { fly(): void };
function move(a: Fish | Bird) {
  if ('swim' in a) a.swim();               // "in" narrows by property
  else a.fly();
}`),
    p('The compiler also understands truthiness, <code>Array.isArray</code>, optional chaining, equality between two variables, and discriminated unions (next cards). Narrowing is <strong>flow-based</strong>: the same variable can have a different type on each line.'),
    callout('Truthiness narrowing removes <code>0</code>, <code>""</code> and <code>NaN</code> at run time too. <code>if (!x) return</code> on a <code>number | null</code> also drops a legitimate <code>0</code>. Prefer <code>x == null</code> or <code>x === undefined</code> when the value is a number or string.'),
  ),
  diagram('Narrowing a discriminated union, and what is left in default', D.tsNarrow),
  card('How do you write an exhaustive switch that stops compiling when the union grows?',
    code(`type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number };

function assertNever(x: never): never {
  throw new Error('Unhandled: ' + JSON.stringify(x));
}

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;
    case 'square': return s.side ** 2;
    default: return assertNever(s);   // adding a 'triangle' member makes this line an error
  }
}`),
    p('Inside <code>default</code>, every member has been ruled out, so <code>s</code> has type <code>never</code>, and only a value of type <code>never</code> can be passed to <code>assertNever</code>. Add a new member and <code>s</code> is no longer <code>never</code>: the compiler points at <strong>every</strong> switch that needs updating.'),
    p('A lighter spelling that avoids a helper function: <code>default: { const _exhaustive: never = s; throw new Error(String(_exhaustive)); }</code>.'),
    tip('Discriminated unions plus exhaustiveness are the answer to "how do you model state so impossible states cannot be represented?" Show <code>{ status: "loading" } | { status: "ok"; data } | { status: "error"; error }</code> instead of three optional fields.'),
  ),
  card('User-defined type guards and assertion functions: "x is T" vs "asserts x is T"',
    code(`// A type guard returns a boolean the compiler trusts
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

// An assertion function throws, or the value has the stated type afterwards
function assertDefined<T>(x: T | undefined, msg = 'missing'): asserts x is T {
  if (x === undefined) throw new Error(msg);
}

const maybe: number | undefined = Math.random() > 0.5 ? 1 : undefined;
assertDefined(maybe);
maybe.toFixed();            // number from here on

const ids = [1, undefined, 3].filter((x): x is number => x !== undefined); // number[]`),
    ul(
      'The compiler <strong>does not verify</strong> the body of a guard. A guard that returns <code>true</code> for the wrong values silently breaks every call site.',
      'From TypeScript 5.5 the compiler infers a type predicate for simple arrow functions, so <code>.filter((x) => x !== undefined)</code> now returns <code>number[]</code> without the explicit annotation.',
      '<code>.filter(Boolean)</code> does <em>not</em> narrow (it also drops <code>0</code> and empty strings); use a real predicate.',
    ),
  ),
  card('Why does narrowing sometimes disappear: callbacks, mutation and closures?',
    code(`function f(user: { name?: string }) {
  if (user.name) {
    setTimeout(() => {
      user.name.toUpperCase();   // error: name may have changed before the callback runs
    });
    const n = user.name;         // capture the narrowed value instead
    setTimeout(() => n.toUpperCase());   // fine
  }
}

let value: string | number = 'a';
function change() { value = 1; }
if (typeof value === 'string') {
  change();
  value.toUpperCase();           // compiles, even though change() reassigned it: a known gap
}`),
    ul(
      'Narrowing of a <strong>property</strong> is dropped inside callbacks because the object could be mutated before they run. Copy it to a <code>const</code>.',
      'Narrowing of a <strong>parameter or let variable</strong> in a closure survives only if the variable is never reassigned after the closure is created (improved in TypeScript 5.4).',
      'Function calls do <em>not</em> invalidate narrowing for properties of variables, which is a deliberate trade-off against false errors.',
    ),
  ),
  quiz('function f(x: string | number | null) { if (!x) return; x; }. What type does x have on the last line?',
    ['string | number | null', 'string | number', 'never', 'string | number | 0'], 1,
    'The check removes <code>null</code> from the type. The type system does not remove "falsy strings" or <code>0</code>, because those are not separate types here (only a literal type like <code>0</code> would be). At run time, though, <code>0</code> and <code>""</code> return early too, which is the bug hiding in truthiness checks.'),
];

// ───────────────────────────────────────────── 4. generics
const generics = [
  card('What problem do generics solve, and how do constraints work?',
    p('A generic lets one function or type work across many types <em>while remembering</em> which one. Without it you choose between duplication and <code>any</code>.'),
    code(`function first<T>(xs: readonly T[]): T | undefined {
  return xs[0];
}
const n = first([1, 2, 3]);       // number | undefined
const s = first(['a']);           // string | undefined

// A constraint says what T must be able to do
function byId<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((i) => i.id === id);
}
byId([{ id: 'a', name: 'x' }], 'a');   // returns the full element type, not just { id: string }`),
    tip('A good rule of thumb: <strong>a type parameter should appear at least twice</strong> (in an input and in the output, or in two inputs). If it appears once, it is not relating anything and you can usually write the concrete type.'),
  ),
  card('How does inference pick a type argument, and when should you pass it explicitly?',
    ul(
      'The compiler collects <strong>candidates</strong> from every argument that mentions <code>T</code> and picks the best common one. With conflicting candidates, you get an error at the argument that does not fit.',
      'It can also infer from the <strong>return type context</strong>: <code>const x: Set&lt;string&gt; = new Set()</code>.',
      'Default type parameters (<code>&lt;T = string&gt;</code>) apply when nothing can be inferred.',
      'Pass the argument explicitly when there is nothing to infer from (<code>useState&lt;User | null&gt;(null)</code>), or when you want to widen on purpose.',
    ),
    code(`function pick<T>(a: T, b: T): T { return Math.random() > 0.5 ? a : b; }
pick('a', 1);        // error: 1 is not assignable to 'a'

// NoInfer (TypeScript 5.4): stop one argument from contributing a candidate
function withDefault<T>(value: T, fallback: NoInfer<T>): T { return value ?? fallback; }
withDefault('x' as 'x' | 'y', 'z');   // error: 'z' is not 'x' | 'y'`),
  ),
  card('keyof and indexed access with generics: write a type-safe get and pick',
    code(`function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { id: 1, name: 'Ada' };
get(user, 'name');      // string
get(user, 'age');       // error: 'age' is not a key of the user type

function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}
pick(user, 'id');       // { id: number }`),
    p('<code>K extends keyof T</code> ties the key to the object: the return type <code>T[K]</code> is the exact property type, not a union of all of them. This is the building block behind typed <code>Object.fromEntries</code> wrappers, query builders and form libraries.'),
  ),
  card('Variance: what are covariance and contravariance, and what do the in and out annotations do?',
    p('Variance describes how assignability of <code>Box&lt;A&gt;</code> follows assignability of <code>A</code>. If <code>Dog</code> extends <code>Animal</code>:'),
    ul(
      '<strong>Covariant (reads):</strong> a producer of <code>Dog</code> can stand in for a producer of <code>Animal</code>. Return types and read-only values.',
      '<strong>Contravariant (writes):</strong> a consumer of <code>Animal</code> can stand in for a consumer of <code>Dog</code>, never the reverse. Function parameters, under <code>strictFunctionTypes</code>.',
      '<strong>Invariant:</strong> a type that both reads and writes <code>T</code> is neither, in theory. TypeScript lets arrays be covariant anyway (unsound).',
    ),
    code(`type Handler<T> = (value: T) => void;

declare let animalHandler: Handler<Animal>;
declare let dogHandler: Handler<Dog>;

dogHandler = animalHandler;   // ok: something that handles any Animal can handle a Dog
animalHandler = dogHandler;   // error: it might receive a Cat

// Explicit variance annotations (TypeScript 4.7) document intent and speed up checking
interface Producer<out T> { get(): T }
interface Consumer<in T> { accept(value: T): void }`),
    tip('Method syntax (<code>accept(x: T): void</code>) is checked bivariantly even in strict mode, a deliberate escape hatch for DOM-style APIs. Property syntax (<code>accept: (x: T) =&gt; void</code>) is checked strictly.'),
  ),
  card('When are generics over-engineering? Generics vs overloads vs unions',
    ul(
      '<strong>One generic is enough</strong> when the output type is derived from the input type (<code>first</code>, <code>get</code>, <code>map</code>).',
      '<strong>A union</strong> is enough when you accept a few concrete kinds and treat them uniformly: <code>(x: string | number)</code>.',
      '<strong>Overloads</strong> help when separate signatures give clearer docs, or when a few input shapes map to different outputs.',
      '<strong>A conditional return type</strong> in a generic scales better than many overloads, but its body usually needs a cast.',
    ),
    callout('Red flags in review: a type parameter used once, a constraint that repeats the concrete type, a type that needs a comment longer than the function, and generics nested more than three levels deep. If a teammate cannot read it in a minute, it is too clever.'),
  ),
];

// ───────────────────────────────────────────── 5. type-level programming
const tmpl = (lines) => lines.join('\n');
const typeLevel = [
  card('Which built-in utility types do you use daily, and how are they implemented?',
    table(['Utility', 'Does', 'Implementation'], [
      [c('Partial<T>'), 'All properties optional', c('{ [K in keyof T]?: T[K] }')],
      [c('Required<T>'), 'All properties required', c('{ [K in keyof T]-?: T[K] }')],
      [c('Readonly<T>'), 'All properties read-only', c('{ readonly [K in keyof T]: T[K] }')],
      [c('Pick<T, K>'), 'Keep only some keys', c('{ [P in K]: T[P] }')],
      [c('Omit<T, K>'), 'Drop some keys', c('Pick<T, Exclude<keyof T, K>>')],
      [c('Record<K, V>'), 'Object with keys K and values V', c('{ [P in K]: V }')],
      [c('Exclude<U, X>'), 'Remove members from a union', c('U extends X ? never : U')],
      [c('Extract<U, X>'), 'Keep matching members', c('U extends X ? U : never')],
      [c('NonNullable<T>'), 'Remove null and undefined', c('T & {}')],
      [c('ReturnType<F>'), 'What a function returns', c('F extends (...a: any) => infer R ? R : any')],
      [c('Parameters<F>'), 'A function\'s argument tuple', c('F extends (...a: infer P) => any ? P : never')],
      [c('Awaited<T>'), 'Unwrap a Promise, recursively', 'a recursive conditional type'],
    ]),
    callout('<code>Omit</code> does not check that the keys exist: <code>Omit&lt;{ a: 1 }, "typo"&gt;</code> compiles and returns the type unchanged. Write your own <code>StrictOmit&lt;T, K extends keyof T&gt;</code> when that matters.'),
    tip('Being able to write <code>Partial</code>, <code>Pick</code> and <code>Exclude</code> from memory shows you understand mapped and conditional types rather than memorising a list.'),
  ),
  card('Conditional types: how do infer and distribution work?',
    code(`type IsString<T> = T extends string ? true : false;
type A = IsString<'x'>;    // true
type B = IsString<1>;      // false

// infer: capture a piece of the matched type
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type C = ElementOf<string[]>;   // string

type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;
type D = UnwrapPromise<Promise<Promise<number>>>;   // number

// Distribution: when T is a bare type parameter, a union is split and each member is checked
type ToArray<T> = T extends unknown ? T[] : never;
type E = ToArray<string | number>;      // string[] | number[]

// Wrap in a tuple to turn distribution off
type ToArrayAll<T> = [T] extends [unknown] ? T[] : never;
type F = ToArrayAll<string | number>;   // (string | number)[]`),
    ul(
      '<strong>Distribution</strong> happens only for a naked type parameter on the left of <code>extends</code>. It is why <code>Exclude</code> and <code>Extract</code> work on unions.',
      '<code>never</code> is the empty union, so <code>ToArray&lt;never&gt;</code> is <code>never</code>, not <code>never[]</code>. A frequent surprise.',
    ),
  ),
  card('Mapped types: key remapping, modifiers and filtering keys by value type',
    code(tmpl([
      'type Mutable<T> = { -readonly [K in keyof T]: T[K] };',
      'type Complete<T> = { [K in keyof T]-?: T[K] };',
      '',
      '// Key remapping with "as" (TypeScript 4.1), here building getter names',
      "type Getters<T> = {",
      "  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];",
      "};",
      "type G = Getters<{ id: number; name: string }>;",
      "// { getId: () => number; getName: () => string }",
      '',
      '// Filter keys: map a key to never to drop it',
      'type OnlyFunctions<T> = {',
      '  [K in keyof T as T[K] extends (...a: any[]) => any ? K : never]: T[K];',
      '};',
    ])),
    p('Mapped types over <code>keyof T</code> are called <strong>homomorphic</strong>: they preserve the modifiers (<code>readonly</code>, <code>?</code>) of the source and distribute over arrays and tuples. The <code>+</code> and <code>-</code> prefixes add or remove those modifiers.'),
  ),
  card('Template literal types: typed routes, event names and CSS units',
    code(tmpl([
      "type EventName<T extends string> = `on${Capitalize<T>}`;",
      "type OnClick = EventName<'click'>;                 // 'onClick'",
      '',
      "type Px = `${number}px`;",
      "const w: Px = '12px';       // ok",
      "const bad: Px = '12em';     // error",
      '',
      '// Pull route parameters out of a path string',
      "type Params<S extends string> =",
      "  S extends `${string}:${infer P}/${infer Rest}` ? P | Params<`/${Rest}`> :",
      "  S extends `${string}:${infer P}` ? P : never;",
      '',
      "type P = Params<'/users/:id/posts/:postId'>;        // 'id' | 'postId'",
    ])),
    p('The same technique types <code>router.push</code> arguments, i18n keys (<code>`${Namespace}.${Key}`</code>), and the string-literal event names of a typed emitter. Intrinsic helpers: <code>Uppercase</code>, <code>Lowercase</code>, <code>Capitalize</code>, <code>Uncapitalize</code>.'),
  ),
  card('keyof, typeof and indexed access: derive types from values so there is one source of truth',
    code(`const config = {
  env: 'prod',
  retries: 3,
  regions: ['eu', 'us'],
} as const;

type Config = typeof config;
type Env = Config['env'];                    // 'prod'
type Region = Config['regions'][number];     // 'eu' | 'us'
type ConfigKey = keyof typeof config;        // 'env' | 'retries' | 'regions'

function make() { return { id: 1, tags: [] as string[] }; }
type Made = ReturnType<typeof make>;         // { id: number; tags: string[] }`),
    p('<code>typeof</code> in a type position reads the type of a <em>value</em>; <code>keyof</code> lists a type\'s keys; <code>T[K]</code> looks up a property type; <code>[number]</code> on an array type is the element type. Together they let you declare a list once and derive the union from it, so the two cannot drift.'),
  ),
  card('Recursive types, and where the compiler gives up',
    code(`type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];`),
    ul(
      'Conditional types that recurse through a <strong>tail position</strong> are optimised (TypeScript 4.5), so long tuple or string processing no longer hits the limit as quickly.',
      'You will still see <em>"Type instantiation is excessively deep and possibly infinite"</em>: the compiler caps instantiation depth (about 100 levels, and 1000 for tail-recursive conditional types).',
      'Huge unions (thousands of members) and deeply nested conditional types are the usual cause of slow editors. Measure with <code>tsc --extendedDiagnostics</code> or <code>--generateTrace</code> and simplify.',
    ),
    tip('If a type needs a recursion limit workaround, ask whether a runtime function with a plain return type would do. Clever types have a maintenance cost.'),
  ),
  card('Write these from scratch: DeepReadonly, UnionToIntersection and StrictOmit',
    code(`type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T :
  T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } :
  T;

// Turns A | B into A & B using contravariance of function parameters
type UnionToIntersection<U> =
  (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type X = UnionToIntersection<{ a: 1 } | { b: 2 }>;   // { a: 1 } & { b: 2 }`),
    p('<code>UnionToIntersection</code> is the classic "explain how it works" question. The union is first distributed into a union of <em>functions</em>. Inferring a single parameter type from a union of functions requires a type that satisfies every function, and parameters are contravariant, so the inferred type is the <strong>intersection</strong>.'),
  ),
  quiz('type ToArr<T> = T extends any ? T[] : never;  type R = ToArr<string | number>. What is R?',
    ['(string | number)[]', 'string[] | number[]', 'never', 'unknown[]'], 1,
    '<code>T</code> is a naked type parameter, so the conditional <strong>distributes</strong> over the union: <code>ToArr&lt;string&gt; | ToArr&lt;number&gt;</code> = <code>string[] | number[]</code>. Writing <code>[T] extends [any]</code> would disable distribution and give <code>(string | number)[]</code>.'),
  quiz('type R = Omit<{ a: 1; b: 2 }, "c">. What happens?',
    ['A compile error: "c" is not a key', 'R is { a: 1; b: 2 }', 'R is never', 'R is {}'], 1,
    '<code>Omit</code>\'s second parameter is <code>keyof any</code>, not <code>keyof T</code>, so a key that does not exist is silently ignored. That makes typos undetectable; use a strict version (<code>K extends keyof T</code>) when it matters.'),
];

// ───────────────────────────────────────────── 6. patterns
const patterns = [
  card('Branded (opaque) types: stop mixing a UserId with an OrderId',
    code(`declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

// The only place a plain string becomes a UserId: validate here
function userId(s: string): UserId {
  if (!/^u_[a-z0-9]+$/.test(s)) throw new Error('bad user id');
  return s as UserId;
}

function loadUser(id: UserId) {}
declare const oid: OrderId;
loadUser(oid);                  // error: OrderId is not assignable to UserId
loadUser('u_42');               // error: a plain string is not a UserId
loadUser(userId('u_42'));       // ok`),
    p('The brand exists only in the type system, so there is no run-time cost. Use it for ids, validated emails, sanitised HTML, money in different currencies, and units (<code>Meters</code> vs <code>Feet</code>).'),
    tip('This is the answer to "TypeScript is structural, so how do you prevent passing the wrong kind of string?"'),
  ),
  card('Result types: model expected failures in the type instead of throwing',
    code(`type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parsePort(s: string): Result<number, 'not-a-number' | 'out-of-range'> {
  const n = Number(s);
  if (Number.isNaN(n)) return { ok: false, error: 'not-a-number' };
  if (n < 1 || n > 65535) return { ok: false, error: 'out-of-range' };
  return { ok: true, value: n };
}

const r = parsePort(process.env.PORT ?? '');
if (!r.ok) console.error(r.error);   // narrowed to the error union
else listen(r.value);                // narrowed to number`),
    ul(
      'TypeScript has <strong>no checked exceptions</strong>: a function signature never says what it can throw, and <code>catch (e)</code> is <code>unknown</code>.',
      'Use exceptions for bugs and truly exceptional situations; use a <code>Result</code> where the caller is expected to handle the failure and the compiler should force them to.',
    ),
  ),
  card('A type-safe event emitter: typing a map of event names to payloads',
    code(`type Events = {
  login: [user: { id: string }];
  logout: [];
  error: [err: Error, fatal: boolean];
};

class Emitter<E extends Record<string, unknown[]>> {
  private handlers: { [K in keyof E]?: Array<(...args: E[K]) => void> } = {};

  on<K extends keyof E>(event: K, fn: (...args: E[K]) => void) {
    (this.handlers[event] ??= []).push(fn);
  }
  emit<K extends keyof E>(event: K, ...args: E[K]) {
    this.handlers[event]?.forEach((fn) => fn(...args));
  }
}

const bus = new Emitter<Events>();
bus.on('error', (err, fatal) => {});      // both parameters are typed
bus.emit('login', { id: 'u1' });
bus.emit('login');                         // error: missing argument
bus.emit('nope');                          // error: unknown event`),
    p('The tuple type per event doubles as the parameter list, so one definition gives both the handler signature and the <code>emit</code> signature. The same shape powers typed Redux actions, message-bus topics and WebSocket protocols.'),
  ),
  card('A function whose return type depends on its argument: overloads vs a lookup type',
    code(`type Resources = {
  user: { id: string; name: string };
  order: { id: string; total: number };
};

// A lookup type: the argument picks the result
async function load<K extends keyof Resources>(kind: K, id: string): Promise<Resources[K]> {
  const res = await fetch('/api/' + kind + '/' + id);
  return (await res.json()) as Resources[K];     // the cast is the honest weak spot
}

const u = await load('user', '1');    // { id: string; name: string }
const o = await load('order', '1');   // { id: string; total: number }`),
    p('This beats a list of overloads because adding a resource is one line. Inside the body the compiler cannot prove the returned value matches <code>Resources[K]</code>, so a cast (or a runtime schema, see the validation card) is needed there. Keep the cast in one place.'),
  ),
  card('Declaration merging and module augmentation: extending Window or Express Request',
    code(`// 1. Add a property to a global interface
declare global {
  interface Window { analytics: { track(e: string): void } }
}

// 2. Add a field to a library's interface
import 'express-serve-static-core';
declare module 'express-serve-static-core' {
  interface Request { user?: { id: string; roles: string[] } }
}

export {};   // makes this file a module so the augmentations above are applied`),
    ul(
      'Only <strong>interfaces</strong> (and namespaces) merge. This is the main reason libraries expose their extension points as interfaces.',
      'The augmentation file must be included by the compiler (<code>include</code> in tsconfig) and must be a module (have an import or export).',
      'Augmentations describe what <em>your</em> code puts there; make sure a middleware really sets <code>req.user</code>, or mark it optional.',
    ),
  ),
  card('Why does Object.keys return string[], and how do you iterate a typed object?',
    code(`const user = { id: 1, name: 'Ada' };

for (const k of Object.keys(user)) {
  user[k];   // error: string cannot index the user type
}

// Why: an object may have MORE properties than its type says (structural typing),
// so keyof T is not guaranteed to be all of the keys.

// When you know the object is exactly its type, narrow once, in one helper:
const keys = <T extends object>(o: T) => Object.keys(o) as Array<keyof T>;
const entries = <T extends object>(o: T) => Object.entries(o) as Array<[keyof T, T[keyof T]]>;`),
    p('The cast in the helper is a deliberate, contained piece of unsoundness. Prefer a <code>Map</code> or a <code>Record</code> with a known key union when you need to iterate safely.'),
  ),
];

// ───────────────────────────────────────────── 7. the real world
const realWorld = [
  card('Compile-time types vs run-time validation: why "as User" on JSON is a lie',
    lede('Types describe what you <em>believe</em> about data. Only a run-time check can establish it.'),
    p('At every boundary where data enters (HTTP bodies, <code>JSON.parse</code>, environment variables, query strings, <code>localStorage</code>, messages from a queue, third-party APIs), parse it with a schema and let the types come <em>from</em> the schema:'),
    code(`import { z } from 'zod';

const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().nonnegative().optional(),
});
type User = z.infer<typeof User>;          // the type is derived, never written twice

const parsed = User.safeParse(await res.json());
if (!parsed.success) throw new Error(parsed.error.message);
const user: User = parsed.data;            // trusted from here on`),
    ul(
      'Libraries that do this: Zod, Valibot, ArkType, io-ts. They share the idea of "one definition gives both validator and type".',
      'Validate <strong>at the edge once</strong>, then pass the typed value inward. Do not re-validate in every function.',
      'The same schema can generate an OpenAPI document or a form, which keeps the contract in one place.',
    ),
    tip('This is the most common senior-level TypeScript follow-up. Say: "types are erased, so the boundary needs a schema; inside the boundary I trust the types."'),
  ),
  card('Typing async code: Promise<T>, Awaited and errors from await',
    code(`async function getUser(id: string): Promise<User> { /* ... */ }

type U = Awaited<ReturnType<typeof getUser>>;       // User (unwraps the promise)

const [a, b] = await Promise.all([getUser('1'), getOrders('1')]);   // typed tuple: [User, Order[]]

const settled = await Promise.allSettled([getUser('1'), getUser('2')]);
for (const r of settled) {
  if (r.status === 'fulfilled') r.value;     // User
  else r.reason;                              // any: type it yourself
}

try {
  await getUser('x');
} catch (e) {                                  // e is unknown under strict
  if (e instanceof HttpError) console.log(e.status);
  else throw e;
}`),
    ul(
      '<code>async</code> functions always return a <code>Promise</code>; declaring <code>Promise&lt;User&gt;</code> explicitly makes an accidental <code>any</code> inside visible.',
      'Enable the lint rules <code>no-floating-promises</code> and <code>no-misused-promises</code> (typescript-eslint). They catch the largest class of async bugs that types alone cannot.',
    ),
  ),
  card('Modules: import type, verbatimModuleSyntax and the ESM vs CommonJS tangle',
    code(`import type { User } from './types.ts';       // erased completely
import { type Config, load } from './config.ts';  // inline type modifier

export type { User };`),
    ul(
      '<code>import type</code> guarantees the import disappears from the output, which avoids accidental circular imports and side effects. <code>verbatimModuleSyntax</code> enforces it.',
      '<strong>module: "nodenext"</strong> follows Node\'s rules: the package\'s <code>"type"</code> field decides ESM or CommonJS, and relative ESM imports need the <strong>file extension</strong>.',
      'The long-standing quirk: you write <code>import "./a.js"</code> in a <code>.ts</code> file because TypeScript does not rewrite paths. TypeScript 5.7 added <code>rewriteRelativeImportExtensions</code> so <code>.ts</code> specifiers work in the source.',
      '<strong>moduleResolution: "bundler"</strong> is for code that always goes through a bundler (Vite, Next.js, esbuild); it allows extensionless imports.',
      '<code>esModuleInterop</code> and <code>allowSyntheticDefaultImports</code> exist only to smooth over CommonJS default imports.',
    ),
    tip('If a publish-and-consume library is in scope, mention the <code>exports</code> map in <code>package.json</code> with a <code>types</code> condition per entry point, and check it with a tool such as <code>arethetypeswrong</code>.'),
  ),
  card('.d.ts files, DefinitelyTyped and typing a JavaScript library you do not own',
    ul(
      '<strong>.d.ts</strong> files hold only type declarations: no code. Libraries publish them next to their JavaScript (<code>"types"</code> field in <code>package.json</code>).',
      '<strong>@types/*</strong> packages come from DefinitelyTyped, a community repository, for libraries that do not ship their own types.',
      'For a library with no types at all, add a local declaration file: <code>declare module "legacy-lib";</code> (everything becomes <code>any</code>), then refine it as you use more of the API.',
      'Libraries can generate declarations with <code>declaration: true</code>. <code>isolatedDeclarations</code> (TypeScript 5.5) requires explicit annotations on exports so other tools can generate them quickly.',
    ),
    code(`// types/legacy-lib.d.ts
declare module 'legacy-lib' {
  export function sum(a: number, b: number): number;
  export const VERSION: string;
}`),
    p('<code>skipLibCheck</code> skips type-checking of every <code>.d.ts</code>, including your own. It is a pragmatic default, but it can hide conflicting declarations between packages.'),
  ),
  card('Monorepos: project references, composite builds and path aliases',
    ul(
      '<strong>Project references</strong> split a codebase into several tsconfig projects that depend on each other. <code>tsc -b</code> builds them in dependency order and skips unchanged ones, which is what makes large monorepos usable.',
      'A referenced project needs <code>"composite": true</code> and emits declarations that dependents consume.',
      '<strong>paths</strong> (<code>"@app/*": ["src/*"]</code>) only teaches the <em>type checker</em> where to look. It does not change the emitted code, so a runtime or bundler needs the same alias configured (or use real workspace packages instead).',
      'In npm, pnpm or Yarn workspaces, treating each package as a real dependency with its own <code>exports</code> and types avoids most alias problems.',
    ),
    code(`// tsconfig.json at the repo root
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./apps/api" }
  ]
}
// then: tsc -b`),
  ),
  card('How would you migrate a large JavaScript codebase to TypeScript without stopping the team?',
    ol(
      '<strong>Add the compiler without changing behaviour.</strong> <code>allowJs</code> and <code>checkJs</code> (or JSDoc types) let TypeScript and JavaScript files coexist and be checked.',
      '<strong>Convert leaves first.</strong> Utilities and data types with few dependencies, then work inward. Rename <code>.js</code> to <code>.ts</code> one file at a time.',
      '<strong>Start with loose settings and ratchet.</strong> Enable <code>strict</code> flags one by one; <code>strictNullChecks</code> last. A lint rule or script that fails if the count of errors or of <code>any</code> goes up keeps progress from sliding back.',
      '<strong>Type the boundaries properly.</strong> API responses, config and events get real schemas; the interior can use inferred types.',
      '<strong>Make new code strict from day one.</strong> Per-folder tsconfig overrides allow strict mode in new directories while legacy ones stay lenient.',
      '<strong>Track it.</strong> A type-coverage report or a count of <code>@ts-expect-error</code> comments on a dashboard turns the migration into visible progress.',
    ),
    tip('The point to land: it is incremental, it ships continuously, and the safety comes from strictness and boundary validation, not from renaming files.'),
  ),
  card('@ts-ignore vs @ts-expect-error vs "as any": what should you reach for?',
    table(['Tool', 'Effect', 'Problem'], [
      [c('// @ts-ignore'), 'Silences the next line\'s errors', 'Stays forever, even after the problem is fixed, and can hide new errors on that line.'],
      [c('// @ts-expect-error'), 'Silences the next line <em>and errors if there is nothing to silence</em>', 'Better: it removes itself from the list of surprises when the code is fixed.'],
      [c('as any'), 'Disables checking for a whole expression', 'Spreads: the <code>any</code> flows into everything it touches.'],
      [c('as unknown as T'), 'A double cast when types do not overlap', 'The loudest signal that a design or a type is wrong.'],
    ]),
    p('Prefer <code>@ts-expect-error</code> with a reason, enforced by <code>@typescript-eslint/ban-ts-comment</code> (which can require a description). It is also how you write <strong>negative tests</strong> for your own types: the line must fail to compile.'),
  ),
  card('Testing types: how do you prove a type behaves the way you promised?',
    code(`import { expectTypeOf } from 'vitest';

expectTypeOf(parsePort('80')).toEqualTypeOf<Result<number, 'not-a-number' | 'out-of-range'>>();
expectTypeOf<Params<'/a/:id'>>().toEqualTypeOf<'id'>();

// Negative test: this line must NOT compile, otherwise @ts-expect-error itself errors
// @ts-expect-error: a plain string is not a UserId
loadUser('u_42');

// A tiny helper with no library
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type _t1 = Expect<Equal<ReturnType<() => number>, number>>;`),
    p('Type tests run during <code>tsc --noEmit</code>, so they cost nothing at run time. Libraries with heavy type-level code (routers, schema libraries, state managers) ship them. Alternatives: <code>tsd</code>, <code>expect-type</code>, the TypeScript team\'s <code>dtslint</code>.'),
  ),
  card('Why can compilation be slow, and how do you find the cause?',
    ol(
      'Measure first: <code>tsc --extendedDiagnostics</code> shows time spent in parse, bind, check and emit, and counts of types and instantiations.',
      'For a flame chart, <code>tsc --generateTrace out</code> and open it in <code>chrome://tracing</code> or Perfetto; look for the single file or type that dominates.',
      'Typical causes: very large unions, deeply nested conditional or recursive types, intersection-heavy types where an <code>interface extends</code> would do, and importing a huge barrel file only for types.',
      'Structural fixes: <code>incremental</code> builds, project references with <code>tsc -b</code>, <code>skipLibCheck</code>, <code>import type</code>, and giving return types explicit annotations on hot exported functions.',
      'Split <em>speed</em> from <em>safety</em>: let esbuild, swc or the framework transpile for dev and build, and run <code>tsc --noEmit</code> in CI and the editor.',
    ),
    callout('<strong>TypeScript 7</strong> is the compiler rewritten as a native program (a port to Go), and the TypeScript team reported roughly ten-fold faster type-checking on large projects. If check time is your problem, upgrading is the first thing to try (see the TypeScript 7 card); the structural fixes above still apply.'),
  ),
  card('Running TypeScript on Node without a build step: what is type stripping?',
    p('Recent Node versions can run <code>.ts</code> files directly by <strong>stripping</strong> the type annotations (it does not type-check). That is only possible for syntax that is purely types, which is exactly what <code>erasableSyntaxOnly</code> enforces.'),
    table(['Works', 'Does not (needs a transform)'], [
      ['Annotations, interfaces, type aliases, generics, <code>satisfies</code>, <code>as</code>, <code>import type</code>', c('enum') + ', ' + c('namespace') + ' with code, constructor parameter properties, <code>import x = require()</code>'],
    ]),
    code(`node app.ts                      # runs directly on current Node
tsc --noEmit                     # the type check is a separate step

// file extensions are required for relative imports:
import { helper } from './helper.ts';`),
    ul(
      'Pair it with <code>"allowImportingTsExtensions": true</code> (or <code>rewriteRelativeImportExtensions</code>), <code>"verbatimModuleSyntax": true</code> and <code>"erasableSyntaxOnly": true</code>.',
      '<code>tsconfig paths</code> are not applied by Node. Use workspace packages or the <code>imports</code> field in <code>package.json</code> instead.',
      'Good for scripts, tests and services you do not want to bundle; keep a real build for libraries you publish and for front-end code.',
    ),
  ),
  card('Which TypeScript releases changed how you write code (4.9 to 7.0)?',
    table(['Version', 'Feature you will actually use'], [
      ['4.9', c('satisfies') + ': check without widening'],
      ['5.0', 'Standard decorators; <code>const</code> type parameters; <code>moduleResolution: "bundler"</code>; every enum is a union enum'],
      ['5.2', c('using') + ' and <code>await using</code>: explicit resource management (disposables)'],
      ['5.4', c('NoInfer') + '; narrowing preserved in closures after the last assignment'],
      ['5.5', 'Inferred type predicates; <code>isolatedDeclarations</code>; syntax checking of regular expressions'],
      ['5.6', 'Errors for conditions that are always truthy or always nullish (such as <code>if (/regex/)</code> or <code>{} ?? x</code>)'],
      ['5.7', c('rewriteRelativeImportExtensions') + '; errors for variables that are never assigned'],
      ['5.8', c('erasableSyntaxOnly') + '; <code>--module node18</code>; finer return-expression checks'],
      ['5.9', c('--module node20') + '; <code>import defer</code>; a smaller generated <code>tsc --init</code> config'],
      ['6.0', 'The bridge release: the last line of the JavaScript-based compiler, where the options that 7.0 removes are deprecated'],
      ['7.0', 'The native compiler: the same language, much faster checking, legacy options removed (next card)'],
    ]),
    tip('Version details drift quickly. In an interview, name two or three features and what problem each solved rather than reciting a list, and say you check the release notes for the rest.'),
  ),
  card('TypeScript 7: what changed with the native compiler, and what breaks when you upgrade?',
    lede('TypeScript 7 is the <strong>same language on a new engine</strong>: the compiler and the editor language service were ported from JavaScript to native code (Go). You still install <code>typescript</code> and run <code>tsc</code>.'),
    ul(
      '<strong>Why:</strong> speed and memory. The team reported roughly ten-fold faster type-checking on large codebases, and the editor (completions, errors, go-to-definition) gains in the same way.',
      '<strong>What stays the same:</strong> syntax and the type system. Your code means what it meant before.',
      '<strong>What changes:</strong> the edges. Long-deprecated compiler options are removed, and tools that embedded the JavaScript compiler need a release that supports 7.',
    ),
    table(['Removed in 7.0', 'Use instead'], [
      [c('baseUrl'), c('paths') + ' with explicit relative entries'],
      [c('moduleResolution') + ': <code>node10</code> (the old <code>node</code>) and <code>classic</code>', c('nodenext') + ' for Node, ' + c('bundler') + ' for bundled code'],
      [c('module') + ': <code>AMD</code>, <code>UMD</code>, <code>System</code>', 'ES modules, or CommonJS through <code>nodenext</code>'],
      [c('target: "ES5"') + ' and ' + c('downlevelIteration'), 'A modern target; let a bundler down-level if you still must'],
      [c('outFile'), 'A bundler'],
      [c('esModuleInterop: false') + ', ' + c('allowSyntheticDefaultImports: false') + ', ' + c('alwaysStrict: false'), 'Nothing: these behaviours are now always on'],
    ]),
    p('Defaults moved with it: <code>strict</code> is on unless you turn it off, and <code>tsc --init</code> writes a modern config (<code>module: nodenext</code>, <code>target: esnext</code>, <code>verbatimModuleSyntax</code>, <code>isolatedModules</code>, <code>noUncheckedIndexedAccess</code>, <code>exactOptionalPropertyTypes</code>).'),
    p('<strong>Upgrade path:</strong>'),
    ol(
      'Go through the 6.x line first. It is the bridge release, where these options are deprecated rather than removed, so you can clear them one at a time.',
      'Clean up <code>tsconfig.json</code>: replace each removed option using the table above.',
      'Check the tools that load the compiler: type-aware lint rules, bundler and test-runner plugins, code generators. Upgrade them to versions that support 7.',
      'Run <code>tsc --noEmit</code> on 7 in CI next to the old version until the results match, then switch.',
    ),
    tip('Say it like this: “7 is a rewrite of the compiler, not of the language. I get the same errors much faster. The migration work is tsconfig clean-up and tool compatibility, not code changes.”'),
    '<p class="verified">Removed options and <code>tsc --init</code> defaults checked against the TypeScript 7.0 sources on 13 Nov 2026 (7.0.2 is the current npm release). Speed figures are the team’s own: measure on your project before quoting one.</p>',
  ),
];

// ───────────────────────────────────────────── 8. practice
const practice = [
  card('Predict the type: twelve one-liners',
    p('Work each one out before reading the answers.'),
    code(`const a = [1, 'x'];
const b = [1, 'x'] as const;
let c = 'hi';
const d = 'hi';
type K = keyof { a: 1; b: 2 };
type E = Exclude<'a' | 'b' | 'c', 'a' | 'c'>;
type P = Parameters<(a: string, b?: number) => void>;
type O = { a?: string }['a'];
type Z = ('a' | 'b') extends 'a' ? 1 : 0;
const f = <T,>(x: T) => x;
const r = f(null);
const keys = Object.keys({ x: 1 });`, 'Code'),
    code(`a    : (string | number)[]
b    : readonly [1, 'x']
c    : string
d    : 'hi'
K    : 'a' | 'b'
E    : 'b'
P    : [a: string, b?: number | undefined]
O    : string | undefined
Z    : 0     // not a generic alias, so no distribution: 'a' | 'b' is not assignable to 'a'
r    : null
keys : string[]   // not ('x')[]`, 'Answers'),
    tip('If you hesitate on <code>Z</code>: distribution only happens for a <em>naked type parameter</em>. A literal union written inline is checked as a whole.'),
  ),
  card('Predict the type: which of these still narrow, and which do not?',
    code(`type Resp = { ok: true; data: string } | { ok: false; error: Error };

function a(r: Resp) {
  const { ok } = r;            // destructured discriminant, declared with const
  if (ok) return r.data;       // (1) compiles or error?
}

function b(r: Resp) {
  let { ok } = r;              // the same, declared with let
  if (ok) return r.data;       // (2) compiles or error?
}

function c(r: Resp) {
  const isOk = () => r.ok;     // the check hidden behind a function call
  if (isOk()) return r.data;   // (3) compiles or error?
}

function d(items: (string | undefined)[]) {
  const clean = items.filter((x) => x !== undefined);   // (4) type of clean?
}`),
    ul(
      '<strong>(1) Compiles.</strong> Since TypeScript 4.4 a <code>const</code> alias of a discriminant (or of a condition on it) narrows the original object, as long as the object is a <code>const</code>, a <code>readonly</code> property or a parameter that is never reassigned.',
      '<strong>(2) Error.</strong> A <code>let</code> binding can be reassigned, so the compiler does not link it back to <code>r</code>.',
      '<strong>(3) Error.</strong> Narrowing cannot see through a function call. Use a type predicate (<code>(r): r is Ok</code>) if you want a reusable check.',
      '<strong>(4) <code>string[]</code></strong> from TypeScript 5.5 (inferred type predicate). Before that it was <code>(string | undefined)[]</code>.',
    ),
    callout('If a result surprises you, run it in the TypeScript Playground with the compiler version you use. These behaviours changed across 4.x and 5.x, and a quick experiment beats trusting memory.'),
  ),
  quiz('function first<T>(xs: T[]): T { return xs[0]; }  with noUncheckedIndexedAccess on. What happens?',
    ['It compiles: xs[0] is T', 'An error: xs[0] is T | undefined, which is not T', 'T is inferred as unknown', 'An error: T needs a constraint'], 1,
    'With <code>noUncheckedIndexedAccess</code>, indexing an array gives <code>T | undefined</code>, because the array may be empty. The honest signature is <code>function first&lt;T&gt;(xs: readonly T[]): T | undefined</code>.'),
  card('Rapid-fire: twelve short answers',
    ul(
      '<strong>Are interfaces or type aliases faster?</strong> Interfaces are slightly cheaper for the checker; it rarely matters until the types get very large.',
      '<strong>What is a phantom type?</strong> A type parameter that is not used in any member, only to tag the type (branding, units, state).',
      '<strong>What does <code>readonly</code> guarantee?</strong> Compile-time only: it prevents assignment through that reference, not through another alias, and not at run time.',
      '<strong>Difference between <code>unknown</code> and <code>{}</code>?</strong> <code>{}</code> excludes <code>null</code> and <code>undefined</code>; <code>unknown</code> includes everything.',
      '<strong>What is <code>declare</code>?</strong> A promise that something exists at run time (a global, a module) without emitting code.',
      '<strong>What is a namespace?</strong> A legacy way to group code into an object; use ES modules instead. It cannot be erased when it contains values.',
      '<strong>What is a type predicate?</strong> A return type <code>x is T</code> on a function that tells the compiler what a <code>true</code> result means.',
      '<strong>What is <code>this</code> typing for?</strong> A fake first parameter that documents and checks the receiver of a method; it is erased.',
      '<strong>What does <code>keyof typeof obj</code> give?</strong> The union of the object\'s own literal keys.',
      '<strong>What does <code>!</code> do after an expression?</strong> Tells the compiler it is not <code>null</code> or <code>undefined</code>. It is a cast: use it sparingly and only with a reason in a comment.',
      '<strong>Why is <code>[] as const</code> not assignable to <code>string[]</code>?</strong> It is <code>readonly []</code>, and a readonly array is not assignable to a mutable one.',
      '<strong>When would you reach for a conditional type?</strong> When an output type must be computed from an input type and a union or overloads cannot express it; otherwise prefer the simpler option.',
    ),
  ),
];

// ───────────────────────────────────────────── assemble
const data = [
  { id: 'quickref', title: 'Quick Reference', questions: [] },
  { id: 'ts1', title: '1. The Type System Model', questions: model },
  { id: 'ts2', title: '2. Declaring Types', questions: declaring },
  { id: 'ts3', title: '3. Narrowing & Control Flow', questions: narrowing },
  { id: 'ts4', title: '4. Generics', questions: generics },
  { id: 'ts5', title: '5. Type-Level Programming', questions: typeLevel },
  { id: 'ts6', title: '6. Patterns for Real Code', questions: patterns },
  { id: 'ts7', title: '7. TypeScript in the Real World', questions: realWorld },
  { id: 'ts8', title: '8. Practice & Rapid-Fire', questions: practice },
];
H.regenQuickRef(data);

const html = await H.newPage(
  {
    key: 'typescript',
    title: 'TypeScript Interview Mastery',
    brand: 'TypeScript',
    brandSub: 'types · generics · patterns',
    h1: 'TypeScript interview prep',
    eyebrow: 'Prep guide',
    lede: 'How the type system really works: structural typing, narrowing, generics, conditional and mapped types, real-world patterns, tooling and migration, with diagrams, quizzes and predict-the-type puzzles.',
  },
  data,
);

const { mkdir } = await import('node:fs/promises');
await mkdir(new URL('../../app/typescript/', import.meta.url), { recursive: true });
const total = await lib.save('typescript', await lib.upgrade(html));
console.log('typescript guide written: ' + data.length + ' sections, ' + total + ' cards');
