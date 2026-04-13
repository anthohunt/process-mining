// FT-019: Admin App Settings — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // Login as admin
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);

  // AC-1: Settings pre-populated
  let start = Date.now();
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/parametres/i').first().click();
  await page.waitForTimeout(300);
  const radioButtons = await page.locator('input[type="radio"]').count();
  const slider = await page.locator('input[type="range"]').count();
  const nlpSelect = await page.locator('select').count();
  results.push({
    id: 'AC-1',
    criterion: 'Settings form pre-populated with language, threshold, NLP',
    status: radioButtons > 0 && slider > 0 && nlpSelect > 0 ? 'pass' : 'fail',
    detail: `Radios: ${radioButtons}, Sliders: ${slider}, Selects: ${nlpSelect}`,
    duration: Date.now() - start
  });

  // AC-3: Slider value updates in real-time
  start = Date.now();
  const sliderEl = page.locator('input[type="range"]').first();
  const valueBefore = await page.locator('.slider-value, [data-testid="slider-value"]').first().textContent();
  await sliderEl.fill('75');
  await page.waitForTimeout(200);
  const valueAfter = await page.locator('.slider-value, [data-testid="slider-value"]').first().textContent();
  results.push({
    id: 'AC-3',
    criterion: 'Slider value updates in real-time',
    status: valueBefore !== valueAfter ? 'pass' : 'fail',
    detail: `Before: "${valueBefore}", After: "${valueAfter}"`,
    duration: Date.now() - start
  });

  // AC-4: Save succeeds with toast
  start = Date.now();
  await page.route('**/api/admin/settings', route => {
    if (route.request().method() === 'PUT') {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    } else {
      route.continue();
    }
  });
  await page.locator('text=/sauvegarder/i').click();
  await page.waitForTimeout(500);
  const successToast = await page.locator('text=/sauvegardes/i, [data-testid="toast-success"]').count();
  results.push({
    id: 'AC-4',
    criterion: 'Save shows success toast',
    status: successToast > 0 ? 'pass' : 'fail',
    detail: `Success toasts: ${successToast}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/admin/settings');

  // Edge E1: Save API failure
  start = Date.now();
  await page.route('**/api/admin/settings', route => route.fulfill({ status: 500 }));
  await page.locator('text=/sauvegarder/i').click();
  await page.waitForTimeout(500);
  const errorToast = await page.locator('text=/echec/i, [data-testid="toast-error"]').count();
  results.push({
    id: 'E1',
    criterion: 'Save failure shows error toast',
    status: errorToast > 0 ? 'pass' : 'fail',
    detail: `Error toasts: ${errorToast}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/admin/settings');

  // Edge E3: Zero threshold warning
  start = Date.now();
  await sliderEl.fill('0');
  await page.waitForTimeout(200);
  await page.locator('text=/sauvegarder/i').click();
  await page.waitForTimeout(500);
  const thresholdWarning = await page.locator('text=/seuil de 0/i, text=/tous les chercheurs/i').count();
  results.push({
    id: 'E3',
    criterion: 'Zero threshold shows warning',
    status: thresholdWarning > 0 ? 'pass' : 'fail',
    detail: `Threshold warnings: ${thresholdWarning}`,
    duration: Date.now() - start
  });

  return results;
};
