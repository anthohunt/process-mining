# M5 Exploration Plan — Administration

## US-4.1: User Management

### Happy Path
**Mockup reference:** `screen-admin` — `admin-tab-admin-users` (user table), `admin-tab-admin-pending` (pending profiles), `invite-btn-admin`.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Log in as admin | Authenticated as admin, "Admin" tab visible | `US-4.1-01-admin-logged-in.png` |
| 2 | Click "Admin" tab in navbar | Admin panel loads with sub-nav tabs | `US-4.1-02-admin-panel.png` |
| 3 | Observe the "Utilisateurs" tab (active by default) | User table shows name, email, role badge, status badge, action buttons | `US-4.1-03-user-table.png` |
| 4 | Click "Modifier" on Prof. Ahmed Benali's row | Role edit dialog/dropdown appears | `US-4.1-04-edit-role.png` |
| 5 | Change role from "Chercheur" to "Admin" and confirm | Role badge updates to "Admin" | `US-4.1-05-role-changed.png` |
| 6 | Click "Inviter un utilisateur" button | Invitation dialog/form opens with email field | `US-4.1-06-invite-dialog.png` |
| 7 | Enter email and submit invitation | Success message, invitation sent | `US-4.1-07-invite-sent.png` |
| 8 | Click "Profils en attente" tab | Pending profiles table loads | `US-4.1-08-pending-tab.png` |
| 9 | Observe pending profiles | Table shows name, lab, themes, submission date, Approve/Reject buttons | `US-4.1-09-pending-table.png` |
| 10 | Click "Approuver" on Dr. Emile Rousseau | Profile approved, removed from pending list | `US-4.1-10-approved.png` |
| 11 | Click "Rejeter" on Dr. Nadia Hamidi | Profile rejected, removed from pending list | `US-4.1-11-rejected.png` |

### Focus Trap on Invite Dialog (Step 5 Hardening)

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Click "Inviter un utilisateur" to open dialog | Dialog opens | `US-4.1-FT-01-dialog-open.png` |
| 2 | Observe focus | Focus has moved to first input inside dialog | `US-4.1-FT-02-focus-first.png` |
| 3 | Press Tab repeatedly | Focus cycles within dialog (does not escape to background) | `US-4.1-FT-03-tab-trap.png` |
| 4 | Press Escape | Dialog closes, focus returns to invite button | `US-4.1-FT-04-escape-close.png` |

### Edge Case E1: No Pending Profiles
**Mockup reference:** `screen-admin` — `admin-tab-admin-pending` empty.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept pending profiles API returning empty array | No pending | `US-4.1-E1-01-intercept.png` |
| 2 | Navigate to "Profils en attente" tab | Tab loads | `US-4.1-E1-02-pending-tab.png` |
| 3 | Observe | "Aucun profil en attente" message displayed | `US-4.1-E1-03-empty.png` |

### Edge Case E2: Self-Revocation Prevention
**Mockup reference:** `screen-admin` — user table.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Log in as admin (Admin user) | Authenticated | `US-4.1-E2-01-logged-in.png` |
| 2 | Navigate to admin user table | Table loads with own row | `US-4.1-E2-02-user-table.png` |
| 3 | Attempt to click "Revoquer" on own row (if visible) or check it is disabled | Action is prevented | `US-4.1-E2-03-self-revoke-blocked.png` |
| 4 | Observe | Warning "Vous ne pouvez pas revoquer votre propre acces" | `US-4.1-E2-04-warning.png` |

### Edge Case E3: Invitation API Failure
**Mockup reference:** `screen-admin` — invite error.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept invitation API with `page.route('**/api/admin/invitations', r => r.fulfill({ status: 500 }))` | Server error | `US-4.1-E3-01-intercept.png` |
| 2 | Click "Inviter un utilisateur" and submit with an email | Invite fails | `US-4.1-E3-02-submit.png` |
| 3 | Observe | Error "Invitation echouee, verifiez l'adresse email" | `US-4.1-E3-03-error.png` |

---

## US-4.2: Bulk Import

### Happy Path
**Mockup reference:** `screen-admin` — `admin-tab-admin-import` with upload zone, Scholar input, preview table.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to the "Import" tab in admin panel | Import screen loads with upload zone and Scholar URL input | `US-4.2-01-import-tab.png` |
| 2 | Upload a CSV file via the drop zone (simulate via file input) | File is parsed client-side | `US-4.2-02-file-uploaded.png` |
| 3 | Observe the preview table | Parsed data shows in preview: Nom, Labo, Themes columns | `US-4.2-03-preview-table.png` |
| 4 | Click "Importer 3 chercheurs" button | Import confirmed, success message | `US-4.2-04-import-confirmed.png` |
| 5 | Click "Voir les logs" link | Navigates to the Logs tab showing the import entry | `US-4.2-05-logs-link.png` |

### Happy Path (Google Scholar)
**Mockup reference:** `screen-admin` — Scholar URL input.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to Import tab | Tab loads | `US-4.2-06-import-tab.png` |
| 2 | Paste a Google Scholar URL and click "Importer" | Scholar data fetched via edge function | `US-4.2-07-scholar-import.png` |
| 3 | Observe preview table | Fetched profile data displayed in preview | `US-4.2-08-scholar-preview.png` |

### Edge Case E1: Invalid CSV Format
**Mockup reference:** `screen-admin` — import error.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Upload a CSV with wrong column headers | Client-side parse | `US-4.2-E1-01-upload-bad-csv.png` |
| 2 | Observe | Error "Format invalide: colonnes attendues: Nom, Labo, Themes" | `US-4.2-E1-02-format-error.png` |

### Edge Case E2: Invalid Google Scholar URL
**Mockup reference:** `screen-admin` — Scholar error.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept Scholar endpoint with `page.route('**/api/admin/import/scholar', r => r.fulfill({ status: 400, body: JSON.stringify({ error: 'invalid_url' }) }))` | Bad URL | `US-4.2-E2-01-intercept.png` |
| 2 | Paste an invalid URL and click "Importer" | Request fails | `US-4.2-E2-02-submit.png` |
| 3 | Observe | Error "URL invalide ou profil introuvable" | `US-4.2-E2-03-url-error.png` |

### Edge Case E3: Duplicate Entries in CSV
**Mockup reference:** `screen-admin` — preview with warnings.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Upload a CSV where one row matches an existing researcher (same name+lab) | Parsed with potential duplicate | `US-4.2-E3-01-upload-dup.png` |
| 2 | Observe the preview table | Duplicate row flagged with a warning badge | `US-4.2-E3-02-duplicate-flagged.png` |
| 3 | Confirm import | Only non-duplicate rows imported, or user warned | `US-4.2-E3-03-partial-import.png` |

---

## US-4.3: App Settings

### Happy Path
**Mockup reference:** `screen-admin` — `admin-tab-admin-settings` with radio, slider, dropdown, save.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to "Parametres" tab in admin panel | Settings form loads | `US-4.3-01-settings-tab.png` |
| 2 | Observe language section | Radio buttons: Francais (selected), English | `US-4.3-02-language-section.png` |
| 3 | Observe similarity threshold section | Slider at 0.60, value displayed next to it | `US-4.3-03-threshold-section.png` |
| 4 | Drag the similarity slider to 0.75 | Value next to slider updates to "0.75" in real-time | `US-4.3-04-slider-changed.png` |
| 5 | Observe NLP algorithm section | Dropdown with "TF-IDF (Rapide, recommande)" selected | `US-4.3-05-nlp-section.png` |
| 6 | Select "BERT (Contextuel, lent)" from dropdown | Dropdown updates | `US-4.3-06-nlp-changed.png` |
| 7 | Click "Sauvegarder les parametres" | Success toast "Parametres sauvegardes" appears | `US-4.3-07-saved.png` |

### Edge Case E1: Save API Failure
**Mockup reference:** `screen-admin` — settings error.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept settings save with `page.route('**/api/admin/settings', r => r.fulfill({ status: 500 }))` | Server error | `US-4.3-E1-01-intercept.png` |
| 2 | Change a setting and click "Sauvegarder" | Save fails | `US-4.3-E1-02-submit.png` |
| 3 | Observe | Error "Echec de la sauvegarde", form values still intact | `US-4.3-E1-03-error.png` |

### Edge Case E2: Unsaved Changes Navigation
**Mockup reference:** Settings form with unsaved state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Change the similarity slider without saving | Unsaved change | `US-4.3-E2-01-changed.png` |
| 2 | Click another tab (e.g., "Utilisateurs") | Attempt to navigate away | `US-4.3-E2-02-navigate.png` |
| 3 | Observe | Confirmation dialog "Modifications non sauvegardees, quitter quand meme?" | `US-4.3-E2-03-confirm-dialog.png` |

### Edge Case E3: Zero Threshold Warning
**Mockup reference:** Settings form with warning.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Drag the similarity slider to 0.00 | Threshold at minimum | `US-4.3-E3-01-zero-threshold.png` |
| 2 | Click "Sauvegarder les parametres" | Save attempt | `US-4.3-E3-02-save.png` |
| 3 | Observe | Warning "Un seuil de 0.0 considerera tous les chercheurs comme proches" before proceeding | `US-4.3-E3-03-warning.png` |

---

## US-4.4: Audit Logs

### Happy Path
**Mockup reference:** `screen-admin` — `admin-tab-admin-logs` with date filters and log table.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to "Logs" tab in admin panel | Audit log table loads | `US-4.4-01-logs-tab.png` |
| 2 | Observe the table | Columns: Date/Heure, Utilisateur, Action (colored tag), Detail | `US-4.4-02-log-table.png` |
| 3 | Verify action color coding | Ajout=green, Modification=blue, Suppression=red, Import=orange | `US-4.4-03-color-coded.png` |
| 4 | Set date range from 2026-04-08 to 2026-04-09 and click "Filtrer" | Table filters to only show logs in that range | `US-4.4-04-filtered.png` |
| 5 | Observe filtered results | Only entries from April 8-9 visible | `US-4.4-05-filtered-results.png` |

### Edge Case E1: Empty Date Range
**Mockup reference:** `screen-admin` — empty log table.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Set date range to a period with no logs (e.g., 2020-01-01 to 2020-01-02) | No matching logs | `US-4.4-E1-01-filter-empty.png` |
| 2 | Click "Filtrer" | Filter applied | `US-4.4-E1-02-filtered.png` |
| 3 | Observe | "Aucun log pour cette periode" message | `US-4.4-E1-03-no-logs.png` |

### Edge Case E2: Pagination with Many Logs
**Mockup reference:** `screen-admin` — log table with pagination.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept logs API returning 120 entries | Many logs | `US-4.4-E2-01-intercept.png` |
| 2 | Navigate to Logs tab | Table loads | `US-4.4-E2-02-loaded.png` |
| 3 | Observe | Only 50 entries visible, pagination controls at bottom (Page 1 of 3) | `US-4.4-E2-03-pagination.png` |
| 4 | Click "Page 2" | Next 50 entries shown | `US-4.4-E2-04-page-two.png` |

### Edge Case E3: Logs API Timeout
**Mockup reference:** `screen-admin` — log error state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept `/api/admin/logs` with `page.route('**/api/admin/logs**', r => r.fulfill({ status: 504 }))` | Timeout | `US-4.4-E3-01-intercept.png` |
| 2 | Navigate to Logs tab | Tab loads | `US-4.4-E3-02-loading.png` |
| 3 | Observe | "Chargement des logs echoue" with retry button | `US-4.4-E3-03-error-retry.png` |
