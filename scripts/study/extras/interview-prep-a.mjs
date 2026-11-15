// Short answers and follow-ups for the core cards of Interview Prep, first batch (see ../extras.mjs).
// s15 and s60 only compress what the card says; a ladder answer may go one step further, and any such fact
// was checked (the commit message lists how).

/** @type {import('../extras.mjs').Extra[]} */
export default [
  {
    sec: 'js', card: 'How does the JavaScript event loop work? (call stack, microtasks, macrotasks)',
    s15: 'JavaScript runs one thing at a time on a single call stack. Async work is handed off and its callback waits in a queue. Promise callbacks, the microtasks, always run before the next timer or I/O callback.',
    s60: 'Start with the one-thread fact: JavaScript has a single call stack, so only one thing runs at a time. Async work does not block it. It is handed off, and its callback is queued for later. There are two queues. The microtask queue holds promise callbacks, queueMicrotask and async/await continuations, and it is drained completely before anything else runs. The macrotask queue holds setTimeout, setInterval, I/O and UI events. One macrotask runs, then the engine checks the microtasks again. That is why setTimeout with a zero delay always runs after any pending promise callbacks, however instant zero sounds. The trade-off is that a long synchronous task blocks everything, so CPU-heavy work should move to a worker thread or another process.',
    ladder: [
      ['How would you prove that order to an interviewer with a few lines of code?',
        'Log "sync", then call setTimeout with a zero delay that logs "timeout", then attach a promise `then` that logs "promise", then log "end". It prints sync, end, promise, timeout: the whole script runs first, then the microtask, then the timer.'],
      ['What happens to a page, or a Node server, if one callback runs for two seconds?',
        'Nothing else runs for those two seconds: no other callback, timer or click handler, and in a browser no repaint. In Node every other request waits too. Split the work into chunks, or move it to a worker thread, a child process or a separate service.'],
      ['Where does process.nextTick fit in Node?',
        'It is a Node-specific queue that runs ahead of the regular promise microtasks, so a nextTick callback beats an already-resolved promise. Scheduling it recursively can starve everything else: a zero-delay timer waited through a million chained ticks in a test.'],
    ],
  },
  {
    sec: 'ts', card: 'What is the difference between unknown and any?',
    s15: 'any switches type checking off, so you can do anything with it. unknown accepts any value but lets you do nothing with it until you narrow it. Type outside data as unknown and prove its shape first.',
    s60: 'any disables type checking entirely: you can do anything with an any value and the compiler stays silent. unknown is the type-safe version. You can assign any value to it, but you cannot use it for anything until you narrow it with a check, so TypeScript makes you prove what the value is first. For example, a function that takes value as unknown and throws unless typeof value is string can then safely call toUpperCase, because inside that branch the value is narrowed to a string. In practice I type external data, such as a request body or parsed JSON, as unknown, then validate or narrow it with a schema library before using it as a specific type. The trade-off is a few more lines of checking, in exchange for catching bad data at the boundary instead of deep inside the code.',
    ladder: [
      ['What can you do with an unknown value before narrowing it?',
        'Very little: pass it around, assign it to another unknown or any variable, and compare it with ===. You cannot call methods, read properties or do arithmetic on it. Narrowing with typeof, instanceof, an in check or a type guard unlocks the specific type.'],
      ['A schema library validated the data. How do you carry that proof in the types?',
        'Use the schema library’s parse function, whose return type is inferred from the schema, so the value only gets a specific type if validation passed. The type then claims nothing the runtime check did not prove, and bad data fails at the boundary.'],
      ['When is any still the right choice, and how do you stop it spreading?',
        'Rarely: a quick step while migrating from JavaScript, or a type you genuinely cannot express yet. Keep it at the edge with a comment saying why, and turn on the no-explicit-any lint rule so each new use needs a deliberate exception.'],
    ],
  },
  {
    sec: 'nextjs', card: 'What is the difference between a Server Component and a Client Component?',
    s15: 'Server Components are the App Router default: they render on the server and ship no JavaScript for themselves. Client Components, marked with use client, ship JavaScript and hydrate so they can use state, effects and event handlers.',
    s60: 'Server Components are the default in the App Router. They render entirely on the server and send HTML plus a serialised description, so no JavaScript ships for them. They can be async and can reach the database, the file system and secrets directly, but they cannot use state, effects, browser APIs or event handlers. Client Components opt in with the use client directive. They also render on the server for the first HTML, but they ship JavaScript and hydrate in the browser, which is what interactivity needs. The key point is that use client is a boundary, not a per-file label: everything a Client Component imports joins the client bundle, unless it is passed in as children from a Server Component. So I keep the boundary as low and as small as I can.',
    ladder: [
      ['A product list needs data fetching and a click handler. How do you split it?',
        'Fetch in a Server Component and pass the data down as props to a small Client Component that owns the click handling and the selected state. The fetch stays on the server, and only the interactive part ships JavaScript.'],
      ['A Client Component imports a heavy date library. Can you avoid that cost?',
        'Only if the work can move. Everything a Client Component imports joins the client bundle, so do the formatting in a Server Component and pass the result down. If it truly must run in the browser, accept the cost or load it lazily.'],
      ['Can a Client Component render a Server Component inside it, and how?',
        'Not by importing it, because that import would pull it into the client bundle. Pass it in as children or another prop from a Server Component, and the Client Component renders it as an already-rendered slot.'],
    ],
  },
];
