// Audio overviews: a script per guide, written to be listened to (a commute, a walk), not a read-out of the cards.
// scripts/study/audio/<slug>.mjs exports { intro, chapters: { <sectionId>: text } } in plain spoken English;
// paragraphs are separated by a blank line. emit-static.mjs writes public/study/audio/<slug>.json, which the
// engine's Listen button plays chapter by chapter with the device's own voice.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
export const LIMITS = { intro: [60, 170], chapter: [120, 330] };
// section titles as a listener should hear them: no tags, no "3. " prefix, no " · 10 min" suffix
export const spokenTitle = (t) => String(t).replace(/<[^>]+>/g, '').replace(/&amp;/g, 'and').replace(/^\d+\.\s*/, '').replace(/\s*·\s*\d+\s*min$/, '').trim();

/** The authored script for a guide, or null when it has none. */
export async function loadScript(slug) {
  const file = path.join(here, 'audio', slug + '.mjs');
  if (!existsSync(file)) return null;
  return (await import(pathToFileURL(file).href)).default;
}

/** What the browser plays: chapters in the guide's own section order. */
export function buildAudio(script, data) {
  const tidy = (s) => String(s).replace(/\r\n/g, '\n').split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n\n');
  return {
    intro: tidy(script.intro),
    chapters: data.filter((s) => script.chapters[s.id]).map((s) => ({ id: s.id, title: spokenTitle(s.title), text: tidy(script.chapters[s.id]) })),
  };
}

// Things a voice reads badly: markup, code punctuation, list markers, URLs.
const UNSPEAKABLE = [[/[<>`*#{}\[\]]/, 'markup or code punctuation'], [/=>|===|\(\)/, 'code'], [/^\s*[-•]\s/m, 'a list marker'], [/https?:\/\//, 'a URL']];

/** One message per problem. `sections` is the guide's data. */
export function validateAudio(script, sections) {
  const out = [];
  const check = (name, text, [lo, hi]) => {
    const n = words(text);
    if (n < lo || n > hi) out.push(`${name}: ${n} words (want ${lo} to ${hi})`);
    for (const [re, what] of UNSPEAKABLE) if (re.test(text)) out.push(`${name}: contains ${what} (${(text.match(re) || [''])[0].trim()})`);
  };
  if (!script.intro) out.push('no intro'); else check('intro', script.intro, LIMITS.intro);
  const ids = new Set(sections.map((s) => s.id));
  for (const [id, text] of Object.entries(script.chapters || {})) {
    if (!ids.has(id)) out.push(`chapter "${id}": no such section`); else check(`chapter "${id}"`, text, LIMITS.chapter);
  }
  for (const s of sections) if (s.id !== 'quickref' && !(script.chapters || {})[s.id]) out.push(`section "${s.id}" (${spokenTitle(s.title)}) has no chapter`);
  return out;
}
