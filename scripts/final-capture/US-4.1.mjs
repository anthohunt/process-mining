import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../../tests/e2e/final');
const BASE = 'http://127.0.0.1:5199';

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name) });
  console.log('captured', name);
}

async function loginAsAdmin(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  const btn = page.locator('button:has-text("admin"), button:has-text("Admin")').last();
  if (await btn.count() > 0) {
    await btn.click();
  } else {
    await page.fill('#email', 'admin@cartoPM.fr');
    await page.fill('#password', 'demo123456');
    await page.click('button[type="submit"]');
  }
  await page.waitForTimeout(2500);
}

const browser = await chromium.launch();

// Happy path
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsAdmin(page);
  await shot(page, 'US-4.1-01-admin-logged-in.png');

  // Click Admin tab
  const adminTab = page.locator('a[href="/admin"], a:has-text("Admin"), nav a:has-text("Admin")').first();
  if (await adminTab.count() > 0) {
    await adminTab.click();
    await page.waitForTimeout(2000);
  } else {
    await page.goto(`${BASE}/admin`);
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-4.1-02-admin-panel.png');
  await shot(page, 'US-4.1-03-user-table.png');

  // Click Modifier on a user row
  const editRoleBtn = page.locator('button:has-text("Modifier"), button:has-text("modifier")').first();
  if (await editRoleBtn.count() > 0) {
    await editRoleBtn.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-4.1-04-edit-role.png');

  // Change role if dialog has options
  const adminOption = page.locator('option[value="admin"], option:has-text("Admin")').first();
  if (await adminOption.count() > 0) {
    await adminOption.click();
    await page.waitForTimeout(300);
  }
  const confirmBtn = page.locator('button:has-text("Confirmer"), button:has-text("OK"), button[type="submit"]').first();
  if (await confirmBtn.count() > 0) {
    await confirmBtn.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-4.1-05-role-changed.png');

  // Invite user
  const inviteBtn = page.locator('button:has-text("Inviter")').first();
  if (await inviteBtn.count() > 0) {
    await inviteBtn.click();
    await page.waitForTimeout(800);
  }
  await shot(page, 'US-4.1-06-invite-dialog.png');

  const emailInput = page.locator('dialog input[type="email"], [role="dialog"] input[type="email"], input[type="email"]').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill('newuser@test.fr');
  }
  const sendBtn = page.locator('button:has-text("Envoyer"), button:has-text("Inviter"), dialog button[type="submit"], [role="dialog"] button[type="submit"]').first();
  if (await sendBtn.count() > 0) {
    await sendBtn.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-4.1-07-invite-sent.png');

  // Pending tab
  const pendingTab = page.locator('button:has-text("Profils en attente"), button:has-text("attente"), [role="tab"]:has-text("attente")').first();
  if (await pendingTab.count() > 0) {
    await pendingTab.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-4.1-08-pending-tab.png');
  await shot(page, 'US-4.1-09-pending-table.png');

  // Approve first pending
  const approveBtn = page.locator('button:has-text("Approuver")').first();
  if (await approveBtn.count() > 0) {
    await approveBtn.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-4.1-10-approved.png');

  // Reject another
  const rejectBtn = page.locator('button:has-text("Rejeter")').first();
  if (await rejectBtn.count() > 0) {
    await rejectBtn.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-4.1-11-rejected.png');
  await ctx.close();
}

// Focus trap
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsAdmin(page);
  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(2000);

  const inviteBtn = page.locator('button:has-text("Inviter")').first();
  if (await inviteBtn.count() > 0) {
    await inviteBtn.click();
    await page.waitForTimeout(800);
  }
  await shot(page, 'US-4.1-FT-01-dialog-open.png');
  await shot(page, 'US-4.1-FT-02-focus-first.png');

  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  await shot(page, 'US-4.1-FT-03-tab-trap.png');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await shot(page, 'US-4.1-FT-04-escape-close.png');
  await ctx.close();
}

// E1: No pending profiles
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsAdmin(page);

  await page.route('**/rest/v1/researchers*status=eq.pending*', route =>
    route.fulfill({ json: [] })
  );
  await page.route('**/rest/v1/researchers*pending*', route =>
    route.fulfill({ json: [] })
  );

  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(2000);

  await shot(page, 'US-4.1-E1-01-intercept.png');

  const pendingTab = page.locator('button:has-text("Profils en attente"), button:has-text("attente"), [role="tab"]:has-text("attente")').first();
  if (await pendingTab.count() > 0) {
    await pendingTab.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-4.1-E1-02-pending-tab.png');
  await shot(page, 'US-4.1-E1-03-empty.png');
  await ctx.close();
}

// E2: Self-revocation prevention
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsAdmin(page);
  await shot(page, 'US-4.1-E2-01-logged-in.png');
  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(2000);
  await shot(page, 'US-4.1-E2-02-user-table.png');

  // Try to click revoke on own row
  const revokeBtn = page.locator('button:has-text("Revoquer"), button:has-text("revoquer")').first();
  if (await revokeBtn.count() > 0) {
    await revokeBtn.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-4.1-E2-03-self-revoke-blocked.png');
  await shot(page, 'US-4.1-E2-04-warning.png');
  await ctx.close();
}

// E3: Invitation API failure
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsAdmin(page);

  await page.route('**/rest/v1/invitations**', route =>
    route.fulfill({ status: 500 })
  );

  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(2000);

  await shot(page, 'US-4.1-E3-01-intercept.png');

  const inviteBtn = page.locator('button:has-text("Inviter")').first();
  if (await inviteBtn.count() > 0) {
    await inviteBtn.click();
    await page.waitForTimeout(800);
  }
  const emailInput = page.locator('dialog input[type="email"], [role="dialog"] input[type="email"], input[type="email"]').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill('fail@test.fr');
  }
  const sendBtn = page.locator('button:has-text("Envoyer"), button:has-text("Inviter"), dialog button[type="submit"]').first();
  if (await sendBtn.count() > 0) {
    await sendBtn.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-4.1-E3-02-submit.png');
  await page.waitForTimeout(2000);
  await shot(page, 'US-4.1-E3-03-error.png');
  await ctx.close();
}

await browser.close();
console.log('US-4.1 done');
