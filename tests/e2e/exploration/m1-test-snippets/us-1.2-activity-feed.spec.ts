import { test, expect } from '@playwright/test'

// US-1.2 — Activity Feed: shows 5 recent items with avatars and navigates to profiles

test.describe('US-1.2 — Activity Feed', () => {
  test('happy path: shows 5 activity items with avatar initials', async ({ page }) => {
    await page.goto('/')
    const list = page.getByRole('list', { name: 'Activites recentes' })
    await expect(list).toBeVisible()
    const items = list.getByRole('listitem')
    await expect(items).toHaveCount(5)
  })

  test('happy path: each item has avatar, name button, action text, timestamp', async ({ page }) => {
    await page.goto('/')
    const firstItem = page.getByRole('list', { name: 'Activites recentes' }).getByRole('listitem').first()
    // Avatar (aria-hidden div with initials)
    await expect(firstItem.locator('.activity-avatar')).toBeVisible()
    // Name button
    await expect(firstItem.getByRole('button')).toBeVisible()
    // Timestamp
    await expect(firstItem.locator('.activity-time')).toBeVisible()
  })

  test('happy path: clicking researcher name navigates to /researchers/:id', async ({ page }) => {
    await page.goto('/')
    // Click Marie Dupont — known to be in seed data with researcher_id
    await page.getByRole('button', { name: 'Voir le profil de Marie Dupont' }).click()
    await expect(page).toHaveURL(/\/researchers\/[0-9a-f-]{36}/)
    // Profile page shows her name
    await expect(page.getByText('Marie Dupont')).toBeVisible()
  })

  test('E1: no activities → shows empty state', async ({ page }) => {
    await page.route('**/rest/v1/audit_logs*', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    )
    await page.goto('/')
    await page.waitForTimeout(1000)
    await expect(page.getByText(/aucune activite/i)).toBeVisible()
    // List should not exist
    await expect(page.getByRole('list', { name: 'Activites recentes' })).not.toBeVisible()
  })

  test('E2: activity API 500 → shows error state with retry', async ({ page }) => {
    await page.route('**/rest/v1/audit_logs*', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"error"}' })
    )
    await page.goto('/')
    await page.waitForTimeout(8000) // exhaust retry: 2
    await expect(page.getByText(/erreur de chargement/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Reessayer/i })).toBeVisible()
  })

  test('E3: deleted researcher (null user_name) → greyed "Utilisateur inconnu" with no link', async ({ page }) => {
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
    await page.goto('/')
    await page.waitForTimeout(1000)
    // Shows "Utilisateur inconnu" (not a link button)
    await expect(page.locator('.activity-name.deleted')).toBeVisible()
    await expect(page.getByText('Utilisateur inconnu')).toBeVisible()
    // No link to profile
    await expect(page.getByRole('button', { name: /Voir le profil/ })).not.toBeVisible()
  })
})
