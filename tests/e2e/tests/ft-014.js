// FT-014: Profile Edit Button States — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Own profile — Modifier button enabled
  let start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*chercheur/i').click();
  await page.waitForTimeout(500);
  await page.goto(`${BASE}/researchers/own-id`);
  const enabledBtn = await page.locator('button:has-text("Modifier"):not([disabled]):not(.btn-disabled-lock)').count();
  results.push({
    id: 'AC-1',
    criterion: 'Own profile: Modifier button is enabled',
    status: enabledBtn > 0 ? 'pass' : 'fail',
    detail: `Enabled Modifier buttons: ${enabledBtn}`,
    duration: Date.now() - start
  });

  // AC-2: Other's profile — Modifier button disabled/locked
  start = Date.now();
  await page.goto(`${BASE}/researchers/other-id`);
  const lockedBtn = await page.locator('.btn-disabled-lock, button:has-text("Modifier")[disabled]').count();
  const lockNote = await page.locator('text=/ne pouvez modifier que votre propre/i, .edit-note').count();
  results.push({
    id: 'AC-2',
    criterion: "Other's profile: Modifier button disabled with lock",
    status: lockedBtn > 0 || lockNote > 0 ? 'pass' : 'fail',
    detail: `Locked: ${lockedBtn}, Note: ${lockNote}`,
    duration: Date.now() - start
  });

  // AC-3: Not logged in — Modifier hidden
  start = Date.now();
  await page.locator('[data-testid="navbar-user-area"], .navbar-user-area').click().catch(() => {});
  await page.locator('text=/deconnexion/i').click().catch(() => {});
  await page.waitForTimeout(300);
  await page.goto(`${BASE}/researchers/any-id`);
  const hiddenBtn = await page.locator('button:has-text("Modifier"):visible').count();
  results.push({
    id: 'AC-3',
    criterion: 'Not logged in: Modifier button hidden',
    status: hiddenBtn === 0 ? 'pass' : 'fail',
    detail: `Visible Modifier buttons: ${hiddenBtn}`,
    duration: Date.now() - start
  });

  // Edge E1: Already pending submission
  start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*chercheur/i').click();
  await page.waitForTimeout(500);
  await page.route('**/api/researchers', route => route.fulfill({
    status: 409, contentType: 'application/json',
    body: JSON.stringify({ error: 'already_pending' })
  }));
  await page.goto(`${BASE}/researchers/own-id/edit`);
  await page.locator('button:has-text("Enregistrer")').click();
  await page.waitForTimeout(500);
  const pendingWarning = await page.locator('text=/deja une soumission en attente/i').count();
  results.push({
    id: 'E1',
    criterion: 'Already pending shows warning',
    status: pendingWarning > 0 ? 'pass' : 'fail',
    detail: `Pending warnings: ${pendingWarning}`,
    duration: Date.now() - start
  });

  return results;
};
