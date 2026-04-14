// US-4.3 — App Settings
// E2E test snippets captured during exploration on 2026-04-14

import { test, expect } from '@playwright/test'

// --- Happy Path ---

test('US-4.3 — settings tab loads with all sections', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Parametres' }).click()
  const panel = page.getByRole('tabpanel', { name: /parametres/i })

  await expect(panel.getByRole('heading', { name: /langue/i })).toBeVisible()
  await expect(panel.getByRole('heading', { name: /seuil/i })).toBeVisible()
  await expect(panel.getByRole('heading', { name: /algorithme/i })).toBeVisible()
  await expect(panel.getByRole('button', { name: /sauvegarder/i })).toBeVisible()
})

test('US-4.3 — changing similarity threshold marks form dirty', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Parametres' }).click()

  const slider = page.getByRole('slider', { name: /seuil/i })
  await slider.fill('0.75')

  // Dirty indicator appears
  await expect(page.getByText(/modifications non sauvegard/i)).toBeVisible()
})

test('US-4.3 — saving settings shows success toast', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Parametres' }).click()
  const slider = page.getByRole('slider', { name: /seuil/i })
  await slider.fill('0.70')

  await page.getByRole('button', { name: /sauvegarder/i }).click()

  // Success toast appears
  await expect(page.getByRole('status')).toBeVisible({ timeout: 5000 })
  // Dirty indicator disappears
  await expect(page.getByText(/modifications non sauvegard/i)).not.toBeVisible()
})

test('US-4.3 — NLP algorithm select updates value', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Parametres' }).click()
  const algSelect = page.getByRole('combobox', { name: /algorithme/i })
  await algSelect.selectOption('bert')
  await expect(algSelect).toHaveValue('bert')
})

// --- Edge Case E1: Zero Threshold Warning ---

test('US-4.3-E1 — zero threshold shows inline warning', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Parametres' }).click()
  const slider = page.getByRole('slider', { name: /seuil/i })
  await slider.fill('0')

  await expect(page.getByText(/seuil de 0\.0 considerera/i)).toBeVisible()
})

// --- Edge Case E2: Unsaved Navigation Prompt ---

test('US-4.3-E2 — navigating away with unsaved changes shows confirmation dialog', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Parametres' }).click()
  const slider = page.getByRole('slider', { name: /seuil/i })
  await slider.fill('0.50')

  // Click another tab — confirmation dialog should appear
  await page.getByRole('tab', { name: 'Logs' }).click()
  const dialog = page.getByRole('dialog', { name: /modifications non sauvegard/i })
  await expect(dialog).toBeVisible()

  // Clicking cancel keeps us on settings
  await dialog.getByRole('button', { name: /annuler/i }).click()
  await expect(page.getByRole('tabpanel', { name: /parametres/i })).toBeVisible()
})

test('US-4.3-E2 — confirming navigation discards unsaved changes', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Parametres' }).click()
  await page.getByRole('slider', { name: /seuil/i }).fill('0.50')

  await page.getByRole('tab', { name: 'Logs' }).click()
  const dialog = page.getByRole('dialog', { name: /modifications non sauvegard/i })
  await dialog.getByRole('button', { name: /quitter quand même/i }).click()

  // Now on Logs tab
  await expect(page.getByRole('tabpanel', { name: 'Logs' })).toBeVisible()
})
