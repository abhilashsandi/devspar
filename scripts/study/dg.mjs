// SVG diagrams for the new cards. Same tokens as the genai / interview-prep diagrams (var(--panel), --accent, ...).
const X = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const M = (id, color) => `<marker id="${id}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="var(--${color})"/></marker>`;
const box = (x, y, w, h, title, sub, style = 'n') => {
  const fill = { n: 'var(--panel)', a: 'var(--accent-soft)', g: 'var(--gold-soft)', d: 'var(--panel)' }[style];
  const stroke = { n: 'var(--border)', a: 'var(--accent)', g: 'var(--gold)', d: 'var(--danger)' }[style];
  const cx = x + w / 2, ty = sub ? y + h / 2 - 3 : y + h / 2 + 4;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>` +
    `<text x="${cx}" y="${ty}" text-anchor="middle" font-family="var(--sans)" font-size="12" font-weight="600" fill="var(--text)">${X(title)}</text>` +
    (sub ? `<text x="${cx}" y="${ty + 14}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--muted)">${X(sub)}</text>` : '');
};
const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" ${o.anchor ? `text-anchor="${o.anchor}"` : ''} font-family="var(--${o.font || 'mono'})" font-size="${o.size || 10}" fill="var(--${o.color || 'muted'})"${o.weight ? ` font-weight="${o.weight}"` : ''}>${X(s)}</text>`;
const arrow = (d, marker, color = 'muted', dash) => `<path d="${d}" fill="none" stroke="var(--${color})" stroke-width="1.5"${dash ? ' stroke-dasharray="5 4"' : ''} marker-end="url(#${marker})"/>`;
const line = (x1, y1, x2, y2, color = 'border', dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--${color})" stroke-width="1.4"${dash ? ' stroke-dasharray="4 4"' : ''}/>`;
const rect = (x, y, w, h, fill = 'panel-2', stroke = 'border', o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 8}" fill="var(--${fill})" stroke="var(--${stroke})" stroke-width="1.4"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`;
const wrap = (vb, body, caption) => { const w = vb.split(' ')[2]; return `<div class="diagram"><svg viewBox="${vb}" width="${w}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${caption}">${body}</svg></div>`; };
const D = {};

// ================================================================ Next.js
D.nextRender = wrap('0 0 900 330', `
<defs>${M('nr1', 'muted')}</defs>
${txt(140, 20, 'WHERE THE HTML IS MADE', { color: 'accent', size: 9.5 })}${txt(430, 20, 'WHERE IT IS SERVED FROM', { color: 'accent', size: 9.5 })}${txt(680, 20, 'WHAT THE USER GETS', { color: 'accent', size: 9.5 })}
${[
  ['SSG', 'At build time, once', 'CDN, until the next deploy', 'Instant, same for everyone', 'a'],
  ['ISR', 'Build, then re-made every N s', 'CDN, stale-while-revalidate', 'Instant, possibly slightly stale', 'a'],
  ['SSR', 'On the server, every request', 'Nothing shared: rendered per user', 'Slower first byte, always fresh', 'g'],
  ['CSR', 'Empty shell at build, UI in the browser', 'CDN serves the shell + JS bundle', 'Spinner first, then data fetched', 'n'],
  ['Cache Components', 'Static shell at build, "holes" per request', 'CDN shell + streamed dynamic parts', 'Instant shell, fresh personal parts', 'a'],
].map((r, i) => {
  const y = 34 + i * 58;
  return txt(10, y + 26, r[0], { font: 'sans', size: r[0].length > 5 ? 11 : 13, color: 'text', weight: 700 }) +
    box(140, y, 250, 46, r[1], '', r[4]) + box(420, y, 230, 46, r[2], '', 'n') + box(680, y, 210, 46, r[3], '', 'n') +
    arrow(`M392 ${y + 23} L416 ${y + 23}`, 'nr1') + arrow(`M652 ${y + 23} L676 ${y + 23}`, 'nr1');
}).join('')}
`, 'How SSG, ISR, SSR, CSR and Cache Components differ in where HTML is produced and served');

D.nextBoundary = wrap('0 0 900 330', `
<defs>${M('nb1', 'muted')}${M('nb2', 'gold', 'gold')}</defs>
${rect(20, 8, 860, 314, 'panel-2', 'border')}
${txt(34, 26, 'SERVER  (renders once per request or at build; code and secrets never reach the browser)', { color: 'accent', size: 9.5 })}
${box(350, 36, 200, 40, 'layout.tsx', 'Server Component', 'a')}
${box(350, 100, 200, 40, 'page.tsx', 'async, fetches from the DB', 'a')}
${box(100, 176, 200, 40, 'ProductList', 'Server Component', 'a')}
${box(350, 176, 200, 40, 'ProductDetails', 'Server Component', 'a')}
${arrow('M450 78 L450 96', 'nb1')}${arrow('M420 142 L220 172', 'nb1')}${arrow('M450 142 L450 172', 'nb1')}${arrow('M480 142 L640 172', 'nb1')}
${rect(590, 168, 270, 146, 'gold-soft', 'gold', { dash: true })}
${txt(602, 186, 'CLIENT BOUNDARY  ("use client")', { color: 'gold', size: 9.5 })}
${box(620, 196, 210, 40, 'AddToCartButton', 'Client Component: state, events', 'g')}
${box(620, 258, 210, 44, 'children slot', 'a Server Component can be passed in', 'a')}
${arrow('M725 238 L725 254', 'nb2', 'gold')}
${txt(34, 262, 'Rules of thumb', { color: 'text', size: 10.5, weight: 700 })}
${txt(34, 280, '· Default to Server Components; add "use client" only at the leaves that need state or events.', { font: 'sans', size: 11 })}
${txt(34, 297, '· Props that cross the boundary must be serializable (no functions, except Server Actions).', { font: 'sans', size: 11 })}
${txt(34, 314, '· A Client Component cannot import a Server Component, but it can render one passed as children.', { font: 'sans', size: 11 })}
`, 'Server Components with a client boundary around interactive leaves');

D.nextCache = wrap('0 0 900 300', `
<defs>${M('nc1', 'muted')}${M('nc2', 'accent', 'accent')}</defs>
${box(10, 30, 150, 62, 'Router Cache', 'in the browser, per session', 'g')}
${box(190, 30, 170, 62, 'Full Route Cache', 'HTML + RSC payload, server', 'a')}
${box(390, 30, 170, 62, 'Request Memoization', 'one render pass only', 'n')}
${box(590, 30, 150, 62, 'Data Cache', 'fetch() results, server', 'a')}
${box(770, 30, 120, 62, 'Origin', 'DB, API, CMS', 'n')}
${arrow('M162 61 L186 61', 'nc1')}${arrow('M362 61 L386 61', 'nc1')}${arrow('M562 61 L586 61', 'nc1')}${arrow('M742 61 L766 61', 'nc1')}
${txt(10, 118, 'HOW LONG IT LIVES / WHAT CLEARS IT', { color: 'accent', size: 9.5 })}
${txt(10, 140, 'Router Cache', { color: 'text', weight: 700 })}${txt(150, 140, 'until a full reload or router.refresh(); a Server Action that revalidates clears it', { font: 'sans', size: 11 })}
${txt(10, 162, 'Full Route Cache', { color: 'text', weight: 700 })}${txt(150, 162, 'static routes only, until a redeploy or revalidatePath / revalidateTag / time-based revalidate', { font: 'sans', size: 11 })}
${txt(10, 184, 'Memoization', { color: 'text', weight: 700 })}${txt(150, 184, 'duplicate fetch() calls (same URL + options) inside one render become a single request', { font: 'sans', size: 11 })}
${txt(10, 206, 'Data Cache', { color: 'text', weight: 700 })}${txt(150, 206, 'persists across requests until revalidate seconds pass or a tag is invalidated', { font: 'sans', size: 11 })}
${rect(10, 226, 880, 60, 'accent-soft', 'accent')}
${txt(24, 246, 'Next.js 16 with cacheComponents: true', { color: 'accent', size: 10.5, weight: 700 })}
${txt(24, 264, 'Caching becomes explicit: nothing is cached unless a function or component opts in with "use cache" (+ cacheLife / cacheTag).', { font: 'sans', size: 11 })}
${txt(24, 279, 'The layers above still explain the App Router model of Next.js 13 to 15 that most existing codebases and interviews still use.', { font: 'sans', size: 11 })}
`, 'The Next.js caching layers and what invalidates each');

D.nextCC = wrap('0 0 900 330', `
<defs>${M('cc1', 'muted')}${M('cc2', 'accent', 'accent')}</defs>
${rect(10, 10, 400, 310, 'panel', 'border')}
${txt(24, 28, 'ONE ROUTE, THREE KINDS OF PARTS', { color: 'accent', size: 9.5 })}
${box(24, 40, 372, 44, 'Header, nav, footer', 'static: prerendered into the shell', 'a')}
${box(24, 96, 372, 62, 'Product details', '"use cache" + cacheLife("hours"), refreshed in the background', 'a')}
${rect(24, 170, 372, 60, 'gold-soft', 'gold', { dash: true })}
${txt(36, 188, '<Suspense fallback={<Skeleton/>}>', { color: 'gold', size: 9.5 })}
${box(40, 194, 340, 30, 'Greeting: reads cookies()  (request time)', '', 'g')}
${rect(24, 242, 372, 68, 'gold-soft', 'gold', { dash: true })}
${txt(36, 260, '<Suspense fallback={<CartSkeleton/>}>', { color: 'gold', size: 9.5 })}
${box(40, 266, 340, 32, 'Cart badge + recommendations (per user)', '', 'g')}
${box(470, 30, 400, 64, '1  Build / first request', 'prerender the static shell and the "use cache" parts', 'a')}
${box(470, 128, 400, 64, '2  User requests the page', 'CDN sends the shell immediately: fast first paint', 'a')}
${box(470, 226, 400, 64, '3  Server streams the holes', 'each Suspense boundary replaces its fallback when ready', 'g')}
${arrow('M670 96 L670 124', 'cc2', 'accent')}${arrow('M670 194 L670 222', 'cc2', 'accent')}
${txt(470, 308, 'Runtime data (cookies, headers, searchParams) must sit', { font: 'sans', size: 10.5 })}${txt(470, 322, 'inside Suspense or a "use cache: private" scope.', { font: 'sans', size: 10.5 })}
`, 'Cache Components: a static shell with streamed dynamic holes');

D.nextAction = wrap('0 0 900 210', `
<defs>${M('na1', 'muted')}${M('na2', 'accent', 'accent')}</defs>
${box(10, 40, 150, 66, '<form action={fn}>', 'or startTransition(fn)', 'a')}
${box(190, 40, 150, 66, 'POST to the page URL', 'action id + arguments', 'n')}
${box(370, 40, 170, 66, 'Server Action runs', 'validate, authorize, mutate', 'g')}
${box(570, 40, 150, 66, 'Invalidate', 'updateTag / revalidateTag', 'a')}
${box(750, 40, 140, 66, 'Response', 'new RSC payload + result', 'n')}
${arrow('M162 73 L186 73', 'na1')}${arrow('M342 73 L366 73', 'na1')}${arrow('M542 73 L566 73', 'na1')}${arrow('M722 73 L746 73', 'na1')}
${arrow('M820 108 L820 150 L85 150 L85 110', 'na2', 'accent', true)}
${txt(450, 144, 'React updates the UI in place; isPending / useActionState drive the pending and error states', { anchor: 'middle', color: 'accent', size: 10 })}
${txt(10, 186, 'A Server Action is a public POST endpoint: re-check authentication and authorization inside it, and validate every input.', { font: 'sans', size: 11, color: 'text' })}
`, 'Lifecycle of a Next.js Server Action');

D.nextRequest = wrap('0 0 900 190', `
<defs>${M('nq1', 'muted')}</defs>
${box(10, 40, 110, 60, 'Request', 'from the browser', 'n')}
${box(150, 40, 170, 60, 'next.config', 'headers, redirects, rewrites', 'n')}
${box(350, 40, 150, 60, 'proxy.ts', 'Node.js, before routes', 'g')}
${box(530, 40, 160, 60, 'File-system route', 'layout.tsx → page.tsx', 'a')}
${box(720, 40, 170, 60, 'Response', 'streamed RSC + HTML', 'n')}
${arrow('M122 70 L146 70', 'nq1')}${arrow('M322 70 L346 70', 'nq1')}${arrow('M502 70 L526 70', 'nq1')}${arrow('M692 70 L716 70', 'nq1')}
${txt(350, 124, 'proxy: redirect, rewrite, set headers, cheap cookie checks', { color: 'gold', size: 10 })}
${txt(530, 124, 'Server Components fetch data and render', { color: 'accent', size: 10 })}
${txt(10, 160, 'proxy.ts replaces middleware.ts (renamed in Next.js 16). It is a network-boundary tool, not the place for full authorization or heavy work.', { font: 'sans', size: 11, color: 'text' })}
`, 'Request lifecycle in Next.js 16 with proxy.ts');

// ================================================================ Tailwind / CSS
D.twBox = wrap('0 0 900 290', `
<defs>${M('tb1', 'muted')}</defs>
${rect(30, 20, 320, 250, 'gold-soft', 'gold')}${txt(44, 38, 'margin', { color: 'gold', size: 10 })}
${rect(62, 50, 256, 190, 'panel', 'border')}${txt(76, 68, 'border', { color: 'muted', size: 10 })}
${rect(90, 80, 200, 132, 'accent-soft', 'accent')}${txt(104, 98, 'padding', { color: 'accent', size: 10 })}
${rect(122, 108, 136, 74, 'panel', 'accent')}${txt(190, 150, 'content', { anchor: 'middle', color: 'text', font: 'sans', size: 12, weight: 600 })}
${txt(380, 40, 'width: 200px; padding: 20px; border: 2px solid', { color: 'text', size: 10.5, weight: 700 })}
${txt(380, 86, 'content-box (the browser default)', { font: 'sans', size: 11.5, color: 'text', weight: 600 })}
${rect(380, 96, 250, 26, 'panel', 'border')}${rect(380, 96, 22, 26, 'panel-2', 'border')}${rect(402, 96, 22, 26, 'accent-soft', 'accent')}${rect(424, 96, 182, 26, 'panel', 'accent')}${rect(606, 96, 24, 26, 'accent-soft', 'accent')}
${txt(640, 114, '= 244px', { color: 'danger', size: 12, weight: 700 })}
${txt(380, 142, 'width sets the content only; padding and border are added outside it', { font: 'sans', size: 11 })}
${txt(380, 188, 'border-box  (Tailwind preflight: box-border on everything)', { font: 'sans', size: 11.5, color: 'text', weight: 600 })}
${rect(380, 198, 250, 26, 'accent-soft', 'accent')}${txt(505, 216, 'content + padding + border', { anchor: 'middle', color: 'text', font: 'sans', size: 11 })}
${txt(640, 216, '= 200px', { color: 'accent', size: 12, weight: 700 })}
${txt(380, 244, 'width includes padding and border, so layouts add up the way you expect', { font: 'sans', size: 11 })}
`, 'CSS box model and the difference between content-box and border-box');

D.twFlex = wrap('0 0 900 250', `
<defs>${M('tf1', 'accent', 'accent')}${M('tf2', 'gold', 'gold')}</defs>
${rect(20, 30, 420, 130, 'panel-2', 'border')}
${box(40, 60, 90, 70, 'A', '', 'a')}${box(160, 60, 90, 70, 'B', '', 'a')}${box(280, 60, 90, 70, 'C', '', 'a')}
${arrow('M30 18 L430 18', 'tf1', 'accent')}${txt(230, 12, 'main axis: justify-*  (flex-row)', { anchor: 'middle', color: 'accent', size: 10 })}
${arrow('M452 34 L452 156', 'tf2', 'gold')}${txt(462, 96, 'cross axis', { color: 'gold', size: 10 })}${txt(462, 110, 'items-*', { color: 'gold', size: 10 })}
${rect(560, 30, 330, 130, 'panel-2', 'border')}
${box(600, 42, 250, 26, 'A', '', 'a')}${box(600, 76, 250, 26, 'B', '', 'a')}${box(600, 110, 250, 26, 'C', '', 'a')}
${txt(725, 152, 'flex-col swaps the axes: justify-* is now vertical', { anchor: 'middle', color: 'muted', size: 10 })}
${txt(20, 194, 'justify-start / center / between / around / evenly   → distribute along the main axis', { font: 'sans', size: 11, color: 'text' })}
${txt(20, 214, 'items-start / center / end / stretch / baseline   → align across the cross axis', { font: 'sans', size: 11, color: 'text' })}
${txt(20, 234, 'gap-*, flex-wrap, grow / shrink / basis (flex-1, grow, shrink-0) control spacing and sizing', { font: 'sans', size: 11 })}
`, 'Flexbox main axis and cross axis mapped to Tailwind utilities');

D.twBreak = wrap('0 0 900 250', `
<defs>${M('tk1', 'accent', 'accent')}</defs>
${line(30, 70, 870, 70, 'border')}
${[[30, 'base', '0'], [200, 'sm', '640px'], [350, 'md', '768px'], [510, 'lg', '1024px'], [670, 'xl', '1280px'], [810, '2xl', '1536px']].map(([x, n, px]) =>
  `<circle cx="${x}" cy="70" r="6" fill="var(--accent)"/>` + txt(x, 50, n, { anchor: 'middle', color: 'text', size: 12, weight: 700 }) + txt(x, 92, px, { anchor: 'middle', color: 'muted', size: 10 })).join('')}
${[[30, 200, 'p-2'], [200, 350, 'sm:p-4'], [350, 510, 'md:p-6'], [510, 670, 'lg:p-8']].map(([a, , t], i) =>
  rect(a + 6, 110 + i * 24, 850 - a - 6, 18, 'accent-soft', 'accent', { rx: 5 }) + txt(a + 14, 123 + i * 24, t + ' applies from here and up', { color: 'text', size: 9.5 })).join('')}
${txt(20, 224, 'Mobile-first: unprefixed utilities are the smallest screen; each prefix (sm:, md:, ...) applies at that width AND ABOVE.', { font: 'sans', size: 11, color: 'text' })}
${txt(20, 242, 'Use max-md: to target only below a breakpoint, and md:max-lg: for a range.', { font: 'sans', size: 11 })}
`, 'Tailwind mobile-first breakpoints, each prefix applying from its width upward');

D.twPipeline = wrap('0 0 900 210', `
<defs>${M('tp1', 'muted')}</defs>
${box(10, 40, 170, 66, 'Your source files', 'JSX, HTML, MDX, ...', 'n')}
${box(210, 40, 170, 66, 'Scan for class names', 'plain text, no parsing', 'a')}
${box(410, 40, 210, 66, 'Tailwind compiler', 'reads @import + @theme', 'g')}
${box(650, 40, 240, 66, 'Output CSS', 'only the utilities you used', 'a')}
${arrow('M182 73 L206 73', 'tp1')}${arrow('M382 73 L406 73', 'tp1')}${arrow('M622 73 L646 73', 'tp1')}
${txt(10, 140, 'Because it scans for whole strings, "bg-red-500" is found but `bg-${color}-500` is not: the class is never written out.', { font: 'sans', size: 11, color: 'text' })}
${txt(10, 160, 'Map props to complete class names (a lookup object), or force classes with @source inline("...").', { font: 'sans', size: 11 })}
${txt(10, 188, 'CSS size grows with the number of distinct utilities used, not with the size of the app.', { font: 'sans', size: 11 })}
`, 'How Tailwind turns source files into a small CSS file');

// ================================================================ JavaScript
D.jsProto = wrap('0 0 900 230', `
<defs>${M('jp1', 'accent', 'accent')}</defs>
${box(10, 20, 170, 56, 'rex', 'instance: { name: "Rex" }', 'a')}
${box(240, 20, 200, 56, 'Dog.prototype', 'bark()', 'g')}
${box(500, 20, 190, 56, 'Animal.prototype', 'eat()', 'g')}
${box(750, 20, 140, 56, 'Object.prototype', 'toString() ...', 'n')}
${arrow('M182 48 L236 48', 'jp1', 'accent')}${arrow('M442 48 L496 48', 'jp1', 'accent')}${arrow('M692 48 L746 48', 'jp1', 'accent')}
${txt(210, 40, '[[Prototype]]', { anchor: 'middle', color: 'accent', size: 8.5 })}${txt(468, 40, '[[Prototype]]', { anchor: 'middle', color: 'accent', size: 8.5 })}${txt(719, 40, '[[Prototype]]', { anchor: 'middle', color: 'accent', size: 8.5 })}
${txt(820, 104, '→ null', { anchor: 'middle', color: 'muted', size: 11 })}
${txt(10, 130, 'rex.eat()  →  not on rex  →  not on Dog.prototype  →  found on Animal.prototype  →  called with this = rex', { color: 'text', size: 10.5 })}
${txt(10, 156, 'Property reads walk the chain until found or null. Writes always land on the object itself (own property), shadowing the chain.', { font: 'sans', size: 11 })}
${txt(10, 178, 'class Dog extends Animal is syntax over this same mechanism: Dog.prototype.__proto__ === Animal.prototype.', { font: 'sans', size: 11 })}
${txt(10, 204, 'Object.getPrototypeOf(rex) reads it; Object.create(proto) sets it; avoid mutating __proto__ on hot objects.', { font: 'sans', size: 11 })}
`, 'The JavaScript prototype chain');

D.jsEvents = wrap('0 0 900 270', `
<defs>${M('je1', 'accent', 'accent')}${M('je2', 'gold', 'gold')}</defs>
${rect(20, 10, 420, 250, 'panel-2', 'border')}${txt(32, 28, 'document / html / body', { size: 9.5 })}
${rect(48, 40, 364, 200, 'panel', 'border')}${txt(60, 58, '<ul id="list">  (one listener here)', { color: 'accent', size: 9.5, weight: 700 })}
${rect(76, 72, 308, 150, 'panel-2', 'border')}${txt(88, 90, '<li data-id="7">', { size: 9.5 })}
${rect(104, 102, 252, 104, 'panel', 'border')}${txt(116, 120, '<button> ← the click target', { color: 'gold', size: 9.5, weight: 700 })}
${arrow('M470 30 L470 226', 'je1', 'accent')}${txt(482, 96, '1  capture', { color: 'accent', size: 10.5, weight: 700 })}${txt(482, 112, 'window → … → parent', { color: 'muted', size: 9.5 })}
${box(560, 122, 130, 40, '2  target', '', 'g')}
${arrow('M800 226 L800 30', 'je2', 'gold')}${txt(710, 96, '3  bubble', { color: 'gold', size: 10.5, weight: 700 })}${txt(710, 112, 'parent → … → window', { color: 'muted', size: 9.5 })}
${txt(490, 200, 'Listeners run on the bubble phase by default;', { font: 'sans', size: 11 })}
${txt(490, 216, 'pass { capture: true } to run on the way down.', { font: 'sans', size: 11 })}
${txt(490, 244, 'Delegation: one listener on the parent, then check event.target.closest(...)', { font: 'sans', size: 11, color: 'text' })}
`, 'Event capture, target and bubbling phases, and event delegation');

// ================================================================ React
D.reactLayout = wrap('0 0 900 200', `
<defs>${M('rl1', 'muted')}${M('rl2', 'accent', 'accent')}</defs>
${box(10, 40, 130, 60, 'Render', 'component runs (pure)', 'n')}
${box(170, 40, 130, 60, 'Commit', 'DOM is updated', 'a')}
${box(330, 40, 190, 60, 'useLayoutEffect', 'runs synchronously', 'g')}
${box(550, 40, 130, 60, 'Browser paints', 'user sees pixels', 'a')}
${box(710, 40, 180, 60, 'useEffect', 'runs after paint', 'n')}
${arrow('M142 70 L166 70', 'rl1')}${arrow('M302 70 L326 70', 'rl1')}${arrow('M522 70 L546 70', 'rl1')}${arrow('M682 70 L706 70', 'rl1')}
${txt(425, 122, 'blocks painting', { anchor: 'middle', color: 'gold', size: 10 })}
${txt(800, 122, 'does not block painting', { anchor: 'middle', color: 'muted', size: 10 })}
${txt(10, 158, 'Measure and re-position in useLayoutEffect to avoid a visible flicker (tooltips, popovers). Everything else belongs in useEffect.', { font: 'sans', size: 11, color: 'text' })}
${txt(10, 178, 'Neither runs on the server, and useLayoutEffect on the server logs a warning in older React versions.', { font: 'sans', size: 11 })}
`, 'React commit order: render, commit, useLayoutEffect, paint, useEffect');

D.reactHydrate = wrap('0 0 900 190', `
<defs>${M('rh1', 'muted')}${M('rh2', 'danger', 'danger')}</defs>
${box(10, 36, 160, 60, 'Server HTML', 'rendered on the server', 'a')}
${box(200, 36, 150, 60, 'Browser shows it', 'fast first paint', 'n')}
${box(380, 36, 150, 60, 'JS bundle loads', 'React starts', 'n')}
${box(560, 36, 170, 60, 'hydrateRoot', 'attaches events to the DOM', 'g')}
${box(760, 36, 130, 60, 'Interactive', '', 'a')}
${arrow('M172 66 L196 66', 'rh1')}${arrow('M352 66 L376 66', 'rh1')}${arrow('M532 66 L556 66', 'rh1')}${arrow('M732 66 L756 66', 'rh1')}
${txt(645, 120, 'client render must match the server HTML', { anchor: 'middle', color: 'gold', size: 10 })}
${txt(10, 150, 'Mismatch causes: Date.now() / Math.random(), typeof window checks, locale or time-zone formatting, browser extensions, invalid HTML nesting.', { font: 'sans', size: 11 })}
${txt(10, 170, 'Fix: compute the value once and pass it down, render client-only bits after mount (useEffect / useSyncExternalStore), or suppressHydrationWarning for a single text node.', { font: 'sans', size: 11 })}
`, 'React hydration and what causes a mismatch');

// ================================================================ Node
D.nodeThreads = wrap('0 0 900 250', `
<defs>${M('nt1', 'muted')}</defs>
${rect(10, 10, 280, 190, 'panel-2', 'border')}${txt(24, 30, 'cluster (processes)', { color: 'accent', size: 10.5, weight: 700 })}
${box(28, 44, 110, 44, 'primary', '', 'g')}${box(158, 44, 116, 44, 'worker 1', 'own V8 + memory', 'a')}${box(158, 100, 116, 44, 'worker 2', 'own V8 + memory', 'a')}${box(158, 152, 116, 40, 'worker N', '', 'a')}
${arrow('M140 60 L154 60', 'nt1')}${arrow('M84 90 L154 118', 'nt1')}
${txt(24, 118, 'one port, many', { size: 9.5 })}${txt(24, 132, 'processes for more', { size: 9.5 })}${txt(24, 146, 'HTTP throughput', { size: 9.5 })}
${rect(310, 10, 280, 190, 'panel-2', 'border')}${txt(324, 30, 'worker_threads', { color: 'accent', size: 10.5, weight: 700 })}
${box(328, 44, 244, 40, 'main thread + event loop', '', 'g')}${box(328, 100, 112, 50, 'worker', 'own event loop', 'a')}${box(460, 100, 112, 50, 'worker', 'own event loop', 'a')}
${rect(328, 160, 244, 30, 'accent-soft', 'accent')}${txt(450, 179, 'SharedArrayBuffer / postMessage', { anchor: 'middle', color: 'text', size: 9.5 })}
${rect(610, 10, 280, 190, 'panel-2', 'border')}${txt(624, 30, 'child_process', { color: 'accent', size: 10.5, weight: 700 })}
${box(628, 44, 244, 40, 'your Node process', '', 'g')}${box(628, 100, 244, 44, 'spawn / exec / fork', 'a separate program (ffmpeg, python, node)', 'a')}
${txt(628, 166, 'stdin / stdout pipes or IPC channel', { size: 9.5 })}${txt(628, 182, 'isolation and any language', { size: 9.5 })}
${txt(10, 226, 'cluster scales I/O across cores · worker_threads offloads CPU-bound JS · child_process runs other programs', { font: 'sans', size: 11.5, color: 'text' })}
`, 'cluster vs worker_threads vs child_process');

// ================================================================ Web platform
D.webCors = wrap('0 0 900 300', `
<defs>${M('wc1', 'accent', 'accent')}${M('wc2', 'gold', 'gold')}</defs>
${rect(10, 10, 220, 34, 'accent-soft', 'accent')}${txt(120, 32, 'Browser  (app.example.com)', { anchor: 'middle', color: 'text', font: 'sans', size: 11.5, weight: 600 })}
${rect(670, 10, 220, 34, 'gold-soft', 'gold')}${txt(780, 32, 'API  (api.example.com)', { anchor: 'middle', color: 'text', font: 'sans', size: 11.5, weight: 600 })}
${line(120, 44, 120, 290, 'border', true)}${line(780, 44, 780, 290, 'border', true)}
${arrow('M124 78 L774 78', 'wc1', 'accent')}${txt(450, 70, 'OPTIONS /orders  Origin: app.example.com', { anchor: 'middle', color: 'accent', size: 10 })}${txt(450, 92, 'Access-Control-Request-Method: PUT  ·  -Headers: authorization', { anchor: 'middle', color: 'muted', size: 9.5 })}
${arrow('M776 128 L126 128', 'wc2', 'gold')}${txt(450, 120, '204  Access-Control-Allow-Origin: https://app.example.com', { anchor: 'middle', color: 'gold', size: 10 })}${txt(450, 142, 'Allow-Methods: PUT  ·  Allow-Headers: authorization  ·  Max-Age: 600', { anchor: 'middle', color: 'muted', size: 9.5 })}
${arrow('M124 190 L774 190', 'wc1', 'accent')}${txt(450, 182, 'PUT /orders  (the real request, now allowed)', { anchor: 'middle', color: 'accent', size: 10 })}
${arrow('M776 240 L126 240', 'wc2', 'gold')}${txt(450, 232, '200  Access-Control-Allow-Origin: https://app.example.com', { anchor: 'middle', color: 'gold', size: 10 })}
${txt(450, 276, 'Preflight is skipped for "simple" requests (GET/HEAD/POST with basic headers). CORS is enforced by the browser, not the server.', { anchor: 'middle', font: 'sans', size: 11, color: 'text' })}
`, 'CORS preflight request sequence');

D.webHttp = wrap('0 0 900 250', `
${[['HTTP/1.1', ['Requests', 'TCP', 'TLS'], 'One request at a time per connection; browsers open ~6 connections per host. Head-of-line blocking at the request level.', 'n'],
   ['HTTP/2', ['Multiplexed streams', 'TCP', 'TLS'], 'Many requests share one connection (binary frames, header compression). One lost TCP packet still stalls every stream.', 'a'],
   ['HTTP/3', ['Multiplexed streams', 'QUIC over UDP', 'TLS 1.3 built in'], 'Streams are independent: loss on one does not block the others. Faster connection setup and better on mobile networks.', 'g']]
  .map((c, i) => {
    const x = 10 + i * 300;
    return rect(x, 10, 280, 230, 'panel-2', 'border') + txt(x + 140, 34, c[0], { anchor: 'middle', color: 'text', font: 'sans', size: 14, weight: 700 }) +
      c[1].map((l, j) => box(x + 20, 50 + j * 40, 240, 32, l, '', j === 0 ? c[3] : 'n')).join('') +
      c[2].match(/.{1,46}(\s|$)/g).map((t, k) => txt(x + 20, 182 + k * 14, t.trim(), { font: 'sans', size: 10.5 })).join('');
  }).join('')}
`, 'HTTP/1.1 vs HTTP/2 vs HTTP/3 protocol stacks');

D.webSw = wrap('0 0 900 250', `
<defs>${M('ws1', 'muted')}${M('ws2', 'accent', 'accent')}</defs>
${box(10, 30, 130, 52, 'register()', 'from your page', 'n')}
${box(170, 30, 130, 52, 'install', 'precache app shell', 'a')}
${box(330, 30, 130, 52, 'waiting', 'until old tabs close', 'n')}
${box(490, 30, 130, 52, 'activate', 'clean old caches', 'a')}
${box(650, 30, 240, 52, 'controls pages', 'intercepts every fetch in scope', 'g')}
${arrow('M142 56 L166 56', 'ws1')}${arrow('M302 56 L326 56', 'ws1')}${arrow('M462 56 L486 56', 'ws1')}${arrow('M622 56 L646 56', 'ws1')}
${txt(10, 118, 'FETCH STRATEGIES (inside the fetch event)', { color: 'accent', size: 9.5 })}
${box(10, 130, 280, 44, 'Cache first', 'static assets, fonts, versioned files', 'a')}
${box(310, 130, 280, 44, 'Network first', 'HTML and API data, fall back to cache', 'g')}
${box(610, 130, 280, 44, 'Stale-while-revalidate', 'fast now, refreshed in the background', 'a')}
${txt(10, 206, 'HTTPS only (localhost is allowed). Scope defaults to the folder the script lives in. Bump the cache name on each release so old files are dropped.', { font: 'sans', size: 11, color: 'text' })}
${txt(10, 226, 'Updates: the browser re-fetches the worker script; the new version waits until you skipWaiting() or all tabs close.', { font: 'sans', size: 11 })}
`, 'Service worker lifecycle and caching strategies');

D.webUrl = wrap('0 0 900 250', `
<defs>${M('wu1', 'muted')}</defs>
${[['DNS', 'name → IP (cached)'], ['Connect', 'TCP/QUIC + TLS'], ['Request', 'GET / HTTP'], ['Server / CDN', 'cache or origin'], ['Response', 'HTML, headers']].map((b, i) =>
  box(10 + i * 178, 20, 158, 54, b[0], b[1], i % 2 ? 'n' : 'a') + (i < 4 ? arrow(`M${170 + i * 178} 47 L${186 + i * 178} 47`, 'wu1') : '')).join('')}
${[['Parse HTML', 'build the DOM'], ['CSSOM', 'from CSS files'], ['Render tree', 'DOM + styles'], ['Layout', 'sizes and positions'], ['Paint + composite', 'pixels on screen']].map((b, i) =>
  box(10 + i * 178, 120, 158, 54, b[0], b[1], i % 2 ? 'n' : 'g') + (i < 4 ? arrow(`M${170 + i * 178} 147 L${186 + i * 178} 147`, 'wu1') : '')).join('')}
${arrow('M801 76 L801 98 L89 98 L89 116', 'wu1', 'muted', true)}
${txt(10, 208, 'CSS blocks rendering; synchronous JS blocks HTML parsing (use defer / async). Images and fonts load in parallel and can shift layout.', { font: 'sans', size: 11, color: 'text' })}
${txt(10, 228, 'Core Web Vitals hook in here: LCP (largest paint), INP (input latency), CLS (layout shift).', { font: 'sans', size: 11 })}
`, 'What happens between typing a URL and seeing a page');


// ================================================================ System design extras
D.hashRing = (() => {
  const cx = 170, cy = 120, r = 84;
  const pt = (deg) => [Math.round(cx + r * Math.cos((deg - 90) * Math.PI / 180)), Math.round(cy + r * Math.sin((deg - 90) * Math.PI / 180))];
  const nodes = [['A', 20, 'a'], ['B', 140, 'g'], ['C', 250, 'a']];
  const keys = [['k1', 60], ['k2', 100], ['k3', 190], ['k4', 300]];
  const dot = (x, y, l, fill, stroke) => '<circle cx="' + x + '" cy="' + y + '" r="13" fill="var(--' + fill + ')" stroke="var(--' + stroke + ')" stroke-width="1.6"/>' + txt(x, y + 4, l, { anchor: 'middle', color: 'text', size: 11, weight: 700 });
  const kd = (x, y, l) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="var(--muted)"/>' + txt(x + (x > cx ? 9 : -9), y + 4, l, { anchor: x > cx ? 'start' : 'end', size: 9.5 });
  return wrap('0 0 900 250', '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--border)" stroke-width="3"/>' +
    keys.map(([l, d]) => kd(...pt(d), l)).join('') + nodes.map(([l, d, st]) => dot(...pt(d), l, st === 'a' ? 'accent-soft' : 'gold-soft', st === 'a' ? 'accent' : 'gold')).join('') +
    txt(320, 40, 'Hash nodes and keys onto the same ring.', { font: 'sans', size: 12, color: 'text', weight: 600 }) +
    txt(320, 64, 'A key belongs to the first node clockwise from it: k1, k2 → B, k3 → C, k4 → A.', { font: 'sans', size: 11 }) +
    txt(320, 96, 'Add a node: it takes over only the keys between it and its predecessor (about 1/N of all keys).', { font: 'sans', size: 11 }) +
    txt(320, 116, 'Remove a node: only its keys move to the next node clockwise.', { font: 'sans', size: 11 }) +
    txt(320, 148, 'With hash(key) % N, changing N remaps almost every key: a cache stampede.', { font: 'sans', size: 11, color: 'danger' }) +
    txt(320, 180, 'Virtual nodes: each server appears at many ring positions, which evens out load and', { font: 'sans', size: 11 }) +
    txt(320, 198, 'lets bigger machines take proportionally more keys.', { font: 'sans', size: 11 }), 'Consistent hashing ring with nodes and keys');
})();

// ================================================================ OAuth 2.1 authorization code + PKCE
D.oauthPkce = wrap('0 0 900 380', `
<defs>${M('op1', 'accent', 'accent')}${M('op2', 'gold', 'gold')}</defs>
${[[90, 'Browser / app', 'a'], [330, 'Your backend (client)', 'a'], [580, 'Authorization server', 'g'], [800, 'API', 'n']].map(([x, l, st]) => box(x - 80, 8, 160, 34, l, '', st) + line(x, 42, x, 330, 'border', true)).join('')}
${arrow('M92 70 L326 70', 'op1', 'accent')}${txt(210, 64, '1  "Log in"', { anchor: 'middle', color: 'accent', size: 9.5 })}
${txt(340, 92, '2  make code_verifier (random), code_challenge = SHA-256(verifier)', { size: 9.5, color: 'text' })}
${arrow('M328 112 L94 112', 'op2', 'gold')}${txt(210, 106, '3  302 to /authorize', { anchor: 'middle', color: 'gold', size: 9.5 })}
${arrow('M92 142 L576 142', 'op1', 'accent')}${txt(334, 136, '4  /authorize?code_challenge=...&code_challenge_method=S256&state=...', { anchor: 'middle', color: 'accent', size: 9.5 })}
${txt(590, 166, '5  user signs in + consents', { size: 9.5, color: 'text' })}
${arrow('M578 190 L94 190', 'op2', 'gold')}${txt(334, 184, '6  302 to redirect_uri?code=...&state=...', { anchor: 'middle', color: 'gold', size: 9.5 })}
${arrow('M92 220 L326 220', 'op1', 'accent')}${txt(210, 214, '7  code + state', { anchor: 'middle', color: 'accent', size: 9.5 })}
${arrow('M332 250 L576 250', 'op1', 'accent')}${txt(454, 244, '8  POST /token  code + code_verifier', { anchor: 'middle', color: 'accent', size: 9.5 })}
${arrow('M578 280 L334 280', 'op2', 'gold')}${txt(456, 274, '9  access token (+ ID token, refresh)', { anchor: 'middle', color: 'gold', size: 9.5 })}
${arrow('M332 312 L796 312', 'op1', 'accent')}${txt(564, 306, '10  API call: Authorization: Bearer <access token>', { anchor: 'middle', color: 'accent', size: 9.5 })}
${txt(10, 352, 'Tokens are issued only if SHA-256(code_verifier) matches the challenge from step 4, so a stolen code is useless on its own.', { font: 'sans', size: 10.5, color: 'text' })}
${txt(10, 370, 'state protects the redirect against CSRF; with OpenID Connect the ID token (and nonce) says who the user is.', { font: 'sans', size: 10.5 })}
`, 'OAuth 2.1 authorization code flow with PKCE');

// ================================================================ Full reference architecture (browser to broker, AWS)
D.fullStack = (() => {
  const note = (y, k, kc, t) => txt(24, y, k, { color: kc, size: 10, weight: 700 }) + txt(124, y, t, { font: 'sans', size: 10.5 });
  const chain = (x, ys, w, h) => ys.slice(0, -1).map((y, i) => arrow(`M${x + w / 2} ${y + h} L${x + w / 2} ${ys[i + 1] - 2}`, 'fs1')).join('');
  const sub = (x, title) => rect(x, 660, 284, 252, 'panel-2', 'border') + txt(x + 14, 680, title, { color: 'accent', size: 9.5, weight: 700 });
  const sec = ['Edge: WAF, TLS 1.2+, Shield DDoS protection', 'IAM: least privilege, one role per service', 'Secrets Manager + KMS, never keys in code', 'Network: private subnets, SGs, VPC endpoints', 'CI gates: SAST, dependency + secret scanning', 'Validate every input at the trust boundary', 'CloudTrail audit log: who changed what', 'Threat-model each new service up front'];
  const hop = [[14, 'Client', 'web · mobile'], [114, 'Route 53', 'DNS · failover'], [214, 'CloudFront', 'CDN · WAF'], [314, 'API Gateway', 'authn · limits'], [414, 'ALB', 'L7 · health'], [514, 'BFF', 'Node/TS · SSE']];
  const stacks = [[36, 'Orders service'], [74, 'Members service'], [112, 'Payments service'], [150, 'Notifications svc']];
  return wrap('0 0 900 1034', `
<defs>${M('fs1', 'muted')}${M('fs2', 'accent')}${M('fs3', 'gold')}</defs>

${rect(10, 8, 880, 346, 'panel-2', 'border')}
${txt(24, 28, '1  SYNCHRONOUS REQUEST PATH  (north-south: user to data)', { color: 'accent', size: 9.5 })}
${hop.map(([x, t, s], i) => box(x, 44, 84, 58, t, s, i === 5 ? 'g' : 'a') + (i < 5 ? arrow(`M${x + 86} 73 L${x + 97} 73`, 'fs2', 'accent') : '')).join('')}
${box(212, 118, 88, 44, 'S3', 'static', 'n')}${arrow('M256 104 L256 116', 'fs1')}
${box(310, 118, 92, 44, 'Auth (IdP)', 'Cognito · JWKS', 'g')}${arrow('M356 104 L356 116', 'fs3', 'gold', true)}
${box(420, 118, 72, 44, 'Autoscale', 'by load', 'n')}${arrow('M456 104 L456 116', 'fs1', 'muted', true)}
${box(520, 118, 72, 44, 'Config', 'flags · keys', 'n')}${arrow('M556 104 L556 116', 'fs1', 'muted', true)}
${arrow('M56 104 L56 190 L356 190 L356 164', 'fs3', 'gold', true)}${txt(70, 184, 'OAuth 2.1 + PKCE sign-in', { color: 'gold', size: 9 })}
${stacks.map(([y, t]) => box(628, y, 124, 30, t, '', 'g')).join('')}
${txt(690, 196, 'ECS Fargate / Lambda', { anchor: 'middle', size: 9 })}${txt(690, 208, 'service discovery: Cloud Map', { anchor: 'middle', size: 9 })}
${[51, 89, 127, 165].map((d) => arrow(`M600 ${[66, 70, 76, 80][[51, 89, 127, 165].indexOf(d)]} L624 ${d}`, 'fs1')).join('')}
${box(772, 36, 108, 44, 'Redis', 'ElastiCache', 'a')}${box(772, 92, 108, 46, 'Postgres', 'via RDS Proxy', 'n')}${box(772, 150, 108, 40, 'Read replica', '', 'n')}
${arrow('M754 51 L768 56', 'fs1')}${arrow('M754 87 L768 66', 'fs1')}${arrow('M754 93 L768 108', 'fs1')}${arrow('M754 127 L768 120', 'fs1')}${arrow('M754 160 L768 170', 'fs1')}${arrow('M826 140 L826 148', 'fs1', 'muted', true)}
${note(226, 'BFF', 'gold', 'one tailored API per client (web, mobile): fans out to services, aggregates, trims payloads, and owns the SSE connection')}
${note(243, 'Gateway', 'accent', 'the single front door: JWT check, scopes, rate limits, request validation, routing, CORS. No business logic lives here')}
${note(260, 'Load balancer', 'accent', 'ALB spreads requests over healthy tasks in every AZ (L7 routing, health checks); NLB for raw TCP; Cloud Map or DNS finds services')}
${note(277, 'AuthN / AuthZ', 'gold', 'OIDC + PKCE gives a short-lived JWT. The gateway authenticates; every service still authorizes (zero trust, IAM or mTLS between them)')}
${note(294, 'Redis', 'accent', 'cache-aside with TTLs and tag invalidation; also holds sessions, rate-limit counters and pub/sub for SSE')}
${note(311, 'Stampede', 'danger', 'a hot key expires and thousands of requests hit the DB at once. Fix: single-flight lock (SET NX), TTL jitter, stale-while-revalidate')}
${note(328, 'Database', 'muted', 'each service owns its schema; pooled connections (RDS Proxy / pgBouncer) so Lambda cannot exhaust them; reads go to replicas')}
${note(345, 'Resilience', 'gold', 'every service call has a timeout, retry with backoff + jitter, a circuit breaker, a bulkhead and a fallback (see the patterns cards)')}

<g transform="translate(0,40)">
${rect(10, 326, 880, 326, 'panel-2', 'border')}
${txt(24, 346, '2  ASYNCHRONOUS / EVENT-DRIVEN PATH  (east-west: service to service)', { color: 'accent', size: 9.5 })}
${box(24, 368, 124, 58, 'Orders service', 'row + outbox, 1 tx', 'g')}
${box(176, 368, 124, 58, 'Outbox relay', 'poller / CDC', 'a')}
${arrow('M150 397 L172 397', 'fs3', 'gold')}${arrow('M302 397 L330 397', 'fs3', 'gold')}
${rect(334, 356, 196, 160, 'panel', 'border', { dash: true })}${txt(344, 371, 'EVENT BACKBONE', { color: 'accent', size: 9, weight: 700 })}
${box(344, 378, 176, 36, 'SNS → SQS + DLQ', 'fan-out · EventBridge', 'a')}${box(344, 420, 176, 36, 'RabbitMQ', 'exchange → queues', 'g')}${box(344, 462, 176, 36, 'Kafka', 'partitions · replay', 'g')}
${box(566, 366, 150, 44, 'Workers', 'Lambda / ECS · idempotent', 'a')}${box(566, 416, 150, 44, 'Integration svc', 'ACL · retry · breaker', 'a')}${box(566, 466, 150, 44, 'Projections', 'search + analytics feeds', 'a')}
${box(742, 366, 138, 44, 'SES', 'transactional email', 'n')}${box(742, 416, 138, 44, 'ERP / partner APIs', 'webhooks · REST', 'n')}${box(742, 466, 138, 44, 'OpenSearch · lake', 'read models', 'n')}
${arrow('M532 388 L562 388', 'fs3', 'gold')}${arrow('M532 438 L562 438', 'fs3', 'gold')}${arrow('M532 488 L562 488', 'fs3', 'gold')}
${arrow('M718 388 L738 388', 'fs3', 'gold')}${arrow('M718 438 L738 438', 'fs3', 'gold')}${arrow('M718 488 L738 488', 'fs3', 'gold')}
${txt(880, 538, 'SERVER-SENT EVENTS (SSE): push the result back to the open page', { anchor: 'end', color: 'accent', size: 9.5 })}
${arrow('M380 518 L380 530 L109 530 L109 546', 'fs3', 'gold')}
${box(24, 550, 170, 54, 'Notification svc', 'consumes events', 'g')}${box(236, 550, 170, 54, 'Redis pub/sub', 'reaches every BFF pod', 'a')}${box(448, 550, 222, 54, 'BFF · SSE endpoint', 'event-stream · heartbeat', 'a')}${box(712, 550, 168, 54, 'Browser EventSource', 'Last-Event-ID resume', 'n')}
${arrow('M196 577 L232 577', 'fs2', 'accent')}${arrow('M408 577 L444 577', 'fs2', 'accent')}${arrow('M672 577 L708 577', 'fs2', 'accent')}
${txt(24, 626, 'Transactional outbox: the DB write and the event cannot disagree. Consumers are idempotent (dedupe key); failures retry with backoff, then go to a DLQ.', { font: 'sans', size: 10.5 })}
${txt(24, 643, 'Saga: a multi-service workflow is a chain of local transactions with compensating actions, driven by events or by Step Functions.', { font: 'sans', size: 10.5 })}
</g>

<g transform="translate(0,62)">
${txt(24, 648, '3  CROSS-CUTTING  (every box above shares these)', { color: 'accent', size: 9.5 })}
${sub(10, 'OBSERVABILITY · OpenTelemetry')}
${box(24, 692, 256, 40, 'OTel SDK in every service', 'trace-id: HTTP → queue → worker', 'a')}${arrow('M152 734 L152 744', 'fs1')}
${box(24, 746, 256, 36, 'OTel Collector (ADOT)', 'batch · sample · route', 'n')}
${arrow('M64 784 L64 792', 'fs1')}${arrow('M152 784 L152 792', 'fs1')}${arrow('M240 784 L240 792', 'fs1')}
${box(24, 794, 80, 34, 'Logs', 'CloudWatch', 'n')}${box(112, 794, 80, 34, 'Metrics', 'Prometheus', 'n')}${box(200, 794, 80, 34, 'Traces', 'X-Ray / Tempo', 'n')}
${txt(24, 850, 'SLOs · alerts · dashboards · error budgets', { font: 'sans', size: 10.5 })}${txt(24, 866, 'Structured JSON logs carry the trace id.', { font: 'sans', size: 10.5 })}
${sub(308, 'DELIVERY · CI/CD + INFRASTRUCTURE AS CODE')}
${[['Git PR → CI pipeline', 'lint · tsc · tests · SAST · npm audit', 'a'], ['Build + scan image → ECR', 'SBOM · immutable tag', 'n'], ['IaC: CloudFormation / CDK', 'stack per env · drift detection', 'g'], ['Deploy: blue/green + canary', 'ECS · Lambda alias · rollback', 'a']].map((r, i) => box(322, 692 + i * 46, 256, 34, r[0], r[1], r[2])).join('')}
${chain(322, [692, 738, 784, 830], 256, 34)}
${txt(322, 886, 'Platform team ships the paved road:', { font: 'sans', size: 10.5 })}${txt(322, 902, 'service template + pipeline + dashboards.', { font: 'sans', size: 10.5 })}
${sub(606, 'SECURITY · SECURE SDLC')}
${sec.map((s, i) => txt(620, 706 + i * 22, '· ' + s, { font: 'sans', size: 10.5, color: 'text' })).join('')}
</g>

${txt(10, 998, 'NORTH-SOUTH', { color: 'accent', size: 9 })}${txt(92, 998, 'client → DNS → CDN → gateway → load balancer → BFF → service → Redis / DB', { font: 'sans', size: 10.5 })}
${txt(10, 1018, 'ASYNC', { color: 'gold', size: 9 })}${txt(54, 1018, 'service → outbox → broker → worker / SES / projections / SSE.   Data stores, multi-AZ and DR are on the next diagram.', { font: 'sans', size: 10.5 })}
`, 'Full reference architecture: DNS, CloudFront, API Gateway, load balancer, BFF, microservices, Redis, database, event backbone, SSE, observability, delivery and security');
})();

// ================================================================ Data platform, topology, disaster recovery, governance
D.platformTopology = (() => {
  const note = (y, k, kc, t) => txt(24, y, k, { color: kc, size: 10, weight: 700 }) + txt(150, y, t, { font: 'sans', size: 10.5 });
  const chip = (x, y, label, kind) => {
    const w = Math.round(label.length * 5.3 + 18), c = { a: ['accent-soft', 'accent'], g: ['gold-soft', 'gold'], n: ['panel', 'border'] }[kind];
    return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="22" rx="11" fill="var(--${c[0]})" stroke="var(--${c[1]})" stroke-width="1.2"/>` + txt(x + 9, y + 15, label, { font: 'sans', size: 10, color: 'text' }) };
  };
  const flow = (x0, y0, maxW, labels, kind) => {
    let cx = x0, cy = y0, lines = 1, svg = '';
    for (const l of labels) {
      let c = chip(cx, cy, l, kind);
      if (cx > x0 && cx + c.w > x0 + maxW) { cx = x0; cy += 26; lines++; c = chip(cx, cy, l, kind); }
      svg += c.svg; cx += c.w + 6;
    }
    return { svg, lines };
  };
  const azs = [['a', 'Postgres primary', 'data subnet · writes', 'a'], ['b', 'Postgres standby', 'sync copy · auto failover', 'n'], ['c', 'Read replica', 'async · read scale-out', 'n']];
  const az = azs.map(([k, db, dbSub, st], i) => {
    const x = 38 + i * 198;
    return rect(x, 402, 190, 196, 'panel', 'border', { dash: true }) + txt(x + 10, 418, 'AVAILABILITY ZONE ' + k, { size: 9, color: 'accent' }) +
      box(x + 10, 428, 170, 40, 'ALB node', 'public subnet', 'a') + box(x + 10, 482, 170, 40, 'ECS tasks · Lambda', 'private subnet', 'g') + box(x + 10, 536, 170, 40, db, dbSub, st) +
      arrow(`M${x + 95} 470 L${x + 95} 480`, 'pt1') + arrow(`M${x + 95} 524 L${x + 95} 534`, 'pt1');
  }).join('');
  const dr = [['Backup + restore', 'cheapest · RTO hours', 'n'], ['Pilot light', 'data live, app off · RTO ~1 h', 'n'], ['Warm standby', 'scaled-down copy · RTO minutes', 'g'], ['Active-active', 'every region serves · RTO ~0', 'a']]
    .map(([t, s, st], i) => box(24 + i * 220, 676, 190, 54, t, s, st) + (i < 3 ? arrow(`M${216 + i * 220} 703 L${242 + i * 220} 703`, 'pt2', 'accent') : '')).join('');
  const rows = [['Platform', 'a', ['feature flags (AppConfig)', 'config + secrets', 'service catalog + ownership', 'paved-road templates', 'API versioning + contracts', 'schema registry', 'contract tests']],
    ['Operations', 'g', ['SLOs + error budgets', 'runbooks + on-call', 'incident reviews', 'capacity planning', 'cost tags + budgets', 'chaos / game days']],
    ['Governance', 'n', ['data retention + PII', 'audit trail', 'compliance (SOC 2, GDPR)', 'DR drills', 'access reviews']]];
  let y = 790, chipsSvg = '';
  for (const [name, st, labels] of rows) {
    const f = flow(168, y + 8, 712, labels, st), h = f.lines * 26 + 12;
    chipsSvg += box(24, y, 126, h, name, '', st === 'n' ? 'n' : st) + f.svg; y += h + 6;
  }
  const total = y + 34;
  return wrap(`0 0 900 ${total}`, `
<defs>${M('pt1', 'muted')}${M('pt2', 'accent')}${M('pt3', 'gold')}</defs>

${rect(10, 8, 880, 330, 'panel-2', 'border')}
${txt(24, 28, 'A  DATA PLATFORM  (one store per access pattern, derived stores fed by change data capture)', { color: 'accent', size: 9.5 })}
${txt(170, 44, 'SOURCE OF TRUTH', { size: 8.5 })}${txt(620, 44, 'DERIVED, REBUILDABLE', { size: 8.5 })}
${box(24, 52, 100, 206, 'Services', 'each owns its data', 'g')}
${[['Postgres / Aurora', 'transactions · joins · constraints', 'a'], ['DynamoDB', 'key lookups at huge scale', 'n'], ['Redis (ElastiCache)', 'hot reads · counters · locks', 'a'], ['S3', 'files · backups · lake storage', 'n']].map(([t, s, st], i) => box(170, 52 + i * 54, 230, 44, t, s, st) + arrow(`M126 ${74 + i * 54} L166 ${74 + i * 54}`, 'pt1')).join('')}
${box(440, 106, 130, 98, 'CDC / stream', 'DMS · Kafka · Kinesis', 'a')}${txt(505, 220, 'change data capture', { anchor: 'middle', size: 9 })}
${arrow('M402 74 L436 122', 'pt3', 'gold')}${arrow('M402 128 L436 150', 'pt3', 'gold')}
${[['OpenSearch', 'full-text · facets · autocomplete'], ['Data lake: S3 + Athena', 'raw events, cheap, schema on read'], ['Warehouse: Redshift', 'BI, reports, big joins']].map(([t, s], i) => box(620, 68 + i * 62, 250, 48, t, s, 'n') + arrow(`M572 ${130 + i * 17} L616 ${92 + i * 62}`, 'pt3', 'gold')).join('')}
${note(284, 'Shard key', 'accent', 'high-cardinality and evenly accessed (tenant or user id); a hot key becomes a hot partition. Resharding is painful, so choose early')}
${note(302, 'Consistency', 'gold', 'strong inside one service, eventual across services; decide per feature (CAP: during a partition, pick availability or consistency)')}
${note(320, 'Backups', 'muted', 'point-in-time recovery plus snapshots with restores tested on a schedule; retention and PII rules defined per store')}

${rect(10, 350, 880, 394, 'panel-2', 'border')}
${txt(24, 370, 'B  WHERE IT RUNS  (several availability zones in one region, a second region for disaster recovery)', { color: 'accent', size: 9.5 })}
${rect(24, 380, 610, 262, 'panel', 'border')}${txt(36, 396, 'REGION A · VPC  (primary)', { size: 9, color: 'text', weight: 700 })}
${az}
${txt(36, 616, 'Auto Scaling spreads tasks across AZs, so losing one AZ costs about a third of capacity, not the service.', { font: 'sans', size: 10.5 })}
${txt(36, 632, 'Standby takes over writes automatically; the ALB drops the failed AZ after health checks.', { font: 'sans', size: 10.5 })}
${rect(650, 380, 230, 262, 'panel', 'border')}${txt(662, 396, 'REGION B · DR  (standby)', { size: 9, color: 'text', weight: 700 })}
${box(664, 408, 212, 40, 'Route 53 failover', 'health check · DNS flip', 'a')}${box(664, 458, 212, 40, 'Cross-region replica', 'async database copy', 'n')}${box(664, 508, 212, 40, 'S3 replication', 'assets + backups', 'n')}${box(664, 558, 212, 40, 'Minimal app tier', 'pilot light / warm standby', 'g')}
${arrow('M636 478 L660 478', 'pt3', 'gold', true)}${txt(648, 472, 'async', { anchor: 'middle', size: 8.5 })}
${txt(664, 618, 'RPO: how much data you can lose', { size: 9 })}${txt(664, 632, 'RTO: how long recovery may take', { size: 9 })}
${txt(24, 664, 'DR STRATEGIES  (cost goes up, recovery time goes down)', { color: 'accent', size: 9.5 })}
${dr}

${txt(24, 768, 'C  PLATFORM, GOVERNANCE AND OPERATIONS  (what keeps it running after launch)', { color: 'accent', size: 9.5 })}
${chipsSvg}
${txt(10, total - 10, 'Read it in layers: A is where data lives, B is where it runs, C is how teams keep it running. It pairs with the request and event diagram above.', { font: 'sans', size: 10.5, color: 'text' })}
`, 'Data platform with change data capture, multi-AZ topology with disaster recovery, and platform and governance practices');
})();
// ================================================================ Layer map: design decision / optimization lever / AWS
D.layerMap = (() => {
  const rows = [
    ['Client', 'browser · app', ['Rendering strategy per route', 'SSG · ISR · SSR · PPR; REST vs GraphQL'], ['Core Web Vitals', 'React Compiler · compositor-only motion'], ['S3 + CloudFront', 'Amplify · AppSync (GraphQL)']],
    ['Network / CDN', 'the edge', ['What sits at the edge', 'CDN + cache-control headers'], ['Cache policy · HTTP/3', 'edge rendering · speculative prefetch'], ['CloudFront, Route 53', 'WAF · Lambda@Edge']],
    ['API / Gateway', 'front door', ['Auth, limits, versioning', 'rate limiting · idempotency keys'], ['Kill N+1, paginate', 'DataLoader · cursor pagination'], ['API Gateway, Cognito', 'Application Load Balancer']],
    ['Services', 'app tier', ['Monolith or microservices', 'BFF · team-shaped boundaries'], ['Keep the event loop free', 'worker-pool offload · autoscale out'], ['ECS Fargate, EKS', 'Lambda for event-driven pieces']],
    ['Data', 'storage', ['SQL or NoSQL, CAP trade-off', 'replication · sharding · partitioning'], ['EXPLAIN ANALYZE, indexes', 'read replicas · batched writes'], ['Aurora, DynamoDB', 'RDS Multi-AZ · Aurora Limitless']],
    ['Caching', 'speed layer', ['Multi-layer waterfall', 'browser → CDN → gateway → Redis → DB'], ['Right layer for the job', 'stampede + cold-start protection'], ['ElastiCache (Redis)', 'CloudFront · DAX for DynamoDB']],
    ['Async / messaging', 'decoupling', ['Queue or pub/sub, saga', 'compensation · transactional outbox'], ['Batch + backpressure', 'scale on queue depth and age'], ['SQS, SNS, EventBridge', 'Step Functions for sagas']],
    ['Deploy / scaling', 'ship + scale', ['Scale out, balance the load', 'canary · blue/green'], ['Autoscaling triggers', 'perf budgets enforced in CI'], ['ECS Auto Scaling, ALB', 'CodeDeploy · CodePipeline']],
    ['Reliability', 'fail safely', ['Degrade, do not collapse', 'timeout, retry, breaker, bulkhead, fallback'], ['Golden signals, tracing', 'load-test a fix before it ships'], ['CloudWatch, X-Ray', 'Route 53 health checks · Multi-AZ']],
  ];
  const y0 = 34, step = 64, h = 56;
  const body = rows.map((r, i) => {
    const y = y0 + i * step, mid = y + h / 2;
    return box(10, y, 130, h, r[0], r[1], 'a') + box(158, y, 250, h, r[2][0], r[2][1], 'n') + box(432, y, 250, h, r[3][0], r[3][1], 'g') + box(706, y, 184, h, r[4][0], r[4][1], 'n') +
      arrow(`M142 ${mid} L154 ${mid}`, 'lm1') + arrow(`M410 ${mid} L428 ${mid}`, 'lm1') + arrow(`M684 ${mid} L702 ${mid}`, 'lm1') +
      (i < rows.length - 1 ? arrow(`M75 ${y + h} L75 ${y + step - 2}`, 'lm2', 'accent') : '');
  }).join('');
  const foot = y0 + rows.length * step + 8;
  return wrap(`0 0 900 ${foot + 44}`, `
<defs>${M('lm1', 'muted')}${M('lm2', 'accent')}</defs>
${txt(10, 20, 'LAYER  (request flows down)', { color: 'accent', size: 9.5 })}${txt(158, 20, 'DESIGN: what you decide', { color: 'muted', size: 9.5 })}${txt(432, 20, 'OPTIMIZE: what you tune once it runs', { color: 'gold', size: 9.5 })}${txt(706, 20, 'AWS: what implements it', { color: 'muted', size: 9.5 })}
${body}
${txt(10, foot + 14, 'Read each row left to right. When the interviewer switches from "design it" to "now make it fast", you are already standing on the next column.', { font: 'sans', size: 10.5, color: 'text' })}
${txt(10, foot + 32, 'The same row answers a third question as well: which managed AWS service would you reach for?', { font: 'sans', size: 10.5 })}
`, 'Layer by layer map of design decisions, optimization levers and AWS services');
})();

// ================================================================ Optimization + resilience patterns per layer, and three mechanisms
D.resilienceMap = (() => {
  const levels = [
    ['Client', 'browser · app',
      ['lazy-load + code split', 'image + font tuning', 'debounce + cancel requests', 'optimistic UI', 'stale-while-revalidate'],
      ['retry with backoff + jitter', 'timeouts', 'offline queue', 'error boundaries', 'degraded UI']],
    ['Edge / CDN', 'the edge',
      ['immutable asset caching', 'stale-while-revalidate', 'HTTP/3', 'edge rendering'],
      ['request collapsing', 'origin shield', 'stale-if-error', 'WAF + DDoS limits']],
    ['Gateway', 'front door',
      ['auth token caching', 'compression', 'batching / DataLoader'],
      ['rate limit (token bucket)', '429 + Retry-After', 'idempotency keys', 'load shedding', 'timeouts']],
    ['Services', 'app tier',
      ['keep the event loop free', 'worker-pool offload', 'keep-alive connections', 'autoscale out'],
      ['circuit breaker', 'bulkhead', 'retry budget', 'fallback', 'health checks']],
    ['Cache', 'Redis · CDN',
      ['right layer per job', 'cache-aside', 'pipelining + batching', 'good key design'],
      ['single-flight lock', 'TTL jitter', 'early refresh', 'serve stale', 'negative caching', 'warm-up (cold-start herd)']],
    ['Database', 'storage',
      ['indexes + EXPLAIN', 'read replicas', 'batched writes', 'connection pooling'],
      ['query timeouts', 'pool limits (RDS Proxy)', 'Multi-AZ failover', 'short transactions']],
    ['Messaging', 'queues · streams',
      ['batch consumers', 'partition by key', 'scale on depth + age'],
      ['DLQ', 'idempotent consumers', 'retry with backoff', 'backpressure', 'visibility timeout']],
    ['Observability', 'all layers',
      ['profile before tuning', 'load-test the fix'],
      ['golden signals', 'SLO burn alerts', 'distributed tracing', 'canary + auto-rollback']],
  ];
  const chip = (x, y, label, kind) => {
    const w = Math.round(label.length * 5.3 + 18), g = kind === 'g';
    return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="22" rx="11" fill="var(--${g ? 'gold-soft' : 'accent-soft'})" stroke="var(--${g ? 'gold' : 'accent'})" stroke-width="1.2"/>` + txt(x + 9, y + 15, label, { font: 'sans', size: 10, color: 'text' }) };
  };
  const flow = (x0, y0, maxW, labels, kind) => {
    let cx = x0, cy = y0, lines = 1, svg = '';
    for (const l of labels) {
      const c = chip(cx, cy, l, kind);
      if (cx > x0 && cx + c.w > x0 + maxW) { cx = x0; cy += 26; lines++; svg += chip(cx, cy, l, kind).svg; cx += c.w + 6; continue; }
      svg += c.svg; cx += c.w + 6;
    }
    return { svg, lines };
  };
  let y = 38, rowsSvg = '';
  for (const [name, sub, fast, safe] of levels) {
    const a = flow(150, y + 8, 372, fast, 'g'), b = flow(532, y + 8, 358, safe, 'a');
    const rh = Math.max(a.lines, b.lines) * 26 + 12;
    rowsSvg += box(10, y, 124, rh, name, sub, 'n') + a.svg + b.svg;
    y += rh + 6;
  }
  const p1End = y + 2;
  const P = p1End + 14;                         // top of the mechanisms panel
  const sw = 284, sh = 236, xs = [10, 308, 606];
  const sp = (x, title) => rect(x, P + 26, sw, sh, 'panel-2', 'border') + txt(x + 14, P + 46, title, { color: 'accent', size: 9.5, weight: 700 });
  // circuit breaker
  const cb = (x, y0) => sp(x, 'CIRCUIT BREAKER') +
    box(x + 14, y0 + 36, 100, 40, 'CLOSED', 'calls flow', 'a') + box(x + 170, y0 + 36, 100, 40, 'OPEN', 'fail fast', 'd') + box(x + 92, y0 + 116, 100, 40, 'HALF-OPEN', 'a few probes', 'g') +
    arrow(`M${x + 116} ${y0 + 56} L${x + 168} ${y0 + 56}`, 'rs1') + txt(x + 142, y0 + 50, 'trip', { anchor: 'middle', size: 9, color: 'danger' }) +
    arrow(`M${x + 214} ${y0 + 78} L${x + 178} ${y0 + 114}`, 'rs1') + txt(x + 168, y0 + 92, 'cool-down', { anchor: 'end', size: 9 }) +
    arrow(`M${x + 94} ${y0 + 130} L${x + 66} ${y0 + 78}`, 'rs2') + txt(x + 14, y0 + 112, 'probes ok', { size: 9, color: 'accent' }) +
    arrow(`M${x + 194} ${y0 + 146} L${x + 248} ${y0 + 146} L${x + 248} ${y0 + 80}`, 'rs1', 'muted', true) + txt(x + 200, y0 + 166, 'probe fails', { size: 9 }) +
    txt(x + 14, y0 + 192, 'Stops hammering a sick dependency so it can', { font: 'sans', size: 10.5 }) + txt(x + 14, y0 + 207, 'recover. Callers get a fallback instead of a wait.', { font: 'sans', size: 10.5 });
  // backoff + jitter
  const bo = (x, y0) => sp(x, 'RETRY: BACKOFF + JITTER') +
    [['try 1', 24, 0.6], ['try 2', 48, 0.35], ['try 3', 96, 0.75], ['try 4', 192, 0.5]].map(([l, w, f], i) => {
      const yy = y0 + 32 + i * 30;
      return txt(x + 14, yy + 15, l, { size: 9 }) +
        `<rect x="${x + 56}" y="${yy}" width="${w}" height="22" rx="4" fill="none" stroke="var(--gold)" stroke-width="1.2" stroke-dasharray="3 3"/>` +
        `<rect x="${x + 56}" y="${yy}" width="${Math.round(w * f)}" height="22" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.2"/>`;
    }).join('') +
    txt(x + 14, y0 + 164, 'dashed = allowed window (doubles), solid = random wait', { size: 8.5 }) +
    txt(x + 14, y0 + 182, 'wait = random(0, min(cap, base × 2^n))', { color: 'text', size: 9.5 }) +
    txt(x + 14, y0 + 202, 'Without jitter every client retries together: a retry', { font: 'sans', size: 10.5 }) + txt(x + 14, y0 + 217, 'storm. Cap tries; retry only idempotent calls.', { font: 'sans', size: 10.5 });
  // stampede
  const st = (x, y0) => sp(x, 'CACHE STAMPEDE') +
    txt(x + 14, y0 + 38, 'BEFORE', { color: 'danger', size: 9, weight: 700 }) +
    box(x + 14, y0 + 46, 84, 36, 'N requests', '', 'n') + box(x + 186, y0 + 46, 84, 36, 'Database', 'melts', 'd') + arrow(`M${x + 100} ${y0 + 64} L${x + 182} ${y0 + 64}`, 'rs1', 'danger') + txt(x + 141, y0 + 58, 'all miss', { anchor: 'middle', size: 9, color: 'danger' }) +
    txt(x + 14, y0 + 106, 'AFTER', { color: 'accent', size: 9, weight: 700 }) +
    box(x + 14, y0 + 114, 64, 36, 'N calls', '', 'n') + box(x + 100, y0 + 114, 92, 36, 'one lock', 'rebuilds', 'a') + box(x + 214, y0 + 114, 56, 36, 'DB', '', 'n') +
    arrow(`M${x + 80} ${y0 + 132} L${x + 98} ${y0 + 132}`, 'rs2', 'accent') + arrow(`M${x + 194} ${y0 + 132} L${x + 212} ${y0 + 132}`, 'rs2', 'accent') +
    txt(x + 14, y0 + 172, 'The rest wait briefly or are served stale data.', { font: 'sans', size: 10.5 }) +
    txt(x + 14, y0 + 192, 'Plus TTL jitter, early refresh, and request', { font: 'sans', size: 10.5 }) + txt(x + 14, y0 + 207, 'collapsing at the CDN. Warm caches after a deploy.', { font: 'sans', size: 10.5 });
  const total = P + 26 + sh + 52;
  return wrap(`0 0 900 ${total}`, `
<defs>${M('rs1', 'muted')}${M('rs2', 'accent')}</defs>
${txt(10, 20, 'LEVEL', { color: 'muted', size: 9.5 })}${txt(150, 20, 'MAKE IT FAST', { color: 'gold', size: 9.5 })}${txt(532, 20, 'SURVIVE FAILURE', { color: 'accent', size: 9.5 })}
${rowsSvg}
${txt(10, P + 14, 'THREE MECHANISMS WORTH BEING ABLE TO DRAW', { color: 'accent', size: 9.5 })}
${cb(xs[0], P + 26)}${bo(xs[1], P + 26)}${st(xs[2], P + 26)}
${txt(10, total - 22, 'Rule of thumb: every retry needs a timeout, every timeout needs a budget, and every breaker needs a fallback.', { font: 'sans', size: 10.5, color: 'text' })}
${txt(10, total - 6, 'Gold chips make the happy path faster; green chips keep the system standing when a dependency is slow or down.', { font: 'sans', size: 10.5 })}
`, 'Optimization and resilience patterns at each layer, with circuit breaker, retry backoff with jitter, and cache stampede mechanisms');
})();

// ================================================================ Mechanism panels: three per diagram, one concept each
// Every panel is drawn relative to its top-left corner (x, y); `m` carries this diagram's arrow markers.
const mech = (prefix, panels, foot, caption) => {
  const m = { mu: prefix + '1', ac: prefix + '2', da: prefix + '3', go: prefix + '4' };
  const body = panels.map((pn, i) => {
    const x = [10, 308, 606][i], y = 10;
    return rect(x, y, 284, 224, 'panel-2', 'border') + txt(x + 14, y + 20, pn.title, { color: 'accent', size: 9.5, weight: 700 }) + pn.draw(x, y, m) +
      pn.lines.map((l, j) => txt(x + 14, y + 186 + j * 15, l, { font: 'sans', size: 10.5 })).join('');
  }).join('');
  return wrap('0 0 900 272', `<defs>${M(m.mu, 'muted')}${M(m.ac, 'accent')}${M(m.da, 'danger')}${M(m.go, 'gold')}</defs>${body}${txt(10, 256, foot, { font: 'sans', size: 10.5, color: 'text' })}`, caption);
};
const cell = (x, y, s, kind) => {
  const c = { a: ['accent-soft', 'accent', 1], d: ['danger', 'danger', 0.22], g: ['gold-soft', 'gold', 1], n: ['panel', 'border', 1] }[kind];
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="3" fill="var(--${c[0]})" fill-opacity="${c[2]}" stroke="var(--${c[1]})" stroke-width="1.2"/>`;
};

// ---- protect the entrance: timeouts, token bucket, load shedding
D.protectEntrance = mech('pe', [
  { title: 'TIMEOUT + DEADLINE', lines: ['Each hop waits less than its caller, so failures', 'surface early. Pass the remaining deadline on.'],
    draw: (x, y) => [['Client', '3 s', 250], ['Gateway', '2.5 s', 210], ['Service', '2 s', 170], ['Database', '1 s', 110]].map(([n, t, w], i) => {
      const yy = y + 36 + i * 34;
      return rect(x + 14, yy, w, 26, 'accent-soft', 'accent', { rx: 5 }) + txt(x + 22, yy + 17, n + '   ' + t, { font: 'sans', size: 10.5, color: 'text' });
    }).join('') + txt(x + 14, y + 180, 'budget shrinks hop by hop', { size: 9 }) },
  { title: 'TOKEN BUCKET RATE LIMIT', lines: ['Allows a burst up to the bucket size, then holds callers', 'to the refill rate. Return 429 with Retry-After.'],
    draw: (x, y, m) => rect(x + 14, y + 40, 90, 92, 'panel', 'border') +
      [0, 1, 2, 3, 4, 5].map((i) => { const cx = x + 36 + (i % 3) * 26, cy = y + 68 + Math.floor(i / 3) * 30; return i < 4 ? `<circle cx="${cx}" cy="${cy}" r="9" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.3"/>` : `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="3 3"/>`; }).join('') +
      txt(x + 14, y + 148, 'refill rate = sustained rate', { size: 9 }) + txt(x + 14, y + 163, 'capacity = allowed burst', { size: 9 }) +
      box(x + 150, y + 40, 120, 40, 'tokens left', 'allow, take 1', 'a') + box(x + 150, y + 92, 120, 40, 'bucket empty', '429 + Retry-After', 'd') +
      arrow(`M${x + 106} ${y + 60} L${x + 146} ${y + 60}`, m.ac, 'accent') + arrow(`M${x + 106} ${y + 112} L${x + 146} ${y + 112}`, m.da, 'danger') },
  { title: 'LOAD SHEDDING BY PRIORITY', lines: ['When the server is at its limit, drop the least valuable', 'work early instead of failing everything slowly.'],
    draw: (x, y, m) => rect(x + 196, y + 36, 74, 116, 'panel', 'border') + txt(x + 233, y + 90, 'server', { anchor: 'middle', font: 'sans', size: 11, color: 'text', weight: 600 }) + txt(x + 233, y + 105, 'at limit', { anchor: 'middle', size: 9, color: 'danger' }) +
      [['checkout', 'keep', 0], ['search', 'keep', 1], ['analytics', 'shed first', 2]].map(([n, t, i]) => {
        const yy = y + 42 + i * 38;
        return box(x + 14, yy, 92, 28, n, '', i === 2 ? 'n' : 'a') + txt(x + 150, yy + 9, t, { anchor: 'middle', size: 9, color: i === 2 ? 'danger' : 'accent' }) +
          (i === 2 ? arrow(`M${x + 108} ${yy + 16} L${x + 160} ${yy + 16}`, m.da, 'danger', true) + txt(x + 172, yy + 22, '✕', { anchor: 'middle', size: 15, color: 'danger', weight: 700 })
                   : arrow(`M${x + 108} ${yy + 16} L${x + 192} ${yy + 16}`, m.ac, 'accent'));
      }).join('') },
], 'Order matters: a timeout on every call, a rate limit at the door, and load shedding for when the system is still too busy.',
'Timeout and deadline propagation, token bucket rate limiting and priority load shedding');

// ---- contain failure and absorb bursts: bulkhead, backpressure, idempotency + DLQ
D.containFailure = mech('cf', [
  { title: 'BULKHEAD', lines: ['Give each dependency its own pool so one slow', 'service cannot use up every thread or connection.'],
    draw: (x, y) => txt(x + 14, y + 42, 'ONE SHARED POOL', { size: 9, color: 'danger' }) +
      Array.from({ length: 10 }, (_, i) => cell(x + 14 + i * 25, y + 48, 18, 'd')).join('') + txt(x + 14, y + 82, 'one slow dependency holds every thread', { font: 'sans', size: 10, color: 'danger' }) +
      txt(x + 14, y + 108, 'SEPARATE POOLS (BULKHEADS)', { size: 9, color: 'accent' }) +
      Array.from({ length: 5 }, (_, i) => cell(x + 14 + i * 25, y + 114, 18, 'a')).join('') + Array.from({ length: 5 }, (_, i) => cell(x + 153 + i * 25, y + 114, 18, 'd')).join('') +
      txt(x + 14, y + 150, 'A keeps working', { font: 'sans', size: 10, color: 'accent' }) + txt(x + 153, y + 150, 'B is contained', { font: 'sans', size: 10, color: 'danger' }) },
  { title: 'BACKPRESSURE', lines: ['Bound the queue and push back on producers instead', 'of buffering until memory or latency gives out.'],
    draw: (x, y, m) => box(x + 14, y + 40, 70, 36, 'Producer', '', 'n') + rect(x + 100, y + 40, 90, 36, 'panel', 'gold') + [0, 1, 2, 3, 4].map((i) => cell(x + 108 + i * 15, y + 52, 12, 'g')).join('') + txt(x + 145, y + 36, 'bounded queue', { anchor: 'middle', size: 9, color: 'gold' }) +
      box(x + 206, y + 40, 64, 36, 'Workers', '', 'a') + arrow(`M${x + 86} ${y + 58} L${x + 98} ${y + 58}`, m.mu) + arrow(`M${x + 192} ${y + 58} L${x + 204} ${y + 58}`, m.mu) +
      arrow(`M${x + 145} ${y + 78} L${x + 145} ${y + 104} L${x + 49} ${y + 104} L${x + 49} ${y + 80}`, m.da, 'danger', true) +
      txt(x + 14, y + 126, 'queue full: reject or slow the producer', { font: 'sans', size: 10, color: 'danger' }) + txt(x + 14, y + 148, 'scale workers on depth + oldest message age', { font: 'sans', size: 10, color: 'gold' }) },
  { title: 'IDEMPOTENCY + DEAD-LETTER QUEUE', lines: ['A dedupe key makes redelivery harmless. Messages that', 'keep failing park in a DLQ: alarm, fix, redrive.'],
    draw: (x, y, m) => box(x + 14, y + 40, 64, 32, 'message', '', 'n') + box(x + 94, y + 40, 72, 32, 'seen id?', '', 'g') + box(x + 184, y + 40, 86, 32, 'process', '', 'a') +
      arrow(`M${x + 80} ${y + 56} L${x + 92} ${y + 56}`, m.mu) + arrow(`M${x + 168} ${y + 56} L${x + 182} ${y + 56}`, m.ac, 'accent') + txt(x + 175, y + 50, 'no', { anchor: 'middle', size: 9 }) +
      arrow(`M${x + 130} ${y + 74} L${x + 130} ${y + 98}`, m.mu) + txt(x + 136, y + 90, 'yes', { size: 9 }) + box(x + 98, y + 100, 64, 30, 'skip', '', 'n') +
      arrow(`M${x + 227} ${y + 74} L${x + 227} ${y + 98}`, m.da, 'danger') + txt(x + 233, y + 90, '3 fails', { size: 9, color: 'danger' }) + box(x + 184, y + 100, 86, 30, 'DLQ', '', 'd') +
      txt(x + 14, y + 150, 'retry with backoff before parking it', { font: 'sans', size: 10 }) },
], 'Isolate the failure (bulkhead), slow producers down (backpressure), and make retries safe (idempotency plus a DLQ).',
'Bulkhead, backpressure, idempotency and dead-letter queue');

// ---- keep traffic off the origin: collapsing + stale-while-revalidate, warm-up, N+1 batching
D.offloadOrigin = mech('oo', [
  { title: 'REQUEST COLLAPSING + STALE-WHILE-REVALIDATE', lines: ['Identical misses share one trip to the origin.', 'Users get the old copy now; it refreshes behind them.'],
    draw: (x, y, m) => box(x + 14, y + 54, 64, 60, 'N users', '', 'n') + box(x + 110, y + 54, 70, 60, 'Edge', 'cache', 'a') + box(x + 206, y + 54, 64, 60, 'Origin', '', 'n') +
      [66, 84, 102].map((d) => arrow(`M${x + 80} ${y + d} L${x + 108} ${y + d}`, m.mu)).join('') + arrow(`M${x + 182} ${y + 78} L${x + 204} ${y + 78}`, m.ac, 'accent') + txt(x + 193, y + 46, '1 fetch', { anchor: 'middle', size: 9, color: 'accent' }) +
      arrow(`M${x + 204} ${y + 100} L${x + 182} ${y + 100}`, m.mu, 'muted', true) +
      txt(x + 14, y + 138, 'collapsing: identical misses share one trip', { font: 'sans', size: 10 }) + txt(x + 14, y + 156, 'SWR: serve the old copy, refresh in background', { font: 'sans', size: 10 }) },
  { title: 'COLD-START HERD + WARM-UP', lines: ['After a deploy or failover the cache is empty. Warm hot', 'keys first and ramp traffic so the database is not flooded.'],
    draw: (x, y, m) => arrow(`M${x + 30} ${y + 140} L${x + 30} ${y + 40}`, m.mu) + line(x + 30, y + 140, x + 266, y + 140, 'muted') + txt(x + 38, y + 44, 'DB load', { size: 9 }) + txt(x + 266, y + 154, 'time', { anchor: 'end', size: 9 }) +
      line(x + 64, y + 52, x + 64, y + 140, 'gold', true) + txt(x + 68, y + 62, 'deploy / failover', { size: 9, color: 'gold' }) +
      `<path d="M${x + 30} ${y + 122} L${x + 64} ${y + 122} L${x + 74} ${y + 70} Q${x + 92} ${y + 112} ${x + 266} ${y + 118}" fill="none" stroke="var(--danger)" stroke-width="2"/>` +
      `<path d="M${x + 64} ${y + 122} Q${x + 130} ${y + 120} ${x + 266} ${y + 126}" fill="none" stroke="var(--accent)" stroke-width="2"/>` +
      txt(x + 112, y + 84, 'cold cache: spike', { size: 9, color: 'danger' }) + txt(x + 150, y + 136, 'warmed + ramped', { size: 9, color: 'accent' }) },
  { title: 'N+1 QUERIES TO BATCHING', lines: ['DataLoader collects the lookups from one tick into a', 'single query. Same idea in ORMs and GraphQL resolvers.'],
    draw: (x, y, m) => box(x + 14, y + 40, 64, 40, 'API', '', 'n') + box(x + 206, y + 40, 64, 40, 'DB', '', 'd') + [0, 1, 2, 3, 4].map((i) => arrow(`M${x + 80} ${y + 44 + i * 8} L${x + 204} ${y + 44 + i * 8}`, m.da, 'danger')).join('') + txt(x + 142, y + 36, '1 + N round trips', { anchor: 'middle', size: 9, color: 'danger' }) +
      box(x + 14, y + 110, 64, 40, 'API', '', 'n') + box(x + 206, y + 110, 64, 40, 'DB', '', 'n') + arrow(`M${x + 80} ${y + 122} L${x + 204} ${y + 122}`, m.ac, 'accent') + arrow(`M${x + 80} ${y + 138} L${x + 204} ${y + 138}`, m.ac, 'accent') + txt(x + 142, y + 106, 'list + one batched IN (...)', { anchor: 'middle', size: 9, color: 'accent' }) },
], 'The cheapest request is the one that never reaches the origin: collapse it, serve it stale, warm the cache, and batch the rest.',
'Request collapsing with stale-while-revalidate, cache warm-up, and N+1 batching');

// ---- protect the database: pooling, replicas, indexes
D.protectDatabase = mech('pd', [
  { title: 'CONNECTION POOLING', lines: ['Lambda and pods open connections faster than', 'Postgres accepts them. A proxy pools and reuses them.'],
    draw: (x, y, m) => [0, 1, 2].map((i) => box(x + 14, y + 44 + i * 34, 58, 26, 'Lambda', '', 'n') + arrow(`M${x + 74} ${y + 57 + i * 34} L${x + 102} ${y + 57 + i * 34}`, m.da, 'danger')).join('') +
      box(x + 104, y + 52, 76, 76, 'RDS Proxy', 'pool', 'a') + box(x + 210, y + 52, 60, 76, 'DB', 'max conns', 'n') + arrow(`M${x + 182} ${y + 80} L${x + 208} ${y + 80}`, m.ac, 'accent') + arrow(`M${x + 182} ${y + 100} L${x + 208} ${y + 100}`, m.ac, 'accent') +
      txt(x + 14, y + 148, 'N short-lived clients', { size: 9, color: 'danger' }) + txt(x + 150, y + 148, 'few, reused', { size: 9, color: 'accent' }) },
  { title: 'READ REPLICAS + LAG', lines: ['Replicas lag by milliseconds to seconds, so pin a user', 'to the primary briefly after their own write.'],
    draw: (x, y, m) => box(x + 14, y + 44, 86, 38, 'Primary', 'writes', 'a') + box(x + 184, y + 44, 86, 38, 'Replica', 'reads', 'n') + arrow(`M${x + 102} ${y + 63} L${x + 182} ${y + 63}`, m.mu, 'muted', true) + txt(x + 142, y + 56, 'async lag', { anchor: 'middle', size: 9 }) +
      box(x + 100, y + 112, 84, 34, 'App', '', 'g') + arrow(`M${x + 114} ${y + 110} L${x + 62} ${y + 86}`, m.ac, 'accent') + txt(x + 30, y + 108, 'writes', { size: 9, color: 'accent' }) +
      arrow(`M${x + 170} ${y + 110} L${x + 222} ${y + 86}`, m.mu) + txt(x + 232, y + 108, 'reads', { size: 9 }) + txt(x + 142, y + 166, 'read-your-own-writes: primary for a few seconds', { anchor: 'middle', size: 9, color: 'gold' }) },
  { title: 'INDEXES: SCAN VS SEEK', lines: ['EXPLAIN ANALYZE shows which one you got. Index the', 'columns you filter and sort by; weigh the write cost.'],
    draw: (x, y) => txt(x + 14, y + 44, 'no index: sequential scan', { font: 'sans', size: 10, color: 'text' }) + Array.from({ length: 10 }, (_, i) => cell(x + 14 + i * 25, y + 52, 18, 'd')).join('') + txt(x + 14, y + 86, 'reads every row', { size: 9, color: 'danger' }) +
      txt(x + 14, y + 112, 'with an index: index scan', { font: 'sans', size: 10, color: 'text' }) + Array.from({ length: 10 }, (_, i) => cell(x + 14 + i * 25, y + 120, 18, i === 6 ? 'a' : 'n')).join('') + txt(x + 14, y + 154, 'jumps straight to the matching row', { size: 9, color: 'accent' }) },
], 'Protect the database: pool the connections, spread the reads, and make every query touch fewer rows.',
'Connection pooling, read replicas with lag, and indexes versus sequential scans');

// ---- the browser: cancel stale requests, optimistic UI, graceful degradation
D.clientSide = mech('cs', [
  { title: 'DEBOUNCE + CANCEL STALE REQUESTS', lines: ['Debounce waits for a pause in typing. AbortController', 'cancels the old requests so a stale result never wins.'],
    draw: (x, y) => [['r', 0, 70], ['re', 30, 70], ['rea', 60, 70], ['reac', 90, 100]].map(([k, off, w], i) => {
      const yy = y + 38 + i * 28, last = i === 3;
      return txt(x + 14, yy + 13, k, { size: 10, color: 'text' }) + `<rect x="${x + 50 + off}" y="${yy}" width="${w}" height="18" rx="4" fill="var(--${last ? 'accent-soft' : 'danger'})" fill-opacity="${last ? 1 : 0.22}" stroke="var(--${last ? 'accent' : 'danger'})" stroke-width="1.2"/>` +
        (last ? txt(x + 50 + off + w + 8, yy + 13, 'render', { size: 9, color: 'accent' }) : txt(x + 50 + off + w + 8, yy + 14, '✕', { size: 13, color: 'danger', weight: 700 }));
    }).join('') + txt(x + 14, y + 160, 'time →', { size: 9 }) },
  { title: 'OPTIMISTIC UI', lines: ['Show the result first and reconcile with the server after.', 'Keep the previous state so a failure can roll back.'],
    draw: (x, y, m) => box(x + 14, y + 44, 60, 34, 'click', '', 'n') + box(x + 92, y + 44, 92, 34, 'UI updates', 'instantly', 'a') + box(x + 202, y + 44, 68, 34, 'Server', '', 'g') +
      arrow(`M${x + 76} ${y + 61} L${x + 90} ${y + 61}`, m.mu) + arrow(`M${x + 186} ${y + 61} L${x + 200} ${y + 61}`, m.mu) +
      arrow(`M${x + 226} ${y + 80} L${x + 186} ${y + 106}`, m.ac, 'accent') + txt(x + 176, y + 92, 'ok', { anchor: 'end', size: 9, color: 'accent' }) + box(x + 128, y + 108, 62, 32, 'keep', '', 'a') +
      arrow(`M${x + 246} ${y + 80} L${x + 246} ${y + 106}`, m.da, 'danger') + txt(x + 252, y + 98, 'fail', { size: 9, color: 'danger' }) + box(x + 214, y + 108, 56, 32, 'undo', '', 'd') },
  { title: 'GRACEFUL DEGRADATION', lines: ['An error boundary limits a failure to one widget, with a', 'fallback, so the rest of the page keeps working.'],
    draw: (x, y) => rect(x + 14, y + 38, 256, 116, 'panel', 'border') + box(x + 22, y + 46, 240, 24, 'header', '', 'a') + box(x + 22, y + 78, 116, 32, 'product', '', 'a') + box(x + 146, y + 78, 116, 32, 'recommendations', 'failed', 'd') +
      box(x + 22, y + 118, 116, 28, 'cart', '', 'a') + box(x + 146, y + 118, 116, 28, 'fallback: hide', '', 'g') },
], 'The browser is a layer too: cancel what is stale, show results optimistically, and degrade one widget instead of the whole page.',
'Debounce with request cancellation, optimistic UI, and graceful degradation with error boundaries');

// ---- operate it safely: health checks, canary + rollback, golden signals + SLO burn
D.operateSafely = mech('os', [
  { title: 'HEALTH CHECKS', lines: ['Liveness restarts a dead process. Readiness keeps traffic', 'off an instance that is up but not ready yet.'],
    draw: (x, y, m) => box(x + 14, y + 62, 64, 52, 'LB', 'GET /health', 'a') + [['instance 1', 'a'], ['instance 2', 'a'], ['instance 3', 'd']].map(([n, st], i) => {
      const yy = y + 40 + i * 38;
      return box(x + 150, yy, 120, 28, n, '', st) + (st === 'a' ? arrow(`M${x + 80} ${y + 88} L${x + 146} ${yy + 14}`, m.ac, 'accent') : arrow(`M${x + 80} ${y + 90} L${x + 126} ${yy + 14}`, m.da, 'danger', true) + txt(x + 136, yy + 20, '✕', { anchor: 'middle', size: 13, color: 'danger', weight: 700 }));
    }).join('') },
  { title: 'CANARY + AUTO-ROLLBACK', lines: ['Ship to a few users, watch error rate and latency,', 'and let automation roll back before people notice.'],
    draw: (x, y, m) => [['5%', 'canary', 14], ['25%', '', 112], ['100%', '', 210]].map(([t, s, xx]) => box(x + xx, y + 48, 62, 34, t, s, s ? 'g' : 'a')).join('') +
      arrow(`M${x + 78} ${y + 65} L${x + 110} ${y + 65}`, m.ac, 'accent') + arrow(`M${x + 176} ${y + 65} L${x + 208} ${y + 65}`, m.ac, 'accent') + txt(x + 94, y + 44, 'gate', { anchor: 'middle', size: 9, color: 'gold' }) + txt(x + 192, y + 44, 'gate', { anchor: 'middle', size: 9, color: 'gold' }) +
      arrow(`M${x + 143} ${y + 84} L${x + 143} ${y + 112}`, m.da, 'danger', true) + box(x + 60, y + 114, 166, 36, 'metric breach', 'auto-rollback to previous', 'd') },
  { title: 'GOLDEN SIGNALS + SLO BURN', lines: ['Alert on how fast the error budget burns, not on one', 'noisy threshold. Page before the budget is gone.'],
    draw: (x, y, m) => [['latency', 0, 0], ['traffic', 1, 0], ['errors', 0, 1], ['saturation', 1, 1]].map(([n, c, r]) => box(x + 14 + c * 104, y + 40 + r * 38, 96, 30, n, '', 'n')).join('') +
      rect(x + 232, y + 40, 38, 68, 'panel', 'border') + `<rect x="${x + 232}" y="${y + 74}" width="38" height="34" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.2"/>` + txt(x + 251, y + 122, 'budget', { anchor: 'middle', size: 9 }) +
      arrow(`M${x + 110} ${y + 116} L${x + 110} ${y + 126}`, m.go, 'gold') + box(x + 14, y + 128, 208, 34, 'SLO burn-rate alert', 'page before the budget is gone', 'g') },
], 'Run it safely: probe every instance, release in small steps with an automatic way back, and alert on the SLO rather than the symptom.',
'Health checks, canary release with automatic rollback, and golden signals with SLO burn alerts');

// Dense diagrams are too small to read when scaled to a phone: below ~760px they scroll sideways
// instead. tabindex + role/label make the scroll area reachable and scrollable from the keyboard.
const scrollable = (html, label) => html.replace('<div class="diagram">', `<div class="diagram" style="overflow-x:auto" tabindex="0" role="region" aria-label="${label}, scrolls sideways on narrow screens">`).replace('<svg ', '<svg style="min-width:760px" ');
D.fullStack = scrollable(D.fullStack, 'Full reference architecture diagram');
D.platformTopology = scrollable(D.platformTopology, 'Data platform, topology and disaster recovery diagram');
D.layerMap = scrollable(D.layerMap, 'Layer by layer map diagram');
D.resilienceMap = scrollable(D.resilienceMap, 'Optimization and resilience patterns diagram');
for (const [k, label] of [['protectEntrance', 'Timeout, rate limit and load shedding mechanisms'], ['containFailure', 'Bulkhead, backpressure and dead-letter queue mechanisms'], ['offloadOrigin', 'Request collapsing, warm-up and batching mechanisms'], ['protectDatabase', 'Connection pooling, replicas and index mechanisms'], ['clientSide', 'Debounce, optimistic UI and graceful degradation mechanisms'], ['operateSafely', 'Health check, canary and golden signal mechanisms']]) D[k] = scrollable(D[k], label);

export default D;
