# M1 Exploration Log — CartoPM Dashboard

**Date:** 2026-04-13  
**Agent:** Builder (claude-sonnet-4-6) — Redo Pass  
**App:** http://localhost:5199  

---

## US-1.1 — Stat Grid (Global Statistics)

### Happy Path (6 screenshots)

| Step | File | Observation |
|------|------|-------------|
| 1 — navigate to / | `US-1.1-01-dashboard-loaded.png` | "Tableau de Bord" heading, 4-col stat grid |
| 2 — observe stat grid | `US-1.1-02-stat-cards-visible.png` | 4 cards visible: Chercheurs, Themes, Clusters, Publications |
| 3 — verify values | `US-1.1-03-stat-values.png` | 5 / 14 / 4 / 7 from seed data |
| 4 — click Chercheurs | `US-1.1-04-click-chercheurs-card.png` | Navigated to /researchers |
| 5 — back to dashboard | `US-1.1-05-back-to-dashboard.png` | Dashboard re-renders cleanly |
| 6 — click Themes | `US-1.1-06-click-themes-card.png` | Navigated to /themes, expandable cluster cards |

### Edge Case E1: API Unreachable (4 screenshots)

| Step | File | Observation |
|------|------|-------------|
| 1 — intercept set | `US-1.1-E1-01-intercept-set.png` | Route intercepted (abort) |
| 2 — navigate to / | `US-1.1-E1-02-dashboard-loading.png` | Loading state during React Query retry |
| 3 — error state | `US-1.1-E1-03-error-state.png` | "Impossible de charger les statistiques" |
| 4 — retry visible | `US-1.1-E1-04-retry-visible.png` | "Reessayer" button present |

### Edge Case E2: Empty Database (4 screenshots)

| Step | File | Observation |
|------|------|-------------|
| 1 — intercept zeros | `US-1.1-E2-01-intercept-zeros.png` | Routes returning 0 counts active |
| 2 — navigate to / | `US-1.1-E2-02-dashboard-loaded.png` | All 4 cards show 0 |
| 3 — zero stats | `US-1.1-E2-03-zero-stats.png` | Cards confirmed: 0 Chercheurs / 0 Themes / 0 Clusters / 0 Publications |
| 4 — empty message | `US-1.1-E2-04-empty-message.png` | "Aucune donnee disponible" highlighted between stat grid and content area |

### Edge Case E3: Large Numbers (3 screenshots)

**Technical note:** Supabase-js reads `content-range` header from HEAD responses but Chromium strips non-safelisted CORS headers. Fix: add `access-control-expose-headers: content-range` to mocked fulfillments. This enabled real page.route() interception — no DOM injection.

| Step | File | Observation |
|------|------|-------------|
| 1 — intercept set | `US-1.1-E3-01-intercept-large.png` | researchers=100000, clusters=50, publications=999999 live |
| 2 — dashboard loaded | `US-1.1-E3-02-dashboard-loaded.png` | "100 000 Chercheurs" / "999 999 Publications" visible |
| 3 — formatted numbers | `US-1.1-E3-03-formatted-numbers.png` | fr-FR thousands separator (non-breaking space) confirmed; stat values outlined |


---

## US-1.2 — Recent Activity Feed

### Bug Found and Fixed During Exploration
`ActivityFeed.tsx` always navigated to `/researchers` (list). Fix: `useActivity.ts` now joins `researchers` by `full_name` to get `researcher_id` UUID; `ActivityFeed.tsx` uses `navigate(/researchers/${item.researcher_id})` when set.

### Happy Path (5 screenshots)

| Step | File | Observation |
|------|------|-------------|
| 1 — navigate to / | `US-1.2-01-dashboard-loaded.png` | Dashboard loads with activity section visible |
| 2 — scroll to activity | `US-1.2-02-activity-section.png` | "Activite Recente" heading, 5 items with avatars |
| 3 — count items | `US-1.2-03-activity-items.png` | 5 items outlined; each has coloured avatar initials, blue name button, action text, grey timestamp |
| 4 — verify sort order | `US-1.2-04-sort-order.png` | First item "il y a 2h" highlighted (most recent); last item "il y a 3j" (oldest) |
| 5 — click researcher name | `US-1.2-05-click-name.png` | Clicked "Marie Dupont" → `/researchers/22222222-0000-0000-0000-000000000001`; profile shows MD avatar, keywords, publications |

### Edge Case E1: No Activities (3 screenshots)

| Step | File | Observation |
|------|------|-------------|
| 1 — intercept set | `US-1.2-E1-01-intercept-empty.png` | Route returns `[]`; banner confirms intercept active |
| 2 — navigate to / | `US-1.2-E1-02-dashboard-loaded.png` | Dashboard loads; activity section shows empty state |
| 3 — empty state | `US-1.2-E1-03-empty-state.png` | "Aucune activite recente" highlighted; no list rendered |

### Edge Case E2: Activity API Failure (3 screenshots)

| Step | File | Observation |
|------|------|-------------|
| 1 — intercept set | `US-1.2-E2-01-intercept-error.png` | Route returns 500; banner confirms |
| 2 — navigate to / | `US-1.2-E2-02-dashboard-loaded.png` | After retry exhaustion: error message + "Reessayer" button |
| 3 — error + retry | `US-1.2-E2-03-error-retry.png` | Error message and "Reessayer" highlighted; stat grid and mini-map unaffected |

### Edge Case E3: Deleted Researcher (3 screenshots)

| Step | File | Observation |
|------|------|-------------|
| 1 — intercept set | `US-1.2-E3-01-intercept-deleted.png` | Route returns entry with `null` user_name |
| 2 — navigate to / | `US-1.2-E3-02-dashboard-loaded.png` | Greyed "UI" avatar, "Utilisateur inconnu (profil supprime)", no clickable button |
| 3 — deleted name | `US-1.2-E3-03-deleted-name.png` | `.activity-name.deleted` span outlined; confirms non-interactive, italic label |


---

## US-1.3 — Thematic Mini-Map Preview

### Happy Path
- Navigated to `/` with real cluster data loaded
- Mini-map SVG cluster preview visible with coloured circles and dots
- Hover applied via `browser_hover` on mini-map container → pointer cursor, blue outline confirmed
- Clicked mini-map → navigated to `/map` successfully
- All 4 screenshots captured step-by-step

**Observations:**
- SVG renders clusters as coloured circles with white dot members
- Overlay text "Cliquer pour ouvrir la carte complete" appears on hover (via CSS)
- Click handler navigates to `/map` correctly
- `role="button"` + `tabIndex={0}` accessible

### E1 — No Clusters (Empty Data)
- Route set: `clusters?select=*` returns `[]` with `content-range: 0-0/0`
- Dashboard shows "0 Clusters" in stat card
- Mini-map shows `noData` state: "Carte non disponible"
- Mini-map still clickable → navigates to `/map` (graceful degradation)

**Observations:**
- `isError` is false, `clusters.length === 0` branch triggers
- Stat card also shows 0 independently
- Each dashboard section has independent data state

### E2 — Loading Spinner (Slow Network)
- Route set: `clusters` requests hang (never fulfill) using `page.route()` with no `route.fulfill()` call
- Approach: HANG route instead of setTimeout (setTimeout in route handler drops MCP connection)
- Navigated fresh after reload → React Query enters loading state immediately
- Mini-map shows real spinner component: `<LoadingSpinner message="Chargement..." />`
- Stat cards also show skeleton loaders (gray rectangles)
- All 3 screenshots: intercept config, dashboard in loading state, mini-map spinner highlighted

**Observations:**
- HANG route (no fulfill) is a reliable technique for capturing loading states without MCP connection issues
- Loading states are per-query — each component loads independently
- Real spinner verified in DOM: `<div class="spinner" aria-hidden="true"></div><span>Chargement...</span>`

### E3 — Error/Fallback State (Malformed/Failed Response)
- Route set: `clusters` requests return HTTP 400 with PostgREST-style error body
- supabase-js parses 400 as `{ data: null, error: { message: '...' } }` → `fetchClusters` throws
- React Query retries 2 times then sets `isError: true`
- Mini-map shows `isError` branch: `t('dashboard.minimap.fallback')` = "Cliquer pour voir la carte"
- Note: `fallback` ("Cliquer pour voir la carte") ≠ `clickHint` ("Cliquer pour ouvrir la carte complete") ≠ `noData` ("Carte non disponible") — three distinct states
- Mini-map still clickable in error state → navigates to `/map` (graceful degradation verified)

**Observations:**
- HTTP 500 did NOT trigger error state — supabase-js treated body as data
- HTTP 400 with PostgREST-format JSON body correctly triggers `error` object
- Network abort (ERR_FAILED) also triggers retries but supabase-js behavior inconsistent
- After retries exhausted (~8s with retry:2), `isError` becomes true and fallback renders
- Stat card shows "0 Clusters" because `useStats` count query also fails gracefully (returns 0)

