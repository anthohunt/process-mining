// FT-003: Mini-Map Preview — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: SVG preview renders in mini-map
  let start = Date.now();
  await page.goto(BASE);
  const miniMapSvg = await page.locator('[data-testid="mini-map"] svg, .mini-map-container svg').count();
  results.push({
    id: 'AC-1',
    criterion: 'SVG preview renders in mini-map area',
    status: miniMapSvg > 0 ? 'pass' : 'fail',
    detail: `SVG elements found: ${miniMapSvg}`,
    duration: Date.now() - start
  });

  // AC-2: Hover shows pointer cursor and blue outline
  start = Date.now();
  const miniMap = page.locator('[data-testid="mini-map"], .mini-map-container').first();
  await miniMap.hover();
  const cursor = await miniMap.evaluate(el => getComputedStyle(el).cursor);
  results.push({
    id: 'AC-2',
    criterion: 'Hover shows pointer cursor',
    status: cursor === 'pointer' ? 'pass' : 'fail',
    detail: `Cursor on hover: ${cursor}`,
    duration: Date.now() - start
  });

  // AC-3: Click navigates to full map
  start = Date.now();
  await miniMap.click();
  await page.waitForURL(/\/map/);
  results.push({
    id: 'AC-3',
    criterion: 'Click navigates to full map view',
    status: page.url().includes('/map') ? 'pass' : 'fail',
    detail: `Navigated to: ${page.url()}`,
    duration: Date.now() - start
  });

  // Edge E1: No clusters — placeholder
  start = Date.now();
  await page.route('**/api/clusters', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '[]'
  }));
  await page.goto(BASE);
  const placeholder = await page.locator('text=/carte non disponible/i').count();
  results.push({
    id: 'E1',
    criterion: 'No clusters shows placeholder message',
    status: placeholder > 0 ? 'pass' : 'fail',
    detail: `Placeholder elements: ${placeholder}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/clusters');

  // Edge E2: Slow API — loading spinner
  start = Date.now();
  await page.route('**/api/clusters', async route => {
    await new Promise(res => setTimeout(res, 5000));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.goto(BASE);
  const spinner = await page.locator('[data-testid="mini-map-loading"], .mini-map-container [data-testid="spinner"]').count();
  results.push({
    id: 'E2',
    criterion: 'Slow API shows loading spinner',
    status: spinner > 0 ? 'pass' : 'fail',
    detail: `Loading elements: ${spinner}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/clusters');

  // Edge E3: Malformed data — fallback
  start = Date.now();
  await page.route('**/api/clusters', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '{malformed}'
  }));
  await page.goto(BASE);
  const fallback = await page.locator('text=/cliquer pour voir la carte/i, [data-testid="mini-map-fallback"]').count();
  results.push({
    id: 'E3',
    criterion: 'Malformed data shows fallback',
    status: fallback > 0 ? 'pass' : 'fail',
    detail: `Fallback elements: ${fallback}`,
    duration: Date.now() - start
  });

  return results;
};
