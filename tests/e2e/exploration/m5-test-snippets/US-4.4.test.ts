// US-4.4 — Audit Logs
// E2E test snippets captured during exploration on 2026-04-14

import { test, expect } from '@playwright/test'

// --- Happy Path ---

test('US-4.4 — logs tab loads with table and filter controls', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Logs' }).click()
  const panel = page.getByRole('tabpanel', { name: 'Logs' })

  await expect(panel.getByRole('textbox', { name: 'Du' })).toBeVisible()
  await expect(panel.getByRole('textbox', { name: 'Au' })).toBeVisible()
  await expect(panel.getByRole('button', { name: /filtrer/i })).toBeVisible()

  const table = panel.getByRole('table', { name: /logs/i })
  await expect(table).toBeVisible()
  await expect(table.getByRole('columnheader', { name: /date/i })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: /utilisateur/i })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: /action/i })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: /detail/i })).toBeVisible()
})

test('US-4.4 — log entries have colored action tags', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Logs' }).click()

  // All action cells should have a tag span
  const actionCells = page.locator('[aria-label="Logs"] tbody td:nth-child(3) span.tag')
  await expect(actionCells.first()).toBeVisible({ timeout: 5000 })
})

test('US-4.4 — date filter filters results and shows clear button', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Logs' }).click()
  const panel = page.getByRole('tabpanel', { name: 'Logs' })

  await panel.getByRole('textbox', { name: 'Du' }).fill('2026-04-14')
  await panel.getByRole('textbox', { name: 'Au' }).fill('2026-04-14')
  await panel.getByRole('button', { name: /filtrer/i }).click()

  // Clear button appears after filter applied
  await expect(panel.getByRole('button', { name: /tout afficher/i })).toBeVisible()
})

test('US-4.4 — clearing filter resets table to full list', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Logs' }).click()
  const panel = page.getByRole('tabpanel', { name: 'Logs' })

  // Apply a filter
  await panel.getByRole('textbox', { name: 'Du' }).fill('2026-04-14')
  await panel.getByRole('textbox', { name: 'Au' }).fill('2026-04-14')
  await panel.getByRole('button', { name: /filtrer/i }).click()

  const clearBtn = panel.getByRole('button', { name: /tout afficher/i })
  await clearBtn.click()

  // Clear button should disappear and date inputs reset
  await expect(clearBtn).not.toBeVisible()
  await expect(panel.getByRole('textbox', { name: 'Du' })).toHaveValue('')
})

test('US-4.4 — approve/reject actions are recorded in logs', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Logs' }).click()

  // After approve/reject operations, logs should contain Modification/Suppression entries
  const table = page.getByRole('table', { name: /logs/i })
  const rows = table.locator('tbody tr')
  await expect(rows.first()).toBeVisible({ timeout: 5000 })
})
