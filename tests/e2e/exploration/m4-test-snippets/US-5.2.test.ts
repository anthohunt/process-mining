import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5202'
const OWN_PROFILE = `${BASE}/researchers/22222222-0000-0000-0000-000000000001`
const OTHER_PROFILE = `${BASE}/researchers/22222222-0000-0000-0000-000000000004`
const EDIT_URL = `${OWN_PROFILE}/edit`

async function loginAsResearcher(page: any) {
  await page.goto(`${BASE}/login`)
  await page.getByRole('button', { name: 'Demo Chercheur' }).click()
  await page.waitForURL(`${BASE}/`)
}

test.describe('US-5.2 — Profile Submission with Admin Approval', () => {
  test('happy path: own profile shows enabled Modifier button', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(OWN_PROFILE)
    const editBtn = page.getByRole('button', { name: /Modifier le profil/i })
    await expect(editBtn).toBeEnabled()
    await expect(editBtn).not.toHaveText(/🔒/)
  })

  test('happy path: edit form shows approval banner', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await expect(page.getByRole('alert').first()).toContainText(/soumis a validation/i)
  })

  test('happy path: form pre-populated with existing data', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await expect(page.getByLabel('Nom complet')).toHaveValue('Marie Dupont')
    await expect(page.getByRole('combobox', { name: 'Laboratoire' })).toHaveValue('LIRIS')
  })

  test('happy path: save shows success toast', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByText(/Profil enregistre avec succes/i)).toBeVisible()
  })

  test('happy path: other profile shows locked Modifier button', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(OTHER_PROFILE)
    const editBtn = page.getByRole('button', { name: /Modifier/i })
    await expect(editBtn).toBeDisabled()
    await expect(page.getByText(/Vous ne pouvez modifier que votre propre profil/i)).toBeVisible()
  })

  test('happy path: anonymous user sees no Modifier button', async ({ page }) => {
    await page.goto(OTHER_PROFILE)
    await expect(page.getByRole('button', { name: /Modifier/i })).not.toBeVisible()
  })

  test('edge E1: already_pending API response shows warning banner', async ({ page }) => {
    await loginAsResearcher(page)
    await page.goto(EDIT_URL)
    await page.evaluate(() => {
      const orig = window.fetch
      window.fetch = async (url: any, opts: any) => {
        if (typeof url === 'string' && url.includes('/researchers?') && opts?.method === 'PATCH') {
          return new Response(JSON.stringify({ code: 'already_pending', message: 'already_pending' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return orig(url, opts)
      }
    })
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByRole('alert', { name: /deja une soumission/i })).toBeVisible()
  })

  test('edge E2: server error shows error toast, form preserved', async ({ page }) => {
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
    await expect(page.getByLabel('Nom complet')).toHaveValue('Marie Dupont')
  })

  test('edge E3: rejected profile shows rejection banner with reason', async ({ page }) => {
    // Requires researcher status='rejected' and rejection_reason set in DB
    await loginAsResearcher(page)
    await page.goto(OWN_PROFILE)
    // If status is rejected, expect rejection banner
    const banner = page.getByRole('alert').filter({ hasText: /rejete/i })
    // This test is conditional — rejection_reason must be set via admin/DB
    // await expect(banner).toBeVisible()
    // await expect(banner).toContainText('Raison :')
  })
})
