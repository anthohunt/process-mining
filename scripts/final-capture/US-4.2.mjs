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

async function loginAndGoAdmin(page) {
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
  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(2000);
}

async function goToImportTab(page) {
  const importTab = page.locator('button:has-text("Import"), [role="tab"]:has-text("Import")').first();
  if (await importTab.count() > 0) {
    await importTab.click();
    await page.waitForTimeout(1000);
  }
}

const GOOD_CSV = 'Nom,Labo,Themes\nDr. Test User,LORIA,Process Discovery\nProf. Another,CNRS,Conformance Checking\nDr. Third,Paris 1,Data Quality\n';
const BAD_CSV = 'Wrong,Headers,Here\nFoo,Bar,Baz\n';
const DUP_CSV = 'Nom,Labo,Themes\nDr. Marie Dupont,LORIA,Process Discovery\nDr. New Person,CNRS,Data Quality\n';

const browser = await chromium.launch();

// Happy path: CSV import
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoAdmin(page);
  await goToImportTab(page);
  await shot(page, 'US-4.2-01-import-tab.png');

  // Use the hidden file input via its ref (click the upload zone)
  const uploadZone = page.locator('.upload-zone, [role="button"][aria-label*="drop"], [aria-label*="Drop"]').first();
  const fileInputHidden = page.locator('input[type="file"]').first();

  if (await fileInputHidden.count() > 0) {
    await fileInputHidden.setInputFiles({
      name: 'researchers.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(GOOD_CSV)
    });
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-4.2-02-file-uploaded.png');
  await shot(page, 'US-4.2-03-preview-table.png');

  // The confirm button has aria-label "Importer N chercheurs" and is btn-primary
  const confirmBtn = page.locator('button.btn-primary:not([disabled])').first();
  if (await confirmBtn.count() > 0) {
    await confirmBtn.click();
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-4.2-04-import-confirmed.png');

  // Click Voir les logs link
  const logsLink = page.locator('button:has-text("Logs"), a:has-text("Logs"), button:has-text("logs")').first();
  if (await logsLink.count() > 0) {
    await logsLink.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-4.2-05-logs-link.png');
  await ctx.close();
}

// Scholar import
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoAdmin(page);
  await goToImportTab(page);
  await shot(page, 'US-4.2-06-import-tab.png');

  const scholarInput = page.locator('#scholar-url, input[placeholder*="scholar"], input[type="url"]').first();
  if (await scholarInput.count() > 0) {
    await scholarInput.fill('https://scholar.google.com/citations?user=testuser');
    await page.waitForTimeout(300);
  }
  await shot(page, 'US-4.2-07-scholar-import.png');

  // Mock the scholar edge function call
  await page.route('**/functions/v1/**', route =>
    route.fulfill({
      json: [{ nom: 'Prof. Scholar Test', labo: 'Test Lab', themes: 'Machine Learning' }]
    })
  );

  // Click the Scholar import button (aria-label="Importer", only enabled when URL set)
  const importScholarBtn = page.locator('button[aria-label="Importer"], button.btn-outline:has-text("Importer")').first();
  if (await importScholarBtn.count() > 0) {
    await importScholarBtn.click({ force: true });
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-4.2-08-scholar-preview.png');
  await ctx.close();
}

// E1: Invalid CSV
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoAdmin(page);
  await goToImportTab(page);

  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles({
      name: 'bad.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(BAD_CSV)
    });
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-4.2-E1-01-upload-bad-csv.png');
  await shot(page, 'US-4.2-E1-02-format-error.png');
  await ctx.close();
}

// E2: Invalid Scholar URL
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoAdmin(page);
  await goToImportTab(page);

  await page.route('**/functions/v1/**', route =>
    route.fulfill({ status: 400, json: { error: 'invalid_url' } })
  );

  await shot(page, 'US-4.2-E2-01-intercept.png');

  const scholarInput = page.locator('#scholar-url, input[type="url"]').first();
  if (await scholarInput.count() > 0) {
    await scholarInput.fill('not-a-valid-url');
    await page.waitForTimeout(300);
  }

  const importBtn = page.locator('button[aria-label="Importer"]').first();
  if (await importBtn.count() > 0) {
    await importBtn.click({ force: true });
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-4.2-E2-02-submit.png');
  await page.waitForTimeout(2000);
  await shot(page, 'US-4.2-E2-03-url-error.png');
  await ctx.close();
}

// E3: Duplicate entries
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoAdmin(page);
  await goToImportTab(page);

  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles({
      name: 'dup.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(DUP_CSV)
    });
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-4.2-E3-01-upload-dup.png');
  await shot(page, 'US-4.2-E3-02-duplicate-flagged.png');

  const confirmBtn = page.locator('button.btn-primary:not([disabled])').first();
  if (await confirmBtn.count() > 0) {
    await confirmBtn.click();
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-4.2-E3-03-partial-import.png');
  await ctx.close();
}

await browser.close();
console.log('US-4.2 done');
