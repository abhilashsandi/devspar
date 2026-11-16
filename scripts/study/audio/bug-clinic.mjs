// Audio overview of the Bug Clinic guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the Bug Clinic. The guide holds fifty short pieces of broken code, each with a symptom, and asks you to find the bug. You cannot read code while you drive, so this overview gives you the other half: the symptom, and the cause behind it.

That pairing is what an experienced engineer carries around. They hear that three timers all log the same number, and they already know where to look.

There are seven sections: how to find a bug out loud, then JavaScript, React, Node, TypeScript, Next.js and CSS. For each bug I will describe what you see and why it happens. Later, open the cards and find the bug in the code yourself.`,

  chapters: {
    bc0: `The first section is one card, and it is the method.

A find the bug question tests whether you can reason about code out loud. Spotting the bug in silence earns less than a clear walk through that arrives a little later. The interviewer cannot give credit for thinking they cannot hear.

So work in a fixed order. First, say what the code is meant to do, in one sentence. That shows you have read it, and it gives you something to measure the code against. Second, trace it with one concrete input. Pick a small, real value and follow it through, line by line, saying what each variable holds. Most bugs show themselves at the line where what you expected and what the code does part company.

Third, when you find the difference, name the cause and not just the line. The loop variable is shared by all three callbacks is a cause. Line four is wrong is not. Fourth, give the fix, and say how you would confirm it, usually a test with the input that failed. Last, mention what else you noticed, such as a missing error path, without getting lost in it.

There is also a list of usual suspects to run through when you are stuck. Is something asynchronous not being waited for? Is something being changed in place that should have been copied? Is a value captured too early, or read too late? Is a check passing for a value it should reject, such as zero, an empty string or null?

Those four questions cover a large share of the bugs that follow.`,

    bc1: `JavaScript, fifteen bugs. Here are the causes, grouped.

First, closures and this. Three timers all log three, because a variable declared with var is shared by the whole function, and a closure captures the variable, not its value at that moment. A method that works when called directly crashes as a callback, because this is decided by how a function is called, not where it is defined.

Next, async mistakes. Done is logged before anything is saved, because for each ignores the promises its callback returns. A try and catch does not catch the error, because it only catches a rejection if the promise is awaited inside the try. And search results sometimes show an older query. That is a race: responses can arrive in any order, and the slow one lands last.

Then values that are not what they seem. A cart total fails an equality check because numbers are binary floating point, so never store money as a fraction. A quantity of zero turns into ten because the or operator falls back for any falsy value. The nullish operator falls back only for null and undefined. A check for an object crashes on null, because the type of null is reported as object.

Then copying and mutation. Sorting numbers gives the wrong order, because without a comparator sort compares them as strings, and it also changes the original array. Editing a copy changes the original, because spread copies only one level. Changing one grid row changes every row, because fill put the same inner array in every slot.

And three small traps. Braces in an arrow function need an explicit return. Passing parse int to map gives it the index as a radix. And a date with no time is read as midnight in UTC, which is the previous evening in the Americas.`,

    bc2: `React, fifteen bugs. Most come from four ideas.

The first idea is identity. Delete a row, and its typed text appears in the row that moved up. The index was used as the key, so the row that moved up inherited the deleted row's key, and React kept that element and its state. An input that loses focus after every keystroke has a related cause: a component defined inside another component is a new component type on every render, so React unmounts and remounts it.

The second idea is that state is a snapshot for each render. A counter stops at one because the effect ran once and captured the count from the first render. That is a stale closure. Clicking once should add three but adds one, for the same reason: the count is the same value for the whole handler. Use the updater form, which receives the latest value. And adding an item does not update the list when the array was mutated, because React sees the same reference and skips the render.

The third idea is effects. A profile that does not change when another user is selected has a missing dependency. A component that renders forever has an object created during render as a dependency, which is new every time. The wrong user's data flashing up is a race between two requests with no cleanup. And a handler that keeps firing after the component is gone never removed its listener.

The fourth idea is what you hand to React. A stray zero appears because the and operator returns its left side when that is falsy, and React renders zero. A click handler that runs during render was called, not passed. Hooks must run in the same order on every render, so never return before one. And a hydration error means the server and the browser produced different markup, usually from the clock, the timezone or browser storage.

Two form bugs complete the set: state copied from a prop only uses the first value, and an undefined value makes an input uncontrolled.`,

    bc3: `Node, six bugs. Each one is a production incident in miniature.

A not found check never triggers. Requests for users that do not exist return a success with an empty object. The cause is a missing await. The lookup returns a promise, and a promise object is always truthy, so the check never fires, and the promise itself is sent as an empty object.

One slow request makes the whole API unresponsive. While a report is generated, health checks time out. Node runs JavaScript on one thread. Synchronous file reads, synchronous hashing and parsing a very large document all block the event loop, and nothing else can run until they finish. Use the asynchronous versions, or move heavy work to a worker.

Cannot set headers after they are sent. Sending a response does not end the function. After the error response, execution carries on, creates the order anyway, and tries to respond a second time. Every early response needs a return. Notice the worse half of that bug: the invalid order was still created.

Users occasionally see someone else's data. The current user was stored in a variable at module level, which is shared by every request in the process. One request sets it and waits, another overwrites it, and the first resumes and reads the wrong user. Keep request data on the request.

A failing request hangs until it times out. Express four does not look at the promise an async handler returns, so a rejection never reaches the error handler and no response is sent. Express five forwards it automatically.

And the search endpoint that can read any table is SQL injection: user input was joined into the query text. Never build SQL from strings. Use parameters.`,

    bc4: `TypeScript, five bugs, and they share one lesson. The compiler only knows what you told it, and some of the things we tell it are not checks at all.

The code type checks and crashes on real data. Types are erased at build time. Parsing a response gives a value the compiler knows nothing about, and declaring it to be a user is a promise to the compiler, not a check. If the API returns an error object or renames a field, nothing notices until the property is used. Validate data where it enters the program.

A safe lookup crashes when the item is missing. Searching a list can return undefined. The exclamation mark removes undefined from the type without checking anything, so a missing product reaches the next line at run time. The sentence from the guide: the exclamation mark and the as keyword silence the compiler, they do not make the code safe.

A new status shows a blank label. Refunded was added to the union, the switch did not handle it, and the compiler said nothing, because without an explicit return type the function was inferred to sometimes return undefined. The fix is a never check in the default branch, so that adding a member stops the build until it is handled.

A dictionary lookup returns undefined that the types said was there. A record keyed by any string claims that every key has a value. Indexing it gives you a number, not a number or undefined, unless the option for unchecked index access is on. The same applies to arrays.

And an error handler that crashes on the error. Anything can be thrown: an error object, a string, a network failure with no response. Typing the caught value as any switches off the checks that would have made you look. Under strict settings it is unknown, for exactly this reason.`,

    bc5: `Next.js, five bugs. Every one comes from confusion about where code runs.

The build fails with a message that you are importing a component that needs state. In the App Router, components are server components by default. They run only on the server, so they cannot use state, effects or event handlers. The fix is not to mark the whole page as a client component. Keep the page on the server, and move only the interactive piece into its own client component.

Window is not defined, even though the component is marked as a client component. A client component is still rendered on the server to produce the first markup, and made interactive in the browser afterwards. Browser only APIs do not exist during that server render. Use client means also runs in the browser, not only in the browser. So read from the window or from storage inside an effect.

An API key shows up in the browser bundle. Variables with the public prefix are copied into client code at build time. That prefix exists to publish values. A secret must never have it, and must never be read in a client component.

The page keeps showing data from the day it was deployed. Nothing in the page depends on the request, so Next.js prerendered it at build time and serves that same result to everyone. The query ran once, during the build. Decide how fresh each page needs to be, and say so in the code, with a revalidation time or on demand invalidation.

Any signed in user can delete any post. A server action is a public endpoint. Hiding the button is not access control. The action must check who is calling, whether the post is theirs, and that the input is valid.`,

    bc6: `CSS, four bugs that nearly everyone has lost an afternoon to.

A dropdown with a z index of nine thousand nine hundred and ninety nine still hides behind the header. A z index only competes within its own stacking context. Several properties create a new context: a transform, an opacity below one, a filter. In this case a transform on the card created one. The menu's huge number is ranked only inside the card, and the card itself sits below the header. The fix is to raise the card, or to render the menu outside it, for example in a portal.

Text will not truncate inside a flex row. A long file name pushes the row wider instead of showing an ellipsis. A flex item has an automatic minimum width, which means it will not shrink below the width of its content. So the item grows to fit the whole name, and the truncation never has anything to cut. Set the minimum width of the flex item to zero.

A full height screen is cut off on phones. The button at the bottom is hidden behind the browser's toolbar. On mobile browsers, one hundred viewport height units is the height with the toolbars retracted, so when they are visible the element is taller than what you can see. Use the dynamic viewport unit, which follows the toolbars.

A sticky table header scrolls away. Two things. Sticky needs an offset, such as top zero, to know where to stick. And it sticks within its nearest scrolling ancestor. Any ancestor with overflow set to something other than visible becomes that container. So an overflow hidden on a wrapper, added for some unrelated reason, quietly breaks the header.

That is all fifty. Open the cards and find each one in the code.`,
  },
};
