// FT-007: Profile to Map Navigation — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: "Voir sur la carte" opens map screen
  let start = Date.now();
  await page.goto(`${BASE}/researchers`);
  await page.locator('.app-table tbody tr, [data-testid="researcher-row"]').first().click();
  await page.waitForURL(/\/researchers\//);
  await page.locator('text=/voir sur la carte/i, [data-testid="profile-map-link"]').click();
  await page.waitForURL(/\/map/);
  results.push({
    id: 'AC-1',
    criterion: '"Voir sur la carte" opens map screen',
    status: page.url().includes('/map') ? 'pass' : 'fail',
    detail: `URL: ${page.url()}`,
    duration: Date.now() - start
  });

  // AC-2 & AC-3: Map centered on researcher dot (check for highlight class)
  start = Date.now();
  const highlightedDot = await page.locator('[data-testid="researcher-dot"].highlighted, circle.highlighted, [data-highlight="true"]').count();
  results.push({
    id: 'AC-2',
    criterion: 'Map centered on researcher with highlighted dot',
    status: highlightedDot > 0 ? 'pass' : 'fail',
    detail: `Highlighted dots: ${highlightedDot}`,
    duration: Date.now() - start
  });

  // Edge E1: No map coordinates — button disabled
  start = Date.now();
  await page.route('**/api/researchers/**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ id: '1', full_name: 'No Coords', lab: 'LORIA', bio: '', keywords: [], publications: [], map_x: null, map_y: null, cluster_id: null })
  }));
  await page.goto(`${BASE}/researchers/1`);
  const disabledBtn = await page.locator('[data-testid="profile-map-link"][disabled], [data-testid="profile-map-link"].disabled').count();
  const toastMsg = await page.locator('text=/pas encore de position/i').count();
  results.push({
    id: 'E1',
    criterion: 'No coordinates: button disabled or toast shown',
    status: disabledBtn > 0 || toastMsg > 0 ? 'pass' : 'fail',
    detail: `Disabled: ${disabledBtn}, Toast: ${toastMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/researchers/**');

  // Edge E2: Map data API failure
  start = Date.now();
  await page.route('**/api/clusters', route => route.abort());
  await page.goto(`${BASE}/map`);
  const mapError = await page.locator('text=/chargement echoue/i, [data-testid="map-error"]').count();
  results.push({
    id: 'E2',
    criterion: 'Map API failure shows error overlay',
    status: mapError > 0 ? 'pass' : 'fail',
    detail: `Map error elements: ${mapError}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/clusters');

  return results;
};
