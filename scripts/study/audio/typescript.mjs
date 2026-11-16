// Audio overview of the TypeScript guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the TypeScript guide. TypeScript is hard to learn by ear, because so much of it lives in punctuation. So this overview leaves the syntax on the page and gives you the ideas: what the compiler is doing, why it behaves the way it does, and the sentences interviewers like to hear.

There are eight sections. The model behind the type system, declaring types, narrowing, generics, type level programming, patterns for real code, TypeScript in real projects, and a practice section.

If you remember one thing, make it this. TypeScript is a static checker plus a compiler that erases types. At run time there is only JavaScript. A surprising number of interview answers follow from that sentence.`,

  chapters: {
    ts1: `Section one is the mental model. At build time the compiler reads your code, works out a type for every expression and reports mismatches. Then the types are erased. Nothing checks them while the program runs.

TypeScript uses structural typing. Two types are compatible when their shapes match, and names do not matter. That suits JavaScript, where code is written against shapes, and it makes test doubles easy. When you need two types with the same shape to stay apart, such as two kinds of id, you add a brand. More on that later.

On configuration, start strict and stay strict. Loosening a flag later is easy. Tightening it in a large codebase is a migration project. The strict setting is a bundle, and each member can be switched off on its own, which is how a gradual migration works.

For the special types, here is the sentence interviewers like. Unknown is the type safe any. Both accept everything, but unknown makes you prove what a value is before you use it. And never is the type with no values, the result of ruling everything out.

TypeScript is deliberately not fully sound, because usability for real JavaScript wins over a proof. One known hole: an array of dogs is accepted where an array of animals is expected, and then somebody can push a cat into it.

Last, widening. A constant keeps its narrowest type, and a variable that can be reassigned widens to the general one. Marking a value as const keeps the literal types and makes it read only. And the satisfies keyword checks an object against a type without widening it.`,

    ts2: `Section two is about declaring types, and it opens with a favourite question: type alias or interface?

For plain object shapes they are almost interchangeable. The differences are small but real. Interfaces with the same name merge into one, which is how libraries let you extend their types. Type aliases can describe unions and other things an interface cannot. A common team rule is to use interfaces for public object shapes that others may extend, and type aliases for everything else.

Many teams avoid enums. A regular enum is one of the few TypeScript features that produces run time code, so it cannot simply be erased. The usual replacement is a union of string literals, or a constant object.

Tuples are fixed length arrays where each position has its own type. That is how a state hook returns a value and a setter. For function parameters, prefer read only arrays, which promise the caller that you will not change their data.

For dictionaries, a record with a known set of keys checks that every key is present. A record with any string key is an open dictionary, and it trusts that every key you ask for exists.

Optional and undefined are not the same thing. An absent key and a key set to undefined can mean different things in an update request: leave it unchanged, or clear it. There is a compiler option that makes TypeScript respect that difference.

For classes, the private keyword is erased and can be bypassed at run time. A field with a hash prefix is enforced by the runtime itself.`,

    ts3: `Section three is narrowing, the feature that makes TypeScript pleasant to use.

Control flow analysis refines a variable's type inside a branch, based on the checks you wrote. Check that a value is a string, and inside that branch it is a string. The compiler understands type checks, instance checks, truthiness, checks for a property, and comparisons with a literal.

The most useful pattern built on this is the discriminated union. Each member of the union has one shared property with a different literal value, often called kind or status. Switch on that property, and inside each case the compiler knows exactly which member you have.

That leads to the exhaustive switch. In the default case, every member has been ruled out, so the value has the type never. Pass it to a function that only accepts never. Now, when someone adds a new member to the union, the value in the default case is no longer never, and the code stops compiling until the new case is handled. This is one of the best answers you can give to the question of how TypeScript prevents bugs.

You can write your own guards: a function that returns true or false and tells the compiler what that means for the type. Be careful. The compiler does not verify the body of a guard, so a wrong guard silently breaks every place that calls it.

And narrowing can disappear. Inside a callback, the narrowing of an object's property is dropped, because the object could have changed before the callback runs. The fix is to copy the value into a constant first.`,

    ts4: `Section four is generics.

A generic lets one function or type work across many types while remembering which one it was given. Without generics you choose between two bad options: write the same function again for each type, or give up and use any. A constraint limits what the type parameter may be, so that inside the function you can safely use the properties you required.

Inference usually picks the type argument for you. The compiler collects candidates from every argument that mentions the type parameter and picks the best common one. When candidates conflict, you get an error at the argument that does not fit. Pass the type explicitly only when there is nothing to infer from.

The key building block is tying a key to an object. A function takes an object and one of its keys, and returns exactly the type of that property, not a union of all the property types. That idea is behind every type safe get or pick.

Variance sounds hard and is simple in words. If a dog is an animal, can a box of dogs stand in for a box of animals? For something you only read from, yes. That is covariance. For something that consumes values, like a function parameter, the direction reverses: a handler of animals can stand in for a handler of dogs. That is contravariance.

Finally, know when generics are over engineering. One generic is enough when the output type is derived from the input type. A union is enough when you accept a few concrete kinds and treat them the same way.`,

    ts5: `Section five is type level programming: writing types that compute other types.

Start with the built in utility types you use every day. Partial makes every property optional. Pick and Omit select or remove properties. Record builds a dictionary type. One surprise is worth knowing: Omit does not check that the keys you name exist, so a typo compiles and silently changes nothing.

Conditional types are an if statement for types. If this type fits that one, the result is one thing, otherwise another. Inside a conditional type, the infer keyword pulls out a piece, such as the return type of a function or the element type of an array.

Distribution is the part that trips people up. When a conditional type is applied to a union through a bare type parameter, it is applied to each member separately, and the results are joined again. So turning a union of string and number into arrays gives you an array of strings or an array of numbers, not one mixed array.

Mapped types loop over the keys of a type and build a new type, changing the keys, the values, or whether properties are optional or read only. Template literal types build string types from pieces, which is how typed routes and event names work.

A principle to say out loud: derive types from values, so there is one source of truth. Define the list once as a constant and compute the type from it.

And know the limit. Recursive types are powerful, the compiler gives up at a certain depth, and very clever types slow the build down for everyone.`,

    ts6: `Section six collects patterns for real code.

Branded types solve a problem that structural typing creates. A user id and an order id are both strings, so the compiler lets you pass one where the other is expected. A brand adds a marker that exists only in the type system, so there is no run time cost, and the two can no longer be mixed. Use it for ids, validated emails, sanitised markup, money in different currencies, and units.

Result types model expected failure in the type instead of throwing. TypeScript has no checked exceptions. A function's signature never says what it can throw, and what you catch has an unknown type. So for failures you expect, such as a validation error or a missing record, return a value that is either a success or a failure, and the compiler makes the caller handle both. Keep exceptions for bugs and truly exceptional situations.

A type safe event emitter uses one map from event names to payloads. That single definition gives you both the handler signature and the emit signature, so you cannot emit an event with the wrong data.

When a function's return type depends on its argument, a lookup type beats a pile of overloads, because adding a new case is one line.

Declaration merging is how you add a property to a type you do not own, such as the request object in Express or the browser window.

And a classic question: why does asking an object for its keys give you plain strings? Because an object may have more keys at run time than its type mentions, so the honest answer is string.`,

    ts7: `Section seven is TypeScript in real projects, and its first point is the most important in the guide.

Types describe what you believe about data. Only a run time check can establish it. Telling the compiler that a parsed response is a user does not make it one. At every boundary where data enters, such as request bodies, parsed JSON, environment variables and storage, validate with a schema and derive the type from the schema.

For async code, declare the promise's type explicitly, and turn on the lint rules that catch a promise nobody awaited.

On modules, a type only import is guaranteed to vanish from the output, which avoids accidental side effects and circular imports. Declaration files hold only types and no code. Libraries ship them next to their JavaScript, or the community publishes them separately.

In a monorepo, project references split the code into projects that are built in dependency order, and unchanged ones are skipped.

Migration is a common interview scenario. Add the compiler without changing behaviour, letting TypeScript and JavaScript files live side by side. Convert the leaves first, the utilities with no dependencies. Tighten the strict flags one at a time.

When you must silence an error, prefer the comment that expects an error, with a reason. If the error ever goes away, that comment itself becomes an error, so it cannot rot.

Two newer things. Recent Node versions can run TypeScript files directly by stripping the types, without checking them. And TypeScript seven is the same language on a new engine: the compiler was ported to native code for speed.`,

    ts8: `The last section is practice, and it works well as a self test while you drive. Here are the ideas behind its questions.

Predict the type exercises mostly test three rules you have already heard. First, widening: a constant keeps its literal type, and a reassignable variable widens. Second, distribution: it only happens for a bare type parameter, so wrapping the parameter changes the result. Third, narrowing: a truthiness check removes null and undefined from a type, but the type system does not remove the empty string or zero.

One quiz is worth remembering in detail. With the option for unchecked index access turned on, reading the first element of an array gives you the element type or undefined, because the array might be empty. A function that promises to return an element then fails to compile. That is the compiler being right. Either handle the empty case, or change what the function promises.

Another: marking an object as const makes its properties read only, so assigning to one is a compile error. It is not a run time error, because nothing is frozen. The types are erased.

And the rapid fire round includes a nice one. Are interfaces or type aliases faster? Interfaces are slightly cheaper for the checker, and it rarely matters until the types get very large.

A final piece of advice from the guide. Version details drift quickly. In an interview, name two or three features and the problem each one solved, and say that you check the release notes for the rest.`,
  },
};
