# Study guide freshness report

Generated 2026-11-15 by `npm run study:freshness`. This file is rebuilt on every run.

## Current versions

| Technology | Current | Guides that mention an older major as their newest |
| --- | --- | --- |
| Node.js | 26.13.1 LTS (Lithium), current 26.13.1 | crash-course (10), genai (22), interview-cheatsheet (15) |
| TypeScript | 7.0.2 | none |
| React | 19.3.1 | none |
| Next.js | 16.4.6 | none |
| Tailwind CSS | 4.3.5 | none |
| React Router | 8.5.1 | interview-prep (7), system-design-scale (7) |
| Express | 5.3.0 | none |
| ECMAScript | ES2026 | typescript (2023) |

## Guides

| Guide | Cards | Versions behind | Time-sensitive wording | Last reviewed | Prompt |
| --- | --- | --- | --- | --- | --- |
| ai-dev | 80 | none | 4 cards | 1 days ago (2026-11-14, full) | [prompt](prompts/ai-dev.md) |
| architecture | 30 | none | 0 cards | 1 days ago (2026-11-14, full) | [prompt](prompts/architecture.md) |
| aws | 68 | none | 2 cards | never recorded | [prompt](prompts/aws.md) |
| behavioural | 53 | none | 1 cards | 0 days ago (2026-11-15, full) | [prompt](prompts/behavioural.md) |
| bug-clinic | 51 | none | 5 cards | 1 days ago (2026-11-14, full) | [prompt](prompts/bug-clinic.md) |
| coding-questions | 37 | none | 3 cards | never recorded | [prompt](prompts/coding-questions.md) |
| crash-course | 105 | Node.js | 6 cards | never recorded | [prompt](prompts/crash-course.md) |
| genai | 140 | Node.js | 11 cards | never recorded | [prompt](prompts/genai.md) |
| interview-cheatsheet | 150 | Node.js | 5 cards | 1 days ago (2026-11-14, versions) | [prompt](prompts/interview-cheatsheet.md) |
| interview-prep | 403 | React Router | 38 cards | 1 days ago (2026-11-14, versions) | [prompt](prompts/interview-prep.md) |
| javascript | 51 | none | 3 cards | never recorded | [prompt](prompts/javascript.md) |
| nextjs | 37 | none | 5 cards | never recorded | [prompt](prompts/nextjs.md) |
| nodejs | 62 | none | 5 cards | 1 days ago (2026-11-14, versions) | [prompt](prompts/nodejs.md) |
| performance-optimization | 32 | none | 4 cards | never recorded | [prompt](prompts/performance-optimization.md) |
| react-training | 86 | none | 7 cards | never recorded | [prompt](prompts/react-training.md) |
| reactjs | 74 | none | 2 cards | never recorded | [prompt](prompts/reactjs.md) |
| system-design | 71 | none | 11 cards | never recorded | [prompt](prompts/system-design.md) |
| system-design-scale | 45 | React Router | 8 cards | never recorded | [prompt](prompts/system-design-scale.md) |
| tailwind-css | 34 | none | 0 cards | never recorded | [prompt](prompts/tailwind-css.md) |
| typescript | 61 | ECMAScript | 2 cards | 1 days ago (2026-11-14, versions) | [prompt](prompts/typescript.md) |
| web-platform | 23 | none | 4 cards | never recorded | [prompt](prompts/web-platform.md) |
| whiteboard | 25 | none | 2 cards | 1 days ago (2026-11-14, full) | [prompt](prompts/whiteboard.md) |

## Details

### crash-course

**Node.js**: newest version mentioned is 10, current is 26.13.1 LTS (Lithium), current 26.13.1.

- `start:1` All sections and their reading time

### genai

**Node.js**: newest version mentioned is 22, current is 26.13.1 LTS (Lithium), current 26.13.1.

- `cheatsheet:3` Facts, numbers and versions to know (verified 24 Sep 2026)
- `tools:2` Which current API conventions differ from older tutorials?

### interview-cheatsheet

**Node.js**: newest version mentioned is 15, current is 26.13.1 LTS (Lithium), current 26.13.1.

- `node-js:5` Unhandled rejections

### interview-prep

**React Router**: newest version mentioned is 7, current is 8.5.1.

- `sdscale:2` Which web framework would you choose, and why?

### system-design-scale

**React Router**: newest version mentioned is 7, current is 8.5.1.

- `client:0` Which web framework would you choose, and why?

### typescript

**ECMAScript**: newest version mentioned is 2023, current is ES2026.

- `ts1:3` Which tsconfig options should every new project turn on, and why?

## How to act on this

1. Open the prompt for a guide in `docs/freshness/prompts/` and give it to a coding agent in this repository (or run `/refresh-guides <guide>` in Claude Code).
2. Review its change list and the diff.
3. Run `npm run study:build && npm run build && npm test`.
4. Run `npm run study:freshness -- --mark <guide>` to record the review date.
