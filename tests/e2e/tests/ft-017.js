// FT-017: Admin User Management — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // Login as admin
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);

  // AC-1: User table displays
  let start = Date.now();
  await page.goto(`${BASE}/admin`);
  const userRows = await page.locator('.app-table tbody tr, [data-testid="user-row"]').count();
  results.push({
    id: 'AC-1',
    criterion: 'User table displays all users',
    status: userRows > 0 ? 'pass' : 'fail',
    detail: `User rows: ${userRows}`,
    duration: Date.now() - start
  });

  // AC-2: Role badges present
  start = Date.now();
  const badges = await page.locator('.badge-admin, .badge-researcher, [data-testid="role-badge"]').count();
  results.push({
    id: 'AC-2',
    criterion: 'Role badges visible on users',
    status: badges > 0 ? 'pass' : 'fail',
    detail: `Role badges: ${badges}`,
    duration: Date.now() - start
  });

  // AC-3: Invite button present
  start = Date.now();
  const inviteBtn = await page.locator('text=/inviter/i').count();
  results.push({
    id: 'AC-3',
    criterion: 'Invite button is present',
    status: inviteBtn > 0 ? 'pass' : 'fail',
    detail: `Invite buttons: ${inviteBtn}`,
    duration: Date.now() - start
  });

  // AC-5 & AC-6: Pending profiles tab has Approve/Reject
  start = Date.now();
  await page.locator('text=/profils en attente/i').click();
  await page.waitForTimeout(300);
  const approveButtons = await page.locator('button:has-text("Approuver")').count();
  const rejectButtons = await page.locator('button:has-text("Rejeter")').count();
  results.push({
    id: 'AC-5',
    criterion: 'Pending profiles have Approve/Reject buttons',
    status: approveButtons > 0 && rejectButtons > 0 ? 'pass' : 'fail',
    detail: `Approve: ${approveButtons}, Reject: ${rejectButtons}`,
    duration: Date.now() - start
  });

  // Edge E1: No pending profiles
  start = Date.now();
  await page.route('**/api/admin/researchers?status=pending', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '[]'
  }));
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/profils en attente/i').click();
  await page.waitForTimeout(300);
  const emptyPending = await page.locator('text=/aucun profil en attente/i').count();
  results.push({
    id: 'E1',
    criterion: 'No pending profiles shows empty message',
    status: emptyPending > 0 ? 'pass' : 'fail',
    detail: `Empty messages: ${emptyPending}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/admin/researchers?status=pending');

  // Edge E3: Invitation API failure
  start = Date.now();
  await page.route('**/api/admin/invitations', route => route.fulfill({ status: 500 }));
  await page.goto(`${BASE}/admin`);
  const invBtn = page.locator('text=/inviter/i').first();
  if (await invBtn.count() > 0) {
    await invBtn.click();
    await page.waitForTimeout(300);
    const emailInput = page.locator('input[type="email"], [data-testid="invite-email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@test.com');
      await page.locator('button:has-text("Envoyer"), button:has-text("Inviter")').last().click();
      await page.waitForTimeout(500);
      const invError = await page.locator('text=/invitation echouee/i, text=/erreur/i').count();
      results.push({
        id: 'E3',
        criterion: 'Invitation failure shows error',
        status: invError > 0 ? 'pass' : 'fail',
        detail: `Error messages: ${invError}`,
        duration: Date.now() - start
      });
    } else {
      results.push({ id: 'E3', criterion: 'Invitation failure', status: 'fail', detail: 'No email input in dialog', duration: Date.now() - start });
    }
  } else {
    results.push({ id: 'E3', criterion: 'Invitation failure', status: 'fail', detail: 'No invite button found', duration: Date.now() - start });
  }

  return results;
};
