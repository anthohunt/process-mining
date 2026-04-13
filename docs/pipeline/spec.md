# Specification — Process Mining Research Cartography

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
- **Interactive Map** — SVG cluster map with zoom/pan, floating filter panel, color legend, researcher dots
- **Explore Themes** — Grid of expandable cluster cards with member lists and cross-links

### Section 4: Administration (4 screens, admin-only)
- **User Management** — Table with roles/badges, invite button, modify/revoke actions
- **Bulk Import** — Drag-and-drop CSV/Excel zone + Google Scholar URL input + data preview table + confirm button
- **Settings** — Language radio (FR/EN), similarity threshold slider (0.0-1.0), NLP algorithm dropdown (TF-IDF/Word2Vec/BERT) + save button
- **Audit Logs** — Table (date, user, action, detail) with date range filters, color-coded action tags

### Authentication
- **Login Screen** — Centered card with email/password fields, demo login buttons (researcher/admin)
- **Navbar** — Brand, nav tabs, login button (transforms to user avatar+dropdown after login), language toggle, admin tab (admin-only)

---

## User Stories

### US-1.1 — Dashboard Stats Display
**As a** researcher, **I can** see global stats (researcher count, theme count, cluster count, publications) on the main dashboard.

**Mockup reference:** `screen-dashboard` — 4 stat cards in `stat-grid`.

#### Acceptance Criteria
- **AC-1:** GIVEN the dashboard loads, WHEN the API returns stats, THEN 4 cards display: Chercheurs, Themes, Clusters, Publications with current counts.
- **AC-2:** GIVEN the dashboard is visible, WHEN data changes on the server, THEN the stat numbers update without a full page reload.
- **AC-3:** GIVEN a stat card is displayed, WHEN the user clicks it, THEN they navigate to the corresponding section (Chercheurs, Themes, Carte, Publications).

#### Edge Cases
- **US-1.1-E1:** GIVEN the API is unreachable, WHEN the dashboard loads, THEN stat cards show a loading skeleton and a retry button appears.
- **US-1.1-E2:** GIVEN the database is empty, WHEN the dashboard loads, THEN all stat cards display "0" with a message "Aucune donnee disponible."
- **US-1.1-E3:** GIVEN one stat exceeds 99,999, WHEN displayed, THEN the number is formatted with thousands separators (e.g., "100 000").

#### Completeness Pairs
- **Show stats / Hide stats:** Stats are shown on dashboard; if fetching fails, an error state replaces stats.

---

### US-1.2 — Recent Activity Feed
**As a** researcher, **I can** see recent activity (new profiles, latest publications) to stay informed.

**Mockup reference:** `screen-dashboard` — `recent-activity` card with `activity-item` rows.

#### Acceptance Criteria
- **AC-1:** GIVEN the dashboard loads, WHEN activity data is fetched, THEN the 5 most recent activities display with avatar, name, action description, and relative timestamp.
- **AC-2:** GIVEN activities exist, WHEN displayed, THEN they are sorted by date descending (newest first).
- **AC-3:** GIVEN an activity displays a researcher name, WHEN the user clicks on it, THEN they navigate to that researcher's profile.

#### Edge Cases
- **US-1.2-E1:** GIVEN no activities exist, WHEN the dashboard loads, THEN the activity section shows "Aucune activite recente" with an empty-state illustration.
- **US-1.2-E2:** GIVEN the activity API fails, WHEN the dashboard loads, THEN the activity section shows an error message with a retry link.
- **US-1.2-E3:** GIVEN an activity references a deleted researcher, WHEN displayed, THEN the name is shown in gray (non-clickable) with "(profil supprime)".

#### Completeness Pairs
- **Show activity / Hide activity:** Activity feed shows items; empty state shown when no data.

---

### US-1.3 — Mini-Map Preview
**As a** researcher, **I can** click the mini-map on the dashboard to navigate to the full thematic map.

**Mockup reference:** `screen-dashboard` — `mini-map-container` with SVG preview and overlay text.

#### Acceptance Criteria
- **AC-1:** GIVEN the dashboard loads, WHEN cluster data is available, THEN a simplified SVG preview of the cluster map renders in the mini-map area.
- **AC-2:** GIVEN the mini-map is displayed, WHEN the user hovers over it, THEN a pointer cursor appears and the container gets a blue outline highlight.
- **AC-3:** GIVEN the mini-map is displayed, WHEN the user clicks it, THEN they navigate to the full `screen-map` view.

#### Edge Cases
- **US-1.3-E1:** GIVEN no clusters exist, WHEN the dashboard loads, THEN the mini-map shows a placeholder with "Carte non disponible" text.
- **US-1.3-E2:** GIVEN the cluster API is slow (>3s), WHEN the dashboard loads, THEN the mini-map shows a loading spinner until data arrives.
- **US-1.3-E3:** GIVEN the SVG rendering fails, WHEN an error is caught, THEN a static fallback image is shown with "Cliquer pour voir la carte."

#### Completeness Pairs
- **Show mini-map / Hide mini-map:** Mini-map renders when clusters exist; placeholder when they do not.

---

### US-1.4 — Detailed Statistics
**As a** researcher, **I can** view detailed statistics (theme distribution, similarity metrics, temporal trends).

**Mockup reference:** `screen-stats` — bar chart (`bar-chart-svg`), line chart (`line-chart-svg`), histogram (`histogram-svg`).

#### Acceptance Criteria
- **AC-1:** GIVEN the stats screen loads, WHEN theme data is available, THEN a bar chart displays the distribution of themes (theme name vs. researcher count).
- **AC-2:** GIVEN the stats screen loads, WHEN temporal data is available, THEN a line chart displays publication/membership trends over time.
- **AC-3:** GIVEN the stats screen loads, WHEN similarity data is available, THEN a histogram displays the distribution of pairwise similarity scores.
- **AC-4:** GIVEN any chart is displayed, WHEN the user hovers over a data point, THEN a tooltip shows the exact value.

#### Edge Cases
- **US-1.4-E1:** GIVEN no researchers exist, WHEN the stats screen loads, THEN all charts show empty states with "Pas assez de donnees pour generer ce graphique."
- **US-1.4-E2:** GIVEN only 1 researcher exists, WHEN the similarity histogram is requested, THEN it shows "Au moins 2 chercheurs requis pour calculer la similarite."
- **US-1.4-E3:** GIVEN the stats API returns malformed data, WHEN the screen loads, THEN charts show an error state with "Erreur de chargement" and a retry link.

#### Completeness Pairs
- **Show charts / Show empty state:** Charts render with data; empty/error states shown otherwise.

---

### US-2.1 — Researcher Search & Filter
**As a** researcher, **I can** search and filter the researcher list by lab, theme, or keyword.

**Mockup reference:** `screen-researchers` — `search-bar` with text input, lab dropdown (`filter-lab`), theme dropdown (`filter-theme`), `researcher-table`.

#### Acceptance Criteria
- **AC-1:** GIVEN the researcher list loads, WHEN the user types in the search field, THEN the table filters in real-time to show matching researchers by name or keyword.
- **AC-2:** GIVEN the researcher list is displayed, WHEN the user selects a lab from the dropdown, THEN only researchers from that lab are shown.
- **AC-3:** GIVEN the researcher list is displayed, WHEN the user selects a theme from the dropdown, THEN only researchers with that theme are shown.
- **AC-4:** GIVEN both filters are active, WHEN combined, THEN they apply with AND logic (both conditions must be true).

#### Edge Cases
- **US-2.1-E1:** GIVEN the user types a query matching no researchers, WHEN the table filters, THEN a "Aucun resultat" message is shown with suggestion to adjust filters.
- **US-2.1-E2:** GIVEN the researcher API fails, WHEN the list loads, THEN an error message replaces the table with a retry button.
- **US-2.1-E3:** GIVEN a search query contains special characters (<, >, &), WHEN entered, THEN they are sanitized and do not break the display or cause XSS.

#### Completeness Pairs
- **Apply filter / Clear filter:** Dropdowns filter the list; selecting "Tous les labos" / "Tous les themes" resets.
- **Show results / Show empty results:** Table shows matches; empty state when no results.

---

### US-2.2 — Researcher Profile View
**As a** researcher, **I can** view a full profile (info, themes, publications, map position).

**Mockup reference:** `screen-profile` — `profile-layout` with sidebar (avatar, name, lab, bio) + keywords card + publications card + "Voir sur la carte" button + Compare/Edit buttons.

#### Acceptance Criteria
- **AC-1:** GIVEN a researcher is selected, WHEN their profile loads, THEN the sidebar displays avatar (initials), full name, lab, and bio text.
- **AC-2:** GIVEN the profile loads, WHEN keywords exist, THEN they display as colored tags in the keywords card.
- **AC-3:** GIVEN the profile loads, WHEN publications exist, THEN they display as a list with title, co-authors, and venue/year.
- **AC-4:** GIVEN the profile has map data, WHEN the user clicks "Voir sur la carte," THEN they navigate to the map centered on that researcher.

#### Edge Cases
- **US-2.2-E1:** GIVEN a researcher has no publications, WHEN the profile loads, THEN the publications section shows "Aucune publication enregistree."
- **US-2.2-E2:** GIVEN the profile API returns 404, WHEN navigating to a profile, THEN a "Profil introuvable" message is shown with a link back to the list.
- **US-2.2-E3:** GIVEN a researcher has a very long bio (>2000 chars), WHEN displayed, THEN it is truncated with a "Lire la suite" expand toggle.

#### Completeness Pairs
- **Open profile / Close profile (back to list):** Navigate to profile; breadcrumb returns to list.
- **Show edit button / Hide edit button:** Shown when logged-in as owner; hidden or locked otherwise.

---

### US-2.3 — Add/Edit Profile Form
**As a** logged-in researcher, **I can** add or edit my own profile via a structured form, pending admin approval.

**Mockup reference:** `screen-add-researcher` — form with name, lab select, keywords tag input, bio textarea, repeatable publication blocks, approval banner, Save/Cancel buttons.

#### Acceptance Criteria
- **AC-1:** GIVEN a logged-in researcher navigates to the form, WHEN it loads, THEN fields are pre-populated with existing data (for edit) or empty (for add).
- **AC-2:** GIVEN the form is displayed, WHEN the user types a keyword and presses Enter, THEN a new tag is added to the keyword input.
- **AC-3:** GIVEN the form is displayed, WHEN the user clicks "+ Ajouter une publication," THEN a new blank publication block (title, co-authors, venue) appears.
- **AC-4:** GIVEN the user fills the form, WHEN they click "Enregistrer," THEN the profile is submitted for admin approval and a success toast appears.
- **AC-5:** GIVEN the form is displayed, WHEN the user clicks "Annuler," THEN they return to the researcher list without saving.
- **AC-6:** GIVEN the form loads, WHEN displayed, THEN a yellow approval banner reads "Votre profil sera soumis a validation par un administrateur avant d'etre publie."

#### Edge Cases
- **US-2.3-E1:** GIVEN required fields are empty, WHEN the user clicks "Enregistrer," THEN validation errors highlight the missing fields and submission is blocked.
- **US-2.3-E2:** GIVEN the save API fails (500), WHEN the user submits, THEN an error toast "Erreur de sauvegarde, veuillez reessayer" appears and the form data is preserved.
- **US-2.3-E3:** GIVEN the user adds a duplicate keyword, WHEN they press Enter, THEN the duplicate is rejected with a brief "Mot-cle deja present" note.

#### Completeness Pairs
- **Add publication block / Remove publication block:** "+ Ajouter" adds; each block has a remove (x) button.
- **Add keyword tag / Remove keyword tag:** Enter adds; clicking x on a tag removes it.
- **Save form / Cancel form:** Save submits; Cancel discards and navigates away.

---

### US-2.4 — Side-by-Side Comparison
**As a** researcher, **I can** compare two researchers side-by-side with common themes and similarity score.

**Mockup reference:** `screen-comparison` — `comparison-layout` (3-column grid: profile | gauge | profile), `common-themes` card.

#### Acceptance Criteria
- **AC-1:** GIVEN the comparison screen loads, WHEN two researchers are selected, THEN their profiles display in two columns with a similarity gauge in the center.
- **AC-2:** GIVEN the comparison displays, WHEN common themes exist, THEN they are visually highlighted with a blue outline on both sides.
- **AC-3:** GIVEN the comparison displays, WHEN the similarity score is computed, THEN it shows as a percentage inside a circular gauge.
- **AC-4:** GIVEN the comparison displays, WHEN common themes exist, THEN a summary card at the bottom lists shared themes with a textual explanation.

#### Edge Cases
- **US-2.4-E1:** GIVEN two researchers share zero themes, WHEN compared, THEN the gauge shows "0%" and the common themes section reads "Aucun theme commun."
- **US-2.4-E2:** GIVEN the similarity API fails, WHEN the comparison loads, THEN a fallback message "Score de similarite indisponible" replaces the gauge.
- **US-2.4-E3:** GIVEN the user selects the same researcher twice, WHEN comparison loads, THEN a message "Veuillez selectionner deux chercheurs differents" is shown.

#### Completeness Pairs
- **Open comparison / Close comparison (back):** Navigate to comparison; breadcrumb returns to list.

---

### US-2.5 — Profile to Map Navigation
**As a** researcher, **I can** navigate from a profile to that person's position on the thematic map.

**Mockup reference:** `screen-profile` — "Voir sur la carte" button (`profile-map-link`).

#### Acceptance Criteria
- **AC-1:** GIVEN a profile is displayed, WHEN the user clicks "Voir sur la carte," THEN the map screen opens.
- **AC-2:** GIVEN the map opens from a profile, WHEN it renders, THEN the view is centered on the selected researcher's dot.
- **AC-3:** GIVEN the map centers on a researcher, WHEN it renders, THEN that researcher's dot pulses or is visually highlighted.

#### Edge Cases
- **US-2.5-E1:** GIVEN a researcher has no map coordinates (new, unprocessed), WHEN "Voir sur la carte" is clicked, THEN a toast "Ce chercheur n'a pas encore de position sur la carte" appears and the button is disabled.
- **US-2.5-E2:** GIVEN the map data API fails, WHEN navigating, THEN the map shows an error overlay with a retry button.
- **US-2.5-E3:** GIVEN the researcher belongs to a cluster that was recently reorganized, WHEN navigating, THEN the map still centers correctly using the latest coordinates.

#### Completeness Pairs
- **Navigate to map / Navigate back to profile:** "Voir sur la carte" goes to map; breadcrumb or back button returns.

---

### US-3.1 — Interactive Cluster Map
**As a** researcher, **I can** view the interactive cluster map with zoom, pan, and filter controls.

**Mockup reference:** `screen-map` — `map-container` with SVG, `map-filter-panel` (theme + lab dropdowns + apply button), `map-legend`.

#### Acceptance Criteria
- **AC-1:** GIVEN the map screen loads, WHEN cluster data is available, THEN an SVG renders colored cluster regions and researcher dots.
- **AC-2:** GIVEN the map is displayed, WHEN the user scrolls or pinches, THEN the map zooms in/out.
- **AC-3:** GIVEN the map is displayed, WHEN the user clicks and drags, THEN the map pans.
- **AC-4:** GIVEN the filter panel is displayed, WHEN the user selects a theme or lab and clicks "Appliquer," THEN only matching clusters/researchers are shown.
- **AC-5:** GIVEN the map is displayed, WHEN the legend is visible, THEN each cluster color is labeled with its theme name.

#### Edge Cases
- **US-3.1-E1:** GIVEN no clusters exist, WHEN the map loads, THEN an empty state "Aucun cluster disponible" is shown centered in the map area.
- **US-3.1-E2:** GIVEN the user zooms to maximum level, WHEN they attempt to zoom further, THEN zoom is capped and the view does not change.
- **US-3.1-E3:** GIVEN the cluster data API times out, WHEN the map loads, THEN a centered error "Chargement echoue" with retry button appears over the dark background.

#### Completeness Pairs
- **Apply filter / Reset filter:** Apply narrows view; selecting "Tous" resets.
- **Zoom in / Zoom out:** Both directions supported, capped at min/max levels.

---

### US-3.2 — Cluster Click for Members
**As a** researcher, **I can** click a cluster on the map to see its member researchers and themes.

**Mockup reference:** `screen-map` — clicking a cluster region shows a tooltip/popover with member list.

#### Acceptance Criteria
- **AC-1:** GIVEN the map is displayed, WHEN the user clicks a cluster region, THEN a popover/tooltip appears listing the cluster's member researchers.
- **AC-2:** GIVEN the popover is displayed, WHEN themes are associated, THEN they are shown as tags in the popover.
- **AC-3:** GIVEN the popover lists researchers, WHEN the user clicks a name, THEN they navigate to that researcher's profile.

#### Edge Cases
- **US-3.2-E1:** GIVEN a cluster has 50+ members, WHEN the popover opens, THEN it shows the first 10 with a "et N autres" link that scrolls or expands.
- **US-3.2-E2:** GIVEN the user clicks outside the popover, WHEN it is open, THEN it closes.
- **US-3.2-E3:** GIVEN the cluster data is loading, WHEN the user clicks, THEN a loading spinner appears inside the popover.

#### Completeness Pairs
- **Open popover / Close popover:** Click opens; click outside or on X closes.

---

### US-3.3 — Researcher Dot to Profile
**As a** researcher, **I can** click a researcher dot on the map to navigate to their profile.

**Mockup reference:** `screen-map` — researcher dots (SVG circles) on the map, name on hover, click navigates.

#### Acceptance Criteria
- **AC-1:** GIVEN the map is displayed, WHEN the user hovers over a researcher dot, THEN the researcher's name appears as a tooltip.
- **AC-2:** GIVEN the map is displayed, WHEN the user clicks a researcher dot, THEN they navigate to that researcher's profile page.
- **AC-3:** GIVEN the dots are displayed, WHEN hovered, THEN the cursor changes to pointer.

#### Edge Cases
- **US-3.3-E1:** GIVEN two dots overlap (same position), WHEN the user clicks, THEN a disambiguation popover lists both names so the user can choose.
- **US-3.3-E2:** GIVEN the profile data for a dot fails to load, WHEN clicked, THEN a toast "Profil indisponible" appears.
- **US-3.3-E3:** GIVEN the map is zoomed out fully, WHEN dots are very small, THEN they maintain a minimum clickable size (24x24px touch target).

#### Completeness Pairs
- **Show tooltip / Hide tooltip:** Hover shows name; mouse-out hides it.

---

### US-3.4 — Theme List View
**As a** researcher, **I can** browse themes in a list view showing clusters, researcher counts, and cross-links.

**Mockup reference:** `screen-themes` — `theme-clusters` grid of `cluster-card` elements, expandable on click.

#### Acceptance Criteria
- **AC-1:** GIVEN the themes screen loads, WHEN cluster data is available, THEN a grid of cluster cards displays, each with name, researcher count, and sub-theme tags.
- **AC-2:** GIVEN a cluster card is displayed, WHEN the user clicks it, THEN it expands to show member researcher names as links.
- **AC-3:** GIVEN an expanded card lists researchers, WHEN the user clicks a name, THEN they navigate to that researcher's profile.
- **AC-4:** GIVEN the themes screen is displayed, WHEN the "Voir sur la carte" cross-nav button is clicked, THEN they navigate to the map screen.

#### Edge Cases
- **US-3.4-E1:** GIVEN no themes exist, WHEN the screen loads, THEN a centered empty state "Aucun theme disponible" is displayed.
- **US-3.4-E2:** GIVEN a cluster has 0 researchers (possible after deletion), WHEN displayed, THEN the card shows "0 chercheurs" and has no expandable member list.
- **US-3.4-E3:** GIVEN the themes API returns malformed JSON, WHEN the screen loads, THEN an error message "Erreur de chargement des themes" with retry is shown.

#### Completeness Pairs
- **Expand card / Collapse card:** Click expands; click again collapses.

---

### US-5.1 — User Login
**As a** user, **I can** log in to access personal features (profile editing for researchers, admin panel for admins).

**Mockup reference:** `screen-login` — `login-card` with email/password, demo buttons; navbar transforms on login (avatar + dropdown).

#### Acceptance Criteria
- **AC-1:** GIVEN the login screen is displayed, WHEN the user enters valid email/password and clicks "Se connecter," THEN they are authenticated and redirected to the dashboard.
- **AC-2:** GIVEN the user is logged in, WHEN the navbar renders, THEN the "Connexion" button is replaced by their avatar (initials) and name, with a dropdown menu.
- **AC-3:** GIVEN the user is logged in as admin, WHEN the navbar renders, THEN an "Admin" tab appears and an "Admin" badge is shown next to the name.
- **AC-4:** GIVEN the user dropdown is visible, WHEN they click "Mon profil," THEN they navigate to their own profile.
- **AC-5:** GIVEN the user dropdown is visible, WHEN they click "Deconnexion," THEN they are logged out and the navbar reverts to showing the "Connexion" button.

#### Edge Cases
- **US-5.1-E1:** GIVEN invalid credentials are entered, WHEN the user clicks "Se connecter," THEN an error "Email ou mot de passe incorrect" appears below the form.
- **US-5.1-E2:** GIVEN the auth API is unreachable, WHEN the user submits login, THEN an error "Service indisponible, reessayez plus tard" is shown.
- **US-5.1-E3:** GIVEN the user's session token expires, WHEN they perform an action, THEN they are redirected to the login screen with a message "Session expiree, veuillez vous reconnecter."

#### Completeness Pairs
- **Login / Logout:** Login authenticates and shows user area; logout reverts to anonymous state.
- **Show admin tab / Hide admin tab:** Admin tab shown for admin role; hidden for researcher role and anonymous.
- **Open dropdown / Close dropdown:** Click on user area opens; click outside closes.

---

### US-5.2 — Profile Submission with Admin Approval
**As a** logged-in researcher, **I can** submit my profile which will be validated by an administrator before publication.

**Mockup reference:** `screen-profile` — edit button states (own profile active, other's locked, logged-out hidden); `screen-add-researcher` — approval banner.

#### Acceptance Criteria
- **AC-1:** GIVEN a logged-in researcher views their own profile, WHEN the "Modifier" button is displayed, THEN it is enabled and clickable.
- **AC-2:** GIVEN a logged-in researcher views another's profile, WHEN the "Modifier" button is displayed, THEN it is disabled with a lock icon and a note "Vous ne pouvez modifier que votre propre profil."
- **AC-3:** GIVEN a user is not logged in, WHEN they view a profile, THEN the "Modifier" button is hidden entirely.
- **AC-4:** GIVEN a researcher submits their profile, WHEN the submission succeeds, THEN it appears in the admin "Profils en attente" list.

#### Edge Cases
- **US-5.2-E1:** GIVEN a researcher submits while their previous submission is still pending, WHEN they try to submit again, THEN a warning "Vous avez deja une soumission en attente" is shown.
- **US-5.2-E2:** GIVEN the submission API fails, WHEN the researcher clicks save, THEN an error appears and the form data is not lost.
- **US-5.2-E3:** GIVEN an admin rejects a profile, WHEN the researcher logs in, THEN they see a notification "Votre profil a ete rejete" with the admin's reason.

#### Completeness Pairs
- **Enable edit button / Disable edit button:** Enabled for own profile; disabled for others'.
- **Show edit button / Hide edit button:** Shown when logged in; hidden when not.
- **Submit profile / Withdraw submission:** Submit sends to pending; (future) withdraw cancels pending.

---

### US-4.1 — User Management
**As a** logged-in admin, **I can** manage users (assign roles, send invitations, approve pending profiles).

**Mockup reference:** `screen-admin` — `admin-tab-admin-users` (user table) + `admin-tab-admin-pending` (pending profiles with Approve/Reject buttons); `invite-btn-admin`.

#### Acceptance Criteria
- **AC-1:** GIVEN an admin navigates to the admin panel, WHEN the Users tab loads, THEN a table displays all users with name, email, role badge, status badge, and action buttons.
- **AC-2:** GIVEN the user table is displayed, WHEN the admin clicks "Modifier" on a user, THEN a dialog/form allows changing the user's role.
- **AC-3:** GIVEN the admin clicks "Inviter un utilisateur," WHEN the dialog opens, THEN they can enter an email and send an invitation.
- **AC-4:** GIVEN pending profiles exist, WHEN the admin clicks the "Profils en attente" tab, THEN a table lists profiles with Approve and Reject buttons.
- **AC-5:** GIVEN a pending profile is displayed, WHEN the admin clicks "Approuver," THEN the profile becomes published and the researcher is notified.
- **AC-6:** GIVEN a pending profile is displayed, WHEN the admin clicks "Rejeter," THEN the profile is rejected and removed from the pending list.

#### Edge Cases
- **US-4.1-E1:** GIVEN there are no pending profiles, WHEN the tab loads, THEN "Aucun profil en attente" is displayed.
- **US-4.1-E2:** GIVEN the admin tries to revoke themselves, WHEN they click "Revoquer" on their own row, THEN a warning "Vous ne pouvez pas revoquer votre propre acces" prevents the action.
- **US-4.1-E3:** GIVEN the invitation API fails, WHEN the admin sends an invite, THEN an error "Invitation echouee, verifiez l'adresse email" is shown.

#### Completeness Pairs
- **Approve profile / Reject profile:** Both actions available on each pending row.
- **Add user (invite) / Remove user (revoke):** Invite adds; revoke removes access.
- **Assign role admin / Assign role researcher:** Role can be changed in both directions.

---

### US-4.2 — Bulk Import
**As a** logged-in admin, **I can** import researchers in bulk via CSV/Excel or Google Scholar.

**Mockup reference:** `screen-admin` — `admin-tab-admin-import` with `upload-zone`, Google Scholar URL input, preview table, confirm button.

#### Acceptance Criteria
- **AC-1:** GIVEN the import tab is displayed, WHEN the admin drags a CSV/Excel file onto the upload zone, THEN the file is parsed and a preview table is populated.
- **AC-2:** GIVEN the import tab is displayed, WHEN the admin pastes a Google Scholar URL and clicks "Importer," THEN the profile data is fetched and shown in the preview table.
- **AC-3:** GIVEN the preview table shows data, WHEN the admin clicks "Importer N chercheurs," THEN the records are created and a success message appears.
- **AC-4:** GIVEN the import succeeds, WHEN the admin clicks "Voir les logs," THEN they navigate to the audit log tab.

#### Edge Cases
- **US-4.2-E1:** GIVEN an uploaded CSV has invalid format (wrong columns), WHEN parsed, THEN an error "Format invalide: colonnes attendues: Nom, Labo, Themes" is shown.
- **US-4.2-E2:** GIVEN the Google Scholar URL is invalid or unreachable, WHEN the admin clicks "Importer," THEN an error "URL invalide ou profil introuvable" appears.
- **US-4.2-E3:** GIVEN the CSV contains duplicate entries (same name+lab as existing), WHEN previewed, THEN duplicates are flagged with a warning badge in the preview table.

#### Completeness Pairs
- **Upload file / Clear file:** Drag uploads; a clear/reset button removes the preview.
- **Import confirmed / Import cancelled:** Confirm creates records; cancel clears the preview.

---

### US-4.3 — App Settings
**As a** logged-in admin, **I can** configure app settings (language FR/EN, similarity thresholds, NLP algorithm).

**Mockup reference:** `screen-admin` — `admin-tab-admin-settings` with radio buttons, slider, dropdown, save button.

#### Acceptance Criteria
- **AC-1:** GIVEN the settings tab loads, WHEN displayed, THEN the current language selection, similarity threshold, and NLP algorithm are pre-populated.
- **AC-2:** GIVEN the language section is displayed, WHEN the admin selects EN, THEN the radio button updates (change is not applied until Save).
- **AC-3:** GIVEN the similarity slider is displayed, WHEN the admin drags it, THEN the numeric value updates in real-time next to the slider.
- **AC-4:** GIVEN the admin clicks "Sauvegarder les parametres," WHEN the API succeeds, THEN a success toast "Parametres sauvegardes" appears.

#### Edge Cases
- **US-4.3-E1:** GIVEN the save API fails, WHEN the admin clicks save, THEN an error "Echec de la sauvegarde" appears and settings are not lost from the form.
- **US-4.3-E2:** GIVEN the admin navigates away without saving, WHEN there are unsaved changes, THEN a confirmation dialog "Modifications non sauvegardees, quitter quand meme?" appears.
- **US-4.3-E3:** GIVEN the similarity slider is set to 0.0, WHEN saved, THEN a warning "Un seuil de 0.0 considerera tous les chercheurs comme proches" is shown.

#### Completeness Pairs
- **Save settings / Discard settings:** Save persists; navigating away discards (with confirmation).

---

### US-4.4 — Audit Logs
**As a** logged-in admin, **I can** view audit logs showing who modified what and when.

**Mockup reference:** `screen-admin` — `admin-tab-admin-logs` with date filters, `app-table` with date/user/action/detail rows, color-coded action tags.

#### Acceptance Criteria
- **AC-1:** GIVEN the logs tab loads, WHEN log data is available, THEN a table displays entries with Date/Heure, Utilisateur, Action (color-coded tag), and Detail.
- **AC-2:** GIVEN the date filter inputs are displayed, WHEN the admin sets a date range and clicks "Filtrer," THEN only logs within that range are shown.
- **AC-3:** GIVEN log entries exist, WHEN displayed, THEN actions are color-coded: Ajout (green), Modification (blue), Suppression (red), Import (orange), Configuration (blue), Inscription (green).

#### Edge Cases
- **US-4.4-E1:** GIVEN the selected date range returns no logs, WHEN filtered, THEN "Aucun log pour cette periode" is displayed.
- **US-4.4-E2:** GIVEN thousands of log entries exist, WHEN displayed, THEN pagination limits to 50 per page with page navigation controls.
- **US-4.4-E3:** GIVEN the logs API times out, WHEN the tab loads, THEN "Chargement des logs echoue" with a retry button is shown.

#### Completeness Pairs
- **Apply date filter / Clear date filter:** Filter narrows; clearing shows all logs.

---

## Accessibility Stories

### US-A11Y-001 — Keyboard Navigation
**As a** user who navigates with keyboard only, **I can** use Tab/Shift+Tab to move between all interactive elements in logical order.

#### Acceptance Criteria
- **AC-1:** GIVEN any screen is displayed, WHEN the user presses Tab, THEN focus moves to the next interactive element in DOM order.
- **AC-2:** GIVEN any screen is displayed, WHEN the user presses Shift+Tab, THEN focus moves to the previous interactive element.
- **AC-3:** GIVEN a focused button or link, WHEN the user presses Enter or Space, THEN the element is activated.

---

### US-A11Y-002 — Focus Management
**As a** user relying on assistive technology, **I can** have focus managed correctly when screens change, modals open, or content loads dynamically.

#### Acceptance Criteria
- **AC-1:** GIVEN a screen navigation occurs, WHEN the new screen renders, THEN focus is moved to the first heading or main content area of the new screen.
- **AC-2:** GIVEN a modal/popover opens, WHEN it renders, THEN focus is trapped inside it until it is closed.
- **AC-3:** GIVEN a modal/popover closes, WHEN it is dismissed, THEN focus returns to the element that triggered it.

---

### US-A11Y-003 — Escape Key Dismissal
**As a** user, **I can** press Escape to close any open popover, dropdown, or modal.

#### Acceptance Criteria
- **AC-1:** GIVEN the user dropdown is open, WHEN the user presses Escape, THEN it closes and focus returns to the user area button.
- **AC-2:** GIVEN a cluster popover is open on the map, WHEN the user presses Escape, THEN it closes.
- **AC-3:** GIVEN a confirmation dialog is open, WHEN the user presses Escape, THEN it is dismissed (equivalent to Cancel).

---

### US-A11Y-004 — ARIA Labels
**As a** user relying on a screen reader, **I can** understand all interactive elements through proper ARIA labels and roles.

#### Acceptance Criteria
- **AC-1:** GIVEN any interactive element (button, link, input), WHEN read by a screen reader, THEN it has a descriptive `aria-label` or visible label text.
- **AC-2:** GIVEN stat cards are displayed, WHEN read by a screen reader, THEN each card is read as "N Chercheurs" / "N Themes" etc. (not just the number).
- **AC-3:** GIVEN the similarity gauge displays, WHEN read by a screen reader, THEN it announces "Score de similarite: 72%."
- **AC-4:** GIVEN the SVG map is displayed, WHEN read by a screen reader, THEN it has a descriptive `aria-label` such as "Carte thematique des clusters de recherche" and researcher dots have `aria-label` with their name.

---

## Pre-Flight Requirements

1. **Node.js >= 18** and npm >= 9 installed
2. **Vite** dev server runs without errors
3. **Vitest** test runner configured and passes with 0 tests
4. **Playwright** installed with at least Chromium browser
5. **Git** repository initialized with `.gitignore` for `node_modules`, `dist`, `.env`
6. **Vercel CLI** installed globally or project-level
7. **Environment variables** documented in `.env.example` (API base URL, auth keys)
8. **Supabase** project created (or equivalent backend) with connection string ready
9. **Design tokens** from `design-profile.json` extracted into CSS custom properties
10. **Bilingual i18n** setup with FR as default, EN as secondary
