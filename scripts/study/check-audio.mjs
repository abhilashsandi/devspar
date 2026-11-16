// Checks the audio overviews (scripts/study/audio/<slug>.mjs).
//   node scripts/study/check-audio.mjs                 every guide that has a script
//   node scripts/study/check-audio.mjs sql aws         only these
//   node scripts/study/check-audio.mjs --require-all   also fail for a guide with no script
// Every section except the Quick Reference needs a chapter; the intro and each chapter have a word budget; and the
// text must be speakable (no markup, code punctuation, list markers or URLs). Prints the listening time.
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import * as lib from './lib.mjs';
import { loadScript, validateAudio, words } from './audio.mjs';

const args = process.argv.slice(2);
const requireAll = args.includes('--require-all');
const only = args.filter((a) => !a.startsWith('--'));
const slugs = (await readdir(lib.APP, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && d.name !== 'my-prep' && existsSync(path.join(lib.APP, d.name, 'content.json')))
  .map((d) => d.name).filter((s) => !only.length || only.includes(s)).sort();

let bad = 0, done = 0, total = 0;
for (const slug of slugs) {
  const script = await loadScript(slug);
  if (!script) { if (requireAll) { console.log(`${slug}: FAIL\n  - no audio script`); bad++; } continue; }
  const { data } = await lib.load(slug);
  const problems = validateAudio(script, data);
  const n = words(script.intro || '') + Object.values(script.chapters || {}).reduce((a, t) => a + words(t), 0);
  total += n; done++;
  if (problems.length) { bad++; console.log(`${slug}: FAIL\n  - ` + problems.join('\n  - ')); }
  else console.log(`${slug}: OK (${Object.keys(script.chapters).length} chapters, ${n} words, about ${Math.round(n / 150)} min)`);
}
console.log(bad ? `check-audio: FAIL (${bad} guide(s))` : `check-audio: OK (${done} of ${slugs.length} guides, ${total} words, about ${Math.round(total / 150)} min in all)`);
process.exitCode = bad ? 1 : 0;
