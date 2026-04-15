# M1 Exploration Plan — Setup + Dashboard

## US-1.1: Dashboard Stats Display

### Happy Path
**Mockup reference:** `screen-dashboard` — `stat-grid` with 4 `stat-card` elements.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/` (dashboard) | Dashboard page loads with heading "Tableau de Bord" | `US-1.1-01-dashboard-loaded.png` |
| 2 | Observe the stat grid area | 4 stat cards visible: Chercheurs, Themes, Clusters, Publications | `US-1.1-02-stat-cards-visible.png` |
| 3 | Verify stat card values | Each card shows a numeric value > 0 and a label | `US-1.1-03-stat-values.png` |
| 4 | Click the "Chercheurs" stat card | Navigates to `/researchers` page | `US-1.1-04-click-chercheurs-card.png` |
| 5 | Navigate back to dashboard | Dashboard loads again | `US-1.1-05-back-to-dashboard.png` |
| 6 | Click the "Themes" stat card | Navigates to `/themes` page | `US-1.1-06-click-themes-card.png` |

### Edge Case E1: API Unreachable
**Mockup reference:** `screen-dashboard` — stat cards area when API fails.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/stats` with `page.route('**/api/stats', r => r.abort())` | Request is blocked | `US-1.1-E1-01-intercept-set.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.1-E1-02-dashboard-loading.png` |
| 3 | Observe the stat grid area | Loading skeletons or error state visible instead of numbers | `US-1.1-E1-03-error-state.png` |
| 4 | Look for a retry mechanism | A "Reessayer" button or link is visible | `US-1.1-E1-04-retry-visible.png` |

### Edge Case E2: Empty Database
**Mockup reference:** `screen-dashboard` — stat cards with zero values.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/stats` with `page.route('**/api/stats', r => r.fulfill({ status: 200, body: JSON.stringify({ researchers: 0, themes: 0, clusters: 0, publications: 0 }) }))` | Returns zero counts | `US-1.1-E2-01-intercept-zeros.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.1-E2-02-dashboard-loaded.png` |
| 3 | Observe stat cards | All cards display "0" | `US-1.1-E2-03-zero-stats.png` |
| 4 | Check for empty state message | "Aucune donnee disponible" or similar message visible | `US-1.1-E2-04-empty-message.png` |

### Edge Case E3: Large Numbers
**Mockup reference:** `screen-dashboard` — stat cards with large formatted numbers.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/stats` with `page.route('**/api/stats', r => r.fulfill({ status: 200, body: JSON.stringify({ researchers: 100000, themes: 500, clusters: 50, publications: 999999 }) }))` | Returns large numbers | `US-1.1-E3-01-intercept-large.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.1-E3-02-dashboard-loaded.png` |
| 3 | Observe stat cards | Numbers formatted with thousands separators (e.g., "100 000") | `US-1.1-E3-03-formatted-numbers.png` |

---

## US-1.2: Recent Activity Feed

### Happy Path
**Mockup reference:** `screen-dashboard` — `recent-activity` card with `activity-item` rows.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/` | Dashboard loads | `US-1.2-01-dashboard-loaded.png` |
| 2 | Scroll to the activity section | "Activite Recente" heading visible with activity items below | `US-1.2-02-activity-section.png` |
| 3 | Count activity items | At most 5 items visible, each with avatar, name, action, timestamp | `US-1.2-03-activity-items.png` |
| 4 | Verify sort order | First item has the most recent timestamp | `US-1.2-04-sort-order.png` |
| 5 | Click a researcher name in the feed | Navigates to that researcher's profile page | `US-1.2-05-click-name.png` |

### Edge Case E1: No Activities
**Mockup reference:** `screen-dashboard` — empty activity section.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/activity` with `page.route('**/api/activity', r => r.fulfill({ status: 200, body: '[]' }))` | Returns empty array | `US-1.2-E1-01-intercept-empty.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.2-E1-02-dashboard-loaded.png` |
| 3 | Observe activity section | "Aucune activite recente" message displayed | `US-1.2-E1-03-empty-state.png` |

### Edge Case E2: Activity API Failure
**Mockup reference:** `screen-dashboard` — activity section with error.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/activity` with `page.route('**/api/activity', r => r.fulfill({ status: 500, body: 'Internal Server Error' }))` | Returns server error | `US-1.2-E2-01-intercept-error.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.2-E2-02-dashboard-loaded.png` |
| 3 | Observe activity section | Error message visible with retry link | `US-1.2-E2-03-error-retry.png` |

### Edge Case E3: Deleted Researcher in Activity
**Mockup reference:** `screen-dashboard` — activity item with non-clickable name.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/activity` returning an activity whose researcher no longer exists (null profile link) | Activity with deleted researcher | `US-1.2-E3-01-intercept-deleted.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.2-E3-02-dashboard-loaded.png` |
| 3 | Observe the activity with the deleted researcher | Name is grayed out and non-clickable, shows "(profil supprime)" | `US-1.2-E3-03-deleted-name.png` |

---

## US-1.3: Mini-Map Preview

### Happy Path
**Mockup reference:** `screen-dashboard` — `mini-map-container` with Three.js WebGL nebula and overlay text.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/` | Dashboard loads | `US-1.3-01-dashboard-loaded.png` |
| 2 | Observe the mini-map area | Three.js nebula preview of clusters visible (glowing spheres on dark background) with overlay "Cliquer pour ouvrir la carte complete" | `US-1.3-02-mini-map-visible.png` |
| 3 | Hover over the mini-map | Cursor changes to pointer, blue outline appears around the container | `US-1.3-03-hover-effect.png` |
| 4 | Click the mini-map | Navigates to `/map` (full thematic map screen) | `US-1.3-04-navigated-to-map.png` |

### Edge Case E1: No Clusters
**Mockup reference:** `screen-dashboard` — mini-map placeholder.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/clusters` with `page.route('**/api/clusters', r => r.fulfill({ status: 200, body: '[]' }))` | Returns empty clusters | `US-1.3-E1-01-intercept-empty.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.3-E1-02-dashboard-loaded.png` |
| 3 | Observe mini-map area | Placeholder shows "Carte non disponible" | `US-1.3-E1-03-placeholder.png` |

### Edge Case E2: Slow API (>3s)
**Mockup reference:** `screen-dashboard` — mini-map loading state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/clusters` with a 5-second delay: `page.route('**/api/clusters', async r => { await new Promise(res => setTimeout(res, 5000)); r.fulfill({ status: 200, body: '[]' }); })` | Delayed response | `US-1.3-E2-01-intercept-slow.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.3-E2-02-dashboard-loaded.png` |
| 3 | Observe mini-map area immediately | Loading spinner visible | `US-1.3-E2-03-loading-spinner.png` |

### Edge Case E3: API Error / WebGL Unavailable
**Mockup reference:** `screen-dashboard` — mini-map fallback.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/clusters` with malformed JSON: `page.route('**/api/clusters', r => r.fulfill({ status: 200, body: '{malformed}' }))` | Returns invalid data | `US-1.3-E3-01-intercept-malformed.png` |
| 2 | Navigate to `/` | Dashboard loads | `US-1.3-E3-02-dashboard-loaded.png` |
| 3 | Observe mini-map area | Fallback message "Cliquer pour voir la carte" visible | `US-1.3-E3-03-fallback.png` |
