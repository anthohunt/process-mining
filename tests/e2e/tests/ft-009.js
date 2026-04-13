// FT-009: Cluster Click for Members — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Click cluster shows popover with members
  let start = Date.now();
  await page.goto(`${BASE}/map`);
  const clusterRegion = page.locator('[data-testid="cluster-region"], .map-container svg [data-cluster]').first();
  if (await clusterRegion.count() > 0) {
    await clusterRegion.click();
    await page.waitForTimeout(500);
    const popover = await page.locator('[data-testid="cluster-popover"], .cluster-popover').count();
    results.push({
      id: 'AC-1',
      criterion: 'Click cluster shows popover with members',
      status: popover > 0 ? 'pass' : 'fail',
      detail: `Popover visible: ${popover}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-1', criterion: 'Click cluster shows popover', status: 'fail', detail: 'No cluster region found', duration: Date.now() - start });
  }

  // AC-2: Popover shows theme tags
  start = Date.now();
  const popoverTags = await page.locator('[data-testid="cluster-popover"] .tag, .cluster-popover .tag').count();
  results.push({
    id: 'AC-2',
    criterion: 'Popover shows theme tags',
    status: popoverTags > 0 ? 'pass' : 'fail',
    detail: `Theme tags in popover: ${popoverTags}`,
    duration: Date.now() - start
  });

  // AC-3: Click name navigates to profile
  start = Date.now();
  const memberLink = page.locator('[data-testid="cluster-popover"] a, .cluster-popover a').first();
  if (await memberLink.count() > 0) {
    await memberLink.click();
    await page.waitForURL(/\/researchers\//);
    results.push({
      id: 'AC-3',
      criterion: 'Click member name navigates to profile',
      status: page.url().includes('/researchers/') ? 'pass' : 'fail',
      detail: `URL: ${page.url()}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-3', criterion: 'Click member navigates to profile', status: 'fail', detail: 'No member link found', duration: Date.now() - start });
  }

  // Edge E2: Click outside closes popover
  start = Date.now();
  await page.goto(`${BASE}/map`);
  const cluster = page.locator('[data-testid="cluster-region"], .map-container svg [data-cluster]').first();
  if (await cluster.count() > 0) {
    await cluster.click();
    await page.waitForTimeout(300);
    await page.locator('.map-container').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
    const popoverAfter = await page.locator('[data-testid="cluster-popover"]:visible, .cluster-popover:visible').count();
    results.push({
      id: 'E2',
      criterion: 'Click outside closes popover',
      status: popoverAfter === 0 ? 'pass' : 'fail',
      detail: `Popover visible after click outside: ${popoverAfter}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'E2', criterion: 'Click outside closes popover', status: 'fail', detail: 'No cluster to test', duration: Date.now() - start });
  }

  return results;
};
