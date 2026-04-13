# M4 Exploration Plan — Auth & Profile Management

## US-5.1: User Login

### Happy Path
**Mockup reference:** `screen-login` — `login-card` with email/password, demo buttons; navbar transforms on login.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Observe the navbar | "Connexion" button visible at the right of the navbar | `US-5.1-01-navbar-logged-out.png` |
| 2 | Click "Connexion" button in the navbar | Navigates to `/login` | `US-5.1-02-login-screen.png` |
| 3 | Observe the login card | Centered card with email input, password input, "Se connecter" button, and two demo buttons | `US-5.1-03-login-card.png` |
| 4 | Enter valid email and password, click "Se connecter" | Authentication succeeds, redirects to dashboard | `US-5.1-04-login-success.png` |
| 5 | Observe the navbar after login | "Connexion" button replaced by avatar initials + user name | `US-5.1-05-navbar-logged-in.png` |
| 6 | Click on the user area in the navbar | Dropdown opens with "Mon profil" and "Deconnexion" links | `US-5.1-06-dropdown-open.png` |
| 7 | Click "Mon profil" in the dropdown | Navigates to own profile page | `US-5.1-07-own-profile.png` |
| 8 | Return to dashboard and click user area again | Dropdown opens | `US-5.1-08-dropdown-again.png` |
| 9 | Click "Deconnexion" | Logged out, navbar reverts to showing "Connexion" button | `US-5.1-09-logged-out.png` |

### Happy Path (Admin Login)
**Mockup reference:** `screen-login` — admin demo button; navbar with Admin tab.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/login` | Login screen loads | `US-5.1-10-login-screen.png` |
| 2 | Click "Demo: Connexion admin" button | Authenticated as admin, redirected to dashboard | `US-5.1-11-admin-login.png` |
| 3 | Observe the navbar | "Admin" tab visible in navbar, "Admin" badge next to user name | `US-5.1-12-admin-tab.png` |
| 4 | Click "Admin" tab | Navigates to `/admin` (admin panel) | `US-5.1-13-admin-panel.png` |

### Edge Case E1: Invalid Credentials
**Mockup reference:** `screen-login` — error below form.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Navigate to `/login` | Login screen loads | `US-5.1-E1-01-login-screen.png` |
| 2 | Enter "bad@email.com" and "wrongpassword", click "Se connecter" | Login fails | `US-5.1-E1-02-submit.png` |
| 3 | Observe the form | Error message "Email ou mot de passe incorrect" visible below inputs | `US-5.1-E1-03-error-message.png` |

### Edge Case E2: Auth API Unreachable
**Mockup reference:** `screen-login` — service error.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept auth endpoint with `page.route('**/auth/**', r => r.abort())` | API blocked | `US-5.1-E2-01-intercept.png` |
| 2 | Enter credentials and click "Se connecter" | Request fails | `US-5.1-E2-02-submit.png` |
| 3 | Observe the form | "Service indisponible, reessayez plus tard" message | `US-5.1-E2-03-service-error.png` |

### Edge Case E3: Session Expired
**Mockup reference:** Redirect to login with message.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Log in successfully | Authenticated | `US-5.1-E3-01-logged-in.png` |
| 2 | Intercept next API call with `page.route('**/api/**', r => r.fulfill({ status: 401 }))` | Token expired | `US-5.1-E3-02-intercept.png` |
| 3 | Perform an action (e.g., navigate to profile) | 401 received | `US-5.1-E3-03-action.png` |
| 4 | Observe | Redirected to login with "Session expiree, veuillez vous reconnecter" message | `US-5.1-E3-04-session-expired.png` |

---

## US-5.2: Profile Submission with Admin Approval

### Happy Path
**Mockup reference:** `screen-profile` — edit button states; `screen-add-researcher` — approval banner.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Log in as researcher (Marie Dupont) | Authenticated | `US-5.2-01-logged-in.png` |
| 2 | Navigate to own profile | Profile page loads | `US-5.2-02-own-profile.png` |
| 3 | Observe the "Modifier" button | Button is enabled and clickable (no lock icon) | `US-5.2-03-edit-enabled.png` |
| 4 | Click "Modifier" | Navigates to edit form with pre-populated data | `US-5.2-04-edit-form.png` |
| 5 | Observe the approval banner | Yellow banner: "Votre profil sera soumis a validation par un administrateur avant d'etre publie" | `US-5.2-05-approval-banner.png` |
| 6 | Modify bio text and click "Enregistrer" | Submission succeeds, success toast appears | `US-5.2-06-saved.png` |

### Happy Path (Other's Profile - Locked)
**Mockup reference:** `screen-profile` — locked edit button.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Log in as researcher (Marie Dupont) | Authenticated | `US-5.2-07-logged-in.png` |
| 2 | Navigate to Prof. Ahmed Benali's profile | Profile loads | `US-5.2-08-other-profile.png` |
| 3 | Observe the "Modifier" button | Button is disabled with lock icon, note "Vous ne pouvez modifier que votre propre profil" | `US-5.2-09-edit-locked.png` |

### Happy Path (Not Logged In - Hidden)
**Mockup reference:** `screen-profile` — no edit button.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Without logging in, navigate to any profile | Profile loads | `US-5.2-10-anonymous-profile.png` |
| 2 | Observe the edit area | No "Modifier" button visible at all | `US-5.2-11-no-edit-button.png` |

### Edge Case E1: Already Pending Submission
**Mockup reference:** `screen-add-researcher` — warning message.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept profile save API to return `{ error: 'already_pending' }` | Pending exists | `US-5.2-E1-01-intercept.png` |
| 2 | Submit the form | API responds with pending error | `US-5.2-E1-02-submit.png` |
| 3 | Observe the form | Warning "Vous avez deja une soumission en attente" displayed | `US-5.2-E1-03-already-pending.png` |

### Edge Case E2: Save API Failure
**Mockup reference:** `screen-add-researcher` — error toast.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept save endpoint with `page.route('**/api/researchers/**', r => r.fulfill({ status: 500 }))` | Server error | `US-5.2-E2-01-intercept.png` |
| 2 | Fill form and click "Enregistrer" | Save fails | `US-5.2-E2-02-submit.png` |
| 3 | Observe | Error toast "Erreur de sauvegarde, veuillez reessayer", form data preserved | `US-5.2-E2-03-error-toast.png` |

### Edge Case E3: Admin Rejection Notification
**Mockup reference:** Profile page with rejection notice.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept profile API to include a rejection status with reason | Rejected profile | `US-5.2-E3-01-intercept.png` |
| 2 | Log in and navigate to own profile | Profile loads | `US-5.2-E3-02-profile.png` |
| 3 | Observe notification area | "Votre profil a ete rejete" with admin's reason | `US-5.2-E3-03-rejection-notice.png` |

---

## US-2.3: Add/Edit Profile Form

### Happy Path
**Mockup reference:** `screen-add-researcher` — form with all fields.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Log in and navigate to profile edit form | Form loads | `US-2.3-01-form-loaded.png` |
| 2 | Observe form fields | Name input, Lab select, Keywords tag input, Bio textarea, Publications section | `US-2.3-02-form-fields.png` |
| 3 | Type "NLP" in the keywords input and press Enter | "NLP" tag added to the keywords area | `US-2.3-03-add-keyword.png` |
| 4 | Click the "x" on an existing keyword tag | That tag is removed | `US-2.3-04-remove-keyword.png` |
| 5 | Click "+ Ajouter une publication" | New blank publication block appears (title, co-authors, venue) | `US-2.3-05-add-publication.png` |
| 6 | Fill in the new publication fields | Fields populated | `US-2.3-06-fill-publication.png` |
| 7 | Click "Enregistrer" | Form submits, success toast, navigates back | `US-2.3-07-saved.png` |
| 8 | Return to form, click "Annuler" | Navigates to researcher list without saving | `US-2.3-08-cancelled.png` |

### Edge Case E1: Required Fields Empty
**Mockup reference:** `screen-add-researcher` — validation errors.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Open the profile form | Form loads | `US-2.3-E1-01-form-loaded.png` |
| 2 | Clear the "Nom complet" field and click "Enregistrer" | Validation triggered | `US-2.3-E1-02-submit-empty.png` |
| 3 | Observe | Name field highlighted in red with validation message, submission blocked | `US-2.3-E1-03-validation-error.png` |

### Edge Case E2: Save API Failure
**Mockup reference:** `screen-add-researcher` — error state.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Intercept save endpoint with `page.route('**/api/researchers', r => r.fulfill({ status: 500 }))` | Server error | `US-2.3-E2-01-intercept.png` |
| 2 | Fill form and click "Enregistrer" | Save fails | `US-2.3-E2-02-submit.png` |
| 3 | Observe | Error toast appears, all form data is still present (not cleared) | `US-2.3-E2-03-error-preserved.png` |

### Edge Case E3: Duplicate Keyword
**Mockup reference:** `screen-add-researcher` — tag input.

| Step | Action | Expected Result | Screenshot |
|------|--------|----------------|------------|
| 1 | Open the profile form with existing tag "Process Discovery" | Form loaded | `US-2.3-E3-01-form-loaded.png` |
| 2 | Type "Process Discovery" in keywords input and press Enter | Duplicate attempted | `US-2.3-E3-02-type-duplicate.png` |
| 3 | Observe | Tag is not added, brief message "Mot-cle deja present" appears | `US-2.3-E3-03-duplicate-rejected.png` |
