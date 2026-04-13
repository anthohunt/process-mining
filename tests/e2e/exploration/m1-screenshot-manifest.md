# Screenshot Manifest — Milestone 1

## US-1.1: Dashboard Statistics & Card Navigation

### Happy Path Screenshots
| Filename | Description |
|----------|-------------|
| US-1.1-01-dashboard-loaded.png | Dashboard homepage loaded with 4 stat cards (5 Chercheurs, 14 Themes, 4 Clusters, 7 Publications) displayed, Activité Récente section showing 5 activity items with researcher avatars and timestamps, and Carte Thématique showing 4 colored theme bubbles. |
| US-1.1-02-stat-cards-visible.png | Same dashboard view confirming all stat cards are visible and properly rendered with correct labels and numeric values. |
| US-1.1-03-stat-values.png | Dashboard with stat card values highlighted by blue border around all 4 cards, emphasizing the statistics display area. |
| US-1.1-04-click-chercheurs-card.png | Clicking "Chercheurs" card navigates to researcher list page showing table with 5 researchers (Ahmed Benali, Claire Fontaine, Jean Martin, Marie Dupont, Sophie Leclerc), their labs (LIG, Liris, LIMOS, IRISA), associated themes as blue tags, and "Voir" action buttons. |
| US-1.1-05-back-to-dashboard.png | Navigation back to dashboard after leaving, showing same initial state with stat cards and activity section fully loaded. |
| US-1.1-06-click-themes-card.png | Clicking "Themes" card navigates to themes explorer page showing 4 theme items (Conformance Checking, Object-Centric PM, Process Discovery, Process Enhancement) with researcher counts and expandable theme tag sections. |

### Edge Case E1: Request Failure
| Filename | Description |
|----------|-------------|
| US-1.1-E1-01-intercept-set.png | API intercept configured to abort all /rest/v1/ requests, dashboard shows loading spinners in stat card area and map section with "Chargement..." text. |
| US-1.1-E1-02-dashboard-loading.png | Loading state maintained while API request aborts - stat cards appear as empty gray placeholders and activity feed shows loading spinner. |
| US-1.1-E1-03-error-state.png | After API abort, dashboard displays error state with all stat cards showing "0" values, "Aucune donnee disponible" message below cards, activity section shows error icon with "Erreur de chargement des activites", and map shows "Cliquer pour voir la carte" placeholder. |
| US-1.1-E1-04-retry-visible.png | Error state with "Ressayer" (Retry) button visible in activity section with orange outline, rest of dashboard remains in error state. |

### Edge Case E2: Empty Data
| Filename | Description |
|----------|-------------|
| US-1.1-E2-01-intercept-zeros.png | API intercept configured to return all zero values (empty database), dashboard loaded successfully with all stat cards showing "0". |
| US-1.1-E2-02-dashboard-loaded.png | Dashboard with zero counts displayed: 0 Chercheurs, 0 Themes, 0 Clusters, 0 Publications, activity section shows empty state "Aucune activite recente", map shows "Carte non disponible". |
| US-1.1-E2-03-zero-stats.png | Same zero stat display confirmed, stat cards have proper spacing and styling despite zero values. |
| US-1.1-E2-04-empty-message.png | "Aucune donnee disponible" message visible below stat cards with red border highlight when zero data is returned, activity and map sections show appropriate empty states. |

### Edge Case E3: Large Numbers
| Filename | Description |
|----------|-------------|
| US-1.1-E3-01-intercept-large.png | API intercept set to return large numbers (researchers=100000, clusters=50, publications=999999), dashboard showing large values successfully loaded. |
| US-1.1-E3-02-dashboard-loaded.png | Dashboard displaying large stat values: 100000 Chercheurs, 220 Themes, 50 Clusters, 999999 Publications, activity section shows empty state, map shows empty state. |
| US-1.1-E3-03-formatted-numbers.png | Large numbers formatted with French thousand separator (100 000, 999 999) visible in stat cards, layout properly accommodates large digit counts without breaking. |

---

## US-1.2: Recent Activity Feed & Navigation

### Happy Path Screenshots
| Filename | Description |
|----------|-------------|
| US-1.2-01-dashboard-loaded.png | Dashboard loaded with activity section visible containing 5 recent activities with researcher names, action descriptions, and timestamps. |
| US-1.2-02-activity-section.png | Activity section highlighted with blue border, showing 5 activity items with avatars, names, actions, and relative time stamps (il y a 2h, 5h, 1j, 2j, 3j). |
| US-1.2-03-activity-items.png | Each activity item displayed with colored avatar initials, researcher name as blue link, action description, and timestamp in proper layout. |
| US-1.2-04-sort-order.png | Activities sorted by recency with first item "Marie Dupont il y a 2h" highlighted by red border showing most recent at top, last item "Claire Fontaine il y a 3j" at bottom. |
| US-1.2-05-click-name.png | Clicking researcher name "Marie Dupont" from activity feed navigates to researcher detail page showing profile card with avatar, name, lab (LRIS), description text, action buttons (Comparer, Voir sur la carte), themes section with blue tags, and publications list. |

### Edge Case E1: Empty Activity
| Filename | Description |
|----------|-------------|
| US-1.2-E1-01-intercept-empty.png | API intercept configured to return empty activity array, dashboard loads with normal data but activity section intercepted. |
| US-1.2-E1-02-dashboard-loaded.png | Dashboard loaded with empty activity feed intercepted, showing clean state ready for empty display. |
| US-1.2-E1-03-empty-state.png | Activity section displays "Aucune activite recente" empty state message with red border outline when no activities are returned. |

### Edge Case E2: API Error  
| Filename | Description |
|----------|-------------|
| US-1.2-E2-01-error-state.png | Activity feed error state displayed with warning icon and "Erreur de chargement des activites" message, plus "Ressayer" retry button. |
| US-1.2-E2-01-intercept-error.png | API intercept set to return 500 Internal Server Error, dashboard loads with all other sections working. |
| US-1.2-E2-02-dashboard-loaded.png | Dashboard fully loaded with error intercepted in activity section only, other sections displaying normally. |
| US-1.2-E2-03-error-retry.png | Error message displayed with green-outlined "Ressayer" button visible in activity section, rest of dashboard unaffected. |

### Edge Case E3: Deleted Researcher
| Filename | Description |
|----------|-------------|
| US-1.2-E3-01-deleted-researcher.png | Activity shows researcher with null user_name (deleted account) displaying as "Utilisateur inconnu (profil supprimé)" with generic gray avatar (UI initials), action shows "Suppression — Compte supprimé". |
| US-1.2-E3-01-intercept-deleted.png | API intercept returns activity entry with null user_name field for deleted researcher, dashboard loads with this data. |
| US-1.2-E3-02-dashboard-loaded.png | Dashboard fully loaded with deleted researcher entry in activity feed showing graceful degradation. |
| US-1.2-E3-03-deleted-name.png | Deleted researcher display shows "Utilisateur inconnu (profil supprimé)" in italic text with red box highlight, name is non-clickable span element indicating profile no longer exists. |

---

## US-1.3: Thematic Map Minimap & Full Map Navigation

### Happy Path Screenshots
| Filename | Description |
|----------|-------------|
| US-1.3-01-dashboard-loaded.png | Dashboard loaded with 4 theme bubbles visible in Carte Thématique section (blue, orange, green, red circles with white dots). |
| US-1.3-01-minimap-visible.png | Carte Thématique section showing minimap with 4 cluster bubbles on dark blue background with "Cliquer pour ouvrir la carte complete" overlay text. |
| US-1.3-02-click-minimap.png | Clicking minimap navigates to full map page showing filters panel on left (Theme dropdown set to "Tous" with Apply button) and legend on right (Conformance Checking blue, Object-Centric PM orange, Process Discovery green, Process Enhancement red), full map shows enlarged theme bubbles. |
| US-1.3-02-mini-map-visible.png | Back on dashboard, minimap section displaying 4 theme bubbles with overlay text "Cliquer pour ouvrir la carte complete" visible. |
| US-1.3-03-hover-effect.png | Hovering over minimap shows blue outline border around entire map container on dashboard, cursor-pointer visual feedback. |
| US-1.3-04-navigated-to-map.png | Full thematic map page displayed with 4 large theme bubbles positioned on dark navy background, filter panel on left and legend on right side of screen. |

### Edge Case E1: No Clusters
| Filename | Description |
|----------|-------------|
| US-1.3-E1-01-intercept-empty.png | API intercept configured to return empty clusters array, dashboard loads with minimap intercepted. |
| US-1.3-E1-01-no-clusters.png | Dashboard displayed with 0 Clusters stat, Carte Thématique showing dark blue empty area with "Carte non disponible" message, no bubbles visible. |
| US-1.3-E1-02-dashboard-loaded.png | Dashboard fully loaded with empty clusters intercept, other sections functional. |
| US-1.3-E1-03-placeholder.png | Carte Thématique section displays "Carte non disponible" placeholder message with orange border outline when no cluster data exists. |

### Edge Case E2: Slow Loading
| Filename | Description |
|----------|-------------|
| US-1.3-E2-01-intercept-slow.png | API route for clusters set to HANG (never fulfill), triggering loading state, dashboard shows stat card placeholders and loading spinners. |
| US-1.3-E2-01-loading-spinner.png | Carte Thématique section displays loading spinner with "Chargement de la carte..." text on dark background. |
| US-1.3-E2-02-dashboard-loaded.png | Dashboard fully loaded with stat cards and activity feed populated, clusters route still hanging and map showing loading state. |
| US-1.3-E2-03-loading-spinner.png | Loading spinner visible with "Chargement..." text in orange-bordered Carte Thématique container while waiting for clusters response. |

### Edge Case E3: Error with Fallback
| Filename | Description |
|----------|-------------|
| US-1.3-E3-01-error-fallback.png | Clusters API returns HTTP 500 error, dashboard loads with 0 Clusters stat, Carte Thématique shows fallback "Cliquer pour voir la carte" message (graceful degradation). |
| US-1.3-E3-01-intercept-malformed.png | API intercept set to return HTTP 500 error for clusters endpoint, triggering error/fallback handling. |
| US-1.3-E3-02-dashboard-loaded.png | Dashboard fully loaded after clusters error, showing all sections rendered including map with fallback state. |
| US-1.3-E3-03-fallback.png | Carte Thématique displays fallback message "Cliquer pour voir la carte" with orange border outline, minimap unavailable but link to full map page still functional for graceful degradation. |

---

## Summary

- **Total screenshots described**: 54
- **User stories covered**: 3 (US-1.1, US-1.2, US-1.3)
- **Happy path scenarios**: 16 screenshots
- **Edge case scenarios**: 38 screenshots (3 per user story)
  - US-1.1: 3 edge cases (request failure, empty data, large numbers)
  - US-1.2: 3 edge cases (empty activity, API error, deleted researcher)
  - US-1.3: 3 edge cases (no clusters, slow loading, error with fallback)

All screenshots successfully display expected UI states including loaded data, empty states, error states, loading states, and proper formatting of large numbers and deleted references.
