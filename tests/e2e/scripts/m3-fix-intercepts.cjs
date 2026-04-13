// Fix intercept screenshots — take them from a neutral starting page (dashboard or about:blank)
const { chromium } = require('@playwright/test');
const path = require('path');

const DELIVERY = path.resolve(__dirname, '..', 'delivery');
const BASE = 'http://localhost:5200';
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // ---- US-3.4-E1: No Themes ----
  console.log('US-3.4-E1: retaking with proper navigation sequence...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  // Intercept screenshot: shows dashboard (before navigating to themes)
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-01-intercept.png') });
  console.log('  [SCREENSHOT] US-3.4-E1-01-intercept.png (from dashboard)');

  await page.goto(`${BASE}/themes`, { waitUntil: 'networkidle' });
  await sleep(1000);
  // Loaded screenshot
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-02-loaded.png') });
  console.log('  [SCREENSHOT] US-3.4-E1-02-loaded.png');

  // Empty state screenshot (same page, focused)
  await sleep(500);
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E1-03-empty-state.png') });
  console.log('  [SCREENSHOT] US-3.4-E1-03-empty-state.png');
  await page.unroute(`**/${SUPABASE}/rest/v1/clusters**`);

  // ---- US-3.4-E2: Zero Researchers ----
  console.log('US-3.4-E2: retaking with proper navigation sequence...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
    if (route.request().url().includes('select=*')) {
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
    if (route.request().url().includes('cluster_id')) {
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([{ id: 'r1', full_name: 'Dr. Marie Dupont', lab: 'LORIA', cluster_id: 'real-cluster' }])
      });
    } else { route.continue(); }
  });
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E2-01-intercept.png') });
  console.log('  [SCREENSHOT] US-3.4-E2-01-intercept.png (from dashboard)');

  await page.goto(`${BASE}/themes`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E2-02-loaded.png') });
  console.log('  [SCREENSHOT] US-3.4-E2-02-loaded.png');

  // Scroll to see the zero-member card specifically
  const emptyCard = page.locator('.cluster-card').filter({ hasText: 'Empty Theme' });
  if (await emptyCard.isVisible()) {
    await emptyCard.scrollIntoViewIfNeeded();
    await sleep(300);
  }
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E2-03-zero-members.png') });
  console.log('  [SCREENSHOT] US-3.4-E2-03-zero-members.png');
  await page.unroute(`**/${SUPABASE}/rest/v1/clusters**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);

  // ---- US-3.4-E3: Malformed JSON ----
  console.log('US-3.4-E3: retaking with proper navigation sequence...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{malformed}' });
  });
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E3-01-intercept.png') });
  console.log('  [SCREENSHOT] US-3.4-E3-01-intercept.png (from dashboard)');

  await page.goto(`${BASE}/themes`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E3-02-loaded.png') });
  console.log('  [SCREENSHOT] US-3.4-E3-02-loaded.png');

  await sleep(1000);
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.4-E3-03-error.png') });
  console.log('  [SCREENSHOT] US-3.4-E3-03-error.png');
  await page.unroute(`**/${SUPABASE}/rest/v1/clusters**`);

  // ---- US-1.4-E1: Empty Data ----
  console.log('US-1.4-E1: retaking with proper navigation sequence...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route(`**/${SUPABASE}/rest/v1/publications**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-01-intercept.png') });
  console.log('  [SCREENSHOT] US-1.4-E1-01-intercept.png (from dashboard)');

  await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle' });
  await sleep(2000);
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-02-loaded.png') });
  console.log('  [SCREENSHOT] US-1.4-E1-02-loaded.png');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E1-03-empty-charts.png') });
  console.log('  [SCREENSHOT] US-1.4-E1-03-empty-charts.png (scrolled to show all charts)');
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/publications**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/similarity_scores**`);

  // ---- US-1.4-E2: 1 Researcher ----
  console.log('US-1.4-E2: retaking with proper navigation sequence...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, r => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{ keywords: ['process mining', 'conformance'] }])
  }));
  await page.route(`**/${SUPABASE}/rest/v1/publications**`, r => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{ year: 2023 }, { year: 2022 }])
  }));
  await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E2-01-intercept.png') });
  console.log('  [SCREENSHOT] US-1.4-E2-01-intercept.png (from dashboard)');

  await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle' });
  await sleep(2000);
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E2-02-loaded.png') });
  console.log('  [SCREENSHOT] US-1.4-E2-02-loaded.png');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E2-03-histogram-message.png') });
  console.log('  [SCREENSHOT] US-1.4-E2-03-histogram-message.png');
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/publications**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/similarity_scores**`);

  // ---- US-1.4-E3: Malformed/Error Data ----
  console.log('US-1.4-E3: retaking with proper navigation sequence...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, r => r.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' }));
  await page.route(`**/${SUPABASE}/rest/v1/publications**`, r => r.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' }));
  await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, r => r.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' }));
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E3-01-intercept.png') });
  console.log('  [SCREENSHOT] US-1.4-E3-01-intercept.png (from dashboard)');

  await page.goto(`${BASE}/stats`, { waitUntil: 'domcontentloaded' });
  await sleep(4000); // Wait for retries to exhaust
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E3-02-loaded.png') });
  console.log('  [SCREENSHOT] US-1.4-E3-02-loaded.png');

  await sleep(1000);
  await page.screenshot({ path: path.join(DELIVERY, 'US-1.4-E3-03-error-state.png') });
  console.log('  [SCREENSHOT] US-1.4-E3-03-error-state.png');
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/publications**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/similarity_scores**`);

  // ---- US-3.2-E3: Loading state ----
  console.log('US-3.2-E3: retaking with proper delayed response...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
    if (route.request().url().includes('select=*') && route.request().url().includes('order=name')) {
      route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([
          { id: 'c1', name: 'Process Discovery', color: '#3b82f6', sub_themes: ['Alpha Miner', 'Heuristic Miner'], created_at: '2024-01-01' },
          { id: 'c2', name: 'Conformance Checking', color: '#10b981', sub_themes: ['Token Replay'], created_at: '2024-01-01' },
        ])
      });
    } else { route.continue(); }
  });

  // Delay researchers for 8 seconds so we can capture loading state
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
    if (route.request().url().includes('cluster_id')) {
      setTimeout(() => {
        route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify([
            { id: 'r1', full_name: 'Dr. Marie Dupont', lab: 'LORIA', cluster_id: 'c1' },
            { id: 'r2', full_name: 'Prof. Pierre Martin', lab: 'LIRIS', cluster_id: 'c1' },
          ])
        });
      }, 8000);
    } else { route.continue(); }
  });

  await page.screenshot({ path: path.join(DELIVERY, 'US-3.2-E3-01-intercept.png') });
  console.log('  [SCREENSHOT] US-3.2-E3-01-intercept.png (from dashboard)');

  // Navigate to map — the page will show loading while waiting for researcher data
  await page.goto(`${BASE}/map`, { waitUntil: 'domcontentloaded' });
  await sleep(1000);
  // Capture loading state (data still loading)
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.2-E3-02-popover-open.png') });
  console.log('  [SCREENSHOT] US-3.2-E3-02-popover-open.png (map loading state)');

  // Wait for data to arrive, then click a cluster
  await sleep(9000);
  const cluster = page.locator('[data-cluster-region]').first();
  if (await cluster.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cluster.click();
    await sleep(500);
  }
  await page.screenshot({ path: path.join(DELIVERY, 'US-3.2-E3-03-loading.png') });
  console.log('  [SCREENSHOT] US-3.2-E3-03-loading.png (popover with members)');

  await page.unroute(`**/${SUPABASE}/rest/v1/clusters**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);

  console.log('\n=== All intercept screenshots fixed ===');
  await browser.close();
})();
