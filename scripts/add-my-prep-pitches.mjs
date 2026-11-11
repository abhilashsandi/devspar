// Adds (or replaces) the "Phone-Screen Pitches" section in the encrypted /my-prep page.
// The pitches live in private/pitches.mjs, which is git-ignored and never committed in plain text.
//
//   PRIVATE_PASSWORD='...' node scripts/add-my-prep-pitches.mjs     decrypt, merge, re-encrypt
//   node scripts/add-my-prep-pitches.mjs --preview                   no password: writes
//        private/pitches-preview.html (pitches only) to read locally; nothing is encrypted or changed
//
// Same format as scripts/encrypt-private.mjs: PBKDF2-SHA256 -> AES-256-GCM (auth tag appended).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadData } from './study/parsePage.mjs';
import * as lib from './study/lib.mjs';
import * as H from './study/helpers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'private', 'pitches.mjs');
const ENC = path.join(ROOT, 'app', 'my-prep', 'private.enc.json');
if (!existsSync(SRC)) { console.error('missing ' + SRC); process.exit(1); }
const { pitchesSection } = await import('file://' + SRC.replace(/\\/g, '/'));

if (process.argv.includes('--preview')) {
  const html = await H.newPage({
    key: 'pitches-preview', openAll: true, title: 'Phone-Screen Pitches (preview)', brand: 'My Prep', brandSub: 'pitches preview',
    h1: 'Phone-screen pitches', eyebrow: 'Private preview', lede: 'Local preview only. Not published anywhere.',
  }, [pitchesSection]);
  const out = path.join(ROOT, 'private', 'pitches-preview.html');
  const full = await lib.upgrade(html);
  writeFileSync(out, full);
  console.log('preview written -> ' + out);
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
const at = data.findIndex((s) => s.id === pitchesSection.id);
if (at >= 0) data[at] = pitchesSection; else data.unshift(pitchesSection);
const updated = lib.withData(html, data);

const salt = randomBytes(16), iv = randomBytes(12);
const k2 = pbkdf2Sync(password, salt, payload.iter, 32, 'sha256');
const c = createCipheriv('aes-256-gcm', k2, iv);
const ct = Buffer.concat([c.update(updated, 'utf8'), c.final(), c.getAuthTag()]);
writeFileSync(ENC, JSON.stringify({ v: 1, iter: payload.iter, salt: salt.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') }));
console.log((at >= 0 ? 'replaced' : 'added') + ' "' + pitchesSection.title + '" (' + pitchesSection.questions.length + ' cards); ' + data.length + ' sections now in /my-prep');
