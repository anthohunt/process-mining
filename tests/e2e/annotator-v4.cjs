/**
 * M1 Annotated Screenshot Generator v4
 * NO banners — red highlight ONLY.
 * Retakes all 44 screenshots for the M1 use case delivery.
 */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:5199'
const SUPABASE = 'https://deylsvqlogdooxqumhdz.supabase.co'
const OUTPUT_DIR = path.join(__dirname, 'delivery')
const CORS_HEADERS = {
  'access-control-allow-origin': 'http://localhost:5199',
  'access-control-expose-headers': 'content-range, x-total-count',
  'content-type': 'application/json',
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

async function cleanup(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-annotated]').forEach(el => {
      el.style.outline = ''
      el.style.outlineOffset = ''
      el.style.boxShadow = ''
      el.removeAttribute('data-annotated')
    })
    document.querySelectorAll('[data-step-banner]').forEach(el => el.remove())
    // Also remove any old banners from v3
    const b = document.getElementById('__annotate_banner__')
    if (b) b.remove()
  })
}

async function highlight(page, selector) {
  if (!selector) return
  // Try each comma-separated selector in sequence (querySelector doesn't support Playwright pseudo-selectors)
  const selectors = selector.split(',').map(s => s.trim()).filter(Boolean)
  await page.evaluate((sels) => {
    for (const sel of sels) {
      try {
        const el = document.querySelector(sel)
        if (el) {
          el.style.outline = '3px solid #dc3545'
          el.style.outlineOffset = '4px'
          el.style.boxShadow = '0 0 0 6px rgba(220, 53, 69, 0.25)'
          el.setAttribute('data-annotated', 'true')
          return
        }
      } catch (_) {
        // skip invalid selector
      }
    }
  }, selectors)
}

async function shot(page, filename, selector) {
  await cleanup(page)
  if (selector) await highlight(page, selector)
  await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: false })
  console.log(`  ✓ ${filename}`)
}

async function clearRoutes(page) {
  await page.unroute('**/*')
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()

  // ─── US-1.1 Happy Path ───────────────────────────────────────────────────

  console.log('\nUS-1.1 Happy Path')

  // Step 1: Dashboard loaded — highlight stat-grid
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1500)
  await shot(page, 'US-1.1-01-dashboard-loaded.png', '.stat-grid')

  // Step 2: Stat cards visible — highlight stat-grid (the 4 cards)
  await shot(page, 'US-1.1-02-stat-cards-visible.png', '.stat-grid')

  // Step 3: Stat values — highlight first stat-card
  await shot(page, 'US-1.1-03-stat-values.png', '.stat-card')

  // Step 4: Click Chercheurs card — navigate, screenshot on researchers page
  await page.click('[aria-label="Statistiques globales"] button:first-child')
  await page.waitForTimeout(800)
  // Highlight researcher table/content on /researchers page
  await shot(page, 'US-1.1-04-click-chercheurs-card.png', 'main, .researchers-list, table, [class*="researcher"]')

  // Step 5: Back to dashboard — highlight stat-grid (proves we're back with data)
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  await shot(page, 'US-1.1-05-back-to-dashboard.png', '.stat-grid')

  // Step 6: Click Themes card
  await page.locator('.stat-card', { hasText: 'Themes' }).click()
  await page.waitForTimeout(800)
  // Highlight themes content on /themes page
  await shot(page, 'US-1.1-06-click-themes-card.png', 'main, .themes-list, table, [class*="theme"]')

  // ─── US-1.1 E1: API Unreachable ─────────────────────────────────────────

  console.log('\nUS-1.1 E1: API Unreachable')
  await clearRoutes(page)

  await page.route(`${SUPABASE}/rest/v1/researchers*`, route => route.abort())
  await page.route(`${SUPABASE}/rest/v1/clusters*`, route => route.abort())
  await page.route(`${SUPABASE}/rest/v1/publications*`, route => route.abort())
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(500)

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.1-E1-01-intercept-set.png', null)

  // Step 2: dashboard loading — highlight stat-grid area
  await shot(page, 'US-1.1-E1-02-dashboard-loading.png', '.stat-grid')

  // Step 3: wait for error state — highlight error message or "0" stat values
  await page.waitForTimeout(8500)
  await shot(page, 'US-1.1-E1-03-error-state.png', '.stat-grid, [class*="error"], [class*="Error"]')

  // Step 4: retry button
  await shot(page, 'US-1.1-E1-04-retry-visible.png', 'button[class*="retry"], button[class*="Retry"], .retry-button, .stat-grid, button')

  // ─── US-1.1 E2: Empty Database ──────────────────────────────────────────

  console.log('\nUS-1.1 E2: Empty Database')
  await clearRoutes(page)

  const zeroFulfill = (route) => {
    if (route.request().method() === 'HEAD') {
      route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-0/0' }, body: '' })
    } else {
      route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
    }
  }
  await page.route(`${SUPABASE}/rest/v1/researchers*`, zeroFulfill)
  await page.route(`${SUPABASE}/rest/v1/clusters*`, zeroFulfill)
  await page.route(`${SUPABASE}/rest/v1/publications*`, zeroFulfill)

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.1-E2-01-intercept-zeros.png', null)

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  // highlight stat-grid showing zeros
  await shot(page, 'US-1.1-E2-02-dashboard-loaded.png', '.stat-grid')

  // Step 3: zero stats — highlight a stat card showing "0"
  await shot(page, 'US-1.1-E2-03-zero-stats.png', '.stat-card')

  // Step 4: "Aucune donnee disponible" text
  await shot(page, 'US-1.1-E2-04-empty-message.png', '.stat-grid')

  // ─── US-1.1 E3: Large Numbers ───────────────────────────────────────────

  console.log('\nUS-1.1 E3: Large Numbers')
  await clearRoutes(page)

  await page.route(`${SUPABASE}/rest/v1/researchers*`, route => {
    if (route.request().method() === 'HEAD') {
      route.fulfill({
        status: 206,
        headers: { ...CORS_HEADERS, 'content-range': '0-24/100000', 'access-control-expose-headers': 'Content-Range' },
        body: ''
      })
    } else {
      route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(Array.from({ length: 5 }, (_, i) => ({
          id: `r${i}`, full_name: `Researcher ${i}`, status: 'approved', keywords: []
        })))
      })
    }
  })
  await page.route(`${SUPABASE}/rest/v1/publications*`, route => {
    if (route.request().method() === 'HEAD') {
      route.fulfill({
        status: 206,
        headers: { ...CORS_HEADERS, 'content-range': '0-24/999999', 'access-control-expose-headers': 'Content-Range' },
        body: ''
      })
    } else {
      route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
    }
  })

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.1-E3-01-intercept-large.png', null)

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  await shot(page, 'US-1.1-E3-02-dashboard-loaded.png', '.stat-grid')

  // Step 3: formatted numbers — highlight stat card showing "100 000" or "999 999"
  await shot(page, 'US-1.1-E3-03-formatted-numbers.png', '.stat-card')

  // ─── US-1.2 Happy Path ───────────────────────────────────────────────────

  console.log('\nUS-1.2 Happy Path')
  await clearRoutes(page)
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1500)

  // Step 1: activity section/card
  await shot(page, 'US-1.2-01-dashboard-loaded.png', '[class*="activity"], [class*="recent"], .activity-feed, [aria-label*="activit"]')

  // Step 2: "Activite Recente" heading + card
  await page.evaluate(() => {
    const el = document.querySelector('[aria-label="Activites recentes"], .activity-feed, [class*="activity"]')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.2-02-activity-section.png', '[aria-label="Activites recentes"], .activity-feed, [class*="recent-activity"], [class*="activity"]')

  // Step 3: list of .activity-item elements
  await shot(page, 'US-1.2-03-activity-items.png', '.activity-item, [class*="activity-item"], [role="listitem"]')

  // Step 4: first .activity-item (most recent)
  await shot(page, 'US-1.2-04-sort-order.png', '.activity-item:first-child, [role="listitem"]:first-child, [class*="activity-item"]:first-child')

  // Step 5: click researcher name, show researcher profile
  try {
    const activityList = page.getByRole('list', { name: /activit/i })
    const firstBtn = activityList.getByRole('button').first()
    await firstBtn.click()
  } catch {
    // Fallback: click first activity item button
    const btn = page.locator('.activity-item button, [class*="activity"] button, [role="listitem"] button').first()
    await btn.click()
  }
  await page.waitForTimeout(800)
  await shot(page, 'US-1.2-05-click-name.png', 'main, .profile-name, [class*="profile"], [class*="researcher-detail"]')

  // ─── US-1.2 E1: No Activities ───────────────────────────────────────────

  console.log('\nUS-1.2 E1: No Activities')
  await clearRoutes(page)
  await page.route('**/rest/v1/audit_logs*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  )

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.2-E1-01-intercept-empty.png', null)

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  // highlight activity section
  await shot(page, 'US-1.2-E1-02-dashboard-loaded.png', '[aria-label="Activites recentes"], .activity-feed, [class*="activity"]')

  // Step 3: "Aucune activite recente" text
  await page.evaluate(() => {
    const candidates = [
      document.querySelector('[class*="activity"]'),
      document.querySelector('[class*="recent"]'),
    ]
    for (const el of candidates) {
      if (el) { el.scrollIntoView({ behavior: 'instant', block: 'center' }); break }
    }
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.2-E1-03-empty-state.png', '[class*="empty"], [class*="no-activity"], [class*="activity"], p')

  // ─── US-1.2 E2: Activity API 500 ────────────────────────────────────────

  console.log('\nUS-1.2 E2: Activity API Failure')
  await clearRoutes(page)
  await page.route('**/rest/v1/audit_logs*', route =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"error"}' })
  )

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.2-E2-01-intercept-error.png', null)

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(8500)
  // highlight activity section
  await shot(page, 'US-1.2-E2-02-dashboard-loaded.png', '[aria-label="Activites recentes"], .activity-feed, [class*="activity"]')

  // Step 3: error message + retry button
  await page.evaluate(() => {
    const el = document.querySelector('[class*="error"], [class*="retry"], button')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.2-E2-03-error-retry.png', '[class*="error"], [class*="retry"], button')

  // ─── US-1.2 E3: Deleted Researcher ──────────────────────────────────────

  console.log('\nUS-1.2 E3: Deleted Researcher')
  await clearRoutes(page)
  await page.route('**/rest/v1/audit_logs*', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        id: 'test-deleted-01',
        user_name: null,
        action: 'Suppression',
        detail: 'Compte supprime',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }])
    })
  )

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.2-E3-01-intercept-deleted.png', null)

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  // highlight activity section
  await shot(page, 'US-1.2-E3-02-dashboard-loaded.png', '[aria-label="Activites recentes"], .activity-feed, [class*="activity"]')

  // Step 3: affected activity item name (grayed out deleted researcher)
  await page.evaluate(() => {
    const el = document.querySelector('.activity-name.deleted, [class*="deleted"], [class*="unknown"], [class*="activity"]')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.2-E3-03-deleted-name.png', '.activity-name.deleted, [class*="deleted"], [class*="unknown"], .activity-item')

  // ─── US-1.3 Happy Path ───────────────────────────────────────────────────

  console.log('\nUS-1.3 Happy Path')
  await clearRoutes(page)
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1500)

  // Step 1: mini-map area / "Carte Thematique" section
  await shot(page, 'US-1.3-01-dashboard-loaded.png', '.mini-map-container, [class*="mini-map"], [class*="thematic-map"]')

  // Step 2: SVG content inside mini-map
  await page.evaluate(() => {
    const el = document.querySelector('.mini-map-container, [class*="mini-map"]')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(400)
  await shot(page, 'US-1.3-02-mini-map-visible.png', '.mini-map-container svg, .mini-map-container, [class*="mini-map"]')

  // Step 3: hover effect — use hover first then highlight container
  await page.hover('.mini-map-container').catch(() => {})
  await page.waitForTimeout(300)
  await shot(page, 'US-1.3-03-hover-effect.png', '.mini-map-container, [class*="mini-map"]')

  // Step 4: click mini-map, navigate to /map
  try {
    await page.getByRole('button', { name: /cliquer pour ouvrir la carte complete/i }).click()
  } catch {
    await page.click('.mini-map-container').catch(() => {})
  }
  await page.waitForTimeout(800)
  await shot(page, 'US-1.3-04-navigated-to-map.png', 'main, [class*="map"], svg')

  // ─── US-1.3 E1: No Clusters ─────────────────────────────────────────────

  console.log('\nUS-1.3 E1: No Clusters')
  await clearRoutes(page)
  await page.route(`${SUPABASE}/rest/v1/clusters*`, route =>
    route.fulfill({
      status: 200,
      headers: { ...CORS_HEADERS, 'content-range': '0-0/0' },
      body: '[]',
    })
  )

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.3-E1-01-intercept-empty.png', null)

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  // highlight mini-map area
  await shot(page, 'US-1.3-E1-02-dashboard-loaded.png', '.mini-map-container, [class*="mini-map"]')

  // Step 3: "Carte non disponible" text
  await page.evaluate(() => {
    const el = document.querySelector('.mini-map-container, [class*="mini-map"]')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.3-E1-03-placeholder.png', '.mini-map-container, [class*="mini-map"], [class*="placeholder"]')

  // ─── US-1.3 E2: Slow API ────────────────────────────────────────────────

  console.log('\nUS-1.3 E2: Slow API')
  await clearRoutes(page)

  // Hanging route to simulate loading state
  await page.route(`${SUPABASE}/rest/v1/clusters*`, async _route => {
    // Intentionally hang — do not fulfill
  })

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.3-E2-01-intercept-slow.png', null)

  // Step 2: navigate, capture before data loads
  await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  // highlight mini-map area
  await shot(page, 'US-1.3-E2-02-dashboard-loaded.png', '.mini-map-container, [class*="mini-map"]')

  // Step 3: loading spinner
  await page.evaluate(() => {
    const el = document.querySelector('.mini-map-container, [class*="mini-map"]')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(200)
  await shot(page, 'US-1.3-E2-03-loading-spinner.png', '.mini-map-container, [class*="mini-map"], [class*="spinner"], [class*="loading"]')

  // ─── US-1.3 E3: SVG Rendering Error ─────────────────────────────────────

  console.log('\nUS-1.3 E3: SVG Rendering Error')
  await clearRoutes(page)
  await page.route(`${SUPABASE}/rest/v1/clusters*`, route =>
    route.fulfill({
      status: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        code: 'PGRST301',
        details: null,
        hint: null,
        message: 'Simulated database error',
      }),
    })
  )

  // Step 1: no highlight (setup)
  await shot(page, 'US-1.3-E3-01-intercept-malformed.png', null)

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(8500)
  // highlight mini-map area
  await shot(page, 'US-1.3-E3-02-dashboard-loaded.png', '.mini-map-container, [class*="mini-map"]')

  // Step 3: "Cliquer pour voir la carte" fallback text
  await page.evaluate(() => {
    const el = document.querySelector('.mini-map-container, [class*="mini-map"]')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.3-E3-03-fallback.png', '.mini-map-container, [class*="mini-map"], [class*="placeholder"], [class*="fallback"]')

  await browser.close()
  console.log('\nAll 44 screenshots done.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
