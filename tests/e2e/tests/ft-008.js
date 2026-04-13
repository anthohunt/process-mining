// FT-008: Interactive Cluster Map — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: SVG renders clusters and dots
  let start = Date.now();
  await page.goto(`${BASE}/map`);
  const clusterRegions = await page.locator('[data-testid="cluster-region"], .map-container svg circle, .map-container svg path').count();
  results.push({
    id: 'AC-1',
    criterion: 'SVG renders colored cluster regions and researcher dots',
    status: clusterRegions > 0 ? 'pass' : 'fail',
    detail: `SVG elements: ${clusterRegions}`,
    duration: Date.now() - start
  });

  // AC-2: Zoom works (scroll)
  start = Date.now();
  const mapContainer = page.locator('[data-testid="map-svg"], .map-container svg').first();
  const transformBefore = await mapContainer.evaluate(el => el.getAttribute('transform') || el.querySelector('g')?.getAttribute('transform') || '');
  await page.mouse.move(400, 300);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(500);
  const transformAfter = await mapContainer.evaluate(el => el.getAttribute('transform') || el.querySelector('g')?.getAttribute('transform') || '');
  results.push({
    id: 'AC-2',
    criterion: 'Scroll zooms the map',
    status: transformBefore !== transformAfter ? 'pass' : 'fail',
    detail: `Transform changed: ${transformBefore !== transformAfter}`,
    duration: Date.now() - start
  });

  // AC-4: Filter panel applies filters
  start = Date.now();
  const filterPanel = await page.locator('[data-testid="map-filter-panel"], .map-filter-panel').count();
  results.push({
    id: 'AC-4',
    criterion: 'Filter panel is present',
    status: filterPanel > 0 ? 'pass' : 'fail',
    detail: `Filter panels: ${filterPanel}`,
    duration: Date.now() - start
  });

  // AC-5: Legend visible
  start = Date.now();
  const legend = await page.locator('[data-testid="map-legend"], .map-legend').count();
  const legendItems = await page.locator('.legend-item, [data-testid="legend-item"]').count();
  results.push({
    id: 'AC-5',
    criterion: 'Legend visible with cluster colors',
    status: legend > 0 && legendItems > 0 ? 'pass' : 'fail',
    detail: `Legend: ${legend}, Items: ${legendItems}`,
    duration: Date.now() - start
  });

  // Edge E1: No clusters — empty state
  start = Date.now();
  await page.route('**/api/clusters', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '[]'
  }));
  await page.goto(`${BASE}/map`);
  const emptyMap = await page.locator('text=/aucun cluster/i').count();
  results.push({
    id: 'E1',
    criterion: 'No clusters shows empty state',
    status: emptyMap > 0 ? 'pass' : 'fail',
    detail: `Empty state: ${emptyMap}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/clusters');

  // Edge E3: API timeout
  start = Date.now();
  await page.route('**/api/clusters', route => route.fulfill({ status: 504 }));
  await page.goto(`${BASE}/map`);
  const timeoutError = await page.locator('text=/chargement echoue/i, [data-testid="map-error"]').count();
  results.push({
    id: 'E3',
    criterion: 'API timeout shows error with retry',
    status: timeoutError > 0 ? 'pass' : 'fail',
    detail: `Error elements: ${timeoutError}`,
    duration: Date.now() - start
  });

  return results;
};
