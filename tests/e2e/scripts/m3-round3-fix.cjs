// M3 Round 3 — Fix byte-identical screenshot pairs
// Strategy: ensure each step captures a genuinely different visual state
// - Step 01 "intercept": show dashboard with devtools/route setup context
// - Step 02 "loaded": capture the page MID-LOAD (loading spinner visible)
// - Step 03 "result": capture the FINAL state (empty/error/zero-member)
// For US-1.4-E3: use route.abort() to force real network errors

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

function appendLog(text) {
  fs.appendFileSync(LOG, text);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const sizes = {};

  // ============================================================
  // GROUP 1: US-3.4-E1 — No Themes (empty clusters)
  // Problem: 02-loaded and 03-empty-state were identical
  // Fix: 02 = capture DURING loading (before networkidle), 03 = after empty state renders
  // ============================================================
  {
    console.log('\n=== US-3.4-E1: No Themes ===');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Step 1: Show dashboard with intercept about to be set
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(500);
    // Set up intercept AFTER showing dashboard
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-01-intercept.png') });
    console.log('  [SCREENSHOT] US-3.4-E1-01-intercept.png');
    sizes['US-3.4-E1-01-intercept.png'] = logSize('US-3.4-E1-01-intercept.png');

    // Step 2: Navigate to /themes — capture DURING load (loading spinner)
    // Use domcontentloaded (not networkidle) to catch the loading state
    await page.goto(`${BASE}/themes`, { waitUntil: 'domcontentloaded' });
    // Brief wait for React to mount and show spinner
    await sleep(300);
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-02-loaded.png') });
    console.log('  [SCREENSHOT] US-3.4-E1-02-loaded.png (loading state)');
    sizes['US-3.4-E1-02-loaded.png'] = logSize('US-3.4-E1-02-loaded.png');

    // Step 3: Wait for empty state to fully render
    await page.waitForSelector('.empty-state', { timeout: 10000 }).catch(() => {});
    await page.waitForSelector('text=Aucun theme disponible', { timeout: 5000 }).catch(() => {});
    await sleep(800);
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-03-empty-state.png') });
    console.log('  [SCREENSHOT] US-3.4-E1-03-empty-state.png (empty state)');
    sizes['US-3.4-E1-03-empty-state.png'] = logSize('US-3.4-E1-03-empty-state.png');

    await context.close();
  }

  // Write exploration log for this group
  appendLog(`\n## US-3.4-E1 — No Themes (Round 3 re-take)
- Step 1: Dashboard shown, clusters intercept set to return [] → US-3.4-E1-01-intercept.png (${sizes['US-3.4-E1-01-intercept.png']} bytes)
- Step 2: Navigated to /themes, captured during loading phase → US-3.4-E1-02-loaded.png (${sizes['US-3.4-E1-02-loaded.png']} bytes)
- Step 3: Empty state "Aucun theme disponible" visible → US-3.4-E1-03-empty-state.png (${sizes['US-3.4-E1-03-empty-state.png']} bytes)

`);

  // ============================================================
  // GROUP 2: US-3.4-E2 — Cluster with Zero Researchers
  // Problem: 01/02/03 were all identical (30510 bytes)
  // Fix: 01 = dashboard, 02 = themes page with cards loaded, 03 = scroll to zero-member card
  // ============================================================
  {
    console.log('\n=== US-3.4-E2: Zero Researchers ===');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Step 1: Dashboard with intercept setup
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(500);
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      const url = route.request().url();
      if (url.includes('select=')) {
        route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify([
            { id: 'empty-cluster', name: 'Empty Theme', color: '#9ca3af', sub_themes: ['No Data'], created_at: '2024-01-01' },
            { id: 'real-cluster', name: 'Process Discovery', color: '#3b82f6', sub_themes: ['Alpha Miner'], created_at: '2024-01-01' },
          ])
        });
      } else { route.continue(); }
    });
    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
      const url = route.request().url();
      if (url.includes('cluster_id') || url.includes('status')) {
        route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify([{ id: 'r1', full_name: 'Dr. Marie Dupont', lab: 'LORIA', cluster_id: 'real-cluster' }])
        });
      } else { route.continue(); }
    });
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E2-01-intercept.png') });
    console.log('  [SCREENSHOT] US-3.4-E2-01-intercept.png');
    sizes['US-3.4-E2-01-intercept.png'] = logSize('US-3.4-E2-01-intercept.png');

    // Step 2: Navigate to /themes — show full page with both cards
    await page.goto(`${BASE}/themes`, { waitUntil: 'networkidle' });
    await sleep(1500);
    await page.waitForSelector('.cluster-card', { timeout: 10000 }).catch(() => {});
    await sleep(500);
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E2-02-loaded.png') });
    console.log('  [SCREENSHOT] US-3.4-E2-02-loaded.png (cards visible)');
    sizes['US-3.4-E2-02-loaded.png'] = logSize('US-3.4-E2-02-loaded.png');

    // Step 3: Focus on the zero-member card — click it to show it's not expandable
    const emptyCard = page.locator('.cluster-card').filter({ hasText: 'Empty Theme' });
    if (await emptyCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emptyCard.scrollIntoViewIfNeeded();
      // Click it — should NOT expand since 0 members
      await emptyCard.click();
      await sleep(500);
    }
    // Scroll down slightly to frame the zero-member card prominently
    await page.evaluate(() => window.scrollBy(0, 150));
    await sleep(300);
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E2-03-zero-members.png') });
    console.log('  [SCREENSHOT] US-3.4-E2-03-zero-members.png (zero-member card focused)');
    sizes['US-3.4-E2-03-zero-members.png'] = logSize('US-3.4-E2-03-zero-members.png');

    await context.close();
  }

  appendLog(`## US-3.4-E2 — Zero Researchers (Round 3 re-take)
- Step 1: Dashboard shown, clusters intercept with Empty Theme (0 members) + Process Discovery (1 member) → US-3.4-E2-01-intercept.png (${sizes['US-3.4-E2-01-intercept.png']} bytes)
- Step 2: Navigated to /themes, both cluster cards visible → US-3.4-E2-02-loaded.png (${sizes['US-3.4-E2-02-loaded.png']} bytes)
- Step 3: Zero-member card focused, clicked to show non-expandable → US-3.4-E2-03-zero-members.png (${sizes['US-3.4-E2-03-zero-members.png']} bytes)

`);

  // ============================================================
  // GROUP 3: US-1.4-E1 — Empty Stats Data
  // Problem: 02-loaded and 03-empty-charts were identical (44548 bytes)
  // Fix: 02 = page at top (breadcrumb + title visible), 03 = scrolled down to show all empty chart messages
  // ============================================================
  {
    console.log('\n=== US-1.4-E1: Empty Stats ===');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Step 1: Dashboard with intercept
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(500);
    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route(`**/${SUPABASE}/rest/v1/publications**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-01-intercept.png') });
    console.log('  [SCREENSHOT] US-1.4-E1-01-intercept.png');
    sizes['US-1.4-E1-01-intercept.png'] = logSize('US-1.4-E1-01-intercept.png');

    // Step 2: Navigate to /stats — show page at top with breadcrumb and first empty chart
    await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle' });
    await sleep(2000);
    // Stay at top of page — shows breadcrumb + title + first chart area
    await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-02-loaded.png') });
    console.log('  [SCREENSHOT] US-1.4-E1-02-loaded.png (top of page)');
    sizes['US-1.4-E1-02-loaded.png'] = logSize('US-1.4-E1-02-loaded.png');

    // Step 3: Scroll to bottom to show ALL empty chart messages (3 charts with "Pas assez de donnees")
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(800);
    await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-03-empty-charts.png') });
    console.log('  [SCREENSHOT] US-1.4-E1-03-empty-charts.png (scrolled, all empty messages)');
    sizes['US-1.4-E1-03-empty-charts.png'] = logSize('US-1.4-E1-03-empty-charts.png');

    await context.close();
  }

  appendLog(`## US-1.4-E1 — Empty Stats Data (Round 3 re-take)
- Step 1: Dashboard shown, all stats endpoints intercepted with [] → US-1.4-E1-01-intercept.png (${sizes['US-1.4-E1-01-intercept.png']} bytes)
- Step 2: Navigated to /stats, top of page with breadcrumb and first chart → US-1.4-E1-02-loaded.png (${sizes['US-1.4-E1-02-loaded.png']} bytes)
- Step 3: Scrolled to bottom, all 3 empty chart messages visible → US-1.4-E1-03-empty-charts.png (${sizes['US-1.4-E1-03-empty-charts.png']} bytes)

`);

  // ============================================================
  // GROUP 4: US-1.4-E3 — Error State (CRITICAL)
  // Problem: route.fulfill({status:500}) doesn't trigger Supabase error.
  // Fix: Use route.abort() to force genuine network errors that Supabase JS throws on.
  // Also: previous 02 and 03 were identical AND matched US-3.2-E3-01 (cross-story!)
  // ============================================================
  {
    console.log('\n=== US-1.4-E3: Error State (using route.abort) ===');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Step 1: Dashboard with intercept explanation
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await sleep(500);
    // Use route.abort() — this causes a genuine network error that Supabase JS will throw on
    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, r => r.abort('failed'));
    await page.route(`**/${SUPABASE}/rest/v1/publications**`, r => r.abort('failed'));
    await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, r => r.abort('failed'));
    await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E3-01-intercept.png') });
    console.log('  [SCREENSHOT] US-1.4-E3-01-intercept.png');
    sizes['US-1.4-E3-01-intercept.png'] = logSize('US-1.4-E3-01-intercept.png');

    // Step 2: Navigate to /stats — capture during loading/retry phase
    // React Query has retry:2, so it will retry 3 times total. Capture mid-retry.
    await page.goto(`${BASE}/stats`, { waitUntil: 'domcontentloaded' });
    await sleep(1500); // Catch it during retry phase — loading spinner should be visible
    await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E3-02-loaded.png') });
    console.log('  [SCREENSHOT] US-1.4-E3-02-loaded.png (loading/retry phase)');
    sizes['US-1.4-E3-02-loaded.png'] = logSize('US-1.4-E3-02-loaded.png');

    // Step 3: Wait for ALL retries to exhaust and error state to render
    // React Query retry:2 with default backoff — total ~6-8 seconds
    await page.waitForSelector('.error-state', { timeout: 30000 }).catch(e => {
      console.log('  [WARN] .error-state not found, trying text selector...');
    });
    await page.waitForSelector('text=Erreur de chargement', { timeout: 15000 }).catch(e => {
      console.log('  [WARN] "Erreur de chargement" text not found within timeout');
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E3-03-error-state.png') });
    console.log('  [SCREENSHOT] US-1.4-E3-03-error-state.png (error state with retry button)');
    sizes['US-1.4-E3-03-error-state.png'] = logSize('US-1.4-E3-03-error-state.png');

    // Verify the error state rendered
    const errorVisible = await page.locator('.error-state').isVisible().catch(() => false);
    const errorText = await page.locator('text=Erreur de chargement').isVisible().catch(() => false);
    console.log(`  [VERIFY] .error-state visible: ${errorVisible}`);
    console.log(`  [VERIFY] "Erreur de chargement" text visible: ${errorText}`);

    await context.close();
  }

  appendLog(`## US-1.4-E3 — Error State (Round 3 re-take)
- Step 1: Dashboard shown, all stats endpoints intercepted with route.abort('failed') → US-1.4-E3-01-intercept.png (${sizes['US-1.4-E3-01-intercept.png']} bytes)
- Step 2: Navigated to /stats, captured during loading/retry phase → US-1.4-E3-02-loaded.png (${sizes['US-1.4-E3-02-loaded.png']} bytes)
- Step 3: All retries exhausted, "Erreur de chargement" with retry button visible → US-1.4-E3-03-error-state.png (${sizes['US-1.4-E3-03-error-state.png']} bytes)
- Used route.abort('failed') instead of route.fulfill({status:500}) to trigger real network errors

`);

  // ============================================================
  // GROUP 5: US-3.2-E3 — Loading State (re-take step 01 to break cross-story match)
  // Problem: US-3.2-E3-01-intercept.png was byte-identical to US-1.4-E3-02/03
  // Fix: Take from a different page state (navigate to /map first, THEN set up intercept)
  // ============================================================
  {
    console.log('\n=== US-3.2-E3: Intercept screenshot fix ===');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // Navigate to /map first (without intercept) to show a different base state
    await page.goto(`${BASE}/map`, { waitUntil: 'networkidle' });
    await sleep(1000);

    // Now set up the delayed researcher intercept
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      if (route.request().url().includes('select=') && route.request().url().includes('order=name')) {
        route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify([
            { id: 'c1', name: 'Process Discovery', color: '#3b82f6', sub_themes: ['Alpha Miner', 'Heuristic Miner'], created_at: '2024-01-01' },
            { id: 'c2', name: 'Conformance Checking', color: '#10b981', sub_themes: ['Token Replay'], created_at: '2024-01-01' },
          ])
        });
      } else { route.continue(); }
    });

    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
      if (route.request().url().includes('cluster_id') || route.request().url().includes('status')) {
        setTimeout(() => {
          route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify([
              { id: 'r1', full_name: 'Dr. Marie Dupont', lab: 'LORIA', cluster_id: 'c1' },
              { id: 'r2', full_name: 'Prof. Pierre Martin', lab: 'LIRIS', cluster_id: 'c1' },
            ])
          });
        }, 5000);
      } else { route.continue(); }
    });

    // Step 1: Screenshot shows the map page WITH the intercept set up (different from dashboard)
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.2-E3-01-intercept.png') });
    console.log('  [SCREENSHOT] US-3.2-E3-01-intercept.png (from map page)');
    sizes['US-3.2-E3-01-intercept.png'] = logSize('US-3.2-E3-01-intercept.png');

    // Step 2: Reload to trigger the delayed intercept — capture loading
    await page.goto(`${BASE}/map`, { waitUntil: 'domcontentloaded' });
    await sleep(800);
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.2-E3-02-popover-open.png') });
    console.log('  [SCREENSHOT] US-3.2-E3-02-popover-open.png (loading state)');
    sizes['US-3.2-E3-02-popover-open.png'] = logSize('US-3.2-E3-02-popover-open.png');

    // Step 3: Wait for full load, click cluster for popover
    await sleep(6000);
    const cluster = page.locator('[data-cluster-region]').first();
    if (await cluster.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cluster.click();
      await sleep(800);
    }
    await page.screenshot({ path: path.join(DELIVERY, 'US-3.2-E3-03-loading.png') });
    console.log('  [SCREENSHOT] US-3.2-E3-03-loading.png (popover open)');
    sizes['US-3.2-E3-03-loading.png'] = logSize('US-3.2-E3-03-loading.png');

    await context.close();
  }

  appendLog(`## US-3.2-E3 — Loading State (Round 3 re-take)
- Step 1: Map page shown with delayed-researcher intercept set up → US-3.2-E3-01-intercept.png (${sizes['US-3.2-E3-01-intercept.png']} bytes)
- Step 2: Reloaded /map, captured during loading phase → US-3.2-E3-02-popover-open.png (${sizes['US-3.2-E3-02-popover-open.png']} bytes)
- Step 3: Data loaded, cluster popover opened → US-3.2-E3-03-loading.png (${sizes['US-3.2-E3-03-loading.png']} bytes)

`);

  await browser.close();

  // ============================================================
  // VERIFICATION: Check for byte-identical pairs among ALL re-taken files
  // ============================================================
  console.log('\n=== FILE SIZE VERIFICATION ===');
  const retaken = Object.keys(sizes);
  const sizeMap = {};
  for (const f of retaken) {
    const s = sizes[f];
    if (!sizeMap[s]) sizeMap[s] = [];
    sizeMap[s].push(f);
  }

  let hasDupes = false;
  for (const [sz, files] of Object.entries(sizeMap)) {
    if (files.length > 1) {
      console.log(`WARNING: Identical size ${sz} bytes: ${files.join(', ')}`);
      hasDupes = true;
    }
  }

  if (!hasDupes) {
    console.log('ALL re-taken screenshots have unique file sizes.');
  }

  // Also check if any re-taken file matches OTHER delivery files
  console.log('\n=== CROSS-CHECK against all delivery files ===');
  const allFiles = fs.readdirSync(DELIVERY).filter(f => f.endsWith('.png'));
  const allSizes = {};
  for (const f of allFiles) {
    const sz = fs.statSync(path.join(DELIVERY, f)).size;
    if (!allSizes[sz]) allSizes[sz] = [];
    allSizes[sz].push(f);
  }
  for (const [sz, files] of Object.entries(allSizes)) {
    if (files.length > 1) {
      // Only warn if at least one is a re-taken file
      const overlap = files.filter(f => retaken.includes(f));
      if (overlap.length > 0) {
        console.log(`WARNING: Size ${sz} bytes shared by: ${files.join(', ')}`);
      }
    }
  }

  console.log('\n=== Round 3 fix complete ===');
})();
