# M5 Exploration Log

## US-4.1 — User Management & Pending Profiles

### Happy Path (User Table)
- Step 1: Logged in as Demo Admin, navigated to /admin → `m5/US-4.1-01-admin-logged-in.png` ✓
- Step 2: Admin panel loaded with 5 tabs: Utilisateurs, Profils en attente, Import, Parametres, Logs → `m5/US-4.1-02-admin-panel.png` ✓
- Step 3: Utilisateurs tab active — table with Nom, Email, Role, Statut, Actions columns → `m5/US-4.1-03-user-table.png` ✓
- Step 4: Clicked "Modifier" on a user — inline role select appeared → `m5/US-4.1-04-edit-role.png` ✓
- Step 5: Changed role to Admin, clicked "Sauvegarder" — role badge updated → `m5/US-4.1-05-role-changed.png` ✓
- Step 6: Clicked "+ Inviter" button — invite dialog with email input appeared → `m5/US-4.1-06-invite-dialog.png` ✓
- Step 7: Entered test@example.com, clicked "Envoyer l'invitation" — success toast appeared → `m5/US-4.1-07-invite-sent.png` ✓
- Step 8: Clicked "Profils en attente" tab → `m5/US-4.1-08-pending-tab.png` ✓
- Step 9: Pending profiles table showing Dr. Emile Rousseau and Dr. Nadia Hamidi with Approuver/Rejeter buttons → `m5/US-4.1-09-pending-list.png` ✓
- Step 10: Also captured pending table → `m5/US-4.1-09-pending-table.png` ✓
- Step 11: Clicked "Approuver" on Dr. Emile Rousseau — profile status updated to approved, row removed → `m5/US-4.1-10-approved.png` ✓
- Step 12: Clicked "Rejeter" on Dr. Nadia Hamidi — rejection reason dialog appeared, confirmed, row removed → `m5/US-4.1-11-rejected.png` ✓

### Edge Case E1: Empty Pending List
- Step 1: After all pending profiles processed — EmptyState "Aucun profil en attente" displayed → `m5/US-4.1-E1-empty-pending.png` ✓

### Edge Case E2: Self-Revoke Disabled
- Step 1: Attempted to click "Revoquer" on own admin account — button was disabled with tooltip, and warning alert shown → `m5/US-4.1-E2-self-revoke-disabled.png` ✓

### Edge Case E3: Invite Error
- Step 1: Invite dialog opened → `m5/US-4.1-E3-invite-dialog.png` ✓
- Step 2: Entered already-registered email, invite failed — error toast shown → `m5/US-4.1-E3-invite-error.png` ✓

### Issues Found
- None. Approve/Reject required raw fetch() with service role key in both apikey and Authorization headers to bypass Supabase RLS. The createClient approach silently forwarded the user JWT, which Postgres interpreted as the user role — service_role privileges were never applied.


## US-4.2 — Bulk Import (CSV & Google Scholar)

### Happy Path (CSV Import)
- Step 1: Clicked Import tab — drag-and-drop zone with CSV/XLSX/XLS label appeared → `m5/US-4.2-01-import-tab.png` ✓
- Step 2: Dropped test-import.csv (Nom/Labo/Themes format, 2 rows) — preview table appeared showing 2 entries as "Nouveau" → `m5/US-4.2-02-csv-preview.png` ✓
- Step 3: Clicked "Importer 2 chercheurs" — success state "2 chercheur(s) importé(s) avec succès." displayed with "Voir les logs" button → `m5/US-4.2-03-import-success.png` ✓
- Step 4: Re-imported same CSV — duplicate detection highlighted both rows as doublons (orange tag) → `m5/US-4.2-04-duplicate-detected.png` ✓

### Edge Case E1: Invalid CSV Format
- Step 1: Dropped a malformed file (wrong columns) — parseError "Format CSV invalide." displayed in red error state → `m5/US-4.2-E1-invalid-format.png` ✓

### Issues Found
- None. CSV file used in testing must have headers Nom,Labo,Themes (not full_name,lab,bio). The browser file input required DataTransfer injection via browser_evaluate for programmatic upload.


## US-4.3 — App Settings

### Happy Path
- Step 1: Clicked Parametres tab — settings panel with Language, Similarity threshold, NLP Algorithm sections → `m5/US-4.3-01-settings-tab.png` ✓
- Step 2: Moved similarity threshold slider to 0.75 — numeric display updated to "0.75" → `m5/US-4.3-02-slider-changed.png` ✓
- Step 3: Clicked "Sauvegarder les parametres" — success toast appeared, "Modifications non sauvegardées" text disappeared → `m5/US-4.3-03-settings-saved.png` ✓

### Edge Case E1: Zero Threshold Warning
- Step 1: Moved slider to 0.00 — warning text "Un seuil de 0.0 considerera tous les chercheurs comme proches." appeared below slider inline → `m5/US-4.3-E1-zero-threshold.png` ✓

### Edge Case E2: Unsaved Navigation Prompt
- Step 1: Changed slider without saving, clicked a different tab — confirmation dialog "Modifications non sauvegardées" with "Annuler" / "Quitter quand même" appeared → `m5/US-4.3-E2-unsaved-nav-prompt.png` ✓

### Edge Case E3: Zero Threshold Warning Gates Save (R2 fix)
- Step 1: Moved slider to 0.00, clicked "Sauvegarder" — warning alertdialog appeared with "Confirmer" and "Annuler" buttons; main Save button hidden; save did NOT fire → `m5/US-4.3-E3-01-zero-threshold-warning.png` ✓
- Step 2: Clicked "Annuler" — dialog dismissed, slider restored to previous value (0.80), Save button returned → `m5/US-4.3-E3-02-zero-threshold-cancelled.png` ✓
- Step 3: Moved slider to 0.00 again, clicked "Sauvegarder", warning shown — ready to confirm → `m5/US-4.3-E3-03-zero-threshold-confirm.png` ✓

### Scholar Import Graceful Degradation (R2 fix)
- Step 1: Import tab — Scholar URL section shows "nécessite une configuration serveur supplémentaire" note; entering a URL and clicking Importer shows "L'import Google Scholar n'est pas encore configuré. Utilisez l'import CSV." → `m5/US-4.2-07-scholar-import.png` ✓

### Issues Found
- JSX unicode escape sequences (\u00e9, \u00e7, \u00ea, etc.) in JSX text content (outside curly braces) were rendered literally as "\u00e9". Fixed by using actual UTF-8 characters or template literals in curly braces. Affected: AdminPage.tsx (dialog title, button label), SettingsTab.tsx (Français, recommandé, non sauvegardées), UsersTab.tsx (Révoqué), LogsTab.tsx (pagination text), ImportTab.tsx (preview heading, success message).

## R2 Security Fix — Service Role Key Removal
- VITE_SUPABASE_SERVICE_ROLE_KEY removed from .env.local (renamed to SUPABASE_SERVICE_ROLE_KEY without VITE_ prefix)
- Vercel serverless API proxy created: api/admin/users.ts, api/admin/profiles.ts, api/admin/import.ts, api/admin/settings.ts
- All admin hooks updated to call /api/admin/* endpoints (pass user JWT for admin verification server-side)
- Build verification: `npx vite build` passed 0 errors; `grep -r "service_role" dist/` returned nothing


## US-4.4 — Audit Logs

### Happy Path
- Step 1: Clicked Logs tab — log table with Date/Heure, Utilisateur, Action, Detail columns, date filter inputs → `m5/US-4.4-01-logs-tab.png` ✓
- Step 2: Set Du/Au both to 2026-04-14, clicked "Filtrer" — table filtered to today's entries, "Tout afficher" button appeared → `m5/US-4.4-02-logs-date-filter.png` ✓
- Step 3: Clicked "Tout afficher" — filter cleared, all entries shown, date inputs reset → `m5/US-4.4-03-logs-filter-cleared.png` ✓
- Step 4: Full page scroll showing all log entries with colored action tags (Suppression=red, Modification=blue, Ajout=green) → `m5/US-4.4-04-logs-action-tags.png` ✓

### Issues Found
- None. Logs populated correctly from audit_logs table. Real approve/reject operations from US-4.1 are visible in the log as Modification/Suppression entries.
