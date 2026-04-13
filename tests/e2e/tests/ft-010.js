// FT-010: Researcher Dot to Profile — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Hover dot shows name tooltip
  let start = Date.now();
  await page.goto(`${BASE}/map`);
  const dot = page.locator('[data-testid="researcher-dot"], .map-container svg circle[data-researcher]').first();
  if (await dot.count() > 0) {
    await dot.hover();
    await page.waitForTimeout(300);
    const tooltip = await page.locator('[data-testid="dot-tooltip"], title, [role="tooltip"]').count();
    results.push({
      id: 'AC-1',
      criterion: 'Hover dot shows researcher name tooltip',
      status: tooltip > 0 ? 'pass' : 'fail',
      detail: `Tooltip elements: ${tooltip}`,
      duration: Date.now() - start
    });

    // AC-2: Click dot navigates to profile
    start = Date.now();
    await dot.click();
    await page.waitForURL(/\/researchers\//);
    results.push({
      id: 'AC-2',
      criterion: 'Click dot navigates to researcher profile',
      status: page.url().includes('/researchers/') ? 'pass' : 'fail',
      detail: `URL: ${page.url()}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-1', criterion: 'Hover shows tooltip', status: 'fail', detail: 'No dots found', duration: Date.now() - start });
    results.push({ id: 'AC-2', criterion: 'Click navigates', status: 'fail', detail: 'No dots found', duration: Date.now() - start });
  }

  // AC-3: Cursor changes to pointer on hover
  start = Date.now();
  await page.goto(`${BASE}/map`);
  const dotEl = page.locator('[data-testid="researcher-dot"], .map-container svg circle[data-researcher]').first();
  if (await dotEl.count() > 0) {
    await dotEl.hover();
    const cursor = await dotEl.evaluate(el => getComputedStyle(el).cursor);
    results.push({
      id: 'AC-3',
      criterion: 'Cursor changes to pointer on hover',
      status: cursor === 'pointer' ? 'pass' : 'fail',
      detail: `Cursor: ${cursor}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-3', criterion: 'Cursor pointer', status: 'fail', detail: 'No dots found', duration: Date.now() - start });
  }

  // Edge E2: Profile data unavailable — toast
  start = Date.now();
  await page.route('**/api/researchers/**', route => route.fulfill({ status: 500 }));
  await page.goto(`${BASE}/map`);
  const dotForError = page.locator('[data-testid="researcher-dot"], .map-container svg circle[data-researcher]').first();
  if (await dotForError.count() > 0) {
    await dotForError.click();
    await page.waitForTimeout(500);
    const toast = await page.locator('text=/profil indisponible/i, [data-testid="toast"]').count();
    results.push({
      id: 'E2',
      criterion: 'Profile unavailable shows toast',
      status: toast > 0 ? 'pass' : 'fail',
      detail: `Toast elements: ${toast}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'E2', criterion: 'Toast on error', status: 'fail', detail: 'No dots found', duration: Date.now() - start });
  }

  return results;
};
