// The mock interviewer's Gemini API key must never reach the browser. It used to be read from
// NEXT_PUBLIC_GEMINI_API_KEY, which Next.js inlines into the client JS bundle; the key now lives
// server-side only (GEMINI_API_KEY, app/api/mock-interview/route.ts) and the client calls that
// route instead of the Gemini SDK directly. This doesn't call Gemini for real (no key in CI) —
// it checks the client never references the old env var, and the route validates input server-side.
export async function run({ browser, base, ok }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const scripts = [];
  page.on('response', async (res) => {
    if (res.request().resourceType() === 'script' && res.ok()) {
      try { scripts.push(await res.text()); } catch { /* ignore */ }
    }
  });

  await page.goto(`${base}/react-training/labs#interview`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Mock Interviewer', { timeout: 10000 }).catch(() => {});

  const bundle = scripts.join('\n');
  ok('client bundle never references NEXT_PUBLIC_GEMINI_API_KEY', !bundle.includes('NEXT_PUBLIC_GEMINI_API_KEY'));
  ok('client bundle does not import the Gemini SDK directly (@google/genai)', !bundle.includes('@google/genai') && !/GoogleGenAI\s*\(/.test(bundle));

  // the route itself: validates input server-side, and never echoes back an apiKey
  const bad = await page.request.post(`${base}/api/mock-interview`, { data: {} });
  ok('route rejects a request with no chat history', bad.status() === 400);
  const badBody = await bad.json();
  ok('route error response has no key-shaped fields', !JSON.stringify(badBody).match(/apiKey|AIza/i));

  const withKey = await page.request.post(`${base}/api/mock-interview`, {
    data: { history: [{ role: 'user', text: 'hi' }], apiKey: 'not-a-real-key-test-value' },
  });
  const withKeyBody = await withKey.json();
  ok('route never echoes back a submitted apiKey', !JSON.stringify(withKeyBody).includes('not-a-real-key-test-value'));

  await page.close();
}
