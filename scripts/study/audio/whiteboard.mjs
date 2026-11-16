// Audio overview of the Whiteboard guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the Whiteboard Explanations guide. The idea behind the guide is simple. In an interview you are rarely judged on whether you know a thing. You are judged on whether you can make it clear to another engineer, with a pen in your hand, in about two minutes.

So for each topic the guide gives you two things: what to draw, and what to say while you draw it. In this overview I will walk through the seven sections, and for each one I will describe the picture in words, so that you can see it in your head while you listen. When you are back at a desk, draw them from memory.`,

  chapters: {
    wb1: `Let us start with the method, because the same four moves work for every topic.

First, frame it in one sentence: what the thing is and what problem it solves. Say that before you draw anything. Second, draw the parts: three to five labelled boxes, and no more yet. Third, show the flow. Add arrows, number them, and follow one concrete example through the picture, a click, a request, an order. Fourth, name the limits: what breaks, what it costs, when you would not use it.

Explanations go wrong in predictable ways. People start with detail, diving into the microtask queue before saying what an event loop is for. They draw everything they know, ten boxes when the question needed four. Or they give no example, and abstract arrows are hard to follow.

The way to practise is uncomfortable and it works. Pick a card, read the question, close it, and draw the picture from memory on paper. Explain it out loud against a two minute timer. Record yourself once. Then open the card and compare what you skipped.`,

    wb2: `Section two is JavaScript and the browser, and it opens with the picture a frontend candidate is asked to draw more than any other: the event loop.

Picture a tall box on the left. That is the call stack, where your code runs, one function at a time. To its right, a box for the browser or Node, which handles timers and network calls for you. Below, two queues. The microtask queue holds promise callbacks. The task queue holds timers and events. The loop itself is one rule: when the stack is empty, run every microtask, then take one task. That rule answers the classic puzzle about what a mix of timers and promises prints. Draw three lanes, stack, microtasks, tasks, and place each line of code on the timeline.

A closure is a picture of a box inside a box. The outer function's scope holds a variable, the inner function leaves, and a dashed arrow shows it still pointing back at that variable.

The last picture is a line of steps: what happens between typing a web address and seeing the page. The name lookup, the secure connection, the request, the response, then the browser building and painting the page. Offer to go deeper on any one step.`,

    wb3: `Section three is React and Next.js, four pictures.

The first answers what happens when you set state. Draw five boxes in a row. A trigger, which is a state change, new props or a context change. Then render, where React calls your component functions to get a description of the screen. Then reconciliation, where it compares that with the previous description. Then commit, where it applies only the differences to the page. Then your effects run. The point to land is that rendering is not the same as touching the page.

The second picture explains why list items need keys, and why the index is a poor key. Draw a list keyed by position, insert an item at the top, and every key now points at a different item, so React reuses the wrong state. With stable ids, only the new item is new.

The third is the server and client boundary. Draw a line across the board, server above, browser below, and say what crosses it: rendered output for server components, and JavaScript only for the client ones, which then hydrate.

The fourth is a small table for the four rendering strategies. Ask of each: where is the page made, where is it served from, and what does the user get.`,

    wb4: `Section four moves to the back end with Node.js and APIs.

The first picture answers how Node handles thousands of connections on one thread. Draw one box for your JavaScript, which is single threaded. Beside it, the event loop as a row of phases. Below it, the operating system and a small thread pool. The story is that your code never waits. It hands the slow work down, and the loop calls you back when the work is done. That is also why one slow, synchronous function hurts every request.

The second picture is a request passing through an Express style API. A row of boxes: logging, authentication, validation, then the handler. Each one either passes the request on or ends it. That makes it easy to say where a check belongs.

The third is backpressure. A fast source, a buffer, a slow destination, and a dashed arrow going backwards that says: the buffer is full, pause, and resume when it drains.

The last is login with OAuth and PKCE, drawn as three vertical lifelines for the app, the authorisation server and the API, with numbered messages between them. Finish by sketching the three parts of a token: header, payload and signature.`,

    wb5: `Section five is data, three pictures that come up in almost every backend conversation.

First, how an index makes a query fast. Draw a small tree. A root node with two keys, and three child nodes below it. Highlight the path for one lookup: root, then one leaf, then an arrow to the row in the table. The words to say are that the database reads a few pages instead of scanning the whole table, and the price is paid on every write, because the index has to be kept in order.

Second, a cache in front of a database. Three boxes: the application, the cache, the database. The app reads the cache. A hit returns at once. On a miss, it reads the database and writes the value into the cache with an expiry time. Then write the hard question at the side: when the data changes, who tells the cache?

Third, the N plus one problem. On the left, one query for a list, then one more query for every item in it. Count the arrows. On the right, the same code calling a loader that collects the ids and makes a single query for all of them. The fix is fewer round trips, not faster queries.`,

    wb6: `Section six is systems, and its first picture opens most design conversations: follow one request through a production stack. Draw it left to right and number the hops. The browser, the name lookup, the edge network where cached content is served, the load balancer with its health checks, the application servers, then the cache and the database. At each hop, say one thing that can go wrong there.

The second picture is a queue and a worker. A publisher, a queue, a consumer. Above each one, write the promise that keeps messages safe: the publisher waits for a confirmation, the queue is durable, and the consumer acknowledges only after the work is saved. Below, a dead letter queue for messages that keep failing.

The third answers a common question: the user clicks Pay, the work happens in the background, so how does the result reach the browser? The API saves the order and answers straight away, a worker does the payment, and the result is pushed back over an open connection.

The fourth is a circuit breaker, three states in a row: closed, open and half open, with the condition for each move.

The last is the board itself. Before any architecture, divide it: requirements, numbers, the diagram, and a corner for trade offs.`,

    wb7: `The final section is AI, with two pictures that are now asked in general full stack interviews.

The first is retrieval augmented generation. Draw two rows. The top row is indexing, which happens ahead of time: documents are split into chunks, each chunk is turned into an embedding, and the embeddings go into a vector store. The bottom row is the query: the question is embedded with the same model, the closest chunks are retrieved, and a prompt is built from the question plus those chunks. The model answers from that material, with citations. The sentence to say is that the model is not remembering your documents. It is reading the few passages you fetched for it.

The second picture is how an AI coding agent works. On the left, you, with the goal and what done means. Then a cycle of three boxes: gather context, take an action, verify the result. The agent goes round that loop, using tools to read, search, edit and run commands, until verification passes, and then it reports back.

That is the whole guide. Pick one picture today and draw it from memory, out loud, against the clock.`,
  },
};
