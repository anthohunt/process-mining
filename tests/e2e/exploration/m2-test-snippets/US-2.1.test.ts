import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5199'
const MARIE_ID = '22222222-0000-0000-0000-000000000001'

test.describe('US-2.1 — Researcher Search & Filter', () => {
  test('happy path: list loads with table', async ({ page }) => {
    await page.goto(`${BASE}/researchers`)
    await expect(page.locator('h1')).toContainText('Chercheurs')
    await expect(page.locator('table, [role="table"], .researcher-table')).toBeVisible()
  })

  test('happy path: text search filters by name', async ({ page }) => {
    await page.goto(`${BASE}/researchers`)
    await page.waitForLoadState('networkidle')
    await page.fill('input[placeholder*="Recherch"]', 'Dupont')
    await expect(page.locator('text=Marie Dupont')).toBeVisible()
    // Other researchers should not be visible
    await expect(page.locator('text=Jean Martin')).not.toBeVisible()
  })

  test('happy path: lab dropdown filter', async ({ page }) => {
    await page.goto(`${BASE}/researchers`)
    await page.waitForLoadState('networkidle')
    const selects = page.locator('select.form-control')
    await selects.first().selectOption({ label: /LIRIS/ })
    await expect(page.locator('text=Marie Dupont')).toBeVisible()
  })

  test('happy path: Explorer par theme cross-nav navigates to /themes', async ({ page }) => {
    await page.goto(`${BASE}/researchers`)
    await page.click('text=Explorer par theme')
    await expect(page).toHaveURL(`${BASE}/themes`)
  })

  test('E1: no results — shows Aucun resultat message', async ({ page }) => {
    await page.goto(`${BASE}/researchers`)
    await page.waitForLoadState('networkidle')
    await page.fill('input[placeholder*="Recherch"]', 'xyznonexistent')
    await expect(page.locator('text=/Aucun/i')).toBeVisible()
  })

  test('E2: API failure — shows error state with retry button', async ({ page }) => {
    await page.route('**/rest/v1/researchers**', route => route.abort())
    await page.goto(`${BASE}/researchers`)
    // React Query retries 2x — wait for error to surface
    await expect(page.locator('text=/erreur/i, [data-testid="error-state"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('button:has-text("Reessayer"), button:has-text("Réessayer")')).toBeVisible()
  })

  test('E3: XSS input is sanitized — no script execution', async ({ page }) => {
    await page.goto(`${BASE}/researchers`)
    let xssExecuted = false
    page.on('dialog', () => { xssExecuted = true })
    await page.fill('input[placeholder*="Recherch"]', "<script>alert('xss')</script>")
    await page.waitForTimeout(500)
    expect(xssExecuted).toBe(false)
    // Input value should be stored as plain text, not executed
    const inputValue = await page.inputValue('input[placeholder*="Recherch"]')
    expect(inputValue).toContain('<script>')
  })
})
