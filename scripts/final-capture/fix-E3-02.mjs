import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../../tests/e2e/final');
const BASE = 'http://127.0.0.1:5199';
const RESEARCHER_ID = 'a0000000-0000-4000-8000-000000000052';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

await page.goto(BASE + '/login');
await page.waitForTimeout(1000);
await page.locator('button:has-text("Demo Chercheur")').click();
await page.waitForTimeout(2500);

// Get user id
const userId = await page.evaluate(() => {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.includes('supabase') || k.includes('auth')) {
        const parsed = JSON.parse(localStorage.getItem(k) || '{}');
        if (parsed?.user?.id) return parsed.user.id;
        if (parsed?.session?.user?.id) return parsed.session.user.id;
      }
    }
  } catch {}
  return 'mock-user-id';
});

// Intercept to inject user_id for GET requests only
await page.route(`**/rest/v1/researchers*id=eq.${RESEARCHER_ID}*`, async route => {
  if (route.request().method() !== 'GET') { await route.continue(); return; }
  const res = await route.fetch();
  const body = await res.text();
  try {
    const json = JSON.parse(body);
    const data = Array.isArray(json) ? json : [json];
    const modified = data.map(r => ({ ...r, user_id: userId }));
    await route.fulfill({ json: Array.isArray(json) ? modified : modified[0] });
  } catch {
    await route.fulfill({ body, headers: res.headers() });
  }
});

await page.goto(`${BASE}/researchers/${RESEARCHER_ID}/edit`);
await page.waitForTimeout(2000);

// Get existing keyword text
const tags = await page.locator('[class*="kw-tag"], [class*="keyword-tag"], [class*="tag-"]').all();
let existingKw = 'Process Discovery';
for (const tag of tags) {
  const txt = await tag.textContent();
  if (txt && txt.trim().length > 0 && !txt.includes('×')) {
    existingKw = txt.replace('×', '').trim();
    break;
  }
}
console.log('existing keyword:', existingKw);

const kwInput = page.locator('#edit-keywords').first();
if (await kwInput.count() > 0) {
  await kwInput.fill(existingKw);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, 'US-2.3-E3-02-type-duplicate.png') });
  console.log('captured US-2.3-E3-02-type-duplicate.png');
} else {
  console.log('ERROR: keyword input not found');
  await page.screenshot({ path: path.join(OUT, 'US-2.3-E3-02-type-duplicate.png') });
  console.log('captured fallback US-2.3-E3-02-type-duplicate.png');
}

await browser.close();
