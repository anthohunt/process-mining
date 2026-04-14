# Reconciliation Report — Process Mining Research Cartography

**Date:** 2026-04-14
**Scope:** spec.md (Step 2) vs. built app (Steps 4-5)

---

## Summary

| Classification | Count |
|---|---|
| UNCHANGED | 14 |
| MODIFIED | 10 |
| NEW | 0 |
| REMOVED | 0 |
| **TOTAL** | **24** |

All 20 feature stories and 4 accessibility stories from the original spec were implemented. No stories were added or removed. 10 stories were modified during Step 5 quality hardening to improve keyboard accessibility, security, and robustness.

---

## UNCHANGED Stories

### US-1.1 — Dashboard Stats Display
Built exactly as specced in M1. 4 stat cards (Chercheurs, Themes, Clusters, Publications) with click navigation to corresponding sections. Loading skeletons, zero-state, and large-number formatting all implemented.
**E2E tests:** Yes (m1-explore.spec.ts)

### US-1.2 — Recent Activity Feed
Built exactly as specced in M1. 5 most recent activities with avatar, name, action, relative timestamp. Empty state, error retry, deleted researcher display all implemented.
**E2E tests:** Yes (m1-explore.spec.ts)

### US-1.3 — Mini-Map Preview
Built exactly as specced in M1. SVG preview with hover effect (pointer cursor, blue outline), click navigates to /map. Empty/loading/error fallback states implemented.
**E2E tests:** Yes (m1-explore.spec.ts)

### US-1.4 — Detailed Statistics
Built exactly as specced in M3. D3.js bar chart (theme distribution), line chart (temporal trends), histogram (similarity scores) with tooltips. Empty states and error handling implemented.
**E2E tests:** Yes (m3-explore.spec.ts)

### US-2.1 — Researcher Search & Filter
Built exactly as specced in M2. Searchable/filterable table with lab and theme dropdowns, AND logic for combined filters. No-results state, XSS sanitization implemented.
**E2E tests:** Yes (m2-explore.spec.ts)

### US-2.2 — Researcher Profile View
Built exactly as specced in M2. Profile sidebar (avatar initials, name, lab, bio), keywords tags, publications list, "Voir sur la carte" button, breadcrumb navigation. Long bio truncation, 404 handling implemented.
**E2E tests:** Yes (m2-explore.spec.ts)

### US-2.3 — Add/Edit Profile Form
Built exactly as specced in M4. Structured form with name, lab, keywords tag input (Enter-to-add, x-to-remove, duplicate rejection), bio textarea, repeatable publication blocks, approval banner. Required field validation, save error preservation implemented.
**E2E tests:** Yes (m4-explore.spec.ts)

### US-2.4 — Side-by-Side Comparison
Built exactly as specced in M2. Two-column layout with Jaccard similarity gauge, common themes highlighting, summary card. Zero-similarity, API failure, same-researcher validation implemented.
**E2E tests:** Yes (m2-explore.spec.ts)

### US-2.5 — Profile to Map Navigation
Built exactly as specced in M2. "Voir sur la carte" button navigates to map centered on researcher with highlighted/pulsing dot. No-coordinates disabled state, map error overlay implemented.
**E2E tests:** Yes (m2-explore.spec.ts)

### US-3.4 — Theme List View
Built exactly as specced in M3. Grid of expandable cluster cards with name, researcher count, sub-theme tags, color-coded borders. Click-to-expand shows member links. Cross-nav to researchers and map. Empty/error states implemented.
**E2E tests:** Yes (m3-explore.spec.ts)

### US-4.3 — App Settings
Built exactly as specced in M5. Language radio (FR/EN), similarity threshold slider with real-time value display, NLP algorithm dropdown, save button with success toast. Unsaved changes confirmation dialog, zero-threshold warning implemented.
**E2E tests:** No (M5 has no E2E test file)

### US-4.4 — Audit Logs
Built exactly as specced in M5. Log table with Date/Heure, Utilisateur, Action (color-coded tags), Detail columns. Date range filter. Color coding: Ajout=green, Modification=blue, Suppression=red, Import=orange. Empty range state, pagination, error retry implemented.
**E2E tests:** No (M5 has no E2E test file)

### US-5.2 — Profile Submission with Admin Approval
Built exactly as specced in M4. Edit button states: own profile = enabled, other's profile = disabled with lock icon + note, anonymous = hidden. Approval banner on edit form. Already-pending warning, save error preservation, rejection notification implemented.
**E2E tests:** Yes (m4-explore.spec.ts)

---

## MODIFIED Stories

### US-3.1 — Interactive Cluster Map
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** SVG cluster map with zoom/pan, floating filter panel, color legend.
- **What changed:** (1) Cluster circles now keyboard-accessible with `tabIndex={0}`, `onKeyDown` (Enter/Space), `aria-label`. (2) d3 import changed from `import * as d3` to named imports for tree-shaking (H4). (3) Code-split into separate chunk via `React.lazy()`.
- **Why:** C3 (keyboard inaccessibility was CRITICAL a11y violation), H4 (full d3 bundle ~560 kB was HIGH perf issue), C2 (single 609 kB bundle).
**E2E tests:** Yes (m3-explore.spec.ts)

### US-3.2 — Cluster Click for Members
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** Click cluster to see popover with members.
- **What changed:** (1) Popover now receives focus on open (`tabIndex={-1}`, auto-focus). (2) Escape key dismisses popover and returns focus to trigger element. (3) Keyboard accessible via Enter/Space on cluster regions.
- **Why:** C5 (popover had no keyboard dismiss/focus management).
**E2E tests:** Yes (m3-explore.spec.ts)

### US-3.3 — Researcher Dot to Profile
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** Hover for tooltip, click to navigate to profile.
- **What changed:** Researcher dot hit circles now have `tabIndex={0}`, `onKeyDown` (Enter/Space triggers navigation), proper `aria-label`.
- **Why:** C3 (dots had `role="button"` but no `tabIndex` or keyboard handler).
**E2E tests:** Yes (m3-explore.spec.ts)

### US-4.1 — User Management
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** User table with roles, invite button, pending profiles with approve/reject.
- **What changed:** (1) Invite user dialog now has focus trap (Tab cycles within modal, focus moves to first element on open, restores on close). (2) Admin role verification moved from `user_metadata` to `app_metadata` in all API endpoints.
- **Why:** C4 (modal had no focus trap — Tab escaped modal), H1 (user_metadata is user-writable, allowing role escalation).
**E2E tests:** No (M5 has no E2E test file)

### US-4.2 — Bulk Import
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** CSV/Excel upload with preview, Google Scholar import.
- **What changed:** CSV parser replaced naive `line.split(',')` with RFC-4180 compliant `parseCsvLine()` that handles quoted fields and escaped quotes.
- **Why:** H8 (commas in researcher names corrupted import data).
**E2E tests:** No (M5 has no E2E test file)

### US-5.1 — User Login
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** Login with email/password, demo buttons, navbar user area with dropdown.
- **What changed:** (1) Route-level auth guard (`PrivateRoute` component) redirects unauthenticated users from `/admin` to `/login`. (2) User dropdown menu now receives focus on open, Tab cycles within menu items, Escape closes and returns focus to trigger.
- **Why:** H2 (admin panel was accessible without login — UI-only block), H15 (dropdown opened without moving focus in).
**E2E tests:** Yes (m4-explore.spec.ts)

### US-A11Y-001 — Keyboard Navigation
**Improved during Step 5 hardening.**
- **Original spec:** Tab/Shift+Tab to move between all interactive elements.
- **What changed:** SVG map elements (researcher dots, cluster regions) now have `tabIndex={0}` and keyboard handlers. Previously, these were completely keyboard-inaccessible.
- **Why:** C3 (SVG map was the only section where keyboard navigation was completely broken).
**E2E tests:** Partial (tested via map interaction tests in m3-explore.spec.ts)

### US-A11Y-002 — Focus Management
**Improved during Step 5 hardening.**
- **Original spec:** Focus trapped in modals, restored on close.
- **What changed:** (1) `useFocusTrap` hook created and applied to AdminPage unsaved-changes dialog and UsersTab invite dialog. (2) Map popovers now auto-focus on open and restore focus on close. (3) UserDropdown menu auto-focuses first item on open.
- **Why:** C4 (modals had no focus trap), C5 (popovers had no focus management), H15 (dropdown had no focus management).
**E2E tests:** No dedicated a11y E2E tests

### US-A11Y-003 — Escape Key Dismissal
**Improved during Step 5 hardening.**
- **Original spec:** Escape closes any open popover, dropdown, or modal.
- **What changed:** (1) Map popovers (cluster and disambiguation) now have `onKeyDown` Escape handler. (2) Modal dialogs in AdminPage and UsersTab have Escape handlers on overlay.
- **Why:** C5 (map popovers had no keyboard dismiss).
**E2E tests:** No dedicated a11y E2E tests

### US-A11Y-004 — ARIA Labels
**Improved during Step 5 hardening.**
- **Original spec:** Proper ARIA labels and roles on all interactive elements.
- **What changed:** (1) Duplicate `<nav aria-label="Navigation principale">` fixed — outer element changed to `<header>`. (2) WCAG contrast fixes: tag-blue, tag-orange, tag-cyan, badge-admin, badge-pending, --pm-text-muted, --pm-primary all darkened to meet 4.5:1 ratio.
- **Why:** C6 (duplicate nav landmarks), H12-H17 (color contrast failures at small text sizes).
**E2E tests:** No dedicated a11y E2E tests

---

## Test Coverage Summary

| Milestone | Stories | E2E Tests | File |
|---|---|---|---|
| M1 | US-1.1, US-1.2, US-1.3 | 18 | m1-explore.spec.ts |
| M2 | US-2.1, US-2.2, US-2.4, US-2.5 | 22 | m2-explore.spec.ts |
| M3 | US-3.1, US-3.2, US-3.3, US-3.4, US-1.4 | 26 | m3-explore.spec.ts |
| M4 | US-5.1, US-5.2, US-2.3 | 24 | m4-explore.spec.ts |
| M5 | US-4.1, US-4.2, US-4.3, US-4.4 | **0** | (no test file) |
| A11Y | US-A11Y-001–004 | **0** | (no test file) |
| **TOTAL** | 24 | **90** | — |

**Gap:** M5 admin stories and accessibility stories have no dedicated E2E tests. The admin features were manually verified during Step 4/5 build process but lack automated regression coverage.
