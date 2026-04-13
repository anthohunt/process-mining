import { test, expect } from '@playwright/test'

// US-1.1 — Stat Grid: displays live counts and navigates on click
// Note: Use full Supabase domain in route patterns — wildcard **/rest/v1/** does not match cross-origin URLs.
// All route.fulfill() calls must include access-control-expose-headers: content-range for CORS compliance.
// supabase-js reads count from Content-Range header on HEAD requests.

const SUPABASE = 'https://deylsvqlogdooxqumhdz.supabase.co'
const CORS_HEADERS = {
  'access-control-allow-origin': 'http://localhost:5199',
  'access-control-expose-headers': 'content-range, x-total-count',
  'content-type': 'application/json',
}

test.describe('US-1.1 — Stat Grid', () => {
  test('happy path: shows 4 stat cards with correct labels', async ({ page }) => {
    await page.goto('/')
    const region = page.getByRole('region', { name: 'Statistiques globales' })
    await expect(region).toBeVisible()
    await expect(region.getByRole('button', { name: /Chercheurs/ })).toBeVisible()
    await expect(region.getByRole('button', { name: /Themes/ })).toBeVisible()
    await expect(region.getByRole('button', { name: /Clusters/ })).toBeVisible()
    await expect(region.getByRole('button', { name: /Publications/ })).toBeVisible()
  })

  test('happy path: click Chercheurs navigates to /researchers', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Chercheurs/ }).click()
    await expect(page).toHaveURL('/researchers')
  })

  test('happy path: click Themes navigates to /themes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Themes/ }).click()
    await expect(page).toHaveURL('/themes')
  })

  test('E1: API unreachable — stat cards show error state with retry button', async ({ page }) => {
    // Abort all Supabase REST requests
    await page.route(`${SUPABASE}/rest/v1/researchers*`, route => route.abort())
    await page.route(`${SUPABASE}/rest/v1/clusters*`, route => route.abort())
    await page.route(`${SUPABASE}/rest/v1/publications*`, route => route.abort())
    await page.goto('/')
    // React Query retry:2 exhausts in ~8s
    await page.waitForTimeout(8000)
    // StatGrid shows error state
    await expect(page.getByText(/impossible de charger/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Reessayer/i })).toBeVisible()
  })

  test('E2: empty database — all stat cards show 0', async ({ page }) => {
    // HEAD requests with content-range 0-0/0 → count = 0
    await page.route(`${SUPABASE}/rest/v1/researchers*`, route => {
      if (route.request().method() === 'HEAD') {
        route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-0/0' }, body: '' })
      } else {
        route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
      }
    })
    await page.route(`${SUPABASE}/rest/v1/clusters*`, route => {
      if (route.request().method() === 'HEAD') {
        route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-0/0' }, body: '' })
      } else {
        route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
      }
    })
    await page.route(`${SUPABASE}/rest/v1/publications*`, route => {
      if (route.request().method() === 'HEAD') {
        route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-0/0' }, body: '' })
      } else {
        route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
      }
    })
    await page.goto('/')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('button', { name: /0.*Chercheurs/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /0.*Clusters/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /0.*Publications/i })).toBeVisible()
  })

  test('E3: large numbers formatted with fr-FR thousands separator', async ({ page }) => {
    // Intercept with large counts — content-range: 0-24/100000 → count = 100000
    // IMPORTANT: access-control-expose-headers must include content-range or Chromium strips it (CORS)
    await page.route(`${SUPABASE}/rest/v1/researchers*`, route => {
      if (route.request().method() === 'HEAD') {
        route.fulfill({
          status: 200,
          headers: { ...CORS_HEADERS, 'content-range': '0-24/100000' },
          body: '',
        })
      } else {
        route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify(
            Array.from({ length: 5 }, (_, i) => ({
              id: `r${i}`, full_name: `Researcher ${i}`, status: 'approved',
              keywords: ['process mining', 'bpm']
            }))
          ),
        })
      }
    })
    await page.route(`${SUPABASE}/rest/v1/publications*`, route => {
      if (route.request().method() === 'HEAD') {
        route.fulfill({
          status: 200,
          headers: { ...CORS_HEADERS, 'content-range': '0-24/999999' },
          body: '',
        })
      } else {
        route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
      }
    })
    await page.goto('/')
    await page.waitForTimeout(1000)
    // fr-FR formats 100000 as "100 000" (non-breaking space U+00A0)
    const chercheurs = await page.getByRole('button', { name: /Chercheurs/ }).textContent()
    expect(chercheurs).toMatch(/100/)
    // Verify non-breaking space separator is present
    const val = await page.locator('[aria-label*="Chercheurs"] .stat-value, button:has-text("Chercheurs") > *').first().textContent()
    if (val) expect(val).toContain('\u00a0') // non-breaking space
  })
})
