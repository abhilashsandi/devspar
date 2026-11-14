// Diagrams for the Whiteboard Explanations guide (WB.*). Each one carries numbered badges in the order
// you would draw it, so the card's "draw this" steps and the picture line up.
import { box, txt, arrow, rect, wrap, M, line } from './dg.mjs';

const defs = (id) => `<defs>${M(id, 'muted')}${M(id + 'a', 'accent')}${M(id + 'd', 'danger')}</defs>`;
const T = { color: 'text' };
// A numbered badge: the order in which to draw.
const n = (num, x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="var(--accent)"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-family="var(--sans)" font-size="12" font-weight="700" fill="var(--accent-ink)">${num}</text>`;
const chain = (mk, y, items, o = {}) => {
  const w = o.w || 150, h = o.h || 64, x0 = o.x0 ?? 20, total = o.total ?? 860;
  const gap = items.length > 1 ? (total - items.length * w) / (items.length - 1) : 0;
  return items.map((it, i) => {
    const x = x0 + i * (w + gap);
    return box(x, y, w, h, it[0], it[1] || '', it[2] || 'n') + (o.badges ? n(i + 1, x + 4, y + 2) : '') + (i < items.length - 1 ? arrow(`M${x + w + 2} ${y + h / 2} L${x + w + gap - 4} ${y + h / 2}`, mk) : '');
  }).join('');
};

export const WB = {};

WB.eventLoop = wrap('0 0 900 350', `${defs('we')}
${rect(30, 40, 170, 220, 'panel', 'border')}${txt(115, 62, 'Call stack', { anchor: 'middle', font: 'sans', size: 13, ...T, weight: 700 })}${n(1, 34, 42)}
${box(44, 206, 142, 40, 'main()', '', 'n')}${box(44, 160, 142, 40, 'onClick()', '', 'a')}
${box(280, 40, 210, 72, 'Web / Node APIs', 'timers, fetch, DOM events, I/O', 'n')}${n(2, 284, 42)}
${box(570, 40, 300, 72, 'Task queue', 'setTimeout cb · click · message', 'n')}${n(3, 574, 42)}
${box(570, 170, 300, 72, 'Microtask queue', '.then · await · queueMicrotask', 'g')}${n(4, 574, 172)}
${arrow('M202 76 L276 76', 'we')}${txt(239, 66, 'schedules', { anchor: 'middle', size: 10 })}
${arrow('M492 76 L566 76', 'we')}${txt(529, 66, 'when ready', { anchor: 'middle', size: 10 })}
${arrow('M568 206 C460 206 330 200 204 190', 'wea', 'accent')}${txt(390, 186, 'ALL of them, first', { anchor: 'middle', color: 'accent', size: 10.5, weight: 700 })}
${arrow('M620 114 C600 150 380 250 204 232', 'we')}${txt(420, 254, 'then ONE task', { anchor: 'middle', size: 10.5, ...T, weight: 700 })}
${n(5, 40, 300)}${txt(60, 296, 'The loop:  stack empty  →  drain all microtasks  →  (browser may render)  →  run one task  →  repeat', { size: 11, ...T })}
${txt(60, 318, 'Consequences: promises run before setTimeout(fn, 0); a long task or an endless microtask chain blocks everything.', { size: 10.5 })}
`, 'The JavaScript event loop drawn in five steps: call stack, platform APIs, task queue, microtask queue and the loop rule');

const cellW = 118;
const tcell = (lane, slot, label, style) => box(150 + slot * (cellW + 8), 50 + lane * 62, cellW, 44, label, '', style);
WB.promise = wrap('0 0 900 320', `${defs('wp')}
${txt(20, 30, 'time  →', { color: 'accent', size: 10.5 })}
${['Call stack', 'Microtasks', 'Tasks'].map((l, i) => txt(20, 78 + i * 62, l, { font: 'sans', size: 12, ...T, weight: 700 }) + line(140, 102 + i * 62, 880, 102 + i * 62, 'border', true)).join('')}
${tcell(0, 0, 'log("A")', 'n')}${tcell(0, 1, 'setTimeout(…)', 'n')}${tcell(0, 2, 'p.then(…)', 'n')}${tcell(0, 3, 'log("D")', 'n')}
${tcell(1, 4, 'log("C")', 'g')}${tcell(2, 5, 'log("B")', 'a')}
${n(1, 152, 52)}${n(2, 656, 114)}${n(3, 782, 176)}
${arrow('M335 96 C335 190 700 150 778 196', 'wp', 'muted', true)}${arrow('M461 96 C470 130 600 120 652 134', 'wp', 'muted', true)}
${txt(20, 262, 'Output:  A  D  C  B', { font: 'sans', size: 14, ...T, weight: 700 })}
${txt(20, 286, '1  all synchronous code runs to the end     2  then every queued microtask     3  then one task (the timer)', { size: 10.5 })}
${txt(20, 306, 'await works the same way: the rest of the async function is a microtask that runs after the current stack empties.', { size: 10.5 })}
`, 'Timeline of a promise and a timer: synchronous code first, then microtasks, then the timer task');

WB.reactRender = wrap('0 0 900 300', `${defs('wr')}
${chain('wr', 44, [['Trigger', 'setState, props, context', 'n'], ['Render', 'call components', 'a'], ['Reconcile', 'diff by type + key', 'a'], ['Commit', 'mutate the DOM', 'g'], ['Effects', 'layout, paint, passive', 'n']], { w: 152, h: 68, x0: 14, total: 872, badges: true })}
${rect(194, 132, 332, 56, 'accent-soft', 'accent')}${txt(360, 156, 'render phase: pure, no DOM, can be', { anchor: 'middle', size: 10.5, ...T })}${txt(360, 174, 'paused or thrown away', { anchor: 'middle', size: 10.5, ...T })}
${rect(554, 132, 332, 56, 'gold-soft', 'gold')}${txt(720, 156, 'commit phase: synchronous, cannot be', { anchor: 'middle', size: 10.5, ...T })}${txt(720, 174, 'interrupted', { anchor: 'middle', size: 10.5, ...T })}
${txt(14, 226, 'Effect order after commit:  useLayoutEffect  →  browser paints  →  useEffect', { size: 11, ...T })}
${txt(14, 252, 'A re-render is not a DOM update. If the new tree equals the old one, commit changes nothing.', { size: 10.5 })}
${txt(14, 272, 'A parent re-rendering re-renders its children by default; memo, stable props and state placement control that.', { size: 10.5 })}
`, 'React update in five steps: trigger, render, reconcile, commit and effects, with the render and commit phases marked');

const item = (x, y, key, label, style) => box(x, y, 92, 34, label, '', style) + txt(x + 46, y - 6, 'key=' + key, { anchor: 'middle', size: 9.5 });
WB.keys = wrap('0 0 900 320', `${defs('wk')}
${rect(14, 14, 426, 292, 'panel-2', 'border')}${txt(28, 38, 'key = index', { font: 'sans', size: 13, color: 'danger', weight: 700 })}${n(1, 420, 30)}
${txt(28, 70, 'before', { size: 10 })}${item(90, 60, 0, 'Apple', 'n')}${item(196, 60, 1, 'Pear', 'n')}${item(302, 60, 2, 'Plum', 'n')}
${txt(28, 142, 'after', { size: 10 })}${item(90, 132, 0, 'Kiwi', 'd')}${item(196, 132, 1, 'Apple', 'd')}${item(302, 132, 2, 'Pear', 'd')}
${item(90, 200, 3, 'Plum', 'd')}
${txt(28, 262, 'Insert at the top: every key now points at a different', { size: 10.5, ...T })}${txt(28, 280, 'item. All rows update, and row state (a typed input,', { size: 10.5, ...T })}${txt(28, 298, 'focus) stays with the position, not the item.', { size: 10.5, ...T })}
${rect(460, 14, 426, 292, 'panel-2', 'border')}${txt(474, 38, 'key = stable id', { font: 'sans', size: 13, color: 'accent', weight: 700 })}${n(2, 866, 30)}
${txt(474, 70, 'before', { size: 10 })}${item(536, 60, 'a', 'Apple', 'n')}${item(642, 60, 'p', 'Pear', 'n')}${item(748, 60, 'm', 'Plum', 'n')}
${txt(474, 142, 'after', { size: 10 })}${item(536, 132, 'k', 'Kiwi', 'a')}${item(642, 132, 'a', 'Apple', 'n')}${item(748, 132, 'p', 'Pear', 'n')}
${item(536, 200, 'm', 'Plum', 'n')}
${txt(474, 262, 'React matches items by key: one new node is created,', { size: 10.5, ...T })}${txt(474, 280, 'the others are moved. State travels with its item.', { size: 10.5, ...T })}
`, 'List reconciliation: index keys make every row update after an insert, stable id keys create one node and move the rest');

WB.request = wrap('0 0 900 350', `${defs('wq')}
${box(14, 60, 110, 60, 'Browser', '', 'n')}${n(1, 18, 62)}
${box(160, 60, 110, 60, 'DNS', 'name → IP', 'n')}${n(2, 164, 62)}
${box(306, 60, 124, 60, 'CDN / edge', 'TLS, cached assets', 'g')}${n(3, 310, 62)}
${box(466, 60, 124, 60, 'Load balancer', 'health checks', 'n')}${n(4, 470, 62)}
${box(626, 30, 124, 50, 'App server', '', 'a')}${box(626, 100, 124, 50, 'App server', '', 'a')}${n(5, 630, 32)}
${box(626, 196, 124, 56, 'Cache', 'Redis', 'g')}${n(6, 630, 198)}
${box(786, 60, 100, 60, 'Database', 'primary', 'n')}${box(786, 196, 100, 56, 'Replica', 'reads', 'n')}${n(7, 790, 62)}
${arrow('M126 90 L156 90', 'wq')}${arrow('M272 90 L302 90', 'wq')}${arrow('M432 90 L462 90', 'wq')}${arrow('M592 82 L622 60', 'wq')}${arrow('M592 98 L622 122', 'wq')}
${arrow('M688 152 L688 192', 'wq')}${arrow('M752 90 L782 90', 'wq')}${arrow('M836 122 L836 192', 'wq', 'muted', true)}
${txt(14, 200, '1  user action, check the browser cache', { size: 10.5, ...T })}
${txt(14, 220, '2  resolve the name (cached at several levels)', { size: 10.5, ...T })}
${txt(14, 240, '3  TLS ends at the edge; static and cached responses stop here', { size: 10.5, ...T })}
${txt(14, 260, '4  pick a healthy instance; instances are stateless', { size: 10.5, ...T })}
${txt(14, 280, '5  authenticate, validate, run the business logic', { size: 10.5, ...T })}
${txt(14, 300, '6  cache hit returns now; a miss goes to the database and fills the cache', { size: 10.5, ...T })}
${txt(14, 320, '7  writes go to the primary, reads can use replicas (they lag slightly)', { size: 10.5, ...T })}
${txt(14, 342, 'Then say what each hop adds: latency, a cache, a failure mode.', { size: 10.5 })}
`, 'A request through the stack in seven steps: browser, DNS, CDN, load balancer, app servers, cache and database');

const node = (x, y, keys, style) => rect(x, y, keys.length * 44 + 8, 36, style === 'a' ? 'accent-soft' : 'panel', style === 'a' ? 'accent' : 'border') + keys.map((k, i) => txt(x + 26 + i * 44, y + 23, k, { anchor: 'middle', size: 11.5, ...T, weight: 600 })).join('');
WB.btree = wrap('0 0 900 330', `${defs('wt')}
${node(396, 24, ['50', '100'], 'a')}${n(1, 388, 24)}
${node(110, 110, ['10', '20', '30'], 'n')}${node(374, 110, ['60', '70', '80'], 'a')}${node(660, 110, ['110', '120'], 'n')}${n(2, 366, 110)}
${arrow('M410 62 L190 106', 'wt')}${arrow('M444 62 L444 106', 'wta', 'accent')}${arrow('M478 62 L700 106', 'wt')}
${txt(280, 84, '< 50', { size: 10 })}${txt(452, 88, '50 to 100', { size: 10, color: 'accent' })}${txt(610, 84, '> 100', { size: 10 })}
${rect(330, 206, 230, 44, 'gold-soft', 'gold')}${txt(445, 233, 'row: id=70, name, email, …', { anchor: 'middle', size: 11, ...T })}${n(3, 322, 206)}
${arrow('M444 148 L444 202', 'wta', 'accent')}${txt(456, 180, 'pointer to the row', { size: 10, color: 'accent' })}
${arrow('M246 128 L370 128', 'wt', 'muted', true)}${arrow('M518 128 L656 128', 'wt', 'muted', true)}${txt(308, 120, 'next', { anchor: 'middle', size: 9.5 })}${txt(588, 120, 'next', { anchor: 'middle', size: 9.5 })}
${txt(14, 284, 'WHERE id = 70:  1  root says "between 50 and 100"   2  that leaf page holds 70   3  follow the pointer to the row.', { size: 10.5, ...T })}
${txt(14, 306, 'A few page reads instead of scanning every row; depth grows with log n. Leaves are linked, so ranges and ORDER BY are cheap.', { size: 10.5 })}
`, 'A B-tree index lookup in three steps: root node, leaf node, then the pointer to the table row');

WB.middleware = wrap('0 0 900 270', `${defs('wm')}
${chain('wm', 50, [['Request', 'method, path, headers', 'n'], ['Logger', 'request id, timing', 'n'], ['Auth', 'who is this?', 'a'], ['Validate', 'is the input ok?', 'a'], ['Handler', 'business logic', 'g']], { w: 150, h: 66, x0: 14, total: 872, badges: true })}
${box(374, 170, 190, 60, 'Error handler', 'one place, one error shape', 'd')}${n(6, 378, 172)}
${arrow('M450 118 C450 140 460 150 466 166', 'wmd', 'danger', true)}${arrow('M630 118 C620 150 590 170 568 186', 'wmd', 'danger', true)}
${txt(672, 150, '401 / 403, 400: stop here', { size: 10.5, color: 'danger' })}
${arrow('M808 118 C808 220 700 204 568 204', 'wm', 'muted', true)}${txt(720, 232, 'thrown errors land here too', { anchor: 'middle', size: 10.5 })}
${txt(14, 196, 'Each step either passes the request on', { size: 10.5, ...T })}${txt(14, 214, 'or ends it with a response. Order matters:', { size: 10.5, ...T })}${txt(14, 232, 'authenticate before you validate or work.', { size: 10.5, ...T })}
`, 'A request passing through middleware: logger, auth, validation and handler, with failures routed to one error handler');

const zone = (x, y, w, h, num, title, lines, style) => rect(x, y, w, h, 'panel', style === 'a' ? 'accent' : 'border') + n(num, x + 4, y + 4) +
  txt(x + 24, y + 22, title, { font: 'sans', size: 12.5, ...T, weight: 700 }) + lines.map((l, i) => txt(x + 14, y + 44 + i * 17, l, { size: 10 })).join('');
WB.designBoard = wrap('0 0 900 400', `${defs('wd')}
${zone(14, 14, 280, 116, 1, 'Requirements  · 5 min', ['functional: the 3 core flows', 'non-functional: scale, latency,', 'availability, consistency', 'out of scope: say it'], 'n')}
${zone(310, 14, 280, 116, 2, 'Numbers  · 3 min', ['DAU → requests/s (avg, peak)', 'read : write ratio', 'storage per year', 'what the numbers imply'], 'n')}
${zone(606, 14, 280, 116, 3, 'API + data model  · 5 min', ['3 to 5 endpoints', 'main entities and keys', 'SQL or NoSQL, and why'], 'n')}
${zone(14, 146, 576, 150, 4, 'High-level diagram  · 10 min', [], 'a')}
${box(40, 196, 96, 44, 'Client', '', 'n')}${box(162, 196, 96, 44, 'CDN / LB', '', 'n')}${box(284, 196, 96, 44, 'Services', '', 'n')}${box(406, 176, 76, 38, 'Cache', '', 'g')}${box(406, 224, 76, 38, 'DB', '', 'n')}${box(500, 196, 76, 44, 'Queue', '', 'n')}
${arrow('M138 218 L158 218', 'wd')}${arrow('M260 218 L280 218', 'wd')}${arrow('M382 208 L402 198', 'wd')}${arrow('M382 228 L402 240', 'wd')}
${zone(606, 146, 280, 150, 5, 'Deep dives  · 10 min', ['the interviewer picks, or you', 'offer: hot path, data scaling,', 'consistency, a failure scenario', 'draw detail here, not in box 4'], 'n')}
${zone(14, 312, 872, 74, 6, 'Trade-offs and wrap-up  · 5 min', ['what you chose and what it costs · bottlenecks and how you would find them · what you would do with more time'], 'n')}
`, 'How to lay out a whiteboard for a system design answer in six zones with a time budget for each');

WB.rag = wrap('0 0 900 300', `${defs('wg')}
${txt(14, 28, 'INDEXING  (once, and whenever documents change)', { color: 'accent', size: 10 })}
${chain('wg', 40, [['Documents', 'PDFs, pages, tickets', 'n'], ['Chunk', 'split with overlap', 'n'], ['Embed', 'text → vector', 'a'], ['Vector store', 'vectors + metadata', 'g']], { w: 170, h: 60, x0: 14, total: 760 })}${n(1, 18, 42)}
${txt(14, 148, 'QUERY  (every question)', { color: 'accent', size: 10 })}
${chain('wg', 160, [['Question', '', 'n'], ['Embed', 'same model', 'a'], ['Retrieve', 'top-k similar chunks', 'g'], ['Prompt', 'question + chunks', 'n'], ['LLM', 'answer + citations', 'a']], { w: 150, h: 60, x0: 14, total: 872 })}${n(2, 18, 162)}${n(3, 380, 162)}${n(4, 560, 162)}${n(5, 740, 162)}
${arrow('M690 102 C690 130 460 130 450 156', 'wga', 'accent', true)}
${txt(14, 256, 'The model answers from the retrieved text, not from memory: current, private data and citations without retraining.', { size: 10.5, ...T })}
${txt(14, 278, 'Most failures are retrieval failures: bad chunking, the wrong k, no re-ranking. Evaluate retrieval separately from the answer.', { size: 10.5 })}
`, 'Retrieval-augmented generation: an indexing pipeline and a query pipeline that retrieves chunks into the prompt');

export default WB;
