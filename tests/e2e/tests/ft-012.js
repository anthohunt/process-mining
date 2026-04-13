// FT-012: Detailed Statistics — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Bar chart displays theme distribution
  let start = Date.now();
  await page.goto(`${BASE}/stats`);
  const barChart = await page.locator('[data-testid="theme-bar-chart"] svg, #bar-chart-svg, [data-testid="bar-chart"]').count();
  results.push({
    id: 'AC-1',
    criterion: 'Bar chart displays theme distribution',
    status: barChart > 0 ? 'pass' : 'fail',
    detail: `Bar chart SVGs: ${barChart}`,
    duration: Date.now() - start
  });

  // AC-2: Line chart displays trends
  start = Date.now();
  const lineChart = await page.locator('[data-testid="trend-line-chart"] svg, #line-chart-svg, [data-testid="line-chart"]').count();
  results.push({
    id: 'AC-2',
    criterion: 'Line chart displays temporal trends',
    status: lineChart > 0 ? 'pass' : 'fail',
    detail: `Line chart SVGs: ${lineChart}`,
    duration: Date.now() - start
  });

  // AC-3: Histogram displays similarity distribution
  start = Date.now();
  const histogram = await page.locator('[data-testid="similarity-histogram"] svg, #histogram-svg, [data-testid="histogram"]').count();
  results.push({
    id: 'AC-3',
    criterion: 'Histogram displays similarity score distribution',
    status: histogram > 0 ? 'pass' : 'fail',
    detail: `Histogram SVGs: ${histogram}`,
    duration: Date.now() - start
  });

  // AC-4: Hover tooltip on chart
  start = Date.now();
  const barEl = page.locator('[data-testid="theme-bar-chart"] rect, #bar-chart-svg rect').first();
  if (await barEl.count() > 0) {
    await barEl.hover();
    await page.waitForTimeout(300);
    const tooltip = await page.locator('[data-testid="chart-tooltip"], .chart-tooltip, [role="tooltip"]').count();
    results.push({
      id: 'AC-4',
      criterion: 'Hover shows tooltip with exact value',
      status: tooltip > 0 ? 'pass' : 'fail',
      detail: `Tooltips: ${tooltip}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-4', criterion: 'Hover tooltip', status: 'fail', detail: 'No bar elements found', duration: Date.now() - start });
  }

  // Edge E1: No data for charts
  start = Date.now();
  await page.route('**/api/stats/detailed', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ theme_distribution: [], temporal_trends: [], similarity_histogram: [] })
  }));
  await page.goto(`${BASE}/stats`);
  const emptyChartMsg = await page.locator('text=/pas assez de donnees/i').count();
  results.push({
    id: 'E1',
    criterion: 'No data shows empty chart message',
    status: emptyChartMsg > 0 ? 'pass' : 'fail',
    detail: `Empty messages: ${emptyChartMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/stats/detailed');

  // Edge E3: Malformed stats data
  start = Date.now();
  await page.route('**/api/stats/detailed', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '{malformed}'
  }));
  await page.goto(`${BASE}/stats`);
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
