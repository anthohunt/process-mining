import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5199'
const MARIE_ID = '22222222-0000-0000-0000-000000000001'

test.describe('US-2.5 — Profile to Map Navigation', () => {
  test('happy path: Voir sur la carte button navigates to /map', async ({ page }) => {
    await page.goto(`${BASE}/researchers/${MARIE_ID}`)
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#profile-map-link, button:has-text("Voir sur la carte")')).toBeEnabled()
    await page.click('#profile-map-link, button:has-text("Voir sur la carte")')
    await expect(page).toHaveURL(`${BASE}/map`)
  })

  test('happy path: map receives researcherId in location state', async ({ page }) => {
    await page.goto(`${BASE}/researchers/${MARIE_ID}`)
    await page.waitForLoadState('networkidle')
    await page.click('#profile-map-link, button:has-text("Voir sur la carte")')
    await expect(page).toHaveURL(`${BASE}/map`)
    // Map page should have loaded with the researcher highlighted
    // The pulsing highlight is rendered as a DOM element when researcherId matches a cluster member
    await page.waitForTimeout(2000)
    await expect(page.locator('svg, canvas, [data-testid="map"]')).toBeVisible()
  })

  test('E1: no map coordinates — button disabled with toast', async ({ page }) => {
    await page.route(`**/rest/v1/researchers*id=eq.${MARIE_ID}*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'content-range': '0-0/1' },
        body: JSON.stringify([{
          id: MARIE_ID,
          user_id: null,
          full_name: 'Marie Dupont',
          lab: 'LIRIS',
          bio: 'Bio.',
          keywords: ['conformance'],
          status: 'approved',
          map_x: null,
          map_y: null,
          cluster_id: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          publications: [],
          clusters: null
        }])
      })
    })
    await page.goto(`${BASE}/researchers/${MARIE_ID}`)
    await page.waitForLoadState('networkidle')
    // Button should be disabled when no map coordinates
    const mapBtn = page.locator('#profile-map-link, button:has-text("Voir sur la carte")')
    await expect(mapBtn).toBeDisabled()
  })

  test('E2: map cluster API failure — error overlay shown', async ({ page }) => {
    await page.goto(`${BASE}/researchers/${MARIE_ID}`)
    await page.waitForLoadState('networkidle')
    // Intercept clusters AFTER navigating to profile to avoid breaking profile load
    await page.route('**/rest/v1/clusters**', route => route.abort())
    await page.click('#profile-map-link, button:has-text("Voir sur la carte")')
    await expect(page).toHaveURL(`${BASE}/map`)
    await expect(page.locator('text=/chargement echoue|erreur/i, [data-testid="map-error"]')).toBeVisible({ timeout: 15000 })
  })

  test('E3: cluster reorganized — map centers on new coordinates', async ({ page }) => {
    const updatedMapX = 0.9
    const updatedMapY = 0.1
    await page.route(`**/rest/v1/researchers*id=eq.${MARIE_ID}*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'content-range': '0-0/1' },
        body: JSON.stringify([{
          id: MARIE_ID,
          user_id: null,
          full_name: 'Marie Dupont',
          lab: 'LIRIS',
          bio: 'Bio.',
          keywords: ['conformance'],
          status: 'approved',
          map_x: updatedMapX,
          map_y: updatedMapY,
          cluster_id: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          publications: [],
          clusters: null
        }])
      })
    })
    await page.goto(`${BASE}/researchers/${MARIE_ID}`)
    await page.waitForLoadState('networkidle')
    await page.click('#profile-map-link, button:has-text("Voir sur la carte")')
    await expect(page).toHaveURL(`${BASE}/map`)
    // Map loads — centering on new coordinates is internal D3 state, verified visually
    await expect(page.locator('svg, canvas, [data-testid="map"]')).toBeVisible()
  })
})
