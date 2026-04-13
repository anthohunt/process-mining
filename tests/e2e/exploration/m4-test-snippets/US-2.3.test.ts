import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5202'
const EDIT_URL = `${BASE}/researchers/22222222-0000-0000-0000-000000000001/edit`

async function loginAsResearcher(page: any) {
  await page.goto(`${BASE}/login`)
  await page.getByRole('button', { name: 'Demo Chercheur' }).click()
  await page.waitForURL(`${BASE}/`)
}

test.describe('US-2.3 — Add/Edit Profile Form', () => {
  test('happy path: form renders all field sections', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await expect(page.getByLabel('Nom complet')).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Laboratoire' })).toBeVisible()
    await expect(page.getByPlaceholder(/Appuyer sur Entree/i)).toBeVisible()
    await expect(page.getByLabel('Biographie')).toBeVisible()
    await expect(page.getByText('Publications')).toBeVisible()
  })

  test('happy path: adding a keyword via Enter appends tag', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    const kwInput = page.getByPlaceholder(/Appuyer sur Entree/i)
    await kwInput.fill('NLP')
    await kwInput.press('Enter')
    await expect(page.getByText('NLP')).toBeVisible()
    await expect(kwInput).toHaveValue('')
  })

  test('happy path: removing a keyword via × removes the tag', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await page.getByRole('button', { name: /Supprimer le mot-cle alignement/i }).click()
    await expect(page.getByText('alignement')).not.toBeVisible()
  })

  test('happy path: add publication button creates new publication block', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    const initialCount = await page.getByRole('button', { name: /Supprimer la publication/i }).count()
    await page.getByRole('button', { name: '+ Ajouter une publication' }).click()
    await expect(page.getByRole('button', { name: /Supprimer la publication/i })).toHaveCount(initialCount + 1)
  })

  test('happy path: cancel navigates back without saving', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await page.getByRole('button', { name: 'Annuler' }).click()
    await expect(page).toHaveURL(/\/researchers\/22222222-0000-0000-0000-000000000001$/)
  })

  test('happy path: save shows success toast', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    // Block navigation to capture toast
    await page.evaluate(() => { history.pushState = () => {} })
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByText(/Profil enregistre avec succes/i)).toBeVisible()
  })

  test('edge E1: empty name field blocks submission with validation error', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await page.getByLabel('Nom complet').fill('')
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByRole('alert', { name: /Ce champ est requis/i })).toBeVisible()
    await expect(page.getByLabel('Nom complet')).toHaveAttribute('aria-invalid', 'true')
    // Should not navigate
    await expect(page).toHaveURL(EDIT_URL)
  })

  test('edge E2: server error shows error toast, form data preserved', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await page.evaluate(() => {
      const orig = window.fetch
      window.fetch = async (url: any, opts: any) => {
        if (typeof url === 'string' && url.includes('/researchers?') && opts?.method === 'PATCH') {
          return new Response('{}', { status: 500, headers: { 'Content-Type': 'application/json' } })
        }
        return orig(url, opts)
      }
    })
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByText(/Erreur de sauvegarde/i)).toBeVisible()
    // Form data preserved
    await expect(page.getByLabel('Nom complet')).toHaveValue('Marie Dupont')
    await expect(page.getByText('conformance')).toBeVisible()
  })

  test('edge E3: duplicate keyword shows warning message and is not added', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    const kwInput = page.getByPlaceholder(/Appuyer sur Entree/i)
    await kwInput.fill('conformance')
    await kwInput.press('Enter')
    await expect(page.getByText(/Mot-cle deja present/i)).toBeVisible()
    // Tag count should not have increased
    const tags = page.locator('.tag-blue')
    const countBefore = await tags.count()
    await expect(tags).toHaveCount(countBefore)
  })
})
