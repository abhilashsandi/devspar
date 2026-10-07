// Fills the TypeScript section of the Interview Cheatsheet with short answers (2 to 3 sentences, enough
// that the reader does not have to click through), each still linking to the matching card in the full
// TypeScript guide.
//   node scripts/study/add-typescript-cheatsheet.mjs && npm run study:build
// Safe to re-run: this script's own cards are rebuilt each time, and the original cards in the section
// keep their link and only get their answer text refreshed.
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { plainTitle } from './parsePage.mjs';

const ts = await lib.load('typescript');

// The four cards that were already in the section (they link to the interview-prep guide): new answer text only.
const ORIGINAL = {
  'Why TypeScript': 'Catches a whole class of bugs before a test even runs: shape mismatches, wrong argument counts, missing null checks. It also gives safe refactors and accurate autocompletion across a large codebase, and the types are erased on build, so there is no run-time cost. The limit: it checks your code, not incoming data, so API responses still need run-time validation.',
  'Generics': 'Write a function or type once and have it work across many types while remembering which one flowed through, instead of widening to <code>any</code>. A constraint such as <code>T extends { id: string }</code> says what the type must support. A useful rule: if a type parameter appears only once in a signature, it relates nothing and you can probably drop it.',
  'Type vs. interface': 'For plain object shapes they are nearly interchangeable. Interfaces support declaration merging (how libraries expose <code>Window</code> or the Express <code>Request</code> for extension) and give clearer errors on <code>extends</code>; type aliases can also express unions, tuples, mapped and conditional types. A common rule: interface for public, extendable shapes, type for everything else, and stay consistent.',
  'forwardRef with generics': '<code>forwardRef</code> returns a non-generic component type, so your component\'s type parameter is lost at the call site. Either cast the result back to a generic function signature, or (React 19) take <code>ref</code> as an ordinary prop, which keeps the component a plain generic function and needs no cast.',
};

// [cheatsheet title, answer (HTML), prefix of the full-guide card it links to]
const rows = [
  ['Types are erased', 'Types exist only at compile time and are removed when the code is emitted, so nothing checks them at run time. That is why data from outside (HTTP bodies, <code>JSON.parse</code>, env vars) needs a run-time schema such as Zod; <code>x as User</code> is a promise to the compiler, not a check. Inside the boundary you can then trust the types.', 'What does TypeScript do at build time'],
  ['Structural typing', 'Two types are compatible when their shapes match, whatever their names, so any object with the right members satisfies an interface (handy for test doubles). The downside is that unrelated concepts with the same shape, like a <code>UserId</code> and an <code>OrderId</code> string, are interchangeable. When you need nominal behaviour, use a branded type.', 'Why does TypeScript use structural typing'],
  ['strict and tsconfig', 'Start with <code>strict: true</code> (<code>strictNullChecks</code>, <code>noImplicitAny</code> and friends), then add <code>noUncheckedIndexedAccess</code>, <code>exactOptionalPropertyTypes</code> and <code>verbatimModuleSyntax</code>, which are not part of <code>strict</code>. When migrating an existing codebase, switch flags on one at a time and enable <code>strictNullChecks</code> last, because it produces the most errors.', 'Which tsconfig options should every new project'],
  ['unknown vs. any', 'Both accept every value, but <code>any</code> switches checking off in both directions, while <code>unknown</code> forces you to narrow (<code>typeof</code>, <code>instanceof</code>, a guard or a schema) before you can use it. Use <code>unknown</code> for anything from outside your code (JSON, <code>catch (e)</code>, third-party callbacks) and treat <code>any</code> as a temporary escape hatch.', 'When is each of any, unknown'],
  ['satisfies vs. as vs. annotation', 'An annotation (<code>const x: T</code>) checks the value and then widens the variable to <code>T</code>. <code>satisfies T</code> (TypeScript 4.9) checks against <code>T</code> but keeps the narrower inferred type, so config objects and lookup tables keep precise autocompletion. <code>as T</code> checks nothing: it overrides the compiler, so each one is a small risk.', 'satisfies, a type annotation and'],
  ['Exhaustive switch', 'Model state as a discriminated union (a shared literal field such as <code>kind</code>) and <code>switch</code> on it; each case narrows to one member. In <code>default</code> the value has type <code>never</code>, so passing it to <code>assertNever(x)</code> turns a newly added union member into a compile error at every switch that forgot to handle it.', 'How do you write an exhaustive switch'],
  ['Type guards', 'A function returning <code>x is T</code> tells the compiler what a <code>true</code> result means, and an assertion function (<code>asserts x is T</code>) throws otherwise. The compiler trusts the body without verifying it, so a wrong guard silently breaks every caller. TypeScript 5.5 infers predicates for simple arrow functions, so <code>.filter(x =&gt; x !== undefined)</code> now narrows, while <code>.filter(Boolean)</code> still does not.', 'User-defined type guards and assertion'],
  ['enum vs. literal union', 'Prefer a union of string literals (<code>\'idle\' | \'loading\'</code>), or an <code>as const</code> object when you also need the values at run time. Regular enums emit extra run-time code, so they clash with <code>erasableSyntaxOnly</code> and Node\'s type stripping, and <code>const enum</code> breaks under <code>isolatedModules</code>. A union costs nothing and works everywhere.', 'Why do many teams avoid enum'],
  ['keyof with generics', '<code>K extends keyof T</code> ties a key to its object, so the return type <code>T[K]</code> is the exact type of that property, not a union of all of them. It is the building block of type-safe <code>get</code>, <code>pick</code> and form or query-builder helpers: <code>get(user, \'age\')</code> is a compile error if <code>age</code> is not a key.', 'keyof and indexed access with generics'],
  ['Variance', 'If <code>Dog</code> extends <code>Animal</code>, a producer of <code>Dog</code> can stand in for a producer of <code>Animal</code> (covariant), but a consumer of <code>Animal</code> can stand in for a consumer of <code>Dog</code>, not the reverse (contravariant, enforced for function parameters under <code>strictFunctionTypes</code>). Arrays are treated as covariant even though that is unsound, and <code>in</code> / <code>out</code> annotations (4.7) state variance explicitly.', 'Variance: what are covariance'],
  ['Utility types', '<code>Partial</code>, <code>Required</code>, <code>Readonly</code>, <code>Pick</code>, <code>Omit</code>, <code>Record</code>, <code>Exclude</code>, <code>Extract</code>, <code>ReturnType</code>, <code>Parameters</code> and <code>Awaited</code> are all built from mapped and conditional types; you should be able to write <code>Partial</code> and <code>Exclude</code> from memory. Watch out: <code>Omit&lt;T, K&gt;</code> does not check that <code>K</code> is a real key, so a typo compiles silently.', 'Which built-in utility types'],
  ['Conditional types and infer', '<code>T extends U ? X : Y</code> picks a type based on another type, and <code>infer</code> captures part of the match (<code>T extends Promise&lt;infer R&gt; ? R : T</code>). A conditional on a naked type parameter distributes over a union, which is why <code>Exclude</code> works; wrapping it as <code>[T] extends [U]</code> turns that off. <code>never</code> is the empty union, so a distributed conditional over <code>never</code> gives <code>never</code>.', 'Conditional types: how do infer'],
  ['Branded types', 'Intersect a type with a phantom property (<code>string &amp; { __brand: \'UserId\' }</code>) so a <code>UserId</code> is not assignable to an <code>OrderId</code> or to a plain string, and create values only in a validating constructor function. The brand exists only in the type system, so it costs nothing at run time.', 'Branded (opaque) types'],
  ['Validate at the boundary', '<code>JSON.parse(s) as User</code> is a lie, because types are erased. Parse every external input (HTTP bodies, env vars, queue messages) once at the edge with a schema library such as Zod or Valibot, and derive the type from the schema (<code>z.infer</code>) so validator and type cannot drift. Inside that boundary the types can be trusted.', 'Compile-time types vs run-time validation'],
  ['Migrating JS to TS', 'Add the compiler with <code>allowJs</code> so JavaScript and TypeScript files coexist, then convert leaf modules first and work inward, one file at a time. Ratchet the strict flags on gradually (a CI check that the error or <code>any</code> count never rises), give API boundaries real schemas, and require strict mode in new code from day one so the problem stops growing.', 'How would you migrate a large JavaScript'],
  ['ts-expect-error vs. ts-ignore', '<code>@ts-expect-error</code> silences the next line but itself errors once the problem is fixed, so it cannot rot; <code>@ts-ignore</code> and <code>as any</code> hide problems indefinitely and can mask new errors. Enforce a written reason with the <code>ban-ts-comment</code> lint rule. <code>@ts-expect-error</code> is also how you write negative type tests.', '@ts-ignore vs @ts-expect-error'],
  ['Running .ts on Node', 'Current Node versions can run <code>.ts</code> files directly by stripping the type annotations. That only works for erasable syntax: no enums, namespaces with code or constructor parameter properties (<code>erasableSyntaxOnly</code> enforces this), and relative imports need the <code>.ts</code> extension. Node does not type-check, so keep <code>tsc --noEmit</code> in CI.', 'Running TypeScript on Node 24'],
  ['Slow tsc', 'Measure first with <code>tsc --extendedDiagnostics</code> or <code>--generateTrace</code> to find the file or type that dominates. Usual causes are huge unions, deeply nested conditional or recursive types and heavy intersections; fixes are <code>incremental</code> builds, project references with <code>tsc -b</code>, <code>skipLibCheck</code>, <code>import type</code>, and letting esbuild or swc transpile while <code>tsc</code> only checks.', 'Why can compilation be slow'],
];

// Titles where cutting at the first comma or colon would leave a fragment.
const LABELS = {
  'When is each of any, unknown': 'Which of any, unknown, never, void and object to use',
  'satisfies, a type annotation and': 'satisfies vs. a type annotation vs. as',
  'Conditional types: how do infer': 'Conditional types: infer and distribution',
  'How do you write an exhaustive switch': 'An exhaustive switch over a union',
  'How would you migrate a large JavaScript': 'Migrating a large JavaScript codebase',
  'Variance: what are covariance': 'Variance, covariance and contravariance',
};

const cards = rows.map(([title, answer, target]) => {
  const { s, i } = H.findCard(ts.data, target);
  const label = plainTitle(ts.data.find((x) => x.id === s.id).questions[i].q);
  return {
    q: title,
    a: '<p>' + answer + '</p><p class="deeper">Full answer: <a href="/typescript#' + s.id + ':' + i + '" target="_top">typescript → ' + (LABELS[target] ?? label.split(/[:?,]/)[0].trim()).replace(/&/g, '&amp;') + '</a></p>',
  };
});

const { html, data } = await lib.load('interview-cheatsheet');
const sec = H.section(data, 'typescript');

// Refresh the original cards' text, keeping their existing link paragraph.
for (const q of sec.questions) {
  const text = ORIGINAL[q.q];
  if (text) q.a = q.a.replace(/^<p>[\s\S]*?<\/p>/, '<p>' + text + '</p>');
}

// Rebuild this script's own cards on every run so wording or link changes take effect.
const ours = new Set(cards.map((c) => c.q));
sec.questions = sec.questions.filter((q) => !ours.has(q.q));
const added = H.addCards(data, 'typescript', cards);

const total = await lib.save('interview-cheatsheet', await lib.upgrade(lib.withData(html, data)));
console.log('cheatsheet: ' + added + ' TypeScript cards rebuilt, ' + Object.keys(ORIGINAL).length + ' originals refreshed (' + total + ' cards on the page)');
