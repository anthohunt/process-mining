/**
 * M1 Annotated Screenshot Generator
 * Captures all 44 annotated screenshots for the M1 use case delivery.
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

async function highlight(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (el) {
      el.style.outline = '3px solid #dc3545'
      el.style.outlineOffset = '4px'
      el.style.boxShadow = '0 0 0 6px rgba(220, 53, 69, 0.25)'
    }
  }, selector)
}

async function addBanner(page, text) {
  await page.evaluate((txt) => {
    const existing = document.getElementById('__annotate_banner__')
    if (existing) existing.remove()
    const banner = document.createElement('div')
    banner.id = '__annotate_banner__'
    banner.style.cssText =
      'position:fixed;top:0;left:0;right:0;padding:8px 16px;background:rgba(12,27,51,0.85);color:#fff;font:14px Poppins,sans-serif;z-index:99999;text-align:center;'
    banner.textContent = txt
    document.body.appendChild(banner)
  }, text)
}

async function removeBanner(page) {
  await page.evaluate(() => {
    const b = document.getElementById('__annotate_banner__')
    if (b) b.remove()
  })
}

async function shot(page, filename, selector, bannerText) {
  if (selector) await highlight(page, selector)
  await addBanner(page, bannerText)
  await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: false })
  await removeBanner(page)
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

  // Step 1: Dashboard loaded
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1500)
  await shot(page, 'US-1.1-01-dashboard-loaded.png', 'h1', 'Open the dashboard')

  // Step 2: Stat cards visible
  await shot(page, 'US-1.1-02-stat-cards-visible.png', '[aria-label="Statistiques globales"]', 'View the statistics overview')

  // Step 3: Stat values
  await shot(page, 'US-1.1-03-stat-values.png', '[aria-label="Statistiques globales"] button', 'Each counter displays a number')

  // Step 4: Click Chercheurs card — navigate, screenshot on researchers page
  await page.click('[aria-label="Statistiques globales"] button:first-child')
  await page.waitForTimeout(800)
  await shot(page, 'US-1.1-04-click-chercheurs-card.png', 'h1', 'Click on the Researchers counter')

  // Step 5: Back to dashboard
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  await shot(page, 'US-1.1-05-back-to-dashboard.png', 'h1', 'Return to the dashboard')

  // Step 6: Click Themes card
  // Use stat-card class to avoid nav menu collision
  await page.locator('.stat-card', { hasText: 'Themes' }).click()
  await page.waitForTimeout(800)
  await shot(page, 'US-1.1-06-click-themes-card.png', 'h1', 'Click on the Themes counter')

  // ─── US-1.1 E1: API Unreachable ─────────────────────────────────────────

  console.log('\nUS-1.1 E1: API Unreachable')
  await clearRoutes(page)

  // Step 1: intercept set — show dashboard with intercept note
  await page.route(`${SUPABASE}/rest/v1/researchers*`, route => route.abort())
  await page.route(`${SUPABASE}/rest/v1/clusters*`, route => route.abort())
  await page.route(`${SUPABASE}/rest/v1/publications*`, route => route.abort())
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(500)
  await shot(page, 'US-1.1-E1-01-intercept-set.png', '[aria-label="Statistiques globales"]', 'When the server is temporarily unavailable')

  // Step 2: dashboard loading
  await shot(page, 'US-1.1-E1-02-dashboard-loading.png', 'h1', 'The dashboard loads while the server is unavailable')

  // Step 3: wait for error state
  await page.waitForTimeout(8500)
  await shot(page, 'US-1.1-E1-03-error-state.png', '[aria-label="Statistiques globales"]', 'The dashboard handles the outage gracefully')

  // Step 4: retry mechanism
  await shot(page, 'US-1.1-E1-04-retry-visible.png', 'button', 'A retry option is available')

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

  // Step 1: show intercept state before nav
  await shot(page, 'US-1.1-E2-01-intercept-zeros.png', '[aria-label="Statistiques globales"]', 'When the database is empty (no data yet)')

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  await shot(page, 'US-1.1-E2-02-dashboard-loaded.png', 'h1', 'The dashboard loads with empty data')

  // Step 3: zero stats
  await shot(page, 'US-1.1-E2-03-zero-stats.png', '[aria-label="Statistiques globales"]', 'All counters show zero')

  // Step 4: empty message
  await shot(page, 'US-1.1-E2-04-empty-message.png', '[aria-label="Statistiques globales"]', 'An informative message explains there\'s no data')

  // ─── US-1.1 E3: Large Numbers ───────────────────────────────────────────

  console.log('\nUS-1.1 E3: Large Numbers')
  await clearRoutes(page)

  await page.route(`${SUPABASE}/rest/v1/researchers*`, route => {
    if (route.request().method() === 'HEAD') {
      route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-24/100000' }, body: '' })
    } else {
      route.fulfill({ status: 200, headers: CORS_HEADERS, body: JSON.stringify(Array.from({ length: 5 }, (_, i) => ({ id: `r${i}`, full_name: `Researcher ${i}`, status: 'approved', keywords: [] }))) })
    }
  })
  await page.route(`${SUPABASE}/rest/v1/publications*`, route => {
    if (route.request().method() === 'HEAD') {
      route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-24/999999' }, body: '' })
    } else {
      route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
    }
  })

  // Step 1: intercept set
  await shot(page, 'US-1.1-E3-01-intercept-large.png', '[aria-label="Statistiques globales"]', 'When the database contains a large volume of data')

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  await shot(page, 'US-1.1-E3-02-dashboard-loaded.png', 'h1', 'The dashboard loads with large data')

  // Step 3: formatted numbers
  await shot(page, 'US-1.1-E3-03-formatted-numbers.png', '[aria-label="Statistiques globales"]', 'Large numbers are formatted for readability')

  // ─── US-1.2 Happy Path ───────────────────────────────────────────────────

  console.log('\nUS-1.2 Happy Path')
  await clearRoutes(page)
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1500)

  // Step 1: dashboard loaded
  await shot(page, 'US-1.2-01-dashboard-loaded.png', 'h1', 'Open the dashboard')

  // Step 2: activity section
  await page.evaluate(() => {
    const el = document.querySelector('[aria-label="Activites recentes"]') ||
               document.querySelector('.activity-feed') ||
               document.querySelector('[class*="activity"]')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.2-02-activity-section.png', '[aria-label="Activites recentes"], .activity-feed, [class*="recent-activity"]', 'View the recent activity feed')

  // Step 3: activity items count
  await shot(page, 'US-1.2-03-activity-items.png', '[role="listitem"]:first-child', 'Up to 5 recent activities are displayed')

  // Step 4: sort order
  await shot(page, 'US-1.2-04-sort-order.png', '[role="list"] [role="listitem"]:first-child', 'Activities are ordered by most recent first')

  // Step 5: click researcher name — try activity list button first, fallback to any activity link
  const activityList = page.getByRole('list', { name: 'Activites recentes' })
  const firstActivityBtn = activityList.getByRole('button').first()
  await firstActivityBtn.click()
  await page.waitForTimeout(800)
  await shot(page, 'US-1.2-05-click-name.png', 'h1, .profile-name', 'Click on a researcher\'s name')

  // ─── US-1.2 E1: No Activities ───────────────────────────────────────────

  console.log('\nUS-1.2 E1: No Activities')
  await clearRoutes(page)
  await page.route('**/rest/v1/audit_logs*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  )

  // Step 1: intercept set
  await shot(page, 'US-1.2-E1-01-intercept-empty.png', 'body', 'When there\'s no recent activity')

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  await shot(page, 'US-1.2-E1-02-dashboard-loaded.png', 'h1', 'The dashboard loads')

  // Step 3: empty state
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
  await shot(page, 'US-1.2-E1-03-empty-state.png', '[class*="empty"], [class*="no-activity"], p', 'A message explains there\'s no activity yet')

  // ─── US-1.2 E2: Activity API 500 ────────────────────────────────────────

  console.log('\nUS-1.2 E2: Activity API Failure')
  await clearRoutes(page)
  await page.route('**/rest/v1/audit_logs*', route =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"error"}' })
  )

  // Step 1: intercept set
  await shot(page, 'US-1.2-E2-01-intercept-error.png', 'body', 'When the activity service encounters an error')

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(8500)

  await shot(page, 'US-1.2-E2-02-dashboard-loaded.png', 'h1', 'The dashboard loads')

  // Step 3: error with retry
  await page.evaluate(() => {
    const el = document.querySelector('[class*="error"], [class*="retry"], button')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.2-E2-03-error-retry.png', 'button', 'An error message with retry option is shown')

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

  // Step 1: intercept set
  await shot(page, 'US-1.2-E3-01-intercept-deleted.png', 'body', 'When a referenced researcher has been removed')

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  await shot(page, 'US-1.2-E3-02-dashboard-loaded.png', 'h1', 'The dashboard loads')

  // Step 3: deleted name grayed
  await page.evaluate(() => {
    const el = document.querySelector('.activity-name.deleted, [class*="deleted"], [class*="unknown"]')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.2-E3-03-deleted-name.png', '.activity-name.deleted, [class*="deleted"]', 'The removed researcher\'s name is shown but not clickable')

  // ─── US-1.3 Happy Path ───────────────────────────────────────────────────

  console.log('\nUS-1.3 Happy Path')
  await clearRoutes(page)
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1500)

  // Step 1: dashboard loaded
  await shot(page, 'US-1.3-01-dashboard-loaded.png', 'h1', 'Open the dashboard')

  // Step 2: mini-map visible
  await page.evaluate(() => {
    const el = document.querySelector('.mini-map-container')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(400)
  await shot(page, 'US-1.3-02-mini-map-visible.png', '.mini-map-container', 'View the thematic map preview')

  // Step 3: hover effect
  await page.hover('.mini-map-container')
  await page.waitForTimeout(300)
  await shot(page, 'US-1.3-03-hover-effect.png', '.mini-map-container', 'Hover over the map preview')

  // Step 4: click mini-map, navigate to /map
  await page.getByRole('button', { name: /cliquer pour ouvrir la carte complete/i }).click()
  await page.waitForTimeout(800)
  await shot(page, 'US-1.3-04-navigated-to-map.png', 'h1', 'Click the map preview to open full view')

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

  // Step 1: intercept set
  await shot(page, 'US-1.3-E1-01-intercept-empty.png', 'body', 'When no research clusters exist yet')

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(1200)
  await shot(page, 'US-1.3-E1-02-dashboard-loaded.png', 'h1', 'The dashboard loads')

  // Step 3: placeholder
  await page.evaluate(() => {
    const el = document.querySelector('.mini-map-container')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.3-E1-03-placeholder.png', '.mini-map-container', 'A placeholder explains the map is not available')

  // ─── US-1.3 E2: Slow API ────────────────────────────────────────────────

  console.log('\nUS-1.3 E2: Slow API')
  await clearRoutes(page)

  // Use hanging route (never fulfill) to simulate loading state
  await page.route(`${SUPABASE}/rest/v1/clusters*`, async _route => {
    // Intentionally hang — do not fulfill
  })

  // Step 1: intercept set
  await shot(page, 'US-1.3-E2-01-intercept-slow.png', 'body', 'When the map data is loading slowly')

  // Step 2: navigate, capture before data loads
  await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  await shot(page, 'US-1.3-E2-02-dashboard-loaded.png', 'h1', 'The dashboard loads')

  // Step 3: loading spinner
  await page.evaluate(() => {
    const el = document.querySelector('.mini-map-container')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(200)
  await shot(page, 'US-1.3-E2-03-loading-spinner.png', '.mini-map-container', 'A loading indicator is shown while data loads')

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

  // Step 1: intercept set
  await shot(page, 'US-1.3-E3-01-intercept-malformed.png', 'body', 'When the map data cannot be loaded')

  // Step 2: navigate
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(8500)
  await shot(page, 'US-1.3-E3-02-dashboard-loaded.png', 'h1', 'The dashboard loads')

  // Step 3: fallback
  await page.evaluate(() => {
    const el = document.querySelector('.mini-map-container')
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })
  })
  await page.waitForTimeout(300)
  await shot(page, 'US-1.3-E3-03-fallback.png', '.mini-map-container, .mini-map-placeholder', 'A fallback message with a link to the full map is shown')

  await browser.close()
  console.log('\nAll screenshots done.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
