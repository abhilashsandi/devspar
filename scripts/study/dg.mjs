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

export default D;
