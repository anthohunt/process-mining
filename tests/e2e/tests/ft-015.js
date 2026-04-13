// FT-015: Profile Form Add/Edit — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // Login first
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*chercheur/i').click();
  await page.waitForTimeout(500);

  // AC-1: Form loads with fields
  let start = Date.now();
  await page.goto(`${BASE}/researchers/own-id/edit`);
  const nameInput = await page.locator('input[placeholder*="Nom"], [data-testid="field-name"]').count();
  const labSelect = await page.locator('select, [data-testid="field-lab"]').count();
  const bioTextarea = await page.locator('textarea, [data-testid="field-bio"]').count();
  results.push({
    id: 'AC-1',
    criterion: 'Form loads with name, lab, bio fields',
    status: nameInput > 0 && labSelect > 0 && bioTextarea > 0 ? 'pass' : 'fail',
    detail: `Name: ${nameInput}, Lab: ${labSelect}, Bio: ${bioTextarea}`,
    duration: Date.now() - start
  });

  // AC-2: Add keyword tag
  start = Date.now();
  const tagInput = page.locator('[data-testid="tag-input"] input, [data-testid="keyword-input"]').first();
  if (await tagInput.count() > 0) {
    await tagInput.fill('NLP');
    await tagInput.press('Enter');
    await page.waitForTimeout(300);
    const nlpTag = await page.locator('.tag:has-text("NLP")').count();
    results.push({
      id: 'AC-2',
      criterion: 'Typing keyword + Enter adds tag',
      status: nlpTag > 0 ? 'pass' : 'fail',
      detail: `NLP tags: ${nlpTag}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-2', criterion: 'Add tag', status: 'fail', detail: 'No tag input found', duration: Date.now() - start });
  }

  // AC-3: Add publication block
  start = Date.now();
  const pubCountBefore = await page.locator('[data-testid="publication-block"]').count();
  await page.locator('text=/ajouter une publication/i').click();
  await page.waitForTimeout(300);
  const pubCountAfter = await page.locator('[data-testid="publication-block"]').count();
  results.push({
    id: 'AC-3',
    criterion: '"+ Ajouter une publication" adds a new block',
    status: pubCountAfter > pubCountBefore ? 'pass' : 'fail',
    detail: `Before: ${pubCountBefore}, After: ${pubCountAfter}`,
    duration: Date.now() - start
  });

  // AC-5: Cancel navigates back
  start = Date.now();
  await page.locator('text=/annuler/i').click();
  await page.waitForURL(/\/researchers/);
  results.push({
    id: 'AC-5',
    criterion: 'Cancel navigates back to researcher list',
    status: !page.url().includes('/edit') ? 'pass' : 'fail',
    detail: `URL: ${page.url()}`,
    duration: Date.now() - start
  });

  // AC-6: Approval banner visible
  start = Date.now();
  await page.goto(`${BASE}/researchers/own-id/edit`);
  const banner = await page.locator('[data-testid="approval-banner"], .approval-banner').count();
  results.push({
    id: 'AC-6',
    criterion: 'Yellow approval banner is shown',
    status: banner > 0 ? 'pass' : 'fail',
    detail: `Banners: ${banner}`,
    duration: Date.now() - start
  });

  // Edge E1: Required fields empty — validation
  start = Date.now();
  await page.locator('input[placeholder*="Nom"], [data-testid="field-name"]').first().fill('');
  await page.locator('button:has-text("Enregistrer")').click();
  await page.waitForTimeout(300);
  const validationError = await page.locator('.form-group.error, [data-testid="validation-error"], input:invalid').count();
  results.push({
    id: 'E1',
    criterion: 'Empty required fields show validation errors',
    status: validationError > 0 ? 'pass' : 'fail',
    detail: `Validation errors: ${validationError}`,
    duration: Date.now() - start
  });

  // Edge E2: Save API failure preserves data
  start = Date.now();
  await page.locator('input[placeholder*="Nom"], [data-testid="field-name"]').first().fill('Test Name');
  await page.route('**/api/researchers**', route => route.fulfill({ status: 500 }));
  await page.locator('button:has-text("Enregistrer")').click();
  await page.waitForTimeout(500);
  const nameStill = await page.locator('input[placeholder*="Nom"], [data-testid="field-name"]').first().inputValue();
  const errorToast = await page.locator('text=/erreur de sauvegarde/i, [data-testid="toast-error"]').count();
  results.push({
    id: 'E2',
    criterion: 'Save failure shows error, preserves form data',
    status: nameStill === 'Test Name' && errorToast > 0 ? 'pass' : 'fail',
    detail: `Name preserved: ${nameStill === 'Test Name'}, Error toast: ${errorToast}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/researchers**');

  // Edge E3: Duplicate keyword rejected
  start = Date.now();
  const tagInput2 = page.locator('[data-testid="tag-input"] input, [data-testid="keyword-input"]').first();
  if (await tagInput2.count() > 0) {
    const existingTag = await page.locator('.tag').first().textContent();
    const tagName = existingTag.replace(/\s*x\s*$/, '').trim();
    await tagInput2.fill(tagName);
    await tagInput2.press('Enter');
    await page.waitForTimeout(300);
    const dupMsg = await page.locator('text=/deja present/i').count();
    results.push({
      id: 'E3',
      criterion: 'Duplicate keyword shows rejection message',
      status: dupMsg > 0 ? 'pass' : 'fail',
      detail: `Duplicate message: ${dupMsg}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'E3', criterion: 'Duplicate keyword', status: 'fail', detail: 'No tag input', duration: Date.now() - start });
  }

  return results;
};
