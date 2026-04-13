import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5200'
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co'

test.describe('US-3.2 — Cluster Click for Members', () => {
  test('Happy path: clicking cluster opens popover with members', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    // Click first cluster region
    const cluster = page.locator('[data-cluster-region]').first()
    await cluster.click()

    // Popover should appear
    const popover = page.locator('.popover')
    await expect(popover).toBeVisible()

    // Popover should contain cluster name
    await expect(popover.locator('div').first()).not.toBeEmpty()

    // Popover should list members
    const memberLinks = popover.locator('.btn-ghost')
    const count = await memberLinks.count()
    expect(count).toBeGreaterThan(0)

    // Sub-theme tags should be shown
    const tags = popover.locator('.tag')
    await expect(tags.first()).toBeVisible()
  })

  test('Clicking a researcher name in popover navigates to profile', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    // Click cluster to open popover
    const cluster = page.locator('[data-cluster-region]').first()
    await cluster.click()

    // Click first member name
    const popover = page.locator('.popover')
    const memberLink = popover.locator('.btn-ghost').first()
    const memberName = await memberLink.textContent()
    await memberLink.click()

    // Should navigate to researcher profile
    await expect(page).toHaveURL(/\/researchers\//)
    await expect(page.locator('h1')).toContainText(memberName!.trim())
  })

  test('E1: cluster with 50+ members shows truncated list', async ({ page }) => {
    // Create a cluster with 55 members
    const members = Array.from({ length: 55 }, (_, i) => ({
      id: `r${i}`, full_name: `Researcher ${i}`, lab: 'LORIA', cluster_id: 'big-cluster'
    }))

    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      if (route.request().url().includes('select=*')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'big-cluster', name: 'Big Cluster', color: '#3b82f6', sub_themes: ['Test'], created_at: '2024-01-01' }
          ])
        })
      } else {
        route.continue()
      }
    })

    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(members) })
    })

    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    const cluster = page.locator('[data-cluster-region]').first()
    await cluster.click()

    const popover = page.locator('.popover')
    await expect(popover).toBeVisible()

    // Should show only first 10 members
    const memberLinks = popover.locator('ul li')
    await expect(memberLinks).toHaveCount(10)

    // Should show "et 45 autres"
    await expect(popover.getByText(/et 45 autres/)).toBeVisible()
  })

  test('E2: clicking outside popover closes it', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    const cluster = page.locator('[data-cluster-region]').first()
    await cluster.click()
    await expect(page.locator('.popover')).toBeVisible()

    // Click on map background
    await page.locator('.map-container').click({ position: { x: 700, y: 450 } })
    await expect(page.locator('.popover')).not.toBeVisible()
  })
})
