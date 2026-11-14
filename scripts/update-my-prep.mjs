// Updates the encrypted /my-prep page from the private sources in private/ (git-ignored):
//   private/experience.mjs   "Talking About Your Experience" (resume walk-through, project deep-dives, behavioural)
//   private/pitches.mjs      "Phone-Screen Pitches"
// It decrypts app/my-prep/private.enc.json, replaces (or adds) those sections, applies the current shared
// theme and engine, and encrypts it again. Sections it does not own are left exactly as they are.
//
//   PRIVATE_PASSWORD='...' node scripts/update-my-prep.mjs      decrypt, merge, restyle, re-encrypt
//   node scripts/update-my-prep.mjs --preview                    no password: writes private/my-prep-preview.html
//        (the private sections only) to read locally; nothing is decrypted, encrypted or published
//
// Same format as scripts/encrypt-private.mjs: PBKDF2-SHA256 -> AES-256-GCM (auth tag appended).
// Never commit private/ or the password.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { loadData } from './study/parsePage.mjs';
import * as lib from './study/lib.mjs';
import * as H from './study/helpers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENC = path.join(ROOT, 'app', 'my-prep', 'private.enc.json');
// Order here is the order they appear at the top of the page.
const SOURCES = [['experience.mjs', 'experienceSection'], ['pitches.mjs', 'pitchesSection']];

const sections = [];
for (const [file, name] of SOURCES) {
  const src = path.join(ROOT, 'private', file);
  if (!existsSync(src)) { console.error('missing ' + src); process.exit(1); }
  const mod = await import(pathToFileURL(src).href);
  if (!mod[name]) { console.error(file + ' does not export ' + name); process.exit(1); }
  sections.push(mod[name]);
}
const left = sections.flatMap((s) => s.questions.filter((q) => /\[fill in/.test(q.a)).map((q) => q.q.replace(/<[^>]+>/g, '')));

if (process.argv.includes('--preview')) {
  const html = await H.newPage({
    key: 'my-prep-preview', title: 'My Prep (preview)', brand: 'My Prep', brandSub: 'private preview',
    h1: 'My prep: private sections', eyebrow: 'Private preview', lede: 'Local preview only. Not published anywhere.',
  }, sections);
  const out = path.join(ROOT, 'private', 'my-prep-preview.html');
  writeFileSync(out, await lib.upgrade(html));
  console.log('preview written -> ' + out + '  (' + sections.map((s) => s.title + ': ' + s.questions.length).join(', ') + ')');
  console.log(left.length + ' card(s) still contain [fill in] placeholders');
  process.exit(0);
}

const password = process.env.PRIVATE_PASSWORD;
if (!password) { console.error('set PRIVATE_PASSWORD (the /my-prep password), or use --preview'); process.exit(1); }

const payload = JSON.parse(readFileSync(ENC, 'utf8'));
const b = (s) => Buffer.from(s, 'base64');
const key = pbkdf2Sync(password, b(payload.salt), payload.iter, 32, 'sha256');
const raw = b(payload.ct);
let html;
try {
  const d = createDecipheriv('aes-256-gcm', key, b(payload.iv));
  d.setAuthTag(raw.subarray(raw.length - 16));
  html = Buffer.concat([d.update(raw.subarray(0, raw.length - 16)), d.final()]).toString('utf8');
} catch {
  console.error('wrong password (could not decrypt private.enc.json)'); process.exit(1);
}

const data = loadData(html);
const ours = new Set(sections.map((s) => s.id));
const rest = data.filter((s) => !ours.has(s.id));
let updated = lib.withData(html, [...sections, ...rest]);
try {
  updated = await lib.upgrade(updated);   // current theme, fonts and engine
} catch (e) {
  console.warn('kept the page\'s existing styling (could not apply the shared theme: ' + e.message + ')');
}

const salt = randomBytes(16), iv = randomBytes(12);
const k2 = pbkdf2Sync(password, salt, payload.iter, 32, 'sha256');
const c = createCipheriv('aes-256-gcm', k2, iv);
const ct = Buffer.concat([c.update(updated, 'utf8'), c.final(), c.getAuthTag()]);
writeFileSync(ENC, JSON.stringify({ v: 1, iter: payload.iter, salt: salt.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') }));
console.log('my-prep updated: ' + sections.map((s) => s.title + ' (' + s.questions.length + ')').join(', ') + '; ' + rest.length + ' other section(s) kept');
console.log(left.length + ' card(s) still contain [fill in] placeholders');
