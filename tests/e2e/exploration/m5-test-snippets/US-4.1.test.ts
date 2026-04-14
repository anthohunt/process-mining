// US-4.1 — User Management & Pending Profiles
// E2E test snippets captured during exploration on 2026-04-14

import { test, expect } from '@playwright/test'

// --- Happy Path: User Table ---

test('US-4.1 — admin can view user table', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await expect(page.getByRole('tab', { name: 'Utilisateurs' })).toBeVisible()
  const table = page.getByRole('table', { name: /utilisateurs/i })
  await expect(table).toBeVisible()
  await expect(table.getByRole('columnheader', { name: /email/i })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: /role/i })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: /statut/i })).toBeVisible()
})

test('US-4.1 — admin can change user role', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  // Click Modifier on first non-self user
  const rows = page.locator('#admin-tab-admin-users tbody tr')
  const firstRow = rows.nth(1)
  await firstRow.getByRole('button', { name: /modifier/i }).click()
  await expect(firstRow.getByRole('combobox', { name: /nouveau role/i })).toBeVisible()
  await firstRow.getByRole('combobox').selectOption('admin')
  await firstRow.getByRole('button', { name: /sauvegarder/i }).click()
  // role badge should update
  await expect(firstRow.getByText('Admin')).toBeVisible()
})

test('US-4.1 — admin can invite new user', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('button', { name: /inviter/i }).click()
  const dialog = page.getByRole('dialog', { name: /inviter/i })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: /email/i }).fill('newuser@example.com')
  await dialog.getByRole('button', { name: /envoyer/i }).click()
  // dialog closes on success
  await expect(dialog).not.toBeVisible({ timeout: 5000 })
})

// --- Happy Path: Pending Profiles ---

test('US-4.1 — admin can approve pending profile', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: /profils en attente/i }).click()
  const pendingRows = page.locator('[id="admin-tab-admin-pending"] tbody tr')
  const count = await pendingRows.count()
  if (count > 0) {
    await pendingRows.first().getByRole('button', { name: /approuver/i }).click()
    // row should disappear from pending list
    await expect(pendingRows).toHaveCount(count - 1)
  }
})

test('US-4.1 — admin can reject pending profile', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: /profils en attente/i }).click()
  const pendingRows = page.locator('[id="admin-tab-admin-pending"] tbody tr')
  const count = await pendingRows.count()
  if (count > 0) {
    await pendingRows.first().getByRole('button', { name: /rejeter/i }).click()
    await expect(pendingRows).toHaveCount(count - 1)
  }
})

// --- Edge Case E1: Empty Pending List ---

test('US-4.1-E1 — empty pending list shows empty state', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: /profils en attente/i }).click()
  // If no pending profiles, empty state should appear
  const pendingRows = page.locator('[id="admin-tab-admin-pending"] tbody tr')
  const count = await pendingRows.count()
  if (count === 0) {
    await expect(page.getByText(/aucun profil en attente/i)).toBeVisible()
  }
})

// --- Edge Case E2: Self-Revoke Disabled ---

test('US-4.1-E2 — admin cannot revoke own account', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  // Find own row — has "(vous)" tag
  const selfRow = page.locator('#admin-tab-admin-users tbody tr').filter({ hasText: '(vous)' })
  const revokeBtn = selfRow.getByRole('button', { name: /revoquer/i })
  await expect(revokeBtn).toBeDisabled()
})
