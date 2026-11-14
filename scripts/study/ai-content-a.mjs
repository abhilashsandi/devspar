// AI-Assisted Development guide, part A: how it works, prompting, context engineering, the harness,
// spec-driven development. Text uses the cheatsheet markup (`code`, **bold**); see cc-kit.mjs.
import { P, L, N, T, H, SAY, TRAP, K, GO, md } from './cc-kit.mjs';
import AI from './dg-ai.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// A prompt, spec or file sample: shown as written, never syntax-coloured.
export const SAMPLE = (label, s) => '<p class="codelabel">' + esc(label) + '</p><pre class="plain">' + esc(s.replace(/^\n+|\n+$/g, '')) + '</pre>';
export const NOTE = (s) => '<p class="verified">' + md(s) + '</p>';
export const QUIZ = (question, options, right, why) => ({
  q: 'Quiz: ' + md(question) + ' <span class="quizopts">' + options.map((o, i) => '(' + 'ABCD'[i] + ') ' + md(o)).join(' &nbsp;·&nbsp; ') + '</span>',
  a: '<ol class="quiz" type="A">' + options.map((o, i) => '<li' + (i === right ? ' class="right"' : '') + '>' + md(o) + '</li>').join('') + '</ol><p><strong>Answer: ' + 'ABCD'[right] + '.</strong> ' + md(why) + '</p>',
});
export const DIAGRAM = (title, svg, ...after) => ({ q: 'Diagram: ' + title, a: svg + after.join('') });

// ───────────────────────────────────────────── 1. how it works
export const how = [
  K("What is AI-assisted development, and how did it move from autocomplete to agents?",
    P("It is building software with a language model doing part of the work, under your direction. The tools arrived in three waves, and each one changed what the developer does."),
    T(["Wave", "What the tool does", "What you do"], [
      ["**Inline completion**", "Predicts the next few lines as you type", "Write the code, accept or reject suggestions"],
      ["**Chat assistant**", "Answers questions and writes snippets from what you paste in", "Copy code in and out, integrate it yourself"],
      ["**Coding agent**", "Reads the repository, edits files, runs commands and tests, and iterates until a check passes", "Describe the outcome, set limits, review the result"],
    ]),
    P("With an agent the unit of work is a **task**, not a line. Your job shifts from typing to specifying, steering and reviewing, and you remain responsible for what merges."),
    SAY("I treat the agent as a fast junior pair who has read the whole repo: I decide what to build and what done means, it does the typing and the first round of checking, and I review everything before it merges."),
  ),
  DIAGRAM("The agent loop", AI.loop,
    P("Every coding agent runs the same loop. It is worth being able to draw this."),
    N("**Gather context**: search the repo, read the relevant files, check docs.", "**Take action**: edit a file, run a command, call a tool.", "**Verify**: run the tests, the type-checker, the build, or look at a screenshot.", "**Repeat** until the check passes, then report what changed and the evidence."),
    P("The loop only converges if step 3 exists. An agent with no way to check its work is guessing, so the most useful thing you can give it is a command that says pass or fail."),
  ),
  K("What are language models good at in a codebase, and where do they fail?",
    T(["Reliable", "Needs your judgement"], [
      ["Boilerplate and well-trodden patterns (CRUD, forms, config)", "Architecture trade-offs that depend on context it cannot see"],
      ["Reading and summarising unfamiliar code", "Your team's unwritten conventions"],
      ["Writing tests for existing behaviour", "APIs that changed after its training cutoff"],
      ["Mechanical migrations that follow an example", "Wide changes with hidden coupling"],
      ["Explaining errors and proposing hypotheses", "Admitting it does not know: it produces plausible code either way"],
    ]),
    TRAP("Fluent output is not correct output. A model can call a function that does not exist, with full confidence. The defence is verification (compile, run, test), not rereading the code and hoping."),
  ),
  K("What is a context window, and why does it shape everything about working with an agent?",
    P("The context window is the text the model can see at once: its instructions, the conversation, and every file and tool result loaded so far. It is measured in tokens (roughly three-quarters of a word each) and it is finite."),
    L("The model has **no memory outside the window**. A new session starts blank unless files on disk carry the knowledge over.",
      "Everything in the window is **re-read on every turn**, so a bloated window costs money, adds latency and dilutes attention.",
      "The model's built-in knowledge stops at its **training cutoff**. Anything newer (a library release, your codebase) has to be put into the window."),
    P("Most of the craft in this guide (rules files, skills, subagents, specs) is about deciding what goes into that window and when."),
  ),
  K("Vibe coding versus AI-assisted engineering: what is the difference?",
    P("**Vibe coding** means describing what you want, accepting whatever the model writes and not reading the code. It is a legitimate way to build a throwaway prototype, a personal script or a demo."),
    P("**AI-assisted engineering** uses the same tools with engineering discipline: a stated requirement, small reviewable changes, tests, code review and an owner who understands what was merged."),
    T(["", "Vibe coding", "AI-assisted engineering"], [
      ["Reads the diff", "No", "Yes"],
      ["Tests", "Maybe", "Required, often written first"],
      ["Who can maintain it", "Nobody yet", "The team"],
      ["Right for", "Prototypes, spikes, one-off tools", "Anything users or teammates depend on"],
    ]),
    SAY("I vibe-code prototypes to learn fast, and I throw them away. For production I use the same agent with a spec, tests and review, because I am accountable for the code whoever typed it."),
  ),
  K("Where in the software lifecycle does AI help most?",
    T(["Phase", "Good uses", "Keep human"], [
      ["Discovery", "Summarise research, draft a PRD, list edge cases", "Deciding what is worth building"],
      ["Design", "Compare options, draft an ADR, sketch a schema", "The trade-off and the final call"],
      ["Implementation", "Scaffolding, features from a spec, refactors, migrations", "Review of every change"],
      ["Testing", "Generate cases, write e2e tests, find untested paths", "Choosing what matters to test"],
      ["Review", "First-pass review for bugs, security and missed cases", "Approval"],
      ["Operations", "Read logs, draft a postmortem, write runbooks", "Actions on production"],
      ["Onboarding", "Explain a codebase, trace a request end to end", "Checking the explanation against the code"],
    ]),
  ),
  QUIZ("An agent says the bug is fixed. What is the strongest evidence?",
    ["It explains the fix clearly", "The diff looks reasonable", "A test that failed before the change now passes", "It reports high confidence"], 2,
    "A check that failed before and passes after is evidence. An explanation, a tidy diff and stated confidence are all things a wrong answer can have too."),
];

// ───────────────────────────────────────────── 2. prompting
export const prompting = [
  K("What goes into a good prompt for a coding task?",
    P("Write it the way you would brief a capable colleague who has never seen this ticket. Five things, usually in a few sentences each:"),
    N("**Goal and reason**: what you want and why it matters.", "**Context**: the files, examples and constraints it should know about.", "**Done criteria**: the observable behaviour that means finished.", "**Verification**: the command or check that proves it.", "**Boundaries**: what must not change."),
    SAMPLE("Too vague", "fix the login bug"),
    SAMPLE("Enough to act on", `
Users on Safari are logged out after refreshing /dashboard. I think the session
cookie is not being sent because of its SameSite setting.

Look at src/auth/session.ts and the cookie options in src/lib/cookies.ts.
Reproduce it with a failing test in tests/auth/session.test.ts first, then fix it.

Done when: the new test passes, "npm test -- auth" is green, and the cookie
is still httpOnly and secure. Do not change the token format or the login API.`),
    TRAP("Do not specify the implementation line by line. Say what and why, give the constraints, and let the agent find the how; over-specified prompts produce brittle, literal results."),
  ),
  K("Why does explaining the reason behind an instruction work better than the instruction alone?",
    P("A bare rule gets followed literally and only in the cases it names. A rule with its reason lets the model generalise to cases you did not think of."),
    T(["Instruction only", "Instruction with the reason"], [
      ["Never use `any`.", "Avoid `any`: this codebase relies on types to catch API drift, so prefer `unknown` plus narrowing at boundaries."],
      ["Always run the tests.", "Run `npm test` before reporting done: CI takes 20 minutes, so a failure caught locally saves a round trip."],
    ]),
    P("The same applies to rules files and skills. Capital letters and words like MUST add emphasis but no understanding, and too many of them make every rule equally loud."),
  ),
  K("When should you ask the agent for a plan before it writes code?",
    P("Whenever the change touches several files, has more than one reasonable approach, or would be expensive to redo. A plan is a few paragraphs you can review in a minute; a wrong implementation is a diff you have to unpick."),
    N("**Explore**: ask it to read the relevant code and report how the area works. No edits.", "**Plan**: ask for the approach, the files it will touch, the risks and how it will verify. Most tools have a read-only plan mode for this.", "**Correct the plan**, not the code.", "**Implement** in small steps, then commit."),
    P("Skip the ceremony for a one-line fix or a rename. Match the process to the risk."),
  ),
  K("How do you prompt for debugging?",
    P("Give the agent what you would give a colleague in a bug report, then ask it to prove the cause before changing anything."),
    L("The **exact error** and stack trace, pasted, not paraphrased.", "**Steps to reproduce**, and what you expected instead.", "**What changed recently** (a deploy, a dependency bump).", "Ask for **ranked hypotheses** and how to test each one.", "Ask for a **failing test that reproduces it** before the fix."),
    SAMPLE("A debugging prompt", `
POST /api/orders returns 500 for about 2% of requests since yesterday's deploy.
Error: "duplicate key value violates unique constraint orders_idempotency_key".
Full stack trace is in logs/orders-500.txt.

Before changing code: list the three most likely causes, and for each say what
evidence would confirm or rule it out. Then write a test that reproduces the
most likely one.`),
    TRAP("Watch for a fix that makes the symptom disappear: a broad try/catch, a deleted assertion, a skipped test. Ask what the root cause was and why the fix addresses it."),
  ),
  K("Examples, roles and output formats: which prompting techniques still matter?",
    T(["Technique", "Does it help?", "How to use it"], [
      ["**Examples**", "A lot", "Point at real code: “follow the pattern in `UserCard.tsx`”. The model copies structure and style closely, so pick a good example."],
      ["**Structured sections**", "Yes", "Separate instructions from pasted data with headings or tags, so a log file is not mistaken for a request."],
      ["**Output format**", "Yes", "Ask for a JSON schema, a table or a diff when something downstream will parse it."],
      ["**Role (“you are a senior…”)**", "A little", "Fine for setting tone; it does not add knowledge."],
      ["**Step-by-step thinking**", "Built in", "Modern models reason before answering; ask for a plan when you want to review the reasoning."],
    ]),
  ),
  K("How do you get the model to ask questions instead of guessing?",
    P("By default a model fills gaps with plausible assumptions. Tell it that gaps are a reason to stop."),
    L("“Before you start, ask me anything that is ambiguous. One question at a time.”", "“List the assumptions you are making; I will confirm or correct them.”", "“If the spec and the code disagree, stop and tell me rather than choosing.”"),
    P("For a large feature, reverse the roles: ask the agent to **interview you** about the requirements and write the answers into a spec. You find the missing decisions before any code exists."),
  ),
  K("What are the most common prompting mistakes?",
    L("**A vague goal** (“make it better”) with no definition of done.", "**Several unrelated tasks** in one prompt, so none gets full attention.", "**No way to verify**, so the agent stops when the code looks finished.", "**Correcting in circles**: after two failed corrections the session is full of wrong attempts. Start a fresh session with a better prompt that includes what you learned.", "**Pasting a wall of context** “just in case” instead of pointing at the three files that matter.", "**Assuming it remembers** yesterday's conversation. It does not; write decisions into a file."),
  ),
  QUIZ("You have corrected the agent twice and it is still wrong. What is usually the best next step?",
    ["Repeat the correction in capital letters", "Start a fresh session with a clearer prompt that includes what you learned", "Paste the whole repository into the chat", "Switch the theme to dark mode"], 1,
    "The session is now full of failed attempts that the model keeps re-reading. A clean context with a better brief nearly always beats a third correction."),
];

// ───────────────────────────────────────────── 3. context engineering
export const context = [
  K("What is context engineering, and how is it different from prompt engineering?",
    P("**Prompt engineering** is wording one request well. **Context engineering** is managing everything the model sees while it works: the system prompt, tool definitions, rules files, conversation history, files it has read and results from tools."),
    P("The goal is the **smallest set of high-signal tokens** that makes the right outcome likely. It matters more as tasks get longer, because an agent working for an hour builds its own context as it goes, and that context can fill with noise."),
    SAY("Prompting is what I say; context engineering is what the model knows when I say it. I keep stable knowledge in files, load detail on demand, and start clean sessions for new tasks."),
  ),
  DIAGRAM("What fills the context window", AI.context,
    P("Draw the window as one bar and the disk as boxes beneath it. The design question for every piece of knowledge is: does it sit in the bar all the time, or below it until needed?"),
    L("**Always in the window**: short, universally relevant rules (build commands, conventions).", "**Loaded on demand**: skill bodies, specs, API docs, the code itself.", "**Never in the window**: secrets, and anything the agent can look up cheaply when it needs it."),
  ),
  K("What is context rot, and how do you manage a long session?",
    P("As a session grows, quality drops: the model attends less precisely to each part of a long window, early instructions fade, and stale file contents and failed attempts compete with what matters. People call this **context rot**."),
    T(["Technique", "What it does"], [
      ["**Clear between tasks**", "A new task gets a fresh window. The cheapest fix and the most neglected."],
      ["**Compaction**", "The tool summarises the conversation so far and continues from the summary. Useful mid-task; details can be lost."],
      ["**Notes on disk**", "The agent keeps a progress file (done, next, decisions). A fresh session reads it and carries on."],
      ["**Subagents**", "Noisy exploration happens in a separate window; only the conclusion comes back."],
      ["**Smaller tasks**", "A task that fits comfortably in one window needs none of the above."],
    ]),
  ),
  K("What belongs in a rules file such as CLAUDE.md or AGENTS.md?",
    P("A rules file is loaded into every session, so it is the project's standing brief. Because it costs tokens on every turn, each line has to earn its place."),
    L("**Commands**: how to build, test, lint and run one test.", "**Map**: where things live, in a few lines.", "**Conventions that differ from the default**: the things a good engineer new to the repo would get wrong.", "**Gotchas and do-not-touch areas**.", "**Pointers** to longer docs, not the docs themselves."),
    SAMPLE("AGENTS.md (kept short on purpose)", `
# Orders service

## Commands
- npm run dev            start API on :4000
- npm test -- <path>     run one test file (full suite takes 6 min; run it last)
- npm run typecheck && npm run lint    must pass before you report done

## Conventions
- Validate every request body with the Zod schemas in src/schemas. Types come from the schema.
- Database access only through src/repos. No SQL in route handlers.
- Money is integer cents. Never use floats for amounts.

## Careful
- migrations/ is append-only. Never edit an applied migration.
- Architecture decisions are in docs/adr. Read the relevant one before changing auth or billing.`),
    P("`AGENTS.md` is a convention many tools read; `CLAUDE.md` is Claude Code's file; Cursor and GitHub Copilot have their own rules and instructions files. The content advice is the same for all of them. Commit the file and review changes to it like code."),
    TRAP("A 600-line rules file is ignored in practice: important rules drown. If the agent keeps breaking a rule, shorten the file and explain the rule's reason, or enforce it with a hook or a lint rule instead."),
  ),
  K("Just-in-time retrieval versus loading everything up front: which is better?",
    P("Early tools tried to stuff the relevant code into the prompt before the model started, often using an embeddings index (RAG). Agents mostly do the opposite: they hold **pointers** (file paths, search commands) and pull content in when a step needs it."),
    T(["", "Up-front loading", "Just-in-time (agentic search)"], [
      ["How", "Index the repo, retrieve chunks by similarity", "The agent runs search, opens files, reads parts"],
      ["Strength", "Fast first answer; good for huge doc sets", "Always current; follows real references; no index to maintain"],
      ["Weakness", "Stale index, irrelevant chunks, no follow-up", "Slower; costs tool calls"],
    ]),
    P("This idea is called **progressive disclosure**: show a little (a file name, a skill description), and load the full content only when it is relevant. In practice the two combine: a small always-on rules file, plus search for everything else."),
  ),
  K("How do subagents help with context, and what do they cost?",
    P("A subagent is a separate agent instance with its **own context window**, started by the main agent for one job. It can read fifty files, and only its short report enters the main window."),
    L("**Good for**: broad codebase searches, independent pieces of work in parallel, and a review with fresh eyes (a reviewer that has not seen the author's reasoning judges the code, not the intent).", "**Costs**: each one starts cold and re-reads what it needs, so total token use goes up; and the main agent only learns what the report says."),
    TRAP("Do not split tightly coupled work across subagents. Two agents editing the same module without seeing each other's changes produce conflicts and inconsistent decisions."),
  ),
  K("How do you give an agent memory across sessions?",
    P("The model forgets everything when the session ends. Durable memory is whatever is written down where the next session will find it."),
    T(["Kind of knowledge", "Where it lives"], [
      ["Standing rules and conventions", "Rules file (`AGENTS.md`, `CLAUDE.md`)"],
      ["What we are building and why", "Spec or PRD in the repo"],
      ["Decisions and their reasons", "ADRs, commit messages"],
      ["State of a long task", "A progress or plan file the agent updates"],
      ["Reusable procedures", "Skills"],
      ["Personal preferences", "The tool's user-level memory file"],
    ]),
    SAY("The repository is the memory. If a decision matters tomorrow, it goes into a file today."),
  ),
  QUIZ("Which of these is the best candidate to keep permanently in the rules file?",
    ["The full API reference for your payment provider", "The command to run a single test file", "A transcript of last week's design discussion", "Every lint rule, restated in prose"], 1,
    "It is short, needed in almost every session and not obvious from the code. Long references belong on disk and are linked; lint rules are enforced by the linter, which is free."),
];

// ───────────────────────────────────────────── 4. the harness
export const harness = [
  DIAGRAM("Anatomy of an agent harness", AI.harness,
    P("The **harness** is the program around the model: it runs the loop, exposes tools, enforces permissions, loads rules and skills, and manages the context window. Claude Code, Cursor's agent, Codex and Copilot's agent mode are all harnesses."),
    P("The same model behaves very differently in different harnesses, because the harness decides what the model can see and do. When an agent underperforms, the fix is often in the harness (a missing tool, a noisy rules file, no test command) and not a better model."),
  ),
  K("What are tools, and what is the Model Context Protocol (MCP)?",
    P("A **tool** is a function the harness offers to the model: a name, a description and a JSON schema for its arguments. The model never runs anything; it emits a request to call the tool, the harness executes it and returns the result as text."),
    P("**MCP** is an open protocol for plugging external systems into any compatible agent. An MCP server exposes tools (and optionally resources and prompt templates); a client such as an IDE or CLI connects to it locally over stdio or remotely over HTTP. You write the integration once and every MCP-aware tool can use it."),
    T(["MCP server for", "Lets the agent"], [
      ["GitHub or GitLab", "Read issues and PRs, post review comments"],
      ["A database", "Inspect the schema, run read-only queries"],
      ["A browser (Playwright)", "Open the app, click through a flow, take screenshots"],
      ["Design tools", "Read a Figma frame's layout and tokens"],
      ["Docs services", "Fetch current documentation for a library version"],
      ["Error tracking", "Pull the stack trace and breadcrumbs for an incident"],
    ]),
    TRAP("Every connected server adds its tool descriptions to the context window and widens what the agent can do. Install the few you use, prefer read-only access, and treat a third-party server like any other dependency you run."),
  ),
  K("How do permissions, approval modes and sandboxing work?",
    P("An agent that can run shell commands can do anything you can. Harnesses put three layers between the model and your machine:"),
    T(["Layer", "What it controls", "Example"], [
      ["**Approval mode**", "How often you are asked", "Plan (read-only), ask before edits and commands, auto-accept edits, fully autonomous"],
      ["**Permission rules**", "Which actions are allowed, asked or denied", "Allow `npm test`; ask for `git push`; deny reads of `.env`"],
      ["**Sandbox**", "What the process can physically reach", "Writes limited to the project folder, network limited to an allowlist, or a container / cloud VM"],
    ]),
    P("Autonomy is safe in proportion to isolation. An agent with broad permissions belongs in a sandbox or a disposable environment, with no production credentials in reach."),
  ),
  K("What are hooks, and why not just write the rule in the rules file?",
    P("A **hook** is a script the harness runs at a fixed point: before a tool call, after a file edit, when the agent is about to finish. The model does not decide whether it runs."),
    L("**After an edit**: format the file, run the linter.", "**Before a command**: block `git push --force` or edits to `migrations/`.", "**Before finishing**: run the test suite and send failures back to the agent.", "**On completion**: send a desktop notification."),
    P("A line in a rules file is advice the model usually follows. A hook is enforcement that always happens. Use rules for judgement and hooks for anything that must be true every time."),
  ),
  K("What is headless mode, and where do agents run without a human watching?",
    P("Most agent CLIs can run non-interactively: you pass a prompt, it works, and it prints a result. That makes an agent a build step."),
    L("**Pull request review**: comment on bugs, security issues and missing tests.", "**Issue triage**: label, reproduce, ask for missing details.", "**Mechanical fixes**: lint errors, dependency bumps, failing snapshots.", "**Fan-out migrations**: one agent run per package, in parallel.", "**Background or cloud agents**: assign an issue, get a pull request back."),
    P("Unattended runs need tighter limits than interactive ones: a scoped token, a restricted tool list, a turn or cost budget, and a human approving the pull request at the end."),
  ),
  K("How do the main AI coding tools compare?",
    P("Features converge quickly, so compare by **category** and by how each fits your workflow, not by a feature checklist."),
    T(["Category", "Examples", "Best for"], [
      ["Terminal agents", "Claude Code, Codex CLI, Gemini CLI, Aider", "Multi-file tasks, scripting, CI, working over SSH"],
      ["AI-first editors", "Cursor, Windsurf, Kiro", "Staying in an IDE with inline diffs and agent mode"],
      ["Editor extensions", "GitHub Copilot in VS Code and JetBrains", "Teams standardised on an existing IDE and GitHub"],
      ["Cloud / background agents", "Copilot coding agent, Codex cloud, Claude Code on the web", "Delegating an issue and reviewing the PR later"],
      ["App builders", "v0, Lovable, Bolt", "Prototypes and UI from a description"],
    ]),
    P("What to ask of any of them: Can it run my tests? How are permissions controlled? Does it read a rules file and support MCP and skills? Where does my code go, and is it used for training? What does it cost per developer?"),
    NOTE("**Check before you quote:** product names, plans and features in this space change every few months. Describe the tools you have actually used, and say which version or month you are talking about."),
  ),
  QUIZ("A rule in AGENTS.md says “never edit files in migrations/”, but the agent occasionally does. What is the most reliable fix?",
    ["Write the rule in capital letters", "Repeat the rule three times", "Add a hook or permission rule that blocks edits to that folder", "Use a larger model"], 2,
    "Rules files are guidance; hooks and permission rules are enforced by the harness. Anything that must hold every time should be enforced, not requested."),
];

// ───────────────────────────────────────────── 5. spec-driven development
export const spec = [
  K("What is spec-driven development, and why did it appear?",
    P("In spec-driven development the **specification is the primary artefact** and code is generated from it. You write down what the software must do, agree it, and only then let the agent plan and implement."),
    P("It appeared because agents made writing code cheap and exposed the real bottleneck: an agent given a vague request builds something plausible and wrong, quickly. A reviewed spec fixes the intent before any code exists."),
    L("Decisions are made **once, in prose**, where they are cheap to change.", "The agent has an unambiguous brief, so it needs fewer corrections.", "Review happens against **stated behaviour**, not against a guess at intent.", "The spec survives the session: a new agent (or a new teammate) can pick the work up."),
  ),
  DIAGRAM("The spec-driven flow", AI.spec,
    P("Six steps, three human approvals. The dashed line is the important habit: when the result is wrong, correct the spec and regenerate, so the document and the code never disagree."),
  ),
  K("What does a good spec contain?",
    L("**Problem and goal**: who has the problem and what changes for them.", "**User stories or flows**: the main path and the edge cases.", "**Acceptance criteria**: testable statements of behaviour.", "**Non-goals**: what is deliberately out of scope.", "**Constraints**: performance, security, compatibility, existing APIs.", "**Open questions**: decisions still to be made, visibly."),
    SAMPLE("spec.md (an excerpt)", `
# Saved searches

## Goal
Signed-in users can save a product search (query + filters) and re-run it later,
so repeat buyers stop rebuilding the same filters.

## Acceptance criteria
1. WHEN a signed-in user clicks "Save search" THE SYSTEM SHALL store the query,
   filters and sort order under a name the user provides (1-60 characters).
2. WHEN a user has 20 saved searches THE SYSTEM SHALL refuse a new one with a
   message that explains the limit.
3. WHEN a saved search is opened THE SYSTEM SHALL run it against current data,
   not a cached result list.
4. Saved searches are private to their owner. Requests for another user's
   saved search return 404.

## Non-goals
- Email alerts for new matches (later release).
- Sharing saved searches.

## Constraints
- No new database. Use the existing Postgres instance.
- p95 for listing saved searches under 150 ms.`),
    P("It says **what** and **why**, and leaves **how** to the plan. Notice criterion 4: security requirements belong in the spec, or they will not be in the code."),
  ),
  K("Spec, plan and tasks: what is the difference?",
    T(["Document", "Answers", "Written by", "You review for"], [
      ["**Spec**", "What must it do, and why?", "You, or the agent interviewing you", "Missing cases, wrong behaviour, scope"],
      ["**Plan**", "How will we build it here?", "The agent, after reading the code", "Fit with the architecture, risk, simpler options"],
      ["**Tasks**", "In what order, in what steps?", "The agent", "Each task is small, testable and independent"],
    ]),
    P("Keeping them separate lets you change the how without touching the what. The same spec could be planned for a different stack."),
  ),
  K("How do acceptance criteria become tests?",
    P("Write criteria in a form that maps one-to-one onto a test. Two common notations:"),
    T(["Notation", "Shape"], [
      ["Given / When / Then", "**Given** a user with 20 saved searches, **when** they save another, **then** the request fails with a limit message"],
      ["EARS", "**WHEN** a user has 20 saved searches **THE SYSTEM SHALL** refuse a new one"],
    ]),
    N("Ask the agent to turn each criterion into a **failing test** first.", "Review the tests: these are the executable version of the spec.", "Then ask it to make them pass **without modifying the tests**.", "Run the whole suite to catch regressions."),
    TRAP("An agent under pressure to go green may weaken a test: loosen an assertion, mock the thing under test, or skip a case. Say explicitly that tests may not change in the implementation step, and check the diff of the test files."),
  ),
  K("Which tools support spec-driven development?",
    T(["Tool", "What it is", "Shape of the workflow"], [
      ["**GitHub Spec Kit**", "Open-source toolkit that adds spec commands to many agents", "Project principles, then specify → plan → tasks → implement"],
      ["**Kiro**", "An AI IDE from AWS built around specs", "`requirements.md` (EARS) → `design.md` → `tasks.md`"],
      ["**BMad Method**", "A framework of agent personas and workflows", "Brief → PRD → architecture → epics and stories → build (next section)"],
      ["**OpenSpec**", "Lightweight change proposals, aimed at existing codebases", "Propose a change as a spec delta, implement, archive"],
      ["**Plan mode + markdown**", "No framework: the agent's planning mode and files in `docs/`", "Write `spec.md`, approve a plan, implement"],
    ]),
    P("They differ in ceremony, not in the idea. A framework helps a team be consistent; a single developer can get most of the benefit from a spec file and plan mode."),
    NOTE("**Check before you quote:** command names and file layouts in these tools change between versions. Read the current README of whichever one you use."),
  ),
  K("When is a spec overkill, and how do you keep one from going stale?",
    P("Scale the process to the risk. A typo fix needs a sentence. A new billing flow needs a reviewed spec."),
    T(["Change", "Right amount of spec"], [
      ["Bug fix, small tweak", "A clear prompt and a failing test"],
      ["A feature in one area", "A short spec with acceptance criteria, then a plan"],
      ["A new product or a cross-cutting change", "PRD, architecture decisions, stories"],
    ]),
    P("Specs rot the same way documentation does. Two approaches work:"),
    L("**Living spec**: it sits in the repo next to the code and is updated in the same pull request as the behaviour.", "**Disposable spec**: it describes one change, is archived when the change ships, and the long-lived truth is the tests plus a few architecture documents."),
  ),
  QUIZ("During implementation you realise an acceptance criterion is wrong. What should happen first?",
    ["Fix the code and move on", "Update the spec, then regenerate or adjust the plan and code", "Delete the criterion's test", "Ask the agent to decide"], 1,
    "The spec is the source of truth. If code and spec drift apart, every later task is built on a document that lies."),
];

export { GO };
