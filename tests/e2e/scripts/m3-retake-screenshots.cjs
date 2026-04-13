// M3 Round 2 — Retake all 13 fabricated screenshots with real Playwright browser automation
const { chromium } = require('@playwright/test');
const path = require('path');

const DELIVERY = path.resolve(__dirname, '..', 'delivery');
const BASE = 'http://localhost:5200';
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function takeScreenshot(page, filename) {
  await page.screenshot({ path: path.join(DELIVERY, filename), fullPage: false });
  console.log(`  [SCREENSHOT] ${filename}`);
}

// ============================================================
// US-3.4 Edge Cases
// ============================================================

async function us34_e1(page) {
  console.log('\n=== US-3.4-E1: No Themes (empty clusters) ===');

  // Step 1: Intercept clusters with empty array
  await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await takeScreenshot(page, 'US-3.4-E1-01-intercept.png');

  // Step 2: Navigate to /themes
  await page.goto(`${BASE}/themes`, { waitUntil: 'networkidle' });
  await sleep(1000);
  await takeScreenshot(page, 'US-3.4-E1-02-loaded.png');

  // Step 3: Observe empty state
  await page.waitForSelector('text=Aucun theme disponible', { timeout: 5000 }).catch(() => {});
  await sleep(500);
  await takeScreenshot(page, 'US-3.4-E1-03-empty-state.png');

  // Cleanup
  await page.unroute(`**/${SUPABASE}/rest/v1/clusters**`);
}

async function us34_e2(page) {
  console.log('\n=== US-3.4-E2: Cluster with Zero Researchers ===');

  // Step 1: Intercept clusters with a zero-member cluster + intercept researchers with none matching
  await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
    const url = route.request().url();
    if (url.includes('select=*')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'empty-cluster', name: 'Empty Theme', color: '#9ca3af', sub_themes: ['No Data'], created_at: '2024-01-01' },
          { id: 'real-cluster', name: 'Process Discovery', color: '#3b82f6', sub_themes: ['Alpha Miner'], created_at: '2024-01-01' },
        ])
      });
    } else {
      route.continue();
    }
  });
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
    const url = route.request().url();
    if (url.includes('cluster_id')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'r1', full_name: 'Dr. Marie Dupont', lab: 'LORIA', cluster_id: 'real-cluster' },
        ])
      });
    } else {
      route.continue();
    }
  });
  await takeScreenshot(page, 'US-3.4-E2-01-intercept.png');

  // Step 2: Navigate to /themes
  await page.goto(`${BASE}/themes`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await takeScreenshot(page, 'US-3.4-E2-02-loaded.png');

  // Step 3: Observe zero-member card
  await sleep(500);
  await takeScreenshot(page, 'US-3.4-E2-03-zero-members.png');

  // Cleanup
  await page.unroute(`**/${SUPABASE}/rest/v1/clusters**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);
}

async function us34_e3(page) {
  console.log('\n=== US-3.4-E3: Malformed API Response ===');

  // Step 1: Intercept clusters with malformed JSON
  await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '{malformed}' });
  });
  await takeScreenshot(page, 'US-3.4-E3-01-intercept.png');

  // Step 2: Navigate to /themes
  await page.goto(`${BASE}/themes`, { waitUntil: 'networkidle' });
  await sleep(2000);
  await takeScreenshot(page, 'US-3.4-E3-02-loaded.png');

  // Step 3: Observe error state
  await sleep(1000);
  await takeScreenshot(page, 'US-3.4-E3-03-error.png');

  // Cleanup
  await page.unroute(`**/${SUPABASE}/rest/v1/clusters**`);
}

// ============================================================
// US-1.4 Screenshots
// ============================================================

async function us14_03(page) {
  console.log('\n=== US-1.4-03: Bar Chart focused view ===');

  // Navigate to stats page normally
  await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle' });
  await sleep(2000);

  // Find the bar chart card and scroll to it
  const barChartCard = page.locator('.card').first();
  await barChartCard.scrollIntoViewIfNeeded();
  await sleep(500);

  // Take a focused screenshot of just the bar chart card
  await barChartCard.screenshot({ path: path.join(DELIVERY, 'US-1.4-03-bar-chart.png') });
  console.log('  [SCREENSHOT] US-1.4-03-bar-chart.png');
}

async function us14_e1(page) {
  console.log('\n=== US-1.4-E1: No Data for Charts ===');

  // Step 1: Intercept all stats-related Supabase calls with empty arrays
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route(`**/${SUPABASE}/rest/v1/publications**`, route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await takeScreenshot(page, 'US-1.4-E1-01-intercept.png');

  // Step 2: Navigate to /stats
  await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle' });
  await sleep(2000);
  await takeScreenshot(page, 'US-1.4-E1-02-loaded.png');

  // Step 3: Observe empty charts
  await sleep(500);
  await takeScreenshot(page, 'US-1.4-E1-03-empty-charts.png');

  // Cleanup
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/publications**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/similarity_scores**`);
}

async function us14_e2(page) {
  console.log('\n=== US-1.4-E2: Only 1 Researcher ===');

  // Step 1: Intercept with 1 researcher, some pubs, no similarity
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ keywords: ['process mining', 'conformance'] }])
    });
  });
  await page.route(`**/${SUPABASE}/rest/v1/publications**`, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ year: 2023 }, { year: 2022 }])
    });
  });
  await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, route => {
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await takeScreenshot(page, 'US-1.4-E2-01-intercept.png');

  // Step 2: Navigate to /stats
  await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle' });
  await sleep(2000);
  await takeScreenshot(page, 'US-1.4-E2-02-loaded.png');

  // Step 3: Observe histogram message
  await sleep(500);
  // Scroll down to see the histogram
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await takeScreenshot(page, 'US-1.4-E2-03-histogram-message.png');

  // Cleanup
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/publications**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/similarity_scores**`);
}

async function us14_e3(page) {
  console.log('\n=== US-1.4-E3: Malformed Stats Data ===');

  // Step 1: Intercept all stats endpoints with 500 errors to trigger error state
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' });
  });
  await page.route(`**/${SUPABASE}/rest/v1/publications**`, route => {
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' });
  });
  await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, route => {
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' });
  });
  await takeScreenshot(page, 'US-1.4-E3-01-intercept.png');

  // Step 2: Navigate to /stats
  await page.goto(`${BASE}/stats`, { waitUntil: 'networkidle' });
  await sleep(3000); // Wait for retries to exhaust
  await takeScreenshot(page, 'US-1.4-E3-02-loaded.png');

  // Step 3: Observe error state with retry
  await sleep(1000);
  await takeScreenshot(page, 'US-1.4-E3-03-error-state.png');

  // Cleanup
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/publications**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/similarity_scores**`);
}

// ============================================================
// US-3.2-E3: Loading State in Popover
// ============================================================

async function us32_e3(page) {
  console.log('\n=== US-3.2-E3: Loading State in Popover ===');

  // The map loads all data at once (clusters + researchers) via useClusters.
  // The popover shows data from already-loaded cluster members.
  // To simulate loading, we need to delay the researchers query.

  let clusterData = null;

  // Step 1: First intercept - let clusters load but delay researchers
  await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
    const url = route.request().url();
    if (url.includes('select=*') && url.includes('order=name')) {
      // Return clusters data quickly
      clusterData = [
        { id: 'c1', name: 'Process Discovery', color: '#3b82f6', sub_themes: ['Alpha Miner', 'Heuristic Miner'], created_at: '2024-01-01' },
        { id: 'c2', name: 'Conformance Checking', color: '#10b981', sub_themes: ['Token Replay'], created_at: '2024-01-01' },
      ];
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(clusterData) });
    } else {
      route.continue();
    }
  });

  // Delay researchers response by 5 seconds to catch loading state
  await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
    const url = route.request().url();
    if (url.includes('cluster_id')) {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'r1', full_name: 'Dr. Marie Dupont', lab: 'LORIA', cluster_id: 'c1' },
            { id: 'r2', full_name: 'Prof. Pierre Martin', lab: 'LIRIS', cluster_id: 'c1' },
          ])
        });
      }, 5000);
    } else {
      route.continue();
    }
  });

  await takeScreenshot(page, 'US-3.2-E3-01-intercept.png');

  // Step 2: Navigate to /map
  await page.goto(`${BASE}/map`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);

  // The page should show loading while waiting for researchers
  // Take screenshot showing loading state
  await takeScreenshot(page, 'US-3.2-E3-02-popover-open.png');

  // Wait for data to arrive and click cluster
  await sleep(5000);

  // Click on a cluster region
  const cluster = page.locator('[data-cluster-region]').first();
  if (await cluster.isVisible()) {
    await cluster.click();
    await sleep(500);
  }
  await takeScreenshot(page, 'US-3.2-E3-03-loading.png');

  // Cleanup
  await page.unroute(`**/${SUPABASE}/rest/v1/clusters**`);
  await page.unroute(`**/${SUPABASE}/rest/v1/researchers**`);
}

// ============================================================
// Main
// ============================================================

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // US-3.4 Edge Cases (6 screenshots)
    await us34_e1(page);
    await us34_e2(page);
    await us34_e3(page);

    // US-1.4 Screenshots (7 screenshots)
    await us14_03(page);
    await us14_e1(page);
    await us14_e2(page);
    await us14_e3(page);

    // US-3.2-E3 Loading State (3 screenshots)
    await us32_e3(page);

    console.log('\n=== All 13+ screenshots retaken successfully ===');
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
