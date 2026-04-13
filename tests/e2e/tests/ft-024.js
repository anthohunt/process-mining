// FT-024: Escape Key Dismissal — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Escape closes user dropdown
  let start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*chercheur/i').click();
  await page.waitForTimeout(500);
  await page.goto(BASE);
  await page.locator('[data-testid="navbar-user-area"], .navbar-user-area').click();
  await page.waitForTimeout(300);
  const dropdownOpen = await page.locator('[data-testid="user-dropdown"]:visible, .navbar-user-dropdown.open, .navbar-user-dropdown:visible').count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const dropdownClosed = await page.locator('[data-testid="user-dropdown"]:visible, .navbar-user-dropdown.open, .navbar-user-dropdown:visible').count();
  results.push({
    id: 'AC-1',
    criterion: 'Escape closes user dropdown',
    status: dropdownOpen > 0 && dropdownClosed === 0 ? 'pass' : 'fail',
    detail: `Before Escape: ${dropdownOpen}, After: ${dropdownClosed}`,
    duration: Date.now() - start
  });

  // AC-2: Escape closes cluster popover on map
  start = Date.now();
  await page.goto(`${BASE}/map`);
  const cluster = page.locator('[data-testid="cluster-region"], .map-container svg [data-cluster]').first();
  if (await cluster.count() > 0) {
    await cluster.click();
    await page.waitForTimeout(300);
    const popoverBefore = await page.locator('[data-testid="cluster-popover"]:visible, .cluster-popover:visible').count();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const popoverAfter = await page.locator('[data-testid="cluster-popover"]:visible, .cluster-popover:visible').count();
    results.push({
      id: 'AC-2',
      criterion: 'Escape closes cluster popover',
      status: popoverBefore > 0 && popoverAfter === 0 ? 'pass' : 'fail',
      detail: `Before: ${popoverBefore}, After: ${popoverAfter}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-2', criterion: 'Escape closes popover', status: 'fail', detail: 'No cluster region found', duration: Date.now() - start });
  }

  // AC-3: Escape dismisses confirmation dialog
  start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/parametres/i').first().click();
  await page.waitForTimeout(300);
  // Change a setting to trigger unsaved state
  const slider = page.locator('input[type="range"]').first();
  if (await slider.count() > 0) {
    await slider.fill('80');
    // Navigate away to trigger confirm dialog
    await page.locator('text=/utilisateurs/i').first().click();
    await page.waitForTimeout(300);
    const dialog = await page.locator('[role="dialog"], [data-testid="confirm-dialog"]').count();
    if (dialog > 0) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const dialogAfter = await page.locator('[role="dialog"]:visible, [data-testid="confirm-dialog"]:visible').count();
      results.push({
        id: 'AC-3',
        criterion: 'Escape dismisses confirmation dialog',
        status: dialogAfter === 0 ? 'pass' : 'fail',
        detail: `Dialog after Escape: ${dialogAfter}`,
        duration: Date.now() - start
      });
    } else {
      results.push({ id: 'AC-3', criterion: 'Escape dismisses dialog', status: 'fail', detail: 'No confirm dialog appeared', duration: Date.now() - start });
    }
  } else {
    results.push({ id: 'AC-3', criterion: 'Escape dismisses dialog', status: 'fail', detail: 'No slider found to change', duration: Date.now() - start });
  }

  return results;
};
