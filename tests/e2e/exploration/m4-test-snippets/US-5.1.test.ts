import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5202'
const RESEARCHER_EMAIL = 'researcher@cartoPM.fr'
const RESEARCHER_PASSWORD = 'demo123456'
const ADMIN_EMAIL = 'admin@cartoPM.fr'

// Helper: log in via demo button
async function loginAsResearcher(page: any) {
  await page.goto(`${BASE}/login`)
  await page.getByRole('button', { name: 'Demo Chercheur' }).click()
  await page.waitForURL(`${BASE}/`)
}

async function loginAsAdmin(page: any) {
  await page.goto(`${BASE}/login`)
  await page.getByRole('button', { name: 'Demo Admin' }).click()
  await page.waitForURL(`${BASE}/`)
}

test.describe('US-5.1 — User Login', () => {
  test('happy path: navbar shows Connexion when logged out', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.getByRole('button', { name: /Connexion/i })).toBeVisible()
  })

  test('happy path: login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.getByLabel('Email').fill(RESEARCHER_EMAIL)
    await page.getByLabel('Mot de passe').fill(RESEARCHER_PASSWORD)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await page.waitForURL(`${BASE}/`)
    await expect(page.getByText('Marie Dupont')).toBeVisible()
  })

  test('happy path: Mon profil navigates to own researcher profile', async ({ page }) => {
    await loginAsResearcher(page)
    await page.getByRole('button', { name: /Menu utilisateur/i }).click()
    await page.getByRole('menuitem', { name: 'Mon profil' }).click()
    await expect(page).toHaveURL(/\/researchers\/22222222-0000-0000-0000-000000000001/)
  })

  test('happy path: logout reverts navbar to Connexion', async ({ page }) => {
    await loginAsResearcher(page)
    await page.getByRole('button', { name: /Menu utilisateur/i }).click()
    await page.getByRole('menuitem', { name: 'Deconnexion' }).click()
    await expect(page.getByRole('button', { name: /Connexion/i })).toBeVisible()
  })

  test('happy path: admin login shows Admin tab and badge', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByRole('button', { name: /Admin/i })).toBeVisible()
    await expect(page.getByText('ADMIN')).toBeVisible()
  })

  test('edge E1: invalid credentials shows error message', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.getByLabel('Email').fill('bad@email.com')
    await page.getByLabel('Mot de passe').fill('wrongpassword')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByRole('alert')).toContainText(/Email ou mot de passe incorrect/i)
  })

  test('edge E2: auth API unreachable shows service unavailable', async ({ page }) => {
    await page.route('**/auth/**', route => route.abort())
    await page.goto(`${BASE}/login`)
    await page.getByLabel('Email').fill(RESEARCHER_EMAIL)
    await page.getByLabel('Mot de passe').fill(RESEARCHER_PASSWORD)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByRole('alert')).toContainText(/Service indisponible/i)
  })

  test('edge E3: 401 response triggers session expiry redirect', async ({ page }) => {
    await loginAsResearcher(page)
    await page.route('**/rest/v1/**', route => route.fulfill({ status: 401, body: '{}' }))
    await page.goto(`${BASE}/researchers`)
    await expect(page).toHaveURL(/\/login\?expired=1/)
    await expect(page.getByRole('alert')).toContainText(/Session expiree/i)
  })
})
