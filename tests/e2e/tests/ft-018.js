// FT-018: Admin Bulk Import — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // Login as admin
  await page.goto(`${BASE}/login`);
  await page.locator('text=/demo.*admin/i').click();
  await page.waitForTimeout(500);

  // AC-1: Upload CSV populates preview
  let start = Date.now();
  await page.goto(`${BASE}/admin`);
  await page.locator('text=/import/i').first().click();
  await page.waitForTimeout(300);
  const uploadZone = await page.locator('[data-testid="upload-zone"], .upload-zone').count();
  results.push({
    id: 'AC-1',
    criterion: 'Upload zone is present on Import tab',
    status: uploadZone > 0 ? 'pass' : 'fail',
    detail: `Upload zones: ${uploadZone}`,
    duration: Date.now() - start
  });

  // AC-2: Google Scholar URL input present
  start = Date.now();
  const scholarInput = await page.locator('input[placeholder*="scholar"], input[placeholder*="Scholar"]').count();
  results.push({
    id: 'AC-2',
    criterion: 'Google Scholar URL input is present',
    status: scholarInput > 0 ? 'pass' : 'fail',
    detail: `Scholar inputs: ${scholarInput}`,
    duration: Date.now() - start
  });

  // AC-3: Preview table present
  start = Date.now();
  const previewTable = await page.locator('[data-testid="import-preview"] table, .app-table').count();
  results.push({
    id: 'AC-3',
    criterion: 'Preview table is present',
    status: previewTable > 0 ? 'pass' : 'fail',
    detail: `Preview tables: ${previewTable}`,
    duration: Date.now() - start
  });

  // AC-4: "Voir les logs" link present
  start = Date.now();
  const logsLink = await page.locator('text=/voir les logs/i').count();
  results.push({
    id: 'AC-4',
    criterion: '"Voir les logs" link is present',
    status: logsLink > 0 ? 'pass' : 'fail',
    detail: `Logs links: ${logsLink}`,
    duration: Date.now() - start
  });

  // Edge E1: Invalid CSV format
  start = Date.now();
  await page.route('**/api/admin/import/csv', route => route.fulfill({
    status: 400, contentType: 'application/json',
    body: JSON.stringify({ error: 'invalid_format', message: 'Format invalide: colonnes attendues: Nom, Labo, Themes' })
  }));
  // Simulate file upload via input
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    // Create a temporary invalid CSV
    await fileInput.setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from('wrong,columns\n1,2') });
    await page.waitForTimeout(500);
    const formatError = await page.locator('text=/format invalide/i, text=/colonnes attendues/i').count();
    results.push({
      id: 'E1',
      criterion: 'Invalid CSV shows format error',
      status: formatError > 0 ? 'pass' : 'fail',
      detail: `Format error messages: ${formatError}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'E1', criterion: 'Invalid CSV format', status: 'fail', detail: 'No file input found', duration: Date.now() - start });
  }
  await page.unroute('**/api/admin/import/csv');

  // Edge E2: Invalid Google Scholar URL
  start = Date.now();
  await page.route('**/api/admin/import/scholar', route => route.fulfill({
    status: 400, contentType: 'application/json',
    body: JSON.stringify({ error: 'invalid_url' })
  }));
  const scholarField = page.locator('input[placeholder*="scholar"], input[placeholder*="Scholar"]').first();
  if (await scholarField.count() > 0) {
    await scholarField.fill('https://not-a-valid-url.com');
    await page.locator('button:has-text("Importer")').first().click();
    await page.waitForTimeout(500);
    const urlError = await page.locator('text=/invalide/i, text=/introuvable/i').count();
    results.push({
      id: 'E2',
      criterion: 'Invalid Scholar URL shows error',
      status: urlError > 0 ? 'pass' : 'fail',
      detail: `URL error messages: ${urlError}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'E2', criterion: 'Invalid Scholar URL', status: 'fail', detail: 'No Scholar input found', duration: Date.now() - start });
  }

  return results;
};
