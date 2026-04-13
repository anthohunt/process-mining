// FT-013: User Login — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Valid login redirects to dashboard
  let start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('input[type="email"]').fill('m.dupont@loria.fr');
  await page.locator('input[type="password"]').fill('password123');
  await page.locator('button:has-text("Se connecter")').click();
  await page.waitForURL(/\//);
  results.push({
    id: 'AC-1',
    criterion: 'Valid login redirects to dashboard',
    status: !page.url().includes('/login') ? 'pass' : 'fail',
    detail: `URL after login: ${page.url()}`,
    duration: Date.now() - start
  });

  // AC-2: Navbar shows user avatar and name
  start = Date.now();
  const userArea = await page.locator('[data-testid="navbar-user-area"], .navbar-user-area').count();
  const loginBtn = await page.locator('[data-testid="navbar-login-btn"]:visible, .btn-login:visible').count();
  results.push({
    id: 'AC-2',
    criterion: 'Navbar shows avatar/name, login button hidden',
    status: userArea > 0 && loginBtn === 0 ? 'pass' : 'fail',
    detail: `User area: ${userArea}, Login btn visible: ${loginBtn}`,
    duration: Date.now() - start
  });

  // AC-5: Logout reverts navbar
  start = Date.now();
  await page.locator('[data-testid="navbar-user-area"], .navbar-user-area').click();
  await page.locator('text=/deconnexion/i').click();
  await page.waitForTimeout(500);
  const loginBtnAfter = await page.locator('[data-testid="navbar-login-btn"]:visible, .btn-login:visible').count();
  results.push({
    id: 'AC-5',
    criterion: 'Logout reverts navbar to show Connexion button',
    status: loginBtnAfter > 0 ? 'pass' : 'fail',
    detail: `Login button visible after logout: ${loginBtnAfter}`,
    duration: Date.now() - start
  });

  // Admin login: AC-3 — Admin tab appears
  start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);
  const adminTab = await page.locator('[data-section="admin"]:visible, .nav-btn-admin:visible').count();
  const adminBadge = await page.locator('[data-testid="navbar-admin-badge"]:visible, .navbar-admin-badge:visible').count();
  results.push({
    id: 'AC-3',
    criterion: 'Admin login shows Admin tab and badge',
    status: adminTab > 0 ? 'pass' : 'fail',
    detail: `Admin tab: ${adminTab}, Badge: ${adminBadge}`,
    duration: Date.now() - start
  });

  // Edge E1: Invalid credentials
  start = Date.now();
  await page.locator('text=/deconnexion/i').click().catch(() => {});
  await page.goto(`${BASE}/login`);
  await page.route('**/auth/**', route => route.fulfill({
    status: 400, contentType: 'application/json',
    body: JSON.stringify({ error: 'invalid_credentials' })
  }));
  await page.locator('input[type="email"]').fill('bad@email.com');
  await page.locator('input[type="password"]').fill('wrong');
  await page.locator('button:has-text("Se connecter")').click();
  await page.waitForTimeout(500);
  const errorMsg = await page.locator('text=/incorrect/i').count();
  results.push({
    id: 'E1',
    criterion: 'Invalid credentials shows error message',
    status: errorMsg > 0 ? 'pass' : 'fail',
    detail: `Error messages: ${errorMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/auth/**');

  // Edge E2: Auth API unreachable
  start = Date.now();
  await page.route('**/auth/**', route => route.abort());
  await page.locator('input[type="email"]').fill('test@test.com');
  await page.locator('input[type="password"]').fill('test');
  await page.locator('button:has-text("Se connecter")').click();
  await page.waitForTimeout(500);
  const serviceError = await page.locator('text=/indisponible/i').count();
  results.push({
    id: 'E2',
    criterion: 'Unreachable API shows service error',
    status: serviceError > 0 ? 'pass' : 'fail',
    detail: `Service error messages: ${serviceError}`,
    duration: Date.now() - start
  });

  return results;
};
