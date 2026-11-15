# Three new study guides: Behavioural, Data and SQL, Testing

Date: 2026-11-14. Owner: Abhilash. Status: approved for planning.

## Why

DevSpar prepares a full-stack developer (React, Next.js, TypeScript, Node.js) for interviews. Three areas
are thin or missing as standalone guides:

1. **Behavioural interviews.** A private, personal version exists in `/my-prep` (encrypted). There is no
   public, generic guide.
2. **Data and SQL.** Database content is spread across the prep guide and the cheatsheet. Indexing,
   transactions, isolation and query puzzles are the main gap for a full-stack candidate.
3. **Testing.** React Testing Library, Playwright, MSW and test strategy appear as a few cards in other
   guides, not as a stream of their own.

## What each guide must be

Each is a normal DevSpar study guide: a route (`/behavioural`, `/sql`, `/testing`), built from content
scripts with the toolkit in `scripts/study/`, listed on the homepage, searchable, with flashcards and
shared progress. Each must work on its own; they can be built in any order.

### Behavioural (public, generic)

- A STAR question bank organised by competency, about 45 cards.
- For every question: what the interviewer is checking, the shape of a strong answer, one worked example,
  what to avoid, and the follow-ups to expect.
- Worked examples are **generic and fictional** (a plausible engineer on a plausible team). Nothing from
  `private/` or from the owner's resume may appear. The owner's real stories stay in `/my-prep`.
- Includes weak-versus-strong answer rewrites the reader can try before revealing.

### Data and SQL

- Indexing, transactions, isolation levels and anomalies, query puzzles, schema design and migrations,
  performance and scaling, using the database from Node.js, and when to choose NoSQL. About 55 cards.
- PostgreSQL is the reference database. Every SQL statement and every output shown must come from a real
  run, not from memory.
- Query puzzles hide the answer until the reader opens it.

### Testing

- Strategy, unit testing, React Testing Library, MSW, Playwright, back-end testing in Node.js, CI, and
  interview scenarios. About 55 cards.
- Every code sample must be executed against the current library versions, which are looked up, not
  assumed.

## Requirements common to all three

- Same card building blocks, tone and visual language as the existing guides; diagrams where a mechanism
  is easier to see than to read.
- Each section ends with a quiz or a rapid-fire card. Each guide starts with a generated Quick Reference.
- Content is created through scripts (`scripts/study/*-content-*.mjs` plus an `add-*-guide.mjs` builder),
  never by editing `content.json` by hand.
- No card title may duplicate a title that already exists in another guide unless it is deliberately the
  same card (progress is shared across guides by title).
- Library and tool facts are checked against current documentation before they are written, and the
  guide says when it was checked.
- `npm run study:build && npm run build && npm test` passes with the guide included.
- The guide is recorded in the freshness tool once finished.
- Nothing is pushed. One commit per completed task.

## Out of scope

- Changes to the engine, the theme or other guides, apart from adding a link to the new guide where a
  plan names one.
- Interactive labs or runnable editors.
- Rewriting the existing testing or database cards in other guides.
