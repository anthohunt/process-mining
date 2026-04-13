// FT-006: Side-by-Side Comparison — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Two profiles displayed with similarity gauge
  let start = Date.now();
  await page.goto(`${BASE}/comparison?a=1&b=2`);
  const columns = await page.locator('[data-testid="comparison-profile"], .comparison-layout > .card').count();
  const gauge = await page.locator('[data-testid="similarity-gauge"], .gauge-circle').count();
  results.push({
    id: 'AC-1',
    criterion: 'Two profiles displayed with similarity gauge in center',
    status: columns >= 2 && gauge > 0 ? 'pass' : 'fail',
    detail: `Profile columns: ${columns}, Gauge: ${gauge}`,
    duration: Date.now() - start
  });

  // AC-2: Common themes highlighted with outline
  start = Date.now();
  const highlightedTags = await page.locator('.tag[style*="outline"], [data-testid="common-theme"]').count();
  results.push({
    id: 'AC-2',
    criterion: 'Common themes highlighted with blue outline',
    status: highlightedTags > 0 ? 'pass' : 'fail',
    detail: `Highlighted tags: ${highlightedTags}`,
    duration: Date.now() - start
  });

  // AC-3: Gauge shows percentage
  start = Date.now();
  const gaugeText = await page.locator('[data-testid="similarity-gauge"], .gauge-circle').textContent();
  const hasPercent = /%/.test(gaugeText);
  results.push({
    id: 'AC-3',
    criterion: 'Similarity gauge shows percentage',
    status: hasPercent ? 'pass' : 'fail',
    detail: `Gauge text: "${gaugeText}"`,
    duration: Date.now() - start
  });

  // AC-4: Summary card lists shared themes
  start = Date.now();
  const summaryCard = await page.locator('[data-testid="common-themes-summary"], #common-themes').count();
  results.push({
    id: 'AC-4',
    criterion: 'Summary card lists shared themes',
    status: summaryCard > 0 ? 'pass' : 'fail',
    detail: `Summary cards: ${summaryCard}`,
    duration: Date.now() - start
  });

  // Edge E1: Zero common themes
  start = Date.now();
  await page.route('**/api/similarity/**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ score: 0, algorithm: 'tfidf', common_themes: [] })
  }));
  await page.goto(`${BASE}/comparison?a=1&b=2`);
  const zeroGauge = await page.locator('[data-testid="similarity-gauge"], .gauge-circle').textContent();
  const noCommonMsg = await page.locator('text=/aucun theme commun/i').count();
  results.push({
    id: 'E1',
    criterion: 'Zero themes shows 0% and "Aucun theme commun"',
    status: zeroGauge.includes('0') && noCommonMsg > 0 ? 'pass' : 'fail',
    detail: `Gauge: "${zeroGauge}", Message: ${noCommonMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/similarity/**');

  // Edge E2: Similarity API failure
  start = Date.now();
  await page.route('**/api/similarity/**', route => route.fulfill({ status: 504 }));
  await page.goto(`${BASE}/comparison?a=1&b=2`);
  const unavailMsg = await page.locator('text=/indisponible/i').count();
  results.push({
    id: 'E2',
    criterion: 'API failure shows "Score indisponible"',
    status: unavailMsg > 0 ? 'pass' : 'fail',
    detail: `Unavailable messages: ${unavailMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/similarity/**');

  // Edge E3: Same researcher twice
  start = Date.now();
  await page.goto(`${BASE}/comparison?a=1&b=1`);
  const sameWarning = await page.locator('text=/deux chercheurs differents/i').count();
  results.push({
    id: 'E3',
    criterion: 'Same researcher twice shows warning',
    status: sameWarning > 0 ? 'pass' : 'fail',
    detail: `Warning messages: ${sameWarning}`,
    duration: Date.now() - start
  });

  return results;
};
