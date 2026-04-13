# Screenshot Manifest — Milestone 2

## Happy Path Screenshots

| Filename | Description |
|----------|-------------|
| US-2.1-01-list-loaded.png | Researcher list page with 5 researchers displayed, showing columns for Name, Lab, Themes (as blue badges), Publications count, and Actions (Voir button). |
| US-2.1-02-table-visible.png | Same researcher list table confirming all columns (Nom, Laboratoire, Themes, Publications, Actions) are properly visible with data-filled rows. |
| US-2.1-03-search-text.png | Search field populated with "Dupont" query showing filtered list with only Marie Dupont researcher visible. |
| US-2.1-04-filter-lab.png | Lab filter dropdown changed to "LIRIS" showing only Claire Fontaine and Marie Dupont (both LIRIS researchers). |
| US-2.1-05-combined-filters.png | Combined LIRIS lab filter + "conformance" theme filter applied, displaying 2 matching researchers. |
| US-2.1-06-crossnav-themes.png | Navigated to "Explorer les Themes" page via "Explorer par theme" button showing theme cards with Conformance Checking (2 researchers), Object-Centric PM (1), Process Discovery (1), Process Enhancement (1). |
| US-2.2-01-list-loaded.png | Back on researcher list page showing full table with all 5 researchers. |
| US-2.2-02-click-voir.png | List page unchanged after clicking "Voir" button on Marie Dupont (action initiating profile load). |
| US-2.2-03-sidebar.png | Profile sidebar loaded for Marie Dupont showing avatar (MD), name, lab (LIRIS), bio snippet ("Chercheuse en conformance checking..."), and action buttons (Comparer, Voir sur la carte). |
| US-2.2-04-keywords.png | Profile page showing Mots-clés section with 3 blue keyword badges: conformance, alignment, process mining. |
| US-2.2-05-publications.png | Publications section visible listing 2 publications with titles, authors, and years (ICPM 2023, BPM 2022). |
| US-2.2-06-breadcrumb.png | Breadcrumb navigation "Chercheurs > Marie Dupont" displayed at top of profile page. |
| US-2.2-07-breadcrumb-back.png | Clicked breadcrumb returns to researcher list showing all 5 researchers again. |
| US-2.4-01-comparison-empty.png | Comparison page ("Comparer deux chercheurs") loaded in empty state with two dropdown fields labeled "Chercheur A" and "Chercheur B" (both showing placeholder "Sélectionner un chercheur...") and VS badge, with instructional message. |
| US-2.4-02-select-researcher-a.png | Marie Dupont selected in Chercheur A dropdown showing "Marie Dupont — LIRIS". |
| US-2.4-03-select-researcher-b.png | Ahmed Benali selected in Chercheur B dropdown showing "Ahmed Benali — LIG". |
| US-2.4-04-comparison-loaded.png | Full comparison view showing side-by-side profiles: Marie Dupont (purple MD badge) vs Ahmed Benali (pink AB badge), with 0% similarity gauge in center, keywords, and publication lists for each. |
| US-2.4-05-common-themes.png | Comparison showing "Themes communs" section at bottom with message "Aucun theme commun." (0% similarity means no shared themes). |
| US-2.4-06-common-keywords-highlighted.png | Comparison of Marie Dupont vs Claire Fontaine showing 82% similarity gauge with highlighted keywords: "conformance" underlined in both researcher keyword sections. |
| US-2.4-07-themes-communs-card.png | Common themes card showing shared theme "conformance" with similarity score explanation: "Ces deux chercheurs partagent 1 theme commun avec un score de similarite de 82%. (Algorithme: tfidf)". |
| US-2.5-01-profile-loaded.png | Marie Dupont profile page loaded with sidebar and main content area visible. |
| US-2.5-02-button-visible.png | "Voir sur la carte" button visible in sidebar below profile information. |
| US-2.5-03-map-loaded.png | Thematic map page ("Carte Thematique") loaded showing dark navy background with colored circular clusters for different themes: Object-Centric (orange), Process Discovery (green), with legend panel showing all 4 themes (Conformance Checking blue, Object-Centric orange, Process Discovery green, Process Enhancement red). Filter panel on left with "Tous" selected. |
| US-2.5-04-centered-highlighted.png | Same map view with clusters positioned and highlighted with theme labels inside circles. |

## Edge Case Screenshots

| Filename | Description |
|----------|-------------|
| US-2.1-E1-01-list-loaded.png | Initial list loaded for empty search test case. |
| US-2.1-E1-02-type-query.png | Search field populated with "xyznonexistent" showing the input text. |
| US-2.1-E1-03-no-results.png | Search result showing "Aucun resultat. Ajustez vos filtres." message with empty result area. |
| US-2.1-E2-01-intercept.png | API intercept active, researchers endpoint aborted to simulate failure. |
| US-2.1-E2-02-page-loading.png | Page showing error state "Une erreur est survenue." with "Ressayer" button while API is down. |
| US-2.1-E2-03-error-state.png | Error state persists showing warning icon, error message "Une erreur est survenue.", and retry button. |
| US-2.1-E3-01-list-loaded.png | Initial list page loaded for XSS security test. |
| US-2.1-E3-02-xss-input.png | Search field populated with XSS payload "&lt;script&gt;alert('xss')&lt;/script&gt;" displayed as escaped text. |
| US-2.1-E3-03-sanitized.png | Same XSS payload shown sanitized and treated as plain text query, no results found, confirming input was safely escaped. |
| US-2.2-E1-01-intercept.png | Intercepted profile data with empty publications array to test no-publications state. |
| US-2.2-E1-02-profile-loaded.png | Profile loaded showing only 2 keywords (conformance, alignment) and no publications section content. |
| US-2.2-E1-03-no-pubs.png | Bio states "Chercheuse sans publications." and Publications section shows "Aucune publication enregistree." message. |
| US-2.2-E2-01-intercept-404.png | API returns 404 response for nonexistent profile ID. |
| US-2.2-E2-02-loading.png | Page loaded with 404 response showing not-found state. |
| US-2.2-E2-03-not-found.png | Not-found page displayed with "Profil introuvable" title, message "Ce profil n'existe pas ou a ete supprime.", magnifying glass icon, and "Retour a la liste" button. |
| US-2.2-E3-01-intercept.png | Long bio intercepted (~3000 chars) to test truncation behavior. |
| US-2.2-E3-02-profile-loaded.png | Profile sidebar showing long bio truncated at 2000 chars with Lorem ipsum placeholder text displayed and "Lire la suite" link visible. |
| US-2.2-E3-03-truncated-bio.png | Bio card showing Lorem ipsum text truncated with "..." and "Lire la suite" link visible. |
| US-2.2-E3-04-expanded-bio.png | Bio expanded after clicking "Lire la suite", showing full Lorem ipsum text and "Reduire" button visible to collapse. |
| US-2.4-E1-01-intercept.png | Zero-similarity intercept active with disjoint keyword sets (Marie Dupont vs Jean Martin). |
| US-2.4-E1-02-comparison.png | Comparison showing Marie Dupont vs Jean Martin with 0% similarity gauge. |
| US-2.4-E1-03-zero-gauge.png | Similarity gauge displaying 0% (empty/gray circle) for researchers with no common themes. |
| US-2.4-E1-04-no-common.png | Common themes section showing "Aucun theme commun." message confirming zero shared themes. |
| US-2.4-E2-01-api-failure.png | Similarity API failure intercept active during comparison load. |
| US-2.4-E2-02-score-indisponible.png | Comparison page showing 0% similarity as fallback when similarity API unavailable, with "Aucun theme commun." and no common themes card. |
| US-2.4-E3-01-same-researcher.png | Same researcher (Marie Dupont) selected for both Chercheur A and Chercheur B dropdowns. |
| US-2.5-E1-01-intercept.png | Profile API returns null for map_x and map_y coordinates (missing location data). |
| US-2.5-E1-02-profile-loaded.png | Profile loaded with sidebar showing "Chercheuse sans coordonnees carte." indicating no map coordinates available. |
| US-2.5-E1-03-disabled-button.png | "Voir sur la carte" button appears disabled (grayed out) with no action on click due to missing coordinates. |
| US-2.5-E2-01-intercept.png | Clusters API call intercepted when navigating to map page. |
| US-2.5-E2-02-navigate.png | Map page showing loading spinner with "Chargement..." text while clusters API is blocked. |
| US-2.5-E2-03-map-error.png | Map error state displayed with warning icon and "Chargement echoe" message after clusters API fails. |
| US-2.5-E3-01-intercept.png | Cluster reorganized response: Marie Dupont not found in any cluster, triggering toast notification. |
| US-2.5-E3-02-navigate.png | Map navigated showing empty cluster after reorganization (Conformance Checking cluster now only shows partial label). |
| US-2.5-E3-03-new-position.png | Toast notification showing "n'a pas encore de position" (researcher not in reorganized cluster layout). |

## Happy Path vs Edge Case Behavior Pairs

| Feature | Happy Path Screenshot | Happy Path Description | Edge Case Screenshot | Edge Case Description | Visually Different? |
|---------|----------------------|------------------------|--------------------|-----------------------|---------------------|
| Search Functionality | US-2.1-03-search-text.png | Search populated with "Dupont" filters list to show 1 matching researcher | US-2.1-E1-03-no-results.png | Search "xyznonexistent" shows empty state message "Aucun resultat. Ajustez vos filtres." | Yes |
| API Failure Handling | US-2.1-01-list-loaded.png | List fully populated with 5 researchers and data | US-2.1-E2-03-error-state.png | Error state shows warning icon, error message, and retry button | Yes |
| XSS Input Security | US-2.1-01-list-loaded.png | Normal list loaded with safe data | US-2.1-E3-03-sanitized.png | XSS payload displayed as plain text in search field, treated safely | Yes |
| Profile Publications | US-2.2-05-publications.png | Publications section shows 2 publications with full details | US-2.2-E1-03-no-pubs.png | Publications section shows "Aucune publication enregistree." empty state message | Yes |
| 404 Profile Handling | US-2.2-06-breadcrumb.png | Profile page fully rendered with data and breadcrumb | US-2.2-E2-03-not-found.png | Not-found page with "Profil introuvable" title and return button | Yes |
| Long Bio Truncation | US-2.2-03-sidebar.png | Bio truncated at 2000 chars with "Lire la suite" link | US-2.2-E3-04-expanded-bio.png | Bio expanded showing full text with "Reduire" button | Yes |
| Similarity Score Calculation | US-2.4-06-common-keywords-highlighted.png | Comparison shows 82% similarity with highlighted common "conformance" keyword | US-2.4-E1-04-no-common.png | Comparison shows 0% similarity with "Aucun theme commun." when researchers have no shared themes | Yes |
| API Failure in Comparison | US-2.4-04-comparison-loaded.png | Comparison loaded showing 0% similarity and theme data | US-2.4-E2-02-score-indisponible.png | Comparison shows fallback 0% when similarity API fails | Minimal (both show 0%) |
| Map Button Availability | US-2.5-02-button-visible.png | "Voir sur la carte" button visible and enabled in sidebar | US-2.5-E1-03-disabled-button.png | Same button appears disabled (grayed out) when no coordinates | Yes |
| Map Loading State | US-2.5-03-map-loaded.png | Map fully rendered with theme clusters and legend | US-2.5-E2-02-navigate.png | Map loading state shows spinner with "Chargement..." message | Yes |
| Map Error Handling | US-2.5-03-map-loaded.png | Map fully rendered with all clusters visible | US-2.5-E2-03-map-error.png | Map error state with warning icon and "Chargement echoe" message | Yes |
| Theme Highlighting | US-2.4-06-common-keywords-highlighted.png | Keywords highlighted with blue underline border in both profiles (82% match) | US-2.4-07-themes-communs-card.png | Common theme card shows matching theme with similarity algorithm explanation | Yes |
| Comparison with Same Researcher | US-2.4-02-select-researcher-a.png | Researcher A selected normally | US-2.4-E3-01-same-researcher.png | Same researcher in both dropdowns shows yellow/tan warning banner "Veuillez selectionner deux chercheurs differents." | Yes |
