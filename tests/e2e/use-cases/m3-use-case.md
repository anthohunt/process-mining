# M3 Exploration Plan — Thematic Map & Themes

## US-3.1: Interactive Cluster Map

### Happy Path
**Mockup reference:** `screen-map` — `map-container` with SVG, `map-filter-panel`, `map-legend`.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/map` | Map screen loads with dark background container | `US-3.1-01-map-loaded.png` |
| 2 | Observe the SVG area | Colored cluster regions and researcher dots visible | `US-3.1-02-clusters-visible.png` |
| 3 | Observe the filter panel | Floating panel at top-left with Theme dropdown, Lab dropdown, and "Appliquer" button | `US-3.1-03-filter-panel.png` |
| 4 | Observe the legend | Bottom-right legend lists cluster colors with theme names | `US-3.1-04-legend.png` |
| 5 | Scroll to zoom in on the map | Map zooms in, clusters and dots get larger | `US-3.1-05-zoom-in.png` |
| 6 | Click and drag to pan | Map viewport pans to show different area | `US-3.1-06-pan.png` |
| 7 | Select "Process Discovery" in the theme filter and click "Appliquer" | Only the Process Discovery cluster and its researchers remain visible | `US-3.1-07-filter-applied.png` |
| 8 | Click "Vue en liste" cross-nav button (top-right) | Navigates to `/themes` | `US-3.1-08-crossnav-list.png` |

### Edge Case E1: No Clusters
**Mockup reference:** `screen-map` — empty map.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/clusters` with `page.route('**/api/clusters', r => r.fulfill({ status: 200, body: '[]' }))` | Empty clusters | `US-3.1-E1-01-intercept.png` |
| 2 | Navigate to `/map` | Map loads | `US-3.1-E1-02-map-loaded.png` |
| 3 | Observe the map area | "Aucun cluster disponible" message centered on the dark background | `US-3.1-E1-03-empty-state.png` |

### Edge Case E2: Max Zoom Reached
**Mockup reference:** `screen-map` — zoomed map.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/map` | Map loads with clusters | `US-3.1-E2-01-map-loaded.png` |
| 2 | Scroll to zoom in repeatedly (10+ times) | Map zooms progressively | `US-3.1-E2-02-zooming.png` |
| 3 | Attempt one more zoom in | Zoom is capped; view does not change further | `US-3.1-E2-03-max-zoom.png` |

### Edge Case E3: API Timeout
**Mockup reference:** `screen-map` — error overlay.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/clusters` with `page.route('**/api/clusters', r => r.fulfill({ status: 504 }))` | Gateway timeout | `US-3.1-E3-01-intercept.png` |
| 2 | Navigate to `/map` | Map loads | `US-3.1-E3-02-map-loaded.png` |
| 3 | Observe the map area | "Chargement echoue" centered with retry button | `US-3.1-E3-03-error-retry.png` |

---

## US-3.2: Cluster Click for Members

### Happy Path
**Mockup reference:** `screen-map` — cluster region click opens popover with member list.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/map` | Map loads with clusters | `US-3.2-01-map-loaded.png` |
| 2 | Click on the "Process Discovery" cluster region | A popover appears listing member researchers | `US-3.2-02-popover-open.png` |
| 3 | Observe the popover content | Theme tags shown (Alpha Miner, Heuristic Miner, etc.) and researcher names as links | `US-3.2-03-popover-content.png` |
| 4 | Click a researcher name in the popover (e.g., "Dr. Marie Dupont") | Navigates to that researcher's profile | `US-3.2-04-navigate-profile.png` |

### Edge Case E1: Cluster with 50+ Members
**Mockup reference:** `screen-map` — truncated popover.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept cluster data to include 55 members in one cluster | Large member list | `US-3.2-E1-01-intercept.png` |
| 2 | Click that cluster on the map | Popover opens | `US-3.2-E1-02-popover-open.png` |
| 3 | Observe the popover | Shows first 10 members with "et 45 autres" link/scroll | `US-3.2-E1-03-truncated.png` |

### Edge Case E2: Click Outside to Close
**Mockup reference:** `screen-map` — popover dismiss.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Open a cluster popover by clicking a cluster | Popover visible | `US-3.2-E2-01-popover-open.png` |
| 2 | Click on the dark map background outside the popover | Popover closes | `US-3.2-E2-02-popover-closed.png` |

### Edge Case E3: Loading State in Popover
**Mockup reference:** `screen-map` — popover spinner.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept cluster members endpoint with 3-second delay | Slow member data | `US-3.2-E3-01-intercept.png` |
| 2 | Click a cluster on the map | Popover opens | `US-3.2-E3-02-popover-open.png` |
| 3 | Observe the popover while loading | Loading spinner visible inside popover | `US-3.2-E3-03-loading.png` |

---

## US-3.3: Researcher Dot to Profile

### Happy Path
**Mockup reference:** `screen-map` — SVG researcher dots, hover tooltip, click navigation.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/map` | Map loads with researcher dots | `US-3.3-01-map-loaded.png` |
| 2 | Hover over a researcher dot | Tooltip shows the researcher's name, cursor changes to pointer | `US-3.3-02-hover-tooltip.png` |
| 3 | Click the researcher dot | Navigates to that researcher's profile page | `US-3.3-03-navigate-profile.png` |

### Edge Case E1: Overlapping Dots
**Mockup reference:** `screen-map` — disambiguation popover.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept cluster data so two researchers share the same x/y position | Overlapping dots | `US-3.3-E1-01-intercept.png` |
| 2 | Click on the overlapping dots | A disambiguation popover lists both names | `US-3.3-E1-02-disambiguation.png` |
| 3 | Click one of the names | Navigates to that specific researcher's profile | `US-3.3-E1-03-selected.png` |

### Edge Case E2: Profile Data Unavailable
**Mockup reference:** `screen-map` — toast on click.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/researchers/:id` with `page.route('**/api/researchers/**', r => r.fulfill({ status: 500 }))` | Profile fails | `US-3.3-E2-01-intercept.png` |
| 2 | Click a researcher dot | Attempts navigation | `US-3.3-E2-02-click-dot.png` |
| 3 | Observe | Toast "Profil indisponible" appears | `US-3.3-E2-03-toast.png` |

### Edge Case E3: Minimum Touch Target at Full Zoom Out
**Mockup reference:** `screen-map` — zoomed out dots.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/map` and zoom out fully | Map at minimum zoom | `US-3.3-E3-01-zoomed-out.png` |
| 2 | Inspect researcher dot element size | Dot has minimum 24x24px clickable area regardless of visual size | `US-3.3-E3-02-touch-target.png` |

---

## US-3.4: Theme List View

### Happy Path
**Mockup reference:** `screen-themes` — `theme-clusters` grid of expandable `cluster-card` elements.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/themes` | Theme explorer loads with heading "Explorer les Themes" | `US-3.4-01-themes-loaded.png` |
| 2 | Observe the cluster card grid | Cards for Process Discovery, Conformance Checking, Predictive Monitoring, Data Quality, Process Enhancement | `US-3.4-02-card-grid.png` |
| 3 | Observe a single card | Shows cluster name, researcher count, sub-theme tags, color-coded left border | `US-3.4-03-card-detail.png` |
| 4 | Click on "Process Discovery" card | Card expands to show member researcher names as clickable links | `US-3.4-04-expanded.png` |
| 5 | Click a researcher name (e.g., "Dr. Marie Dupont (LORIA)") | Navigates to that researcher's profile | `US-3.4-05-navigate-profile.png` |
| 6 | Click "Voir tous les chercheurs" link in expanded card | Navigates to `/researchers` (filtered by that theme) | `US-3.4-06-crossnav-researchers.png` |
| 7 | Navigate back and click "Voir sur la carte" button (top of page) | Navigates to `/map` | `US-3.4-07-crossnav-map.png` |

### Edge Case E1: No Themes
**Mockup reference:** `screen-themes` — empty state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/clusters` with empty array | No clusters | `US-3.4-E1-01-intercept.png` |
| 2 | Navigate to `/themes` | Page loads | `US-3.4-E1-02-loaded.png` |
| 3 | Observe content | "Aucun theme disponible" centered empty state | `US-3.4-E1-03-empty-state.png` |

### Edge Case E2: Cluster with Zero Researchers
**Mockup reference:** `screen-themes` — card with "0 chercheurs".

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept cluster data to include a cluster with 0 members | Empty cluster | `US-3.4-E2-01-intercept.png` |
| 2 | Navigate to `/themes` | Page loads | `US-3.4-E2-02-loaded.png` |
| 3 | Observe the empty cluster card | Shows "0 chercheurs" and is not expandable (no member list) | `US-3.4-E2-03-zero-members.png` |

### Edge Case E3: Malformed API Response
**Mockup reference:** `screen-themes` — error state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/clusters` with `page.route('**/api/clusters', r => r.fulfill({ status: 200, body: '{malformed}' }))` | Bad JSON | `US-3.4-E3-01-intercept.png` |
| 2 | Navigate to `/themes` | Page loads | `US-3.4-E3-02-loaded.png` |
| 3 | Observe content | "Erreur de chargement des themes" with retry button | `US-3.4-E3-03-error.png` |

---

## US-1.4: Detailed Statistics

### Happy Path
**Mockup reference:** `screen-stats` — `bar-chart-svg`, `line-chart-svg`, `histogram-svg`.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/stats` | Stats page loads with heading "Statistiques Detaillees" | `US-1.4-01-stats-loaded.png` |
| 2 | Verify breadcrumb | "Dashboard > Statistiques detaillees" breadcrumb visible | `US-1.4-02-breadcrumb.png` |
| 3 | Observe the bar chart | Bar chart shows theme distribution (theme names on x-axis, counts on y-axis) | `US-1.4-03-bar-chart.png` |
| 4 | Hover over a bar | Tooltip shows exact count for that theme | `US-1.4-04-bar-tooltip.png` |
| 5 | Observe the line chart | Line chart shows temporal trends (time on x-axis, count on y-axis) | `US-1.4-05-line-chart.png` |
| 6 | Observe the histogram | Histogram shows similarity score distribution (score ranges on x-axis, frequency on y-axis) | `US-1.4-06-histogram.png` |
| 7 | Click "Dashboard" in breadcrumb | Navigates back to dashboard | `US-1.4-07-back-dashboard.png` |

### Edge Case E1: No Data for Charts
**Mockup reference:** `screen-stats` — empty chart states.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/stats/detailed` with empty data arrays | No chart data | `US-1.4-E1-01-intercept.png` |
| 2 | Navigate to `/stats` | Page loads | `US-1.4-E1-02-loaded.png` |
| 3 | Observe charts | All three show "Pas assez de donnees pour generer ce graphique" | `US-1.4-E1-03-empty-charts.png` |

### Edge Case E2: Only 1 Researcher (No Similarity Possible)
**Mockup reference:** `screen-stats` — histogram specific empty state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept stats API returning 1 researcher and empty similarity data | Insufficient data | `US-1.4-E2-01-intercept.png` |
| 2 | Navigate to `/stats` | Page loads | `US-1.4-E2-02-loaded.png` |
| 3 | Observe histogram | "Au moins 2 chercheurs requis pour calculer la similarite" message | `US-1.4-E2-03-histogram-message.png` |

### Edge Case E3: Malformed Stats Data
**Mockup reference:** `screen-stats` — error state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/stats/detailed` with `page.route('**/api/stats/detailed', r => r.fulfill({ status: 200, body: '{malformed}' }))` | Bad JSON | `US-1.4-E3-01-intercept.png` |
| 2 | Navigate to `/stats` | Page loads | `US-1.4-E3-02-loaded.png` |
| 3 | Observe charts | "Erreur de chargement" with retry link shown for each chart | `US-1.4-E3-03-error-state.png` |
