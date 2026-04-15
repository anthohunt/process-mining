// Helper: log in with demo credentials, returns page already on dashboard
export async function loginAs(page, role = 'researcher') {
  const BASE = 'http://127.0.0.1:5199';
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);

  const email = role === 'admin' ? 'admin@cartoPM.fr' : 'researcher@cartoPM.fr';
  const demoText = role === 'admin' ? 'admin' : 'researcher';

  // Try demo button first
  const demoBtn = page.locator(`button:has-text("${demoText}")`).first();
  if (await demoBtn.count() > 0) {
    await demoBtn.click();
  } else {
    await page.fill('#email', email);
    await page.fill('#password', 'demo123456');
    await page.click('button[type="submit"]');
  }
  await page.waitForTimeout(2500);
  return page;
}

export const BASE = 'http://127.0.0.1:5199';

export async function shot(page, OUT, name) {
  const { join } = await import('path');
  await page.screenshot({ path: join(OUT, name) });
  console.log('captured', name);
}
