// Audio overview of the Coding Practice guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the Coding Practice guide. You cannot write code while you drive, so this overview does something different. It gives you the idea behind each problem: the signal in the question that tells you which technique to reach for.

That is most of the battle in a coding round. Candidates rarely fail because they cannot type a loop. They fail because they do not recognise the pattern in time.

There are five sections: arrays and strings, implementations and async code, React exercises, plain JavaScript with APIs, and a deep dive with seven more exercises. For each problem, listen for the trigger and the one line plan. Then write the code later, from memory.`,

  chapters: {
    'coding-arrays': `Arrays and strings are where most coding rounds start, and each classic problem has one key move.

Two numbers that add up to a target. Checking every pair is quadratic. The faster way trades space for time: walk the array once, and for each number ask whether you have already seen the number that completes it. A map answers that at once.

Matching brackets. The moment you need to match the most recently opened item first, that is a signal for a stack. Merging overlapping intervals: sort by start time first, and then any two that overlap must be neighbours, so a single scan finishes the job. Grouping anagrams: sort the letters of each word to get a fingerprint, and group by fingerprint.

The product of every element except the current one, without division: build the answer from two directions, a pass from the left and a pass from the right. The longest substring without repeating characters is a sliding window: grow the window on the right, and shrink it from the left when a repeat appears.

Two general tools close the section. Binary search needs sorted or monotonic input and takes logarithmic time. It also works on answers: when a yes or no check is monotonic, you can search for the smallest value that passes. And two pointers and sliding windows both turn a quadratic scan into a linear one, by moving indexes forward and never restarting.

For flattening a nested array, use the built in method in real code, and show a recursive version in an interview.`,

    'coding-impl': `The second section asks you to build things you normally only use.

Start with Promise dot all. It must resolve with one array once every input has resolved, and the results must be in input order, whichever promise settles first. That means you store each result by its index, and count how many have finished. And it must reject as soon as any single input rejects.

In a hand written promise, there is a favourite follow up: what happens when a then callback throws? The error must reject the promise that then returned, and travel down the chain to the first handler for rejections, exactly as a native promise does.

Implementing the use callback hook tests whether you know what it memoises. It is the function reference, not a value. You get the same function object across renders while the dependencies are unchanged, which matters when that function is passed to a memoised child.

Dynamic programming has a method. Define the state in one sentence: what does this entry of the table mean. Write the transition from smaller states. Then set the base cases and the order in which you fill the table.

Linked lists. To reverse one, walk it and turn each pointer around. To detect a cycle, use a slow pointer and a fast pointer. If they ever meet, there is a cycle.

And the least recently used cache. You need two things in constant time: find an entry by key, and move it to most recent. The classic design is a hash map plus a doubly linked list.`,

    'coding-react': `The React exercises are small components, and each one is checking a specific habit.

Live search. The source list and the search term are state. The filtered list is not. Compute it during render. The interviewer is watching for an unnecessary effect that copies one piece of state into another.

Fetch data and show it in a table. The exercise is really about the states: loading, error and empty, each handled explicitly, and the shape of the response checked before you render it.

The progress bar that fills over time is about cleaning up. Clear the interval when the component unmounts or the bar finishes. And derive progress from elapsed time, so a slow tab does not make it drift.

Tic tac toe is about modelling the game as data. Keep a history of board snapshots and a step index. The current board, the next player and the winner are all derived from those. Time travel is then just changing the step.

Two exercises are about accessibility. A modal dialog renders through a portal, moves focus into the dialog when it opens, returns focus to the trigger when it closes, traps the Tab key inside, and closes on Escape. Tabs follow the standard pattern: only the selected tab is in the Tab order, and the arrow keys move between tabs.

The todo list is about immutable updates with stable ids, and reading saved state lazily. Also be ready to explain keys: they tell React which list items are the same item across renders. And know that the use hook reads a promise during render, with Suspense showing a fallback and an error boundary catching failure.`,

    'coding-vanilla': `The fourth section has two exercises with no framework at all, which is exactly why interviewers like them. They show whether you understand what a framework does for you.

The first is the add expense flow of an expense tracker. Three pieces have to work together. Validation happens before anything is accepted: the amount is a positive number, the description is not empty, and the user sees a clear message when something is wrong. Then there is one array in memory that is the single source of truth for the expenses. And then the page is updated from that array: a new row in the table, and a new total.

The order matters. Change the data first, then render from the data. If you update the page directly and the array separately, the two drift apart, and that is the bug the interviewer is waiting for. Say this out loud as you work, because it is the same idea that every framework is built on.

The second exercise is to query a paginated API, filter the results and compute an average. Treat it as two separate concerns. First, collect all the data even though the API hands it over in pages: loop, request a page, add its items, and stop when you reach the last page. Second, once you have everything, filter and aggregate.

Mention the edge cases while you write. What if a request fails halfway through. And what if the filter leaves nothing, so that the average would divide by zero.`,

    'deep-practice': `The deep dive adds seven exercises that appear in senior rounds.

Running async tasks with a concurrency limit, often called a promise pool. Given many jobs, run at most a fixed number at a time, and return results in the original order. The real use is calling a rate limited API for thousands of ids.

A small event emitter with on, off, once and emit. Three details show experience. Store listeners in a set, which avoids duplicates and makes removal cheap. Loop over a copy when emitting, so that a listener which removes itself does not cause another to be skipped. And return an unsubscribe function from on.

Memoize, with a cache key and an optional expiry. The key is the hard part. Turning the arguments into a string works for plain values, but not for functions or class instances, so accept a custom key function.

The k most frequent elements. Step one is always a frequency map. The choice is how you pick the top k from it, and you should say how ties are broken.

Two grid problems. Counting islands: scan every cell, and each unvisited land cell starts a flood fill that marks its whole island. Shortest path with obstacles: use breadth first search, which finds shortest paths when every step costs the same, and mark a cell visited when you add it to the queue, not when you take it out.

Last, flattening a nested object into dotted keys. Clarify the rules first: what happens to arrays, empty objects, null and dates.`,
  },
};
