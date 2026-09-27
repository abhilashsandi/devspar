// ---------- render ----------
const navList = document.getElementById('navList');
const content = document.getElementById('content');
let activeId = DATA[0].id;
const sidebarEl = document.getElementById('sidebar');
const navToggle = document.getElementById('navToggle');
const navToggleLbl = document.getElementById('navToggleLbl');
function closeNav(){ sidebarEl.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }
navToggle.addEventListener('click', ()=>{ const o = sidebarEl.classList.toggle('open'); navToggle.setAttribute('aria-expanded', String(o)); });
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
    const prose = stripTags(item.a.replace(/<span class="tbadge">[\s\S]*?<\/span>/,'').replace(/<table[\s\S]*?<\/table>/g,' ').replace(/<div class="diagram">[\s\S]*?<\/div>/g,' '));
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
    '<span class="tgroup"><button data-act="flash" class="flash-btn">▶ Flashcards</button><button data-act="expand">Expand all</button><button data-act="collapse">Collapse all</button></span>' +
    '<span class="tgroup">' +
      '<label><input type="checkbox" data-pref="summaries"' + (prefs.summaries?' checked':'') + '> Summaries</label>' +
      (CORE.size ? '<label><input type="checkbox" data-pref="coreOnly"' + (prefs.coreOnly?' checked':'') + '> ★ Core only</label>' : '') +
      '<label><input type="checkbox" data-pref="hideDone"' + (prefs.hideDone?' checked':'') + '> Hide reviewed</label>' +
    '</span></div>';
}
function renderContent(forceIdx){
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
  visible.forEach(i=> content.appendChild(buildCard(entry(section.id, i), { open: section.id === 'review' })));
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
});
content.addEventListener('click', (e)=>{
  const a = e.target.closest('a[data-go]');
  if(a){ e.preventDefault(); const [id, q] = a.dataset.go.split(':'); gotoQuestion(id, Number(q), true); return; }
  const g = e.target.closest('button[data-goto]');
  if(g){ activeId = g.dataset.goto; hideBack(); renderNav(); renderContent(); window.scrollTo(0,0); return; }
  const act = e.target.closest('button[data-act]');
  if(act){
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
renderNav();
renderContent();
updateProgress();
