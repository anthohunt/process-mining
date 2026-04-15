# Screenshot Manifest — US Stories (Phase 3b Describer)

## US-1.1: Dashboard Stats & Navigation

### US-1.1-01-dashboard-loaded
- **File:** `tests/e2e/final/US-1.1-01-dashboard-loaded.png`
- **Description:** Dashboard homepage displays with navbar showing "CartoPM" logo, navigation tabs (Tableau de Bord, Chercheurs, Carte, Statistiques, Thèmes), language/login controls. Main content shows "Tableau de Bord" heading with four stat cards (5 Chercheurs, 14 Thèmes, 4 Clusters, 7 Publications), "Activite Recente" feed on left, and "Carte Thematique" mini-map on right with colored nebula visualization.
- **State keywords:** "loaded", "homepage", "stat cards", "activity feed", "mini-map", "nebula"

### US-1.1-02-stat-cards-visible
- **File:** `tests/e2e/final/US-1.1-02-stat-cards-visible.png`
- **Description:** Same dashboard view with stat cards clearly visible showing values: 5, 14, 4, 7 with their labels centered below. Activity feed shows researcher names with initials in colored avatars. Mini-map nebula is fully rendered with blue, orange, green, and red sphere nodes on dark background.
- **State keywords:** "stat cards visible", "activity feed", "avatars", "nebula nodes"

### US-1.1-03-stat-values
- **File:** `tests/e2e/final/US-1.1-03-stat-values.png`
- **Description:** Stat cards section is highlighted with blue border showing focus/selection state. Cards display same values (5, 14, 4, 7) with labels Chercheurs, Thèmes, Clusters, Publications. Indicates the stats area is being tested/asserted.
- **State keywords:** "stat values", "focus state", "blue border highlight"

### US-1.1-04-click-chercheurs-card
- **File:** `tests/e2e/final/US-1.1-04-click-chercheurs-card.png`
- **Description:** User has navigated to Chercheurs (researchers) list page. Navbar shows "Chercheurs" tab highlighted. Page displays search box labeled "Rechercher..." and dropdown "Tous les labos" (all labs). Below is a table with columns: NOM, LABORATOIRE, THEMES, ACTIONS. Five researcher rows visible (Ahmed Benalli, Claire Fontaine, Jean Martin, Marie Dupont, Sophie Leclerc) with their labs and theme tags and "Voir" (View) buttons.
- **State keywords:** "Chercheurs list", "search box", "lab filter", "researcher table", "theme tags"

### US-1.1-05-back-to-dashboard
- **File:** `tests/e2e/final/US-1.1-05-back-to-dashboard.png`
- **Description:** Navigation back to dashboard homepage shows same initial view: stat cards (5, 14, 4, 7), activity feed with researcher actions, and mini-map nebula. Confirms navigation round-trip works.
- **State keywords:** "back to dashboard", "stats reloaded", "activity feed"

### US-1.1-06-click-themes-card
- **File:** `tests/e2e/final/US-1.1-06-click-themes-card.png`
- **Description:** User navigated to Themes explorer page titled "Explorer les Thèmes" with "Voir sur la carte" (View on map) button. Four theme cards displayed: Conformance Checking (2 chercheurs), Object-Centric PM (1 chercheur), Process Discovery (1 chercheur), Process Enhancement (1 chercheur). Each card shows colored dot indicator (blue, orange, green, red) and related keywords/tags.
- **State keywords:** "Themes page", "theme cards", "colored indicators", "member counts"

### US-1.1-E1-01-intercept-set
- **File:** `tests/e2e/final/US-1.1-E1-01-intercept-set.png`
- **Description:** Error test scenario setup: banner shows red intercept annotation "intercept-set (all /rest/v1/ aborted)" indicating API mock failure. Dashboard is loading with grayed-out placeholder skeleton cards and loading spinner in activity and map sections.
- **State keywords:** "error intercept", "API abort", "loading state", "skeleton placeholders"

### US-1.1-E1-02-dashboard-loading
- **File:** `tests/e2e/final/US-1.1-E1-02-dashboard-loading.png`
- **Description:** Dashboard during API failure shows stat cards as skeleton/grayed placeholders, "Chargement..." (Loading...) spinners visible in Activity Recent and Carte Thematique sections. Navbar and layout intact but content unloaded.
- **State keywords:** "loading", "error state", "skeleton loaders", "spinners"

### US-1.1-E1-03-error-state
- **File:** `tests/e2e/final/US-1.1-E1-03-error-state.png`
- **Description:** After API abort, dashboard shows error message. Stat cards display "0" values, "Aucune donnee disponible" (No data available) message visible, error icon with "Erreur de chargement des activites" (Loading error for activities) and a "Ressayer" (Retry) button. Mini-map shows placeholder text instead of nebula.
- **State keywords:** "error state", "zero values", "error message", "retry button"

### US-1.1-E1-04-retry-visible
- **File:** `tests/e2e/final/US-1.1-E1-04-retry-visible.png`
- **Description:** Retry button is highlighted/focused with yellow border, confirming it's interactive and accessible. Error state persists with "Aucune donnee disponible" and activity loading error still visible. User can click to retry API call.
- **State keywords:** "retry button", "focused state", "yellow border", "error persists"

### US-1.1-E2-01-intercept-zeros
- **File:** `tests/e2e/final/US-1.1-E2-01-intercept-zeros.png`
- **Description:** Green banner intercept shows "intercept-zeros (empty DB)" indicating API returns empty/zero data scenario. Dashboard loading with skeleton placeholders and spinners as content initializes.
- **State keywords:** "empty DB intercept", "zero count scenario", "loading spinners"

### US-1.1-E2-02-dashboard-loaded
- **File:** `tests/e2e/final/US-1.1-E2-02-dashboard-loaded.png`
- **Description:** Dashboard successfully loaded with zero-count intercept. Stat cards now show "0" for all metrics (Chercheurs: 0, Thèmes: 0, Clusters: 0, Publications: 0). Activity feed shows "Aucune activite recente" (No recent activity) message. Mini-map shows "Carte non disponible" (Map unavailable). Layout and structure intact.
- **State keywords:** "zero counts", "empty state", "no activities", "map unavailable"

### US-1.1-E2-03-zero-stats
- **File:** `tests/e2e/final/US-1.1-E2-03-zero-stats.png`
- **Description:** Stat cards section highlighted showing all zeros (0 Chercheurs, 0 Thèmes, 0 Clusters, 0 Publications) with "Aucune donnee disponible" empty state message visible below. Indicates empty database state is properly displayed.
- **State keywords:** "zero stats", "empty message", "all zeros"

### US-1.1-E2-04-empty-message
- **File:** `tests/e2e/final/US-1.1-E2-04-empty-message.png`
- **Description:** Highlighted message displays "Aucune donnee disponible" (No data available) with red border frame, confirming empty state messaging is rendered when database has no records. Activity and map sections show corresponding empty/unavailable states.
- **State keywords:** "empty message", "no data available", "red border highlight"

### US-1.1-E3-01-intercept-large
- **File:** `tests/e2e/final/US-1.1-E3-01-intercept-large.png`
- **Description:** Blue banner intercept shows "intercept-set: researchers-100000, clusters-50, publications-999999" indicating large number formatting test scenario. Dashboard initializing with loading spinners and skeleton placeholders.
- **State keywords:** "large numbers intercept", "formatting test", "loading state"

### US-1.1-E3-02-dashboard-loaded
- **File:** `tests/e2e/final/US-1.1-E3-02-dashboard-loaded.png`
- **Description:** Dashboard loaded with large numbers. Stat cards display formatted values: "100 000" (Chercheurs), "220" (Thèmes), "50" (Clusters), "999 999" (Publications). Activity section shows "Aucune activite recente" since focus is on stat display. Mini-map shows "Carte non disponible" placeholder.
- **State keywords:** "large numbers", "formatted values", "number separators", "empty activity"

### US-1.1-E3-03-formatted-numbers
- **File:** `tests/e2e/final/US-1.1-E3-03-formatted-numbers.png`
- **Description:** Stat cards section highlighted showing correctly formatted large numbers with French thousands separators: "100 000", "220", "50", "999 999". Confirms fr-FR locale number formatting is applied correctly.
- **State keywords:** "formatted numbers", "thousands separator", "fr-FR locale", "large values"

## US-1.2: Activity Feed Display

### US-1.2-01-dashboard-loaded
- **File:** `tests/e2e/final/US-1.2-01-dashboard-loaded.png`
- **Description:** Dashboard homepage with activity feed highlighted with blue border. Activity feed section shows five recent activities listed: Marie Dupont (Ajout, 2h ago), Jean Martin (Modification, 5h ago), Sophie Leclerc (Ajout, 1j ago), Ahmed Benalli (Modification, 2j ago), Claire Fontaine (Ajout, 3j ago).
- **State keywords:** "activity feed", "loaded", "5 items", "timestamps"

### US-1.2-02-activity-section
- **File:** `tests/e2e/final/US-1.2-02-activity-section.png`
- **Description:** Activity section "Activite Recente" with blue border focus highlight showing all five activity items with avatar initials (MD, JM, SL, AB, CF) in colored circles, action labels (Ajout/Modification), descriptions, and time deltas.
- **State keywords:** "activity section", "focused", "avatars", "action labels"

### US-1.2-03-activity-items
- **File:** `tests/e2e/final/US-1.2-03-activity-items.png`
- **Description:** Detailed view of activity items showing: colored avatar initials, researcher names as blue links, action type (Ajout = Add/Modification = Modify), description text, and relative timestamps (il y a 2h, 5h, 1j, 2j, 3j). Items are clickable and linkable to researcher profiles.
- **State keywords:** "activity items", "links", "action types", "timestamps", "descriptions"

### US-1.2-04-sort-order
- **File:** `tests/e2e/final/US-1.2-04-sort-order.png`
- **Description:** Activity feed display confirms newest-first sort order: Marie Dupont (2h ago) at top, followed by Jean Martin (5h ago), Sophie Leclerc (1j), Ahmed Benalli (2j), Claire Fontaine (3j) at bottom. Chronological descending order is correct.
- **State keywords:** "sort order", "newest first", "chronological", "descending"

### US-1.2-05-click-name
- **File:** `tests/e2e/final/US-1.2-05-click-name.png`
- **Description:** User clicked on "Marie Dupont" researcher name link and navigated to researcher profile page. Page shows profile layout with researcher information section (sidebar), likely profile details, keywords, publications etc.
- **State keywords:** "profile navigation", "researcher profile", "link clicked"

## US-1.2-E1: Activity Feed — Empty State

### US-1.2-E1-01-empty-feed
- **File:** `tests/e2e/final/US-1.2-E1-01-empty-feed.png`
- **Description:** Purple banner annotation "no activities → empty state shown". Dashboard displays with stat cards (5, 14, 4, 7), but activity feed section shows "Aucune activite recente" (No recent activities) empty message. Mini-map displays normally.
- **State keywords:** "empty state", "no activities", "empty message"

### US-1.2-E1-01-intercept-empty
- **File:** `tests/e2e/final/US-1.2-E1-01-intercept-empty.png`
- **Description:** Purple banner shows "intercept audit_logs set to return empty array []" indicating API mock returning no activities. Dashboard renders normally but activity feed shows activity item with "il y a 2h" timestamp highlighted with red border, confirming item details are being tested.
- **State keywords:** "empty intercept", "API mock", "activity item visible", "timestamp"

### US-1.2-E1-02-dashboard-loaded
- **File:** `tests/e2e/final/US-1.2-E1-02-dashboard-loaded.png`
- **Description:** Dashboard loaded with empty activity API response. Shows stat cards (5, 14, 4, 7), but activity feed displays "Aucune activite recente" (No recent activity) empty state message with centered text layout.
- **State keywords:** "empty activities", "dashboard loaded", "empty message"

### US-1.2-E1-03-empty-state
- **File:** `tests/e2e/final/US-1.2-E1-03-empty-state.png`
- **Description:** Activity feed section with red border highlight shows "Aucune activite recente" empty state message. Stat cards remain populated (5, 14, 4, 7), demonstrating that only activity feed is empty while other sections load normally.
- **State keywords:** "empty state message", "activity feed", "red highlight", "stats loaded"

## US-1.2-E2: Activity Feed — Error State

### US-1.2-E2-01-error-state
- **File:** `tests/e2e/final/US-1.2-E2-01-error-state.png`
- **Description:** Red banner shows "activity API 500 → error state with retry button". Dashboard displays with stat cards (5, 14, 4, 7) but activity feed shows error message "Erreur de chargement des activites" (Activity loading error) with a "Ressayer" (Retry) button below.
- **State keywords:** "error state", "500 error", "retry button", "error message"

### US-1.2-E2-01-intercept-error
- **File:** `tests/e2e/final/US-1.2-E2-01-intercept-error.png`
- **Description:** Red banner shows "intercept audit_logs set to return 500 Internal Server Error". Dashboard initializing with activity section showing "Aucune activite recente" message highlighted with red border, indicating activity API is being intercepted to return error.
- **State keywords:** "500 error intercept", "API mock", "activity section", "red border"

### US-1.2-E2-02-dashboard-loaded
- **File:** `tests/e2e/final/US-1.2-E2-02-dashboard-loaded.png`
- **Description:** Dashboard loaded after API error. Stat cards display (5, 14, 4, 7), but activity feed shows error icon and "Erreur de chargement des activites" message with "Ressayer" retry button. Rest of dashboard is unaffected.
- **State keywords:** "error state", "retry button", "stats loaded", "partial load"

### US-1.2-E2-03-error-retry
- **File:** `tests/e2e/final/US-1.2-E2-03-error-retry.png`
- **Description:** Retry button is highlighted/focused with green border, confirming it's interactive. Error state persists with "Erreur de chargement des activites" message visible. Button is ready to be clicked to attempt API retry.
- **State keywords:** "retry button", "focused state", "green border", "error persistent"

## US-1.2-E3: Activity Feed — Deleted Researcher

### US-1.2-E3-01-deleted-researcher
- **File:** `tests/e2e/final/US-1.2-E3-01-deleted-researcher.png`
- **Description:** Purple banner "deleted researcher (null user_name) → greyed 'Utilisateur inconnu (profil supprime)'". Activity feed shows one activity item: avatar with "UI" initials (greyed out), text "Utilisateur inconnu (profil supprime) Suppression — Compte supprime" (Unknown User (profile deleted) Deletion — Account deleted), with timestamp "il y a 1h".
- **State keywords:** "deleted researcher", "greyed avatar", "null name handling", "profile deleted"

### US-1.2-E3-01-intercept-deleted
- **File:** `tests/e2e/final/US-1.2-E3-01-intercept-deleted.png`
- **Description:** Purple banner shows "intercept: audit_logs returns entry with null user_name (deleted researcher)". Dashboard shows activity feed loading with stat cards (5, 14, 4, 7) visible. API mock is configured to return an activity record with null user_name.
- **State keywords:** "deleted researcher intercept", "null user_name", "activity loading"

### US-1.2-E3-02-dashboard-loaded
- **File:** `tests/e2e/final/US-1.2-E3-02-dashboard-loaded.png`
- **Description:** Dashboard with deleted researcher data loaded. Stat counts decreased to 0 for Chercheurs and Thèmes (0, 0, 4, 7), showing that the deleted account was removed from active counts. Activity feed still shows one item for the deleted researcher.
- **State keywords:** "deleted researcher loaded", "zero counts", "activity persists", "stat update"

### US-1.2-E3-03-deleted-name
- **File:** `tests/e2e/final/US-1.2-E3-03-deleted-name.png`
- **Description:** Activity item for deleted researcher is highlighted with red border. Shows greyed "UI" avatar initials, text "Utilisateur inconnu (profil supprime)" in italic, indicating deleted account. Researcher name is not a clickable link, confirming profile is no longer accessible.
- **State keywords:** "deleted researcher", "greyed avatar", "non-clickable", "profile supprime", "red border"

## US-1.3: Mini-Map Navigation

### US-1.3-01-dashboard-loaded
- **File:** `tests/e2e/final/US-1.3-01-dashboard-loaded.png`
- **Description:** Dashboard homepage fully loaded showing stat cards (105, 271, 10, 315) with higher counts, activity feed with Admin activities (Configurations, Modifications, Suppressions), and mini-map "Carte Thematique" showing colorful nebula visualization with multiple theme clusters (orange, cyan, yellow, red, green, purple sphere nodes).
- **State keywords:** "loaded", "admin activities", "mini-map", "nebula visualization", "theme clusters"

### US-1.3-02-mini-map-visible
- **File:** `tests/e2e/final/US-1.3-02-mini-map-visible.png`
- **Description:** Mini-map section "Carte Thematique" displays prominently with full nebula visualization: multiple colored sphere nodes (orange, cyan, yellow, green, red, purple) arranged in 3D space on dark background. Instruction text "Cliquer pour ouvrir la carte complete" (Click to open full map) is visible.
- **State keywords:** "mini-map visible", "nebula", "colored spheres", "3D visualization", "click prompt"

### US-1.3-03-hover-effect
- **File:** `tests/e2e/final/US-1.3-03-hover-effect.png`
- **Description:** User is hovering over mini-map. Visual shows the nebula visualization with interactive hover feedback on one of the theme cluster nodes. Multiple colored sphere nodes are visible (orange, cyan, yellow, green nodes prominently), confirming hover interaction is active on the 3D visualization.
- **State keywords:** "hover effect", "interactive", "3D visualization", "node hover"

### US-1.3-04-navigated-to-map
- **File:** `tests/e2e/final/US-1.3-04-navigated-to-map.png`
- **Description:** User clicked on mini-map and navigated to full "Carte Thematique" page. Page displays title "Carte Thematique" with "Vue en liste" (List view) button in top-right. Large full-screen map shows complex theme network visualization with filter panel on left (Theme dropdown "Tous", Laboratoire dropdown "Tous", "Appliquer" button) and legend on right showing color-coded themes (BPM Foundations, Conformance Checking, Declarative & Formal Methods, etc.).
- **State keywords:** "full map", "filter panel", "legend visible", "theme network", "3D visualization"

## US-1.3-E1: Mini-Map — Empty Map

### US-1.3-E1-01-intercept-empty
- **File:** `tests/e2e/final/US-1.3-E1-01-intercept-empty.png`
- **Description:** Purple banner "intercept: map data empty". Dashboard shows stat cards (5, 14, 4, 7) loaded normally, but mini-map "Carte Thematique" displays placeholder with loading spinners visible in the map area.
- **State keywords:** "empty map intercept", "loading state", "spinners"

### US-1.3-E1-02-dashboard-loaded
- **File:** `tests/e2e/final/US-1.3-E1-02-dashboard-loaded.png`
- **Description:** Dashboard loaded with empty map data. Stat cards display normally (5, 14, 4, 7), activity feed shows activities, but mini-map section remains empty with placeholder message instead of nebula visualization.
- **State keywords:** "empty map", "no visualization", "placeholder", "stats loaded"

### US-1.3-E1-03-placeholder
- **File:** `tests/e2e/final/US-1.3-E1-03-placeholder.png`
- **Description:** Mini-map section displays placeholder/fallback state when map data is empty. Shows dark background area with no sphere nodes or cluster visualization, confirming graceful empty state handling for the 3D visualization.
- **State keywords:** "empty placeholder", "no data", "dark background", "fallback state"

## US-1.3-E2: Mini-Map — Slow Loading

### US-1.3-E2-01-intercept-slow
- **File:** `tests/e2e/final/US-1.3-E2-01-intercept-slow.png`
- **Description:** Purple banner "intercept: map data slow (3s delay)". Dashboard shows stat cards (5, 14, 4, 7) loaded, activity feed displaying normally, but mini-map "Carte Thematique" section shows loading spinner/placeholder indicating API is still fetching map data with simulated delay.
- **State keywords:** "slow load intercept", "3s delay", "loading spinner", "stats visible"

### US-1.3-E2-02-loading-spinner
- **File:** `tests/e2e/final/US-1.3-E2-02-loading-spinner.png`
- **Description:** Mini-map section displays animated loading spinner/skeleton state while awaiting map data response. Dark background with centered spinner indicates async data fetch in progress. Rest of dashboard (stat cards, activity feed) remains fully interactive.
- **State keywords:** "loading spinner", "async state", "dark background", "await API"

### US-1.3-E2-03-partial-load
- **File:** `tests/e2e/final/US-1.3-E2-03-partial-load.png`
- **Description:** Mini-map still loading with spinner visible, showing partial nebula visualization emerging in background. Stat cards and activity feed fully loaded. This intermediate frame shows transition from empty placeholder to final visualization.
- **State keywords:** "partial load", "emerging visualization", "spinner visible", "transition"

### US-1.3-E2-04-final-loaded
- **File:** `tests/e2e/final/US-1.3-E2-04-final-loaded.png`
- **Description:** Mini-map fully loaded after slow API response. Nebula visualization displays with colored sphere nodes (orange, cyan, yellow, green, red, purple clusters) visible. "Carte Thematique" section fully rendered with instruction text "Cliquer pour ouvrir la carte complete" visible.
- **State keywords:** "loaded", "nebula complete", "all nodes visible", "map ready"

## US-1.3-E3: Mini-Map — Malformed Data

### US-1.3-E3-01-intercept-malformed
- **File:** `tests/e2e/final/US-1.3-E3-01-intercept-malformed.png`
- **Description:** Purple banner "intercept: map data malformed (invalid JSON)". Dashboard shows stat cards (5, 14, 4, 7) loaded normally, activity feed displaying, but mini-map section shows loading placeholder, awaiting API response with intentionally malformed data payload.
- **State keywords:** "malformed intercept", "invalid JSON", "loading state", "error pending"

### US-1.3-E3-02-error-fallback
- **File:** `tests/e2e/final/US-1.3-E3-02-error-fallback.png`
- **Description:** Mini-map displays error fallback state after receiving malformed data. Section shows dark placeholder area instead of nebula visualization, indicating graceful error handling. Stat cards and activity feed continue to display normally.
- **State keywords:** "error fallback", "malformed data", "no visualization", "graceful degradation"

### US-1.3-E3-03-map-unavailable
- **File:** `tests/e2e/final/US-1.3-E3-03-map-unavailable.png`
- **Description:** Mini-map "Carte Thematique" section shows unavailable state with message indicating map data could not be loaded. Dark background with no sphere nodes or clusters. Dashboard remains functional with stat cards and activity feed intact.
- **State keywords:** "unavailable", "no data", "fallback message", "dashboard intact"

## US-1.4: Statistics Details Page

### US-1.4-01-stats-page-loaded
- **File:** `tests/e2e/final/US-1.4-01-stats-page-loaded.png`
- **Description:** Statistics "Statistiques" page loaded with multiple chart visualizations. Displays bar chart titled "Distribution des thèmes" (Theme Distribution) with 16 theme bars showing counts (tallest bars ~9-10, others ~4), below shows line chart "Tendances temporelles" (Temporal Trends) with time-series data from 1992 to 2025, and histogram "Distribution des similarites" (Similarity Distribution) with bell-curve-like distribution pattern.
- **State keywords:** "stats page", "bar chart", "line chart", "histogram", "theme distribution"

### US-1.4-02-bar-chart-visible
- **File:** `tests/e2e/final/US-1.4-02-bar-chart-visible.png`
- **Description:** Bar chart "Distribution des thèmes" displayed prominently showing 16 theme categories on x-axis with varying heights. Tallest bars reach ~9-10 units, others cluster around 4 units. Chart has gridlines and axis labels. Title and legend visible above chart area.
- **State keywords:** "bar chart", "16 themes", "heights 4-10", "gridlines", "axis labels"

### US-1.4-03-bar-chart-hover
- **File:** `tests/e2e/final/US-1.4-03-bar-chart-hover.png`
- **Description:** User hovering over one of the bars in the bar chart. Bar is highlighted with hover state (color change or glow effect visible), showing interactive feedback. Tooltip or value display likely appears on hover to show exact count for that theme.
- **State keywords:** "bar hover", "interactive", "highlight", "tooltip"

### US-1.4-04-line-chart-visible
- **File:** `tests/e2e/final/US-1.4-04-line-chart-visible.png`
- **Description:** Line chart "Tendances temporelles" displayed showing temporal trends from 1992 to 2025. Multi-line visualization with values fluctuating across the time range, showing research activity trends over decades. Gridlines and axis labels visible with legend indicating multiple data series.
- **State keywords:** "line chart", "temporal trends", "1992-2025", "multi-line", "time series"

### US-1.4-05-line-chart-hover
- **File:** `tests/e2e/final/US-1.4-05-line-chart-hover.png`
- **Description:** User hovering over a point on the line chart. Interactive hover state active showing tooltip with values for the specific time point. Line is highlighted and data values are revealed for that temporal position.
- **State keywords:** "line hover", "tooltip", "interactive", "time point"

### US-1.4-06-histogram-visible
- **File:** `tests/e2e/final/US-1.4-06-histogram-visible.png`
- **Description:** Histogram "Distribution des similarites" displayed showing similarity score distribution with bell-curve-like pattern. Bars represent frequency of similarity values across the dataset. X-axis shows similarity score range (0.0-1.0 likely), y-axis shows frequency/count. Peak appears in middle range indicating most similarities cluster around moderate values.
- **State keywords:** "histogram", "similarity distribution", "bell curve", "frequency", "moderate values"

### US-1.4-07-histogram-hover
- **File:** `tests/e2e/final/US-1.4-07-histogram-hover.png`
- **Description:** User hovering over one of the histogram bars. Bar is highlighted with interactive hover state. Tooltip displays frequency count and similarity range for that bin, showing exact distribution values on interaction.
- **State keywords:** "histogram hover", "tooltip", "interactive", "bin frequency"

## US-1.4-E1: Statistics — Empty State

### US-1.4-E1-01-intercept-empty
- **File:** `tests/e2e/final/US-1.4-E1-01-intercept-empty.png`
- **Description:** Purple banner "intercept: stats data empty". Statistics page loads but all chart sections show placeholder/empty state with message indicating "Pas assez de donnees pour generer ce graphique" (Not enough data to generate this chart). Dashboard navigation and page structure intact.
- **State keywords:** "empty stats intercept", "no data message", "placeholders", "page structure"

### US-1.4-E1-02-empty-message
- **File:** `tests/e2e/final/US-1.4-E1-02-empty-message.png`
- **Description:** Statistics page with all three chart areas (bar, line, histogram) showing empty state message "Pas assez de donnees pour generer ce graphique" in each section. Placeholder boxes visible where charts would render. Page header and navigation controls remain functional.
- **State keywords:** "empty message", "no data", "placeholder boxes", "all charts empty"

### US-1.4-E1-03-chart-area-empty
- **File:** `tests/e2e/final/US-1.4-E1-03-chart-area-empty.png`
- **Description:** Individual chart area shows empty state clearly. Light grey placeholder box with centered message "Pas assez de donnees pour generer ce graphique". No visual data representation, confirming graceful empty state handling for stats visualization.
- **State keywords:** "empty placeholder", "no data message", "grey box", "fallback state"

## US-1.4-E2: Statistics — Insufficient Data

### US-1.4-E2-01-intercept-insufficient
- **File:** `tests/e2e/final/US-1.4-E2-01-intercept-insufficient.png`
- **Description:** Purple banner "intercept: insufficient data (minimum 2 researchers for similarity calculation)". Statistics page loading, some charts may render with available data, but similarity-dependent charts show specific error "Au moins 2 chercheurs requis pour calculer la similarite" (At least 2 researchers required to calculate similarity).
- **State keywords:** "insufficient data intercept", "2 researcher minimum", "partial load", "error conditional"

### US-1.4-E2-02-partial-charts
- **File:** `tests/e2e/final/US-1.4-E2-02-partial-charts.png`
- **Description:** Statistics page with mixed chart states. Bar chart "Distribution des thèmes" renders successfully with theme data. Line chart "Tendances temporelles" displays temporal trends. However, histogram "Distribution des similarites" shows error message "Au moins 2 chercheurs requis pour calculer la similarite" since similarity calculation requires minimum 2 researchers in dataset.
- **State keywords:** "partial load", "mixed states", "bar chart visible", "line chart visible", "similarity error"

### US-1.4-E2-03-similarity-error
- **File:** `tests/e2e/final/US-1.4-E2-03-similarity-error.png`
- **Description:** Histogram section displays error message "Au moins 2 chercheurs requis pour calculer la similarite" prominently. Placeholder box shows specific validation error for similarity distribution chart. Other chart areas (bar, line) are fully rendered or show independent data, confirming error is localized to similarity calculation.
- **State keywords:** "similarity error", "minimum requirement", "validation message", "localized error"

## US-1.4-E3: Statistics — API Error

### US-1.4-E3-01-intercept
- **File:** `tests/e2e/final/US-1.4-E3-01-intercept.png`
- **Description:** Statistics "Statistiques Detaillees" page with three chart sections. "Distribution des themes" shows "Pas assez de donnees pour generer ce graphique". "Tendances temporelles" shows "Pas assez de donnees pour generer ce graphique". "Distribution des similarites" shows "Au moins 2 chercheurs requis pour calculer la similarite". All three charts show error/empty states indicating API response with insufficient data.
- **State keywords:** "all charts empty", "multi-error state", "data insufficiency", "validation messages"

### US-1.4-E3-02-loaded
- **File:** `tests/e2e/final/US-1.4-E3-02-loaded.png`
- **Description:** Statistics page displays "Erreur de chargement" (Loading Error) with warning icon in center. Generic error message indicates failure to load statistics data. Navigation and page structure intact, but all chart sections are inaccessible due to API failure.
- **State keywords:** "loading error", "api failure", "generic error", "page structure intact"

### US-1.4-E3-03-error-state
- **File:** `tests/e2e/final/US-1.4-E3-03-error-state.png`
- **Description:** Statistics page shows "Erreur de chargement" error state with warning icon and retry option. Same as E3-02, confirming consistent error handling across API failure scenarios.
- **State keywords:** "error state", "api failure", "retry available", "consistent handling"

## US-2.1: Researchers List

### US-2.1-01-list-loaded
- **File:** `tests/e2e/final/US-2.1-01-list-loaded.png`
- **Description:** Researchers "Chercheurs" page fully loaded with table showing 5 researchers: Ahmed Benali (LIG, 3 themes, 1 pub), Claire Fontaine (LIRIS, 3 themes, 1 pub), Jean Martin (LIMOS, 3 themes, 2 pubs), Marie Dupont (LIRIS, 3 themes, 2 pubs), Sophie Leclerc (IRISA, 3 themes, 1 pub). Search field "Chercheur...", lab filter "Tous les labos", theme filter "Tous les themes", and "Explorer par theme" button visible. "Voir" action links present for each row.
- **State keywords:** "list loaded", "table visible", "5 researchers", "filters visible", "action links"

### US-2.1-02-table-visible
- **File:** `tests/e2e/final/US-2.1-02-table-visible.png`
- **Description:** Table displays full researcher data with columns: NOM (avatar + name), LABORATOIRE, THEMES (blue badge tags), PUBLICATIONS (count), ACTIONS (Voir button). All 5 rows visible with color-coded avatars (pink AB, red CF, orange JM, purple MD, blue SL). Table structure clear with gridlines and proper spacing.
- **State keywords:** "table structure", "avatars visible", "theme badges", "count columns"

### US-2.1-03-search-text
- **File:** `tests/e2e/final/US-2.1-03-search-text.png`
- **Description:** User typed "Dupont" in search field. Search input is focused with blue border showing "Dupont" text. Loading spinner "Chargement..." appears below indicating search query is being processed. Table below will filter to show matching results (Marie Dupont).
- **State keywords:** "search active", "loading spinner", "focused input", "query pending"

### US-2.1-04-filter-lab
- **File:** `tests/e2e/final/US-2.1-04-filter-lab.png`
- **Description:** Lab filter changed to "LIRIS" from "Tous les labos" dropdown. Search field still shows "Chercheur..." placeholder. Loading spinner "Chargement..." indicates filter is being applied. Table will update to show only LIRIS researchers (Claire Fontaine, Marie Dupont).
- **State keywords:** "lab filter", "LIRIS selected", "loading spinner", "filter applied"

### US-2.1-05-combined-filters
- **File:** `tests/e2e/final/US-2.1-05-combined-filters.png`
- **Description:** Multiple filters applied: search input cleared, lab filter shows "LIRIS" selected, theme filter shows "conformance" selected (changed from "Tous les themes"). Table shows filtered results: Claire Fontaine (LIRIS, conformance/formal verification/model checking themes, 1 pub) and Marie Dupont (LIRIS, conformance/alignment/process mining themes, 2 pubs). "Effacer" (Clear) button visible to reset search. Combined filters narrow results to 2 matching researchers.
- **State keywords:** "multi-filter", "theme filter active", "conformance selected", "2 results"

### US-2.1-06-crossnav-themes
- **File:** `tests/e2e/final/US-2.1-06-crossnav-themes.png`
- **Description:** Page navigated to "Explorer les Themes" (Explore Themes) page from Chercheurs page. Header shows "Explorer les Themes" title with "Voir sur la carte" (View on map) button. Loading spinner "Chargement..." visible, indicating theme data is being fetched. Cross-navigation from researcher list to themes page confirmed.
- **State keywords:** "navigation", "themes page", "loading themes", "cross-nav"

## US-2.1-E1: Researchers — No Results

### US-2.1-E1-01-list-loaded
- **File:** `tests/e2e/final/US-2.1-E1-01-list-loaded.png`
- **Description:** Researchers list page loaded with table structure, filters, and search field all visible and functional. 5 researchers shown initially with all data intact before any search/filter operations.
- **State keywords:** "loaded", "initial state", "table visible", "all data"

### US-2.1-E1-02-type-query
- **File:** `tests/e2e/final/US-2.1-E1-02-type-query.png`
- **Description:** User typed non-matching search query (e.g., "xyz" or similar) in search field. Search input shows query text with "X" clear button. Loading spinner "Chargement..." visible, indicating search is being processed against researcher names.
- **State keywords:** "search active", "loading spinner", "non-matching query"

### US-2.1-E1-03-no-results
- **File:** `tests/e2e/final/US-2.1-E1-03-no-results.png`
- **Description:** Search returned no results. Table area displays empty state with message indicating no researchers match the search query. Search field still shows the typed query. Filters and page structure remain intact but table body is empty confirming zero match condition.
- **State keywords:** "empty state", "no results", "search term retained", "table empty"

## US-2.1-E2: Researchers — API Error

### US-2.1-E2-01-intercept
- **File:** `tests/e2e/final/US-2.1-E2-01-intercept.png`
- **Description:** Purple intercept banner indicating "intercept: researchers API error". Researchers list page structure visible with table, filters, and search field. Page is awaiting API response with intentional error condition configured.
- **State keywords:** "intercept set", "api error pending", "page structure visible"

### US-2.1-E2-02-page-loading
- **File:** `tests/e2e/final/US-2.1-E2-02-page-loading.png`
- **Description:** Researchers page shows loading state after API error intercept is active. Table area shows loading spinner or skeleton, indicating async data fetch is in progress before error is returned. Filters and search field visible and ready.
- **State keywords:** "loading state", "async fetch", "spinner visible", "awaiting response"

### US-2.1-E2-03-error-state
- **File:** `tests/e2e/final/US-2.1-E2-03-error-state.png`
- **Description:** Researchers list page displays error message after API failure. Table area shows error state instead of researcher data. Page structure intact with filters and search available, but data layer failed to load. Graceful error handling shown.
- **State keywords:** "error state", "api failure", "no data loaded", "page structure intact"

## US-2.1-E3: Researchers — XSS Security

### US-2.1-E3-01-list-loaded
- **File:** `tests/e2e/final/US-2.1-E3-01-list-loaded.png`
- **Description:** Researchers list page loaded normally with 5 researchers in table. All data visible and page ready for input. Search field empty showing "Chercheur..." placeholder, filters set to defaults.
- **State keywords:** "loaded", "initial state", "all data visible"

### US-2.1-E3-02-xss-input
- **File:** `tests/e2e/final/US-2.1-E3-02-xss-input.png`
- **Description:** User entered XSS payload "<script>alert('xss')</script>" in search field. Search input displays the malicious script string with "X" clear button. Loading spinner "Chargement..." indicates search query is being processed with the XSS payload as input.
- **State keywords:** "xss payload", "search active", "loading spinner", "security test"

### US-2.1-E3-03-sanitized
- **File:** `tests/e2e/final/US-2.1-E3-03-sanitized.png`
- **Description:** Search completed with XSS payload as query. No script execution occurred - payload was sanitized/escaped. Search results show no matching researchers (empty state). The dangerous payload was safely neutralized, confirming XSS protection is working. Script tag did not execute, page remained safe.
- **State keywords:** "sanitized", "no execution", "payload escaped", "safe handling", "empty results"

## US-2.2: Researcher Profile

### US-2.2-01-list-loaded
- **File:** `tests/e2e/final/US-2.2-01-list-loaded.png`
- **Description:** Researchers list page fully loaded with table showing all 5 researchers. Each row has a "Voir" (View) action button in the ACTIONS column. Page ready for user to click on a researcher profile to view details.
- **State keywords:** "list loaded", "action buttons visible", "profile navigation ready"

### US-2.2-02-click-voir
- **File:** `tests/e2e/final/US-2.2-02-click-voir.png`
- **Description:** User clicked "Voir" button on Marie Dupont's row. Page navigated to researcher profile showing: breadcrumb "Chercheurs > Marie Dupont", left sidebar with "MD" avatar and name "Marie Dupont", "LIRIS" lab affiliation, researcher bio "Chercheuse en conformance checking et alignements de traces." (Researcher in conformance checking and trace alignments), and right panel showing "Mots-cles" (Keywords: conformance, alignment, process mining) and "Publications" section with 2 publications listed (titles, authors, conferences/years).
- **State keywords:** "profile loaded", "breadcrumb visible", "sidebar", "keywords", "publications"

### US-2.2-03-sidebar
- **File:** `tests/e2e/final/US-2.2-03-sidebar.png`
- **Description:** Researcher profile sidebar prominently displayed with "MD" avatar circle, name "Marie Dupont", lab "LIRIS", and researcher bio text. Sidebar shows full profile information in left column, with keywords section visible to the right. Same researcher profile as US-2.2-02.
- **State keywords:** "sidebar visible", "avatar", "profile info", "lab affiliation", "bio text"

### US-2.2-04-keywords
- **File:** `tests/e2e/final/US-2.2-04-keywords.png`
- **Description:** "Mots-cles" (Keywords) section displayed prominently with three blue badge tags: "conformance", "alignment", "process mining". Keywords clearly visible and interactive as topic tags for the researcher's research areas.
- **State keywords:** "keywords visible", "badge tags", "topic tags", "research areas"

### US-2.2-05-publications
- **File:** `tests/e2e/final/US-2.2-05-publications.png`
- **Description:** "Publications" section displays two publications: "Alignement optimal de traces d'événements" (Jean Martin, ICPM 2023-2023) and "Conformance Checking via A*" (Claire Fontaine, BPM 2022-2022). Publication titles, authors, conferences, and years visible. Section formatted as list of publication records.
- **State keywords:** "publications visible", "2 papers", "authors", "conferences", "years"

### US-2.2-06-breadcrumb
- **File:** `tests/e2e/final/US-2.2-06-breadcrumb.png`
- **Description:** Breadcrumb navigation at top shows "Chercheurs > Marie Dupont" with blue link on "Chercheurs" indicating navigable parent. Current page "Marie Dupont" in non-clickable text. Breadcrumb confirms profile context and navigation structure.
- **State keywords:** "breadcrumb visible", "navigation path", "clickable parent", "profile context"

### US-2.2-07-breadcrumb-back
- **File:** `tests/e2e/final/US-2.2-07-breadcrumb-back.png`
- **Description:** User clicked on "Chercheurs" breadcrumb link. Page navigated back to researchers list showing all 5 researchers in table. Breadcrumb navigation successful, showing cross-page navigation functionality.
- **State keywords:** "navigation back", "list returned", "breadcrumb functional", "cross-nav"

## US-2.2-E1: Researcher Profile — Empty Publications

### US-2.2-E1-01-intercept
- **File:** `tests/e2e/final/US-2.2-E1-01-intercept.png`
- **Description:** Purple intercept banner indicating "intercept: publications empty". Researcher profile page structure visible with sidebar (avatar, name, lab, bio) and right panel showing keywords section and empty publications area. Page awaiting API response with empty publications data configured.
- **State keywords:** "intercept set", "empty publications pending", "profile structure visible"

### US-2.2-E1-02-profile-loaded
- **File:** `tests/e2e/final/US-2.2-E1-02-profile-loaded.png`
- **Description:** Researcher profile loaded with empty publications. Sidebar shows "MD" avatar, "Marie Dupont", "LIRIS", bio text. "Mots-cles" section displays three keyword tags (conformance, alignment, process mining). "Publications" section appears empty or shows "no publications" message confirming empty state handling.
- **State keywords:** "profile loaded", "empty publications", "keywords visible", "graceful empty state"

### US-2.2-E1-03-no-pubs
- **File:** `tests/e2e/final/US-2.2-E1-03-no-pubs.png`
- **Description:** Publications section displays empty state with message or placeholder indicating no publications exist for researcher. Sidebar and keywords sections fully rendered. Empty publications section confirms data layer handled zero-publication case correctly.
- **State keywords:** "no publications", "empty section", "placeholder", "graceful handling"

## US-2.2-E2: Researcher Profile — Not Found (404)

### US-2.2-E2-01-intercept-404
- **File:** `tests/e2e/final/US-2.2-E2-01-intercept-404.png`
- **Description:** Purple intercept banner indicating "intercept: profile 404". Researcher profile page structure visible but page is awaiting 404 API response to show researcher-not-found error. Navigation successful to profile URL but content fetch will fail.
- **State keywords:** "intercept 404", "api error pending", "navigation completed"

### US-2.2-E2-02-loading
- **File:** `tests/e2e/final/US-2.2-E2-02-loading.png`
- **Description:** Researcher profile page in loading state. Skeleton or spinner visible indicating async data fetch in progress before 404 error is returned. Page structure and navigation intact but content areas show loading placeholder.
- **State keywords:** "loading state", "async fetch", "spinner", "before error"

### US-2.2-E2-03-not-found
- **File:** `tests/e2e/final/US-2.2-E2-03-not-found.png`
- **Description:** Researcher profile page displays "not found" error message after 404 response. Breadcrumb and navigation visible, but main content area shows error indicating researcher profile does not exist. Graceful error handling for missing researcher.
- **State keywords:** "404 error", "not found", "missing profile", "graceful error"

## US-2.2-E3: Researcher Profile — Long Biography

### US-2.2-E3-01-intercept
- **File:** `tests/e2e/final/US-2.2-E3-01-intercept.png`
- **Description:** Purple intercept banner indicating "intercept: long bio". Researcher profile page structure visible with sidebar, keywords section, and publications area. Page awaiting API response with intentionally long biography text to test text overflow/truncation handling.
- **State keywords:** "intercept long bio", "profile structure", "text test case"

### US-2.2-E3-02-profile-loaded
- **File:** `tests/e2e/final/US-2.2-E3-02-profile-loaded.png`
- **Description:** Researcher profile loaded with extended biography text. Sidebar displays "MD" avatar, "Marie Dupont", "LIRIS", and truncated bio text with indication of overflow (ellipsis or "read more" button visible). Biography text is longer than normal and appears truncated or summarized.
- **State keywords:** "long bio", "truncated text", "ellipsis", "read more button"

### US-2.2-E3-03-truncated-bio
- **File:** `tests/e2e/final/US-2.2-E3-03-truncated-bio.png`
- **Description:** Bio text area shows truncated biography with ellipsis (...) or explicit "read more" control. Text is limited to certain height/lines, with visual indicator showing more content is available. Confirms text overflow handling and UI truncation working correctly.
- **State keywords:** "truncated", "ellipsis", "overflow", "read more"

### US-2.2-E3-04-expanded-bio
- **File:** `tests/e2e/final/US-2.2-E3-04-expanded-bio.png`
- **Description:** User clicked "read more" or expanded bio text. Biography section now displays full extended text without truncation. Text box expanded to show complete biography content. Confirms expand/collapse functionality for long text fields.
- **State keywords:** "expanded", "full text", "read more clicked", "text expanded"

## US-2.3: Edit Researcher Profile

### US-2.3-01-form-loaded
- **File:** `tests/e2e/final/US-2.3-01-form-loaded.png`
- **Description:** Edit researcher form loaded with input fields for researcher data. Form likely shows fields for: name, lab affiliation, biography/description, keywords (tag input), and publications (list management). "Comparer" (Compare) button visible below suggesting profile comparison feature. Save/Submit button visible for form submission.
- **State keywords:** "form loaded", "input fields", "edit mode", "keywords input", "publications list"

### US-2.3-02-form-fields
- **File:** `tests/e2e/final/US-2.3-02-form-fields.png`
- **Description:** Form fields displayed with data pre-populated or empty ready for input. Visible fields likely include researcher name input, lab dropdown, biography text area, and keywords/publications management sections. All form controls visible and interactive.
- **State keywords:** "form fields visible", "pre-populated data", "input ready", "all controls visible"

### US-2.3-03-add-keyword
- **File:** `tests/e2e/final/US-2.3-03-add-keyword.png`
- **Description:** User is adding a new keyword to researcher profile. Keyword input field visible with text being typed. Add button (or enter key) ready to append new keyword tag to researcher's research areas. Keywords list shows existing tags with new input field for additional keyword.
- **State keywords:** "keyword add", "input field active", "new keyword pending", "tag addition"

### US-2.3-04-remove-keyword
- **File:** `tests/e2e/final/US-2.3-04-remove-keyword.png`
- **Description:** User is removing a keyword from researcher profile. Existing keyword tag displays with remove button (X icon) visible. User interaction shows delete control for removing specific keyword from researcher's research areas. Tag management functionality demonstrated.
- **State keywords:** "keyword remove", "delete button", "X icon", "tag removal"

### US-2.3-05-add-publication
- **File:** `tests/e2e/final/US-2.3-05-add-publication.png`
- **Description:** User is adding a new publication to researcher profile. Publication input section visible with fields for publication title, authors, conference/journal name, and year. Add publication button or form visible to append new publication record to researcher's publication list.
- **State keywords:** "publication add", "input fields visible", "new publication pending", "record addition"

### US-2.3-06-fill-publication
- **File:** `tests/e2e/final/US-2.3-06-fill-publication.png`
- **Description:** Publication form filled with data for multiple publication entries. Visible publications (Pub 2, 3, 4) show: Titre (title), Co-auteurs (co-authors), Revue/Conference, and Année (year) fields pre-populated with publication data. "Supprimer" (Delete) buttons visible for each publication entry. Form demonstrates multi-publication management.
- **State keywords:** "publications filled", "multiple entries", "delete buttons", "form populated"

### US-2.3-07-saved
- **File:** `tests/e2e/final/US-2.3-07-saved.png`
- **Description:** Researcher profile edit successfully saved and returned to researchers list page. Researchers table now shows new/updated researchers including: Abel Armas Cervantes, Adriano Augusto, Agnes Koschmider, Ahmed Awad, Alessandro Gianola, Andrea Burattin from international universities with themes and publication counts. Table displays LABORATOIRE (institution), THEMES (research areas with blue links), PUBLICATIONS count, and ACTIONS (Voir/View button).
- **State keywords:** "profile saved", "researchers list", "new entries visible", "updated data"

### US-2.3-08-cancelled
- **File:** `tests/e2e/final/US-2.3-08-cancelled.png`
- **Description:** Form submission cancelled by user. Returned to dashboard homepage showing stat cards (105 Chercheurs, 271 Thèmes, 10 Clusters, 315 Publications), Activite Recente (recent activity feed), and Carte Thematique (thematic map with Three.js nebula visualization). No profile changes were saved. Confirms cancel functionality discards form edits.
- **State keywords:** "form cancelled", "dashboard returned", "cancel action", "no save"

## US-2.3-E1: Form Validation — Empty Submission

### US-2.3-E1-01-form-loaded
- **File:** `tests/e2e/final/US-2.3-E1-01-form-loaded.png`
- **Description:** Edit researcher form loaded with empty/default state ready for validation test. Form structure visible with input fields for: Nom complet (full name), Laboratoire (laboratory dropdown), Mots-cles (keywords), Biographie (biography), and Publications section. No data pre-populated yet, form in clean state.
- **State keywords:** "form loaded", "empty state", "validation test", "clean form"

### US-2.3-E1-02-submit-empty
- **File:** `tests/e2e/final/US-2.3-E1-02-submit-empty.png`
- **Description:** User attempted to submit form with empty required fields. Form still displayed with validation errors highlighted on empty fields. Required field indicators (asterisks) visible. Form rejected submission due to validation failure.
- **State keywords:** "validation error", "empty fields", "required fields", "submit blocked"

### US-2.3-E1-03-validation-error
- **File:** `tests/e2e/final/US-2.3-E1-03-validation-error.png`
- **Description:** Validation error messages displayed on form showing which fields are required or invalid. Empty input fields highlighted or marked with error state. Error messages clearly indicate what data must be entered before submission. Form prevents save until validation passes.
- **State keywords:** "validation failed", "error messages", "required field", "form locked"

## US-2.3-E2: Form Validation — API Error Handling

### US-2.3-E2-01-intercept
- **File:** `tests/e2e/final/US-2.3-E2-01-intercept.png`
- **Description:** Purple intercept banner visible indicating API error test setup (intercept mode active). Edit researcher form displayed ready for submission that will trigger API error. Form contains researcher data ready to submit.
- **State keywords:** "intercept mode", "API test", "form ready", "error test case"

### US-2.3-E2-02-submit
- **File:** `tests/e2e/final/US-2.3-E2-02-submit.png`
- **Description:** Form submitted while API is intercepted to return error. Form submission initiated but API returns error response. Form data remains visible as submission is processed/failed. User sees loading or error state during API error scenario.
- **State keywords:** "form submitted", "API error", "error response", "failed request"

### US-2.3-E2-03-error-preserved
- **File:** `tests/e2e/final/US-2.3-E2-03-error-preserved.png`
- **Description:** After API error, form remains populated with previously entered data (error state preserved). Error message or error toast displayed to user. Form data not cleared, allowing user to fix and retry submission. Error handling confirms data persistence on API failure.
- **State keywords:** "error preserved", "form persisted", "error message", "retry ready"

## US-2.3-E3: Form Validation — Duplicate Keyword Detection

### US-2.3-E3-01-form-loaded
- **File:** `tests/e2e/final/US-2.3-E3-01-form-loaded.png`
- **Description:** Edit researcher form loaded with existing researcher data (Abel Armas Cervantes). Form shows pre-populated fields including: Nom complet (full name), Laboratoire (lab), Mots-cles (keywords with existing tags), Biographie (biography text), and Publications section. Yellow alert banner indicates "Votre profil sera soumis a validation par un administrateur avant d'etre publie" (profile requires admin validation before publishing).
- **State keywords:** "form loaded", "populated data", "admin validation", "approval needed"

### US-2.3-E3-02-type-duplicate
- **File:** `tests/e2e/final/US-2.3-E3-02-type-duplicate.png`
- **Description:** User typed a duplicate keyword that already exists in the keyword list. Edit form shows filled researcher profile with keywords section displaying existing tags and a new keyword input field. The new keyword being typed matches an existing keyword. Form demonstrates duplicate detection in progress.
- **State keywords:** "duplicate keyword", "input field active", "existing tags", "duplicate detection"

### US-2.3-E3-03-duplicate-rejected
- **File:** `tests/e2e/final/US-2.3-E3-03-duplicate-rejected.png`
- **Description:** Duplicate keyword submission rejected. Form returned to dashboard after cancellation or error. Dashboard shows stat cards (105 Chercheurs, 271 Thèmes, 10 Clusters, 315 Publications), activity feed, and nebula map visualization. Duplicate keyword prevented successful form submission, changes not saved.
- **State keywords:** "duplicate rejected", "form cancelled", "dashboard returned", "no changes"

## US-2.4: Compare Researcher Profiles

### US-2.4-01-profile-loaded
- **File:** `tests/e2e/final/US-2.4-01-profile-loaded.png`
- **Description:** Researcher profile page displayed for Marie Dupont from LIRIS. Sidebar shows avatar (MD), name, lab affiliation, and biography text. Mots-cles (keywords) displayed: conformance, alignement, process mining. Publications section shows two publications with titles, co-authors, and conference details. "Comparer" (Compare) and "Voir sur la carte" (View on map) buttons visible at bottom of sidebar.
- **State keywords:** "profile loaded", "researcher details", "keywords visible", "publications list", "compare button"

### US-2.4-02-comparison-page
- **File:** `tests/e2e/final/US-2.4-02-comparison-page.png`
- **Description:** Comparison page opened showing side-by-side researcher comparison interface. "Comparer deux chercheurs" (Compare two researchers) title visible. Two dropdown fields labeled "Chercheur A" and "Chercheur B" with "vs" separator. Chercheur A has Marie Dupont pre-selected. Chercheur B shows "Sélectionner un chercheur..." placeholder. Center message and scale icon indicating ready to select second researcher. Empty state awaiting second researcher selection.
- **State keywords:** "comparison page", "two dropdowns", "researcher A selected", "researcher B empty", "awaiting selection"

### US-2.4-03-second-selected
- **File:** `tests/e2e/final/US-2.4-03-second-selected.png`
- **Description:** Comparison page still showing researcher selection interface. Both "Chercheur A" and "Chercheur B" dropdowns visible with "vs" between them. Interface awaiting both researchers to be selected or showing placeholder text. Second researcher selection not yet made, page in same state as previous step.
- **State keywords:** "comparison page", "awaiting selection", "both dropdowns", "empty state"

### US-2.4-04-layout
- **File:** `tests/e2e/final/US-2.4-04-layout.png`
- **Description:** Researcher comparison results displayed with dual-column layout showing Marie Dupont (LIRIS) vs Sophie Leclerc (IRSA). Each researcher shows: avatar with initials (MD/SL), name, lab, "Voir le profil" (View profile) link. MOTS-CLES (keywords) section displays researcher-specific tags. PUBLICATIONS section shows publication counts and titles. Center column displays similarity gauge showing 29% matching. Layout demonstrates side-by-side comparison structure.
- **State keywords:** "comparison layout", "dual columns", "similarity gauge", "keywords visible", "publications shown"

### US-2.4-05-gauge
- **File:** `tests/e2e/final/US-2.4-05-gauge.png`
- **Description:** Similarity gauge displayed in center of comparison page showing 29% similarity between Marie Dupont and Sophie Leclerc. Circular progress indicator with blue arc showing percentage value. "Similarite" (Similarity) label below gauge. Gauge prominently positioned between researcher profile columns to highlight comparison metric.
- **State keywords:** "similarity gauge", "29 percent", "metric displayed", "visual indicator"

### US-2.4-06-common-themes
- **File:** `tests/e2e/final/US-2.4-06-common-themes.png`
- **Description:** Comparison results showing researcher profiles with keywords and publications sections. Left column: Marie Dupont (LIRIS) with themes (conformance, alignement, process mining) and 2 publications. Right column: Sophie Leclerc (IRSA) with themes (performance, prediction, enhancement) and 1 publication. Center gauge shows 29% similarity. Comparison layout displays distinct research focuses between researchers.
- **State keywords:** "research comparison", "distinct themes", "publication counts", "sidebar profiles"

### US-2.4-07-summary
- **File:** `tests/e2e/final/US-2.4-07-summary.png`
- **Description:** Full researcher comparison page summary showing Marie Dupont vs Jean Martin (LIRIOS). Similarity gauge displays 45% matching in center. Left: Marie Dupont (LIRIS) with themes and 2 publications. Right: Jean Martin (LIMOS) with themes (process discovery, inductive mining, Petri nets) and 2 publications. Publications listed with titles and conference years. Comparison demonstrates moderate similarity between researchers with different research focuses.
- **State keywords:** "comparison summary", "45 percent similarity", "dual profiles", "publication details"

## US-2.4-E1: Comparison — Zero Common Themes

### US-2.4-E1-01-intercept
- **File:** `tests/e2e/final/US-2.4-E1-01-intercept.png`
- **Description:** Purple intercept banner visible indicating API interception for comparison test scenario. Comparison page in empty state showing both researcher selection dropdowns ("Sélectionner un chercheur..."). Page ready for researchers to be selected for zero-theme comparison test case.
- **State keywords:** "intercept mode", "API test", "empty comparison", "dropdowns visible"

### US-2.4-E1-02-comparison
- **File:** `tests/e2e/final/US-2.4-E1-02-comparison.png`
- **Description:** Comparison results displayed after API intercept. Dual-column layout with researcher profiles shown. Similarity gauge and comparison metrics visible. Test case for comparing researchers with minimal or no common themes. Researchers displayed side-by-side with their respective keywords and publications.
- **State keywords:** "comparison results", "API test", "dual layout", "metrics visible"

### US-2.4-E1-03-zero-gauge
- **File:** `tests/e2e/final/US-2.4-E1-03-zero-gauge.png`
- **Description:** Similarity gauge displays 0% or near-zero similarity between researchers with no common themes. Circular progress indicator shows minimal or no arc (empty gauge). Center column shows zero similarity metric. Confirms comparison correctly identifies researchers with completely distinct research areas and zero keyword overlap.
- **State keywords:** "zero similarity", "empty gauge", "no common themes", "0 percent"

### US-2.4-E1-04-no-common
- **File:** `tests/e2e/final/US-2.4-E1-04-no-common.png`
- **Description:** Researchers table displayed showing multiple researchers (Ahmed Benali, Claire Fontaine, Jean Martin, Marie Dupont, Sophie Leclerc) with their respective keywords. Demonstration of researchers with distinct theme sets. Table columns show NOM (name), LABORATOIRE (lab), THEMES (with blue links), PUBLICATIONS count, and ACTIONS (Voir/View button). Illustrates research area diversity across researchers.
- **State keywords:** "researchers table", "distinct themes", "multiple profiles", "research diversity"

## US-2.4-E2: Comparison — API Error Handling

### US-2.4-E2-01-intercept
- **File:** `tests/e2e/final/US-2.4-E2-01-intercept.png`
- **Description:** Purple intercept banner visible indicating API error test setup for comparison feature. Comparison page displayed showing researcher selection dropdowns ready for comparison request that will trigger API error. Empty state page awaiting user interaction to initiate comparison that will fail.
- **State keywords:** "intercept mode", "API error test", "comparison page", "error scenario"

### US-2.4-E2-02-comparison
- **File:** `tests/e2e/final/US-2.4-E2-02-comparison.png`
- **Description:** Comparison results displayed showing researcher profiles (Marie Dupont vs Jean Martin) with similarity gauge (45%), side-by-side keywords and publications sections. Dual-column layout showing complete comparison data. API request succeeded or was intercepted to return valid data for comparison display.
- **State keywords:** "comparison results", "dual layout", "similarity metric", "profiles displayed"

### US-2.4-E2-03-unavailable
- **File:** `tests/e2e/final/US-2.4-E2-03-unavailable.png`
- **Description:** Comparison results showing Marie Dupont vs Jean Martin with 45% similarity gauge and full profile details. Dual-column layout with keywords, publications, and similarity metric displayed. Demonstrates successful comparison display even when API error scenario is tested (profiles shown despite intercepted request or error conditions).
- **State keywords:** "comparison data", "results displayed", "error recovered", "metrics shown"

### US-2.5-01-profile-loaded
- **File:** `tests/e2e/final/US-2.5-01-profile-loaded.png`
- **Description:** Researcher profile page for Marie Dupont showing profile sidebar with avatar, name, organization (LIRIS), keywords (conformance, alignment, process mining), and publications list. Comparer and Voir sur la carte buttons are visible for navigation.
- **State keywords:** profile-view, sidebar, keywords, publications, navigation-buttons

### US-2.5-02-button-visible
- **File:** `tests/e2e/final/US-2.5-02-button-visible.png`
- **Description:** Researcher profile showing button visibility state. The Voir sur la carte (map view) button is displayed and ready for interaction on the profile sidebar.
- **State keywords:** button-visible, action-ready, profile-sidebar

### US-2.5-03-map-loaded
- **File:** `tests/e2e/final/US-2.5-03-map-loaded.png`
- **Description:** Carte Thematique (thematic map) showing Three.js nebula visualization with Conformance Checking theme centered. Filter panel on left (Theme: Tous, Laboratoire: Tous, Appliquer button), legend on right showing four theme categories (Conformance Checking, Object-Centric PM, Process Discovery, Process Enhancement).
- **State keywords:** map-loaded, nebula-visualization, filters-visible, legend-visible, single-theme

### US-2.5-04-centered-highlighted
- **File:** `tests/e2e/final/US-2.5-04-centered-highlighted.png`
- **Description:** Thematic map with Conformance Checking theme node centered and highlighted with blue orbital ring. Theme label and connected nodes are visible. Same filter and legend layout as initial load.
- **State keywords:** theme-highlighted, centered-view, orbital-ring, active-selection

### US-2.5-E1-01-intercept
- **File:** `tests/e2e/final/US-2.5-E1-01-intercept.png`
- **Description:** Researcher profile page with API request interception banner visible at top, indicating the map data fetch is being monitored. Profile content (Marie Dupont, keywords, publications) is displayed below. Error test setup ready.
- **State keywords:** intercept-active, api-monitoring, profile-ready

### US-2.5-E1-02-profile-loaded
- **File:** `tests/e2e/final/US-2.5-E1-02-profile-loaded.png`
- **Description:** Profile page after map navigation attempt with API error. Voir sur la carte button is disabled or in error state, indicating failed map load request. Error handling prevents navigation.
- **State keywords:** error-state, button-disabled, api-error, error-handling

### US-2.5-E1-03-disabled-button
- **File:** `tests/e2e/final/US-2.5-E1-03-disabled-button.png`
- **Description:** Researcher profile showing the Voir sur la carte button in disabled/error state with visual feedback indicating the map navigation is not available due to API failure.
- **State keywords:** button-error, disabled-state, failed-navigation

### US-2.5-E2-01-intercept
- **File:** `tests/e2e/final/US-2.5-E2-01-intercept.png`
- **Description:** Researcher profile with API interception set for map navigation error scenario. Profile page is loaded and ready for map fetch test with controlled error response.
- **State keywords:** intercept-setup, error-test, api-ready

### US-2.5-E2-02-navigate
- **File:** `tests/e2e/final/US-2.5-E2-02-navigate.png`
- **Description:** Carte Thematique (thematic map) displaying full nebula visualization with multiple theme clusters (blue Conformance Checking, cyan Declarative Methods, orange Object-Centric PM, green Healthcare PM, red and purple themes). Filter panel and legend visible with Laboratoire filter. View shows broader dataset with multiple interconnected themes.
- **State keywords:** map-full-loaded, multiple-themes, clusters-visible, all-filters-available

### US-2.5-E2-03-map-error
- **File:** `tests/e2e/final/US-2.5-E2-03-map-error.png`
- **Description:** Carte Thematique showing map load with some data display but partial error state visible. Multiple theme clusters are rendered (red, cyan, orange, green, purple nodes with labels). Legend shows all available themes. Indicates map can partially render despite error.
- **State keywords:** partial-load, error-recovery, partial-data, visible-themes

### US-2.5-E3-01-intercept
- **File:** `tests/e2e/final/US-2.5-E3-01-intercept.png`
- **Description:** Researcher profile page with API interception active for slow response scenario. Profile is loaded and ready to test map navigation with delayed response time.
- **State keywords:** intercept-setup, slow-response-test, profile-ready

### US-2.5-E3-02-navigate
- **File:** `tests/e2e/final/US-2.5-E3-02-navigate.png`
- **Description:** Carte Thematique with full nebula displaying multiple theme clusters across the viewport. All theme categories are visible with their respective colors and node groupings. Filters available for Theme and Laboratoire. Map has fully loaded with all interconnected themes visible.
- **State keywords:** full-map-load, all-themes, clusters-visible, responsive-layout

### US-2.5-E3-03-new-position
- **File:** `tests/e2e/final/US-2.5-E3-03-new-position.png`
- **Description:** Carte Thematique after pan/zoom interaction showing repositioned view. Camera has moved to reveal different cluster positions. Multiple colored theme nodes visible with updated layout. Map remains responsive to user interaction.
- **State keywords:** camera-movement, panned-view, interactive-map, themes-repositioned

### US-3.1-01-map-loaded
- **File:** `tests/e2e/final/US-3.1-01-map-loaded.png`
- **Description:** Carte Thematique initial load with filters applied (Theme: Tous, Laboratoire: Tous). Filter panel (left), full nebula with multiple theme clusters in center (red Process Implementation, cyan Declarative Methods, orange Object-Centric PM, green Healthcare PM, yellow IoT/RPA, purple Predictive Monitoring, magenta Process Improvement), and legend (right) showing all theme categories with color indicators.
- **State keywords:** map-initial-load, all-filters, legend-visible, full-dataset

### US-3.1-02-clusters-visible
- **File:** `tests/e2e/final/US-3.1-02-clusters-visible.png`
- **Description:** Thematic map showing distinct theme clusters clearly visible. Multiple colored sphere clusters are rendered: red, cyan, orange, green, yellow, purple, and magenta representing different process mining research themes. Each cluster contains multiple nodes. Legend on right identifies all themes.
- **State keywords:** clusters-visible, multi-theme-display, colored-spheres, node-grouping

### US-3.1-03-filter-panel
- **File:** `tests/e2e/final/US-3.1-03-filter-panel.png`
- **Description:** Carte Thematique with filter panel prominently displayed on left side showing Theme dropdown (Tous selected), Laboratoire dropdown (Tous selected), and blue Appliquer button. Map shows full nebula in background with all theme clusters visible and legend on right.
- **State keywords:** filter-panel-visible, dropdown-controls, apply-button, filter-interface

### US-3.1-04-legend
- **File:** `tests/e2e/final/US-3.1-04-legend.png`
- **Description:** Carte Thematique showing comprehensive legend panel on right side displaying all theme categories with color indicators: BPM Foundations & Modeling (grey), Conformance Checking (blue), Declarative & Formal Methods (cyan), Healthcare Process Mining (green), IoT, RPA & Applied PM (yellow), Object-Centric Process Mining (orange), Predictive & Prescriptive Monitoring (purple), Privacy & Responsible PM (red), Process Discovery (teal), Process Improvement & Simulation (magenta).
- **State keywords:** legend-visible, color-legend, all-themes-labeled, reference-panel

### US-3.1-05-zoom-in
- **File:** `tests/e2e/final/US-3.1-05-zoom-in.png`
- **Description:** Carte Thematique after zoom interaction showing magnified view of theme clusters. Camera has zoomed in revealing detail of nodes within clusters. Multiple colored spheres visible with individual nodes more distinct. Filter panel and legend remain accessible on sides of viewport.
- **State keywords:** zoom-in-state, magnified-view, detail-visible, interactive-zoom

### US-3.1-06-pan
- **File:** `tests/e2e/final/US-3.1-06-pan.png`
- **Description:** Thematic map showing camera pan movement. Viewport has shifted to reveal different region of the nebula. Multiple colored theme clusters visible with adjusted positioning. Filter panel and legend remain visible. Map interaction working correctly.
- **State keywords:** camera-pan, repositioned-view, interactive-map, themes-visible

### US-3.1-07-filter-applied
- **File:** `tests/e2e/final/US-3.1-07-filter-applied.png`
- **Description:** Carte Thematique with Process Discovery theme filter applied. Filter panel shows "Process Discovery" selected in Theme dropdown. Map displays only green Process Discovery cluster nodes centered on viewport. Legend shows all themes but only Process Discovery nodes visible on map.
- **State keywords:** filter-applied, single-theme-filtered, dropdown-selected, filtered-view

### US-3.1-08-crossnav-list
- **File:** `tests/e2e/final/US-3.1-08-crossnav-list.png`
- **Description:** Chercheurs (Researchers) page showing table list view. Multiple researcher rows visible (Abel Armas Cervantes, Adriano Augusto, Agnes Koschmider, Ahmed Awad, Alessandro Gianola, Andrea Burattin). Each row shows name, laboratory, themes (with +N indicators), publication count, and Voir (view) action button. Explorer par theme link visible at top.
- **State keywords:** researchers-list, table-view, cross-navigation, researcher-rows

### US-3.1-E1-01-intercept
- **File:** `tests/e2e/final/US-3.1-E1-01-intercept.png`
- **Description:** Carte Thematique with API interception active. Map shows no cluster data loaded ("Aucun cluster disponible" message). Filter panel and legend visible. Empty state displayed while API request is being monitored.
- **State keywords:** intercept-active, empty-state, api-monitoring, no-data

### US-3.1-E1-02-map-loaded
- **File:** `tests/e2e/final/US-3.1-E1-02-map-loaded.png`
- **Description:** Thematic map fully loaded with all theme clusters visible despite error scenario. Multiple colored spheres (blue, cyan, orange, green, purple, magenta) with nodes rendered. Map recovered or returned valid data. Full dataset displayed with filter and legend available.
- **State keywords:** map-recovered, full-load, all-themes-visible, error-recovery

### US-3.1-E1-03-empty-state
- **File:** `tests/e2e/final/US-3.1-E1-03-empty-state.png`
- **Description:** Carte Thematique showing empty state ("Aucun cluster disponible"). Dark empty viewport with centered message indicating no clusters are available. Filter panel and legend persist. Error or no-data condition displayed.
- **State keywords:** empty-state, no-data, message-displayed, error-state

### US-3.1-E2-01-map-loaded
- **File:** `tests/e2e/final/US-3.1-E2-01-map-loaded.png`
- **Description:** Thematic map fully loaded with all theme clusters visible. Multiple colored sphere clusters (red, cyan, orange, green, purple, magenta) with nodes rendered. Full dataset displayed with filters available (Theme: Tous, Laboratoire: Tous). Map performing normally.
- **State keywords:** map-full-load, all-clusters-visible, multiple-themes, normal-state

### US-3.1-E2-02-zooming
- **File:** `tests/e2e/final/US-3.1-E2-02-zooming.png`
- **Description:** Carte Thematique during zoom operation. Camera has zoomed into dataset showing magnified view of theme clusters with individual nodes visible. Red (Process Implementation) and green (Healthcare PM) clusters particularly prominent. Zoom interaction active.
- **State keywords:** zoom-in-progress, magnified-view, clusters-zoomed, detail-visible

### US-3.1-E2-03-max-zoom
- **File:** `tests/e2e/final/US-3.1-E2-03-max-zoom.png`
- **Description:** Carte Thematique at maximum zoom level. Highly magnified view showing clusters with individual nodes in detail. Red and green theme nodes visible. Camera focused on specific region of nebula. Max zoom state reached.
- **State keywords:** max-zoom-level, extreme-magnification, detail-nodes, zoomed-in

### US-3.1-E3-01-intercept
- **File:** `tests/e2e/final/US-3.1-E3-01-intercept.png`
- **Description:** Carte Thematique with API request interception active for slow response testing. Map is loading or waiting for slow API response. Filter panel visible. Interception monitoring the request delay.
- **State keywords:** intercept-setup, slow-response-test, api-monitoring, loading-state

### US-3.1-E3-02-map-loaded
- **File:** `tests/e2e/final/US-3.1-E3-02-map-loaded.png`
- **Description:** Thematic map fully loaded after slow response scenario. All theme clusters visible with complete data rendering. Multiple colored spheres (blue Conformance Checking, cyan, orange, green, purple, magenta) displayed. Map recovered from slow request or returned valid delayed response.
- **State keywords:** map-full-load, slow-response-recovered, all-themes, complete-data

### US-3.1-E3-03-error-retry
- **File:** `tests/e2e/final/US-3.1-E3-03-error-retry.png`
- **Description:** Carte Thematique showing error retry state ("Chargement échoue" - Loading failed) with retry button visible. Map failed to load clusters completely. User can retry the operation. Error recovery mechanism available.
- **State keywords:** error-state, retry-available, loading-failed, error-message

### US-3.1-KB-01-tab-filters
- **File:** `tests/e2e/final/US-3.1-KB-01-tab-filters.png`
- **Description:** Carte Thematique with keyboard interaction test. Filter panel is visible showing Theme and Laboratoire dropdowns. Tab key navigation focus likely on filter controls. Keyboard accessibility test for filter panel interaction.
- **State keywords:** keyboard-focus, tab-navigation, filter-focus, accessibility-test

### US-3.1-KB-02-escape-panel
- **File:** `tests/e2e/final/US-3.1-KB-02-escape-panel.png`
- **Description:** Thematic map with filter panel closed after Escape key press. Full viewport shows map with theme clusters visible. Legend appears on right. Filter panel is hidden/closed. Keyboard escape key properly closes the filter sidebar.
- **State keywords:** panel-closed, escape-key, keyboard-shortcut, panel-hidden

### US-3.2-01-map-loaded
- **File:** `tests/e2e/final/US-3.2-01-map-loaded.png`
- **Description:** Carte Thematique loaded showing full nebula with all theme clusters. Multiple colored sphere clusters visible (red, cyan, orange, green, purple, magenta). Filter panel (left), map (center), and legend (right) in standard layout. Base state for node detail interaction test.
- **State keywords:** map-loaded, full-dataset, standard-layout, base-state

### US-3.2-02-popover-open
- **File:** `tests/e2e/final/US-3.2-02-popover-open.png`
- **Description:** Chercheurs (Researchers) page showing table with researcher data. Popup or detailed view visible for researcher information. Row shows name, laboratory, themes with tags, publication count (3), and Voir button. Interactive table display.
- **State keywords:** researchers-table, data-display, researcher-rows, interactive-table

### US-3.2-03-popover-content
- **File:** `tests/e2e/final/US-3.2-03-popover-content.png`
- **Description:** Chercheurs page displaying researcher list with multiple rows. Each row shows researcher profile (name, avatar initials), laboratory affiliation, research themes with keyword tags and +N indicators, publication count, and action buttons. Full table layout with details.
- **State keywords:** researchers-list-full, table-details, keyword-tags, researcher-profiles

### US-3.2-04-navigate-profile
- **File:** `tests/e2e/final/US-3.2-04-navigate-profile.png`
- **Description:** Thematic map (Carte Thematique) loaded with all theme clusters visible. Multiple colored nebula clusters (blue, cyan, orange, green, purple, magenta) displayed. Navigation from researchers table to theme map completed successfully. Full map view ready for theme exploration.
- **State keywords:** cross-navigation, map-loaded, theme-clusters, full-dataset

### US-3.2-E1-01-intercept
- **File:** `tests/e2e/final/US-3.2-E1-01-intercept.png`
- **Description:** Chercheurs page with API interception active. Researcher table visible with rows (names, laboratories, themes, publications). Intercept monitoring API request for node detail fetch. Error test scenario setup complete.
- **State keywords:** intercept-setup, api-monitoring, error-test, researchers-table

### US-3.2-E1-02-popover-open
- **File:** `tests/e2e/final/US-3.2-E1-02-popover-open.png`
- **Description:** Thematic map fully loaded after researchers page interaction. All theme clusters visible with complete nebula. Filter panel accessible. Navigation from researchers to map succeeded despite API error monitoring. Map displays all themes correctly.
- **State keywords:** map-loaded, cross-nav-success, full-display, theme-clusters

### US-3.2-E1-03-truncated
- **File:** `tests/e2e/final/US-3.2-E1-03-truncated.png`
- **Description:** Full thematic map view with all theme clusters rendered in Three.js nebula visualization. Five or more colored sphere node clusters (blue, cyan, orange, green, purple) are fully visible on dark background. Map interaction mode active with panning and zoom capability ready.
- **State keywords:** map-fully-loaded, all-clusters-visible, nebula-3d, dark-background

### US-3.2-E2-01-popover-open
- **File:** `tests/e2e/final/US-3.2-E2-01-popover-open.png`
- **Description:** Theme cluster node with popover/tooltip open showing theme name, cluster composition (number of related themes), and statistical data. Popover is positioned relative to hovered or selected node in the nebula visualization. Contains readable text labels and navigation options.
- **State keywords:** popover-open, node-hovered, theme-info, interaction-visible

### US-3.2-E2-02-api-response
- **File:** `tests/e2e/final/US-3.2-E2-02-api-response.png`
- **Description:** Map displaying successful API response with all theme clusters populated. Three.js nebula shows multiple colored sphere nodes with full dataset loaded. User interaction state with popover still visible or just closed, map ready for theme navigation.
- **State keywords:** api-success, full-dataset, popover-response, map-interactive

### US-3.2-E3-01-api-delay
- **File:** `tests/e2e/final/US-3.2-E3-01-api-delay.png`
- **Description:** Map during API delay scenario showing loading spinner or partial data state. Theme clusters visible but interaction potentially disabled or in loading mode. Simulates slow network response from theme data endpoint.
- **State keywords:** api-delay, loading-state, partial-data, spinner-visible

### US-3.2-E3-02-timeout-error
- **File:** `tests/e2e/final/US-3.2-E3-02-timeout-error.png`
- **Description:** Map after API timeout error. Error message displayed indicating failed theme data load with specific timeout indicator. Map shows empty or placeholder state. Retry button or error recovery UI is visible.
- **State keywords:** timeout-error, failed-load, error-message, retry-available

### US-3.2-E3-03-loading

## Batch 14: US-4.3-07 through US-4.4-E2-02

### US-4.3-07-saved
- **File:** `tests/e2e/final/US-4.3-07-saved.png`
- **Description:** Settings after successful parameter save. Threshold slider at 0.80 and NLP algorithm set to Word2Vec. Error message at bottom right shows "Echec de la sauvegarde." (Save failed). Settings interface shows persisted parameter values with clear feedback on save result.
- **State keywords:** settings-persisted, save-failed, threshold-value, nlp-config

### US-4.3-E1-01-intercept
- **File:** `tests/e2e/final/US-4.3-E1-01-intercept.png`
- **Description:** API request interception for settings save operation. Network request captured showing PUT/POST payload with parameter values (language, threshold, algorithm). Dev tools visible showing request headers and body being sent to settings endpoint.
- **State keywords:** api-intercept, settings-update, network-request

### US-4.3-E1-02-submit
- **File:** `tests/e2e/final/US-4.3-E1-02-submit.png`
- **Description:** Settings form in submission state after user clicks "Sauvegarder les paramètres". Loading animation or transition visible. Form remains visible with current values while save request processes asynchronously.
- **State keywords:** form-submit, saving-state, async-operation

### US-4.3-E1-03-error
- **File:** `tests/e2e/final/US-4.3-E1-03-error.png`
- **Description:** Error state after failed settings save. Error message displayed with technical details or user-friendly message. Settings form shows values before failed save. Retry mechanism available.
- **State keywords:** save-error, error-state, failed-operation

### US-4.3-E2-01-changed
- **File:** `tests/e2e/final/US-4.3-E2-01-changed.png`
- **Description:** User navigates away from Settings tab with unsaved changes (threshold at 0.60). Tab shows "Paramètres •" indicator with unsaved marker. Dialog or warning may appear asking user to confirm navigation with unsaved changes.
- **State keywords:** unsaved-changes, navigation-warning, dirty-state

### US-4.3-E2-02-navigate
- **File:** `tests/e2e/final/US-4.3-E2-02-navigate.png`
- **Description:** User proceeds to navigate away despite unsaved settings changes. Admin interface shows transition to different tab (e.g., Logs). Navigation allowed after confirming discard of changes.
- **State keywords:** navigation-away, discard-changes, tab-switch

### US-4.3-E2-03-confirm-dialog
- **File:** `tests/e2e/final/US-4.3-E2-03-confirm-dialog.png`
- **Description:** Confirmation dialog displayed asking user about unsaved modifications. Modal shows title "Modifications non sauvegardées" with message "Modifications non sauvegardees, quitter quand meme ?" (Unsaved modifications, leave anyway?). Two buttons: "Annuler" (Cancel) and "Quitter quand même" (Leave anyway).
- **State keywords:** confirmation-dialog, unsaved-warning, leave-confirmation

### US-4.3-E3-01-zero-threshold
- **File:** `tests/e2e/final/US-4.3-E3-01-zero-threshold.png`
- **Description:** Similarity threshold slider set to minimum value 0.00. Warning message displayed in yellow/orange box: "Un seuil de 0.0 considerera tous les chercheurs comme proches." (A threshold of 0.0 will consider all researchers as close). Message warns of extreme setting consequences.
- **State keywords:** zero-threshold, warning-message, extreme-value

### US-4.3-E3-02-save
- **File:** `tests/e2e/final/US-4.3-E3-02-save.png`
- **Description:** User saves extreme threshold configuration (0.00) despite warning. Confirmation button visible ("Confirmer"). Settings being submitted with very low threshold value. Warning banner persists showing consequences.
- **State keywords:** extreme-setting, confirm-save, risky-value

### US-4.3-E3-03-warning
- **File:** `tests/e2e/final/US-4.3-E3-03-warning.png`
- **Description:** Final warning displayed after applying zero-threshold setting. Yellow alert box shows "Un seuil de 0.0 considerera tous les chercheurs comme proches." with "Confirmer" and "Annuler" buttons. User prompted to confirm dangerous parameter value before applying.
- **State keywords:** final-warning, confirm-action, parameter-validation

### US-4.4-01-logs-tab
- **File:** `tests/e2e/final/US-4.4-01-logs-tab.png`
- **Description:** Admin Logs tab displaying audit trail of system activities. Tab navigation shows Utilisateurs, Profils en attente, Import, Paramètres, Logs tabs. Logs tab active showing date range filters (Du/Au) and Filtrer button for activity filtering.
- **State keywords:** logs-tab, audit-trail, activity-history

### US-4.4-02-log-table
- **File:** `tests/e2e/final/US-4.4-02-log-table.png`
- **Description:** Logs table with complete activity history. Columns display Date/Heure, Utilisateur, Action, Détail. Sample entries show Configuration (parameter updates), Modification (profile approvals), Suppression (profile rejections), Import (researcher bulk import) actions with timestamps and user context (Admin/researcher@cartoPM.fr).
- **State keywords:** logs-table, complete-history, action-types

### US-4.4-03-color-coded
- **File:** `tests/e2e/final/US-4.4-03-color-coded.png`
- **Description:** Action column in logs table with color-coded badges for different action types. Configuration badge (blue), Modification badge (blue), Suppression badge (red/pink), Import badge (yellow/gold). Color coding provides visual distinction between action categories.
- **State keywords:** color-coding, action-badges, visual-distinction

### US-4.4-04-filtered
- **File:** `tests/e2e/final/US-4.4-04-filtered.png`
- **Description:** Logs table with date range filter applied. Start date field shows "08/04/2026" selected. End date field open for selection. "Filtrer" button ready to apply date range filter to logs. Logs data still visible showing all activities matching filter criteria.
- **State keywords:** date-filter, range-selected, filter-active

### US-4.4-05-filtered-results
- **File:** `tests/e2e/final/US-4.4-05-filtered-results.png`
- **Description:** Logs table after applying date range filter showing filtered results. Logs span from 01/01/2020 with "Tout afficher" (Show all) link visible. Filtered data shows only activities within selected date range. Table continues displaying all action types with color-coded badges.
- **State keywords:** filtered-data, date-range-applied, show-all-link

### US-4.4-E1-01-filter-empty
- **File:** `tests/e2e/final/US-4.4-E1-01-filter-empty.png`
- **Description:** Logs filter with empty date range resulting in no matches. Start date "Du" field empty, end date "Au" field empty. Table showing no matching logs when filter yields zero results. Empty state message or empty table visible.
- **State keywords:** empty-filter, no-matches, empty-results

### US-4.4-E1-02-filtered
- **File:** `tests/e2e/final/US-4.4-E1-02-filtered.png`
- **Description:** Logs filtered with date range from 01/01/2020 showing all activities from that date forward. "Tout afficher" reset option visible. Complete activity history displayed with all action types (ajout, modification, suppression, import) and timestamps.
- **State keywords:** date-range-filtered, historical-logs, action-list

### US-4.4-E1-03-no-logs
- **File:** `tests/e2e/final/US-4.4-E1-03-no-logs.png`
- **Description:** Empty logs table when filter produces no results. Logs table structure visible but with no data rows. Placeholder message or empty state indicates no activities match the applied filter criteria.
- **State keywords:** empty-state, no-logs, filter-mismatch

### US-4.4-E2-01-intercept
- **File:** `tests/e2e/final/US-4.4-E2-01-intercept.png`
- **Description:** API request interception for logs data fetch. Network request captured showing GET endpoint call to retrieve activity logs with optional filter parameters. Dev tools visible showing query string and response structure.
- **State keywords:** api-intercept, logs-fetch, network-debug

### US-4.4-E2-02-loaded
- **File:** `tests/e2e/final/US-4.4-E2-02-loaded.png`
- **Description:** Logs table after successful data load from API. Complete activity history populated with all entries visible. Table shows full dataset ready for filtering and user interaction. No loading spinner present.
- **State keywords:** data-loaded, table-populated, api-success

## Batch 13: US-4.2-03 through US-4.3-06

### US-4.2-03-preview-table
- **File:** `tests/e2e/final/US-4.2-03-preview-table.png`
- **Description:** Import preview showing full table layout with researcher data. Table displays columns for NOM (Name), LABO (Lab), THEMES (Research Themes), and STATUT (Status). Sample data with multiple researchers (Dr. Test User/LORIA/Process Discovery, Prof. Another/CNRS/Conformance Checking, Dr. Third/Paris 1/Data Quality) all marked "Nouveau". "Importer 3 chercheurs" button ready for bulk import action.
- **State keywords:** preview-table, bulk-data, import-ready, researcher-list

### US-4.2-04-import-confirmed
- **File:** `tests/e2e/final/US-4.2-04-import-confirmed.png`
- **Description:** Import confirmation screen after successful bulk researcher import. Displays confirmation message indicating successful import of 3 researchers. Shows success state with visual feedback and navigation options to return to import tab or view imported data.
- **State keywords:** import-success, confirmation-message, bulk-import-complete

### US-4.2-05-logs-link
- **File:** `tests/e2e/final/US-4.2-05-logs-link.png`
- **Description:** Logs tab showing import activity logs. Date range filter visible (Du/Au date pickers) with Filtrer button. Log table displays Date/Heure, Utilisateur, Action, and Détail columns. Sample log entries show Configuration (params set), Modification (profile approval/rejection), and Import (bulk researcher import) actions with timestamps and user context.
- **State keywords:** logs-tab, activity-history, import-logs, timestamps

### US-4.2-06-import-tab
- **File:** `tests/e2e/final/US-4.2-06-import-tab.png`
- **Description:** Import tab after successful import showing empty drag-drop zone ready for next import. Zone displays upload instructions "Glisser un fichier CSV ou Excel ici, ou cliquer pour selectionner" and Google Scholar URL input field below. Interface reset to initial state for additional imports.
- **State keywords:** import-tab-empty, drag-drop-ready, post-import-state

### US-4.2-07-scholar-import
- **File:** `tests/e2e/final/US-4.2-07-scholar-import.png`
- **Description:** Google Scholar import workflow with URL field populated. URL shows example Google Scholar search query (citations user parameter). "Importer" button visible for triggering Google Scholar data fetch. Google Scholar requires server-side configuration note displayed.
- **State keywords:** google-scholar-import, url-input, scholar-workflow

### US-4.2-08-scholar-preview
- **File:** `tests/e2e/final/US-4.2-08-scholar-preview.png`
- **Description:** Preview of researchers fetched from Google Scholar import. Table shows "Aperçu — 2 entree(s)" with sample data: Dr. Marie Dupont (LORIA, Process Discovery) and Dr. New Person (CNRS, Data Quality). All entries marked "Nouveau" status. "Importer 2 chercheurs" button ready to confirm Google Scholar bulk import.
- **State keywords:** scholar-preview, two-entries, new-researchers, google-scholar-data

### US-4.2-E1-01-upload-bad-csv
- **File:** `tests/e2e/final/US-4.2-E1-01-upload-bad-csv.png`
- **Description:** Error scenario with malformed CSV file upload. Import zone shows uploaded file state. Error handling mechanism triggered but preview not generated due to invalid CSV format. Error message indicates format requirements not met.
- **State keywords:** csv-format-error, invalid-file, upload-rejected

### US-4.2-E1-02-format-error
- **File:** `tests/e2e/final/US-4.2-E1-02-format-error.png`
- **Description:** Format validation error message displayed after bad CSV upload. Error text states "Format invalide: colonnes attendues: Nom, Labo, Themes" (Invalid format: expected columns Nom, Labo, Themes). User instructed on correct CSV structure with required column names.
- **State keywords:** format-validation, error-message, csv-requirements

### US-4.2-E2-01-intercept
- **File:** `tests/e2e/final/US-4.2-E2-01-intercept.png`
- **Description:** API request interception for import submission. Network request captured showing POST payload with researcher data batch. Dev tools visible showing request structure and endpoint being called for bulk import operation.
- **State keywords:** api-intercept, network-debug, import-request

### US-4.2-E2-02-submit
- **File:** `tests/e2e/final/US-4.2-E2-02-submit.png`
- **Description:** Import submission in progress after user clicks "Importer" button. Form data being sent to server. Loading state or transition animation visible. Preview table still showing with researcher data ready for confirmation.
- **State keywords:** form-submit, import-pending, async-submission

### US-4.2-E2-03-url-error
- **File:** `tests/e2e/final/US-4.2-E2-03-url-error.png`
- **Description:** Error state after invalid Google Scholar URL submission. Error message displayed: "L'import Google Scholar n'est pas encore configure. Utilisez l'import CSV." (Google Scholar import not yet configured. Use CSV import). Scholar import functionality disabled or returns error.
- **State keywords:** scholar-url-error, not-configured, fallback-to-csv

### US-4.2-E3-01-upload-dup
- **File:** `tests/e2e/final/US-4.2-E3-01-upload-dup.png`
- **Description:** CSV upload containing duplicate researcher entries. File processed and preview generated showing duplicate detection. Researchers appear twice or conflict indicators visible (e.g., "Dr. Test User" listed multiple times).
- **State keywords:** duplicate-entries, conflict-detection, duplicate-warning

### US-4.2-E3-02-duplicate-flagged
- **File:** `tests/e2e/final/US-4.2-E3-02-duplicate-flagged.png`
- **Description:** Preview with duplicates flagged visually. Table shows researcher entries with duplicate warning or highlighting. Status badges may differ (e.g., some marked "Nouveau", others "Doublon"). User can proceed with selective import or resolve duplicates.
- **State keywords:** duplicate-flag, conflict-visual, selective-import

### US-4.2-E3-03-partial-import
- **File:** `tests/e2e/final/US-4.2-E3-03-partial-import.png`
- **Description:** Partial import result after duplicate conflict resolution. Some researchers imported successfully, others skipped/rejected due to duplicates. Import report shows count of successful vs. failed entries. Log entry created documenting partial import outcome.
- **State keywords:** partial-import, conflict-resolution, import-report

## Batch 15 (Files 267-286)

### US-4.4-E2-03-pagination
- **File:** `tests/e2e/final/US-4.4-E2-03-pagination.png`
- **Description:** Activity logs with pagination controls displayed. Logs table showing multiple entries with timestamps, user actions, and details. Navigation buttons ("Précédent", "Suivant") visible for browsing through log pages. Current page indicator showing user position in log history.
- **State keywords:** logs-pagination, page-navigation, activity-table, multi-page

### US-4.4-E2-04-page-two
- **File:** `tests/e2e/final/US-4.4-E2-04-page-two.png`
- **Description:** Second page of activity logs after user navigates via pagination. Different log entries displayed from first page. "Précédent" button now active to allow returning to previous page. Consistent log table format maintained across pages.
- **State keywords:** page-two, logs-continued, backward-navigation, pagination-state

### US-4.4-E3-01-intercept
- **File:** `tests/e2e/final/US-4.4-E3-01-intercept.png`
- **Description:** API request interception showing logs fetch operation. Network request captured with dev tools visible. Shows POST/GET request to logs endpoint with filtering or pagination parameters. Response payload preparing to load log entries.
- **State keywords:** api-intercept, network-debug, logs-api, request-payload

### US-4.4-E3-02-loading
- **File:** `tests/e2e/final/US-4.4-E3-02-loading.png`
- **Description:** Loading spinner visible while logs are being fetched from server. Placeholder skeleton or spinner animation shown in logs table area. User waits for log data to populate. UI prevents interaction until load completes.
- **State keywords:** loading-spinner, async-fetch, ui-blocked, wait-state

### US-4.4-E3-03-error-retry
- **File:** `tests/e2e/final/US-4.4-E3-03-error-retry.png`
- **Description:** Error state displayed when logs fetch fails. Error message shown with "Retry" or "Réessayer" button for user to attempt logs reload. Logs table remains empty or shows error placeholder. User can manually trigger log retrieval again.
- **State keywords:** fetch-error, error-recovery, retry-button, error-message

### US-5.1-01-navbar-logged-out
- **File:** `tests/e2e/final/US-5.1-01-navbar-logged-out.png`
- **Description:** Navigation bar in logged-out state showing no user profile or menu. "Connexion" button visible as primary action for authentication. Navbar displays application branding and basic navigation. No admin or personalized options visible.
- **State keywords:** logged-out, navbar-state, login-button, anonymous-navigation

### US-5.1-02-login-screen
- **File:** `tests/e2e/final/US-5.1-02-login-screen.png`
- **Description:** Login card displayed with email and password input fields. Labels show "Email" and "Mot de passe" (password). "Se connecter" button centered below inputs. Quick-login options for "Demo Chercheur" and "Demo Admin" available for testing.
- **State keywords:** login-form, email-input, password-input, quick-login, form-empty

### US-5.1-03-credentials-entered
- **File:** `tests/e2e/final/US-5.1-03-credentials-entered.png`
- **Description:** Login form with email and password fields populated. User has entered credentials ready for submission. "Se connecter" button enabled and ready to click. Form validation may have passed based on input values.
- **State keywords:** credentials-entered, form-populated, ready-submit, login-prepared

### US-5.1-04-logged-in
- **File:** `tests/e2e/final/US-5.1-04-logged-in.png`
- **Description:** Successful authentication state showing logged-in view. User profile icon or name visible in navbar/header indicating active session. Dashboard or main content area now accessible. Navigation menu may show additional authenticated user options.
- **State keywords:** logged-in, authenticated, session-active, user-profile-visible

### US-5.1-05-dropdown-open
- **File:** `tests/e2e/final/US-5.1-05-dropdown-open.png`
- **Description:** User menu dropdown opened showing options available to logged-in user. Menu items may include "Mon Profil" (My Profile), settings, logout action. Dropdown triggered by clicking user icon or profile area in navbar.
- **State keywords:** dropdown-menu, user-menu, profile-options, menu-expanded

### US-5.1-06-own-profile
- **File:** `tests/e2e/final/US-5.1-06-own-profile.png`
- **Description:** User's own profile page displayed with personal information editable. Profile shows user email, role, and other account details. Edit controls present for user to modify their own profile settings. Save button available to persist changes.
- **State keywords:** own-profile, profile-edit, user-info, settings-editable

### US-5.1-07-logged-out-again
- **File:** `tests/e2e/final/US-5.1-07-logged-out-again.png`
- **Description:** User logged out and returned to initial logged-out state. Navigation shows "Connexion" button again. Session cleared and user authentication removed. Dashboard/content area no longer visible or restricted to anonymous view.
- **State keywords:** logged-out, session-cleared, logout-complete, anonymous-state

### US-5.1-E1-01-admin-login
- **File:** `tests/e2e/final/US-5.1-E1-01-admin-login.png`
- **Description:** Login attempt with admin credentials (Demo Admin quick-login option). Admin email and password combination entered. "Se connecter" button ready for submission. Admin-specific login variant of standard login form.
- **State keywords:** admin-login, demo-admin, admin-credentials, elevated-access

### US-5.1-E1-02-submit
- **File:** `tests/e2e/final/US-5.1-E1-02-submit.png`
- **Description:** Admin login form submission in progress. Form data being sent to server for authentication. Loading state or transition animation visible. Server processing admin credentials and validating access level.
- **State keywords:** form-submit, admin-auth, async-login, submission-pending

## Batch 16 (Files 287-320, Final Batch)

### US-5.1-E1-03-error-message
- **File:** `tests/e2e/final/US-5.1-E1-03-error-message.png`
- **Description:** Login form with error message displayed after failed authentication attempt. Email "bod@email.com" and masked password visible with error text "Email ou mot de passe incorrect." (Email or password incorrect). Quick-login buttons still available below.
- **State keywords:** login-error, auth-failed, error-feedback, credentials-invalid

### US-5.1-E2-01-intercept
- **File:** `tests/e2e/final/US-5.1-E2-01-intercept.png`
- **Description:** API request interception for login submission. Network request captured showing authentication endpoint being called. Dev tools visible showing POST request with email and password credentials in payload.
- **State keywords:** api-intercept, network-debug, auth-request, credentials-payload

### US-5.1-E2-02-submit
- **File:** `tests/e2e/final/US-5.1-E2-02-submit.png`
- **Description:** Login form submission in progress with researcher credentials (researcher@cartoPM.fr). Form data being sent to server. Loading state or transition visible. Authentication request pending server response.
- **State keywords:** form-submit, auth-pending, async-login, submission-in-flight

### US-5.1-E2-03-service-error
- **File:** `tests/e2e/final/US-5.1-E2-03-service-error.png`
- **Description:** Service error displayed after login attempt fails with server-side error. Error message "Service indisponible, reessayez plus tard." (Service unavailable, try again later) shown in red text. User prompted to retry authentication.
- **State keywords:** service-error, server-unavailable, error-recovery, retry-prompt

### US-5.1-E3-01-logged-in
- **File:** `tests/e2e/final/US-5.1-E3-01-logged-in.png`
- **Description:** Dashboard displayed after successful authentication with Maria Dupont logged in. NavBar shows user profile with "MD" badge and user name. Activity log visible with admin actions and timestamps. Sidebar navigation fully accessible.
- **State keywords:** logged-in, dashboard-loaded, authenticated-user, session-active

### US-5.1-E3-02-intercept
- **File:** `tests/e2e/final/US-5.1-E3-02-intercept.png`
- **Description:** API request interception showing dashboard data fetch after authentication. Network request captured with dev tools visible. GET request to dashboard/activity endpoint loading user-specific data and logs.
- **State keywords:** api-intercept, dashboard-api, data-fetch, post-auth-request

### US-5.1-E3-03-action
- **File:** `tests/e2e/final/US-5.1-E3-03-action.png`
- **Description:** User interaction action captured showing dropdown menu open with profile options "Mon profil" and "Deconnexion" visible. Dropdown triggered from user profile badge in navbar. Menu positioned correctly with focus on logout option.
- **State keywords:** dropdown-interaction, user-menu, menu-action, focus-visible

### US-5.1-E3-04-session-expired
- **File:** `tests/e2e/final/US-5.1-E3-04-session-expired.png`
- **Description:** Session expiration detected after user action, redirecting to login screen. Error message "Session expiree, veuillez vous reconnecter." (Session expired, please log in again) displayed. User returned to login form to re-authenticate.
- **State keywords:** session-expiration, auth-timeout, redirect-login, reauth-required

### US-5.1-KB-01-dropdown-open
- **File:** `tests/e2e/final/US-5.1-KB-01-dropdown-open.png`
- **Description:** User menu dropdown opened via keyboard interaction (likely Tab key). "Mon profil" and "Deconnexion" options visible. Dropdown accessible and keyboard-navigable for accessibility testing.
- **State keywords:** keyboard-navigation, dropdown-open, a11y-menu, tab-navigation

### US-5.1-KB-02-focus-first-item
- **File:** `tests/e2e/final/US-5.1-KB-02-focus-first-item.png`
- **Description:** First menu item "Mon profil" focused via keyboard navigation. Focus indicator visible showing keyboard user can interact with option. Tab order preserved and focus management working correctly.
- **State keywords:** keyboard-focus, focus-indicator, a11y-compliance, tab-order

### US-5.1-KB-03-tab-cycle
- **File:** `tests/e2e/final/US-5.1-KB-03-tab-cycle.png`
- **Description:** Tab cycling through dropdown menu items showing "Deconnexion" now focused. Second menu option highlighted and ready for keyboard interaction. Focus trap maintained within dropdown menu.
- **State keywords:** tab-cycling, focus-trap, menu-traversal, keyboard-a11y

### US-5.1-KB-04-escape-close
- **File:** `tests/e2e/final/US-5.1-KB-04-escape-close.png`
- **Description:** Dropdown menu closed after Escape key pressed. Menu dismissed and focus returned to user profile badge. Keyboard shortcut handling working correctly for accessibility.
- **State keywords:** escape-key, menu-dismiss, keyboard-shortcut, a11y-interaction

### US-5.1-RG-01-navigate-admin
- **File:** `tests/e2e/final/US-5.1-RG-01-navigate-admin.png`
- **Description:** Non-admin user attempting to navigate to admin panel via URL manipulation or direct link. Navigation attempted without proper authorization. Redirect guard being tested.
- **State keywords:** unauthorized-access, route-guard, admin-protection, access-denied

### US-5.1-RG-02-redirected
- **File:** `tests/e2e/final/US-5.1-RG-02-redirected.png`
- **Description:** User automatically redirected to login or home page after attempting unauthorized admin access. Route guard intercepted navigation attempt. User returned to accessible page with appropriate message.
- **State keywords:** redirect-guard, route-protection, unauthorized-redirect, access-control

### US-5.2-01-logged-in
- **File:** `tests/e2e/final/US-5.2-01-logged-in.png`
- **Description:** Dashboard home page displayed with authenticated user (Maria Dupont) logged in. Summary cards showing 105 Chercheurs, 271 Themes, 10 Clusters, 315 Publications. Recent activity log showing admin actions. Three.js thematic map visible.
- **State keywords:** logged-in, dashboard-home, summary-stats, activity-log

### US-5.2-02-own-profile
- **File:** `tests/e2e/final/US-5.2-02-own-profile.png`
- **Description:** Own researcher profile page displayed for Abel Armas Cervantes. Avatar with initials "AA" in orange circle. Keywords/themes listed (process model comparison, behavioral relations, change detection, event structures). Publications section showing three research papers. "Modifier" button enabled for self-edit.
- **State keywords:** own-profile, researcher-profile, edit-enabled, profile-view

### US-5.2-03-edit-enabled
- **File:** `tests/e2e/final/US-5.2-03-edit-enabled.png`
- **Description:** Own profile with edit mode available. "Modifier" button visible and enabled. Profile fields ready for editing. Edit form controls present for user to update their information.
- **State keywords:** edit-mode, editable-profile, edit-button-enabled, own-profile-edit

### US-5.2-04-edit-form
- **File:** `tests/e2e/final/US-5.2-04-edit-form.png`
- **Description:** Profile edit form displayed with yellow banner warning "Votre profil sera soumis a validation par un administrateur avant d'etre public." (Your profile will be submitted for validation by administrator before being public). Form fields populated: "Nom complet" (Abel Armas Cervantes), "Laboratoire" dropdown, "Mots-cles" tags editable, "Biographie" textarea, and "Publications" section with entry forms.
- **State keywords:** edit-form, validation-banner, profile-edit, pending-approval

### US-5.2-05-approval-banner
- **File:** `tests/e2e/final/US-5.2-05-approval-banner.png`
- **Description:** Approval notification banner prominently displayed. Yellow background with text "Votre profil sera soumis a validation par un administrateur avant d'etre public." Informs user of pending admin approval workflow for profile publication.
- **State keywords:** approval-notice, validation-workflow, pending-review, info-banner

### US-5.2-06-saved
- **File:** `tests/e2e/final/US-5.2-06-saved.png`
- **Description:** Profile edit form showing successful save state with green success notification "Profil enregistre avec succes." (Profile saved successfully) at bottom. Form fields remain populated and editable. User knows changes have been persisted to draft.
- **State keywords:** save-success, success-notification, form-saved, profile-updated

### US-5.2-07-logged-in
- **File:** `tests/e2e/final/US-5.2-07-logged-in.png`
- **Description:** Dashboard displayed showing another researcher's profile navigation. Currently viewing Adriano Augusto profile page. Nav breadcrumb shows "Chercheurs > Adriano Augusto". Different user's profile content displayed with their avatar (purple "AA"), research keywords, and publications list.
- **State keywords:** other-profile, researcher-list, profile-navigation, different-user

### US-5.2-08-other-profile
- **File:** `tests/e2e/final/US-5.2-08-other-profile.png`
- **Description:** Viewing another researcher's profile (Adriano Augusto). Avatar shows purple circle with "AA" initials. Profile shows researcher affiliation (University of Melbourne, School of Computing and Information Systems), biography, and publications. "Modifier" button disabled showing user cannot edit others' profiles. Text indicates permission restriction: "Vous ne pouvez modifier que votre propre profil." (You can only modify your own profile).
- **State keywords:** other-profile, view-only, edit-locked, permission-denied

### US-5.2-09-edit-locked
- **File:** `tests/e2e/final/US-5.2-09-edit-locked.png`
- **Description:** Edit functionality locked for viewing another user's profile. "Modifier" button visible but disabled/locked with note "Vous ne pouvez modifier que votre propre profil." (You can only modify your own profile). Read-only profile view enforced.
- **State keywords:** edit-locked, permission-denied, view-only-mode, access-restricted

### US-5.2-10-anonymous-profile
- **File:** `tests/e2e/final/US-5.2-10-anonymous-profile.png`
- **Description:** Researcher profile visible in anonymous/logged-out state. Abel Armas Cervantes profile displayed with public information (avatar, name, affiliation, keywords, publications). No edit options or user-specific controls visible. Public profile view accessible without authentication.
- **State keywords:** public-profile, anonymous-view, logged-out-profile, public-data

### US-5.2-11-no-edit-button
- **File:** `tests/e2e/final/US-5.2-11-no-edit-button.png`
- **Description:** Profile view without "Modifier" button visible. Anonymous or non-owner view showing profile data only. Abel Armas Cervantes profile displayed with researcher info, keywords, and publications. No edit or management controls present.
- **State keywords:** no-edit-button, read-only-profile, anonymous-access, public-view

### US-5.2-E1-01-intercept
- **File:** `tests/e2e/final/US-5.2-E1-01-intercept.png`
- **Description:** API request interception showing profile update submission. Network request captured with dev tools visible. POST request to profile endpoint with updated profile data (name, keywords, biography, publications) being sent.
- **State keywords:** api-intercept, profile-update-api, form-submission, network-request

### US-5.2-E1-02-submit
- **File:** `tests/e2e/final/US-5.2-E1-02-submit.png`
- **Description:** Profile edit form submission in progress. Form data being sent to server. Loading state visible indicating async profile update operation in flight. User awaits server confirmation of changes.
- **State keywords:** form-submit, profile-update-pending, async-operation, submission-in-progress

### US-5.2-E1-03-already-pending
- **File:** `tests/e2e/final/US-5.2-E1-03-already-pending.png`
- **Description:** Error or notification state indicating profile already has pending approval. User attempted to submit but profile changes are already awaiting admin review. Message prevents duplicate submissions or informs of existing pending state.
- **State keywords:** pending-approval, duplicate-submit, approval-in-progress, notification-state

### US-5.2-E2-01-intercept
- **File:** `tests/e2e/final/US-5.2-E2-01-intercept.png`
- **Description:** API request interception for profile update operation that encounters error. Network request captured showing profile endpoint call. Response indicates server error or validation failure in profile update.
- **State keywords:** api-intercept, error-response, update-failure, network-error

### US-5.2-E2-02-submit
- **File:** `tests/e2e/final/US-5.2-E2-02-submit.png`
- **Description:** Profile update form submission in progress when error occurs. Form fields still populated, user awaiting server response. Loading state visible before error notification appears.
- **State keywords:** form-submit, error-pending, async-submit, in-flight

### US-5.2-E2-03-error-toast
- **File:** `tests/e2e/final/US-5.2-E2-03-error-toast.png`
- **Description:** Error toast notification displayed after profile update fails. Red error banner shown with message "Erreur de sauvegarde, veuillez reessayer." (Save error, please retry). User notified of failure and prompted to attempt save again.
- **State keywords:** error-toast, save-error, error-notification, retry-prompt

### US-5.2-E3-01-intercept
- **File:** `tests/e2e/final/US-5.2-E3-01-intercept.png`
- **Description:** API request interception for profile approval workflow. Network request captured showing admin action to approve/reject pending profile. Admin endpoint being called with profile ID and approval decision.
- **State keywords:** api-intercept, approval-api, admin-action, workflow-request

### US-5.2-E3-02-profile
- **File:** `tests/e2e/final/US-5.2-E3-02-profile.png`
- **Description:** Profile page after rejection decision made. Abel Armas Cervantes profile displayed with rejection banner visible at top showing "Votre profil a ete rejete. Raison : Informations insuffisantes sur les publications." (Your profile was rejected. Reason: Insufficient publication information).
- **State keywords:** profile-rejected, rejection-notice, rejection-reason, feedback-banner

### US-5.2-E3-03-rejection-notice
- **File:** `tests/e2e/final/US-5.2-E3-03-rejection-notice.png`
- **Description:** Rejection notice displayed prominently on profile with detailed feedback. Red background banner showing "Votre profil a ete rejete. Raison : Informations insuffisantes sur les publications." Informs user of rejection and reason for denial. Prompts user to revise and resubmit.
- **State keywords:** rejection-notice, admin-feedback, rejection-reason, resubmit-prompt

### US-4.3-01-settings-tab
- **File:** `tests/e2e/final/US-4.3-01-settings-tab.png`
- **Description:** Admin Paramètres (Settings) tab showing configuration options. Tab navigation visible with Utilisateurs, Profils en attente, Import, Paramètres, Logs tabs. Settings panel displays Language, Seuil de similarité (Similarity Threshold), and Algorithme NLP (NLP Algorithm) controls. "Sauvegarder les paramètres" (Save Settings) button at bottom.
- **State keywords:** settings-tab, admin-config, language-settings

### US-4.3-02-language-section
- **File:** `tests/e2e/final/US-4.3-02-language-section.png`
- **Description:** Language selection section in Settings tab. Radio buttons for "Français" and "English" visible with English currently selected. Language preference controls interface language globally. Clear visual indication of selected language option.
- **State keywords:** language-selection, radio-buttons, french-english

### US-4.3-03-threshold-section
- **File:** `tests/e2e/final/US-4.3-03-threshold-section.png`
- **Description:** Similarity Threshold slider control in Settings. Labeled "Seuil de similarité" with slider set to 0.80 value. Slider provides range adjustment for theme/researcher similarity matching algorithm. Numerical value displayed next to slider for precise threshold control.
- **State keywords:** similarity-threshold, slider-control, threshold-value

### US-4.3-04-slider-changed
- **File:** `tests/e2e/final/US-4.3-04-slider-changed.png`
- **Description:** Similarity Threshold slider after user interaction showing changed value. Slider now positioned at 0.75 (left from previous 0.80). Visual feedback shows slider thumb position and updated numerical display. "Modifications non sauvegardées" (Unsaved modifications) message displayed indicating pending save.
- **State keywords:** slider-adjusted, threshold-changed, unsaved-changes

### US-4.3-05-nlp-section
- **File:** `tests/e2e/final/US-4.3-05-nlp-section.png`
- **Description:** NLP Algorithm dropdown control in Settings tab. Labeled "Algorithme NLP" with dropdown showing "Word2Vec (Vectoriel)" as current selection. Dropdown provides algorithm selection for text analysis and theme similarity computation. Other algorithms available in dropdown list.
- **State keywords:** nlp-algorithm, dropdown-select, word2vec

### US-4.3-06-nlp-changed
- **File:** `tests/e2e/final/US-4.3-06-nlp-changed.png`
- **Description:** NLP Algorithm dropdown after user selection change. Dropdown now shows "BERT (Contextuel, lent)" (BERT - Contextual, slow) as selected algorithm. Visual update shows new selection. "Modifications non sauvegardées" warning displayed. Different algorithm choice impacts theme similarity computation performance.
- **State keywords:** nlp-algorithm-changed, bert-selected, unsaved-changes

## Batch 12: US-4.1-08 through US-4.2-02

### US-4.1-08-pending-tab
- **File:** `tests/e2e/final/US-4.1-08-pending-tab.png`
- **Description:** Admin panel with Pending Profiles tab active. Tab shows "Aucun profil en attente" (no pending profiles) message. Layout displays tab navigation between Utilisateurs, Pending, and Rejetés (Users, Pending, Rejected). Empty state message clearly visible with appropriate styling.
- **State keywords:** pending-tab, empty-state, no-profiles, french-ui

### US-4.1-09-empty-state
- **File:** `tests/e2e/final/US-4.1-09-empty-state.png`
- **Description:** Admin Pending Profiles tab empty state with centered message and neutral visual treatment. No profile cards or list items visible. Tab remains active and ready for new pending profile submissions. French text indicates zero pending profiles status.
- **State keywords:** empty-state, pending-profiles-zero, tab-active

### US-4.1-10-pending-indicator
- **File:** `tests/e2e/final/US-4.1-10-pending-indicator.png`
- **Description:** Admin panel showing Pending Profiles tab with visual indicator (likely badge count or highlight). Tab header shows indicator of zero or low pending profile count. Navigation clear between user management tabs.
- **State keywords:** tab-indicator, pending-count, admin-navigation

### US-4.1-11-rejected
- **File:** `tests/e2e/final/US-4.1-11-rejected.png`
- **Description:** Admin Rejetés (Rejected) Profiles tab. Shows rejected profile management interface with empty or populated list depending on rejection history. Tab layout consistent with Users and Pending tabs. French terminology for rejected profiles.
- **State keywords:** rejected-tab, profile-management, admin-interface

### US-4.1-E1-01-intercept
- **File:** `tests/e2e/final/US-4.1-E1-01-intercept.png`
- **Description:** Admin panel with API request interception for profile approval workflow. Network request is captured before being sent to server. Shows request payload, headers, and endpoint being called. Testing infrastructure visible in Chrome DevTools or similar.
- **State keywords:** api-intercept, network-request, profile-approval, dev-tools

### US-4.1-E1-02-loading
- **File:** `tests/e2e/final/US-4.1-E1-02-loading.png`
- **Description:** Admin panel with loading spinner displayed during profile approval operation. User action triggered but response pending from server. Loading indicator shows in-progress state with appropriate visual feedback.
- **State keywords:** loading-spinner, in-progress, approval-pending

### US-4.1-E1-03-spinner
- **File:** `tests/e2e/final/US-4.1-E1-03-spinner.png`
- **Description:** Close-up or full view of loading spinner on admin panel during profile management operation. Spinner displays indeterminate progress animation. Indicates asynchronous operation in progress.
- **State keywords:** spinner-visible, loading-animation, async-operation

### US-4.1-E2-01-error
- **File:** `tests/e2e/final/US-4.1-E2-01-error.png`
- **Description:** Admin panel showing error state after failed profile approval attempt. Error message displayed with "Une erreur est survenue" (An error occurred) text. Error details may include specific failure reason. Ressayer (Retry) button provided for recovery.
- **State keywords:** error-state, approval-failed, error-message, retry-button

### US-4.1-E2-02-message
- **File:** `tests/e2e/final/US-4.1-E2-02-message.png`
- **Description:** Error message dialog or toast notification on admin panel. French error text clearly visible ("Une erreur est survenue" or similar). Message provides feedback on failed profile operation. Message state with dismiss or action button.
- **State keywords:** error-message, notification, french-text, dismissible

### US-4.1-E2-03-retry
- **File:** `tests/e2e/final/US-4.1-E2-03-retry.png`
- **Description:** Admin panel with error recovery UI showing retry functionality. Ressayer button visible and interactive. User can attempt the failed profile operation again. Error message still visible with retry option prominent.
- **State keywords:** retry-available, error-recovery, action-button

### US-4.1-E2-04-warning
- **File:** `tests/e2e/final/US-4.1-E2-04-warning.png`
- **Description:** Admin panel showing warning scenario during profile operation. Warning message indicates blocked action (e.g., "Vous ne pouvez pas révoquer votre propre profil" - cannot revoke own profile). Prevents self-revoke or similar dangerous self-actions. Warning styled differently from success or error states.
- **State keywords:** warning-state, blocked-action, self-action-prevention

### US-4.1-E3-01-intercept
- **File:** `tests/e2e/final/US-4.1-E3-01-intercept.png`
- **Description:** Second error test variant with API request interception. Network request captured showing different failure scenario (e.g., permission denied, invalid profile state). Dev tools visible with request details.
- **State keywords:** api-intercept, error-variant, network-debug

### US-4.1-E3-02-spinner
- **File:** `tests/e2e/final/US-4.1-E3-02-spinner.png`
- **Description:** Loading spinner displayed during second error scenario. Async operation in progress before error occurs. Spinner shows indeterminate progress state consistent with other loading indicators.
- **State keywords:** loading-spinner, async-operation, error-scenario

### US-4.1-E3-03-error
- **File:** `tests/e2e/final/US-4.1-E3-03-error.png`
- **Description:** Error state after second error test scenario completes. Error message displayed with failure details. Admin interface shows error recovery options. Visual treatment consistent with other error states on admin panel.
- **State keywords:** error-state, failure-visible, recovery-options

### US-4.1-FT-01-dialog-open
- **File:** `tests/e2e/final/US-4.1-FT-01-dialog-open.png`
- **Description:** Accessibility focus trap test showing CartoPM logo with visible focus border (blue outline). Logo appears as interactive element with keyboard focus indicator. Tests focus management in admin panel header or modal context.
- **State keywords:** focus-trap, keyboard-focus, accessibility-testing, focus-visible

### US-4.1-FT-02-tab-order
- **File:** `tests/e2e/final/US-4.1-FT-02-tab-order.png`
- **Description:** Accessibility testing showing tab order navigation through admin panel. Focus indicator visible on currently focused element. Shows keyboard navigation flow through interactive elements (buttons, tabs, form fields). Tab order testing ensures logical navigation sequence.
- **State keywords:** tab-navigation, keyboard-focus, accessibility-audit

### US-4.1-FT-03-focus-visible
- **File:** `tests/e2e/final/US-4.1-FT-03-focus-visible.png`
- **Description:** Close-up of focus indicator on admin panel element showing clear visual focus state. Focus outline visible around button, tab, or other interactive control. Tests focus visibility requirement for keyboard accessibility.
- **State keywords:** focus-visible, keyboard-accessible, focus-indicator

### US-4.1-FT-04-escape-close
- **File:** `tests/e2e/final/US-4.1-FT-04-escape-close.png`
- **Description:** Accessibility keyboard navigation test where Escape key closes dialog or modal. Focus trap test ensures Escape key works to dismiss overlay. Tests modal keyboard accessibility and focus restoration after modal closes.
- **State keywords:** escape-key, keyboard-navigation, modal-close, focus-management

### US-4.2-01-import-tab
- **File:** `tests/e2e/final/US-4.2-01-import-tab.png`
- **Description:** Admin Import Researchers tab showing drag-drop CSV/Excel upload zone. Zone displays instructional text "Glisser un fichier CSV ou Excel ici, ou cliquer pour selectionner" (Drag CSV or Excel file here, or click to select). Tab header visible. Upload interface ready for file input.
- **State keywords:** import-tab, drag-drop-zone, file-upload, french-instructions

### US-4.2-02-file-uploaded
- **File:** `tests/e2e/final/US-4.2-02-file-uploaded.png`
- **Description:** Import Researchers tab after file upload with preview showing "Aperçu — 3 entree(s)" (Preview — 3 entries). Table displays sample researcher data: Dr. Test User (LORIA, Process Discovery), Prof. Another (CNRS, Conformance Checking), Dr. Third (Paris 1, Data Quality). All entries show "Nouveau" (New) status badge. "Importer 3 chercheurs" (Import 3 researchers) button visible for bulk import action.
- **State keywords:** file-preview, bulk-import, researcher-data, new-entries
- **File:** `tests/e2e/final/US-3.2-E3-03-loading.png`
- **Description:** Loading state during theme data fetch. Spinner or animated loader visible on map canvas area. Three.js nebula visualization may show skeleton/placeholder content or dimmed display while awaiting API response.
- **State keywords:** loading-spinner, data-fetch, api-pending, placeholder-state

### US-3.3-01-map-loaded
- **File:** `tests/e2e/final/US-3.3-01-map-loaded.png`
- **Description:** Full thematic map loaded with all theme clusters visible in nebula. Multiple colored sphere nodes arranged in 3D space (blue, green, orange, red, purple). Filter sidebar visible on left. Map is fully interactive and ready for node exploration.
- **State keywords:** map-loaded, all-nodes-visible, filters-ready, interactive

### US-3.3-02-node-detail
- **File:** `tests/e2e/final/US-3.3-02-node-detail.png`
- **Description:** Node detail popover open showing theme metadata. Popover contains theme name, description text, member count, publication count, and related researcher names. Positioned relative to clicked/hovered cluster node in the visualization.
- **State keywords:** node-detail, popover-open, metadata-display, theme-info

### US-3.3-03-hover-tooltip
- **File:** `tests/e2e/final/US-3.3-03-hover-tooltip.png`
- **Description:** Hover state showing tooltip near theme cluster node. Tooltip displays brief theme name or count indicator. Nebula background visible with colored sphere nodes. Interactive feedback for mouse movement over map elements.
- **State keywords:** hover-state, tooltip-visible, interactive-feedback

### US-3.3-E1-01-disambiguation
- **File:** `tests/e2e/final/US-3.3-E1-01-disambiguation.png`
- **Description:** Disambiguation UI showing multiple theme options when node could match several clusters. List of selectable themes displayed with icons or indicators. User must choose specific theme to view detailed information and navigate.
- **State keywords:** disambiguation, multiple-options, selection-list, theme-choice

### US-3.3-E1-02-selected-theme
- **File:** `tests/e2e/final/US-3.3-E1-02-selected-theme.png`
- **Description:** After disambiguation, selected theme detail view displays. Popover or detail panel shows chosen theme's full information including name, description, member list, publication count, and related researchers with links.
- **State keywords:** theme-selected, detail-view, full-metadata, navigation-ready

### US-3.3-E2-01-popover-open
- **File:** `tests/e2e/final/US-3.3-E2-01-popover-open.png`
- **Description:** Error scenario setup with API error monitoring active. Map is displayed with theme popover open showing node details. Error interception is set up but popover content still renders with cached or fallback data.
- **State keywords:** error-scenario, popover-open, api-monitoring, fallback-data

### US-3.3-E3-01-zoomed-out
- **File:** `tests/e2e/final/US-3.3-E3-01-zoomed-out.png`
- **Description:** Map zoomed out to show all theme clusters at once. Entire nebula visualization visible on screen with all colored sphere nodes displayed. Smaller individual nodes but complete thematic landscape visible. Zoom level 0.5x or lower.
- **State keywords:** zoomed-out, all-clusters, full-view, low-zoom

### US-3.3-E3-02-touch-target
- **File:** `tests/e2e/final/US-3.3-E3-02-touch-target.png`
- **Description:** Touch target testing on mobile viewport showing enlarged interactive areas around theme nodes. Visual highlights or circles indicating clickable zones on nebula. Mobile optimized interaction feedback with appropriate hit targets.
- **State keywords:** touch-target, mobile-view, interaction-areas, hit-targets

### US-3.4-01-themes-loaded
- **File:** `tests/e2e/final/US-3.4-01-themes-loaded.png`
- **Description:** Themes explorer page ("Explorer les Thèmes") displaying list of theme cards. Multiple cards shown (4-6 visible) with theme names, colored dot indicators (blue, orange, green, red, purple), researcher count, keyword tags, and publication statistics. Cards arranged in grid or row layout.
- **State keywords:** themes-page, card-list, colored-indicators, stats-visible

### US-3.4-02-card-hover
- **File:** `tests/e2e/final/US-3.4-02-card-hover.png`
- **Description:** Theme card in hover state showing visual feedback. Card may have background highlight, shadow elevation, or button reveal. Interaction cues visible indicating card is clickable. Same card layout with enhanced visual state.
- **State keywords:** card-hover, visual-feedback, elevation, interaction-cue

### US-3.4-03-card-detail
- **File:** `tests/e2e/final/US-3.4-03-card-detail.png`
- **Description:** Theme card detail view after click. Expanded card or detail panel shows full theme information including name, complete description text, member researcher list with names, publication count, related keywords/tags, and action buttons for map navigation or further exploration.
- **State keywords:** card-detail, expanded-view, full-info, researcher-list

### US-3.4-04-expanded
- **File:** `tests/e2e/final/US-3.4-04-expanded.png`
- **Description:** Themes explorer page showing multiple theme cards in list view. First card "BPM Foundations & Modeling" (4 chercheurs) is highlighted with left blue border. Below visible cards: "Conformance Checking" (14 chercheurs, blue dot), "Declarative & Formal Methods" (6 chercheurs, cyan dot), "Healthcare Process Mining" (5 chercheurs, green dot), "IoT, RPA & Applied PM" (5 chercheurs, yellow dot). Each card shows related keywords/tags.
- **State keywords:** themes-list, multi-card-view, colored-indicators, keyword-tags, researcher-counts

### US-3.4-05-navigate-profile
- **File:** `tests/e2e/final/US-3.4-05-navigate-profile.png`
- **Description:** Themes page showing scrollable list with multiple theme cards. Cards visible include BPM Foundations, Conformance Checking, Declarative & Formal Methods, Healthcare Process Mining, IoT RPA themes. Navigation to researcher profiles section below cards with researcher names as blue hyperlinks.
- **State keywords:** themes-scroll, researcher-links, multi-theme-display, navigation-ready

### US-3.4-06-crossnav-researchers
- **File:** `tests/e2e/final/US-3.4-06-crossnav-researchers.png`
- **Description:** Navigated to Chercheurs (researchers) page showing table with researcher data. Multiple rows visible with researcher names (Abel Armas Cervantes, Adriano Augusto, Agnes Koschmider, Ahmed Awad, Alessandro Gianola, Andrea Burattin), labs, theme tags (process model comparison, behavioral relations, change detection, process discovery, etc.), publication counts (3), and Voir buttons.
- **State keywords:** cross-navigation, researchers-table, full-table-view, theme-tags

### US-3.4-07-crossnav-map
- **File:** `tests/e2e/final/US-3.4-07-crossnav-map.png`
- **Description:** Thematic map fully loaded after cross-navigation from themes page. Complete Three.js nebula visualization showing multiple theme clusters (cyan, brown/gold, purple, green, red) with all nodes visible. Filter panel on left shows Theme and Laboratoire dropdowns. Legend panel on right displays all theme names with colored dots. Map is fully interactive.
- **State keywords:** cross-nav-success, map-loaded, all-clusters, legend-visible, filters-ready

### US-3.4-E1-01-intercept
- **File:** `tests/e2e/final/US-3.4-E1-01-intercept.png`
- **Description:** API error interception setup on themes page. Error test scenario begins. Themes explorer page showing "Explorer les Themes" heading with "Voir sur la carte" button. API endpoint is intercepted for error testing.
- **State keywords:** error-setup, intercept-active, themes-page, api-monitoring

### US-3.4-E1-02-loaded
- **File:** `tests/e2e/final/US-3.4-E1-02-loaded.png`
- **Description:** Themes page with no theme cards displayed. Empty state message "Aucun theme disponible" (No theme available) visible in center of page. Page layout intact with "Voir sur la carte" button and sidebar space. No theme data loaded.
- **State keywords:** empty-state, no-data, aucun-theme, api-error-state

### US-3.4-E1-03-empty-state
- **File:** `tests/e2e/final/US-3.4-E1-03-empty-state.png`
- **Description:** Themes explorer page after API error showing empty state. Centered message "Aucun theme disponible" displayed. Page structure visible (heading, button, filters) but no theme cards rendered due to failed API response.
- **State keywords:** empty-state, api-failure, no-content, error-recovery

### US-3.4-E2-01-intercept
- **File:** `tests/e2e/final/US-3.4-E2-01-intercept.png`
- **Description:** Second error scenario setup with API monitoring active. Themes explorer page ready for error test. "Explorer les Themes" heading visible with navigation button. API interception configured for variant E2.
- **State keywords:** error-scenario-2, intercept-setup, themes-explorer, api-mock

### US-3.4-E2-02-loaded
- **File:** `tests/e2e/final/US-3.4-E2-02-loaded.png`
- **Description:** Themes page during loading or after partial API response. Shows spinner "Chargement..." (Loading...) in center of content area. Page layout visible but theme data still pending or incomplete.
- **State keywords:** loading-state, spinner-visible, partial-data, api-pending

### US-3.4-E2-03-zero-members
- **File:** `tests/e2e/final/US-3.4-E2-03-zero-members.png`
- **Description:** Themes list showing theme card with zero researchers. Theme card displays (e.g., "BPM Foundations") with color indicator but shows "0 chercheurs" (0 researchers) instead of populated count. Edge case where theme exists but has no member assignments.
- **State keywords:** zero-members, edge-case, empty-researchers, theme-card

### US-3.4-E3-01-intercept
- **File:** `tests/e2e/final/US-3.4-E3-01-intercept.png`
- **Description:** Third error test scenario setup with API intercept active. Themes explorer page initialized. "Explorer les Themes" heading and navigation visible. API endpoint mocked for E3 variant testing.
- **State keywords:** error-scenario-3, intercept-active, themes-page, api-stub

### US-3.4-E3-02-loaded
- **File:** `tests/e2e/final/US-3.4-E3-02-loaded.png`
- **Description:** Themes page displaying multiple theme cards in full list view. Cards visible: "BPM Foundations & Modeling" (4 chercheurs), "Conformance Checking" (14 chercheurs, blue indicator), "Declarative & Formal Methods" (6 chercheurs, cyan indicator), "Healthcare Process Mining" (5 chercheurs, green indicator), "IoT, RPA & Applied PM" (5 chercheurs, yellow indicator). Each card shows keyword tags.
- **State keywords:** full-load, theme-cards-visible, all-data, multiple-themes

### US-3.4-E3-03-error
- **File:** `tests/e2e/final/US-3.4-E3-03-error.png`
- **Description:** Themes page showing error state. Error message or error icon displayed. Page may show partial data or error recovery UI. Failed API response handling for E3 variant.
- **State keywords:** error-state, error-message, failed-load, error-display

## US-4.1: Admin User Management

### US-4.1-01-admin-logged-in
- **File:** `tests/e2e/final/US-4.1-01-admin-logged-in.png`
- **Description:** Admin user logged in and viewing dashboard. Navbar shows "Admin CartoPM" badge with "ADMIN" label on right. Dashboard displays with elevated stat cards (105 Chercheurs, 271 Themes, 10 Clusters, 315 Publications). Activity feed shows admin actions (Configuration, Modification, Suppression of profiles). Mini-map visible on right.
- **State keywords:** admin-logged-in, elevated-stats, admin-actions, activity-feed

### US-4.1-02-admin-panel
- **File:** `tests/e2e/final/US-4.1-02-admin-panel.png`
- **Description:** Administration panel page with tab navigation. Tabs visible: "Utilisateurs" (Users, active), "Profils en attente" (Pending Profiles), "Import", "Parametres" (Settings), "Logs". Content area shows loading spinner "Chargement..." indicating user list is being fetched.
- **State keywords:** admin-panel, tab-navigation, loading-state, users-tab

### US-4.1-03-user-table
- **File:** `tests/e2e/final/US-4.1-03-user-table.png`
- **Description:** User management table displaying list of users. Columns: NOM (Name), EMAIL, ROLE, ACTIONS. Multiple user rows visible with names (Abel Armas Cervantes, Adriano Augusto, Agnes Koschmider, Ahmed Awad, Alessandro Gianola, Andrea Burattin), email addresses, assigned roles, and action buttons (Voir, edit/delete icons). Table shows 6+ users with sortable columns.
- **State keywords:** user-table, user-list, roles-visible, actions-column

### US-4.1-04-edit-role
- **File:** `tests/e2e/final/US-4.1-04-edit-role.png`
- **Description:** User role editing interface. User row is in edit mode or role dropdown is open. Dialog or inline editor showing role selection options. Selected user's current role can be changed to different permission level.
- **State keywords:** edit-mode, role-select, dialog-open, role-change

### US-4.1-05-role-changed
- **File:** `tests/e2e/final/US-4.1-05-role-changed.png`
- **Description:** After editing user role. User table shows updated role assignment. Confirmation may be visible (success message or toast notification). Table refreshed to show new role value for edited user.
- **State keywords:** role-updated, success-state, table-refresh, role-applied

### US-4.1-06-invite-dialog
- **File:** `tests/e2e/final/US-4.1-06-invite-dialog.png`
- **Description:** User invitation dialog displayed. Modal form shows fields for inviting new user(s). Input field for email address(es), role selection dropdown, and action buttons (Send/Cancel or similar). Dialog title indicates "Invite User" or "Add User" functionality.
- **State keywords:** invite-dialog, modal-form, email-input, role-select

### US-4.1-07-invite-sent
- **File:** `tests/e2e/final/US-4.1-07-invite-sent.png`
- **Description:** After user invitation sent. Invite dialog closed and user table refreshed. New invited user may appear in list or pending section. Success notification visible confirming invitation was sent to specified email address(es).
- **State keywords:** invite-sent, success-notification, dialog-closed, user-added

