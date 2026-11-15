// ---------- render ----------
const navList = document.getElementById('navList');
const content = document.getElementById('content');
let activeId = DATA[0].id;
const sidebarEl = document.getElementById('sidebar');
const navToggle = document.getElementById('navToggle');
const navToggleLbl = document.getElementById('navToggleLbl');
function closeNav(){ sidebarEl.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }
navToggle.addEventListener('click', ()=>{ const o = sidebarEl.classList.toggle('open'); navToggle.setAttribute('aria-expanded', String(o)); });
// Sidebar top row: a way back to the list of guides and a light/dark switch. The guide runs in an
// iframe on the site, so the link targets the top window and the switch writes the same `theme`
// key next-themes reads (the site then follows via the storage event).
(function(){
  if(document.querySelector('.side-top')) return;
  const top = document.createElement('div');
  top.className = 'side-top';
  top.innerHTML = '<a class="home-link" href="/" target="_top" aria-label="All guides">←<span> All guides</span></a>' +
    '<button class="theme-btn" type="button" aria-label="Switch between light and dark" title="Light / dark">◐</button>';
  sidebarEl.insertBefore(top, sidebarEl.firstChild);
  top.querySelector('.theme-btn').addEventListener('click', ()=>{
    const root = document.documentElement;
    const dark = root.getAttribute('data-theme') ? root.getAttribute('data-theme') === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ localStorage.setItem('theme', next); }catch(e){}
  });
})();

// ---- answer polish: colour code blocks and let wide tables scroll sideways on their own.
// A <pre class="plain"> (prompts, sample output) is never coloured; other blocks only when they look like code.
const CODE_SIGNS = /\b(const|let|var|function|return|import|export|class|interface|type|await|async|SELECT|INSERT|UPDATE|CREATE|def|func|public|private)\b|=>|===|!==|\(\)\s*\{|;\s*$|<\/?[A-Za-z][\w.-]*[\s>]|^\s*(\$|npm|npx|git|docker|kubectl|curl|node|aws)\s/m;
const TOKEN_RE = /(\/\*[\s\S]*?\*\/|(?<![:\w])\/\/[^\n]*|(?<=^|\s)#(?=\s|!)[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|import|from|export|default|class|extends|implements|new|async|await|try|catch|finally|throw|typeof|instanceof|in|of|type|interface|enum|readonly|public|private|protected|static|as|satisfies|keyof|infer|yield|void|null|undefined|true|false|this|super|SELECT|FROM|WHERE|JOIN|LEFT|INNER|ON|GROUP BY|ORDER BY|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|BEGIN|COMMIT|AND|OR|NOT)\b|\b(\d+(?:\.\d+)?)\b/gm;
const escCode = (s)=> s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function colourCode(pre){
  if(pre.dataset.hl || pre.children.length || pre.classList.contains('plain')) return;
  pre.dataset.hl = '1';
  const src = pre.textContent;
  if(src.length > 6000 || !CODE_SIGNS.test(src)) return;
  let out = '', last = 0;
  src.replace(TOKEN_RE, (m, c, str, k, n, at)=>{
    out += escCode(src.slice(last, at)) + '<span class="tk-' + (c ? 'c' : str ? 's' : k ? 'k' : 'n') + '">' + escCode(m) + '</span>';
    last = at + m.length;
    return m;
  });
  pre.innerHTML = out + escCode(src.slice(last));
}
// ---- sketch:start
// Whiteboard diagrams. Every diagram in every guide is authored as tidy boxes and arrows (dg*.mjs);
// this redraws it by hand when the card is rendered: edges bow and corners drift a little, arrowheads
// become open chevrons, neutral outlines become marker ink, and text is set in the handwriting face
// (theme.css). The wobble is seeded from each shape's own coordinates, so a diagram looks the same
// on every visit. Strokes draw in when the card opens (theme.css, off under reduced motion).
// preview-diagrams.mjs inlines this block, so keep it self-contained.
function sketchRng(seed){
  let s = (seed >>> 0) || 1;
  return ()=>{ s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 - 0.5; };
}
const skN = (v)=> Math.round(v * 10) / 10;
// One hand-drawn stroke from (x1,y1) to (x2,y2): the ends stay put, the middle bows by up to `amp`.
function sketchSeg(x1, y1, x2, y2, r, amp){
  const len = Math.hypot(x2 - x1, y2 - y1);
  if(len < 8) return ' L' + skN(x2) + ' ' + skN(y2);
  const bow = Math.min(amp, len * 0.03) * 2 * r(), t = 0.5 + r() * 0.3;
  const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  return ' Q' + skN(x1 + (x2 - x1) * t + nx * bow) + ' ' + skN(y1 + (y2 - y1) * t + ny * bow) + ' ' + skN(x2) + ' ' + skN(y2);
}
function sketchPath(from, d){
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  for(const a of from.attributes){ if(!/^(x|y|width|height|rx|ry|x1|y1|x2|y2|d)$/.test(a.name)) p.setAttribute(a.name, a.value); }
  p.setAttribute('d', d);
  if(!p.hasAttribute('fill')) p.setAttribute('fill', from.tagName === 'line' ? 'none' : 'black');
  from.replaceWith(p);
  return p;
}
// Code and SQL are read character by character, so they are not handwritten: a label that looks like
// a snippet keeps the type it was authored in. Plain words, names and short calls such as main() are
// still written by hand, as you would on a board.
const SK_SQL = /\b(SELECT|FROM|WHERE|JOIN|UPDATE|SET|INSERT|INTO|VALUES|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|BEGIN|COMMIT|ROLLBACK|EXPLAIN|ANALYZE|GROUP BY|ORDER BY|LIMIT|OFFSET|HAVING|FOR UPDATE|ON CONFLICT|RETURNING)\b/g;
function sketchIsCode(s){
  if(s.length < 4) return false;
  // A sentence that merely mentions code is still a sentence: mostly plain words means handwriting.
  const words = s.trim().split(/\s+/), plain = words.filter(w=> /^[“"'(]?[A-Za-z][A-Za-z’'-]*[)”"',.:!?]*$/.test(w)).length;
  if(plain >= 5 && plain / words.length >= 0.7) return false;
  const t = s.replace(/\b[A-Z][A-Za-z0-9]*\.js\b/g, ' ');                                               // Next.js, Node.js are names, not files
  if(/=>|[{}\[\]$`]|;\s*$|::|[!=<>]=|\w_\w|\s=\s|--[a-z]|<\/?[A-Za-z][\w.-]*[\s/>]/.test(t)) return true;  // operators, snake_case, flags, tags
  if(/\w\.\w+\(|\w\([^)]*[,"'.=][^)]*\)/.test(t)) return true;                                           // obj.method( … ) or a call with arguments
  if(/^(GET|POST|PUT|PATCH|DELETE|HEAD)\s+\/|(^|\s)\/[\w-]+\/[\w\/:-]*|\b[\w-]+\.(m?[jt]sx?|json|md|html|css|sql|ya?ml|env)\b/.test(t)) return true;   // requests, paths, file names
  return (t.match(SK_SQL) || []).length >= 2;                                                           // a SQL statement, not one keyword in a sentence
}
function sketch(svg){
  if(svg.classList.contains('sk')) return;
  svg.classList.add('sk');
  const num = (el, a)=> parseFloat(el.getAttribute(a)) || 0;
  // arrowheads: a filled triangle becomes an open chevron in the same colour
  svg.querySelectorAll('marker path').forEach(m=>{
    const pts = (m.getAttribute('d') || '').match(/-?\d*\.?\d+/g), fill = m.getAttribute('fill');
    if(!pts || pts.length !== 6 || !fill || fill === 'none' || m.getAttribute('stroke')) return;
    m.setAttribute('d', 'M' + pts[0] + ' ' + pts[1] + ' L' + pts[2] + ' ' + pts[3] + ' L' + pts[4] + ' ' + pts[5]);
    m.setAttribute('stroke', fill); m.setAttribute('fill', 'none');
    m.setAttribute('stroke-width', '1.2'); m.setAttribute('stroke-linecap', 'round'); m.setAttribute('stroke-linejoin', 'round');
    const mk = m.closest('marker'); if(mk) mk.setAttribute('overflow', 'visible');
  });
  const inDefs = (el)=> !!el.closest('defs, marker');
  svg.querySelectorAll('rect').forEach(el=>{
    if(inDefs(el)) return;
    const x = num(el, 'x'), y = num(el, 'y'), w = num(el, 'width'), h = num(el, 'height'), rx = num(el, 'rx');
    if(w < 22 || h < 14 || rx >= Math.min(w, h) / 2 - 1) return;          // tiny marks and pills stay as they are
    const r = sketchRng(x * 73856093 ^ y * 19349663 ^ w * 83492791 ^ h * 2971), j = Math.min(1.5, Math.min(w, h) * 0.05);
    const c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(pt=> [pt[0] + j * 2 * r(), pt[1] + j * 2 * r()]);
    let d = 'M' + skN(c[0][0]) + ' ' + skN(c[0][1]);
    for(let i = 0; i < 4; i++){ const a = c[i], b = c[(i + 1) % 4]; d += sketchSeg(a[0], a[1], b[0], b[1], r, 1.6); }
    sketchPath(el, d + ' Z');
  });
  svg.querySelectorAll('line').forEach(el=>{
    if(inDefs(el)) return;
    const x1 = num(el, 'x1'), y1 = num(el, 'y1'), x2 = num(el, 'x2'), y2 = num(el, 'y2');
    sketchPath(el, 'M' + x1 + ' ' + y1 + sketchSeg(x1, y1, x2, y2, sketchRng(x1 * 73856093 ^ y1 * 19349663 ^ x2 * 83492791 ^ y2 * 2971), 1.8));
  });
  svg.querySelectorAll('path').forEach(el=>{
    if(inDefs(el) || !/^\s*M\s*-?[\d.]+[\s,]+-?[\d.]+(\s*L\s*-?[\d.]+[\s,]+-?[\d.]+)+\s*$/.test(el.getAttribute('d') || '')) return;
    const n = el.getAttribute('d').match(/-?\d*\.?\d+/g).map(Number);   // straight polylines only: arrows and connectors
    const r = sketchRng(n[0] * 73856093 ^ n[1] * 19349663 ^ n[n.length - 2] * 83492791 ^ n[n.length - 1] * 2971);
    let d = 'M' + n[0] + ' ' + n[1];
    for(let i = 2; i < n.length; i += 2) d += sketchSeg(n[i - 2], n[i - 1], n[i], n[i + 1], r, 2.2);
    el.setAttribute('d', d);
  });
  // ink and draw order: neutral outlines use marker ink; everything gets a small stagger for the draw-in
  const els = [...svg.querySelectorAll('path, circle, ellipse, polygon, rect, text')].filter(el=> !inDefs(el));
  const step = Math.min(24, 760 / Math.max(1, els.length));
  els.forEach((el, i)=>{
    el.style.setProperty('--d', Math.round(i * step) + 'ms');
    if(el.tagName === 'text'){
      el.classList.add('sk-t');
      const s = el.textContent;
      if(sketchIsCode(s)){ el.classList.add('sk-code'); return; }   // code stays in the type it was authored in
      if(s.length > 10 && !/[a-z]/.test(s)) el.classList.add('sk-caps');   // capitals are wide in a handwriting face
      return;
    }
    const stroke = el.getAttribute('stroke');
    if(!stroke || stroke === 'none'){ el.classList.add('sk-t'); return; }
    if(stroke === 'var(--border)') el.setAttribute('stroke', 'var(--muted)');
    el.classList.add('sk-s');
    if(el.tagName === 'path' && !el.hasAttribute('stroke-dasharray')){ el.setAttribute('pathLength', '1'); el.classList.add('sk-d'); }
    else el.classList.add('sk-t');
  });
}
// Both versions are kept: the authored ("tidy") SVG is never thrown away, and a switch under every
// diagram flips all of them between the whiteboard drawing and the tidy original. The choice is
// remembered across guides.
const SK_PREF = 'study-diagram-style';
let skMem = null;   // used when storage is blocked, so the switch still works for this visit
function diagramMode(){ if(skMem) return skMem; try{ return localStorage.getItem(SK_PREF) === 'tidy' ? 'tidy' : 'sketch'; }catch(e){ return 'sketch'; } }
function drawDiagrams(root){
  const mode = diagramMode();
  root.querySelectorAll('.diagram').forEach(box=>{
    box.querySelectorAll('svg').forEach(svg=>{
      if(!svg.__tidy) svg.__tidy = svg.outerHTML;              // the authored drawing, kept verbatim
      if(mode === 'sketch') sketch(svg);
      else if(svg.classList.contains('sk')){
        const t = document.createElement('div'); t.innerHTML = svg.__tidy;
        const fresh = t.firstElementChild; fresh.__tidy = svg.__tidy; svg.replaceWith(fresh);
      }
    });
    box.classList.toggle('tidy', mode === 'tidy');
    let bar = box.querySelector('.dg-bar');
    if(!bar){
      bar = document.createElement('div'); bar.className = 'dg-bar';
      bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Diagram style');
      bar.innerHTML = '<button type="button" data-dg="sketch">✎ Whiteboard</button><button type="button" data-dg="tidy">▭ Tidy</button>' +
        '<button type="button" data-dg="zoom" aria-haspopup="dialog">⤢ Enlarge</button>';
      bar.addEventListener('click', (ev)=>{
        const b = ev.target.closest('button[data-dg]'); if(!b) return;
        if(b.dataset.dg === 'zoom'){ enlargeDiagram(box); return; }
        try{ localStorage.setItem(SK_PREF, b.dataset.dg); }catch(e){ skMem = b.dataset.dg; }
        drawDiagrams(document);
      });
      box.appendChild(bar);
    }
    bar.querySelectorAll('button:not([data-dg="zoom"])').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.dg === mode)));
  });
}
// A diagram is drawn 900 units wide but a card column is narrower, so its labels end up small.
// "Enlarge" shows it in a dialog as wide as the window (and scrollable on a phone), in whichever
// style is selected. The dialog element gives focus trapping and Esc for free.
function enlargeDiagram(box){
  let dlg = document.getElementById('dgZoom');
  if(!dlg){
    dlg = document.createElement('dialog'); dlg.id = 'dgZoom'; dlg.className = 'dg-zoom';
    dlg.setAttribute('aria-label', 'Enlarged diagram');
    dlg.innerHTML = '<div class="dg-zoom-top"><span>Scroll to move around. Esc closes.</span>' +
      '<button type="button" class="dg-zoom-close">✕ Close</button></div><div class="dg-zoom-body" tabindex="0"></div>';
    dlg.addEventListener('click', (ev)=>{ if(ev.target === dlg || ev.target.closest('.dg-zoom-close')) dlg.close(); });
    document.body.appendChild(dlg);
  }
  const body = dlg.querySelector('.dg-zoom-body');
  body.innerHTML = '';
  const copy = document.createElement('div');
  copy.className = 'diagram' + (box.classList.contains('lightbg') ? ' lightbg' : '');
  box.querySelectorAll('svg').forEach(svg=>{ const t = document.createElement('div'); t.innerHTML = svg.__tidy || svg.outerHTML; copy.appendChild(t.firstElementChild); });
  body.appendChild(copy);
  drawDiagrams(body);
  if(dlg.showModal){ if(!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
}
// ---- sketch:end
// ---- depths:start
// Answer length. A card may carry an extras block (scripts/study/extras.mjs) with a 15-second and a
// 60-second spoken version. The switch shows one at a time; "Full answer" is the card as written. The
// choice is one setting for every card and every guide. A card without the block gets no switch.
const DEPTH_PREF = 'study-depth-pref-v1';
let depthMem = null;   // used when storage is blocked, so the switch still works for this visit
function depthSeconds(words){ return Math.round(words / 2.5); }   // 150 words a minute
function depthMode(){
  if(depthMem) return depthMem;
  try{ const v = localStorage.getItem(DEPTH_PREF); return v === '15' || v === '60' ? v : 'full'; }catch(e){ return 'full'; }
}
function depthWords(el){ return (el.textContent || '').trim().split(/\s+/).filter(Boolean).length; }
function applyDepth(doc){
  const mode = depthMode();
  doc.querySelectorAll('.depth-bar').forEach(bar=>{
    const body = bar.parentElement;
    body.classList.toggle('depth-short', mode !== 'full');
    body.dataset.depth = mode;
    bar.querySelectorAll('button').forEach(b=> b.setAttribute('aria-pressed', String(b.dataset.depth === mode)));
    const t = bar.querySelector('.depth-time');
    if(mode === 'full') t.textContent = 'about ' + Math.max(1, Math.round(Number(bar.dataset.words) / 150)) + ' min spoken';
    else { const s = body.querySelector('.xdepths [data-depth="' + mode + '"]'); t.textContent = 'about ' + depthSeconds(s ? depthWords(s) : 0) + ' s spoken'; }
  });
}
function mountDepths(root){
  root.querySelectorAll('.xdepths').forEach(x=>{
    if(x.dataset.mounted) return;
    const body = x.closest('.qbody') || x.parentElement;
    x.dataset.mounted = '1'; x.hidden = false;
    const ladder = body.querySelector('.xladder');
    const full = depthWords(body) - depthWords(x) - (ladder ? depthWords(ladder) : 0);
    const bar = document.createElement('div');
    bar.className = 'depth-bar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Answer length');
    bar.dataset.words = String(Math.max(1, full));
    bar.innerHTML = '<button type="button" data-depth="15" aria-pressed="false">15 s</button><button type="button" data-depth="60" aria-pressed="false">60 s</button><button type="button" data-depth="full" aria-pressed="false">Full answer</button><span class="depth-time"></span>';
    bar.addEventListener('click', (ev)=>{
      const b = ev.target.closest('button[data-depth]'); if(!b) return;
      try{ localStorage.setItem(DEPTH_PREF, b.dataset.depth); depthMem = null; }catch(e){ depthMem = b.dataset.depth; }
      applyDepth(document);
    });
    body.insertBefore(bar, body.firstChild);
    body.insertBefore(x, bar.nextSibling);
    applyDepth(body);   // the card is not in the page yet, so scope to it, not to document
  });
}
// ---- depths:end
// ---- ladder:start
// The interviewer pushes: follow-up questions that get harder, one at a time.
function mountLadders(root){
  root.querySelectorAll('.xladder').forEach(l=>{
    if(l.dataset.mounted) return;
    l.dataset.mounted = '1';
    const rungs = Array.from(l.querySelectorAll('.rung'));
    if(!rungs.length) return;
    l.hidden = false;
    const head = document.createElement('p'); head.className = 'ladder-h'; head.textContent = 'The interviewer pushes';
    l.insertBefore(head, l.firstChild);
    let shown = 1;
    rungs.forEach((r, i)=>{ r.hidden = i > 0; });
    const foot = document.createElement('div'); foot.className = 'ladder-foot';
    const count = document.createElement('span'); count.className = 'ladder-count'; count.setAttribute('aria-live', 'polite');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ladder-next'; btn.textContent = 'Push harder →';
    const update = ()=>{ count.textContent = 'Follow-up ' + shown + ' of ' + rungs.length; if(shown >= rungs.length) btn.remove(); };
    btn.addEventListener('click', ()=>{
      rungs[shown].hidden = false; shown++; update();
      const s = rungs[shown - 1].querySelector('summary'); if(s) s.focus();
    });
    foot.appendChild(count); foot.appendChild(btn); l.appendChild(foot);
    update();
  });
}
// ---- ladder:end
// ---- sqlrun:start
// A puzzle card carries <div class="sqlrun">. It gets a "Try it here" button; the runner itself (a worker with
// PostgreSQL compiled to WebAssembly, about 15 MB) is only fetched when that button is pressed.
function mountSqlRun(root){
  root.querySelectorAll('.sqlrun').forEach(el=>{
    if(el.dataset.mounted) return;
    el.dataset.mounted = '1';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sqlr-open'; b.textContent = '▶ Try it here';
    el.appendChild(b);
    b.addEventListener('click', ()=>{
      b.disabled = true; b.textContent = 'Loading…';
      import('/study/sqlrun/sqlrun.js').then(m=>{
        const body = el.closest('.qbody') || root;
        const pre = body.querySelector('details.reveal pre');
        m.mount(el, { solution: (el.dataset.free === '1' || !pre) ? null : pre.textContent, ordered: el.dataset.ordered === '1' });
      }).catch(()=>{ el.textContent = 'The SQL runner could not load.'; });
    });
  });
}
// ---- sqlrun:end
// ---- predict:start
// Predict the output. A card shows a snippet and an empty <div class="predict">. The reader types what the
// snippet will print, locks it in, and only then does it run, in a Web Worker built from a Blob (so an
// infinite loop cannot freeze the page, and can be stopped). The same formatter and harness run in Node
// (check-predict.mjs), so the output printed on each card comes from the code path the reader uses.
function predictFormat(value, nested){
  const t = typeof value;
  if(value === null) return 'null';
  if(t === 'string') return nested ? "'" + value + "'" : value;
  if(t === 'bigint') return String(value) + 'n';
  if(t === 'function') return value.name ? '[Function: ' + value.name + ']' : '[Function (anonymous)]';
  if(t !== 'object') return String(value);
  if(value instanceof Error || Object.prototype.toString.call(value) === '[object Error]') return value.name + ': ' + value.message;
  if(Array.isArray(value)) return value.length ? '[ ' + value.map(function(x){ return predictFormat(x, true); }).join(', ') + ' ]' : '[]';
  const keys = Object.keys(value);
  return keys.length ? '{ ' + keys.map(function(k){ return k + ': ' + predictFormat(value[k], true); }).join(', ') + ' }' : '{}';
}
// The program text a worker runs. `post` names the function that sends a message ({line} or {done}).
function predictSource(code, post){
  return "'use strict';\n" + predictFormat.toString() + "\n" +
    "const __send = (line) => " + post + "({ line });\n" +
    "const __console = { log: (...a) => __send(a.map((x) => predictFormat(x, false)).join(' ')) };\n" +
    "const __err = (e, prefix) => __send(prefix + ' ' + (e && e.name ? e.name + ': ' + e.message : String(e)));\n" +
    "if (typeof process !== 'undefined' && process.on) {\n" +
    "  process.on('uncaughtException', (e) => __err(e, 'Uncaught'));\n" +
    "  process.on('unhandledRejection', (e) => __err(e, 'Uncaught (in promise)'));\n" +
    "} else if (typeof addEventListener === 'function') {\n" +
    "  addEventListener('error', (ev) => { if (ev.preventDefault) ev.preventDefault(); __err(ev.error || ev.message, 'Uncaught'); });\n" +
    "  addEventListener('unhandledrejection', (ev) => { if (ev.preventDefault) ev.preventDefault(); __err(ev.reason, 'Uncaught (in promise)'); });\n" +
    "}\n" +
    "try { (function (console) {\n'use strict';\n" + code + "\n})(__console); } catch (e) { __err(e, 'Uncaught'); }\n" +
    "setTimeout(() => " + post + "({ done: true }), 700);\n";
}
// Compares what the reader said with what it printed, line by line, judging the answer and not the spacing.
function predictCompare(predicted, actual){
  const said = String(predicted).split('\n');
  while(said.length && !said[said.length - 1].trim()) said.pop();
  while(said.length && !said[0].trim()) said.shift();
  const norm = function(s){ return s.replace(/\s+/g, '').replace(/[“”‘’"]/g, "'"); };
  const same = function(a, b){
    const x = norm(a), y = norm(b);
    if(x === y) return true;
    // a bare string written with quotes ("a" for a) is forgiven; a string written as a number is not
    return x.length > 2 && x[0] === "'" && x[x.length - 1] === "'" && x.indexOf("'", 1) === x.length - 1 && y.indexOf("'") < 0 && x.slice(1, -1) === y;
  };
  const n = Math.max(said.length, actual.length);
  const rows = [];
  let right = 0;
  for(let i = 0; i < n; i++){
    const s = i < said.length ? said[i] : '', p = i < actual.length ? actual[i] : '';
    const ok = i < said.length && i < actual.length && same(s, p);
    if(ok) right++;
    rows.push({ said: s, printed: p, ok: ok });
  }
  return { rows: rows, right: right, total: actual.length };
}
// Runs a snippet in a worker made from a Blob. Resolves with the printed lines, or null when this browser will not
// run code here. A run that is still going after 2 seconds is stopped.
function predictRun(code){
  return new Promise(function(resolve){
    const lines = [];
    let w = null, done = false, timer = 0, url = '';
    const finish = function(extra){
      if(done) return;
      done = true; clearTimeout(timer);
      try{ w.terminate(); }catch(e){}
      try{ URL.revokeObjectURL(url); }catch(e){}
      if(extra) lines.push(extra);
      resolve(lines);
    };
    try{
      url = URL.createObjectURL(new Blob([predictSource(code, 'postMessage')], { type: 'text/javascript' }));
      w = new Worker(url);
    }catch(e){ resolve(null); return; }
    w.onmessage = function(ev){ const m = ev.data || {}; if(m.line !== undefined) lines.push(m.line); if(m.done) finish(); };
    w.onerror = function(ev){ if(ev.preventDefault) ev.preventDefault(); const m = String(ev.message || 'error'); finish(/^Uncaught /.test(m) ? m : 'Uncaught ' + m); };
    timer = setTimeout(function(){ finish('Stopped: still running after 2 seconds'); }, 2000);
  });
}
function mountPredict(root){
  root.querySelectorAll('.predict').forEach(function(box){
    if(box.dataset.mounted) return;
    box.dataset.mounted = '1';
    const body = box.closest('.qbody') || root;
    const reveal = body.querySelector('details.reveal');
    const pre = Array.from(body.querySelectorAll('pre')).find(function(p){ return !p.classList.contains('plain') && !p.closest('details'); });
    if(!pre) return;
    const snippet = pre.textContent;
    const area = document.createElement('textarea');
    area.className = 'pred-said'; area.rows = 4; area.spellcheck = false;
    area.setAttribute('aria-label', 'Your predicted output, one line per console.log');
    area.placeholder = 'What will this print? One line for each console.log.';
    const go = document.createElement('button'); go.type = 'button'; go.className = 'pred-go'; go.textContent = 'Lock in and run'; go.disabled = true;
    const skip = document.createElement('button'); skip.type = 'button'; skip.className = 'pred-skip'; skip.textContent = 'I don’t know: run it';
    const note = document.createElement('p'); note.className = 'pred-note'; note.textContent = 'Runs in strict mode in a Web Worker: no DOM, no network.';
    const out = document.createElement('div'); out.className = 'pred-out'; out.setAttribute('aria-live', 'polite');
    const actions = document.createElement('div'); actions.className = 'pred-actions'; actions.append(go, skip);
    box.append(area, actions, note, out);
    area.addEventListener('input', function(){ go.disabled = !area.value.trim(); });

    let said = null;     // the locked-in prediction, or null after "I don't know"
    function show(lines, codeText){
      out.textContent = '';
      const t = document.createElement('table'); t.className = 'cmp pred-table';
      let verdict;
      if(said === null){
        t.innerHTML = '<tr><th>It printed</th></tr>';
        lines.forEach(function(l){ const tr = document.createElement('tr'); const td = document.createElement('td'); td.textContent = l; tr.appendChild(td); t.appendChild(tr); });
        verdict = 'It printed ' + lines.length + ' line' + (lines.length === 1 ? '' : 's') + '.';
      } else {
        const c = predictCompare(said, lines);
        t.innerHTML = '<tr><th>You said</th><th>It printed</th></tr>';
        c.rows.forEach(function(r){
          const tr = document.createElement('tr'); tr.className = r.ok ? 'pred-ok' : 'pred-bad';
          const a = document.createElement('td'); a.textContent = r.said; const b = document.createElement('td'); b.textContent = r.printed + (r.ok ? '  ✓' : '  ✗');
          tr.append(a, b); t.appendChild(tr);
        });
        verdict = c.rows.every(function(r){ return r.ok; }) ? 'Exactly right.' : c.right + ' of ' + c.total + ' lines right.';
      }
      const v = document.createElement('p'); v.className = 'pred-verdict'; v.textContent = verdict;
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'pred-edit'; edit.textContent = 'Edit the code';
      out.append(t, v, edit);
      edit.addEventListener('click', function(){
        edit.remove();
        const ta = document.createElement('textarea'); ta.className = 'pred-code'; ta.rows = 8; ta.spellcheck = false; ta.value = codeText;
        ta.setAttribute('aria-label', 'Code');
        const again = document.createElement('button'); again.type = 'button'; again.className = 'pred-again'; again.textContent = 'Run again';
        out.append(ta, again);
        again.addEventListener('click', function(){ run(ta.value); });
      });
      if(reveal) reveal.open = true;
    }
    function run(codeText){
      go.disabled = true; skip.disabled = true; area.readOnly = true;
      out.textContent = 'Running…';
      predictRun(codeText).then(function(lines){
        if(lines === null){ out.textContent = 'This browser will not run code here. Open the answer below.'; if(reveal) reveal.open = true; return; }
        show(lines, codeText);
      });
    }
    go.addEventListener('click', function(){ said = area.value; run(snippet); });
    skip.addEventListener('click', function(){ said = null; run(snippet); });
  });
}
// ---- predict:end
// ---- listen:start
// Listen mode: read a section's questions and answers aloud with the device's own voice (speech synthesis).
// Nothing is generated or downloaded. Code, tables and diagrams are replaced by a short spoken marker.
function speakText(html){
  let s = String(html).replace(/<!--x:extras-->[\s\S]*?<!--\/x:extras-->/g, ' ');
  s = s.replace(/<summary[\s\S]*?<\/summary>/g, ' ')
    .replace(/<details class="reveal">/g, ' The answer. ')
    .replace(/<pre[\s\S]*?<\/pre>/g, ' Code example on the card. ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' Diagram on the card. ')
    .replace(/<table[\s\S]*?<\/table>/g, ' Table on the card. ')
    .replace(/<\/?(?:p|li|ul|ol|div|br|h[1-6]|tr|td|th|blockquote)[^>]*>/gi, ' ')   // block tags break the text, inline ones do not
    .replace(/<[^>]+>/g, '');
  s = s.replace(/&#x([0-9a-f]+);/gi, function(m, h){ return String.fromCodePoint(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function(m, d){ return String.fromCodePoint(Number(d)); })
    .replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&rarr;/g, '→').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  s = s.replace(/\s+/g, ' ').trim();
  // two code blocks or diagrams in a row are one marker
  ['Code example on the card.', 'Diagram on the card.', 'Table on the card.'].forEach(function(m){
    const one = m.replace(/\./g, '[.]');
    s = s.replace(new RegExp('(' + one + ' ?){2,}', 'g'), m + ' ');
  });
  return s.trim();
}
// Some browsers stop a long utterance after about 15 seconds, so speak short chunks.
function speakChunks(text, max){
  max = max || 220;
  const out = [];
  let cur = '';
  const flush = function(){ if(cur){ out.push(cur); cur = ''; } };
  String(text).split(/(?<=[.!?])\s+/).filter(Boolean).forEach(function(sentence){
    while(sentence.length > max){
      let cut = Math.max(sentence.lastIndexOf(', ', max - 1), sentence.lastIndexOf(' ', max - 1));
      if(cut <= 0) cut = max - 1;
      flush();
      out.push(sentence.slice(0, cut + 1).trim());
      sentence = sentence.slice(cut + 1).trim();
    }
    if(!sentence) return;
    if(cur && cur.length + 1 + sentence.length > max) flush();
    cur = cur ? cur + ' ' + sentence : sentence;
  });
  flush();
  return out;
}
// The chunks to say for one card: "Question. ..." then the 60-second script when the card has one (unless the
// full answer was asked for), otherwise the whole answer.
function speakable(q, a, full){
  const m = String(a).match(/<div data-depth="60"><p>([\s\S]*?)<\/p><\/div>/);
  const body = (!full && m) ? speakText(m[1]) : speakText(a);
  return ['Question. ' + speakText(q)].concat(speakChunks(body));
}
// The player. It reads the cards now shown in #content, one after another, in short chunks.
const LISTEN_KEY = 'study-listen-v1';
const LISTEN_RATES = [0.8, 1, 1.2, 1.4, 1.6];
let ls = null;   // the player's state while it is open
function listenOk(){ return typeof window !== 'undefined' && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function'; }
function listenSettings(){ return Object.assign({ rate: 1, voiceURI: '', full: false, seen: false }, readJSON(LISTEN_KEY, {})); }
function listenSave(){ if(!ls) return; ls.set = { rate: ls.rate, voiceURI: ls.voiceURI, full: ls.full, seen: true }; writeJSON(LISTEN_KEY, ls.set); }
function listenVoices(){ try{ return window.speechSynthesis.getVoices().filter(function(v){ return /^en/i.test(v.lang || ''); }); }catch(e){ return []; } }
async function listenLock(on){
  try{
    if(on && navigator.wakeLock && !ls.lock){ ls.lock = await navigator.wakeLock.request('screen'); ls.lock.addEventListener && ls.lock.addEventListener('release', function(){ if(ls) ls.lock = null; }); }
    else if(!on && ls && ls.lock){ const l = ls.lock; ls.lock = null; await l.release(); }
  }catch(e){ /* a wake lock is a nicety */ }
}
function listenCard(i){
  if(!ls) return null;
  const e = ls.entries[i];
  return content.querySelector('.qcard[data-sec="' + e.section.id + '"][data-q="' + e.qIdx + '"]');
}
function listenMark(i){
  content.querySelectorAll('.qcard.listening').forEach(function(c){ c.classList.remove('listening'); });
  const c = listenCard(i);
  if(c){ c.classList.add('open', 'listening'); try{ c.scrollIntoView({ block: 'center', behavior: 'smooth' }); }catch(e){} }
}
function listenLabel(){
  if(!ls) return;
  const bar = ls.bar.querySelector('.ls-label');
  if(ls.done){ bar.textContent = 'End of section.'; return; }
  bar.textContent = (ls.i + 1) + ' / ' + ls.entries.length + ' · ' + stripTags(ls.entries[ls.i].item.q);
}
function listenSpeak(){
  if(!ls || !ls.playing) return;
  const text = ls.chunks[ls.c];
  const u = new window.SpeechSynthesisUtterance(text);
  u.rate = ls.rate;
  const v = listenVoices().find(function(x){ return x.voiceURI === ls.voiceURI; });
  if(v) u.voice = v;
  const mine = ++ls.token;
  u.onend = function(){
    if(!ls || !ls.playing || ls.token !== mine) return;
    ls.c++;
    if(ls.c < ls.chunks.length) setTimeout(function(){ if(ls && ls.playing && ls.token === mine) listenSpeak(); }, ls.c === 1 ? 1500 : 0);   // a beat after the question
    else listenAdvance(1);
  };
  u.onerror = function(){ /* cancel() fires an error on some browsers: the state is already updated */ };
  window.speechSynthesis.speak(u);
}
function listenGo(i){
  ls.i = i; ls.c = 0; ls.done = false;
  ls.chunks = speakable(ls.entries[i].item.q, ls.entries[i].item.a, ls.full);
  listenMark(i); listenLabel();
}
function listenAdvance(d){
  if(!ls) return;
  window.speechSynthesis.cancel(); ls.token++;
  const n = ls.i + d;
  if(n < 0) return listenGo(0), listenSpeak();
  if(n >= ls.entries.length){ ls.playing = false; ls.done = true; listenLabel(); listenSync(); listenLock(false); return; }
  listenGo(n); listenSpeak();
}
function listenSync(){
  if(!ls) return;
  ls.bar.querySelector('.ls-play').textContent = ls.playing ? 'Pause' : 'Play';
}
function listenToggle(){
  if(!ls) return;
  if(ls.done){ listenGo(0); }
  if(ls.playing){ ls.playing = false; ls.token++; window.speechSynthesis.cancel(); listenLock(false); }
  else { ls.playing = true; listenLock(true); listenSpeak(); }
  listenSync();
}
function stopListen(){
  if(!ls) return;
  const s = ls; ls = null;
  s.token++; try{ window.speechSynthesis.cancel(); }catch(e){}
  s.playing = false;
  if(s.lock){ try{ s.lock.release(); }catch(e){} }
  s.bar.remove();
  content.querySelectorAll('.qcard.listening').forEach(function(c){ c.classList.remove('listening'); });
}
function startListen(){
  if(!listenOk()) return;
  const entries = deckFromView();
  if(!entries.length) return;
  stopListen();
  const set = listenSettings();
  const bar = document.createElement('div');
  bar.id = 'listenBar'; bar.className = 'listen-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Listen');
  const voices = listenVoices();
  bar.innerHTML = (set.seen ? '' : '<p class="ls-note">Reading aloud uses your device’s voice. It plays while this tab is open and the screen is on.</p>') +
    '<div class="ls-row"><button type="button" class="ls-prev" aria-label="Previous question">⏮</button><button type="button" class="ls-play">Pause</button><button type="button" class="ls-next" aria-label="Next question">⏭</button>' +
    '<label class="ls-f">Speed <select class="ls-rate" aria-label="Speed">' + LISTEN_RATES.map(function(r){ return '<option value="' + r + '"' + (r === set.rate ? ' selected' : '') + '>' + r + '×</option>'; }).join('') + '</select></label>' +
    (voices.length > 1 ? '<label class="ls-f">Voice <select class="ls-voice" aria-label="Voice">' + voices.map(function(v){ return '<option value="' + v.voiceURI + '"' + (v.voiceURI === set.voiceURI ? ' selected' : '') + '>' + v.name + '</option>'; }).join('') + '</select></label>' : '') +
    '<label class="ls-f"><input type="checkbox" class="ls-full"' + (set.full ? ' checked' : '') + '> Full answers</label>' +
    '<button type="button" class="ls-close">Close</button></div><div class="ls-label" aria-live="polite"></div>';
  document.body.appendChild(bar);
  const startAt = (typeof focusIdx === 'number' && focusIdx >= 0 && cards()[focusIdx]) ? Math.max(0, entries.indexOf(entry(cards()[focusIdx].dataset.sec, Number(cards()[focusIdx].dataset.q)))) : 0;
  ls = { entries: entries, bar: bar, i: 0, c: 0, chunks: [], playing: true, done: false, token: 0, lock: null, rate: set.rate, voiceURI: set.voiceURI || (voices[0] && voices[0].voiceURI) || '', full: set.full };
  listenGo(startAt);
  listenSave();
  bar.querySelector('.ls-play').addEventListener('click', listenToggle);
  bar.querySelector('.ls-prev').addEventListener('click', function(){ listenAdvance(-1); });
  bar.querySelector('.ls-next').addEventListener('click', function(){ listenAdvance(1); });
  bar.querySelector('.ls-close').addEventListener('click', stopListen);
  bar.querySelector('.ls-rate').addEventListener('change', function(e){ ls.rate = Number(e.target.value); listenSave(); if(ls.playing){ window.speechSynthesis.cancel(); ls.token++; listenSpeak(); } });
  const vs = bar.querySelector('.ls-voice');
  if(vs) vs.addEventListener('change', function(e){ ls.voiceURI = e.target.value; listenSave(); if(ls.playing){ window.speechSynthesis.cancel(); ls.token++; listenSpeak(); } });
  bar.querySelector('.ls-full').addEventListener('change', function(e){ ls.full = e.target.checked; listenSave(); listenGo(ls.i); if(ls.playing){ window.speechSynthesis.cancel(); ls.token++; listenSpeak(); } });
  bar.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); stopListen(); } });
  listenLock(true);
  listenSync();
  listenSpeak();
}
function initListen(){
  if(!listenOk()) return;
  const actions = document.querySelector('.hero-actions');
  if(actions && !document.getElementById('listenBtn')){
    const b = document.createElement('button');
    b.id = 'listenBtn'; b.type = 'button'; b.className = 'fc-start alt'; b.textContent = '🔊 Listen';
    b.addEventListener('click', startListen);
    actions.appendChild(b);
  }
  document.addEventListener('visibilitychange', function(){ if(ls && ls.playing && document.visibilityState === 'visible') listenLock(true); });
  if(window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', function(){ /* voices are read when the player opens */ });
}
// ---- listen:end
function enhance(root){
  drawDiagrams(root);
  mountDepths(root);
  mountLadders(root);
  mountSqlRun(root);
  mountPredict(root);
  root.querySelectorAll('pre').forEach(colourCode);
  root.querySelectorAll('table.cmp').forEach(t=>{
    const p = t.parentElement;
    if(p.classList.contains('tscroll') || /overflow/.test(p.getAttribute('style') || '')) return;
    const w = document.createElement('div'); w.className = 'tscroll';
    p.insertBefore(w, t); w.appendChild(t);
  });
}
const STORAGE_KEY = window.__STUDY__.key + '-reviewed-v1';
const PREFS_KEY = window.__STUDY__.key + '-prefs-v1';

function readJSON(key, fallback){ try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }catch(e){ return fallback; } }
function writeJSON(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

let reviewed = readJSON(STORAGE_KEY, {});
// Shared progress: the same question in another guide counts as reviewed here too (matched by normalised title).
const TITLES_KEY = 'study-reviewed-titles-v1';
let titleDone = readJSON(TITLES_KEY, {});
const titleKey = (t)=> String(t).replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function syncTitle(sid, idx, val){
  const e = INDEX.find(x=>x.section.id===sid && x.qIdx===idx);
  if(!e) return;
  if(val) titleDone[e.tkey] = 1; else delete titleDone[e.tkey];
  writeJSON(TITLES_KEY, titleDone);
}
// Weak cards: shared across guides the same way (by title), so a card you keep missing on one
// guide shows up as weak everywhere it appears. "Again" in flashcards adds it; "Got it" clears it.
const WEAK_KEY = 'study-weak-titles-v1';
let weak = readJSON(WEAK_KEY, {});
function markWeak(tkey, isWeak){ if(isWeak) weak[tkey] = (weak[tkey]||0) + 1; else delete weak[tkey]; writeJSON(WEAK_KEY, weak); }
let prefs = Object.assign({ summaries:true, coreOnly:false, hideDone:false, shuffle:false }, readJSON(PREFS_KEY, {}));
function savePrefs(){ writeJSON(PREFS_KEY, prefs); }
function qKey(sectionId, qIdx){ return sectionId + ':' + qIdx; }

// ---- derived data: plain text, one-line summaries, core set, reading time
const stripTags = (s)=> s.replace(/<pre[\s\S]*?<\/pre>/g,' ').replace(/<svg[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ')
  .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&mdash;/g,'—').replace(/&rarr;/g,'→').replace(/&[a-z]+;/g,' ')
  .replace(/\s+/g,' ').trim();
const INDEX = [];
DATA.forEach(section=>{
  section.questions.forEach((item, qIdx)=>{
    // Summary: leading prose (no badges, tables, code or diagrams), whole sentences until it says something useful.
    const prose = stripTags(item.a.replace(/<!--x:extras-->[\s\S]*?<!--\/x:extras-->/g,' ').replace(/<details[\s\S]*?<\/details>/g,' ').replace(/<span class="tbadge">[\s\S]*?<\/span>/,'').replace(/<table[\s\S]*?<\/table>/g,' ').replace(/<div class="diagram">[\s\S]*?<\/div>/g,' '));
    const sentences = prose.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/);
    let summary = '';
    for(const s of sentences){ if(summary.length >= 90) break; summary = (summary ? summary + ' ' : '') + s; }
    summary = summary.replace(/^(Common follow-ups|Model answer:|Answer:)\s*/i, '');
    if(summary.length > 240) summary = summary.slice(0, 237).replace(/\s+\S*$/,'') + '…';
    const text = stripTags(item.q + ' ' + item.a);
    INDEX.push({ section, qIdx, item, summary, text: text.toLowerCase(), words: text.split(' ').length });
  });
});
let migrated = false;
INDEX.forEach(e=>{
  e.tkey = titleKey(e.item.q);
  const k = qKey(e.section.id, e.qIdx);
  if(titleDone[e.tkey]) reviewed[k] = true;
  else if(reviewed[k]){ titleDone[e.tkey] = 1; migrated = true; }   // progress made before shared progress existed
});
if(migrated) writeJSON(TITLES_KEY, titleDone);
const CORE = new Set();
const review = DATA.find(s=>s.id==='review');
if(review) review.questions.forEach(q=>{ (q.a.match(/data-go="[^"]+"/g)||[]).forEach(m=>CORE.add(m.slice(9,-1))); });
const entry = (sid, i)=> INDEX.find(e=>e.section.id===sid && e.qIdx===i);
function minutes(words){ return Math.max(1, Math.round(words / 200)); }

// ---- totals and progress
function totalQuestions(){ return INDEX.length; }
function reviewedCount(){ return INDEX.filter(e=>reviewed[qKey(e.section.id,e.qIdx)]).length; }
function sectionDone(section){ return section.questions.filter((_,i)=>reviewed[qKey(section.id,i)]).length; }
function updateProgress(){
  const total = totalQuestions(), done = reviewedCount();
  document.getElementById('progressNum').textContent = done + ' / ' + total;
  document.getElementById('progressFill').style.width = (total ? (done/total*100) : 0) + '%';
}

// ---- nav
function renderNav(){
  navList.innerHTML = '';
  const curIdx = DATA.findIndex(s=>s.id===activeId);
  navToggleLbl.textContent = searchTerm ? 'Search results' : String(curIdx+1).padStart(2,'0') + ' · ' + DATA[curIdx].title.replace(/<[^>]+>/g,'');
  DATA.forEach((section, idx)=>{
    const done = sectionDone(section), total = section.questions.length;
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (section.id===activeId && !searchTerm ? ' active':'') + (done===total ? ' complete':'');
    btn.innerHTML = '<span class="nav-num">' + String(idx+1).padStart(2,'0') + '</span><span class="nav-label">' + section.title + '</span><span class="nav-count" title="' + done + ' of ' + total + ' reviewed">' + (done ? done + '/' : '') + total + '</span>';
    btn.addEventListener('click', ()=>{ closeNav(); clearSearch(false); activeId = section.id; hideBack(); renderNav(); renderContent(); window.scrollTo(0,0); });
    navList.appendChild(btn);
  });
}

// ---- cards
function highlight(html, terms){
  if(!terms.length) return html;
  let out = html;
  terms.forEach(t=>{
    const safe = t.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&');
    out = out.replace(new RegExp('(^|>)([^<]*)', 'g'), (m, a, b)=> a + b.replace(new RegExp('(' + safe + ')', 'ig'), '<mark>$1</mark>'));
  });
  return out;
}
function buildCard(e, opts){
  opts = opts || {};
  const key = qKey(e.section.id, e.qIdx);
  const isDone = !!reviewed[key];
  const card = document.createElement('div');
  card.className = 'qcard' + (opts.open ? ' open' : '');
  card.dataset.q = e.qIdx;
  card.dataset.sec = e.section.id;
  const core = CORE.has(key);
  const chips = (opts.showSection ? '<span class="qsec">' + e.section.title + '</span>' : '') + (core ? '<span class="qcore" title="Core: linked from ' + window.__STUDY__.core + '">★ core</span>' : '');
  const showSummary = prefs.summaries && e.section.id !== 'review' && e.summary;
  const qhead = document.createElement('div');
  qhead.className = 'qhead';
  qhead.innerHTML =
    '<span class="qcheck ' + (isDone?'done':'') + '" role="checkbox" aria-checked="' + isDone + '" tabindex="0" title="Mark reviewed (x)"></span>' +
    '<span class="qmain"><span class="qtext ' + (isDone?'done-text':'') + '">' + highlight(e.item.q, opts.terms || []) + '</span>' +
    (chips ? '<span class="qchips">' + chips + '</span>' : '') +
    (showSummary ? '<span class="qsum">' + highlight(e.summary.replace(/</g,'&lt;'), opts.terms || []) + '</span>' : '') + '</span>' +
    '<span class="qchevron">›</span>';
  const checkEl = qhead.querySelector('.qcheck');
  const toggleDone = (ev)=>{ ev.stopPropagation(); setDone(card, !reviewed[key]); };
  checkEl.addEventListener('click', toggleDone);
  checkEl.addEventListener('keydown', (ev)=>{ if(ev.key===' '||ev.key==='Enter'){ ev.preventDefault(); toggleDone(ev); } });
  qhead.addEventListener('click', ()=>{ card.classList.toggle('open'); setFocus(card, false); });
  const body = document.createElement('div');
  body.className = 'qbody';
  body.innerHTML = e.item.a;
  enhance(body);
  card.appendChild(qhead);
  card.appendChild(body);
  return card;
}
function setDone(card, val){
  const key = qKey(card.dataset.sec, Number(card.dataset.q));
  reviewed[key] = val;
  writeJSON(STORAGE_KEY, reviewed);
  syncTitle(card.dataset.sec, Number(card.dataset.q), val);
  const c = card.querySelector('.qcheck'), t = card.querySelector('.qtext');
  c.classList.toggle('done', val); c.setAttribute('aria-checked', val); t.classList.toggle('done-text', val);
  updateProgress(); renderNav();
}

// ---- section view
function toolbarHTML(section, shown){
  const words = section.questions.reduce((n,_,i)=> n + entry(section.id,i).words, 0);
  const coreN = section.questions.filter((_,i)=>CORE.has(qKey(section.id,i))).length;
  return '<div class="toolbar">' +
    '<span class="tmeta">~' + minutes(words) + ' min full read' + (coreN && section.id!=='review' ? ' · ' + coreN + ' core' : '') + (shown !== section.questions.length ? ' · showing ' + shown : '') + '</span>' +
    '<span class="tgroup"><button data-act="flash" class="flash-btn">▶ Flashcards</button>' + (listenOk() ? '<button data-act="listen">🔊 Listen</button>' : '') + '<button data-act="expand">Expand all</button><button data-act="collapse">Collapse all</button></span>' +
    '<span class="tgroup">' +
      '<label><input type="checkbox" data-pref="summaries"' + (prefs.summaries?' checked':'') + '> Summaries</label>' +
      (CORE.size ? '<label><input type="checkbox" data-pref="coreOnly"' + (prefs.coreOnly?' checked':'') + '> ★ Core only</label>' : '') +
      '<label><input type="checkbox" data-pref="hideDone"' + (prefs.hideDone?' checked':'') + '> Hide reviewed</label>' +
    '</span></div>';
}
function renderContent(forceIdx){
  stopListen();
  content.innerHTML = '';
  const section = DATA.find(s=>s.id===activeId);
  const idx = DATA.findIndex(s=>s.id===activeId);
  const visible = section.questions.map((_,i)=>i).filter(i=>{
    if(i === forceIdx || section.id === 'review') return true;
    const key = qKey(section.id, i);
    if(prefs.coreOnly && !CORE.has(key)) return false;
    if(prefs.hideDone && reviewed[key]) return false;
    return true;
  });
  const head = document.createElement('div');
  head.className = 'section-head';
  head.innerHTML = '<span class="num">' + String(idx+1).padStart(2,'0') + '</span><h2>' + section.title + '</h2><span class="count">' + sectionDone(section) + ' / ' + section.questions.length + ' reviewed</span>';
  content.appendChild(head);
  const tb = document.createElement('div');
  tb.innerHTML = toolbarHTML(section, visible.length);
  content.appendChild(tb.firstChild);
  if(!visible.length){
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = prefs.coreOnly ? 'No core questions in this section with the current filters. Untick "Core only" to see all.' : 'Everything here is reviewed. Untick "Hide reviewed" to see it again.';
    content.appendChild(empty);
  }
  visible.forEach(i=> content.appendChild(buildCard(entry(section.id, i), { open: section.id === 'review' || !!window.__STUDY__.openAll })));
  const pager = document.createElement('div');
  pager.className = 'pager';
  const prev = DATA[idx-1], next = DATA[idx+1];
  pager.innerHTML = (prev ? '<button data-goto="' + prev.id + '">← ' + prev.title + '</button>' : '<span></span>') + (next ? '<button data-goto="' + next.id + '">' + next.title + ' →</button>' : '<span></span>');
  content.appendChild(pager);
  focusIdx = -1;
}

// ---- search
let searchTerm = '';
const searchInput = document.getElementById('searchInput');
function renderSearch(){
  stopListen();
  const terms = searchTerm.toLowerCase().split(/\s+/).filter(t=>t.length > 1);
  const hits = INDEX.filter(e=> terms.every(t=> e.text.includes(t)))
    .map(e=>({ e, score: terms.reduce((n,t)=> n + (e.item.q.toLowerCase().includes(t) ? 10 : 1), 0) }))
    .sort((a,b)=> b.score - a.score);
  content.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'section-head';
  head.innerHTML = '<span class="num">⌕</span><h2>Search</h2><span class="count">' + hits.length + ' result' + (hits.length===1?'':'s') + '</span>';
  content.appendChild(head);
  if(hits.length){
    const tb = document.createElement('div'); tb.className = 'toolbar';
    tb.innerHTML = '<span class="tmeta">' + (hits.length > 80 ? 'showing the top 80' : 'best matches first') + '</span><span class="tgroup"><button data-act="flash" class="flash-btn">▶ Flashcards from these results</button></span>';
    content.appendChild(tb);
  }
  if(!hits.length){
    const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No questions in this guide match "' + searchTerm + '". Try fewer or shorter words.'; content.appendChild(p);
  }
  hits.slice(0, 80).forEach(h=> content.appendChild(buildCard(h.e, { showSection:true, terms })));
  const gb = document.createElement('div'); gb.id = 'globalHits'; gb.className = 'ghits'; content.appendChild(gb);
  if(GLOBAL) fillGlobal(); else { gb.innerHTML = '<p class="gh-note">Searching the other guides…</p>'; loadGlobal(); }
  focusIdx = -1;
  renderNav();
}
// Other guides: /search-index.json is generated from every guide (items: [page, sectionId, qIdx, sectionTitle, question, summary]).
const PAGE_SLUG = location.pathname.replace(/^\/+|\/+$/g,'').split('/')[0] || '';
const PRIORITY = { 'interview-prep': 2, 'system-design': 1, 'react-training': 1 };   // if several guides carry a question, link the most specific one
const escH = (s)=> String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let GLOBAL = null, globalLoading = false;
function loadGlobal(){
  if(GLOBAL || globalLoading) return;
  globalLoading = true;
  fetch('/search-index.json').then(r=>r.json()).then(j=>{ GLOBAL = j; fillGlobal(); }).catch(()=>{ globalLoading = false; const b = document.getElementById('globalHits'); if(b) b.innerHTML = ''; });
}
function fillGlobal(){
  const box = document.getElementById('globalHits');
  if(!box || !GLOBAL) return;
  const terms = searchTerm.toLowerCase().split(/\s+/).filter(t=>t.length > 1);
  if(!terms.length){ box.innerHTML = ''; return; }
  const local = new Set(INDEX.map(e=>e.tkey));
  const best = new Map();
  GLOBAL.items.forEach(it=>{
    const p = it[0], sid = it[1], qi = it[2], st = it[3], qt = it[4], sum = it[5];
    if(p === PAGE_SLUG) return;
    const tk = titleKey(qt);
    if(local.has(tk)) return;
    const hay = (qt + ' ' + st + ' ' + sum).toLowerCase();
    if(!terms.every(t=> hay.includes(t))) return;
    const score = terms.reduce((n,t)=> n + (qt.toLowerCase().includes(t) ? 10 : 1), 0);
    const prev = best.get(tk);
    if(!prev || (PRIORITY[p]||0) < (PRIORITY[prev.p]||0)) best.set(tk, { p, sid, qi, st, qt, sum, score });
  });
  const all = Array.from(best.values()).sort((a,b)=> b.score - a.score || (PRIORITY[a.p]||0) - (PRIORITY[b.p]||0));
  const list = all.slice(0, 12);
  box.innerHTML = list.length
    ? '<h3 class="gh-head"><span>Also in other guides</span><span>' + (all.length > list.length ? 'top ' + list.length + ' of ' + all.length : all.length) + '</span></h3>' +
      list.map(r=> '<a class="gh" href="/' + r.p + '#' + r.sid + ':' + r.qi + '" target="_top"><span class="gh-t">' + highlight(escH(r.qt), terms) + '</span><span class="gh-m">' + escH(GLOBAL.pages[r.p] || r.p) + ' · ' + escH(r.st) + '</span><span class="gh-s">' + escH(r.sum) + '</span></a>').join('')
    : '';
}
let searchTimer;
searchInput.addEventListener('focus', closeNav);
searchInput.addEventListener('input', ()=>{
  clearTimeout(searchTimer);
  searchTimer = setTimeout(()=>{
    searchTerm = searchInput.value.trim();
    if(searchTerm.length >= 2){ hideBack(); renderSearch(); window.scrollTo(0,0); }
    else if(!searchTerm){ renderNav(); renderContent(); }
  }, 140);
});
function clearSearch(rerender){
  if(!searchTerm && !searchInput.value) return;
  searchTerm = ''; searchInput.value = '';
  if(rerender !== false){ renderNav(); renderContent(); }
}

// ---- navigation between questions, with a Back button
const backBtn = document.getElementById('backBtn');
let returnTo = null;
function hideBack(){ returnTo = null; backBtn.hidden = true; }
function gotoQuestion(id, qIdx, fromLink){
  if(!DATA.find(s=>s.id===id)) return;
  const n0 = (qIdx !== undefined && !isNaN(qIdx)) ? qIdx : undefined;
  // The #section deep link retries its message for a few seconds in case the page was still
  // loading; once we're already showing the target, ignore the repeats instead of re-rendering
  // and re-scrolling under the user every time one arrives.
  if(!fromLink && activeId === id && (n0 === undefined || content.querySelector('.qcard[data-q="' + n0 + '"]')?.classList.contains('open'))) return;
  closeNav();
  if(fromLink){
    returnTo = { id: activeId, search: searchTerm, y: window.scrollY };
    const from = searchTerm ? 'search' : DATA.find(s=>s.id===activeId).title;
    backBtn.textContent = '← Back to ' + from;
    backBtn.hidden = false;
  }
  searchTerm = ''; searchInput.value = '';
  activeId = id;
  const n = (qIdx !== undefined && !isNaN(qIdx)) ? qIdx : undefined;
  renderNav();
  renderContent(n);
  const card = n !== undefined ? content.querySelector('.qcard[data-q="' + n + '"]') : null;
  if(card){ card.classList.add('open'); setFocus(card, true); }
  else window.scrollTo(0,0);
}
backBtn.addEventListener('click', ()=>{
  if(!returnTo) return;
  const r = returnTo; hideBack();
  if(r.search){ searchTerm = r.search; searchInput.value = r.search; renderSearch(); }
  else { activeId = r.id; renderNav(); renderContent(); }
  requestAnimationFrame(()=> window.scrollTo(0, r.y));
});
window.addEventListener('message', (e)=>{
  if(!e.data) return;
  if(e.data.type==='goto-section') gotoQuestion(e.data.id, e.data.qIdx, false);
  else if(e.data.type==='start-weak-deck') startWeakDeck();
  else if(e.data.type==='start-deck') startKeyDeck(e.data.keys, e.data.title);
});
content.addEventListener('click', (e)=>{
  const a = e.target.closest('a[data-go]');
  if(a){ e.preventDefault(); const [id, q] = a.dataset.go.split(':'); gotoQuestion(id, Number(q), true); return; }
  const g = e.target.closest('button[data-goto]');
  if(g){ activeId = g.dataset.goto; hideBack(); renderNav(); renderContent(); window.scrollTo(0,0); return; }
  const act = e.target.closest('button[data-act]');
  if(act){
    if(act.dataset.act === 'listen'){ startListen(); return; }
    if(act.dataset.act === 'flash'){ startDeck(deckFromView(), searchTerm ? 'Search: ' + searchTerm : DATA.find(s=>s.id===activeId).title); return; }
    content.querySelectorAll('.qcard').forEach(c=> c.classList.toggle('open', act.dataset.act === 'expand'));
  }
});
content.addEventListener('change', (e)=>{
  const p = e.target.dataset && e.target.dataset.pref;
  if(!p) return;
  prefs[p] = e.target.checked; savePrefs();
  if(searchTerm) renderSearch(); else renderContent();
});

// ---- keyboard: / search, j/k move, o or Enter open, x reviewed, n/p section, Esc
let focusIdx = -1;
function cards(){ return Array.from(content.querySelectorAll('.qcard')); }
function setFocus(card, scroll){
  cards().forEach(c=> c.classList.remove('focused'));
  card.classList.add('focused');
  focusIdx = cards().indexOf(card);
  if(scroll) card.scrollIntoView({ block:'start', behavior:'smooth' });
}
document.addEventListener('keydown', (e)=>{
  if(fc.open){ fcKey(e); return; }
  if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); closeNav(); searchInput.focus(); searchInput.select(); return; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if(e.key === 'Escape'){ if(searchTerm || searchInput.value){ clearSearch(); } searchInput.blur(); return; }
  if(typing || e.metaKey || e.ctrlKey || e.altKey) return;
  const list = cards();
  if(e.key === '/'){ e.preventDefault(); searchInput.focus(); searchInput.select(); return; }
  if(e.key === 'j' || e.key === 'k'){
    if(!list.length) return;
    focusIdx = Math.max(0, Math.min(list.length - 1, focusIdx + (e.key === 'j' ? 1 : -1)));
    setFocus(list[focusIdx], true); return;
  }
  const cur = list[focusIdx];
  if((e.key === 'o' || e.key === 'Enter') && cur){ cur.classList.toggle('open'); return; }
  if(e.key === 'x' && cur){ setDone(cur, !reviewed[qKey(cur.dataset.sec, Number(cur.dataset.q))]); return; }
  if(e.key === 'n' || e.key === 'p'){
    if(searchTerm) return;
    const i = DATA.findIndex(s=>s.id===activeId) + (e.key === 'n' ? 1 : -1);
    if(DATA[i]){ activeId = DATA[i].id; hideBack(); renderNav(); renderContent(); window.scrollTo(0,0); }
  }
});


// ---- flashcards: question first, say the answer, reveal, rate yourself
const fcEl = document.getElementById('fc');
const fc = { open:false, deck:[], i:0, revealed:false, got:0, missed:[], again:new Map(), title:'', source:[] };
function shuffleArr(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function startDeck(entries, title){
  stopListen();
  if(!entries.length) return;
  fc.source = entries.slice();
  fc.deck = prefs.shuffle ? shuffleArr(entries.slice()) : entries.slice();
  fc.i = 0; fc.revealed = false; fc.got = 0; fc.missed = []; fc.again = new Map(); fc.title = title; fc.open = true;
  fc.opener = document.activeElement;   // restore focus here when the dialog closes
  fcEl.querySelector('#fcShuffle').checked = !!prefs.shuffle;
  fcEl.hidden = false; document.body.classList.add('fc-lock');
  renderFc();
  fcEl.querySelector('.fc-dialog').focus();
}
function closeFc(){
  fc.open = false; fcEl.hidden = true; document.body.classList.remove('fc-lock');
  refreshWeakButton();
  const opener = fc.opener; fc.opener = null;
  if(searchTerm) renderSearch(); else renderContent();   // rebuilds #content, so `opener` may now be a detached node
  // Return focus to whatever opened the deck when it's still on the page (the hero "Flashcards"
  // buttons, outside #content, always survive this). Otherwise #content was just rebuilt under
  // the (now-detached) opener, so land on its heading instead of silently losing focus to <body>.
  if(opener && document.contains(opener)) opener.focus();
  else {
    const heading = content.querySelector('.section-head h2') || content.querySelector('.section-head');
    if(heading){ heading.setAttribute('tabindex', '-1'); heading.focus(); }
  }
}
function markReviewed(key, val){ reviewed[key] = val; writeJSON(STORAGE_KEY, reviewed); const p = key.split(':'); syncTitle(p[0], Number(p[1]), val); updateProgress(); renderNav(); }
function renderFc(){
  const n = fc.deck.length;
  fcEl.querySelector('.fc-title').textContent = fc.title;
  fcEl.querySelector('.fc-count').textContent = (fc.i < n ? (fc.i + 1) : n) + ' / ' + n + (fc.got ? ' · ' + fc.got + ' got it' : '') + (fc.missed.length ? ' · ' + new Set(fc.missed).size + ' to revisit' : '');
  fcEl.querySelector('.fc-bar i').style.width = (n ? fc.i / n * 100 : 0) + '%';
  const body = fcEl.querySelector('.fc-body');
  const actions = fcEl.querySelector('.fc-actions');
  if(fc.i >= n){
    const uniqMissed = Array.from(new Set(fc.missed));
    body.innerHTML = '<div class="fc-done"><h3>Deck finished</h3><p>' + fc.got + ' marked "got it" (and ticked as reviewed) · ' + uniqMissed.length + ' to revisit.</p>' +
      (uniqMissed.length ? '<p class="fc-sub">To revisit:</p><ul>' + uniqMissed.map(e=>'<li>' + e.item.q + '</li>').join('') + '</ul>' : '<p class="fc-sub">Nothing missed. Well done.</p>') + '</div>';
    actions.innerHTML = (uniqMissed.length ? '<button data-fc="missed" class="primary">Practise the ' + uniqMissed.length + ' missed</button>' : '') +
      '<button data-fc="restart">Restart deck</button><button data-fc="close">Close <kbd>Esc</kbd></button>';
    return;
  }
  const e = fc.deck[fc.i];
  const key = qKey(e.section.id, e.qIdx);
  body.innerHTML = '<div class="qchips"><span class="qsec">' + e.section.title + '</span>' + (CORE.has(key) ? '<span class="qcore">★ core</span>' : '') + (reviewed[key] ? '<span class="qsec">reviewed</span>' : '') + '</div>' +
    '<h3 class="fc-q">' + e.item.q + '</h3>' +
    (fc.revealed ? '<div class="qbody fc-a">' + e.item.a + '</div>' : '<p class="fc-prompt">Answer it out loud first: the main point, one example, one trade-off. Then reveal.</p>');
  enhance(body);
  body.scrollTop = 0;
  actions.innerHTML = fc.revealed
    ? '<button data-fc="prev" title="Previous (←)">←</button><button data-fc="again" class="again">Again <kbd>1</kbd></button><button data-fc="got" class="primary">Got it <kbd>2</kbd></button>'
    : '<button data-fc="prev" title="Previous (←)">←</button><button data-fc="reveal" class="primary">Reveal answer <kbd>Space</kbd></button><button data-fc="skip">Skip <kbd>→</kbd></button>';
}
function fcAction(act){
  const n = fc.deck.length, e = fc.deck[fc.i];
  if(act === 'close') return closeFc();
  if(act === 'restart') return startDeck(fc.source, fc.title);
  if(act === 'missed') return startDeck(Array.from(new Set(fc.missed)), fc.title + ' · missed');
  if(fc.i >= n && act !== 'prev') return;
  if(act === 'reveal'){ fc.revealed = !fc.revealed; }
  else if(act === 'got'){ if(!fc.revealed){ fc.revealed = true; } else { markReviewed(qKey(e.section.id, e.qIdx), true); markWeak(e.tkey, false); fc.got++; fc.i++; fc.revealed = false; } }
  else if(act === 'again'){
    if(!fc.revealed){ fc.revealed = true; }
    else {
      const k = qKey(e.section.id, e.qIdx), times = fc.again.get(k) || 0;
      fc.missed.push(e);
      markWeak(e.tkey, true);
      if(times < 2){ fc.deck.push(e); fc.again.set(k, times + 1); }   // comes back later in this session
      fc.i++; fc.revealed = false;
    }
  }
  else if(act === 'skip'){ fc.i++; fc.revealed = false; }
  else if(act === 'prev'){ if(fc.i > 0){ fc.i--; fc.revealed = false; } }
  renderFc();
}
fcEl.addEventListener('click', (e)=>{
  if(e.target === fcEl) return closeFc();
  const b = e.target.closest('button[data-fc]');
  if(b) return fcAction(b.dataset.fc);
  const a = e.target.closest('a[data-go]');
  if(a){ e.preventDefault(); closeFc(); const p = a.dataset.go.split(':'); gotoQuestion(p[0], Number(p[1]), true); }
});
fcEl.querySelector('#fcShuffle').addEventListener('change', (e)=>{
  prefs.shuffle = e.target.checked; savePrefs();
  const keep = fc.i + (fc.revealed ? 1 : 0);
  const rest = fc.deck.slice(keep);
  if(prefs.shuffle) shuffleArr(rest);
  fc.deck = fc.deck.slice(0, keep).concat(rest);
  renderFc();
});
function fcFocusables(){
  return Array.from(fcEl.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])')).filter((el) => !el.disabled && el.offsetParent !== null);
}
function fcKey(e){
  if(e.key === 'Escape'){ e.preventDefault(); closeFc(); return; }
  if(e.key === 'Tab'){
    // trap focus inside the dialog: wrap from the last focusable back to the first, and vice versa
    const items = fcFocusables();
    if(!items.length) return;
    const idx = items.indexOf(document.activeElement);
    const next = e.shiftKey ? (idx <= 0 ? items.length - 1 : idx - 1) : (idx === items.length - 1 ? 0 : idx + 1);
    e.preventDefault();
    items[next].focus();
    return;
  }
  if(e.target && e.target.id === 'fcShuffle') return;
  const map = { ' ':'reveal', 'Enter':'reveal', '1':'again', '2':'got', 'ArrowRight':'skip', 'ArrowLeft':'prev' };
  const act = map[e.key];
  if(!act) return;
  if(e.target && e.target.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;   // let a focused button click itself
  e.preventDefault();
  if(fc.i >= fc.deck.length && act !== 'prev') return;
  fcAction(act);
}
function deckFromView(){ return cards().map(c=> entry(c.dataset.sec, Number(c.dataset.q))); }
document.getElementById('fcCore').addEventListener('click', ()=>{
  if(CORE.size) startDeck(Array.from(CORE).map(k=>{ const p = k.split(':'); return entry(p[0], Number(p[1])); }).filter(Boolean), 'All ★ core questions');
  else startDeck(INDEX.filter(e=>e.section.id!=='quickref'), 'All questions');
});

// ---- weak cards: any card marked "Again" (anywhere, including another guide), still unresolved
const fcWeakBtn = document.getElementById('fcWeak');
function weakOnThisGuide(){ return INDEX.filter(e=> weak[e.tkey]); }
function refreshWeakButton(){
  if(!fcWeakBtn) return;
  const n = weakOnThisGuide().length;
  fcWeakBtn.hidden = n === 0;
  fcWeakBtn.textContent = '↻ Review ' + n + ' weak card' + (n===1?'':'s');
}
function startWeakDeck(){
  if(fc.open) return;   // the #weak deep link retries its message for a few seconds; ignore repeats once the deck is open, or every retry would reset the user's progress in it
  const list = weakOnThisGuide();
  if(list.length) startDeck(list, 'Weak cards');
}
if(fcWeakBtn) fcWeakBtn.addEventListener('click', startWeakDeck);
// A deck named by card keys ("sec:idx"), opened from a link such as /sql#deck=sq1:0,sq1:1. The link's
// message is posted repeatedly for a few seconds, so ignore it once a deck is open; unknown keys are dropped.
function startKeyDeck(keys, title){
  if(fc.open || !Array.isArray(keys)) return;
  const list = keys.map(k=>{ const p = String(k).split(':'); return entry(p[0], Number(p[1])); }).filter(Boolean);
  if(list.length) startDeck(list, title || 'Your deck');
}
refreshWeakButton();
window.addEventListener('storage', (e)=>{ if(e.key === WEAK_KEY){ weak = readJSON(WEAK_KEY, {}); refreshWeakButton(); } });

document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(!confirm('Clear all reviewed checkmarks?')) return;
  reviewed = {}; writeJSON(STORAGE_KEY, reviewed);
  INDEX.forEach(e=>{ delete titleDone[e.tkey]; }); writeJSON(TITLES_KEY, titleDone);
  renderNav(); renderContent(); updateProgress();
});

document.getElementById('heroMeta').textContent = DATA.length + ' sections · ' + totalQuestions() + ' questions' + (CORE.size ? ' · ' + CORE.size + ' marked ★ core (linked from ' + window.__STUDY__.core + ')' : '');
document.getElementById('fcCore').textContent = CORE.size ? '▶ Flashcards: all ★ core questions' : '▶ Flashcards: all ' + INDEX.filter(e=>e.section.id!=='quickref').length + ' questions';
// ---- solo:start
// /study/<guide>.html?card=sec:idx shows just that one card, so a page elsewhere on the site (a mock
// round, a plan) can embed a card in an iframe. The frame is told how tall the card is.
function soloKey(search){ const m = /[?&]card=([^&#]+)/.exec(search || ''); return m ? decodeURIComponent(m[1]) : null; }
function soloRender(key){
  document.documentElement.classList.add('solo');
  content.innerHTML = '';
  const p = key.split(':');
  const e = entry(p[0], Number(p[1]));
  if(!e){ const m = document.createElement('p'); m.className = 'empty'; m.textContent = 'This card has moved.'; content.appendChild(m); }
  else content.appendChild(buildCard(e, { open: true }));
  const post = ()=>{ try{ parent.postMessage({ type:'solo-height', card:key, height: Math.ceil(content.getBoundingClientRect().height) }, '*'); }catch(_){} };
  if(window.ResizeObserver) new ResizeObserver(post).observe(content);
  post();
}
// ---- solo:end
initListen();
const SOLO = soloKey(location.search);
if(SOLO){ soloRender(SOLO); updateProgress(); }
else { renderNav(); renderContent(); updateProgress(); }
