// The SQL runner's database: PGlite (PostgreSQL compiled to WebAssembly) in a module Web Worker.
// Messages in: { id, op: 'init' | 'run' | 'explain' | 'reset', sql? }. Replies echo the id; progress messages
// ({ progress: text }) carry none. Every run happens inside a transaction that is rolled back, so the practice
// data never changes. The data lives in IndexedDB so the 200,000-row seed is loaded once per browser.
const PGLITE = '0.5.16';                              // keep in step with package.json (scripts/study/vendor-pglite.mjs copies this folder)
const BASE = '/vendor/pglite-' + PGLITE + '/';
const IDB = 'idb://devspar-sql-lab-v1';
const MAX_ROWS = 200;
const EXPECT = [12, 6, 200000];                       // employees, contacts, orders: how we know the data is intact

let db = null, persisted = false, version = '', note = '';

const say = (text) => self.postMessage({ progress: text });

async function holdStoreLock() {
  // one tab at a time may use the saved data; a second tab gets a temporary copy instead of corrupting it
  if (!self.navigator || !navigator.locks) return true;
  return new Promise((resolve) => {
    navigator.locks.request('devspar-sql-lab', { ifAvailable: true }, (lock) => {
      if (!lock) { resolve(false); return undefined; }
      resolve(true);
      return new Promise(() => {});                   // hold it until this worker is terminated
    });
  });
}

async function open() {
  say('Downloading PostgreSQL…');
  const { PGlite } = await import(BASE + 'index.js');
  const { btree_gist } = await import(BASE + 'contrib/btree_gist.js');
  const extensions = { btree_gist };
  const mine = await holdStoreLock();
  if (mine) {
    try {
      db = await PGlite.create(IDB, { extensions });
      persisted = true;
    } catch (e) {
      db = null;
      note = 'Saved data could not be opened, so this visit uses a temporary copy.';
    }
  } else note = 'Another tab is using the saved data, so this tab uses a temporary copy.';
  if (!db) db = await PGlite.create({ extensions });
  version = (await db.query('select version() as v')).rows[0].v;
}

async function seeded() {
  const t = await db.query("select to_regclass('public.lab_meta') is not null as ok");
  if (!t.rows[0].ok) return false;
  return (await db.query('select count(*)::int as n from lab_meta where seed = 1')).rows[0].n === 1;
}

async function seed() {
  say('Loading the practice data…');
  await db.exec('drop schema if exists public cascade; create schema public;');
  const text = await (await fetch('/study/sqlrun/seed.sql')).text();
  await db.exec(text);
  await db.exec('create table lab_meta (seed int); insert into lab_meta values (1);');   // written last: a half-loaded seed is not marked
  await db.exec("set timezone = 'UTC'");
}

async function intact() {
  try {
    const r = await db.query('select (select count(*) from employees)::int as a, (select count(*) from contacts)::int as b, (select count(*) from orders)::int as c');
    const row = r.rows[0];
    return row.a === EXPECT[0] && row.b === EXPECT[1] && row.c === EXPECT[2];
  } catch (e) { return false; }
}

function shape(r) {
  const fields = (r.fields || []).map((f) => f.name);
  return { fields, rows: fields.length ? r.rows.slice(0, MAX_ROWS) : [], total: fields.length ? r.rows.length : 0, affected: r.affectedRows || 0 };
}

async function inRollback(fn) {
  await db.exec("begin; set local timezone = 'UTC'");
  try { return await fn(); }
  finally { try { await db.exec('rollback'); } catch (e) { /* already ended */ } }
}

const handlers = {
  async init() {
    await open();
    if (!(await seeded())) await seed();
    return { version, persisted, note };
  },
  async run({ sql }) {
    const results = await inRollback(async () => (await db.exec(sql, { rowMode: 'array' })).map(shape));
    return { results, changed: !(await intact()) };
  },
  async explain({ sql }) {
    const stmt = sql.trim().replace(/;\s*$/, '');
    const plan = await inRollback(async () => {
      const r = await db.query('explain (analyze, format json) ' + stmt, [], { rowMode: 'array' });
      const v = r.rows[0][0];
      return typeof v === 'string' ? JSON.parse(v) : v;
    });
    return { plan, changed: !(await intact()) };
  },
  async reset() {
    await seed();
    return {};
  },
};

// one request at a time: a run is begin ... rollback, and two of them must never interleave
let chain = Promise.resolve();
self.onmessage = (ev) => {
  chain = chain.then(async () => {
    const { id, op, ...rest } = ev.data;
    try {
      const out = await handlers[op](rest);
      self.postMessage({ id, ok: true, ...out });
    } catch (e) {
      self.postMessage({ id, ok: false, error: (e && e.message) || String(e) });
    }
  });
};
