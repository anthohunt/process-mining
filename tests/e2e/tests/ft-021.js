// FT-021: Admin Pending Profiles — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // Login as admin
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);

  // AC-1: Pending profiles table displays
  let start = Date.now();
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/profils en attente/i').click();
  await page.waitForTimeout(300);
  const pendingRows = await page.locator('[data-testid="pending-row"], #pending-profiles-table tbody tr, .app-table tbody tr').count();
  results.push({
    id: 'AC-1',
    criterion: 'Pending profiles table shows entries',
    status: pendingRows > 0 ? 'pass' : 'fail',
    detail: `Pending rows: ${pendingRows}`,
    duration: Date.now() - start
  });

  // AC-2: Approve button works
  start = Date.now();
  let approvedId = null;
  await page.route('**/api/admin/researchers/*/approve', route => {
    approvedId = route.request().url();
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"approved"}' });
  });
  const approveBtn = page.locator('button:has-text("Approuver")').first();
  if (await approveBtn.count() > 0) {
    await approveBtn.click();
    await page.waitForTimeout(500);
    results.push({
      id: 'AC-2',
      criterion: 'Approve button triggers approval API',
      status: approvedId !== null ? 'pass' : 'fail',
      detail: `Approved URL: ${approvedId}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-2', criterion: 'Approve button', status: 'fail', detail: 'No approve button found', duration: Date.now() - start });
  }
  await page.unroute('**/api/admin/researchers/*/approve');

  // AC-3: Reject button works
  start = Date.now();
  let rejectedId = null;
  await page.route('**/api/admin/researchers/*/reject', route => {
    rejectedId = route.request().url();
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"rejected"}' });
  });
  const rejectBtn = page.locator('button:has-text("Rejeter")').first();
  if (await rejectBtn.count() > 0) {
    await rejectBtn.click();
    await page.waitForTimeout(500);
    results.push({
      id: 'AC-3',
      criterion: 'Reject button triggers rejection API',
      status: rejectedId !== null ? 'pass' : 'fail',
      detail: `Rejected URL: ${rejectedId}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-3', criterion: 'Reject button', status: 'fail', detail: 'No reject button found', duration: Date.now() - start });
  }

  return results;
};
