// FT-025: ARIA Labels — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: All buttons/links have aria-label or visible text
  let start = Date.now();
  await page.goto(BASE);
  const unlabeledButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, a[href], [role="button"]');
    let count = 0;
    buttons.forEach(b => {
      const hasLabel = b.getAttribute('aria-label') || b.textContent?.trim() || b.getAttribute('title');
      if (!hasLabel) count++;
    });
    return count;
  });
  results.push({
    id: 'AC-1',
    criterion: 'All interactive elements have aria-label or visible text',
    status: unlabeledButtons === 0 ? 'pass' : 'fail',
    detail: `Unlabeled buttons: ${unlabeledButtons}`,
    duration: Date.now() - start
  });

  // AC-2: Stat cards announce full context
  start = Date.now();
  const statCardLabels = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-testid="stat-card"], .stat-card');
    return Array.from(cards).map(c => {
      const label = c.getAttribute('aria-label') || '';
      const num = c.querySelector('.stat-number')?.textContent || '';
      const text = c.querySelector('.stat-label')?.textContent || '';
      return { label, num, text };
    });
  });
  const cardsHaveContext = statCardLabels.every(c => c.label || (c.num && c.text));
  results.push({
    id: 'AC-2',
    criterion: 'Stat cards announce full context (number + label)',
    status: cardsHaveContext ? 'pass' : 'fail',
    detail: `Cards: ${JSON.stringify(statCardLabels.slice(0, 2))}`,
    duration: Date.now() - start
  });

  // AC-3: Similarity gauge announces percentage
  start = Date.now();
  await page.goto(`${BASE}/comparison?a=1&b=2`);
  await page.waitForTimeout(500);
  const gaugeLabel = await page.evaluate(() => {
    const gauge = document.querySelector('[data-testid="similarity-gauge"], .gauge-circle');
    return gauge ? (gauge.getAttribute('aria-label') || gauge.getAttribute('role') || gauge.textContent?.trim()) : null;
  });
  results.push({
    id: 'AC-3',
    criterion: 'Similarity gauge announces percentage for screen readers',
    status: gaugeLabel && /%/.test(gaugeLabel) ? 'pass' : 'fail',
    detail: `Gauge label: "${gaugeLabel}"`,
    duration: Date.now() - start
  });

  // AC-4: Map SVG has descriptive aria-label
  start = Date.now();
  await page.goto(`${BASE}/map`);
  const mapLabel = await page.evaluate(() => {
    const svg = document.querySelector('[data-testid="map-svg"], .map-container svg, #map-svg');
    return svg ? svg.getAttribute('aria-label') : null;
  });
  results.push({
    id: 'AC-4',
    criterion: 'Map SVG has descriptive aria-label',
    status: mapLabel && mapLabel.length > 5 ? 'pass' : 'fail',
    detail: `Map aria-label: "${mapLabel}"`,
    duration: Date.now() - start
  });

  // Check form inputs on edit page
  start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*chercheur/i').click();
  await page.waitForTimeout(500);
  await page.goto(`${BASE}/researchers/own-id/edit`);
  const unlabeledInputs = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, textarea, select');
    let count = 0;
    inputs.forEach(i => {
      const hasLabel = i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || i.labels?.length > 0 || i.placeholder;
      if (!hasLabel) count++;
    });
    return count;
  });
  results.push({
    id: 'AC-1b',
    criterion: 'All form inputs have labels',
    status: unlabeledInputs === 0 ? 'pass' : 'fail',
    detail: `Unlabeled inputs: ${unlabeledInputs}`,
    duration: Date.now() - start
  });

  return results;
};
