# Final Specification — Process Mining Research Cartography

> Ground truth of what the app actually does, as of 2026-04-15.
> Original spec: `docs/pipeline/spec.md`. This file reflects all modifications from Steps 4-5 including Three.js map rewrite and Step 5 Round 2 hardening.

## Product Vision

CartoPM is a web application that maps process mining research. Researchers enter their work (themes, keywords, publications) via structured forms. The app auto-computes textual similarity (NLP) between descriptions to reveal thematic proximities, and displays an interactive visual cluster map. It replaces scattered Excel spreadsheets and notes with a single, bilingual (FR/EN), collaborative platform.

**Target users:** Process mining researchers and lab administrators.
**Core value:** Discover thematic proximity between researchers automatically, visualize the community landscape, and facilitate collaboration.

---

## Sections & Screens

### Section 1: Dashboard (2 screens)
- **Main Dashboard** — 4 stat cards, recent activity feed, mini-map preview
- **Detailed Statistics** — Bar chart (theme distribution), line chart (temporal trends), histogram (similarity scores)

### Section 2: Chercheurs (4 screens)
- **Researcher List** — Searchable/filterable table with lab and theme dropdowns
- **Researcher Profile** — Sidebar (avatar, name, lab, bio) + keywords tags + publications list + "View on map" button
- **Add/Edit Profile** — Structured form (name, lab, keywords tag input, bio textarea, repeatable publication blocks) + approval banner
- **Comparison** — Side-by-side profiles with similarity gauge circle + common themes section

### Section 3: Carte Thematique (2 screens)
- **Interactive Map** — Three.js WebGL nebula visualization with OrbitControls (zoom/pan/autoRotate), floating filter panel, color legend, researcher particle dots, cluster side panel
- **Explore Themes** — Grid of expandable cluster cards with Three.js nebula thumbnail per card, member lists, and cross-links

### Section 4: Administration (4 screens, admin-only, route-guarded)
- **User Management** — Table with roles/badges, invite button (focus-trapped dialog), modify/revoke actions
- **Bulk Import** — Drag-and-drop CSV/Excel zone (RFC-4180 parser) + Google Scholar URL input + data preview table + confirm button
- **Settings** — Language radio (FR/EN), similarity threshold slider (0.0-1.0), NLP algorithm dropdown (TF-IDF/Word2Vec/BERT) + save button
- **Audit Logs** — Table (date, user, action, detail) with date range filters, color-coded action tags

### Authentication
- **Login Screen** — Centered card with email/password fields, demo login buttons (researcher/admin)
- **Navbar** — Brand, nav tabs, login button (transforms to user avatar+dropdown with focus management after login), language toggle, admin tab (admin-only)

---

## User Stories

### US-1.1 — Dashboard Stats Display [UNCHANGED]
**As a** researcher, **I can** see global stats (researcher count, theme count, cluster count, publications) on the main dashboard.

#### Acceptance Criteria
- **AC-1:** GIVEN the dashboard loads, WHEN the API returns stats, THEN 4 cards display: Chercheurs, Themes, Clusters, Publications with current counts.
- **AC-2:** GIVEN the dashboard is visible, WHEN data changes on the server, THEN the stat numbers update without a full page reload.
- **AC-3:** GIVEN a stat card is displayed, WHEN the user clicks it, THEN they navigate to the corresponding section (Chercheurs, Themes, Carte, Publications).

#### Edge Cases
- **US-1.1-E1:** GIVEN the API is unreachable, WHEN the dashboard loads, THEN stat cards show a loading skeleton and a retry button appears.
- **US-1.1-E2:** GIVEN the database is empty, WHEN the dashboard loads, THEN all stat cards display "0" with a message "Aucune donnee disponible."
- **US-1.1-E3:** GIVEN one stat exceeds 99,999, WHEN displayed, THEN the number is formatted with thousands separators (e.g., "100 000").

---

### US-1.2 — Recent Activity Feed [UNCHANGED]
**As a** researcher, **I can** see recent activity (new profiles, latest publications) to stay informed.

#### Acceptance Criteria
- **AC-1:** GIVEN the dashboard loads, WHEN activity data is fetched, THEN the 5 most recent activities display with avatar, name, action description, and relative timestamp.
- **AC-2:** GIVEN activities exist, WHEN displayed, THEN they are sorted by date descending (newest first).
- **AC-3:** GIVEN an activity displays a researcher name, WHEN the user clicks on it, THEN they navigate to that researcher's profile.

#### Edge Cases
- **US-1.2-E1:** GIVEN no activities exist, WHEN the dashboard loads, THEN the activity section shows "Aucune activite recente" with an empty-state illustration.
- **US-1.2-E2:** GIVEN the activity API fails, WHEN the dashboard loads, THEN the activity section shows an error message with a retry link.
- **US-1.2-E3:** GIVEN an activity references a deleted researcher, WHEN displayed, THEN the name is shown in gray (non-clickable) with "(profil supprime)".

---

### US-1.3 — Mini-Map Preview [MODIFIED]
**As a** researcher, **I can** click the mini-map on the dashboard to navigate to the full thematic map.

**What changed from original spec:** Visualization upgraded from SVG to Three.js WebGL (commit a71d4bf). The mini-map now renders a floating-nebula scene with per-cluster nebula spheres, particle dots, a slowly orbiting camera, and pulsing opacity. Click-to-navigate, loading, and error states are unchanged. A `useWebGLContextLoss` hook shows a "Reload" button if WebGL context is lost (R2 fix C2).

#### Acceptance Criteria
- **AC-1:** GIVEN the dashboard loads, WHEN cluster data is available, THEN a Three.js WebGL nebula preview renders in the mini-map area showing colored cluster spheres and particle dots.
- **AC-2:** GIVEN the mini-map is displayed, WHEN the user hovers over it, THEN a pointer cursor appears and the container gets a blue outline highlight.
- **AC-3:** GIVEN the mini-map is displayed, WHEN the user clicks it (or presses Enter/Space), THEN they navigate to the full map view.
- **AC-4 (NEW):** GIVEN WebGL context is lost, WHEN detected, THEN an overlay shows "Contexte WebGL perdu" with a "Recharger" button.

#### Edge Cases
- **US-1.3-E1:** GIVEN no clusters exist, WHEN the dashboard loads, THEN the mini-map shows a placeholder with "Carte non disponible" text.
- **US-1.3-E2:** GIVEN the cluster API is slow (>3s), WHEN the dashboard loads, THEN the mini-map shows a loading spinner until data arrives.
- **US-1.3-E3:** GIVEN the cluster API returns an error, WHEN the component renders, THEN a fallback message "Cliquer pour voir la carte" is shown.

#### Step 5 Hardening Notes
- **R2/C2:** `useWebGLContextLoss` added — detects `webglcontextlost` event and shows reload prompt.

---

### US-1.4 — Detailed Statistics [UNCHANGED]
**As a** researcher, **I can** view detailed statistics (theme distribution, similarity metrics, temporal trends).

#### Acceptance Criteria
- **AC-1:** GIVEN the stats screen loads, WHEN theme data is available, THEN a bar chart displays the distribution of themes (theme name vs. researcher count).
- **AC-2:** GIVEN the stats screen loads, WHEN temporal data is available, THEN a line chart displays publication/membership trends over time.
- **AC-3:** GIVEN the stats screen loads, WHEN similarity data is available, THEN a histogram displays the distribution of pairwise similarity scores (capped at 10,000 rows for performance).
- **AC-4:** GIVEN any chart is displayed, WHEN the user hovers over a data point, THEN a tooltip shows the exact value.

#### Edge Cases
- **US-1.4-E1:** GIVEN no researchers exist, WHEN the stats screen loads, THEN all charts show empty states with "Pas assez de donnees pour generer ce graphique."
- **US-1.4-E2:** GIVEN only 1 researcher exists, WHEN the similarity histogram is requested, THEN it shows "Au moins 2 chercheurs requis pour calculer la similarite."
- **US-1.4-E3:** GIVEN the stats API returns malformed data, WHEN the screen loads, THEN charts show an error state with "Erreur de chargement" and a retry link.

---

### US-2.1 — Researcher Search & Filter [UNCHANGED]
**As a** researcher, **I can** search and filter the researcher list by lab, theme, or keyword.

#### Acceptance Criteria
- **AC-1:** GIVEN the researcher list loads, WHEN the user types in the search field, THEN the table filters in real-time to show matching researchers by name or keyword.
- **AC-2:** GIVEN the researcher list is displayed, WHEN the user selects a lab from the dropdown, THEN only researchers from that lab are shown.
- **AC-3:** GIVEN the researcher list is displayed, WHEN the user selects a theme from the dropdown, THEN only researchers with that theme are shown.
- **AC-4:** GIVEN both filters are active, WHEN combined, THEN they apply with AND logic (both conditions must be true).

#### Edge Cases
- **US-2.1-E1:** GIVEN the user types a query matching no researchers, WHEN the table filters, THEN a "Aucun resultat" message is shown with suggestion to adjust filters.
- **US-2.1-E2:** GIVEN the researcher API fails, WHEN the list loads, THEN an error message replaces the table with a retry button.
- **US-2.1-E3:** GIVEN a search query contains special characters (<, >, &), WHEN entered, THEN they are sanitized and do not break the display or cause XSS.

---

### US-2.2 — Researcher Profile View [UNCHANGED]
**As a** researcher, **I can** view a full profile (info, themes, publications, map position).

#### Acceptance Criteria
- **AC-1:** GIVEN a researcher is selected, WHEN their profile loads, THEN the sidebar displays avatar (initials), full name, lab, and bio text.
- **AC-2:** GIVEN the profile loads, WHEN keywords exist, THEN they display as colored tags in the keywords card.
- **AC-3:** GIVEN the profile loads, WHEN publications exist, THEN they display as a list with title, co-authors, and venue/year.
- **AC-4:** GIVEN the profile has map data, WHEN the user clicks "Voir sur la carte," THEN they navigate to the map centered on that researcher.

#### Edge Cases
- **US-2.2-E1:** GIVEN a researcher has no publications, WHEN the profile loads, THEN the publications section shows "Aucune publication enregistree."
- **US-2.2-E2:** GIVEN the profile API returns 404, WHEN navigating to a profile, THEN a "Profil introuvable" message is shown with a link back to the list.
- **US-2.2-E3:** GIVEN a researcher has a very long bio (>2000 chars), WHEN displayed, THEN it is truncated with a "Lire la suite" expand toggle.

---

### US-2.3 — Add/Edit Profile Form [UNCHANGED]
**As a** logged-in researcher, **I can** add or edit my own profile via a structured form, pending admin approval.

#### Acceptance Criteria
- **AC-1:** GIVEN a logged-in researcher navigates to the form, WHEN it loads, THEN fields are pre-populated with existing data (for edit) or empty (for add).
- **AC-2:** GIVEN the form is displayed, WHEN the user types a keyword and presses Enter, THEN a new tag is added to the keyword input.
- **AC-3:** GIVEN the form is displayed, WHEN the user clicks "+ Ajouter une publication," THEN a new blank publication block (title, co-authors, venue) appears.
- **AC-4:** GIVEN the user fills the form, WHEN they click "Enregistrer," THEN the profile is submitted for admin approval and a success toast appears. Double-click is guarded by a ref to prevent concurrent saves.
- **AC-5:** GIVEN the form is displayed, WHEN the user clicks "Annuler," THEN they return to the researcher list without saving.
- **AC-6:** GIVEN the form loads, WHEN displayed, THEN a yellow approval banner reads "Votre profil sera soumis a validation par un administrateur avant d'etre publie."

#### Edge Cases
- **US-2.3-E1:** GIVEN required fields are empty, WHEN the user clicks "Enregistrer," THEN validation errors highlight the missing fields and submission is blocked.
- **US-2.3-E2:** GIVEN the save API fails (500), WHEN the user submits, THEN an error toast "Erreur de sauvegarde, veuillez reessayer" appears and the form data is preserved.
- **US-2.3-E3:** GIVEN the user adds a duplicate keyword, WHEN they press Enter, THEN the duplicate is rejected with a brief "Mot-cle deja present" note.

---

### US-2.4 — Side-by-Side Comparison [UNCHANGED]
**As a** researcher, **I can** compare two researchers side-by-side with common themes and similarity score.

#### Acceptance Criteria
- **AC-1:** GIVEN the comparison screen loads, WHEN two researchers are selected, THEN their profiles display in two columns with a similarity gauge in the center.
- **AC-2:** GIVEN the comparison displays, WHEN common themes exist, THEN they are visually highlighted with a blue outline on both sides.
- **AC-3:** GIVEN the comparison displays, WHEN the similarity score is computed, THEN it shows as a percentage inside a circular gauge.
- **AC-4:** GIVEN the comparison displays, WHEN common themes exist, THEN a summary card at the bottom lists shared themes with a textual explanation.

#### Edge Cases
- **US-2.4-E1:** GIVEN two researchers share zero themes, WHEN compared, THEN the gauge shows "0%" and the common themes section reads "Aucun theme commun."
- **US-2.4-E2:** GIVEN the similarity API fails, WHEN the comparison loads, THEN a fallback message "Score de similarite indisponible" replaces the gauge.
- **US-2.4-E3:** GIVEN the user selects the same researcher twice, WHEN comparison loads, THEN a message "Veuillez selectionner deux chercheurs differents" is shown.

---

### US-2.5 — Profile to Map Navigation [UNCHANGED]
**As a** researcher, **I can** navigate from a profile to that person's position on the thematic map.

#### Acceptance Criteria
- **AC-1:** GIVEN a profile is displayed, WHEN the user clicks "Voir sur la carte," THEN the map screen opens.
- **AC-2:** GIVEN the map opens from a profile, WHEN it renders, THEN the view is centered on the selected researcher's dot.
- **AC-3:** GIVEN the map centers on a researcher, WHEN it renders, THEN that researcher's dot pulses or is visually highlighted.

#### Edge Cases
- **US-2.5-E1:** GIVEN a researcher has no map coordinates (new, unprocessed), WHEN "Voir sur la carte" is clicked, THEN a toast "Ce chercheur n'a pas encore de position sur la carte" appears and the button is disabled.
- **US-2.5-E2:** GIVEN the map data API fails, WHEN navigating, THEN the map shows an error overlay with a retry button.
- **US-2.5-E3:** GIVEN the researcher belongs to a cluster that was recently reorganized, WHEN navigating, THEN the map still centers correctly using the latest coordinates.

---

### US-3.1 — Interactive Cluster Map [MODIFIED]
**As a** researcher, **I can** view the interactive cluster map with zoom, pan, filter controls, and mouse/touch interaction.

**What changed from original spec:** D3 SVG map fully replaced with Three.js WebGL nebula visualization (commit e7141f9). The scene shows a dark starfield, Fibonacci-sphere-positioned nebula clusters (glowing translucent spheres), particle dots per researcher, animated autoRotate via OrbitControls (zoom min 5 / max 60), a slide-in side panel on cluster click with lazy member fetch, hover tooltip over particles, and a camera fly-to animation. The floating filter panel, color legend, and cross-nav button are retained. The SVG-based keyboard Tab navigation through clusters/dots was removed with the D3 rewrite — Three.js Mesh objects are not DOM-focusable. Escape closes the side panel.

**Step 5 R2 hardening (d787255):** C2 — `useWebGLContextLoss` hook shows "Recharger la carte" overlay on context loss. H2 — CSS media query stacks filter panel above canvas at <768px. H3 — map-container height changed to `min(70vh, 800px)`.

#### Acceptance Criteria
- **AC-1:** GIVEN the map screen loads, WHEN cluster data is available, THEN a Three.js WebGL scene renders colored nebula clusters and particle researcher dots on a dark starfield background.
- **AC-2:** GIVEN the map is displayed, WHEN the user scrolls or pinches, THEN the map zooms in/out (capped at min 5 / max 60 distance).
- **AC-3:** GIVEN the map is displayed, WHEN the user clicks and drags, THEN the camera orbits.
- **AC-4:** GIVEN the filter panel is displayed, WHEN the user selects a theme or lab and clicks "Appliquer," THEN only matching clusters/researchers are shown.
- **AC-5:** GIVEN the map is displayed, WHEN the legend is visible, THEN each cluster color is labeled with its theme name.
- **AC-6 (NEW):** GIVEN WebGL context is lost, WHEN detected, THEN an overlay shows "Le contexte WebGL a ete perdu" with a "Recharger la carte" button.
- **AC-7 (NEW):** GIVEN a cluster nebula is clicked, WHEN the side panel opens, THEN the camera flies to the cluster and the side panel slides in listing the cluster's members.
- **AC-8 (NEW):** GIVEN the side panel is open, WHEN Escape is pressed, THEN the panel closes and the camera resets.

#### Edge Cases
- **US-3.1-E1:** GIVEN no clusters exist, WHEN the map loads, THEN an empty state "Aucun cluster disponible" is shown centered in the map area.
- **US-3.1-E2:** GIVEN the user zooms to maximum level, WHEN they attempt to zoom further, THEN zoom is capped at distance 60.
- **US-3.1-E3:** GIVEN the cluster data API times out, WHEN the map loads, THEN a centered error "Chargement echoue" with retry button appears over the dark background.

#### Step 5 Hardening Notes
- **R1/C2, R1/H4:** Code-split via React.lazy and named d3 imports — superseded by Three.js rewrite.
- **R2/C2:** WebGL context loss handling added.
- **R2/H2:** Filter panel responsive at 320px.
- **R2/H3:** Responsive map height.

---

### US-3.2 — Cluster Click for Members [MODIFIED]
**As a** researcher, **I can** click a cluster on the map to see its member researchers and themes in a side panel.

**What changed from original spec:** D3 popover replaced by a full-width `<aside>` side panel (commit e7141f9). Cluster click triggers a camera fly-to animation and slides in the panel from the right. Members are lazy-fetched from Supabase. Sub-theme tags are displayed. Each member is a clickable button navigating to their profile. Escape closes the panel. The panel has `role="dialog"` and `aria-label` with the cluster name, but no focus trap.

#### Acceptance Criteria
- **AC-1:** GIVEN the map is displayed, WHEN the user clicks a cluster nebula, THEN a side panel slides in listing the cluster's name, sub-theme tags, and member researchers. The camera flies to the cluster.
- **AC-2:** GIVEN the side panel is displayed, WHEN themes are associated, THEN they are shown as styled tags with the cluster's color accent.
- **AC-3:** GIVEN the side panel lists researchers, WHEN the user clicks a name, THEN they navigate to that researcher's profile.
- **AC-4 (NEW):** GIVEN the side panel is open, WHEN the user presses Escape, THEN the panel closes and the camera resets to default position.
- **AC-5 (NEW):** GIVEN the side panel opens, WHEN members are loading, THEN a loading spinner is shown in the member list area.

#### Edge Cases
- **US-3.2-E1:** GIVEN the member fetch API fails, WHEN the side panel opens, THEN the fallback member list from the initial cluster data is shown.
- **US-3.2-E2:** GIVEN the user clicks elsewhere on the map, WHEN the side panel is open, THEN it remains open (close requires the back button or Escape).
- **US-3.2-E3:** GIVEN the cluster data is loading, WHEN the user clicks, THEN a loading spinner appears inside the side panel member area.

#### Step 5 Hardening Notes
- **R1/C5:** D3 popover focus management (auto-focus, Escape, focus restore) — superseded by side panel in Three.js rewrite. Side panel lacks focus trap.

---

### US-3.3 — Researcher Dot to Profile [MODIFIED]
**As a** researcher, **I can** click a researcher particle on the Three.js map to navigate to their profile.

**What changed from original spec:** Researcher dots are now Three.js `Mesh` objects in 3D space (commit e7141f9). Hover detection uses mouse raycasting; tooltip shows name and lab in a fixed overlay div. Click calls `navigateToProfile()` with Supabase validation before navigate. Keyboard Tab activation and individual dot aria-labels are no longer implemented (3D Mesh objects are not DOM elements). The map container has `role="img"` with a general aria-label.

#### Acceptance Criteria
- **AC-1:** GIVEN the map is displayed, WHEN the user hovers over a researcher particle, THEN a tooltip shows the researcher's name and lab, and the cursor changes to pointer.
- **AC-2:** GIVEN the map is displayed, WHEN the user clicks a researcher particle, THEN they navigate to that researcher's profile page (after Supabase validation).
- **AC-3:** GIVEN the particle is hovered, WHEN the cursor enters, THEN the particle scales up and emissive intensity increases as a visual affordance.

#### Edge Cases
- **US-3.3-E1:** GIVEN the profile validation query fails when clicking a particle, THEN a toast "Profil indisponible" appears.
- **US-3.3-E2:** GIVEN a researcher navigated here from a profile via "Voir sur la carte", WHEN the map loads, THEN that researcher's particle is rendered larger (radius 0.28 vs 0.18) with higher emissive intensity and the camera flies to their cluster.
- **US-3.3-E3:** GIVEN the researcher is not found in any cluster, WHEN the map loads from a profile link, THEN a toast "Ce chercheur n'a pas encore de position sur la carte" appears.

#### Step 5 Hardening Notes
- **R1/C3:** SVG dot tabIndex, onKeyDown, aria-label — removed with D3 rewrite. Three.js particles are not keyboard-navigable.

---

### US-3.4 — Theme List View [MODIFIED]
**As a** researcher, **I can** browse themes in a list view showing clusters, researcher counts, cross-links, and visual cluster thumbnails.

**What changed from original spec:** Each cluster card now includes a `ClusterThumbnail` component — a small Three.js nebula rendered in an `aria-hidden` canvas that auto-rotates (commit a71d4bf). Card layout, expand/collapse, member links, and cross-nav are unchanged. No R2 fixes targeted this story.

#### Acceptance Criteria
- **AC-1:** GIVEN the themes screen loads, WHEN cluster data is available, THEN a grid of cluster cards displays, each with name, researcher count, and sub-theme tags.
- **AC-2:** GIVEN a cluster card is displayed, WHEN the user clicks it, THEN it expands to show member researcher names as links.
- **AC-3:** GIVEN an expanded card lists researchers, WHEN the user clicks a name, THEN they navigate to that researcher's profile.
- **AC-4:** GIVEN the themes screen is displayed, WHEN the "Voir sur la carte" cross-nav button is clicked, THEN they navigate to the map screen.

#### Edge Cases
- **US-3.4-E1:** GIVEN no themes exist, WHEN the screen loads, THEN a centered empty state "Aucun theme disponible" is displayed.
- **US-3.4-E2:** GIVEN a cluster has 0 researchers (possible after deletion), WHEN displayed, THEN the card shows "0 chercheurs" and has no expandable member list.
- **US-3.4-E3:** GIVEN the themes API returns malformed JSON, WHEN the screen loads, THEN an error message "Erreur de chargement des themes" with retry is shown.

---

### US-5.1 — User Login [MODIFIED]
**As a** user, **I can** log in to access personal features (profile editing for researchers, admin panel for admins).

**What changed from original spec:** Route-level auth guard (`PrivateRoute`) protects `/admin`. User dropdown menu has proper focus management (auto-focus first item, Tab trap, focus restore).

#### Acceptance Criteria
- **AC-1:** GIVEN the login screen is displayed, WHEN the user enters valid email/password and clicks "Se connecter," THEN they are authenticated and redirected to the dashboard.
- **AC-2:** GIVEN the user is logged in, WHEN the navbar renders, THEN the "Connexion" button is replaced by their avatar (initials) and name, with a dropdown menu.
- **AC-3:** GIVEN the user is logged in as admin, WHEN the navbar renders, THEN an "Admin" tab appears and an "Admin" badge is shown next to the name.
- **AC-4:** GIVEN the user dropdown is visible, WHEN they click "Mon profil," THEN they navigate to their own profile.
- **AC-5:** GIVEN the user dropdown is visible, WHEN they click "Deconnexion," THEN they are logged out and the navbar reverts to showing the "Connexion" button.
- **AC-6 (NEW):** GIVEN the user dropdown opens, WHEN it renders, THEN focus moves to the first menu item. Tab cycles within the menu. Escape closes and returns focus to the trigger.
- **AC-7 (NEW):** GIVEN an unauthenticated user navigates to `/admin`, WHEN the route loads, THEN they are redirected to `/login`.

#### Edge Cases
- **US-5.1-E1:** GIVEN invalid credentials are entered, WHEN the user clicks "Se connecter," THEN an error "Email ou mot de passe incorrect" appears below the form.
- **US-5.1-E2:** GIVEN the auth API is unreachable, WHEN the user submits login, THEN an error "Service indisponible, reessayez plus tard" is shown.
- **US-5.1-E3:** GIVEN the user's session token expires, WHEN they perform an action, THEN they are redirected to the login screen with a message "Session expiree, veuillez vous reconnecter."

---

### US-5.2 — Profile Submission with Admin Approval [UNCHANGED]
**As a** logged-in researcher, **I can** submit my profile which will be validated by an administrator before publication.

#### Acceptance Criteria
- **AC-1:** GIVEN a logged-in researcher views their own profile, WHEN the "Modifier" button is displayed, THEN it is enabled and clickable.
- **AC-2:** GIVEN a logged-in researcher views another's profile, WHEN the "Modifier" button is displayed, THEN it is disabled with a lock icon and a note "Vous ne pouvez modifier que votre propre profil."
- **AC-3:** GIVEN a user is not logged in, WHEN they view a profile, THEN the "Modifier" button is hidden entirely.
- **AC-4:** GIVEN a researcher submits their profile, WHEN the submission succeeds, THEN it appears in the admin "Profils en attente" list.

#### Edge Cases
- **US-5.2-E1:** GIVEN a researcher submits while their previous submission is still pending, WHEN they try to submit again, THEN a warning "Vous avez deja une soumission en attente" is shown.
- **US-5.2-E2:** GIVEN the submission API fails, WHEN the researcher clicks save, THEN an error appears and the form data is not lost.
- **US-5.2-E3:** GIVEN an admin rejects a profile, WHEN the researcher logs in, THEN they see a notification "Votre profil a ete rejete" with the admin's reason.

---

### US-4.1 — User Management [MODIFIED]
**As a** logged-in admin, **I can** manage users (assign roles, send invitations, approve pending profiles).

**What changed from original spec:** Invite dialog has focus trap (Tab cycles within, focus moves to first element on open, restores on close). Admin role check uses `app_metadata` (server-side only) instead of `user_metadata` (user-writable). Step 5 R2: UsersTab i18n — 6+ hardcoded French strings wrapped in `t()` (H4).

#### Acceptance Criteria
- **AC-1:** GIVEN an admin navigates to the admin panel, WHEN the Users tab loads, THEN a table displays all users with name, email, role badge, status badge, and action buttons.
- **AC-2:** GIVEN the user table is displayed, WHEN the admin clicks "Modifier" on a user, THEN a dialog/form allows changing the user's role.
- **AC-3:** GIVEN the admin clicks "Inviter un utilisateur," WHEN the dialog opens, THEN they can enter an email and send an invitation. Focus is trapped within the dialog.
- **AC-4:** GIVEN pending profiles exist, WHEN the admin clicks the "Profils en attente" tab, THEN a table lists profiles with Approve and Reject buttons.
- **AC-5:** GIVEN a pending profile is displayed, WHEN the admin clicks "Approuver," THEN the profile becomes published and the researcher is notified.
- **AC-6:** GIVEN a pending profile is displayed, WHEN the admin clicks "Rejeter," THEN the profile is rejected and removed from the pending list.
- **AC-7 (NEW):** GIVEN the invite dialog is open, WHEN the user presses Escape, THEN the dialog closes and focus returns to the trigger button.

#### Edge Cases
- **US-4.1-E1:** GIVEN there are no pending profiles, WHEN the tab loads, THEN "Aucun profil en attente" is displayed.
- **US-4.1-E2:** GIVEN the admin tries to revoke themselves, WHEN they click "Revoquer" on their own row, THEN a warning "Vous ne pouvez pas revoquer votre propre acces" prevents the action.
- **US-4.1-E3:** GIVEN the invitation API fails, WHEN the admin sends an invite, THEN an error "Invitation echouee, verifiez l'adresse email" is shown.

---

### US-4.2 — Bulk Import [MODIFIED]
**As a** logged-in admin, **I can** import researchers in bulk via CSV/Excel or Google Scholar.

**What changed from original spec:** CSV parser now uses RFC-4180 compliant parsing that handles quoted fields and commas within values. Step 5 R2: ImportTab i18n — hardcoded strings wrapped in `t()` (H5). Import API field validation — row cap 500, name/lab length limits, keywords array cap ≤50 items, status enum whitelist (H9).

#### Acceptance Criteria
- **AC-1:** GIVEN the import tab is displayed, WHEN the admin drags a CSV/Excel file onto the upload zone, THEN the file is parsed and a preview table is populated. The parser handles quoted fields per RFC 4180.
- **AC-2:** GIVEN the import tab is displayed, WHEN the admin pastes a Google Scholar URL and clicks "Importer," THEN the profile data is fetched and shown in the preview table.
- **AC-3:** GIVEN the preview table shows data, WHEN the admin clicks "Importer N chercheurs," THEN the records are created and a success message appears.
- **AC-4:** GIVEN the import succeeds, WHEN the admin clicks "Voir les logs," THEN they navigate to the audit log tab.

#### Edge Cases
- **US-4.2-E1:** GIVEN an uploaded CSV has invalid format (wrong columns), WHEN parsed, THEN an error "Format invalide: colonnes attendues: Nom, Labo, Themes" is shown.
- **US-4.2-E2:** GIVEN the Google Scholar URL is invalid or unreachable, WHEN the admin clicks "Importer," THEN an error "URL invalide ou profil introuvable" appears.
- **US-4.2-E3:** GIVEN the CSV contains duplicate entries (same name+lab as existing), WHEN previewed, THEN duplicates are flagged with a warning badge in the preview table.

---

### US-4.3 — App Settings [UNCHANGED]
**As a** logged-in admin, **I can** configure app settings (language FR/EN, similarity thresholds, NLP algorithm).

#### Acceptance Criteria
- **AC-1:** GIVEN the settings tab loads, WHEN displayed, THEN the current language selection, similarity threshold, and NLP algorithm are pre-populated.
- **AC-2:** GIVEN the language section is displayed, WHEN the admin selects EN, THEN the radio button updates (change is not applied until Save).
- **AC-3:** GIVEN the similarity slider is displayed, WHEN the admin drags it, THEN the numeric value updates in real-time next to the slider.
- **AC-4:** GIVEN the admin clicks "Sauvegarder les parametres," WHEN the API succeeds, THEN a success toast "Parametres sauvegardes" appears.

#### Edge Cases
- **US-4.3-E1:** GIVEN the save API fails, WHEN the admin clicks save, THEN an error "Echec de la sauvegarde" appears and settings are not lost from the form.
- **US-4.3-E2:** GIVEN the admin navigates away without saving, WHEN there are unsaved changes, THEN a confirmation dialog "Modifications non sauvegardees, quitter quand meme?" appears (with focus trap).
- **US-4.3-E3:** GIVEN the similarity slider is set to 0.0, WHEN saved, THEN a warning "Un seuil de 0.0 considerera tous les chercheurs comme proches" is shown.

---

### US-4.4 — Audit Logs [UNCHANGED]
**As a** logged-in admin, **I can** view audit logs showing who modified what and when.

#### Acceptance Criteria
- **AC-1:** GIVEN the logs tab loads, WHEN log data is available, THEN a table displays entries with Date/Heure, Utilisateur, Action (color-coded tag), and Detail.
- **AC-2:** GIVEN the date filter inputs are displayed, WHEN the admin sets a date range and clicks "Filtrer," THEN only logs within that range are shown.
- **AC-3:** GIVEN log entries exist, WHEN displayed, THEN actions are color-coded: Ajout (green), Modification (blue), Suppression (red), Import (orange), Configuration (blue), Inscription (green).

#### Edge Cases
- **US-4.4-E1:** GIVEN the selected date range returns no logs, WHEN filtered, THEN "Aucun log pour cette periode" is displayed.
- **US-4.4-E2:** GIVEN thousands of log entries exist, WHEN displayed, THEN pagination limits to 50 per page with page navigation controls.
- **US-4.4-E3:** GIVEN the logs API times out, WHEN the tab loads, THEN "Chargement des logs echoue" with a retry button is shown.

---

## Accessibility Stories

### US-A11Y-001 — Keyboard Navigation [MODIFIED]
**As a** user who navigates with keyboard only, **I can** use Tab/Shift+Tab to move between all interactive elements in logical order.

**What changed:** SVG map keyboard support (R1) was added then removed by the Three.js rewrite. Standard DOM elements (filters, legend, ThemesPage cards) remain keyboard-accessible. Escape closes the map side panel.

#### Acceptance Criteria
- **AC-1:** GIVEN any screen is displayed, WHEN the user presses Tab, THEN focus moves to the next interactive element in DOM order.
- **AC-2:** GIVEN any screen is displayed, WHEN the user presses Shift+Tab, THEN focus moves to the previous interactive element.
- **AC-3:** GIVEN a focused button or link, WHEN the user presses Enter or Space, THEN the element is activated.
- **AC-4 (NOTE):** Tab navigation through Three.js map cluster nebulae and researcher particles is not implemented. Keyboard users can access the filter panel, legend, and cross-nav buttons on the map page.

---

### US-A11Y-002 — Focus Management [MODIFIED]
**As a** user relying on assistive technology, **I can** have focus managed correctly when screens change, modals open, or content loads dynamically.

**What changed:** Focus traps added to AdminPage and UsersTab modals. Map popovers auto-focus on open and restore focus on close. UserDropdown auto-focuses first menu item.

#### Acceptance Criteria
- **AC-1:** GIVEN a screen navigation occurs, WHEN the new screen renders, THEN focus is moved to the first heading or main content area of the new screen.
- **AC-2:** GIVEN a modal/popover opens, WHEN it renders, THEN focus is trapped inside it until it is closed (implemented via useFocusTrap hook for modals, and auto-focus + Tab handling for popovers/dropdown).
- **AC-3:** GIVEN a modal/popover closes, WHEN it is dismissed, THEN focus returns to the element that triggered it.

---

### US-A11Y-003 — Escape Key Dismissal [MODIFIED]
**As a** user, **I can** press Escape to close any open popover, dropdown, or modal.

**What changed:** Escape handlers added to map cluster popovers, disambiguation popovers, and modal dialogs (AdminPage, UsersTab).

#### Acceptance Criteria
- **AC-1:** GIVEN the user dropdown is open, WHEN the user presses Escape, THEN it closes and focus returns to the user area button.
- **AC-2:** GIVEN a cluster popover is open on the map, WHEN the user presses Escape, THEN it closes and focus returns to the triggering cluster element.
- **AC-3:** GIVEN a confirmation dialog is open, WHEN the user presses Escape, THEN it is dismissed (equivalent to Cancel) and focus returns to the trigger.
- **AC-4 (NEW):** GIVEN a disambiguation popover is open on the map, WHEN the user presses Escape, THEN it closes and focus returns to the dot area.

---

### US-A11Y-004 — ARIA Labels [MODIFIED]
**As a** user relying on a screen reader, **I can** understand all interactive elements through proper ARIA labels and roles.

**What changed:** Duplicate nav landmark fixed (outer nav -> header). Color contrast improved for tags, badges, muted text, and primary buttons to meet WCAG 4.5:1. Step 5 R2: fr.json "breadcrumbDashboard" corrected to "Tableau de bord" (C3); PendingTab i18n — 5 table headers + 2 toasts (H6); ProfilePage i18n — 4 hardcoded strings (H7); SettingsTab hardcoded string replaced with `t()` (M3).

#### Acceptance Criteria
- **AC-1:** GIVEN any interactive element (button, link, input), WHEN read by a screen reader, THEN it has a descriptive `aria-label` or visible label text.
- **AC-2:** GIVEN stat cards are displayed, WHEN read by a screen reader, THEN each card is read as "N Chercheurs" / "N Themes" etc. (not just the number).
- **AC-3:** GIVEN the similarity gauge displays, WHEN read by a screen reader, THEN it announces "Score de similarite: 72%."
- **AC-4:** GIVEN the SVG map is displayed, WHEN read by a screen reader, THEN it has a descriptive `aria-label` and researcher dots have `aria-label` with their name. Cluster circles have `role="button"` and `aria-label` with cluster name.
- **AC-5 (NEW):** GIVEN the navbar renders, WHEN read by a screen reader, THEN there is a single `<nav>` landmark (inside a `<header>`), not duplicate nested landmarks.
- **AC-6 (NEW):** GIVEN tag/badge elements are displayed, WHEN viewed, THEN text colors meet WCAG AA 4.5:1 contrast ratio at their used font sizes.

---

## Pre-Flight Requirements

1. **Node.js >= 18** and npm >= 9 installed
2. **Vite** dev server runs without errors
3. **Vitest** test runner configured and passes with 0 tests
4. **Playwright** installed with at least Chromium browser
5. **Git** repository initialized with `.gitignore` for `node_modules`, `dist`, `.env`
6. **Vercel CLI** installed globally or project-level
7. **Environment variables** documented in `.env.example` (API base URL, auth keys)
8. **Supabase** project created with connection string ready
9. **Design tokens** from `design-profile.json` extracted into CSS custom properties
10. **Bilingual i18n** setup with FR as default, EN as secondary
