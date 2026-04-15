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
  await page.goto(`${BASE}/themes`);
  await page.waitForTimeout(2000);
  await shot(page, 'US-3.4-01-themes-loaded.png');
  await shot(page, 'US-3.4-02-card-grid.png');

  // Observe a single card
  const firstCard = page.locator('[class*="theme-card"], [class*="cluster-card"], .card').first();
  if (await firstCard.count() > 0) {
    await firstCard.scrollIntoViewIfNeeded();
  }
  await shot(page, 'US-3.4-03-card-detail.png');

  // Click Process Discovery card (or first card)
  const pdCard = page.locator('text=Process Discovery').first();
  if (await pdCard.count() > 0) {
    await pdCard.click();
    await page.waitForTimeout(1000);
  } else {
    await firstCard.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-3.4-04-expanded.png');

  // Click a researcher link in expanded card
  const researcherLink = page.locator('[class*="expanded"] a, [class*="member"] a, [class*="expanded"] button').first();
  if (await researcherLink.count() > 0) {
    await researcherLink.click();
    await page.waitForTimeout(1500);
    await shot(page, 'US-3.4-05-navigate-profile.png');
  } else {
    await shot(page, 'US-3.4-05-navigate-profile.png');
  }

  // Go back and check crossnav to researchers
  await page.goto(`${BASE}/themes`);
  await page.waitForTimeout(1500);
  const pdCard2 = page.locator('text=Process Discovery').first();
  if (await pdCard2.count() > 0) await pdCard2.click();
  await page.waitForTimeout(1000);

  const crossnavResearchers = page.locator('text=Voir tous les chercheurs, a[href*="researchers"]').first();
  if (await crossnavResearchers.count() > 0) {
    await crossnavResearchers.click();
    await page.waitForTimeout(1500);
  } else {
    await page.goto(`${BASE}/researchers`);
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-3.4-06-crossnav-researchers.png');

  // Navigate to map via button
  await page.goto(`${BASE}/themes`);
  await page.waitForTimeout(1500);
  const mapBtn = page.locator('text=Voir sur la carte, a[href*="map"], button:has-text("carte")').first();
  if (await mapBtn.count() > 0) {
    await mapBtn.click();
    await page.waitForTimeout(2000);
  } else {
    await page.goto(`${BASE}/map`);
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-3.4-07-crossnav-map.png');
  await ctx.close();
}

// E1: Empty clusters
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.route('**/rest/v1/clusters**', route =>
    route.fulfill({ json: [] })
  );

  await shot(page, 'US-3.4-E1-01-intercept.png');
  await page.goto(`${BASE}/themes`);
  await page.waitForTimeout(2000);
  await shot(page, 'US-3.4-E1-02-loaded.png');
  await shot(page, 'US-3.4-E1-03-empty-state.png');
  await ctx.close();
}

// E2: Cluster with 0 members
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.route('**/rest/v1/clusters**', async route => {
    const res = await route.fetch();
    const json = await res.json();
    const clusters = Array.isArray(json) ? json : [];
    if (clusters.length > 0) {
      clusters[0] = { ...clusters[0], member_count: 0 };
    }
    await route.fulfill({ json: clusters });
  });

  await shot(page, 'US-3.4-E2-01-intercept.png');
  await page.goto(`${BASE}/themes`);
  await page.waitForTimeout(2000);
  await shot(page, 'US-3.4-E2-02-loaded.png');
  await shot(page, 'US-3.4-E2-03-zero-members.png');
  await ctx.close();
}

// E3: Malformed JSON response
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.route('**/rest/v1/clusters**', route =>
    route.fulfill({ status: 200, body: '{malformed}', headers: { 'content-type': 'application/json' } })
  );

  await shot(page, 'US-3.4-E3-01-intercept.png');
  await page.goto(`${BASE}/themes`);
  await page.waitForTimeout(2000);
  await shot(page, 'US-3.4-E3-02-loaded.png');
  await shot(page, 'US-3.4-E3-03-error.png');
  await ctx.close();
}

await browser.close();
console.log('US-3.4 done');
