// FT-001: Dashboard Stats Display — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Stats cards display with current counts
  let start = Date.now();
  await page.goto(BASE);
  const statCards = await page.locator('[data-testid="stat-card"]').count();
  results.push({
    id: 'AC-1',
    criterion: '4 stat cards display with current counts',
    status: statCards === 4 ? 'pass' : 'fail',
    detail: `Found ${statCards} stat cards`,
    duration: Date.now() - start
  });

  // AC-2: Stat numbers are not empty (real data loaded)
  start = Date.now();
  const firstValue = await page.locator('[data-testid="stat-card"] .stat-number').first().textContent();
  const isNumeric = /^\d/.test(firstValue.trim());
  results.push({
    id: 'AC-2',
    criterion: 'Stat numbers update from real API data',
    status: isNumeric ? 'pass' : 'fail',
    detail: `First stat value: "${firstValue}"`,
    duration: Date.now() - start
  });

  // AC-3: Click stat card navigates to corresponding section
  start = Date.now();
  await page.locator('[data-testid="stat-card"]').first().click();
  await page.waitForURL(/\/(researchers|themes|map)/);
  const url = page.url();
  results.push({
    id: 'AC-3',
    criterion: 'Clicking stat card navigates to corresponding section',
    status: url !== BASE + '/' ? 'pass' : 'fail',
    detail: `Navigated to: ${url}`,
    duration: Date.now() - start
  });

  // Edge Case E1: API unreachable
  start = Date.now();
  await page.route('**/api/stats', route => route.abort());
  await page.goto(BASE);
  const errorState = await page.locator('[data-testid="stats-error"], [data-testid="retry-button"]').count();
  results.push({
    id: 'E1',
    criterion: 'API unreachable shows error/retry state',
    status: errorState > 0 ? 'pass' : 'fail',
    detail: `Error state elements found: ${errorState}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/stats');

  // Edge Case E2: Empty database (all zeros)
  start = Date.now();
  await page.route('**/api/stats', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ researchers: 0, themes: 0, clusters: 0, publications: 0 })
  }));
  await page.goto(BASE);
  const zeroValues = await page.locator('[data-testid="stat-card"] .stat-number').allTextContents();
  const allZero = zeroValues.every(v => v.trim() === '0');
  results.push({
    id: 'E2',
    criterion: 'Empty database shows all zeros',
    status: allZero ? 'pass' : 'fail',
    detail: `Values: ${zeroValues.join(', ')}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/stats');

  // Edge Case E3: Large numbers formatted
  start = Date.now();
  await page.route('**/api/stats', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ researchers: 100000, themes: 500, clusters: 50, publications: 999999 })
  }));
  await page.goto(BASE);
  const largeValue = await page.locator('[data-testid="stat-card"] .stat-number').first().textContent();
  const hasFormatting = /\s|,|\./.test(largeValue.trim());
  results.push({
    id: 'E3',
    criterion: 'Large numbers formatted with separators',
    status: hasFormatting ? 'pass' : 'fail',
    detail: `Large value displayed as: "${largeValue}"`,
    duration: Date.now() - start
  });

  return results;
};
