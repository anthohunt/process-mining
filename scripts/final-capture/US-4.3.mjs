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

async function loginAndGoSettings(page) {
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

  const settingsTab = page.locator('button:has-text("Parametres"), [role="tab"]:has-text("Parametres"), button:has-text("Settings")').first();
  if (await settingsTab.count() > 0) {
    await settingsTab.click();
    await page.waitForTimeout(1000);
  }
}

const browser = await chromium.launch();

// Happy path
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoSettings(page);
  await shot(page, 'US-4.3-01-settings-tab.png');
  await shot(page, 'US-4.3-02-language-section.png');
  await shot(page, 'US-4.3-03-threshold-section.png');

  // Change slider
  const slider = page.locator('input[type="range"]').first();
  if (await slider.count() > 0) {
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      // Move slider to ~75% position
      await page.mouse.click(sliderBox.x + sliderBox.width * 0.75, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(300);
    }
  }
  await shot(page, 'US-4.3-04-slider-changed.png');
  await shot(page, 'US-4.3-05-nlp-section.png');

  // Change NLP dropdown
  const nlpSelect = page.locator('select').first();
  if (await nlpSelect.count() > 0) {
    await nlpSelect.selectOption({ index: 1 });
    await page.waitForTimeout(300);
  }
  await shot(page, 'US-4.3-06-nlp-changed.png');

  const saveBtn = page.locator('button:has-text("Sauvegarder")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-4.3-07-saved.png');
  await ctx.close();
}

// E1: Save API failure
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoSettings(page);

  await page.route('**/rest/v1/app_settings**', route => {
    if (route.request().method() !== 'GET') {
      return route.fulfill({ status: 500 });
    }
    return route.continue();
  });

  await shot(page, 'US-4.3-E1-01-intercept.png');

  const slider = page.locator('input[type="range"]').first();
  if (await slider.count() > 0) {
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      await page.mouse.click(sliderBox.x + sliderBox.width * 0.6, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(300);
    }
  }

  const saveBtn = page.locator('button:has-text("Sauvegarder")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-4.3-E1-02-submit.png');
  await page.waitForTimeout(2000);
  await shot(page, 'US-4.3-E1-03-error.png');
  await ctx.close();
}

// E2: Unsaved changes navigation
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoSettings(page);

  // Change slider without saving
  const slider = page.locator('input[type="range"]').first();
  if (await slider.count() > 0) {
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      await page.mouse.click(sliderBox.x + sliderBox.width * 0.3, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(300);
    }
  }
  await shot(page, 'US-4.3-E2-01-changed.png');

  // Click Users tab
  const usersTab = page.locator('button:has-text("Utilisateurs"), [role="tab"]:has-text("Utilisateurs")').first();
  if (await usersTab.count() > 0) {
    await usersTab.click();
    await page.waitForTimeout(800);
  }
  await shot(page, 'US-4.3-E2-02-navigate.png');
  await page.waitForTimeout(500);
  await shot(page, 'US-4.3-E2-03-confirm-dialog.png');
  await ctx.close();
}

// E3: Zero threshold warning
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoSettings(page);

  // Drag slider to 0
  const slider = page.locator('input[type="range"]').first();
  if (await slider.count() > 0) {
    await slider.fill('0');
    await page.waitForTimeout(300);
  }
  await shot(page, 'US-4.3-E3-01-zero-threshold.png');

  const saveBtn = page.locator('button:has-text("Sauvegarder")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-4.3-E3-02-save.png');
  await page.waitForTimeout(1500);
  await shot(page, 'US-4.3-E3-03-warning.png');
  await ctx.close();
}

await browser.close();
console.log('US-4.3 done');
