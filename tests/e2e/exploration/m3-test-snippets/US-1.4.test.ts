import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5200'
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co'

test.describe('US-1.4 — Detailed Statistics', () => {
  test('Happy path: stats page shows 3 charts with data', async ({ page }) => {
    await page.goto(`${BASE}/stats`)
    await page.waitForLoadState('networkidle')

    // Title is present
    await expect(page.locator('h1')).toHaveText('Statistiques Detaillees')

    // Breadcrumb shows Dashboard > Statistiques detaillees
    const breadcrumb = page.locator('.breadcrumb')
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb.getByText('Dashboard')).toBeVisible()
    await expect(breadcrumb.getByText('Statistiques detaillees')).toBeVisible()

    // Three chart sections are present
    const cards = page.locator('.card')
    await expect(cards).toHaveCount(3)

    // Bar chart card
    await expect(cards.nth(0).locator('.card-title')).toHaveText('Distribution des themes')
    await expect(cards.nth(0).locator('svg')).toBeVisible()

    // Line chart card
    await expect(cards.nth(1).locator('.card-title')).toHaveText('Tendances temporelles')

    // Histogram card
    await expect(cards.nth(2).locator('.card-title')).toHaveText('Distribution des similarites')
  })

  test('Bar chart has bars with data values', async ({ page }) => {
    await page.goto(`${BASE}/stats`)
    await page.waitForLoadState('networkidle')

    const barChart = page.locator('.card').first().locator('svg')
    await expect(barChart).toBeVisible()

    // Bars should be present
    const bars = barChart.locator('rect')
    const count = await bars.count()
    expect(count).toBeGreaterThan(0)
  })

  test('Breadcrumb "Dashboard" navigates back to /', async ({ page }) => {
    await page.goto(`${BASE}/stats`)
    await page.waitForLoadState('networkidle')

    await page.locator('.breadcrumb').getByText('Dashboard').click()
    await expect(page).toHaveURL(`${BASE}/`)
  })

  test('E1: no data shows empty state messages on all charts', async ({ page }) => {
    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route(`**/${SUPABASE}/rest/v1/publications**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })
    await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await page.goto(`${BASE}/stats`)
    await page.waitForLoadState('networkidle')

    // All charts should show empty messages
    await expect(page.getByText('Pas assez de donnees pour generer ce graphique.')).toHaveCount(2)
    await expect(page.getByText('Au moins 2 chercheurs requis pour calculer la similarite.')).toBeVisible()
  })

  test('E2: only 1 researcher — histogram shows specific message', async ({ page }) => {
    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ keywords: ['process mining', 'conformance'] }])
      })
    })
    await page.route(`**/${SUPABASE}/rest/v1/publications**`, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ year: 2023 }, { year: 2022 }])
      })
    })
    await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await page.goto(`${BASE}/stats`)
    await page.waitForLoadState('networkidle')

    // Bar chart should render with data (2 keywords)
    const barChart = page.locator('.card').first().locator('svg')
    await expect(barChart).toBeVisible()

    // Histogram should show the "Au moins 2 chercheurs" message
    await expect(page.getByText('Au moins 2 chercheurs requis pour calculer la similarite.')).toBeVisible()
  })

  test('E3: malformed stats data shows error with retry', async ({ page }) => {
    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' })
    })
    await page.route(`**/${SUPABASE}/rest/v1/publications**`, route => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' })
    })
    await page.route(`**/${SUPABASE}/rest/v1/similarity_scores**`, route => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Internal Server Error"}' })
    })

    await page.goto(`${BASE}/stats`)
    await page.waitForTimeout(4000) // Wait for retries to exhaust

    await expect(page.getByText('Erreur de chargement')).toBeVisible()
    await expect(page.getByText('Reessayer')).toBeVisible()
  })
})
