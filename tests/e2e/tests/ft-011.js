// FT-011: Theme List View — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Grid of cluster cards displays
  let start = Date.now();
  await page.goto(`${BASE}/themes`);
  const cards = await page.locator('[data-testid="cluster-card"], .cluster-card').count();
  results.push({
    id: 'AC-1',
    criterion: 'Grid of cluster cards displays',
    status: cards > 0 ? 'pass' : 'fail',
    detail: `Cluster cards: ${cards}`,
    duration: Date.now() - start
  });

  // AC-2: Click card expands to show members
  start = Date.now();
  const firstCard = page.locator('[data-testid="cluster-card"], .cluster-card').first();
  await firstCard.click();
  await page.waitForTimeout(300);
  const members = await firstCard.locator('[data-testid="cluster-member"], .cluster-member-link').count();
  results.push({
    id: 'AC-2',
    criterion: 'Click card expands to show members',
    status: members > 0 ? 'pass' : 'fail',
    detail: `Members shown: ${members}`,
    duration: Date.now() - start
  });

  // AC-3: Click member name navigates to profile
  start = Date.now();
  const memberLink = firstCard.locator('[data-testid="cluster-member"], .cluster-member-link').first();
  if (await memberLink.count() > 0) {
    await memberLink.click();
    await page.waitForURL(/\/researchers\//);
    results.push({
      id: 'AC-3',
      criterion: 'Click member navigates to profile',
      status: page.url().includes('/researchers/') ? 'pass' : 'fail',
      detail: `URL: ${page.url()}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-3', criterion: 'Click member navigates', status: 'fail', detail: 'No member link', duration: Date.now() - start });
  }

  // AC-4: Cross-nav "Voir sur la carte" works
  start = Date.now();
  await page.goto(`${BASE}/themes`);
  await page.locator('text=/voir sur la carte/i').first().click();
  await page.waitForURL(/\/map/);
  results.push({
    id: 'AC-4',
    criterion: '"Voir sur la carte" navigates to map',
    status: page.url().includes('/map') ? 'pass' : 'fail',
    detail: `URL: ${page.url()}`,
    duration: Date.now() - start
  });

  // Edge E1: No themes — empty state
  start = Date.now();
  await page.route('**/api/clusters', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '[]'
  }));
  await page.goto(`${BASE}/themes`);
  const emptyMsg = await page.locator('text=/aucun theme/i').count();
  results.push({
    id: 'E1',
    criterion: 'No themes shows empty state',
    status: emptyMsg > 0 ? 'pass' : 'fail',
    detail: `Empty state: ${emptyMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/clusters');

  // Edge E3: Malformed API response
  start = Date.now();
  await page.route('**/api/clusters', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '{malformed}'
  }));
  await page.goto(`${BASE}/themes`);
  const errorMsg = await page.locator('text=/erreur de chargement/i').count();
  results.push({
    id: 'E3',
    criterion: 'Malformed data shows error state',
    status: errorMsg > 0 ? 'pass' : 'fail',
    detail: `Error elements: ${errorMsg}`,
    duration: Date.now() - start
  });

  return results;
};
