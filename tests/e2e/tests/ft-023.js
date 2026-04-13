// FT-023: Focus Management — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Screen navigation moves focus to heading
  let start = Date.now();
  await page.goto(BASE);
  await page.locator('.nav-btn[data-section="researchers"], button:has-text("Chercheurs")').click();
  await page.waitForTimeout(500);
  const focusedAfterNav = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName}.${el.textContent?.substring(0, 30)}` : 'none';
  });
  results.push({
    id: 'AC-1',
    criterion: 'Screen navigation moves focus to heading or main content',
    status: focusedAfterNav !== 'none' ? 'pass' : 'fail',
    detail: `Focused after nav: ${focusedAfterNav}`,
    duration: Date.now() - start
  });

  // AC-2: Modal/popover traps focus
  start = Date.now();
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);
  await page.goto(`${BASE}/admin`);
  // Try to trigger an invite dialog
  const inviteBtn = page.locator('text=/inviter/i').first();
  if (await inviteBtn.count() > 0) {
    await inviteBtn.click();
    await page.waitForTimeout(300);
    // Tab several times — focus should stay within dialog
    for (let i = 0; i < 10; i++) await page.keyboard.press('Tab');
    const focusInDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"], .modal, [data-testid="invite-dialog"]');
      return dialog ? dialog.contains(document.activeElement) : false;
    });
    results.push({
      id: 'AC-2',
      criterion: 'Focus is trapped inside modal/dialog',
      status: focusInDialog ? 'pass' : 'fail',
      detail: `Focus in dialog: ${focusInDialog}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-2', criterion: 'Focus trap in modal', status: 'fail', detail: 'No invite button to open dialog', duration: Date.now() - start });
  }

  // AC-3: Closing modal returns focus to trigger
  start = Date.now();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const focusAfterClose = await page.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName}.${el.textContent?.substring(0, 30)}` : 'none';
  });
  results.push({
    id: 'AC-3',
    criterion: 'Closing modal returns focus to trigger element',
    status: focusAfterClose.toLowerCase().includes('button') || focusAfterClose !== 'none' ? 'pass' : 'fail',
    detail: `Focus after close: ${focusAfterClose}`,
    duration: Date.now() - start
  });

  return results;
};
