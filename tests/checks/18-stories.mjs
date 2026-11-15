// /stories: write a STAR story, see its shape checked live, save it in the browser, export and import it.
import { readFile } from 'node:fs/promises';

const w = (n, word = 'word') => Array(n).fill(word).join(' ');

export async function run({ browser, base, ok }) {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1100 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [], sent = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => { if (/Ownership Marker Story/i.test(r.url() + (r.postData() || ''))) sent.push(r.url()); });
  page.on('dialog', (d) => d.accept());

  const box = (name) => page.getByRole('textbox', { name: new RegExp('^' + name) });
  await page.goto(`${base}/stories`, { waitUntil: 'networkidle' });
  const tiles = await page.locator('[data-testid^="cover-"]').allTextContents();
  ok('five competencies, none covered yet', tiles.length === 5 && tiles.every((t) => t === 'No story yet'), tiles.join(' | '));
  ok('no checks are shown before a story is started', (await page.getByRole('complementary', { name: 'Checks' }).count()) === 0);

  await page.getByRole('button', { name: 'New story' }).click();
  await box('Title').fill('Ownership Marker Story');
  await page.getByRole('checkbox', { name: 'Ownership and delivery' }).check();
  await box('Situation').fill(w(20));
  ok('under 30 words the panel only invites the reader to write', (await page.getByText('Start writing: the checks appear as you go.').count()) === 1);

  await box('Task').fill(w(20));
  await box('Action').fill('I I I ' + w(137));
  await box('Result').fill('Latency fell by 40% in two weeks ' + w(13));
  await page.getByText('About 80 seconds to say.').waitFor({ timeout: 5000 }).catch(() => {});
  const marks = await page.getByRole('complementary', { name: 'Checks' }).locator('li').allTextContents();
  ok('all five checks pass for a well-shaped story', marks.length === 5 && marks.every((m) => m.startsWith('✓')), marks.join(' | '));
  ok('the panel gives the spoken length', (await page.getByText('About 80 seconds to say.').count()) >= 1);

  await page.reload({ waitUntil: 'networkidle' });
  ok('an unsaved draft survives a reload', (await box('Title').inputValue()) === 'Ownership Marker Story' && (await box('Action').inputValue()).startsWith('I I I'));

  await page.getByRole('button', { name: 'Save story' }).click();
  await page.getByText('5 of 5 checks').waitFor({ timeout: 5000 });
  ok('the saved story is listed with its checks', (await page.getByText('5 of 5 checks').count()) === 1);
  ok('its competency tile counts it', (await page.locator('[data-testid="cover-ownership"]').textContent()) === '1 story');
  await page.reload({ waitUntil: 'networkidle' });
  ok('the story is still there after a reload', (await page.getByText('Ownership Marker Story').count()) >= 1 && (await page.getByText('5 of 5 checks').count()) === 1);

  const links = await page.locator('details', { hasText: 'Questions this answers' }).first().locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  ok('each competency lists the Behavioural guide questions that answer it', links.length >= 5 && links.every((h) => h.startsWith('/behavioural#bh3:')), `${links.length} links`);

  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export' }).click()]);
  const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
  ok('Export downloads a story file', exported.app === 'devspar-stories' && exported.stories.length === 1, download.suggestedFilename());

  await page.setInputFiles('input[type=file]', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"nope":1}') });
  await page.getByText('That is not a DevSpar story file.').waitFor({ timeout: 5000 }).catch(() => {});
  ok('the wrong file is refused', (await page.getByText('That is not a DevSpar story file.').count()) === 1);

  const edited = { ...exported, stories: [{ ...exported.stories[0], id: 'imported-1', title: '<b>x</b>', updatedAt: '2030-01-01T00:00:00.000Z' }] };
  await page.setInputFiles('input[type=file]', { name: 'good.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(edited)) });
  await page.getByText('Imported: 1 added').waitFor({ timeout: 5000 }).catch(() => {});
  ok('an imported story is added, and its markup shows as plain text', (await page.getByText('<b>x</b>', { exact: true }).count()) === 1 && (await page.locator('section[aria-label="Your stories"] li').count()) === 2);

  // a browser that will not store anything
  await page.getByRole('button', { name: 'New story' }).click();
  await box('Title').fill('Unsaved attempt');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('full'); }; });
  await page.getByRole('button', { name: 'Save story' }).click();
  await page.getByText('Could not save: this browser’s storage is full or blocked. Export your stories to keep them.').waitFor({ timeout: 5000 }).catch(() => {});
  ok('a failed save says so and keeps the text', (await page.getByText(/^Could not save/).count()) === 1 && (await box('Title').inputValue()) === 'Unsaved attempt');
  await page.evaluate(() => location.reload());
  await page.waitForLoadState('networkidle');

  // delete (the dialog is accepted above)
  await page.locator('section[aria-label="Your stories"] li', { hasText: '<b>x</b>' }).getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Your stories"] li').length === 1);
  ok('a deleted story is gone', (await page.getByText('<b>x</b>', { exact: true }).count()) === 0);

  ok('nothing the reader wrote was sent anywhere', sent.length === 0, sent.join(' '));
  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}
