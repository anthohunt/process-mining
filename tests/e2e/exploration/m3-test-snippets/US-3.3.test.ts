import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5200'
const SUPABASE = 'deylsvqlogdooxqumhdz.supabase.co'

test.describe('US-3.3 — Researcher Dot to Profile', () => {
  test('Happy path: hover shows tooltip, click navigates to profile', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    // Researcher dots should be present
    const dots = page.locator('[data-researcher-dot]')
    const dotCount = await dots.count()
    expect(dotCount).toBeGreaterThan(0)

    // Hover over first dot
    const firstDot = dots.first()
    await firstDot.hover()

    // Tooltip text should appear in the SVG
    const tooltipText = page.locator('g[style*="pointerEvents: none"] text')
    await expect(tooltipText).toBeVisible()
    const name = await tooltipText.textContent()
    expect(name!.length).toBeGreaterThan(0)

    // Click dot navigates to profile
    await firstDot.click()
    await expect(page).toHaveURL(/\/researchers\//)
  })

  test('Dots have pointer cursor style', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    const dot = page.locator('[data-researcher-dot]').first()
    const cursor = await dot.evaluate(el => window.getComputedStyle(el).cursor)
    expect(cursor).toBe('pointer')
  })

  test('E1: overlapping dots show disambiguation popover', async ({ page }) => {
    // Create cluster where all members overlap at same position
    await page.route(`**/${SUPABASE}/rest/v1/clusters**`, route => {
      if (route.request().url().includes('select=*')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'c1', name: 'Overlapping', color: '#3b82f6', sub_themes: ['Test'], created_at: '2024-01-01' }
          ])
        })
      } else {
        route.continue()
      }
    })

    // 100 researchers in same cluster = many overlapping positions
    const members = Array.from({ length: 100 }, (_, i) => ({
      id: `r${i}`, full_name: `Researcher ${i}`, lab: 'LORIA', cluster_id: 'c1'
    }))

    await page.route(`**/${SUPABASE}/rest/v1/researchers**`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(members) })
    })

    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    // Click an overlapping dot
    const dot = page.locator('[data-researcher-dot]').first()
    await dot.click()

    // Disambiguation popover should appear with multiple names
    const popover = page.locator('.popover')
    await expect(popover).toBeVisible()
    const names = popover.locator('.btn-ghost')
    const count = await names.count()
    expect(count).toBeGreaterThan(1) // Multiple overlapping researchers
  })

  test('E2: clicking dot when profile API fails shows error page', async ({ page }) => {
    await page.goto(`${BASE}/map`)
    await page.waitForLoadState('networkidle')

    // Intercept researcher profile API with 500
    await page.route(`**/${SUPABASE}/rest/v1/researchers?select=*&id=eq.*`, route => {
      route.fulfill({ status: 500, body: '{"message":"Server Error"}' })
    })

    // Click a researcher dot (navigates to profile page)
    const dot = page.locator('[data-researcher-dot]').first()
    await dot.click()

    // Should navigate to profile, which shows error
    await expect(page).toHaveURL(/\/researchers\//)
    await expect(page.getByText('Profil introuvable')).toBeVisible({ timeout: 5000 })
  })
})
