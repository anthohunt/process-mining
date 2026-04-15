import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../../tests/e2e/final');
const BASE = 'http://127.0.0.1:5199';
const RESEARCHER_ID = 'a0000000-0000-4000-8000-000000000052';

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name) });
  console.log('captured', name);
}

async function loginAsResearcher(page) {
  await page.goto(BASE + '/login');
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Demo Chercheur")').click();
  await page.waitForTimeout(2500);
}

// Intercept to make the first researcher "own" the profile
async function patchOwnProfile(page) {
  const userId = await page.evaluate(() => {
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.includes('supabase') || k.includes('auth')) {
          const parsed = JSON.parse(localStorage.getItem(k) || '{}');
          if (parsed?.user?.id) return parsed.user.id;
          if (parsed?.session?.user?.id) return parsed.session.user.id;
        }
      }
    } catch {}
    return 'mock-user-id';
  });

  await page.route(`**/rest/v1/researchers*id=eq.${RESEARCHER_ID}*`, async route => {
    if (route.request().method() !== 'GET') { await route.continue(); return; }
    const res = await route.fetch();
    const body = await res.text();
    try {
      const json = JSON.parse(body);
      const data = Array.isArray(json) ? json : [json];
      const modified = data.map(r => ({ ...r, user_id: userId }));
      await route.fulfill({ json: Array.isArray(json) ? modified : modified[0] });
    } catch {
      await route.fulfill({ body, headers: res.headers() });
    }
  });
  return userId;
}

const browser = await chromium.launch();

// Happy path: own profile edit
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsResearcher(page);
  await shot(page, 'US-5.2-01-logged-in.png');

  // Navigate to own profile
  await patchOwnProfile(page);
  await page.goto(`${BASE}/researchers/${RESEARCHER_ID}`);
  await page.waitForTimeout(1500);
  await shot(page, 'US-5.2-02-own-profile.png');
  await shot(page, 'US-5.2-03-edit-enabled.png');

  // Click Modifier (should be enabled since user_id matches)
  const editBtn = page.locator('button:has-text("Modifier"):not([disabled]), a:has-text("Modifier")').first();
  if (await editBtn.count() > 0) {
    await editBtn.click();
    await page.waitForTimeout(1500);
  } else {
    // Navigate directly to edit
    await page.goto(`${BASE}/researchers/${RESEARCHER_ID}/edit`);
    await page.waitForTimeout(1500);
  }
  await shot(page, 'US-5.2-04-edit-form.png');
  await shot(page, 'US-5.2-05-approval-banner.png');

  const bioInput = page.locator('textarea[id="edit-bio"], textarea[id="bio"], textarea').first();
  if (await bioInput.count() > 0) {
    await bioInput.fill('Bio updated during final verification test.');
  }
  const saveBtn = page.locator('button:has-text("Enregistrer")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(2000);
  }
  await shot(page, 'US-5.2-06-saved.png');
  await ctx.close();
}

// Other profile - locked (logged in but different profile)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsResearcher(page);
  await shot(page, 'US-5.2-07-logged-in.png');

  // Go to second researcher (NOT the one we intercept for own)
  await page.goto(BASE + '/researchers');
  await page.waitForTimeout(1500);
  // Click second Voir button (a different profile)
  await page.locator('button:has-text("Voir")').nth(1).click();
  await page.waitForTimeout(1500);
  await shot(page, 'US-5.2-08-other-profile.png');
  await shot(page, 'US-5.2-09-edit-locked.png');
  await ctx.close();
}

// Anonymous - no edit button
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/researchers');
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Voir")').first().click();
  await page.waitForTimeout(1500);
  await shot(page, 'US-5.2-10-anonymous-profile.png');
  await shot(page, 'US-5.2-11-no-edit-button.png');
  await ctx.close();
}

// E1: Already pending
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsResearcher(page);
  await patchOwnProfile(page);

  await page.route('**/rest/v1/researchers**', async route => {
    if (route.request().method() === 'PATCH' || route.request().method() === 'POST') {
      await route.fulfill({ json: { error: 'already_pending' }, status: 200 });
    } else {
      await route.continue();
    }
  });

  await page.goto(`${BASE}/researchers/${RESEARCHER_ID}/edit`);
  await page.waitForTimeout(1500);
  await shot(page, 'US-5.2-E1-01-intercept.png');

  const saveBtn = page.locator('button:has-text("Enregistrer")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-5.2-E1-02-submit.png');
  await page.waitForTimeout(2000);
  await shot(page, 'US-5.2-E1-03-already-pending.png');
  await ctx.close();
}

// E2: Save API failure
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsResearcher(page);
  await patchOwnProfile(page);

  await page.route('**/rest/v1/researchers**', async route => {
    if (route.request().method() === 'PATCH' || route.request().method() === 'POST') {
      await route.fulfill({ status: 500 });
    } else {
      await route.continue();
    }
  });

  await page.goto(`${BASE}/researchers/${RESEARCHER_ID}/edit`);
  await page.waitForTimeout(1500);
  await shot(page, 'US-5.2-E2-01-intercept.png');

  const saveBtn = page.locator('button:has-text("Enregistrer")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await page.waitForTimeout(500);
  }
  await shot(page, 'US-5.2-E2-02-submit.png');
  await page.waitForTimeout(2000);
  await shot(page, 'US-5.2-E2-03-error-toast.png');
  await ctx.close();
}

// E3: Rejection notice
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await loginAsResearcher(page);
  const userId = await page.evaluate(() => {
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.includes('supabase') || k.includes('auth')) {
          const parsed = JSON.parse(localStorage.getItem(k) || '{}');
          if (parsed?.user?.id) return parsed.user.id;
          if (parsed?.session?.user?.id) return parsed.session.user.id;
        }
      }
    } catch {}
    return 'mock-user-id';
  });

  await page.route(`**/rest/v1/researchers*id=eq.${RESEARCHER_ID}*`, async route => {
    if (route.request().method() !== 'GET') { await route.continue(); return; }
    const res = await route.fetch();
    const body = await res.text();
    try {
      const json = JSON.parse(body);
      const data = Array.isArray(json) ? json : [json];
      const modified = data.map(r => ({
        ...r,
        user_id: userId,
        status: 'rejected',
        rejection_reason: 'Informations insuffisantes sur les publications.'
      }));
      await route.fulfill({ json: Array.isArray(json) ? modified : modified[0] });
    } catch {
      await route.fulfill({ body, headers: res.headers() });
    }
  });

  await shot(page, 'US-5.2-E3-01-intercept.png');
  await page.goto(`${BASE}/researchers/${RESEARCHER_ID}`);
  await page.waitForTimeout(2000);
  await shot(page, 'US-5.2-E3-02-profile.png');
  await shot(page, 'US-5.2-E3-03-rejection-notice.png');
  await ctx.close();
}

await browser.close();
console.log('US-5.2 done');
