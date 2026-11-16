// Draws the app icons for the web app manifest from public/icon.png (a 1024 x 1024 image; despite its name the
// file is a JPEG). Writes public/icons/icon-192.png, icon-512.png and maskable-512.png. The maskable one keeps
// the image inside the central 80% so a platform can crop it to a circle or squircle. Needs Playwright.
//   node scripts/make-icons.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (await readFile(path.join(ROOT, 'public', 'icon.png'))).toString('base64');
await mkdir(path.join(ROOT, 'public', 'icons'), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<canvas id="c"></canvas>');
const draw = (size, scale) => page.evaluate(async ({ b64, size, scale }) => {
  const img = new Image();
  img.src = 'data:image/jpeg;base64,' + b64;
  await img.decode();
  const c = document.getElementById('c');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = '#FFFFFF';                       // the icon itself sits on white
  g.fillRect(0, 0, size, size);
  const s = size * scale;
  g.drawImage(img, (size - s) / 2, (size - s) / 2, s, s);
  return c.toDataURL('image/png').split(',')[1];
}, { b64: src, size, scale });

for (const [file, size, scale] of [['icon-192.png', 192, 1], ['icon-512.png', 512, 1], ['maskable-512.png', 512, 0.8]]) {
  await writeFile(path.join(ROOT, 'public', 'icons', file), Buffer.from(await draw(size, scale), 'base64'));
  console.log('wrote public/icons/' + file);
}
await browser.close();
