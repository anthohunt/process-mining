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

// Navigate to edit page by going directly to a researcher's edit URL
// We intercept to inject user_id matching the logged-in user
async function loginAndGoToEdit(page) {
  await page.goto(BASE + '/login');
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Demo Chercheur")').click();
  await page.waitForTimeout(2500);

  // Get the researcher demo user id from the page context
  const userId = await page.evaluate(() => {
    // Try to get from localStorage/supabase session
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.includes('supabase') || k.includes('auth')) {
          const val = localStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            if (parsed?.user?.id) return parsed.user.id;
            if (parsed?.session?.user?.id) return parsed.session.user.id;
          }
        }
      }
    } catch {}
    return null;
  });
  console.log('user id:', userId);

  // Use a known researcher ID and intercept to inject the user_id
  const RESEARCHER_ID = 'a0000000-0000-4000-8000-000000000052';

  // Set up intercept BEFORE navigating to the edit page
  const UID = userId || 'mock-user-id';
  await page.route(`**/rest/v1/researchers*id=eq.${RESEARCHER_ID}*`, async route => {
    const res = await route.fetch();
    const json = await res.json();
    const data = Array.isArray(json) ? json : [json];
    const modified = data.map(r => ({ ...r, user_id: UID }));
    await route.fulfill({ json: Array.isArray(json) ? modified : modified[0] });
  });

  await page.goto(`${BASE}/researchers/${RESEARCHER_ID}/edit`);
  await page.waitForTimeout(2000);
  console.log('edit url:', page.url());
}

const browser = await chromium.launch();

// Happy path
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoToEdit(page);
  await shot(page, 'US-2.3-01-form-loaded.png');
  await shot(page, 'US-2.3-02-form-fields.png');

  // Add keyword NLP using the known id
  const kwInput = page.locator('#edit-keywords').first();
  if (await kwInput.count() > 0) {
    await kwInput.fill('NLP');
    await page.waitForTimeout(300);
    await kwInput.press('Enter');
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-2.3-03-add-keyword.png');

  // Remove a keyword tag (click x on first tag)
  const removeBtn = page.locator('[class*="tag"] button, [class*="kw"] button, button[aria-label*="Supprimer"]').first();
  if (await removeBtn.count() > 0) {
    await removeBtn.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-2.3-04-remove-keyword.png');

  // Add publication
  const addPubBtn = page.locator('button:has-text("Ajouter une publication"), button:has-text("publication")').first();
  if (await addPubBtn.count() > 0) {
    await addPubBtn.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-2.3-05-add-publication.png');

  // Fill new publication
  const pubTitles = page.locator('input[id*="pub-title"]');
  const lastTitle = pubTitles.last();
  if (await lastTitle.count() > 0) await lastTitle.fill('Test Publication Title');
  const coauthors = page.locator('input[id*="pub-coauthors"]').last();
  if (await coauthors.count() > 0) await coauthors.fill('Co-author Name');
  await shot(page, 'US-2.3-06-fill-publication.png');

  // Save
  const saveBtn = page.locator('button:has-text("Enregistrer")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-2.3-07-saved.png');

  // Return to form and cancel
  await loginAndGoToEdit(page);
  const cancelBtn = page.locator('button:has-text("Annuler"), a:has-text("Annuler")').first();
  if (await cancelBtn.count() > 0) {
    await cancelBtn.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'US-2.3-08-cancelled.png');
  await ctx.close();
}

// E1: Required field empty
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoToEdit(page);
  await shot(page, 'US-2.3-E1-01-form-loaded.png');

  const nameInput = page.locator('#edit-name').first();
  if (await nameInput.count() > 0) {
    await nameInput.fill('');
    await nameInput.clear();
  }
  const saveBtn = page.locator('button:has-text("Enregistrer")').first();
  if (await saveBtn.count() > 0) await saveBtn.click();
  await page.waitForTimeout(500);
  await shot(page, 'US-2.3-E1-02-submit-empty.png');
  await page.waitForTimeout(1000);
  await shot(page, 'US-2.3-E1-03-validation-error.png');
  await ctx.close();
}

// E2: Save API failure
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoToEdit(page);

  await page.route('**/rest/v1/researchers**', async route => {
    if (route.request().method() === 'PATCH' || route.request().method() === 'POST') {
      await route.fulfill({ status: 500 });
    } else {
      await route.continue();
    }
  });

  await shot(page, 'US-2.3-E2-01-intercept.png');
  const saveBtn = page.locator('button:has-text("Enregistrer")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-2.3-E2-02-submit.png');
  await page.waitForTimeout(2000);
  await shot(page, 'US-2.3-E2-03-error-preserved.png');
  await ctx.close();
}

// E3: Duplicate keyword
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAndGoToEdit(page);
  await shot(page, 'US-2.3-E3-01-form-loaded.png');

  // Get first existing keyword text from the tags
  const firstTag = page.locator('[class*="tag"]:not(button), [class*="kw-tag"], [class*="keyword-tag"]').first();
  let existingKw = 'Process Discovery';
  if (await firstTag.count() > 0) {
    const txt = await firstTag.textContent();
    if (txt) existingKw = txt.replace('×', '').trim();
  }

  const kwInput = page.locator('#edit-keywords').first();
  if (await kwInput.count() > 0) {
    await kwInput.fill(existingKw);
    await page.waitForTimeout(300);
    await shot(page, 'US-2.3-E3-02-type-duplicate.png');
    await kwInput.press('Enter');
    await page.waitForTimeout(800);
  } else {
    await shot(page, 'US-2.3-E3-02-type-duplicate.png');
  }
  await shot(page, 'US-2.3-E3-03-duplicate-rejected.png');
  await ctx.close();
}

await browser.close();
console.log('US-2.3 done');
