// Re-applies everything shared (theme.css, fonts, engine.js) to every guide's content.json.
//   npm run study:upgrade        then        npm run study:build
// Run it after editing scripts/study/theme.css or scripts/study/engine.js. The private /my-prep page is
// encrypted, so it is not touched here: rebuild it with its own script and password to restyle it.
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import * as lib from './lib.mjs';

const guides = (await readdir(lib.APP, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && existsSync(path.join(lib.APP, d.name, 'content.json')))
  .map((d) => d.name);
for (const slug of guides) {
  const { html } = await lib.load(slug);
  if (!html.includes(lib.MARK)) { console.log('skip (no engine): ' + slug); continue; }
  const cards = await lib.save(slug, await lib.upgrade(html));
  console.log(slug.padEnd(28) + cards + ' cards');
}
