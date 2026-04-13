import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5200'
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co'

test.describe('US-3.4 — Theme List View', () => {
  test('Happy path: themes page shows cluster cards with details', async ({ page }) => {
    await page.goto(`${BASE}/themes`)
    await page.waitForLoadState('networkidle')

    // Title is present
    await expect(page.locator('h1')).toHaveText('Explorer les Themes')

    // Cluster cards are visible
    const cards = page.locator('.cluster-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Each card has name, researcher count, and sub-theme tags
    const firstCard = cards.first()
    await expect(firstCard.locator('.cluster-card-header')).toBeVisible()
    await expect(firstCard.locator('.cluster-color-dot')).toBeVisible()

    // "Voir sur la carte" button is visible
    await expect(page.getByText('Voir sur la carte')).toBeVisible()
  })

  test('Clicking a card expands to show member researchers', async ({ page }) => {
    await page.goto(`${BASE}/themes`)
    await page.waitForLoadState('networkidle')

    // Click first card that has members (has expand arrow)
    const expandableCard = page.locator('.cluster-card-header').filter({ hasText: /\u25BC/ }).first()
    await expandableCard.click()

    // Expanded body should be visible with researcher names
    const body = page.locator('.cluster-card-body')
    await expect(body).toBeVisible()

    const memberLinks = body.locator('.btn-ghost')
    const count = await memberLinks.count()
    expect(count).toBeGreaterThan(0)

    // "Voir tous les chercheurs" link should be visible
    await expect(body.getByText('Voir tous les chercheurs')).toBeVisible()
  })

  test('Clicking a researcher name navigates to profile', async ({ page }) => {
    await page.goto(`${BASE}/themes`)
    await page.waitForLoadState('networkidle')

    // Expand first card
    const expandableCard = page.locator('.cluster-card-header').filter({ hasText: /\u25BC/ }).first()
    await expandableCard.click()

    // Click first researcher name
    const memberLink = page.locator('.cluster-card-body .btn-ghost').first()
    await memberLink.click()

    await expect(page).toHaveURL(/\/researchers\//)
  })

  test('Cross-nav: "Voir sur la carte" navigates to /map', async ({ page }) => {
    await page.goto(`${BASE}/themes`)
    await page.waitForLoadState('networkidle')

    await page.getByText('Voir sur la carte').click()
    await expect(page).toHaveURL(/\/map/)
  })

  test('E1: no themes shows empty state', async ({ page }) => {
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await page.goto(`${BASE}/themes`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Aucun theme disponible')).toBeVisible()
    await expect(page.locator('.cluster-card')).toHaveCount(0)
  })

  test('E2: cluster with 0 researchers shows count and is not expandable', async ({ page }) => {
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      if (route.request().url().includes('select=*')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'empty-cluster', name: 'Empty Theme', color: '#9ca3af', sub_themes: [], created_at: '2024-01-01' }
          ])
        })
      } else {
        route.continue()
      }
    })
    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await page.goto(`${BASE}/themes`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('0 chercheurs')).toBeVisible()

    // Click it — should not expand (no arrow, no body)
    await page.locator('.cluster-card-header').click()
    await expect(page.locator('.cluster-card-body')).not.toBeVisible()
  })

  test('E3: malformed API response shows error with retry', async ({ page }) => {
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{malformed}' })
    })

    await page.goto(`${BASE}/themes`)
    await page.waitForTimeout(3000)

    await expect(page.getByText('Erreur de chargement des themes')).toBeVisible()
    await expect(page.getByText('Reessayer')).toBeVisible()
  })
})
