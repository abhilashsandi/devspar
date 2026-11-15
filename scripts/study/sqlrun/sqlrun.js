// The in-browser SQL runner: a box under a puzzle where the reader writes a query, runs it against the guide's
// practice database (PGlite in a worker, see worker.js), checks it against the solution, and reads the plan.
// Loaded only when a reader presses "Try it here". One worker is shared by every runner in the document.
import { sameResult, REASONS, cell } from './compare.mjs';
import { planTree, FLAG_TEXT } from './explain.mjs';

const NOTE = 'This is PostgreSQL running in your browser: one process, no parallel workers, so plans and timings differ from a server’s. Every run is rolled back, so the data never changes.';

let worker = null, ready = null, info = null, nextId = 1;
const pending = new Map();
const runners = new Set();

function request(op, payload) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, op, ...payload });
  });
}
function failAll(err) {
  for (const p of pending.values()) p.reject(err);
  pending.clear();
}
function statusAll(text) { runners.forEach((r) => r.status(text)); }
function readyText() {
  return 'Ready: ' + info.version.split(' ').slice(0, 2).join(' ') + ' in your browser' + (info.note ? ' · ' + info.note : '');
}
function spawn() {
  worker = new Worker('/study/sqlrun/worker.js', { type: 'module' });
  worker.onmessage = (ev) => {
    const d = ev.data;
    if (d.progress) { statusAll(d.progress); return; }
    const p = pending.get(d.id);
    if (!p) return;
    pending.delete(d.id);
    if (d.ok) p.resolve(d); else p.reject(new Error(d.error));
  };
  worker.onerror = (ev) => failAll(new Error(ev.message || 'The SQL engine could not start.'));
  ready = request('init').then((r) => { info = r; statusAll(readyText()); return r; });
  ready.catch(() => {});
}
function stop() {
  worker.terminate();
  const err = new Error('Stopped.'); err.stopped = true;
  failAll(err);
  spawn();
}

const h = (tag, props, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v);
  }
  for (const k of kids) if (k) e.append(k);
  return e;
};

function table(res) {
  const t = h('table', { class: 'cmp' });
  t.append(h('tr', {}, ...res.fields.map((f) => h('th', { text: f }))));
  for (const row of res.rows) t.append(h('tr', {}, ...row.map((v) => {
    const td = h('td');
    if (v === null || v === undefined) td.append(h('i', { text: 'NULL' })); else td.textContent = cell(v);
    return td;
  })));
  const wrap = h('div', { class: 'tscroll' }, t);
  const n = res.total;
  const foot = h('p', { class: 'sqlr-foot', text: res.rows.length < n ? `showing ${res.rows.length} of ${n}` : `${n} row${n === 1 ? '' : 's'}` });
  return h('div', { class: 'sqlr-result' }, wrap, foot);
}

function planList(n) {
  const li = h('li');
  const row = h('div', { class: 'plan-row' },
    h('b', { text: n.type }), n.target ? h('span', { class: 'plan-target', text: ' ' + n.target }) : null,
    h('span', { class: 'plan-meta', text: `rows ${n.estRows} est → ${n.rows} actual · ${n.selfMs.toFixed(1)} ms` }));
  const bar = h('i', { class: 'plan-bar' });
  bar.style.width = Math.max(2, Math.round(n.share * 100)) + '%';
  li.append(row, bar);
  for (const f of n.flags) li.append(h('p', { class: 'plan-flag', text: FLAG_TEXT[f] }));
  if (n.children.length) li.append(h('ul', { class: 'plan' }, ...n.children.map(planList)));
  return li;
}

/** @param {HTMLElement} el @param {{solution: string|null, ordered: boolean}} opts */
export function mount(el, opts) {
  if (!worker) spawn();
  el.textContent = '';
  const statusEl = h('p', { class: 'sqlr-status', role: 'status', text: info ? readyText() : 'Downloading PostgreSQL…' });
  const area = h('textarea', { class: 'sqlr-sql', 'aria-label': 'SQL', rows: '6', spellcheck: 'false', placeholder: 'Write your query here. Ctrl+Enter runs it.' });
  const btn = (text, cls) => { const b = h('button', { type: 'button', class: cls || '', text }); return b; };
  const run = btn('Run', 'sqlr-primary');
  const check = opts.solution ? btn('Check against the solution') : null;
  const explain = btn('Explain');
  const stopBtn = btn('Stop'); stopBtn.hidden = true;
  const reset = btn('Reset data');
  const out = h('div', { class: 'sqlr-out', 'aria-live': 'polite' });
  el.append(statusEl, area, h('div', { class: 'sqlr-bar' }, run, check, explain, stopBtn, reset), out, h('p', { class: 'sqlr-note', text: NOTE }));

  const me = { status: (t) => { statusEl.textContent = t; } };
  runners.add(me);
  const buttons = [run, check, explain, reset].filter(Boolean);
  const busy = (on) => { buttons.forEach((b) => { b.disabled = on; }); stopBtn.hidden = !on; };
  const fail = (e) => {
    busy(false);
    if (e && e.stopped) { statusEl.textContent = 'Stopped.'; out.textContent = ''; out.append(h('p', { class: 'sqlr-foot', text: 'Stopped.' })); return; }
    out.textContent = '';
    out.append(h('div', { class: 'sqlr-error', role: 'alert', text: (e && e.message) || String(e) }));
    statusEl.textContent = info ? readyText() : 'The SQL engine could not start.';
  };
  const after = (r) => { statusEl.textContent = r.changed ? 'The data has changed. Press Reset data to restore it.' : readyText(); };
  const go = async (op, sql) => { busy(true); statusEl.textContent = 'Running…'; await ready; return request(op, { sql }); };
  const lastSet = (results) => { for (let i = results.length - 1; i >= 0; i--) if (results[i].fields.length) return results[i]; return null; };

  async function doRun() {
    const sql = area.value.trim();
    if (!sql) return;
    try {
      const r = await go('run', sql);
      out.textContent = '';
      for (const res of r.results) {
        if (res.fields.length) out.append(table(res));
        else out.append(h('p', { class: 'sqlr-foot', text: res.affected ? `Done: ${res.affected} row${res.affected === 1 ? '' : 's'} affected.` : 'Done.' }));
      }
      busy(false); after(r);
    } catch (e) { fail(e); }
  }
  async function doCheck() {
    const sql = area.value.trim();
    if (!sql) return;
    try {
      const mine = await go('run', sql);
      const theirs = await request('run', { sql: opts.solution });
      const m = lastSet(mine.results), t = lastSet(theirs.results);
      out.textContent = '';
      if (m) out.append(table(m));
      let verdict;
      if (!m) verdict = { ok: false, text: 'Your query returned no result set.' };
      else if (!t) verdict = { ok: false, text: 'The solution returned no result set to compare with.' };
      else {
        const r = m.total !== t.total ? { ok: false, reason: 'row-count' } : sameResult(m, t, opts.ordered);
        verdict = r.ok ? { ok: true, text: 'Matches the solution.' } : { ok: false, text: REASONS[r.reason] };
      }
      out.append(h('p', { class: 'sqlr-verdict ' + (verdict.ok ? 'sqlr-ok' : 'sqlr-bad'), text: verdict.text }));
      busy(false); after(mine.changed ? mine : theirs);
    } catch (e) { fail(e); }
  }
  async function doExplain() {
    const sql = area.value.trim();
    if (!sql) return;
    if (/;\s*\S/.test(sql)) { out.textContent = ''; out.append(h('p', { class: 'sqlr-foot', text: 'Explain works on a single statement.' })); return; }
    try {
      const r = await go('explain', sql);
      out.textContent = '';
      out.append(h('ul', { class: 'plan plan-root' }, planList(planTree(r.plan))));
      busy(false); after(r);
    } catch (e) { fail(e); }
  }
  async function doReset() {
    try {
      busy(true); statusEl.textContent = 'Loading the practice data…';
      await ready; await request('reset', {});
      out.textContent = ''; busy(false); statusEl.textContent = readyText();
    } catch (e) { fail(e); }
  }

  run.addEventListener('click', doRun);
  if (check) check.addEventListener('click', doCheck);
  explain.addEventListener('click', doExplain);
  reset.addEventListener('click', doReset);
  stopBtn.addEventListener('click', stop);
  area.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doRun(); } });
  ready.catch((e) => fail(e));
}
