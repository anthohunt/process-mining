import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../../tests/e2e/final');
const BASE = 'http://127.0.0.1:5199';

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name) });
  console.log('captured', name);
}

const browser = await chromium.launch();

// Happy path
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/map`);
  await page.waitForTimeout(3000);
  await shot(page, 'US-3.3-01-map-loaded.png');

  // Hover over center of canvas (where researcher particles are)
  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-3.3-02-hover-tooltip.png');

  // Click to navigate to profile
  if (box) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-3.3-03-navigate-profile.png');
  await ctx.close();
}

// E1: Overlapping researchers disambiguation
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // Intercept cluster data so two researchers share same map_x/map_y
  await page.route('**/rest/v1/researchers**', async route => {
    const res = await route.fetch();
    const json = await res.json();
    if (Array.isArray(json) && json.length >= 2) {
      json[1].map_x = json[0].map_x;
      json[1].map_y = json[0].map_y;
    }
    await route.fulfill({ json });
  });

  await page.goto(`${BASE}/map`);
  await page.waitForTimeout(3000);
  await shot(page, 'US-3.3-E1-01-intercept.png');

  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-3.3-E1-02-disambiguation.png');

  const firstLink = page.locator('[class*="disambig"] a, [class*="disambig"] button, [class*="tooltip"] a, [class*="popup"] a').first();
  if (await firstLink.count() > 0) {
    await firstLink.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-3.3-E1-03-selected.png');
  await ctx.close();
}

// E2: Researcher profile 500 error
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/map`);
  await page.waitForTimeout(3000);

  // Set up route to fail researcher profile fetches
  await page.route('**/rest/v1/researchers?id=eq*', route => route.fulfill({ status: 500 }));
  await page.route('**/rest/v1/researchers?select*id=eq*', route => route.fulfill({ status: 500 }));
  await page.route(`${BASE}/researchers/**`, route => route.fulfill({ status: 500, body: '' }));

  await shot(page, 'US-3.3-E2-01-intercept.png');

  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-3.3-E2-02-click-dot.png');
  await page.waitForTimeout(1000);
  await shot(page, 'US-3.3-E2-03-toast.png');
  await ctx.close();
}

// E3: Touch target size at zoomed-out
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/map`);
  await page.waitForTimeout(3000);

  // Zoom out using keyboard or scroll
  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    // Scroll up (zoom out) multiple times
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(100);
    }
  }
  await page.waitForTimeout(1000);
  await shot(page, 'US-3.3-E3-01-zoomed-out.png');

  // Inspect dot size - just show map state
  await shot(page, 'US-3.3-E3-02-touch-target.png');
  await ctx.close();
}

await browser.close();
console.log('US-3.3 done');
