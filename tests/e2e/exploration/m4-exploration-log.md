# M4 Exploration Log

## US-5.1 — User Login

### Happy Path
- Step 1: Observed navbar with "Connexion" button visible → `US-5.1-01-navbar-logged-out.png` ✓
- Step 2: Clicked "Connexion", navigated to /login → `US-5.1-02-login-screen.png` ✓
- Step 3: Observed login card with email, password, "Se connecter" button, two demo buttons → `US-5.1-03-login-card.png` ✓
- Step 4: Entered researcher@cartoPM.fr / demo123456, clicked "Se connecter", redirected to dashboard → `US-5.1-04-login-success.png` ✓
- Step 5: Navbar shows "MD Marie Dupont" avatar + name → `US-5.1-05-navbar-logged-in.png` ✓
- Step 6: Clicked user area, dropdown opened with "Mon profil" and "Deconnexion" → `US-5.1-06-dropdown-open.png` ✓
- Step 7: Clicked "Mon profil", navigated to /researchers/22222222-0000-0000-0000-000000000001 (Marie Dupont's profile) → `US-5.1-07-own-profile.png` ✓
- Step 8: Returned to dashboard, opened dropdown again → `US-5.1-08-dropdown-again.png` ✓
- Step 9: Clicked "Deconnexion", navbar reverted to "Connexion" button → `US-5.1-09-logged-out.png` ✓

### Happy Path (Admin Login)
- Step 1: Navigated to /login → `US-5.1-10-login-screen.png` ✓
- Step 2: Clicked "Demo Admin", authenticated as admin, redirected to dashboard → `US-5.1-11-admin-login.png` ✓
- Step 3: Navbar shows "Admin" tab + "ADMIN" badge next to "Admin CartoPM" → `US-5.1-12-admin-tab.png` ✓
- Step 4: Clicked "Admin" tab, navigated to /admin → `US-5.1-13-admin-panel.png` ✓

### Edge Case E1: Invalid Credentials
- Step 1: Navigated to /login → `US-5.1-E1-01-login-screen.png` ✓
- Step 2: Entered bad@email.com / wrongpassword, clicked "Se connecter" → `US-5.1-E1-02-submit.png` ✓
- Step 3: Error "Email ou mot de passe incorrect." displayed → `US-5.1-E1-03-error-message.png` ✓

### Edge Case E2: Auth API Unreachable
- Step 1: Injected fetch interceptor blocking /auth/ endpoints → `US-5.1-E2-01-intercept.png` ✓
- Step 2: Entered credentials, clicked "Se connecter" → `US-5.1-E2-02-submit.png` ✓
- Step 3: "Service indisponible, reessayez plus tard." displayed → `US-5.1-E2-03-service-error.png` ✓

### Edge Case E3: Session Expired
- Step 1: Logged in as researcher → `US-5.1-E3-01-logged-in.png` ✓
- Step 2: Injected 401 response interceptor for Supabase REST calls → `US-5.1-E3-02-intercept.png` ✓
- Step 3: Navigated to /researchers (API call made, error shown) → `US-5.1-E3-03-action.png` ✓
- Step 4: Redirected to /login?expired=1 with "Session expiree, veuillez vous reconnecter." → `US-5.1-E3-04-session-expired.png` ✓

### Issues Found
- None. The "Mon profil" navigation was fixed to look up the researcher record by user_id and navigate to their specific profile URL.


## US-5.2 — Profile Submission with Admin Approval

### Happy Path (Own Profile Edit)
- Step 1: Logged in as researcher (Marie Dupont), authenticated → `US-5.2-01-logged-in.png` ✓
- Step 2: Navigated to own profile /researchers/22222222-0000-0000-0000-000000000001 → `US-5.2-02-own-profile.png` ✓
- Step 3: Observed "Modifier" button — enabled, no lock icon → `US-5.2-03-edit-enabled.png` ✓
- Step 4: Clicked "Modifier", navigated to edit form with pre-populated data → `US-5.2-04-edit-form.png` ✓
- Step 5: Observed approval banner "Votre profil sera soumis a validation par un administrateur avant d'etre publie" → `US-5.2-05-approval-banner.png` ✓
- Step 6: Clicked "Enregistrer", success toast "Profil enregistre avec succes." appeared, navigation blocked to capture → `US-5.2-06-saved.png` ✓

### Happy Path (Other's Profile - Locked)
- Step 1: Stayed logged in as Marie Dupont → `US-5.2-07-logged-in.png` ✓
- Step 2: Navigated to Ahmed Benali's profile /researchers/22222222-0000-0000-0000-000000000004 → `US-5.2-08-other-profile.png` ✓
- Step 3: Observed "Modifier" button disabled with lock icon (🔒 Modifier) and note "Vous ne pouvez modifier que votre propre profil." → `US-5.2-09-edit-locked.png` ✓

### Happy Path (Not Logged In - Hidden)
- Step 1: Logged out, navigated to Ahmed Benali's profile as anonymous → `US-5.2-10-anonymous-profile.png` ✓
- Step 2: No "Modifier" button visible at all, only "Comparer" and "Voir sur la carte" → `US-5.2-11-no-edit-button.png` ✓

### Edge Case E1: Already Pending Submission
- Step 1: Logged back in as researcher, injected fetch interceptor returning `{ code: 'already_pending' }` on PATCH /researchers → `US-5.2-E1-01-intercept.png` ✓
- Step 2: Clicked "Enregistrer" → `US-5.2-E1-02-submit.png` ✓
- Step 3: Red banner "Vous avez deja une soumission en attente." appeared below approval banner → `US-5.2-E1-03-already-pending.png` ✓

### Edge Case E2: Save API Failure
- Step 1: Injected fetch interceptor returning 500 on PATCH /researchers → `US-5.2-E2-01-intercept.png` ✓
- Step 2: Clicked "Enregistrer" → `US-5.2-E2-02-submit.png` ✓
- Step 3: Error toast "Erreur de sauvegarde, veuillez reessayer." appeared, form data preserved → `US-5.2-E2-03-error-toast.png` ✓

### Edge Case E3: Admin Rejection Notification
- Step 1: Set researcher status='rejected', rejection_reason='Informations insuffisantes, veuillez completer votre biographie.' via direct Postgres → `US-5.2-E3-01-intercept.png` ✓
- Step 2: Navigated to own profile as Marie Dupont → `US-5.2-E3-02-profile.png` ✓
- Step 3: Red banner "Votre profil a ete rejete. Raison : Informations insuffisantes, veuillez completer votre biographie." visible → `US-5.2-E3-03-rejection-notice.png` ✓

### Issues Found
- None. The rejection banner required adding rejection_reason column to researchers table (ALTER TABLE via direct pg connection).


## US-2.3 — Add/Edit Profile Form

### Happy Path
- Step 1: Logged in as Marie Dupont, navigated to edit form → `US-2.3-01-form-loaded.png` ✓
- Step 2: Observed all form fields: Nom complet, Laboratoire select, Mots-cles tag input, Biographie textarea, Publications section → `US-2.3-02-form-fields.png` ✓
- Step 3: Typed "NLP" in keyword input and pressed Enter — "NLP" tag added → `US-2.3-03-add-keyword.png` ✓
- Step 4: Clicked × on "alignement" tag — tag removed, remaining: conformance, process mining, NLP → `US-2.3-04-remove-keyword.png` ✓
- Step 5: Clicked "+ Ajouter une publication" — new blank Publication 3 block appeared → `US-2.3-05-add-publication.png` ✓
- Step 6: Filled in Publication 3: title "Process Mining with NLP", co-author "Sophie Leclerc", venue "CAiSE 2024", year 2024 → `US-2.3-06-fill-publication.png` ✓
- Step 7: Clicked "Enregistrer" — success toast "Profil enregistre avec succes." appeared → `US-2.3-07-saved.png` ✓
- Step 8: Returned to form, clicked "Annuler" — navigated to profile page without further saving → `US-2.3-08-cancelled.png` ✓

### Edge Case E1: Required Fields Empty
- Step 1: Opened profile form → `US-2.3-E1-01-form-loaded.png` ✓
- Step 2: Cleared "Nom complet" field, clicked "Enregistrer" → `US-2.3-E1-02-submit-empty.png` ✓
- Step 3: Name field highlighted in red with "Ce champ est requis." validation message, submission blocked → `US-2.3-E1-03-validation-error.png` ✓

### Edge Case E2: Save API Failure
- Step 1: Injected fetch interceptor returning 500 on PATCH /researchers → `US-2.3-E2-01-intercept.png` ✓
- Step 2: Clicked "Enregistrer" → `US-2.3-E2-02-submit.png` ✓
- Step 3: Error toast "Erreur de sauvegarde, veuillez reessayer." visible, all form data preserved → `US-2.3-E2-03-error-preserved.png` ✓

### Edge Case E3: Duplicate Keyword
- Step 1: Form loaded with existing tags (conformance, alignement, process mining) → `US-2.3-E3-01-form-loaded.png` ✓
- Step 2: Typed "conformance" in keyword input → `US-2.3-E3-02-type-duplicate.png` ✓
- Step 3: Pressed Enter — tag not added, "Mot-cle deja present" message displayed in red below the tag input → `US-2.3-E3-03-duplicate-rejected.png` ✓

### Issues Found
- None. All form interactions work as specified.

