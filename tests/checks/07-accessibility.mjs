// Automated accessibility checks (axe-core, WCAG 2/2.1 A+AA) on the homepage and a guide page in
// both themes, plus the flashcard dialog's keyboard focus handling: Tab stays trapped inside it,
// and closing returns focus to the button that opened it (or a sensible fallback if that button
// no longer exists, since some openers live inside content the engine re-renders on close).
import AxeBuilder from '@axe-core/playwright';

export async function run({ browser, base, ok }) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const axe = async (label) => {
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    ok(`axe: ${label}`, violations.length === 0, violations.map((v) => `${v.id} (${v.nodes.length})`).join(', '));
  };

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await axe('homepage (light)');
  await page.click('button[title="Toggle theme"]');
  await page.waitForTimeout(300);
  await axe('homepage (dark)');

  await page.goto(`${base}/nextjs`, { waitUntil: 'networkidle' });
  const frame = await (await page.$('iframe')).contentFrame();
  await frame.waitForSelector('#navList .nav-item', { state: 'attached' });
  await frame.evaluate(() => document.querySelectorAll('.qcard').forEach((c) => c.classList.add('open')));
  await axe('guide page, expanded cards (dark, from before)');

  // flashcard dialog: focus trap
  await frame.evaluate(() => document.getElementById('fcCore').focus());
  await frame.click('#fcCore');
  await page.waitForTimeout(150);
  await axe('flashcard dialog open');
  let escaped = false;
  for (let i = 0; i < 15; i++) {
    await frame.locator('body').press('Tab');
    if (!(await frame.evaluate(() => document.activeElement.closest('.fc-dialog') != null))) escaped = true;
  }
  ok('flashcard dialog: Tab stays trapped inside it', !escaped);

  // focus restoration: opener (#fcCore) is outside the re-rendered area and survives closing
  await frame.press('body', 'Escape');
  await page.waitForTimeout(150);
  ok('flashcard dialog: closing restores focus to its opener', await frame.evaluate(() => document.activeElement.id === 'fcCore'));

  // focus restoration: an opener inside #content gets destroyed on close (re-rendered) — must
  // land on the section heading, never silently fall back to <body>
  await frame.evaluate(() => { const b = document.querySelector('.flash-btn'); b.focus(); b.click(); });
  await page.waitForTimeout(150);
  await frame.press('body', 'Escape');
  await page.waitForTimeout(150);
  const landedOnBody = await frame.evaluate(() => document.activeElement === document.body);
  ok('flashcard dialog: closing never silently drops focus to <body>', !landedOnBody);

  await page.close();
}
