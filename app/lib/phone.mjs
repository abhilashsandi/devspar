// Phone-screen answers for a job posting. The answers themselves ("pitches") are the reader's own and live
// only in the encrypted My Prep payload; this module just chooses which ones a posting needs. It never
// writes an answer: a skill with no pitch is reported as missing, with a frame the reader fills in.

/** @typedef {{id: string, title: string, say: string, probes: string[], verify: string, skills?: string[], role?: 'fullstack'|'frontend'|'backend', always?: boolean}} Pitch */

const FRONT = new Set(['javascript', 'typescript', 'react', 'nextjs', 'css', 'tailwind', 'a11y', 'state', 'bundlers', 'angular', 'vue', 'svelte', 'mobile']);
const BACK = new Set(['node', 'sql', 'nosql', 'caching', 'rest', 'graphql', 'messaging', 'system-design', 'architecture', 'python', 'java', 'golang', 'dotnet', 'php', 'ruby', 'rust']);

/** Which kind of role the posting describes, from the skills found in it. */
export function roleFor(ids) {
  const front = ids.some((id) => FRONT.has(id)), back = ids.some((id) => BACK.has(id));
  return front && !back ? 'frontend' : back && !front ? 'backend' : 'fullstack';
}

const list = (labels) => (labels.length > 1 ? labels.slice(0, -1).join(', ') + ' and ' + labels[labels.length - 1] : labels[0] || '');

/**
 * The answers a posting needs, in the order to rehearse them: the introduction, the pitch for the kind of
 * role, then one pitch per skill in the posting's own order. A pitch that covers several skills appears once.
 * @param {{id: string, label: string}[]} found skills from the posting, most mentioned first
 * @param {Pitch[]} pitches
 * @returns {{answers: {pitch: Pitch, question: string, skills: string[]}[], missing: string[]}}
 */
export function pickAnswers(found, pitches) {
  const answers = [], missing = [];
  const at = new Map();                                     // pitch id -> its entry
  const add = (pitch, question) => { const e = { pitch, question, skills: [] }; at.set(pitch.id, e); answers.push(e); return e; };
  for (const p of pitches.filter((x) => x.always)) add(p, p.title);
  const role = pitches.find((p) => p.role === roleFor(found.map((f) => f.id)));
  if (role && found.length) add(role, 'What is your background? (' + role.title + ')');
  for (const f of found) {
    const p = pitches.find((x) => (x.skills || []).includes(f.id));
    if (!p) { missing.push(f.label); continue; }
    const e = at.get(p.id) || add(p, '');
    e.skills.push(f.label);
  }
  for (const e of answers) if (!e.question) e.question = 'What is your experience with ' + list(e.skills) + '?';
  return { answers, missing };
}

/** An honest answer shape for a skill the reader has no pitch for. */
export const gapFrame = (label) => `I have not used ${label} in production. The closest I have done is ___. I would get productive by ___.`;

/** The decrypted payload: { v: 1, pitches: Pitch[] }. @returns {Pitch[]} */
export function parsePayload(text) {
  let v;
  try { v = JSON.parse(text); } catch { throw new Error('The answers could not be read.'); }
  const ok = v && Array.isArray(v.pitches) && v.pitches.every((p) => p && typeof p.id === 'string' && typeof p.title === 'string' && typeof p.say === 'string' && Array.isArray(p.probes));
  if (!ok) throw new Error('The answers could not be read.');
  return v.pitches;
}

/** Plain text of a result, for copying into notes. */
export function toText({ answers, missing }) {
  const out = answers.map((a) => a.question + '\n' + a.pitch.say + (a.pitch.probes.length ? '\nIf they probe: ' + a.pitch.probes.join(' | ') : '') + (a.pitch.verify ? '\nCheck before saying: ' + a.pitch.verify : ''));
  if (missing.length) out.push('No answer written yet: ' + missing.join(', ') + '\n' + missing.map(gapFrame).join('\n'));
  return out.join('\n\n');
}
