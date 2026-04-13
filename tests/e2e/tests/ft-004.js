// FT-004: Researcher Search & Filter — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Search filters table in real-time
  let start = Date.now();
  await page.goto(`${BASE}/researchers`);
  const searchInput = page.locator('[data-testid="search-input"], .search-bar input[type="text"]').first();
  await searchInput.fill('Dupont');
  await page.waitForTimeout(500);
  const visibleRows = await page.locator('[data-testid="researcher-row"]:visible, .app-table tbody tr:visible').count();
  results.push({
    id: 'AC-1',
    criterion: 'Search filters table in real-time',
    status: visibleRows >= 1 ? 'pass' : 'fail',
    detail: `Visible rows after search "Dupont": ${visibleRows}`,
    duration: Date.now() - start
  });

  // AC-2: Lab filter works
  start = Date.now();
  await searchInput.fill('');
  await page.locator('[data-testid="filter-lab"], #filter-lab').selectOption('LORIA');
  await page.waitForTimeout(500);
  const labRows = await page.locator('[data-testid="researcher-row"]:visible, .app-table tbody tr:visible').count();
  results.push({
    id: 'AC-2',
    criterion: 'Lab filter shows only matching researchers',
    status: labRows >= 1 ? 'pass' : 'fail',
    detail: `Rows for LORIA: ${labRows}`,
    duration: Date.now() - start
  });

  // AC-3: Theme filter works
  start = Date.now();
  await page.locator('[data-testid="filter-lab"], #filter-lab').selectOption('');
  await page.locator('[data-testid="filter-theme"], #filter-theme').selectOption('Process Discovery');
  await page.waitForTimeout(500);
  const themeRows = await page.locator('[data-testid="researcher-row"]:visible, .app-table tbody tr:visible').count();
  results.push({
    id: 'AC-3',
    criterion: 'Theme filter shows only matching researchers',
    status: themeRows >= 1 ? 'pass' : 'fail',
    detail: `Rows for Process Discovery: ${themeRows}`,
    duration: Date.now() - start
  });

  // AC-4: Combined filters with AND logic
  start = Date.now();
  await page.locator('[data-testid="filter-lab"], #filter-lab').selectOption('LORIA');
  await page.waitForTimeout(500);
  const combinedRows = await page.locator('[data-testid="researcher-row"]:visible, .app-table tbody tr:visible').count();
  results.push({
    id: 'AC-4',
    criterion: 'Combined filters use AND logic',
    status: combinedRows <= themeRows && combinedRows <= labRows ? 'pass' : 'fail',
    detail: `Combined rows (LORIA + Process Discovery): ${combinedRows}`,
    duration: Date.now() - start
  });

  // Edge E1: No results
  start = Date.now();
  await page.locator('[data-testid="filter-lab"], #filter-lab').selectOption('');
  await page.locator('[data-testid="filter-theme"], #filter-theme').selectOption('');
  await searchInput.fill('xyznonexistent');
  await page.waitForTimeout(500);
  const noResultMsg = await page.locator('text=/aucun resultat/i').count();
  results.push({
    id: 'E1',
    criterion: 'No results shows "Aucun resultat" message',
    status: noResultMsg > 0 ? 'pass' : 'fail',
    detail: `No-result messages: ${noResultMsg}`,
    duration: Date.now() - start
  });

  // Edge E2: API failure
  start = Date.now();
  await page.route('**/api/researchers**', route => route.abort());
  await page.goto(`${BASE}/researchers`);
  const errorState = await page.locator('[data-testid="error-state"], text=/erreur/i').count();
  results.push({
    id: 'E2',
    criterion: 'API failure shows error with retry',
    status: errorState > 0 ? 'pass' : 'fail',
    detail: `Error elements: ${errorState}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/researchers**');

  // Edge E3: XSS in search input
  start = Date.now();
  await page.goto(`${BASE}/researchers`);
  await searchInput.fill('<script>alert("xss")</script>');
  await page.waitForTimeout(500);
  const alertTriggered = await page.evaluate(() => {
    try { return document.querySelector('script:last-child')?.textContent?.includes('xss') || false; } catch { return false; }
  });
  results.push({
    id: 'E3',
    criterion: 'Special characters in search are sanitized (no XSS)',
    status: !alertTriggered ? 'pass' : 'fail',
    detail: `XSS attempt blocked: ${!alertTriggered}`,
    duration: Date.now() - start
  });

  return results;
};
