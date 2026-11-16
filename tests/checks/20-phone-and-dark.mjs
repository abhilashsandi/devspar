// The practice spec requires every new page to work on a 375px-wide phone and in both themes.
// For each tool page, in light and in dark: nothing spills past the screen edge, the theme really
// applied, and the heading and body text keep readable contrast against the page background.
// The guides' new blocks (answer depths, runnable SQL, predict cards) are checked at phone width too.

const TOOLS = ['/mock', '/drills', '/plan', '/match', '/stories', '/offline'];
const GUIDES = ['/interview-prep', '/sql', '/javascript'];

// measured in the page: overflow, theme class, and contrast of headings and paragraphs against the background
function measure() {
  const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
  const lum = ([r, g, b]) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const bgOf = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = rgb(getComputedStyle(n).backgroundColor);
      if (c.length === 3 || (c[3] ?? 1) > 0.5) return c.slice(0, 3);
    }
    return [255, 255, 255];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  let worst = { r: 99, what: '' };
  for (const el of document.querySelectorAll('h1, h2, p, label, button')) {
    const box = el.getBoundingClientRect();
    // only text a sighted reader sees: an icon button whose sole text is a screen-reader label is skipped
    const visible = [...el.childNodes].some((n) => (n.nodeType === 3 && n.textContent.trim()) || (n.nodeType === 1 && !n.classList.contains('sr-only') && n.textContent.trim()));
    if (!box.width || !box.height || !visible) continue;
    const r = ratio(rgb(getComputedStyle(el).color).slice(0, 3), bgOf(el));
    if (r < worst.r) worst = { r, what: `${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 30)}"` };
  }
  const wide = [...document.querySelectorAll('body *')].filter((el) => {
    const b = el.getBoundingClientRect();
    if (!b.width || b.right <= innerWidth + 1) return false;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const o = getComputedStyle(n).overflowX;
      if (o === 'auto' || o === 'scroll' || o === 'hidden') return false; // scrolls inside its own box
    }
    return true;
  });
  return {
    overflow: document.documentElement.scrollWidth - innerWidth,
    wide: wide.slice(0, 3).map((el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '')),
    dark: document.documentElement.classList.contains('dark'),
    bgLum: lum(bgOf(document.body)),
    worst,
  };
}

export async function run({ browser, base, ok }) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: scheme, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    for (const route of TOOLS) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400); // let the theme class settle after hydration, and colour transitions finish
      const m = await page.evaluate(measure);
      ok(`${route} fits a 375px phone (${scheme})`, m.overflow <= 1 && m.wide.length === 0, `overflow ${m.overflow}px ${m.wide.join(' ')}`);
      ok(`${route} shows the ${scheme} theme`, scheme === 'dark' ? m.dark && m.bgLum < 0.2 : !m.dark && m.bgLum > 0.6, `background luminance ${m.bgLum.toFixed(2)}`);
      ok(`${route} text is readable (${scheme})`, m.worst.r >= 4.5, `lowest contrast ${m.worst.r.toFixed(2)} on ${m.worst.what}`);
    }
    await ctx.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  for (const route of GUIDES) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    const frame = page.frames().find((f) => /\/study\//.test(f.url()));
    if (!frame) { ok(`${route} guide frame loads at phone width`, false); continue; }
    await frame.waitForSelector('.q, details, article', { timeout: 10000 }).catch(() => {});
    const m = await frame.evaluate(measure);
    ok(`${route} guide fits a 375px phone`, m.overflow <= 1 && m.wide.length === 0, `overflow ${m.overflow}px ${m.wide.join(' ')}`);
  }
  await ctx.close();
}
