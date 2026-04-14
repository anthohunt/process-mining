// US-4.2 — Bulk Import (CSV & Google Scholar)
// E2E test snippets captured during exploration on 2026-04-14

import { test, expect } from '@playwright/test'
import path from 'path'

const CSV_FIXTURE = path.resolve(__dirname, '../fixtures/test-import.csv')

// --- Happy Path: CSV Import ---

test('US-4.2 — import tab loads with dropzone', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Import' }).click()
  const dropzone = page.getByRole('button', { name: /deposer|dropzone/i })
  await expect(dropzone).toBeVisible()
})

test('US-4.2 — CSV file upload shows preview with duplicate detection', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Import' }).click()

  // Upload file via hidden input
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(CSV_FIXTURE)

  // Preview table should appear
  await expect(page.getByRole('table', { name: /aper/i })).toBeVisible({ timeout: 5000 })
  // Status column shows Nouveau or doublon(s)
  const statusCells = page.locator('tbody td:last-child span.tag')
  await expect(statusCells.first()).toBeVisible()
})

test('US-4.2 — confirm import inserts researchers and shows success', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Import' }).click()

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(CSV_FIXTURE)

  await page.getByRole('table', { name: /aper/i }).waitFor({ state: 'visible' })

  const confirmBtn = page.getByRole('button', { name: /importer/i })
  await confirmBtn.click()

  // Success state with count
  await expect(page.getByRole('status')).toContainText(/chercheur.*import/i, { timeout: 5000 })
  // "Voir les logs" button appears
  await expect(page.getByRole('button', { name: /voir les logs/i })).toBeVisible()
})

test('US-4.2 — duplicate detection marks re-imported rows as doublons', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Import' }).click()
  const fileInput = page.locator('input[type="file"]')

  // First import
  await fileInput.setInputFiles(CSV_FIXTURE)
  await page.getByRole('table', { name: /aper/i }).waitFor({ state: 'visible' })
  await page.getByRole('button', { name: /importer/i }).click()
  await page.getByRole('status').waitFor()

  // Second import of same file
  await page.getByRole('button', { name: /importer un autre/i }).click().catch(() => {})
  const fileInput2 = page.locator('input[type="file"]')
  await fileInput2.setInputFiles(CSV_FIXTURE)
  await page.getByRole('table', { name: /aper/i }).waitFor({ state: 'visible' })

  // All rows should be doublons
  const doubletonTags = page.locator('tbody .tag-orange')
  await expect(doubletonTags).toHaveCount(2)
})

// --- Edge Case E1: Invalid CSV Format ---

test('US-4.2-E1 — invalid CSV format shows parse error', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL('/admin')

  await page.getByRole('tab', { name: 'Import' }).click()

  // Create a temp invalid file via DataTransfer injection
  await page.evaluate(() => {
    const dt = new DataTransfer()
    const file = new File(['invalid content without headers'], 'bad.csv', { type: 'text/csv' })
    dt.items.add(file)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: dt.files })
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })

  await expect(page.getByRole('alert')).toContainText(/format|invalide/i, { timeout: 5000 })
})
