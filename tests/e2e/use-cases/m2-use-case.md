# M2 Exploration Plan — Researchers & Profiles

## US-2.1: Researcher Search & Filter

### Happy Path
**Mockup reference:** `screen-researchers` — `search-bar` with text input, `filter-lab`, `filter-theme`, `researcher-table`.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/researchers` | Researcher list page loads with heading "Chercheurs" | `US-2.1-01-list-loaded.png` |
| 2 | Observe the table | Table shows researchers with columns: Nom, Laboratoire, Themes, Publications, Actions | `US-2.1-02-table-visible.png` |
| 3 | Type "Dupont" in the search field | Table filters to show only Dr. Marie Dupont | `US-2.1-03-search-text.png` |
| 4 | Clear search, select "LORIA" from lab dropdown | Table filters to show only researchers from LORIA | `US-2.1-04-filter-lab.png` |
| 5 | Additionally select "Process Discovery" from theme dropdown | Table filters with AND logic (LORIA + Process Discovery) | `US-2.1-05-combined-filters.png` |
| 6 | Click "Explorer par theme" cross-nav button | Navigates to `/themes` | `US-2.1-06-crossnav-themes.png` |

### Edge Case E1: No Results
**Mockup reference:** `screen-researchers` — empty table state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/researchers` | List loads | `US-2.1-E1-01-list-loaded.png` |
| 2 | Type "xyznonexistent" in the search field | No matches | `US-2.1-E1-02-type-query.png` |
| 3 | Observe the table | "Aucun resultat" message with suggestion to adjust filters | `US-2.1-E1-03-no-results.png` |

### Edge Case E2: API Failure
**Mockup reference:** `screen-researchers` — error replacing table.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/researchers` with `page.route('**/api/researchers**', r => r.abort())` | API blocked | `US-2.1-E2-01-intercept.png` |
| 2 | Navigate to `/researchers` | Page loads | `US-2.1-E2-02-page-loading.png` |
| 3 | Observe the content area | Error message replaces table with retry button | `US-2.1-E2-03-error-state.png` |

### Edge Case E3: Special Characters in Search
**Mockup reference:** `screen-researchers` — search input.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/researchers` | List loads | `US-2.1-E3-01-list-loaded.png` |
| 2 | Type `<script>alert('xss')</script>` in the search field | Input is sanitized | `US-2.1-E3-02-xss-input.png` |
| 3 | Observe the page | No XSS execution, search treats it as plain text, no results shown | `US-2.1-E3-03-sanitized.png` |

---

## US-2.2: Researcher Profile View

### Happy Path
**Mockup reference:** `screen-profile` — `profile-layout` with sidebar + keywords + publications.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/researchers` | List loads | `US-2.2-01-list-loaded.png` |
| 2 | Click "Voir" on Dr. Marie Dupont's row | Navigates to profile page | `US-2.2-02-click-voir.png` |
| 3 | Observe the profile sidebar | Avatar with initials "MD", name "Dr. Marie Dupont", lab "LORIA", bio text | `US-2.2-03-sidebar.png` |
| 4 | Observe the keywords card | Tags displayed: Process Discovery, Conformance Checking, etc. | `US-2.2-04-keywords.png` |
| 5 | Observe the publications list | Publications with title, co-authors, venue/year | `US-2.2-05-publications.png` |
| 6 | Verify breadcrumb | "Chercheurs > Profil" breadcrumb visible | `US-2.2-06-breadcrumb.png` |
| 7 | Click "Chercheurs" in breadcrumb | Navigates back to researcher list | `US-2.2-07-breadcrumb-back.png` |

### Edge Case E1: No Publications
**Mockup reference:** `screen-profile` — publications card empty state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept researcher API to return a profile with empty publications array | Profile with no pubs | `US-2.2-E1-01-intercept.png` |
| 2 | Navigate to that profile | Profile loads | `US-2.2-E1-02-profile-loaded.png` |
| 3 | Observe publications section | "Aucune publication enregistree" message | `US-2.2-E1-03-no-pubs.png` |

### Edge Case E2: Profile 404
**Mockup reference:** `screen-profile` — error state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/researchers/:id` with `page.route('**/api/researchers/**', r => r.fulfill({ status: 404 }))` | 404 response | `US-2.2-E2-01-intercept-404.png` |
| 2 | Navigate to `/researchers/nonexistent-id` | Page loads | `US-2.2-E2-02-loading.png` |
| 3 | Observe the content | "Profil introuvable" message with link back to list | `US-2.2-E2-03-not-found.png` |

### Edge Case E3: Very Long Bio
**Mockup reference:** `screen-profile` — bio truncation.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept researcher API returning a bio with 3000 characters | Long bio profile | `US-2.2-E3-01-intercept.png` |
| 2 | Navigate to profile | Profile loads | `US-2.2-E3-02-profile-loaded.png` |
| 3 | Observe the bio area | Bio is truncated with "Lire la suite" link | `US-2.2-E3-03-truncated-bio.png` |
| 4 | Click "Lire la suite" | Full bio is revealed | `US-2.2-E3-04-expanded-bio.png` |

---

## US-2.4: Side-by-Side Comparison

### Happy Path
**Mockup reference:** `screen-comparison` — `comparison-layout` with gauge and common themes.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to a researcher's profile | Profile loads | `US-2.4-01-profile-loaded.png` |
| 2 | Click "Comparer" button | Navigates to comparison page | `US-2.4-02-comparison-page.png` |
| 3 | Select a second researcher for comparison | Second researcher chosen | `US-2.4-03-second-selected.png` |
| 4 | Observe the comparison layout | Two profiles in columns with similarity gauge in center | `US-2.4-04-layout.png` |
| 5 | Observe the similarity gauge | Circular gauge shows percentage (e.g., 72%) | `US-2.4-05-gauge.png` |
| 6 | Observe common themes | Shared themes highlighted with blue outline on both sides | `US-2.4-06-common-themes.png` |
| 7 | Observe summary card | Summary section at bottom lists shared themes with explanation | `US-2.4-07-summary.png` |

### Edge Case E1: Zero Common Themes
**Mockup reference:** `screen-comparison` — gauge at 0%.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept similarity API to return `{ score: 0, common_themes: [] }` | Zero similarity | `US-2.4-E1-01-intercept.png` |
| 2 | Load comparison page | Comparison renders | `US-2.4-E1-02-comparison.png` |
| 3 | Observe the gauge | Shows "0%" | `US-2.4-E1-03-zero-gauge.png` |
| 4 | Observe common themes section | "Aucun theme commun" message | `US-2.4-E1-04-no-common.png` |

### Edge Case E2: Similarity API Failure
**Mockup reference:** `screen-comparison` — gauge error state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept similarity API with `page.route('**/api/similarity/**', r => r.fulfill({ status: 504 }))` | Timeout | `US-2.4-E2-01-intercept.png` |
| 2 | Load comparison page | Comparison renders | `US-2.4-E2-02-comparison.png` |
| 3 | Observe the gauge area | "Score de similarite indisponible" message | `US-2.4-E2-03-unavailable.png` |

### Edge Case E3: Same Researcher Twice
**Mockup reference:** `screen-comparison` — validation message.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to comparison with same researcher ID for both | Same ID used twice | `US-2.4-E3-01-same-id.png` |
| 2 | Observe the page | "Veuillez selectionner deux chercheurs differents" message | `US-2.4-E3-02-same-warning.png` |

---

## US-2.5: Profile to Map Navigation

### Happy Path
**Mockup reference:** `screen-profile` — "Voir sur la carte" button.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to Dr. Marie Dupont's profile | Profile loads | `US-2.5-01-profile-loaded.png` |
| 2 | Locate the "Voir sur la carte" button in the sidebar | Button visible | `US-2.5-02-button-visible.png` |
| 3 | Click "Voir sur la carte" | Navigates to `/map` | `US-2.5-03-map-loaded.png` |
| 4 | Observe the map | Map is centered on Marie Dupont's dot, which is highlighted/pulsing | `US-2.5-04-centered-highlighted.png` |

### Edge Case E1: No Map Coordinates
**Mockup reference:** `screen-profile` — disabled button.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept researcher API returning null map_x and map_y | No coordinates | `US-2.5-E1-01-intercept.png` |
| 2 | Navigate to that profile | Profile loads | `US-2.5-E1-02-profile-loaded.png` |
| 3 | Observe "Voir sur la carte" button | Button disabled or shows toast "Ce chercheur n'a pas encore de position sur la carte" | `US-2.5-E1-03-disabled-button.png` |

### Edge Case E2: Map Data API Failure
**Mockup reference:** `screen-map` — error overlay.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/clusters` with `page.route('**/api/clusters', r => r.abort())` | API blocked | `US-2.5-E2-01-intercept.png` |
| 2 | Click "Voir sur la carte" from a profile | Navigates to map | `US-2.5-E2-02-navigate.png` |
| 3 | Observe the map area | Error overlay with "Chargement echoue" and retry button | `US-2.5-E2-03-map-error.png` |

### Edge Case E3: Cluster Reorganized
**Mockup reference:** `screen-map` — map centering.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept researcher API to return updated coordinates (different from original) | Updated positions | `US-2.5-E3-01-intercept.png` |
| 2 | Click "Voir sur la carte" from profile | Navigates to map | `US-2.5-E3-02-navigate.png` |
| 3 | Observe the map | Map correctly centers on the new coordinates | `US-2.5-E3-03-new-position.png` |
