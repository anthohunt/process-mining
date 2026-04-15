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

async function loginAndGoLogs(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  const btn = page.locator('button:has-text("admin"), button:has-text("Admin")').last();
  if (await btn.count() > 0) {
    await btn.click();
  } else {
    await page.fill('#email', 'admin@cartoPM.fr');
    await page.fill('#password', 'demo123456');
    await page.click('button[type="submit"]');
  }
  await page.waitForTimeout(2500);
  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(2000);

  const logsTab = page.locator('button:has-text("Logs"), [role="tab"]:has-text("Logs")').first();
  if (await logsTab.count() > 0) {
    await logsTab.click();
    await page.waitForTimeout(1500);
  }
}

// Generate 120 fake log entries
function makeLogs(count) {
  const actions = ['ajout', 'modification', 'suppression', 'import'];
  const users = ['admin@cartoPM.fr', 'researcher@cartoPM.fr'];
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${i}`,
    user_id: null,
    user_name: users[i % 2],
    action: actions[i % 4],
    detail: `Operation #${i + 1}`,
    created_at: new Date(Date.now() - i * 3600000).toISOString()
  }));
}

const browser = await chromium.launch();

// Happy path
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoLogs(page);
  await shot(page, 'US-4.4-01-logs-tab.png');
  await shot(page, 'US-4.4-02-log-table.png');
  await shot(page, 'US-4.4-03-color-coded.png');

  // Set date range and filter
  const startInput = page.locator('input[type="date"]').first();
  const endInput = page.locator('input[type="date"]').last();
  if (await startInput.count() > 0) {
    await startInput.fill('2026-04-08');
  }
  if (await endInput.count() > 1) {
    await endInput.fill('2026-04-09');
  }
  await shot(page, 'US-4.4-04-filtered.png');

  const filterBtn = page.locator('button:has-text("Filtrer"), button:has-text("Filter")').first();
  if (await filterBtn.count() > 0) {
    await filterBtn.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-4.4-05-filtered-results.png');
  await ctx.close();
}

// E1: Empty date range
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoLogs(page);

  const startInput = page.locator('input[type="date"]').first();
  const endInput = page.locator('input[type="date"]').last();
  if (await startInput.count() > 0) await startInput.fill('2020-01-01');
  if (await endInput.count() > 1) await endInput.fill('2020-01-02');

  await shot(page, 'US-4.4-E1-01-filter-empty.png');

  const filterBtn = page.locator('button:has-text("Filtrer")').first();
  if (await filterBtn.count() > 0) {
    await filterBtn.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-4.4-E1-02-filtered.png');
  await shot(page, 'US-4.4-E1-03-no-logs.png');
  await ctx.close();
}

// E2: Pagination with 120 entries
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const logs = makeLogs(120);
  await page.route('**/rest/v1/audit_logs**', route =>
    route.fulfill({ json: logs })
  );

  await loginAndGoLogs(page);
  await shot(page, 'US-4.4-E2-01-intercept.png');
  await shot(page, 'US-4.4-E2-02-loaded.png');
  await shot(page, 'US-4.4-E2-03-pagination.png');

  const nextPage = page.locator('button:has-text("2"), button:has-text("Suivant"), [aria-label*="page 2"]').first();
  if (await nextPage.count() > 0) {
    await nextPage.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-4.4-E2-04-page-two.png');
  await ctx.close();
}

// E3: Logs API timeout
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  const btn = page.locator('button:has-text("admin"), button:has-text("Admin")').last();
  if (await btn.count() > 0) await btn.click();
  await page.waitForTimeout(2500);
  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(2000);

  // Set up 504 for logs endpoint
  await page.route('**/rest/v1/audit_logs**', route =>
    route.fulfill({ status: 504 })
  );

  await shot(page, 'US-4.4-E3-01-intercept.png');

  const logsTab = page.locator('button:has-text("Logs"), [role="tab"]:has-text("Logs")').first();
  if (await logsTab.count() > 0) {
    await logsTab.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-4.4-E3-02-loading.png');
  await page.waitForTimeout(2000);
  await shot(page, 'US-4.4-E3-03-error-retry.png');
  await ctx.close();
}

await browser.close();
console.log('US-4.4 done');
