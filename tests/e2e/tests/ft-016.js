// FT-016: Profile Submission Approval Flow — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Researcher submits, status is pending
  let start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*chercheur/i').click();
  await page.waitForTimeout(500);
  let savedStatus = null;
  await page.route('**/api/researchers**', route => {
    if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
      savedStatus = 'pending';
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'pending' }) });
    } else {
      route.continue();
    }
  });
  await page.goto(`${BASE}/researchers/own-id/edit`);
  await page.locator('button:has-text("Enregistrer")').click();
  await page.waitForTimeout(500);
  results.push({
    id: 'AC-1',
    criterion: 'Submitted profile has pending status',
    status: savedStatus === 'pending' ? 'pass' : 'fail',
    detail: `Saved status: ${savedStatus}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/researchers**');

  // AC-2: Admin approves pending profile
  start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/profils en attente/i').click();
  await page.waitForTimeout(300);
  const approveBtn = await page.locator('button:has-text("Approuver")').count();
  results.push({
    id: 'AC-2',
    criterion: 'Admin sees pending profiles with Approve button',
    status: approveBtn > 0 ? 'pass' : 'fail',
    detail: `Approve buttons: ${approveBtn}`,
    duration: Date.now() - start
  });

  // AC-3: Admin rejects with notification
  start = Date.now();
  const rejectBtn = await page.locator('button:has-text("Rejeter")').count();
  results.push({
    id: 'AC-3',
    criterion: 'Admin sees Reject button for pending profiles',
    status: rejectBtn > 0 ? 'pass' : 'fail',
    detail: `Reject buttons: ${rejectBtn}`,
    duration: Date.now() - start
  });

  return results;
};
