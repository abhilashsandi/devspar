// /drills: a seeded session of eight estimation drills, graded by how close the answer is.
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export async function run({ browser, base, ok }) {
  const { seedFrom } = await import(pathToFileURL(path.resolve('app/lib/bank.mjs')).href);
  const { makeSession } = await import(pathToFileURL(path.resolve('app/lib/drills.mjs')).href);
  const drills = makeSession(seedFrom('check'));
  const plain = (d) => String(Number(d.answer.toPrecision(6)));

  const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}/drills?seed=check`, { waitUntil: 'networkidle' });
  const prompt = page.locator('[data-testid="prompt"]');
  await prompt.waitFor();
  ok('the seeded session starts with the expected drill', (await prompt.textContent()).trim() === drills[0].prompt, drills[0].id);
  ok('the screen says drill 1 of 8', (await page.locator('h2').first().textContent()) === 'Drill 1 of 8');

  const input = page.getByRole('textbox');
  await input.fill(plain(drills[0]));
  await input.press('Enter');
  const grade = page.locator('[data-testid="grade"]');
  await grade.waitFor();
  ok('a right answer is told so', (await grade.textContent()) === 'Right.', await grade.textContent());
  ok('the worked route is listed after grading', (await page.locator('[data-testid="steps"] li').count()) >= 2);

  await input.press('Enter');
  await page.getByText('Drill 2 of 8').waitFor();
  ok('a second Enter moves to the next drill', (await prompt.textContent()).trim() === drills[1].prompt);

  await input.fill('130 ms');
  await input.press('Enter');
  await grade.waitFor();
  ok('an answer with a unit is refused, not graded', (await grade.textContent()) === 'Enter a number, for example 6900 or 6.9k.' && (await page.locator('h2').first().textContent()) === 'Drill 2 of 8');

  await input.fill(String(drills[1].answer * 10));
  await input.press('Enter');
  await page.getByText(/^Off: the answer is /).waitFor();
  ok('a wrong answer says what the answer is', /^Off: the answer is [\d,.]+ /.test(await grade.textContent()), await grade.textContent());
  await input.press('Enter');

  for (let k = 2; k < 8; k++) {
    await page.getByText(`Drill ${k + 1} of 8`).waitFor();
    await input.fill(plain(drills[k]));
    await input.press('Enter');
    await grade.waitFor();
    await input.press('Enter');
  }
  const summary = page.locator('[data-testid="summary"]');
  await summary.waitFor();
  ok('the summary counts right, close and off', (await summary.textContent()) === '7 right, 0 close, 1 off', await summary.textContent());

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('study-drills-v1') || '{}'));
  ok('every template tried is recorded once', Object.keys(stored).length === 8 && Object.values(stored).every((s) => s.seen === 1), JSON.stringify(Object.keys(stored)));
  ok('Another session is offered', (await page.getByRole('button', { name: 'Another session' }).count()) === 1);
  ok('no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}
