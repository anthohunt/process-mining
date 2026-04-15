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

const browser = await chromium.launch();

// Happy path: researcher login
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1500);
  await shot(page, 'US-5.1-01-navbar-logged-out.png');

  const connexionBtn = page.locator('a[href="/login"], button:has-text("Connexion"), a:has-text("Connexion")').first();
  await connexionBtn.click();
  await page.waitForTimeout(1000);
  await shot(page, 'US-5.1-02-login-screen.png');
  await shot(page, 'US-5.1-03-login-card.png');

  await page.fill('#email', 'researcher@cartoPM.fr');
  await page.fill('#password', 'demo123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  await shot(page, 'US-5.1-04-login-success.png');
  await shot(page, 'US-5.1-05-navbar-logged-in.png');

  // Open dropdown
  const userArea = page.locator('[class*="user-menu"], [class*="navbar-user"], [class*="user-area"], button[aria-haspopup]').first();
  if (await userArea.count() > 0) {
    await userArea.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-5.1-06-dropdown-open.png');

  // Click Mon profil
  const monProfil = page.locator('a:has-text("Mon profil"), a:has-text("profil")').first();
  if (await monProfil.count() > 0) {
    await monProfil.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-5.1-07-own-profile.png');

  // Return to dashboard, open dropdown again
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1000);
  const userArea2 = page.locator('[class*="user-menu"], [class*="navbar-user"], [class*="user-area"], button[aria-haspopup]').first();
  if (await userArea2.count() > 0) {
    await userArea2.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-5.1-08-dropdown-again.png');

  // Logout
  const logoutBtn = page.locator('button:has-text("Deconnexion"), a:has-text("Deconnexion")').first();
  if (await logoutBtn.count() > 0) {
    await logoutBtn.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-5.1-09-logged-out.png');
  await ctx.close();
}

// Admin login happy path
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  await shot(page, 'US-5.1-10-login-screen.png');

  // Click demo admin button
  const adminBtn = page.locator('button:has-text("admin"), button:has-text("Admin")').last();
  await adminBtn.click();
  await page.waitForTimeout(2500);
  await shot(page, 'US-5.1-11-admin-login.png');
  await shot(page, 'US-5.1-12-admin-tab.png');

  // Click admin tab in navbar
  const adminTab = page.locator('a[href="/admin"], a:has-text("Admin")').first();
  if (await adminTab.count() > 0) {
    await adminTab.click();
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-5.1-13-admin-panel.png');
  await ctx.close();
}

// Keyboard focus management
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  const resBtn = page.locator('button:has-text("researcher"), button:has-text("chercheur")').first();
  await resBtn.click();
  await page.waitForTimeout(2500);
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(1000);

  const userArea = page.locator('[class*="user-menu"], [class*="navbar-user"], [class*="user-area"], button[aria-haspopup]').first();
  if (await userArea.count() > 0) await userArea.click();
  await page.waitForTimeout(500);
  await shot(page, 'US-5.1-KB-01-dropdown-open.png');
  await shot(page, 'US-5.1-KB-02-focus-first-item.png');

  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  await shot(page, 'US-5.1-KB-03-tab-cycle.png');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await shot(page, 'US-5.1-KB-04-escape-close.png');
  await ctx.close();
}

// Route guard
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(1500);
  await shot(page, 'US-5.1-RG-01-navigate-admin.png');
  await page.waitForTimeout(500);
  await shot(page, 'US-5.1-RG-02-redirected.png');
  await ctx.close();
}

// E1: Invalid credentials
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  await shot(page, 'US-5.1-E1-01-login-screen.png');

  await page.fill('#email', 'bad@email.com');
  await page.fill('#password', 'wrongpassword');
  await shot(page, 'US-5.1-E1-02-submit.png');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  await shot(page, 'US-5.1-E1-03-error-message.png');
  await ctx.close();
}

// E2: Auth API unreachable
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);

  await page.route('**/auth/**', route => route.abort());

  await shot(page, 'US-5.1-E2-01-intercept.png');
  await page.fill('#email', 'researcher@cartoPM.fr');
  await page.fill('#password', 'demo123456');
  await shot(page, 'US-5.1-E2-02-submit.png');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await shot(page, 'US-5.1-E2-03-service-error.png');
  await ctx.close();
}

// E3: Session expired
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);

  const resBtn = page.locator('button:has-text("researcher"), button:has-text("chercheur")').first();
  await resBtn.click();
  await page.waitForTimeout(2500);
  await shot(page, 'US-5.1-E3-01-logged-in.png');

  // Intercept API to return 401
  await page.route('**/rest/v1/**', route =>
    route.fulfill({ status: 401, json: { error: 'JWT expired' } })
  );
  await shot(page, 'US-5.1-E3-02-intercept.png');

  await page.goto(`${BASE}/researchers`);
  await page.waitForTimeout(2000);
  await shot(page, 'US-5.1-E3-03-action.png');
  await page.waitForTimeout(1000);
  await shot(page, 'US-5.1-E3-04-session-expired.png');
  await ctx.close();
}

await browser.close();
console.log('US-5.1 done');
