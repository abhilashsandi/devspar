// Expands the TypeScript section of the Interview Cheatsheet with one-line answers, each linking to
// the matching card in the full TypeScript guide.
//   node scripts/study/add-typescript-cheatsheet.mjs && npm run study:build
// Safe to re-run: addCards skips any title that already exists on the page.
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { plainTitle } from './parsePage.mjs';

const ts = await lib.load('typescript');

// [cheatsheet title, one-line answer (HTML), prefix of the full-guide card it links to]
const rows = [
  ['Types are erased', 'Types exist only at compile time and are removed on emit, so data from outside needs a run-time schema; <code>x as User</code> is a promise, not a check.', 'What does TypeScript do at build time'],
  ['Structural typing', 'Types are compatible when their <em>shapes</em> match, whatever their names; use a branded type when you need nominal behaviour.', 'Why does TypeScript use structural typing'],
  ['strict and tsconfig', 'Start with <code>strict</code>, then add <code>noUncheckedIndexedAccess</code>, <code>exactOptionalPropertyTypes</code> and <code>verbatimModuleSyntax</code>; when migrating, enable <code>strictNullChecks</code> last.', 'Which tsconfig options should every new project'],
  ['unknown vs. any', 'Both accept any value; <code>unknown</code> forces you to narrow before use, <code>any</code> switches checking off. Use <code>unknown</code> for external data.', 'When is each of any, unknown'],
  ['satisfies vs. as vs. annotation', '<code>satisfies</code> validates without widening, an annotation widens to the declared type, and <code>as</code> overrides the compiler unchecked.', 'satisfies, a type annotation and'],
  ['Exhaustive switch', 'Discriminated union plus <code>switch</code>; in <code>default</code> the value is <code>never</code>, so <code>assertNever(x)</code> turns a new union member into a compile error.', 'How do you write an exhaustive switch'],
  ['Type guards', '<code>x is T</code> tells the compiler what a <code>true</code> result means, <code>asserts x is T</code> throws otherwise. The body is trusted, not verified; 5.5 infers simple predicates.', 'User-defined type guards and assertion'],
  ['enum vs. literal union', 'Prefer a union of literals or an <code>as const</code> object: enums emit run-time code and clash with <code>erasableSyntaxOnly</code> and Node type stripping.', 'Why do many teams avoid enum'],
  ['keyof with generics', '<code>K extends keyof T</code> ties a key to its object so <code>T[K]</code> is the exact property type: the basis of type-safe <code>get</code> and <code>pick</code>.', 'keyof and indexed access with generics'],
  ['Variance', 'Producers are covariant, consumers contravariant (<code>strictFunctionTypes</code>); arrays are covariant too, which is unsound; <code>in</code>/<code>out</code> annotate it.', 'Variance: what are covariance'],
  ['Utility types', '<code>Partial</code>, <code>Pick</code>, <code>Omit</code>, <code>Record</code>, <code>Exclude</code>, <code>ReturnType</code> are all mapped or conditional types; <code>Omit</code> does not check that the key exists.', 'Which built-in utility types'],
  ['Conditional types and infer', '<code>T extends U ? X : Y</code>; <code>infer</code> captures a piece of the match; a naked type parameter distributes over a union, <code>[T]</code> turns that off.', 'Conditional types: how do infer'],
  ['Branded types', 'Intersect with a phantom property so a <code>UserId</code> is not an <code>OrderId</code>; the brand is erased, so it costs nothing at run time.', 'Branded (opaque) types'],
  ['Validate at the boundary', 'Parse HTTP bodies, <code>JSON.parse</code> output and env vars with a schema (Zod, Valibot) and derive the type from it; trust the types inside.', 'Compile-time types vs run-time validation'],
  ['Migrating JS to TS', '<code>allowJs</code>, convert leaf files first, ratchet strict flags one at a time, validate the boundaries, and make new code strict from day one.', 'How would you migrate a large JavaScript'],
  ['ts-expect-error vs. ts-ignore', '<code>@ts-expect-error</code> fails when the error disappears, so it cannot rot; <code>@ts-ignore</code> and <code>as any</code> hide problems for good. Lint for a reason.', '@ts-ignore vs @ts-expect-error'],
  ['Running .ts on Node', 'Node strips types and runs erasable syntax only (no enums or parameter properties); it does not type-check, so keep <code>tsc --noEmit</code> in CI.', 'Running TypeScript on Node 24'],
  ['Slow tsc', 'Measure with <code>--extendedDiagnostics</code> or <code>--generateTrace</code>; usual causes are huge unions and deep conditional types; fix with project references and a separate transpiler.', 'Why can compilation be slow'],
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
// Rebuild this script's own cards on every run (so wording or link changes take effect); the original
// hand-written cards in the section are left alone.
const ours = new Set(cards.map((c) => c.q));
const sec = H.section(data, 'typescript');
sec.questions = sec.questions.filter((q) => !ours.has(q.q));
const added = H.addCards(data, 'typescript', cards);
const total = await lib.save('interview-cheatsheet', await lib.upgrade(lib.withData(html, data)));
console.log('cheatsheet: added ' + added + ' TypeScript cards (' + total + ' cards on the page)');
