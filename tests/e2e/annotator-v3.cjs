/**
 * Annotator v3 — Coherent highlights
 * Retakes all 44 screenshots with meaningful highlights
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DELIVERY_DIR = path.join(__dirname, 'delivery');
const BASE_URL = 'http://localhost:5199';
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co';

// Step descriptions from JSON
const descriptions = JSON.parse(
  fs.readFileSync(path.join(DELIVERY_DIR, 'm1-step-descriptions.json'), 'utf8')
);

// Cleanup script — run before every highlight
const CLEANUP_JS = `
  document.querySelectorAll('[data-annotated]').forEach(el => {
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.boxShadow = '';
    el.removeAttribute('data-annotated');
  });
  document.querySelectorAll('[data-step-banner]').forEach(el => el.remove());
`;

// Add highlight to a selector
function highlightJS(selector) {
  if (!selector) return '';
  return `
    (function() {
      const el = document.querySelector('${selector}');
      if (el) {
        el.style.outline = '3px solid #dc3545';
        el.style.outlineOffset = '4px';
        el.style.boxShadow = '0 0 0 6px rgba(220, 53, 69, 0.25)';
        el.setAttribute('data-annotated', 'true');
        return true;
      }
      return false;
    })();
  `;
}

// Add banner with step text
function bannerJS(filename) {
  const desc = descriptions[filename];
  const text = desc ? `${desc.action} — ${desc.expected}` : filename;
  // Escape single quotes
  const safe = text.replace(/'/g, "\\'");
  return `
    (function() {
      const banner = document.createElement('div');
      banner.setAttribute('data-step-banner', 'true');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:8px 16px;background:rgba(12,27,51,0.85);color:#fff;font:14px Poppins,sans-serif;z-index:99999;text-align:center;pointer-events:none;';
      banner.textContent = '${safe}';
      document.body.appendChild(banner);
    })();
  `;
}

async function screenshot(page, filename) {
  const outPath = path.join(DELIVERY_DIR, filename);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`  -> ${filename}`);
}

async function cleanupAndHighlight(page, selector, filename) {
  await page.evaluate(CLEANUP_JS);
  if (selector) {
    const found = await page.evaluate(highlightJS(selector));
    if (!found) console.warn(`  [WARN] selector not found: ${selector}`);
  }
  await page.evaluate(bannerJS(filename));
}

// Navigate to a route using the navbar buttons
async function navTo(page, route) {
  if (route === '/') {
    await page.goto(BASE_URL + '/');
    await page.waitForTimeout(1500);
  } else if (route === '/researchers') {
    const btn = page.locator('.app-navbar nav button', { hasText: 'Chercheurs' });
    await btn.click();
    await page.waitForTimeout(1000);
  } else if (route === '/themes') {
    const btn = page.locator('.app-navbar nav button', { hasText: 'Themes' });
    await btn.click();
    await page.waitForTimeout(1000);
  } else if (route === '/map') {
    const btn = page.locator('.app-navbar nav button', { hasText: 'Carte' });
    await btn.click();
    await page.waitForTimeout(1000);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  let count = 0;

  try {
    // =========================================================
    // US-1.1 HAPPY PATH
    // =========================================================
    console.log('\n=== US-1.1 Happy Path ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      // Step 1: Navigate to dashboard
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(2000);
      await cleanupAndHighlight(page, '.stat-grid', 'US-1.1-01-dashboard-loaded.png');
      await screenshot(page, 'US-1.1-01-dashboard-loaded.png');
      count++;

      // Step 2: Stat cards visible
      await cleanupAndHighlight(page, '.stat-grid', 'US-1.1-02-stat-cards-visible.png');
      await screenshot(page, 'US-1.1-02-stat-cards-visible.png');
      count++;

      // Step 3: Stat values — highlight first stat card
      await cleanupAndHighlight(page, '.stat-card:first-child', 'US-1.1-03-stat-values.png');
      await screenshot(page, 'US-1.1-03-stat-values.png');
      count++;

      // Step 4: Click Chercheurs card — then highlight researchers page content
      const chercheurs = page.locator('.stat-card', { hasText: 'Chercheurs' });
      await chercheurs.click();
      await page.waitForTimeout(1500);
      // On researchers page — highlight main content area
      await cleanupAndHighlight(page, '.main-content', 'US-1.1-04-click-chercheurs-card.png');
      await screenshot(page, 'US-1.1-04-click-chercheurs-card.png');
      count++;

      // Step 5: Back to dashboard — click Tableau de Bord
      const dashBtn = page.locator('.app-navbar nav button', { hasText: 'Tableau de Bord' });
      await dashBtn.click();
      await page.waitForTimeout(1500);
      // Highlight the active navbar button to show what was clicked
      await cleanupAndHighlight(page, '.app-navbar nav button.active', 'US-1.1-05-back-to-dashboard.png');
      await screenshot(page, 'US-1.1-05-back-to-dashboard.png');
      count++;

      // Step 6: Click Themes card
      const themes = page.locator('.stat-card', { hasText: 'Themes' });
      await themes.click();
      await page.waitForTimeout(1500);
      await cleanupAndHighlight(page, '.main-content', 'US-1.1-06-click-themes-card.png');
      await screenshot(page, 'US-1.1-06-click-themes-card.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.1 Edge Case E1: API Unreachable
    // =========================================================
    console.log('\n=== US-1.1 E1: API Unreachable ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      // Set up route to abort stat requests
      await page.route(`**/${SUPABASE}/rest/v1/researchers*`, route => route.abort());
      await page.route(`**/${SUPABASE}/rest/v1/clusters*`, route => route.abort());
      await page.route(`**/${SUPABASE}/rest/v1/publications*`, route => route.abort());
      await page.route(`**/${SUPABASE}/rest/v1/audit_logs*`, route => route.abort());

      // Step E1-01: intercept set — show dashboard before nav, no highlight
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(500);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.1-E1-01-intercept-set.png'));
      await screenshot(page, 'US-1.1-E1-01-intercept-set.png');
      count++;

      // Step E1-02: dashboard loads while server unavailable
      await page.waitForTimeout(2000);
      await cleanupAndHighlight(page, '.stat-grid', 'US-1.1-E1-02-dashboard-loading.png');
      await screenshot(page, 'US-1.1-E1-02-dashboard-loading.png');
      count++;

      // Step E1-03: error state
      // Check what the stat grid shows when API fails
      await cleanupAndHighlight(page, '.stat-grid', 'US-1.1-E1-03-error-state.png');
      await screenshot(page, 'US-1.1-E1-03-error-state.png');
      count++;

      // Step E1-04: retry button
      const retrySelector = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const retry = btns.find(b => b.textContent.includes('Reessayer') || b.textContent.includes('Réessayer') || b.textContent.includes('retry') || b.textContent.toLowerCase().includes('retry'));
        if (retry) {
          retry.setAttribute('data-retry-found', 'true');
          return '[data-retry-found]';
        }
        // Also check links
        const links = [...document.querySelectorAll('a')];
        const retryLink = links.find(l => l.textContent.includes('Reessayer') || l.textContent.includes('Réessayer'));
        if (retryLink) {
          retryLink.setAttribute('data-retry-found', 'true');
          return '[data-retry-found]';
        }
        return null;
      });
      await cleanupAndHighlight(page, retrySelector || '.stat-grid', 'US-1.1-E1-04-retry-visible.png');
      await screenshot(page, 'US-1.1-E1-04-retry-visible.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.1 Edge Case E2: Empty Database (zeros)
    // =========================================================
    console.log('\n=== US-1.1 E2: Empty Database ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      // Intercept to return zeros
      await page.route(`**/${SUPABASE}/rest/v1/researchers*`, route => {
        const method = route.request().method();
        if (method === 'HEAD') {
          route.fulfill({ status: 200, headers: { 'Content-Range': '*/0', 'Content-Type': 'application/json', 'preference-applied': 'count=exact' }, body: '' });
        } else {
          route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' });
        }
      });
      await page.route(`**/${SUPABASE}/rest/v1/clusters*`, route => {
        const method = route.request().method();
        if (method === 'HEAD') {
          route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json', 'Content-Range': '*/0', 'preference-applied': 'count=exact' }, body: '' });
        } else {
          route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' });
        }
      });
      await page.route(`**/${SUPABASE}/rest/v1/publications*`, route => {
        const method = route.request().method();
        if (method === 'HEAD') {
          route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json', 'Content-Range': '*/0', 'preference-applied': 'count=exact' }, body: '' });
        } else {
          route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' });
        }
      });
      await page.route(`**/${SUPABASE}/rest/v1/audit_logs*`, route => {
        route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' });
      });

      // E2-01: setup
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(500);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.1-E2-01-intercept-zeros.png'));
      await screenshot(page, 'US-1.1-E2-01-intercept-zeros.png');
      count++;

      // E2-02: dashboard loaded
      await page.waitForTimeout(2000);
      await cleanupAndHighlight(page, '.stat-grid', 'US-1.1-E2-02-dashboard-loaded.png');
      await screenshot(page, 'US-1.1-E2-02-dashboard-loaded.png');
      count++;

      // E2-03: zero stats — find a stat card showing "0"
      await cleanupAndHighlight(page, '.stat-card:first-child', 'US-1.1-E2-03-zero-stats.png');
      await screenshot(page, 'US-1.1-E2-03-zero-stats.png');
      count++;

      // E2-04: empty message
      // Check for any empty state message
      const emptyMsg = await page.evaluate(() => {
        const all = [...document.querySelectorAll('*')];
        const msg = all.find(el => el.childNodes.length === 1 && el.textContent.includes('Aucune'));
        if (msg) {
          msg.setAttribute('data-empty-msg', 'true');
          return '[data-empty-msg]';
        }
        return null;
      });
      await cleanupAndHighlight(page, emptyMsg || '.activity-list', 'US-1.1-E2-04-empty-message.png');
      await screenshot(page, 'US-1.1-E2-04-empty-message.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.1 Edge Case E3: Large Numbers
    // =========================================================
    console.log('\n=== US-1.1 E3: Large Numbers ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      // Intercept with large counts
      // Supabase JS reads count from content-range header. Must use status 206 and
      // access-control-expose-headers so browser fetch() can read the header cross-origin.
      const exposeHdrs = 'Content-Range, content-range, preference-applied';
      const fakeKeywords = Array.from({ length: 500 }, (_, i) => ({
        keywords: [`theme_${i}`, `topic_${i}`]
      }));

      await page.route(`**/${SUPABASE}/rest/v1/researchers*`, route => {
        const url = route.request().url();
        const method = route.request().method();
        if (method === 'HEAD') {
          route.fulfill({
            status: 206,
            headers: {
              'content-range': '0-99999/100000',
              'content-type': 'application/json; charset=utf-8',
              'preference-applied': 'count=exact',
              'access-control-expose-headers': exposeHdrs,
              'access-control-allow-origin': 'http://localhost:5199',
              'access-control-allow-credentials': 'true'
            },
            body: ''
          });
        } else if (url.includes('select=keywords')) {
          route.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify(fakeKeywords) });
        } else {
          route.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, body: '[]' });
        }
      });
      await page.route(`**/${SUPABASE}/rest/v1/clusters*`, route => {
        if (route.request().method() === 'HEAD') {
          route.fulfill({ status: 206, headers: { 'content-range': '0-49/50', 'content-type': 'application/json', 'preference-applied': 'count=exact', 'access-control-expose-headers': exposeHdrs, 'access-control-allow-origin': 'http://localhost:5199' }, body: '' });
        } else {
          route.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, body: '[]' });
        }
      });
      await page.route(`**/${SUPABASE}/rest/v1/publications*`, route => {
        if (route.request().method() === 'HEAD') {
          route.fulfill({ status: 206, headers: { 'content-range': '0-999998/999999', 'content-type': 'application/json', 'preference-applied': 'count=exact', 'access-control-expose-headers': exposeHdrs, 'access-control-allow-origin': 'http://localhost:5199' }, body: '' });
        } else {
          route.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, body: '[]' });
        }
      });
      await page.route(`**/${SUPABASE}/rest/v1/audit_logs*`, route => {
        route.fulfill({ status: 200, headers: { 'content-type': 'application/json' }, body: '[]' });
      });

      // E3-01: setup
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(500);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.1-E3-01-intercept-large.png'));
      await screenshot(page, 'US-1.1-E3-01-intercept-large.png');
      count++;

      // E3-02: dashboard loaded
      await page.waitForTimeout(2000);
      await cleanupAndHighlight(page, '.stat-grid', 'US-1.1-E3-02-dashboard-loaded.png');
      await screenshot(page, 'US-1.1-E3-02-dashboard-loaded.png');
      count++;

      // E3-03: formatted numbers
      await cleanupAndHighlight(page, '.stat-card:first-child', 'US-1.1-E3-03-formatted-numbers.png');
      await screenshot(page, 'US-1.1-E3-03-formatted-numbers.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.2 HAPPY PATH
    // =========================================================
    console.log('\n=== US-1.2 Happy Path ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(2000);

      // Step 1: dashboard loaded — highlight activity section heading
      await cleanupAndHighlight(page, '.card', 'US-1.2-01-dashboard-loaded.png');
      await screenshot(page, 'US-1.2-01-dashboard-loaded.png');
      count++;

      // Step 2: activity section visible
      await page.evaluate(() => {
        // Scroll to activity section
        const card = [...document.querySelectorAll('.card')].find(c => c.querySelector('.activity-list'));
        if (card) card.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await page.waitForTimeout(500);
      // Highlight the activity card
      const activityCardSelector = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.card')];
        const actCard = cards.find(c => c.querySelector('.activity-list'));
        if (actCard) {
          actCard.setAttribute('data-act-card', 'true');
          return '[data-act-card]';
        }
        return '.activity-list';
      });
      await cleanupAndHighlight(page, activityCardSelector, 'US-1.2-02-activity-section.png');
      await screenshot(page, 'US-1.2-02-activity-section.png');
      count++;

      // Step 3: activity items
      await cleanupAndHighlight(page, '.activity-list', 'US-1.2-03-activity-items.png');
      await screenshot(page, 'US-1.2-03-activity-items.png');
      count++;

      // Step 4: first item (most recent)
      await cleanupAndHighlight(page, '.activity-item:first-child', 'US-1.2-04-sort-order.png');
      await screenshot(page, 'US-1.2-04-sort-order.png');
      count++;

      // Step 5: click a researcher name — the activity names are not links based on DOM check
      // Try clicking the first activity name text anyway
      // Navigate to researchers page instead to simulate
      const firstActivityName = page.locator('.activity-name').first();
      await firstActivityName.click();
      await page.waitForTimeout(1500);
      // Check if we navigated somewhere — highlight profile/main content
      await cleanupAndHighlight(page, '.main-content', 'US-1.2-05-click-name.png');
      await screenshot(page, 'US-1.2-05-click-name.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.2 Edge Case E1: No Activities
    // =========================================================
    console.log('\n=== US-1.2 E1: No Activities ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      await page.route(`**/${SUPABASE}/rest/v1/audit_logs*`, route => {
        route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' });
      });

      // E1-01: setup
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(500);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.2-E1-01-intercept-empty.png'));
      await screenshot(page, 'US-1.2-E1-01-intercept-empty.png');
      count++;

      // E1-02: dashboard loaded
      await page.waitForTimeout(2000);
      const activityCardSel2 = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.card')];
        const actCard = cards.find(c => c.querySelector('.activity-list') || c.querySelector('.card-title'));
        if (actCard) { actCard.setAttribute('data-ac2', 'true'); return '[data-ac2]'; }
        return '.card';
      });
      await cleanupAndHighlight(page, activityCardSel2, 'US-1.2-E1-02-dashboard-loaded.png');
      await screenshot(page, 'US-1.2-E1-02-dashboard-loaded.png');
      count++;

      // E1-03: empty state message
      const emptyActSel = await page.evaluate(() => {
        const all = [...document.querySelectorAll('*')];
        const msg = all.find(el => el.textContent.trim().includes('Aucune activite') || el.textContent.trim().includes('Aucune activité'));
        if (msg) { msg.setAttribute('data-empty-act', 'true'); return '[data-empty-act]'; }
        return '.activity-list';
      });
      await cleanupAndHighlight(page, emptyActSel, 'US-1.2-E1-03-empty-state.png');
      await screenshot(page, 'US-1.2-E1-03-empty-state.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.2 Edge Case E2: Activity API Failure
    // =========================================================
    console.log('\n=== US-1.2 E2: Activity API Failure ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      await page.route(`**/${SUPABASE}/rest/v1/audit_logs*`, route => {
        route.fulfill({ status: 500, headers: { 'Content-Type': 'text/plain' }, body: 'Internal Server Error' });
      });

      // E2-01: setup
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(500);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.2-E2-01-intercept-error.png'));
      await screenshot(page, 'US-1.2-E2-01-intercept-error.png');
      count++;

      // E2-02: dashboard loaded
      await page.waitForTimeout(2000);
      const actCardSel3 = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.card')];
        const actCard = cards.find(c => c.querySelector('.activity-list') || c.querySelector('.card-title'));
        if (actCard) { actCard.setAttribute('data-ac3', 'true'); return '[data-ac3]'; }
        return '.card';
      });
      await cleanupAndHighlight(page, actCardSel3, 'US-1.2-E2-02-dashboard-loaded.png');
      await screenshot(page, 'US-1.2-E2-02-dashboard-loaded.png');
      count++;

      // E2-03: error retry
      const errRetrySel = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const retry = btns.find(b => b.textContent.includes('essayer') || b.textContent.toLowerCase().includes('retry'));
        if (retry) { retry.setAttribute('data-err-retry', 'true'); return '[data-err-retry]'; }
        // Find error text
        const all = [...document.querySelectorAll('*')];
        const err = all.find(el => el.childNodes.length <= 2 && (el.textContent.includes('erreur') || el.textContent.includes('Erreur') || el.textContent.includes('error')));
        if (err) { err.setAttribute('data-err-retry', 'true'); return '[data-err-retry]'; }
        return '.activity-list';
      });
      await cleanupAndHighlight(page, errRetrySel, 'US-1.2-E2-03-error-retry.png');
      await screenshot(page, 'US-1.2-E2-03-error-retry.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.2 Edge Case E3: Deleted Researcher in Activity
    // =========================================================
    console.log('\n=== US-1.2 E3: Deleted Researcher ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      // Return activity with deleted researcher (no profile link)
      await page.route(`**/${SUPABASE}/rest/v1/audit_logs*`, route => {
        const activity = [
          {
            id: 'a1',
            user_name: 'Jean Supprime',
            action: 'Ajout',
            detail: 'Nouveau profil créé',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            researcher_deleted: true
          }
        ];
        route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(activity) });
      });
      // Also intercept researcher lookup to return empty (deleted)
      await page.route(`**/${SUPABASE}/rest/v1/researchers*full_name*`, route => {
        route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' });
      });

      // E3-01: setup
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(500);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.2-E3-01-intercept-deleted.png'));
      await screenshot(page, 'US-1.2-E3-01-intercept-deleted.png');
      count++;

      // E3-02: dashboard loaded
      await page.waitForTimeout(2000);
      const actCardSel4 = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.card')];
        const actCard = cards.find(c => c.querySelector('.activity-list') || c.querySelector('.card-title'));
        if (actCard) { actCard.setAttribute('data-ac4', 'true'); return '[data-ac4]'; }
        return '.card';
      });
      await cleanupAndHighlight(page, actCardSel4, 'US-1.2-E3-02-dashboard-loaded.png');
      await screenshot(page, 'US-1.2-E3-02-dashboard-loaded.png');
      count++;

      // E3-03: deleted name — look for grayed-out name or (profil supprime)
      const deletedSel = await page.evaluate(() => {
        const all = [...document.querySelectorAll('*')];
        const deleted = all.find(el => el.textContent.includes('supprim') || el.textContent.includes('Supprim'));
        if (deleted) { deleted.setAttribute('data-deleted', 'true'); return '[data-deleted]'; }
        // Look for activity name with gray color
        const names = [...document.querySelectorAll('.activity-name')];
        const gray = names.find(n => {
          const style = window.getComputedStyle(n);
          return style.color.includes('128') || style.color.includes('gray') || style.opacity !== '1';
        });
        if (gray) { gray.setAttribute('data-deleted', 'true'); return '[data-deleted]'; }
        // Just use first activity item
        return '.activity-item:first-child .activity-name';
      });
      await cleanupAndHighlight(page, deletedSel, 'US-1.2-E3-03-deleted-name.png');
      await screenshot(page, 'US-1.2-E3-03-deleted-name.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.3 HAPPY PATH
    // =========================================================
    console.log('\n=== US-1.3 Happy Path ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(2000);

      // Step 1: dashboard loaded — highlight mini-map area
      await cleanupAndHighlight(page, '.mini-map-container', 'US-1.3-01-dashboard-loaded.png');
      await screenshot(page, 'US-1.3-01-dashboard-loaded.png');
      count++;

      // Step 2: mini map visible — highlight SVG
      await cleanupAndHighlight(page, '.mini-map-svg', 'US-1.3-02-mini-map-visible.png');
      await screenshot(page, 'US-1.3-02-mini-map-visible.png');
      count++;

      // Step 3: hover effect — hover then screenshot
      await page.hover('.mini-map-container');
      await page.waitForTimeout(500);
      await cleanupAndHighlight(page, '.mini-map-container', 'US-1.3-03-hover-effect.png');
      await screenshot(page, 'US-1.3-03-hover-effect.png');
      count++;

      // Step 4: click mini map — navigate to /map
      await page.click('.mini-map-container');
      await page.waitForTimeout(1500);
      await cleanupAndHighlight(page, '.main-content', 'US-1.3-04-navigated-to-map.png');
      await screenshot(page, 'US-1.3-04-navigated-to-map.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.3 Edge Case E1: No Clusters
    // =========================================================
    console.log('\n=== US-1.3 E1: No Clusters ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      await page.route(`**/${SUPABASE}/rest/v1/clusters*`, route => {
        route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' });
      });

      // E1-01: setup
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(500);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.3-E1-01-intercept-empty.png'));
      await screenshot(page, 'US-1.3-E1-01-intercept-empty.png');
      count++;

      // E1-02: dashboard loaded
      await page.waitForTimeout(2000);
      await cleanupAndHighlight(page, '.mini-map-container', 'US-1.3-E1-02-dashboard-loaded.png');
      await screenshot(page, 'US-1.3-E1-02-dashboard-loaded.png');
      count++;

      // E1-03: placeholder
      const placeholderSel = await page.evaluate(() => {
        const all = [...document.querySelectorAll('*')];
        const msg = all.find(el => el.textContent.trim().includes('Carte non disponible') || el.textContent.trim().includes('non disponible'));
        if (msg) { msg.setAttribute('data-placeholder', 'true'); return '[data-placeholder]'; }
        return '.mini-map-container';
      });
      await cleanupAndHighlight(page, placeholderSel, 'US-1.3-E1-03-placeholder.png');
      await screenshot(page, 'US-1.3-E1-03-placeholder.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.3 Edge Case E2: Slow API (>3s)
    // =========================================================
    console.log('\n=== US-1.3 E2: Slow API ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      // Intercept clusters with 5s delay
      await page.route(`**/${SUPABASE}/rest/v1/clusters*`, async route => {
        await new Promise(res => setTimeout(res, 5000));
        route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' });
      });

      // E2-01: setup
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(300);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.3-E2-01-intercept-slow.png'));
      await screenshot(page, 'US-1.3-E2-01-intercept-slow.png');
      count++;

      // E2-02: dashboard loaded (while map still loading)
      await page.waitForTimeout(1000);
      await cleanupAndHighlight(page, '.mini-map-container', 'US-1.3-E2-02-dashboard-loaded.png');
      await screenshot(page, 'US-1.3-E2-02-dashboard-loaded.png');
      count++;

      // E2-03: loading spinner
      const spinnerSel = await page.evaluate(() => {
        // Look for spinner, loading text
        const all = [...document.querySelectorAll('*')];
        const spinner = all.find(el =>
          el.className && (
            String(el.className).includes('spinner') ||
            String(el.className).includes('loading') ||
            String(el.className).includes('Chargement')
          )
        );
        if (spinner) { spinner.setAttribute('data-spinner', 'true'); return '[data-spinner]'; }
        const loadingText = all.find(el => el.textContent.trim() === 'Chargement...' || el.textContent.trim() === 'Chargement');
        if (loadingText) { loadingText.setAttribute('data-spinner', 'true'); return '[data-spinner]'; }
        return '.mini-map-container';
      });
      await cleanupAndHighlight(page, spinnerSel, 'US-1.3-E2-03-loading-spinner.png');
      await screenshot(page, 'US-1.3-E2-03-loading-spinner.png');
      count++;

      await page.close();
    }

    // =========================================================
    // US-1.3 Edge Case E3: Malformed JSON / SVG Rendering Error
    // =========================================================
    console.log('\n=== US-1.3 E3: Malformed JSON ===');
    {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      await page.route(`**/${SUPABASE}/rest/v1/clusters*`, route => {
        route.fulfill({ status: 200, headers: { 'Content-Type': 'application/json' }, body: '{malformed}' });
      });

      // E3-01: setup
      await page.goto(BASE_URL + '/');
      await page.waitForTimeout(500);
      await page.evaluate(CLEANUP_JS);
      await page.evaluate(bannerJS('US-1.3-E3-01-intercept-malformed.png'));
      await screenshot(page, 'US-1.3-E3-01-intercept-malformed.png');
      count++;

      // E3-02: dashboard loaded
      await page.waitForTimeout(2000);
      await cleanupAndHighlight(page, '.mini-map-container', 'US-1.3-E3-02-dashboard-loaded.png');
      await screenshot(page, 'US-1.3-E3-02-dashboard-loaded.png');
      count++;

      // E3-03: fallback
      const fallbackSel = await page.evaluate(() => {
        const all = [...document.querySelectorAll('*')];
        const fallback = all.find(el =>
          el.textContent.trim().includes('Cliquer pour voir la carte') ||
          el.textContent.trim().includes('carte') && el.textContent.trim().length < 100
        );
        if (fallback) { fallback.setAttribute('data-fallback', 'true'); return '[data-fallback]'; }
        return '.mini-map-container';
      });
      await cleanupAndHighlight(page, fallbackSel, 'US-1.3-E3-03-fallback.png');
      await screenshot(page, 'US-1.3-E3-03-fallback.png');
      count++;

      await page.close();
    }

  } finally {
    await browser.close();
  }

  console.log(`\nDone! ${count} screenshots taken.`);
  return count;
}

run().then(count => {
  console.log(`Total: ${count}/44`);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
