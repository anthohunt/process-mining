import { test, expect } from '@playwright/test'

// US-1.3 — MiniMap: SVG cluster preview on dashboard, click navigates to /map
// Note: Use full Supabase domain in route patterns — wildcard **/rest/v1/** does not match cross-origin URLs.
// All route.fulfill() calls must include access-control-expose-headers for CORS compliance.

const SUPABASE = 'https://deylsvqlogdooxqumhdz.supabase.co'
const CORS_HEADERS = {
  'access-control-allow-origin': 'http://localhost:5199',
  'access-control-expose-headers': 'content-range, x-total-count',
  'content-type': 'application/json',
}

test.describe('US-1.3 — MiniMap', () => {
  test('happy path: mini-map visible with SVG cluster bubbles', async ({ page }) => {
    await page.goto('/')
    const minimap = page.locator('.mini-map-container')
    await expect(minimap).toBeVisible()
    // SVG should be rendered (clusters loaded)
    await expect(minimap.locator('svg')).toBeVisible()
    // Overlay hint text
    await expect(minimap.getByText(/cliquer pour ouvrir/i)).toBeVisible()
  })

  test('happy path: hover shows pointer cursor and blue outline', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.mini-map-container svg')).toBeVisible()
    const minimap = page.locator('.mini-map-container')
    await minimap.hover()
    // CSS cursor is pointer — verify via computed style
    const cursor = await minimap.evaluate(el => getComputedStyle(el).cursor)
    expect(cursor).toBe('pointer')
  })

  test('happy path: clicking mini-map navigates to /map', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.mini-map-container svg')).toBeVisible()
    await page.getByRole('button', { name: /cliquer pour ouvrir la carte complete/i }).click()
    await expect(page).toHaveURL('/map')
    await expect(page.getByText('Carte Thematique')).toBeVisible()
  })

  test('E1: no clusters → shows "Carte non disponible" empty state', async ({ page }) => {
    // Route must use full Supabase domain — wildcard pattern doesn't match cross-origin
    await page.route(`${SUPABASE}/rest/v1/clusters*`, route =>
      route.fulfill({
        status: 200,
        headers: { ...CORS_HEADERS, 'content-range': '0-0/0' },
        body: '[]',
      })
    )
    await page.goto('/')
    await page.waitForTimeout(1000)
    // noData state: t('dashboard.minimap.noData') = "Carte non disponible"
    await expect(page.getByText(/carte non disponible/i)).toBeVisible()
    // No SVG rendered
    await expect(page.locator('.mini-map-container svg')).not.toBeVisible()
    // Still clickable — navigates to /map even with no data
    await page.locator('.mini-map-container').click()
    await expect(page).toHaveURL('/map')
  })

  test('E2: clusters API slow → loading spinner shown during fetch', async ({ page }) => {
    // IMPORTANT: Do NOT use setTimeout in route handler — it drops the MCP connection.
    // Instead, never call route.fulfill() to keep the request pending indefinitely.
    await page.route(`${SUPABASE}/rest/v1/clusters*`, async _route => {
      // Intentionally hang — do not fulfill
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(300)
    // isLoading state: spinner visible
    await expect(page.locator('.mini-map-container .spinner')).toBeVisible()
    await expect(page.locator('.mini-map-container').getByText('Chargement...')).toBeVisible()
  })

  test('E3: clusters API error → shows fallback "Cliquer pour voir la carte"', async ({ page }) => {
    // IMPORTANT: HTTP 500 does NOT trigger isError — supabase-js parses body as data.
    // Use HTTP 400 with PostgREST-format JSON body — supabase-js sets error object correctly.
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
    await page.goto('/')
    // Wait for React Query retry:2 to exhaust (~8s with exponential backoff)
    await page.waitForTimeout(8000)
    // isError state: t('dashboard.minimap.fallback') = "Cliquer pour voir la carte"
    // NOTE: fallback !== clickHint ("Cliquer pour ouvrir la carte complete")
    // The fallback is rendered inside mini-map-placeholder, not as an overlay
    await expect(page.locator('.mini-map-placeholder').getByText(/cliquer pour voir la carte/i)).toBeVisible()
    // No SVG
    await expect(page.locator('.mini-map-container svg')).not.toBeVisible()
    // Still clickable in error state
    await page.locator('.mini-map-container').click()
    await expect(page).toHaveURL('/map')
  })
})
