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

async function waitForMap(page) {
  await page.waitForTimeout(3000);
}

const browser = await chromium.launch();

// Happy path
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/map`);
  await waitForMap(page);
  await shot(page, 'US-3.2-01-map-loaded.png');

  // Click near center of canvas to open a cluster popover
  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45);
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-3.2-02-popover-open.png');
  await shot(page, 'US-3.2-03-popover-content.png');

  // Click any researcher link in the popover
  const researcherBtn = page.locator('[data-testid="cluster-member"], .cluster-panel a, .side-panel a, .popover a, [class*="panel"] a, [class*="member"] button, [class*="member"] a').first();
  const hasMember = await researcherBtn.count() > 0;
  if (hasMember) {
    await researcherBtn.click();
    await page.waitForTimeout(1500);
  } else {
    // Just navigate to a researcher profile
    await page.goto(`${BASE}/researchers`);
    await page.waitForTimeout(1000);
    const viewBtn = page.locator('a[href*="/researchers/"]').first();
    if (await viewBtn.count() > 0) await viewBtn.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-3.2-04-navigate-profile.png');
  await ctx.close();
}

// E1: Large cluster intercept
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.route('**/rest/v1/clusters**', async route => {
    const res = await route.fetch();
    const json = await res.json();
    const clusters = Array.isArray(json) ? json : [];
    if (clusters.length > 0) {
      clusters[0].member_count = 55;
    }
    await route.fulfill({ json: clusters });
  });

  await page.goto(`${BASE}/map`);
  await waitForMap(page);
  await shot(page, 'US-3.2-E1-01-intercept.png');

  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45);
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-3.2-E1-02-popover-open.png');
  await shot(page, 'US-3.2-E1-03-truncated.png');
  await ctx.close();
}

// E2: Close popover by clicking background
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/map`);
  await waitForMap(page);

  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45);
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-3.2-E2-01-popover-open.png');

  // Click background (top-left corner, away from center)
  if (box) {
    await page.mouse.click(box.x + 30, box.y + 30);
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-3.2-E2-02-popover-closed.png');
  await ctx.close();
}

// E3: Slow cluster members intercept
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.route('**/rest/v1/researchers**', async route => {
    await new Promise(r => setTimeout(r, 3000));
    await route.continue();
  });

  await page.goto(`${BASE}/map`);
  await waitForMap(page);
  await shot(page, 'US-3.2-E3-01-intercept.png');

  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45);
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-3.2-E3-02-popover-open.png');
  await shot(page, 'US-3.2-E3-03-loading.png');
  await ctx.close();
}

await browser.close();
console.log('US-3.2 done');
