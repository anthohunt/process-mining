import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5199'
const RESEARCHER_EMAIL = 'researcher@cartoPM.fr'
const RESEARCHER_PASSWORD = 'demo123456'
const ADMIN_EMAIL = 'admin@cartoPM.fr'

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

test.describe('M4 — Auth & Profile Management', () => {

  test.describe('US-5.1 — User Login', () => {

    test.describe('Happy Path', () => {
      test('navbar shows Connexion when logged out', async ({ page }) => {
        await page.goto(BASE)
        await expect(page.getByRole('button', { name: /Connexion/i })).toBeVisible()
      })

      test('login with valid credentials redirects to dashboard', async ({ page }) => {
        await page.goto(`${BASE}/login`)
        await page.getByLabel('Email').fill(RESEARCHER_EMAIL)
        await page.getByLabel('Mot de passe').fill(RESEARCHER_PASSWORD)
        await page.getByRole('button', { name: 'Se connecter' }).click()
        await page.waitForURL(`${BASE}/`)
        await expect(page.getByText('Marie Dupont')).toBeVisible()
      })

      test('Mon profil navigates to own researcher profile', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await expect(page).toHaveURL(/\/researchers\//)
      })

      test('logout reverts navbar to Connexion', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Deconnexion' }).click()
        await expect(page.getByRole('button', { name: /Connexion/i })).toBeVisible()
      })

      test('admin login shows Admin tab and badge', async ({ page }) => {
        await loginAsAdmin(page)
        await expect(page.getByRole('button', { name: /Admin/i })).toBeVisible()
      })
    })

    test.describe('Edge Cases', () => {
      test('E1: invalid credentials shows error message', async ({ page }) => {
        await page.goto(`${BASE}/login`)
        await page.getByLabel('Email').fill('bad@email.com')
        await page.getByLabel('Mot de passe').fill('wrongpassword')
        await page.getByRole('button', { name: 'Se connecter' }).click()
        await expect(page.getByRole('alert')).toContainText(/Email ou mot de passe incorrect/i)
      })

      test('E2: auth API unreachable shows service unavailable', async ({ page }) => {
        await page.route('**/auth/**', route => route.abort())
        await page.goto(`${BASE}/login`)
        await page.getByLabel('Email').fill(RESEARCHER_EMAIL)
        await page.getByLabel('Mot de passe').fill(RESEARCHER_PASSWORD)
        await page.getByRole('button', { name: 'Se connecter' }).click()
        await expect(page.getByRole('alert')).toContainText(/Service indisponible/i)
      })

      test('E3: 401 response triggers session expiry redirect', async ({ page }) => {
        await loginAsResearcher(page)
        await page.route('**/rest/v1/**', route => route.fulfill({ status: 401, body: '{}' }))
        await page.goto(`${BASE}/researchers`)
        await expect(page).toHaveURL(/\/login\?expired=1/)
        await expect(page.getByRole('alert')).toContainText(/Session expiree/i)
      })
    })
  })

  test.describe('US-5.2 — Profile Submission with Admin Approval', () => {

    test.describe('Happy Path', () => {
      test('own profile shows enabled Modifier button', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        const editBtn = page.getByRole('button', { name: /Modifier le profil/i })
        await expect(editBtn).toBeEnabled()
      })

      test('edit form shows approval banner', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        await expect(page.getByRole('alert').first()).toContainText(/soumis a validation/i)
      })

      test('other profile shows locked Modifier button with note', async ({ page }) => {
        await loginAsResearcher(page)
        await page.goto(`${BASE}/researchers`)
        // Navigate to a different researcher's profile
        const rows = page.locator('table tbody tr')
        const secondRow = rows.nth(1)
        await secondRow.getByRole('link', { name: 'Voir' }).click()
        await page.waitForURL(/\/researchers\//)
        const lockBtn = page.getByRole('button', { name: /Modifier/i })
        await expect(lockBtn).toBeDisabled()
        await expect(page.getByText(/Vous ne pouvez modifier que votre propre profil/i)).toBeVisible()
      })

      test('anonymous user sees no Modifier button', async ({ page }) => {
        await page.goto(`${BASE}/researchers`)
        const rows = page.locator('table tbody tr')
        await rows.first().getByRole('link', { name: 'Voir' }).click()
        await page.waitForURL(/\/researchers\//)
        await expect(page.getByRole('button', { name: /Modifier/i })).not.toBeVisible()
      })
    })

    test.describe('Edge Cases', () => {
      test('E1: already_pending shows warning banner', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
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
        await expect(page.getByText(/deja une soumission/i)).toBeVisible()
      })

      test('E2: server error shows error toast, form preserved', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
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

      test('E3: rejected profile shows rejection banner', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        // Inject rejection state via route interception
        const profileUrl = page.url()
        const researcherId = profileUrl.split('/researchers/')[1]
        await page.route(`**/rest/v1/researchers?*id=eq.${researcherId}*`, route => {
          return route.fetch().then(response => response.json()).then(data => {
            if (Array.isArray(data) && data.length > 0) {
              data[0].status = 'rejected'
              data[0].rejection_reason = 'Informations incompletes'
            }
            return route.fulfill({ json: data })
          })
        })
        await page.reload()
        await expect(page.getByText(/rejete/i)).toBeVisible()
      })
    })
  })

  test.describe('US-2.3 — Add/Edit Profile Form', () => {

    test.describe('Happy Path', () => {
      test('form renders all field sections', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        await expect(page.getByLabel('Nom complet')).toBeVisible()
        await expect(page.getByLabel('Biographie')).toBeVisible()
        await expect(page.getByText('Publications')).toBeVisible()
      })

      test('adding a keyword via Enter appends tag', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        const kwInput = page.getByPlaceholder(/Appuyer sur Entree/i)
        await kwInput.fill('NLP')
        await kwInput.press('Enter')
        await expect(page.getByText('NLP')).toBeVisible()
        await expect(kwInput).toHaveValue('')
      })

      test('removing a keyword tag via x removes it', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        const tags = page.locator('.tag-blue')
        const initialCount = await tags.count()
        await page.locator('.tag-blue').first().getByRole('button').click()
        await expect(tags).toHaveCount(initialCount - 1)
      })

      test('add publication creates new block', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        const pubBlocks = page.locator('.publication-block, [data-publication]')
        const initialCount = await pubBlocks.count()
        await page.getByRole('button', { name: /Ajouter une publication/i }).click()
        await expect(pubBlocks).toHaveCount(initialCount + 1)
      })

      test('cancel navigates back without saving', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        await page.getByRole('button', { name: 'Annuler' }).click()
        await expect(page).toHaveURL(/\/researchers\//)
      })

      test('save shows success toast', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        await page.getByRole('button', { name: 'Enregistrer' }).click()
        await expect(page.getByText(/Profil enregistre avec succes/i)).toBeVisible()
      })
    })

    test.describe('Edge Cases', () => {
      test('E1: empty name field blocks submission with validation error', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        await page.getByLabel('Nom complet').fill('')
        await page.getByRole('button', { name: 'Enregistrer' }).click()
        await expect(page.getByText(/Ce champ est requis/i)).toBeVisible()
      })

      test('E2: server error shows error toast, form data preserved', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
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

      test('E3: duplicate keyword shows warning and is not added', async ({ page }) => {
        await loginAsResearcher(page)
        await page.getByRole('button', { name: /Menu utilisateur/i }).click()
        await page.getByRole('menuitem', { name: 'Mon profil' }).click()
        await page.waitForURL(/\/researchers\//)
        await page.getByRole('button', { name: /Modifier le profil/i }).click()
        const tags = page.locator('.tag-blue')
        const initialCount = await tags.count()
        // Get first keyword text
        const firstTag = await tags.first().textContent()
        const keyword = firstTag?.replace('×', '').trim() ?? ''
        const kwInput = page.getByPlaceholder(/Appuyer sur Entree/i)
        await kwInput.fill(keyword)
        await kwInput.press('Enter')
        await expect(page.getByText(/Mot-cle deja present/i)).toBeVisible()
        await expect(tags).toHaveCount(initialCount)
      })
    })
  })
})
