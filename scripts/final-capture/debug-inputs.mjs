import { chromium } from '@playwright/test';
const BASE = 'http://127.0.0.1:5199';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

await page.goto(BASE + '/login');
await page.waitForTimeout(1000);
await page.locator('button:has-text("Demo Chercheur")').click();
await page.waitForTimeout(2500);

await page.goto(BASE + '/researchers');
await page.waitForTimeout(2000);

// Check multiple profiles to find own (has "Modifier" unlocked) vs others (locked)
const viewBtns = await page.locator('button:has-text("Voir")').all();
// Check first 5 profiles
for (let i = 0; i < Math.min(5, viewBtns.length); i++) {
  await page.goto(BASE + '/researchers');
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Voir")').nth(i).click();
  await page.waitForTimeout(1000);
  const url = page.url();
  const modBtn = page.locator('button:has-text("Modifier")');
  const count = await modBtn.count();
  const isDisabled = count > 0 ? await modBtn.first().isDisabled() : true;
  const txt = count > 0 ? await modBtn.first().textContent() : 'none';
  console.log(`[${i}] ${url} | btn: ${txt?.trim()} | disabled: ${isDisabled}`);
}
await browser.close();
