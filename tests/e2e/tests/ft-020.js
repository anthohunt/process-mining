// FT-020: Admin Audit Logs — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // Login as admin
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);

  // AC-1: Log table displays
  let start = Date.now();
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/logs/i').first().click();
  await page.waitForTimeout(300);
  const logRows = await page.locator('.app-table tbody tr, [data-testid="log-row"]').count();
  results.push({
    id: 'AC-1',
    criterion: 'Log table displays entries',
    status: logRows > 0 ? 'pass' : 'fail',
    detail: `Log rows: ${logRows}`,
    duration: Date.now() - start
  });

  // AC-2: Date range filter works
  start = Date.now();
  const dateInputs = await page.locator('input[type="date"]').count();
  results.push({
    id: 'AC-2',
    criterion: 'Date range filter inputs present',
    status: dateInputs >= 2 ? 'pass' : 'fail',
    detail: `Date inputs: ${dateInputs}`,
    duration: Date.now() - start
  });

  // AC-3: Color-coded action tags
  start = Date.now();
  const actionTags = await page.locator('.tag-blue, .tag-green, .tag-red, .tag-orange, [data-testid="action-tag"]').count();
  results.push({
    id: 'AC-3',
    criterion: 'Actions are color-coded tags',
    status: actionTags > 0 ? 'pass' : 'fail',
    detail: `Action tags: ${actionTags}`,
    duration: Date.now() - start
  });

  // Edge E1: Empty date range
  start = Date.now();
  await page.locator('input[type="date"]').first().fill('2020-01-01');
  await page.locator('input[type="date"]').nth(1).fill('2020-01-02');
  await page.locator('button:has-text("Filtrer")').click();
  await page.waitForTimeout(500);
  const emptyMsg = await page.locator('text=/aucun log/i').count();
  results.push({
    id: 'E1',
    criterion: 'Empty date range shows "Aucun log" message',
    status: emptyMsg > 0 ? 'pass' : 'fail',
    detail: `Empty messages: ${emptyMsg}`,
    duration: Date.now() - start
  });

  // Edge E2: Pagination with many logs
  start = Date.now();
  const manyLogs = Array.from({ length: 120 }, (_, i) => ({
    id: String(i), user_name: 'User', action: 'Modification', detail: `Log ${i}`, created_at: '2026-04-10T10:00:00Z'
  }));
  await page.route('**/api/admin/logs**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ logs: manyLogs.slice(0, 50), total: 120, page: 1, pages: 3 })
  }));
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/logs/i').first().click();
  await page.waitForTimeout(500);
  const pagination = await page.locator('[data-testid="pagination"], nav[aria-label="pagination"], text=/page/i').count();
  results.push({
    id: 'E2',
    criterion: 'Many logs triggers pagination',
    status: pagination > 0 ? 'pass' : 'fail',
    detail: `Pagination elements: ${pagination}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/admin/logs**');

  // Edge E3: Logs API timeout
  start = Date.now();
  await page.route('**/api/admin/logs**', route => route.fulfill({ status: 504 }));
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/logs/i').first().click();
  await page.waitForTimeout(500);
  const errorMsg = await page.locator('text=/echoue/i, text=/erreur/i, [data-testid="logs-error"]').count();
  results.push({
    id: 'E3',
    criterion: 'API timeout shows error with retry',
    status: errorMsg > 0 ? 'pass' : 'fail',
    detail: `Error elements: ${errorMsg}`,
    duration: Date.now() - start
  });

  return results;
};
