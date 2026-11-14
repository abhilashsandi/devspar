// Diagrams for the AI-Assisted Development guide (all in AI.*). Same visual language as dg.mjs.
import { box, txt, arrow, rect, wrap, M, line } from './dg.mjs';

const defs = (id) => `<defs>${M(id, 'muted')}${M(id + 'a', 'accent')}${M(id + 'd', 'danger')}</defs>`;
const T = { color: 'text' };
// A left-to-right row of boxes joined by arrows: items are [title, sub, style].
const chain = (mk, y, items, o = {}) => {
  const w = o.w || 150, h = o.h || 64, x0 = o.x0 ?? 20, total = o.total ?? 860;
  const gap = items.length > 1 ? (total - items.length * w) / (items.length - 1) : 0;
  return items.map((it, i) => {
    const x = x0 + i * (w + gap);
    return box(x, y, w, h, it[0], it[1] || '', it[2] || 'n') + (i < items.length - 1 ? arrow(`M${x + w + 2} ${y + h / 2} L${x + w + gap - 4} ${y + h / 2}`, mk) : '');
  }).join('');
};

export const AI = {};

AI.loop = wrap('0 0 900 310', `${defs('al')}
${box(20, 96, 150, 70, 'You', 'goal + done-when', 'n')}
${box(250, 30, 190, 66, 'Gather context', 'read files, search, docs', 'a')}
${box(560, 30, 190, 66, 'Take action', 'edit, run a command, call a tool', 'a')}
${box(405, 176, 190, 66, 'Verify', 'tests, types, build, screenshot', 'g')}
${box(730, 176, 150, 66, 'Report', 'what changed, evidence', 'n')}
${arrow('M172 122 C200 100 220 80 246 70', 'al')}
${arrow('M442 63 L556 63', 'ala', 'accent')}
${arrow('M655 98 C650 140 620 165 598 190', 'ala', 'accent')}
${arrow('M403 205 C340 190 330 140 340 100', 'ala', 'accent')}
${txt(300, 160, 'not done: loop again', { color: 'accent', size: 10.5 })}
${arrow('M597 209 L726 209', 'al')}${txt(660, 198, 'passes', { anchor: 'middle', size: 10.5, ...T })}
${txt(450, 276, 'Each turn the model reads the whole context window and picks ONE next step. The harness runs the tool', { anchor: 'middle', size: 10.5 })}
${txt(450, 294, 'and feeds the result back. The model never touches your machine directly.', { anchor: 'middle', size: 10.5 })}
`, 'The agent loop: gather context, take action, verify, and repeat until the checks pass');

const seg = (x, w, title, sub, style) => box(x, 56, w, 70, title, sub, style);
AI.context = wrap('0 0 900 320', `${defs('ac')}
${txt(20, 30, 'THE CONTEXT WINDOW: everything here is re-read on every turn', { color: 'accent', size: 10 })}
${seg(20, 150, 'System + tools', 'instructions, tool list', 'n')}${seg(174, 130, 'Rules files', 'CLAUDE.md / AGENTS.md', 'g')}${seg(308, 120, 'Skill index', 'names + one-liners', 'g')}${seg(432, 150, 'Conversation', 'your turns, its turns', 'n')}${seg(586, 190, 'Files + tool results', 'usually the biggest part', 'a')}
${rect(780, 56, 100, 70, 'panel-2', 'border', { dash: true })}${txt(830, 88, 'room to', { anchor: 'middle', size: 10.5, ...T })}${txt(830, 104, 'answer', { anchor: 'middle', size: 10.5, ...T })}
${txt(20, 176, 'ON DISK: loaded only when the task needs it', { color: 'accent', size: 10 })}
${box(20, 192, 190, 56, 'Skill bodies', 'full instructions, scripts', 'n')}${box(236, 192, 190, 56, 'Specs and docs', 'PRD, architecture, ADRs', 'n')}${box(452, 192, 190, 56, 'The codebase', 'found by search, read in parts', 'n')}${box(668, 192, 212, 56, 'Notes and memory', 'progress files, decisions', 'n')}
${arrow('M547 190 C560 165 620 155 660 130', 'aca', 'accent', true)}${txt(640, 168, 'read on demand', { color: 'accent', size: 10 })}
${txt(450, 284, 'More context is not better context: a full window costs money and latency, and the model attends less', { anchor: 'middle', size: 10.5 })}
${txt(450, 302, 'well to each part. Keep the window small and relevant; keep the rest one tool call away.', { anchor: 'middle', size: 10.5 })}
`, 'What fills a context window, and what stays on disk until a task needs it');

AI.harness = wrap('0 0 900 330', `${defs('ah')}
${txt(450, 24, 'THE HARNESS: everything around the model that turns it into a coding agent', { anchor: 'middle', color: 'accent', size: 10 })}
${box(350, 128, 200, 80, 'Model', 'reasons, picks the next step', 'a')}
${box(30, 40, 220, 62, 'Tools', 'read, edit, shell, search, browser', 'n')}
${box(650, 40, 220, 62, 'MCP servers', 'GitHub, database, docs, design', 'n')}
${box(30, 138, 220, 62, 'Rules and memory', 'CLAUDE.md, AGENTS.md, notes', 'g')}
${box(650, 138, 220, 62, 'Skills and commands', 'packaged workflows, on demand', 'g')}
${box(30, 236, 220, 62, 'Permissions + sandbox', 'allow, ask, deny; isolation', 'd')}
${box(650, 236, 220, 62, 'Hooks', 'format, lint, block, notify', 'n')}
${box(340, 246, 220, 62, 'Subagents', 'separate context windows', 'n')}
${line(252, 71, 348, 140, 'border')}${line(648, 71, 552, 140, 'border')}${line(252, 169, 348, 169, 'border')}${line(648, 169, 552, 169, 'border')}${line(252, 267, 348, 200, 'border')}${line(648, 267, 552, 200, 'border')}${line(450, 210, 450, 244, 'border')}
`, 'Anatomy of an agent harness: tools, MCP servers, rules and memory, skills, permissions, hooks and subagents around the model');

AI.spec = wrap('0 0 900 270', `${defs('as')}
${chain('as', 46, [['Intent', 'the why', 'n'], ['Spec', 'behaviour + criteria', 'a'], ['Plan', 'approach, risks', 'a'], ['Tasks', 'small, testable', 'n'], ['Implement', 'one task at a time', 'n'], ['Verify', 'tests + review', 'g']], { w: 132, h: 70, x0: 14, total: 872 })}
${[1, 2, 5].map((i) => { const x = 14 + i * (132 + (872 - 6 * 132) / 5) + 66; return txt(x, 34, 'you approve ▼', { anchor: 'middle', color: 'gold', size: 10.5, weight: 700 }); }).join('')}
${arrow('M820 120 C820 200 250 200 232 122', 'asd', 'danger', true)}
${txt(520, 196, 'wrong behaviour? fix the spec first, then regenerate: the spec is the source of truth', { anchor: 'middle', color: 'danger', size: 10.5 })}
${txt(450, 244, 'Review effort moves left: catching a wrong requirement in a one-page spec is cheaper than in a 2,000-line diff.', { anchor: 'middle', size: 10.5 })}
`, 'Spec-driven development: intent, spec, plan, tasks, implement and verify, with human approval at the spec, plan and verify steps');

const phase = (x, n, name, who, items, style) => rect(x, 36, 204, 190, 'panel', style === 'a' ? 'accent' : 'border') +
  txt(x + 14, 60, n + '  ' + name, { font: 'sans', size: 13, ...T, weight: 700 }) + txt(x + 14, 78, who, { size: 9.5, color: 'accent' }) +
  items.map((l, i) => txt(x + 14, 104 + i * 20, '· ' + l, { size: 10, ...T })).join('');
AI.bmad = wrap('0 0 900 340', `${defs('ab')}
${phase(14, 1, 'Analysis', 'Analyst (optional)', ['brainstorm, research', 'pressure-test the idea', 'product brief or PRFAQ'], 'n')}
${phase(232, 2, 'Planning', 'PM, UX designer', ['PRD: what and why', 'UX design', 'Quick Flow: tech spec only'], 'a')}
${phase(450, 3, 'Solutioning', 'Architect, PM', ['architecture + ADRs', 'epics and stories', 'readiness check'], 'a')}
${phase(668, 4, 'Implementation', 'Developer', ['sprint planning', 'create story → dev story', '→ code review, per story', 'retrospective per epic'], 'n')}
${arrow('M220 130 L230 130', 'ab')}${arrow('M438 130 L448 130', 'ab')}${arrow('M656 130 L666 130', 'ab')}
${txt(14, 254, 'ARTIFACTS', { color: 'accent', size: 9.5 })}
${txt(14, 274, 'product-brief.md  →  prd.md  →  architecture.md + epics  →  story files  →  code + review trail', { size: 10.5, ...T })}
${txt(14, 302, 'Each workflow runs in a fresh chat. The documents, not the chat history, carry the context forward;', { size: 10.5 })}
${txt(14, 320, 'project-context.md holds the rules every agent must follow.', { size: 10.5 })}
`, 'The BMad Method: four phases (analysis, planning, solutioning, implementation), the agent for each and the documents they produce');

const lane = (y, label, cells, style) => txt(14, y + 34, label, { font: 'sans', size: 11.5, ...T, weight: 700 }) +
  cells.map((c, i) => box(104 + i * 132, y, 124, 58, c[0], c[1], style)).join('');
AI.workflow = wrap('0 0 900 300', `${defs('aw')}
${['1 Explore', '2 Spec + plan', '3 Tests first', '4 Build', '5 Review', '6 Ship'].map((s, i) => txt(166 + i * 132, 28, s, { anchor: 'middle', color: 'accent', size: 10.5, weight: 700 })).join('')}
${lane(44, 'You decide', [['Ask, choose', 'the approach'], ['Approve', 'spec and plan'], ['Agree', 'acceptance tests'], ['Steer', 'answer questions'], ['Read the diff', 'challenge it'], ['Own the merge', 'and the outcome']], 'g')}
${lane(132, 'Agent does', [['Read the code', 'map the change'], ['Draft spec,', 'plan, task list'], ['Write failing', 'tests'], ['Small slices,', 'run the checks'], ['Self-review,', 'second-agent review'], ['PR text,', 'fix CI']], 'a')}
${[0, 1, 2, 3, 4, 5].map((i) => line(166 + i * 132, 104, 166 + i * 132, 130, 'border', true)).join('')}
${arrow('M104 216 L880 216', 'aw')}
${txt(450, 248, 'The agent does the typing and the first round of checking. You keep the decisions: what to build,', { anchor: 'middle', size: 10.5 })}
${txt(450, 266, 'what counts as done, and whether it is good enough to ship. Accountability does not transfer.', { anchor: 'middle', size: 10.5 })}
`, 'A full-stack feature built with an agent: what you decide and what the agent does at each of six steps');

AI.verify = wrap('0 0 900 240', `${defs('av')}
${chain('av', 40, [['Types + lint', 'seconds', 'n'], ['Unit tests', 'seconds', 'n'], ['Integration, e2e', 'minutes', 'n'], ['Run it', 'browser, curl, logs', 'a'], ['Human review', 'you, then a teammate', 'g']], { w: 152, h: 66, x0: 14, total: 872 })}
${rect(14, 124, 692, 34, 'accent-soft', 'accent')}${txt(360, 145, 'the agent can run all of these itself: give it the commands and require the output', { anchor: 'middle', size: 10.5, ...T })}
${rect(734, 124, 152, 34, 'gold-soft', 'gold')}${txt(810, 145, 'cannot be delegated', { anchor: 'middle', size: 10.5, ...T })}
${txt(450, 196, 'cheap, fast checks first; each rung catches what the one before it cannot', { anchor: 'middle', size: 10.5 })}
${txt(450, 216, '"Done" without evidence (a passing test run, a screenshot, a log line) is a claim, not a result.', { anchor: 'middle', size: 10.5, ...T })}
`, 'The verification ladder: types and lint, unit tests, integration tests, running the app, then human review');

export default AI;
