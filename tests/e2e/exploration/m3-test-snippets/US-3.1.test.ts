import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5200'
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co'

test.describe('US-3.1 — Interactive Cluster Map', () => {
  test('Happy path: map loads with clusters, filter panel, and legend', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    // Map container is visible
    const mapContainer = page.locator('.map-container')
    await expect(mapContainer).toBeVisible()

    // SVG map is rendered
    const svg = page.locator('.map-container svg')
    await expect(svg).toBeVisible()

    // Cluster regions are present
    const clusters = page.locator('[data-cluster-region]')
    await expect(clusters).toHaveCount(4) // 4 clusters from seed data

    // Filter panel is visible with dropdowns
    const filterPanel = page.locator('.map-filter-panel')
    await expect(filterPanel).toBeVisible()
    await expect(filterPanel.locator('select')).toHaveCount(2)
    await expect(filterPanel.getByText('Appliquer')).toBeVisible()

    // Legend is visible with cluster names
    const legend = page.locator('.map-legend')
    await expect(legend).toBeVisible()
    await expect(legend.locator('.legend-item')).toHaveCount(4)

    // Page title is present
    await expect(page.locator('h1')).toHaveText('Carte Thematique')

    // Cross-nav button to themes
    await expect(page.getByText('Vue en liste')).toBeVisible()
  })

  test('Filter: selecting a theme shows only that cluster', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    // Select first theme option
    const themeSelect = page.locator('.map-filter-panel select').first()
    const options = await themeSelect.locator('option').allTextContents()
    const themeName = options[1] // First non-"Tous" option
    await themeSelect.selectOption({ index: 1 })
    await page.locator('.map-filter-panel').getByText('Appliquer').click()

    // Only 1 cluster should be visible after filtering
    const clusters = page.locator('[data-cluster-region]')
    await expect(clusters).toHaveCount(1)
  })

  test('Cross-nav: Vue en liste navigates to /themes', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    await page.getByText('Vue en liste').click()
    await expect(page).toHaveURL(/\/themes/)
  })

  test('E1: No clusters shows empty state', async ({ page }) => {
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Aucun cluster disponible')).toBeVisible()
    await expect(page.locator('[data-cluster-region]')).toHaveCount(0)
  })

  test('E3: API timeout shows error with retry', async ({ page }) => {
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      route.fulfill({ status: 504, body: '' })
    })

    await page.goto(`${BASE}/map`)
    await page.waitForTimeout(3000)

    await expect(page.getByText('Chargement echoue')).toBeVisible()
    await expect(page.getByText('Reessayer')).toBeVisible()
  })
})
