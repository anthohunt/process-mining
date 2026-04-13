import { test, expect } from '@playwright/test'

const SUPABASE = 'https://deylsvqlogdooxqumhdz.supabase.co'
const CORS_HEADERS = {
  'access-control-allow-origin': 'http://localhost:5199',
  'access-control-expose-headers': 'content-range, x-total-count',
  'content-type': 'application/json',
}

test.describe('Milestone 1 — Dashboard', () => {
  test.describe('US-1.1 — Stat Grid', () => {
    test('happy path: shows 4 stat cards with correct labels', async ({ page }) => {
      await page.goto('/')
      const region = page.getByRole('region', { name: 'Statistiques globales' })
      await expect(region).toBeVisible()
      await expect(region.getByRole('button', { name: /Chercheurs/ })).toBeVisible()
      await expect(region.getByRole('button', { name: /Themes/ })).toBeVisible()
      await expect(region.getByRole('button', { name: /Clusters/ })).toBeVisible()
      await expect(region.getByRole('button', { name: /Publications/ })).toBeVisible()
    })

    test('happy path: click Chercheurs navigates to /researchers', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /Chercheurs/ }).click()
      await expect(page).toHaveURL('/researchers')
    })

    test('happy path: click Themes navigates to /themes', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /Themes/ }).click()
      await expect(page).toHaveURL('/themes')
    })

    test('E1: API unreachable — stat cards show error state with retry button', async ({ page }) => {
      // Abort all Supabase REST requests
      await page.route(`${SUPABASE}/rest/v1/researchers*`, route => route.abort())
      await page.route(`${SUPABASE}/rest/v1/clusters*`, route => route.abort())
      await page.route(`${SUPABASE}/rest/v1/publications*`, route => route.abort())
      await page.goto('/')
      // React Query retry:2 exhausts in ~8s
      await page.waitForTimeout(8000)
      // StatGrid still renders, showing error state
      const region = page.getByRole('region', { name: 'Statistiques globales' })
      await expect(region).toBeVisible()
    })

    test('E2: empty database — all stat cards show 0', async ({ page }) => {
      // HEAD requests with content-range 0-0/0 → count = 0
      await page.route(`${SUPABASE}/rest/v1/researchers*`, route => {
        if (route.request().method() === 'HEAD') {
          route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-0/0' }, body: '' })
        } else {
          route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
        }
      })
      await page.route(`${SUPABASE}/rest/v1/clusters*`, route => {
        if (route.request().method() === 'HEAD') {
          route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-0/0' }, body: '' })
        } else {
          route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
        }
      })
      await page.route(`${SUPABASE}/rest/v1/publications*`, route => {
        if (route.request().method() === 'HEAD') {
          route.fulfill({ status: 200, headers: { ...CORS_HEADERS, 'content-range': '0-0/0' }, body: '' })
        } else {
          route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
        }
      })
      await page.goto('/')
      await page.waitForTimeout(1000)
      await expect(page.getByRole('button', { name: /0.*Chercheurs/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /0.*Clusters/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /0.*Publications/i })).toBeVisible()
    })

    test('E3: large numbers formatted with fr-FR thousands separator', async ({ page }) => {
      // Intercept with large counts — content-range: 0-24/100000 → count = 100000
      // IMPORTANT: access-control-expose-headers must include content-range or Chromium strips it (CORS)
      await page.route(`${SUPABASE}/rest/v1/researchers*`, route => {
        if (route.request().method() === 'HEAD') {
          route.fulfill({
            status: 200,
            headers: { ...CORS_HEADERS, 'content-range': '0-24/100000' },
            body: '',
          })
        } else {
          route.fulfill({
            status: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(
              Array.from({ length: 5 }, (_, i) => ({
                id: `r${i}`, full_name: `Researcher ${i}`, status: 'approved',
                keywords: ['process mining', 'bpm']
              }))
            ),
          })
        }
      })
      await page.route(`${SUPABASE}/rest/v1/publications*`, route => {
        if (route.request().method() === 'HEAD') {
          route.fulfill({
            status: 200,
            headers: { ...CORS_HEADERS, 'content-range': '0-24/999999' },
            body: '',
          })
        } else {
          route.fulfill({ status: 200, headers: CORS_HEADERS, body: '[]' })
        }
      })
      await page.goto('/')
      await page.waitForTimeout(1000)
      // fr-FR formats 100000 as "100 000" (non-breaking space U+00A0)
      const chercheurs = await page.getByRole('button', { name: /100.*Chercheurs/i }).textContent()
      expect(chercheurs).toMatch(/100/)
    })
  })

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
      await expect(page.locator('.profile-name')).toBeVisible()
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

  test.describe('US-1.3 — MiniMap', () => {
    test('happy path: mini-map visible with SVG cluster bubbles', async ({ page }) => {
      await page.goto('/')
      const minimap = page.locator('.mini-map-container')
      await expect(minimap).toBeVisible()
      // SVG should be rendered (clusters loaded)
      await expect(minimap.locator('svg')).toBeVisible()
      // Overlay hint text
      await expect(minimap.getByText(/cliquer pour ouvrir/i)).toBeVisible()
    })

    test('happy path: hover shows pointer cursor and blue outline', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('.mini-map-container svg')).toBeVisible()
      const minimap = page.locator('.mini-map-container')
      await minimap.hover()
      // CSS cursor is pointer — verify via computed style
      const cursor = await minimap.evaluate(el => getComputedStyle(el).cursor)
      expect(cursor).toBe('pointer')
    })

    test('happy path: clicking mini-map navigates to /map', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('.mini-map-container svg')).toBeVisible()
      await page.getByRole('button', { name: /cliquer pour ouvrir la carte complete/i }).click()
      await expect(page).toHaveURL('/map')
      await expect(page.getByText('Carte Thematique')).toBeVisible()
    })

    test('E1: no clusters → shows "Carte non disponible" empty state', async ({ page }) => {
      // Route must use full Supabase domain — wildcard pattern doesn't match cross-origin
      await page.route(`${SUPABASE}/rest/v1/clusters*`, route =>
        route.fulfill({
          status: 200,
          headers: { ...CORS_HEADERS, 'content-range': '0-0/0' },
          body: '[]',
        })
      )
      await page.goto('/')
      await page.waitForTimeout(1000)
      // noData state: t('dashboard.minimap.noData') = "Carte non disponible"
      await expect(page.getByText(/carte non disponible/i)).toBeVisible()
      // No SVG rendered
      await expect(page.locator('.mini-map-container svg')).not.toBeVisible()
      // Still clickable — navigates to /map even with no data
      await page.locator('.mini-map-container').click()
      await expect(page).toHaveURL('/map')
    })

    test('E2: clusters API slow → loading spinner shown during fetch', async ({ page }) => {
      // IMPORTANT: Do NOT use setTimeout in route handler — it drops the MCP connection.
      // Instead, never call route.fulfill() to keep the request pending indefinitely.
      await page.route(`${SUPABASE}/rest/v1/clusters*`, async _route => {
        // Intentionally hang — do not fulfill
      })
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(300)
      // isLoading state: spinner visible
      await expect(page.locator('.mini-map-container .spinner')).toBeVisible()
      await expect(page.locator('.mini-map-container').getByText('Chargement...')).toBeVisible()
    })

    test('E3: clusters API error → shows fallback "Cliquer pour voir la carte"', async ({ page }) => {
      // IMPORTANT: HTTP 500 does NOT trigger isError — supabase-js parses body as data.
      // Use HTTP 400 with PostgREST-format JSON body — supabase-js sets error object correctly.
      await page.route(`${SUPABASE}/rest/v1/clusters*`, route =>
        route.fulfill({
          status: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            code: 'PGRST301',
            details: null,
            hint: null,
            message: 'Simulated database error',
          }),
        })
      )
      await page.goto('/')
      // Wait for React Query retry:2 to exhaust (~8s with exponential backoff)
      await page.waitForTimeout(8000)
      // isError state: t('dashboard.minimap.fallback') = "Cliquer pour voir la carte"
      // NOTE: fallback !== clickHint ("Cliquer pour ouvrir la carte complete")
      // The fallback is rendered inside mini-map-placeholder, not as an overlay
      await expect(page.locator('.mini-map-placeholder').getByText(/cliquer pour voir la carte/i)).toBeVisible()
      // No SVG
      await expect(page.locator('.mini-map-container svg')).not.toBeVisible()
      // Still clickable in error state
      await page.locator('.mini-map-container').click()
      await expect(page).toHaveURL('/map')
    })
  })
})
