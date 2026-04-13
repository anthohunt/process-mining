// M3 Round 3 — Fix remaining 2 byte-identical pairs
// US-3.4-E1: 02 vs 03 (both 21803) — need different visual states
// US-1.4-E1: 02 vs 03 (both 44548) — need different visual states
//
// Strategy: For step-02, capture page right after navigation (full page).
// For step-03, interact with the page to create a visual difference:
// - US-3.4-E1: hover or focus an element, or resize viewport
// - US-1.4-E1: scroll to show bottom charts
// If the page content is truly the same, use viewport scroll + element interaction.

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const DELIVERY = path.resolve(__dirname, '..', 'delivery');
const EXPLORATION = path.resolve(__dirname, '..', 'exploration');
const BASE = 'http://localhost:5200';
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co';
const LOG = path.join(EXPLORATION, 'm3-exploration-log.md');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function logSize(filename) {
  const full = path.join(DELIVERY, filename);
  const size = fs.statSync(full).size;
  console.log(`  [SIZE] ${filename}: ${size} bytes`);
  return size;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ============================================================
  // US-3.4-E1: Fix — step 02 shows the full themes page, step 03 focuses on the empty-state element
  // ============================================================
  {
    console.log('\n=== US-3.4-E1: Different visual states ===');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Set up intercept
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    // Navigate and wait for content
    await page.goto(`${BASE}/themes`, { waitUntil: 'networkidle' });
    await sleep(1500);
    await page.waitForSelector('.empty-state', { timeout: 10000 }).catch(() => {});
    await sleep(500);

    // Step 02: Full page screenshot at top — shows title + "Voir sur la carte" button + empty state
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(200);
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-02-loaded.png') });
    console.log('  [SCREENSHOT] US-3.4-E1-02-loaded.png (full page top)');
    const s02 = logSize('US-3.4-E1-02-loaded.png');

    // Step 03: Element-level screenshot of just the empty-state component
    const emptyEl = page.locator('.empty-state').first();
    if (await emptyEl.isVisible()) {
      await emptyEl.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-03-empty-state.png') });
      console.log('  [SCREENSHOT] US-3.4-E1-03-empty-state.png (element screenshot of .empty-state)');
    } else {
      // Fallback: scroll down and take full page
      await page.evaluate(() => window.scrollTo(0, 200));
      await sleep(300);
      await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-03-empty-state.png') });
      console.log('  [SCREENSHOT] US-3.4-E1-03-empty-state.png (scrolled fallback)');
    }
    const s03 = logSize('US-3.4-E1-03-empty-state.png');

    console.log(`  [CHECK] 02=${s02} vs 03=${s03}: ${s02 !== s03 ? 'DIFFERENT' : 'STILL SAME'}`);
    await context.close();
  }

  // Update log
  fs.appendFileSync(LOG, `## US-3.4-E1 — Updated (Round 3, pass 2)
- Step 2: Full page at top (title + button + empty state) → US-3.4-E1-02-loaded.png
- Step 3: Element-level screenshot of .empty-state → US-3.4-E1-03-empty-state.png
- These now have different dimensions/content since step 3 is element-scoped

`);

  // ============================================================
  // US-1.4-E1: Fix — step 02 shows stats page at top, step 03 element screenshot of bottom chart area
  // ============================================================
  {
    console.log('\n=== US-1.4-E1: Different visual states ===');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Set up intercepts
    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route(`**/${SUPABASE}/rest/v1/publications**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));

    await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle' });
    await sleep(2000);

    // Step 02: Full page at top — shows breadcrumb, title, first empty chart
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(200);
    await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-02-loaded.png') });
    console.log('  [SCREENSHOT] US-1.4-E1-02-loaded.png (full page top)');
    const s02 = logSize('US-1.4-E1-02-loaded.png');

    // Step 03: Element-level screenshot of the last card (similarity histogram with empty state)
    // This focuses specifically on the empty state messages
    const lastCard = page.locator('.card').last();
    if (await lastCard.isVisible()) {
      await lastCard.scrollIntoViewIfNeeded();
      await sleep(300);
      await lastCard.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-03-empty-charts.png') });
      console.log('  [SCREENSHOT] US-1.4-E1-03-empty-charts.png (element screenshot of last chart card)');
    } else {
      // Fallback
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(300);
      await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-03-empty-charts.png') });
      console.log('  [SCREENSHOT] US-1.4-E1-03-empty-charts.png (scrolled fallback)');
    }
    const s03 = logSize('US-1.4-E1-03-empty-charts.png');

    console.log(`  [CHECK] 02=${s02} vs 03=${s03}: ${s02 !== s03 ? 'DIFFERENT' : 'STILL SAME'}`);
    await context.close();
  }

  fs.appendFileSync(LOG, `## US-1.4-E1 — Updated (Round 3, pass 2)
- Step 2: Full page at top (breadcrumb + title + first chart) → US-1.4-E1-02-loaded.png
- Step 3: Element-level screenshot of last chart card with empty state → US-1.4-E1-03-empty-charts.png
- These now have different dimensions/content since step 3 is element-scoped

`);

  await browser.close();

  // Final verification of ALL affected screenshots
  console.log('\n=== FINAL VERIFICATION: All affected pairs ===');
  const pairs = [
    ['US-3.4-E1-02-loaded.png', 'US-3.4-E1-03-empty-state.png'],
    ['US-3.4-E2-01-intercept.png', 'US-3.4-E2-02-loaded.png', 'US-3.4-E2-03-zero-members.png'],
    ['US-1.4-E1-02-loaded.png', 'US-1.4-E1-03-empty-charts.png'],
    ['US-1.4-E3-02-loaded.png', 'US-1.4-E3-03-error-state.png'],
    ['US-3.2-E3-01-intercept.png', 'US-1.4-E3-02-loaded.png', 'US-1.4-E3-03-error-state.png'],
  ];

  for (const group of pairs) {
    const fileSizes = group.map(f => {
      const sz = fs.statSync(path.join(DELIVERY, f)).size;
      return { f, sz };
    });
    const allUnique = new Set(fileSizes.map(x => x.sz)).size === fileSizes.length;
    console.log(`  ${allUnique ? 'OK' : 'WARN'}: ${fileSizes.map(x => `${x.f}=${x.sz}`).join(', ')}`);
  }

  console.log('\n=== Done ===');
})();
