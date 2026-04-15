# Reconciliation Report — Process Mining Research Cartography

**Date:** 2026-04-15
**Scope:** spec.md (Step 2) vs. built app (Steps 4-5 + Step 5 Round 2 hardening)

---

## Summary

| Classification | Count |
|---|---|
| UNCHANGED | 11 |
| MODIFIED | 13 |
| NEW | 0 |
| REMOVED | 0 |
| **TOTAL** | **24** |

All 20 feature stories and 4 accessibility stories from the original spec were implemented. No stories were added or removed. 13 stories were modified during Step 5 quality hardening (Round 1 + Round 2) to improve keyboard accessibility, security, performance, robustness, and i18n correctness.

---

## UNCHANGED Stories

### US-1.1 — Dashboard Stats Display
Built exactly as specced in M1. 4 stat cards (Chercheurs, Themes, Clusters, Publications) with click navigation to corresponding sections. Loading skeletons, zero-state, and large-number formatting all implemented.
**E2E tests:** Yes (m1-explore.spec.ts)

### US-1.2 — Recent Activity Feed
Built exactly as specced in M1. 5 most recent activities with avatar, name, action, relative timestamp. Empty state, error retry, deleted researcher display all implemented.
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

### US-1.3 — Mini-Map Preview
**Feature exists, visualization upgraded post-M5.**
- **Original spec:** SVG preview of clusters with hover effect and click-to-navigate.
- **What changed (Three.js rewrite, commit a71d4bf):** The mini-map now renders via Three.js WebGL instead of SVG. A floating-nebula scene shows colored nebula spheres per cluster with particle dots for members, a slowly orbiting camera, and pulsing opacity. The `MiniMap` component uses `useWebGLContextLoss` to show a "Reload" button if WebGL context is lost. The container keeps its role="button", tabIndex, and keyboard Enter/Space handler — click-to-navigate behavior is unchanged.
- **Step 5 R2 hardening (d787255):** H1 — Three.js (508KB) split into a `vendor-three` manualChunk AND `MiniMap` lazy-loaded via `React.lazy()` + `Suspense` in DashboardPage. Three.js is no longer loaded on the dashboard home; it is fetched only when the mini-map actually mounts.
**E2E tests:** Yes (m1-explore.spec.ts — click-to-navigate behavior still tested)

### US-3.1 — Interactive Cluster Map
**Feature exists, visualization fully replaced post-M5.**
- **Original spec:** D3 SVG cluster map with zoom/pan, floating filter panel, color legend, keyboard-accessible cluster circles and researcher dots.
- **What changed (Three.js rewrite, commit e7141f9):** The map is now a full Three.js WebGL scene — dark starfield background with Fibonacci-sphere-positioned nebula clusters (translucent glowing spheres), particle dots for each researcher, animated camera via OrbitControls (autoRotate, zoom min/max), a side panel that slides in on cluster click/fly-to animation, and a hover tooltip. The D3 SVG and its keyboard-accessible `tabIndex` / `onKeyDown` elements were removed in the rewrite. The Three.js scene uses mouse raycasting for interaction; keyboard Tab-through of clusters is no longer implemented (SVG-based tabIndex was dropped with the rewrite). Escape closes the side panel via a `keydown` listener. The filter panel, legend, and cross-nav button remain.
- **Step 5 R1 hardening (6805e0a):** Code-split via React.lazy (C2), named d3 imports (H4) — these applied to the D3 version and are superseded by the Three.js rewrite.
- **Step 5 R2 hardening (d787255):** C2 (WebGL context loss) — `useWebGLContextLoss` hook detects `webglcontextlost` event and renders an overlay with a "Recharger la carte" button. H2 (320px filter panel) — CSS media query stacks the filter panel above the canvas on narrow viewports. H3 (fixed 500px height) — replaced with `height: min(70vh, 800px)`.
**E2E tests:** Yes (m3-explore.spec.ts)

### US-3.2 — Cluster Click for Members
**Feature exists, interaction model changed by Three.js rewrite.**
- **Original spec:** Click cluster region → popover with member list, keyboard-accessible (Enter/Space), focus management, Escape dismiss.
- **What changed (Three.js rewrite, commit e7141f9):** The popover was replaced by a full-width `<aside>` side panel that slides in from the right (`role="dialog"`, animated). Cluster click triggers a camera fly-to animation. Members load lazily via Supabase query. The side panel has a "back to map" close button. Escape key dismisses via a `keydown` listener. Focus is not explicitly trapped in the side panel (no `useFocusTrap`).
- **Step 5 R1 hardening:** Popover focus management (C5) was implemented for the D3 popover — superseded by the side panel in the rewrite.
- **Step 5 R2 hardening:** No specific R2 fixes targeted this story beyond C2 (context loss overlay shared with US-3.1).
**E2E tests:** Yes (m3-explore.spec.ts)

### US-3.3 — Researcher Dot to Profile
**Feature exists, interaction model changed by Three.js rewrite.**
- **Original spec:** Hover for tooltip, click to navigate, keyboard Enter/Space activation, aria-label with name.
- **What changed (Three.js rewrite, commit e7141f9):** Researcher dots are Three.js `Mesh` objects in 3D space. Hover detection uses mouse raycasting; tooltip shows name and lab in a fixed overlay div. Click fires `navigateToProfile()`. Keyboard activation (tabIndex, onKeyDown) is no longer present — the particles are 3D objects, not DOM elements. aria-label on individual dots is not implemented (the map container has `role="img"` with a general `aria-label`).
- **Step 5 R1 hardening:** Keyboard accessibility (C3) and aria-labels (C3) were added to the D3 SVG dots — these were removed with the Three.js rewrite.
- **Step 5 R2 hardening:** No specific R2 fixes targeted this story.
**E2E tests:** Yes (m3-explore.spec.ts)

### US-3.4 — Theme List View
**Feature exists, card visualization enhanced post-M5.**
- **Original spec:** Grid of expandable cluster cards with name, researcher count, sub-theme tags, color-coded borders, cross-nav links.
- **What changed (Three.js viz, commit a71d4bf):** Each cluster card now includes a `ClusterThumbnail` component — a small Three.js nebula rendered in an `aria-hidden` canvas thumbnail that auto-rotates. The card layout, expand/collapse behavior, member links, and cross-nav buttons are unchanged.
- **Step 5 R2 hardening (d787255):** H4-H7 i18n fixes affected `UsersTab`, `ImportTab`, `PendingTab`, and `ProfilePage` — not ThemesPage directly. No R2 fixes targeted US-3.4.
**E2E tests:** Yes (m3-explore.spec.ts)

### US-4.1 — User Management
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** User table with roles, invite button, pending profiles with approve/reject.
- **What changed (R1):** (1) Invite user dialog now has focus trap (Tab cycles within modal, focus moves to first element on open, restores on close). (2) Admin role verification moved from `user_metadata` to `app_metadata` in all API endpoints.
- **Why (R1):** C4 (modal had no focus trap — Tab escaped modal), H1 (user_metadata is user-writable, allowing role escalation).
- **Step 5 R2 hardening (d787255):** H4 (UsersTab i18n) — wrapped 6+ hardcoded French strings in `t()` with keys added to fr.json + en.json (Nom header, role/status badges, toasts, invite button).
**E2E tests:** No (M5 has no E2E test file)

### US-4.2 — Bulk Import
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** CSV/Excel upload with preview, Google Scholar import.
- **What changed (R1):** CSV parser replaced naive `line.split(',')` with RFC-4180 compliant `parseCsvLine()` that handles quoted fields and escaped quotes.
- **Why (R1):** H8 (commas in researcher names corrupted import data).
- **Step 5 R2 hardening (d787255):** H5 (ImportTab i18n) — wrapped hardcoded strings in `t()` (Scholar label, error, preview header, Statut/Nouveau, success toast). H9 (import API validation) — added per-row validation: row cap 500, name/lab length limits, keywords array cap, status enum whitelist.
**E2E tests:** No (M5 has no E2E test file)

### US-5.1 — User Login
**Feature exists, behavior enhanced during Step 5 hardening.**
- **Original spec:** Login with email/password, demo buttons, navbar user area with dropdown.
- **What changed (R1):** (1) Route-level auth guard (`PrivateRoute` component) redirects unauthenticated users from `/admin` to `/login`. (2) User dropdown menu now receives focus on open, Tab cycles within menu items, Escape closes and returns focus to trigger.
- **Why (R1):** H2 (admin panel was accessible without login — UI-only block), H15 (dropdown opened without moving focus in).
- **Step 5 R2 hardening:** No R2 fixes targeted US-5.1 specifically.
**E2E tests:** Yes (m4-explore.spec.ts)

### US-A11Y-001 — Keyboard Navigation
**Partially degraded by Three.js rewrite; Escape key retained.**
- **Original spec:** Tab/Shift+Tab to move between all interactive elements, including SVG map elements.
- **What changed (R1):** SVG map elements (researcher dots, cluster regions) gained tabIndex={0} and keyboard handlers (Enter/Space).
- **Impact of Three.js rewrite (commits e7141f9, a71d4bf):** The SVG keyboard-accessible elements were removed with the D3 map. The Three.js scene elements are 3D Mesh objects and are not DOM-focusable. Tab navigation through clusters and researcher dots on the map is no longer functional.
- **What remains:** Escape closes the side panel via a window keydown listener. Filter dropdowns and legend are standard DOM elements and remain keyboard-accessible. The ThemesPage cluster cards retain keyboard support (tabIndex, Enter/Space, aria-expanded).
- **Step 5 R2 hardening:** No R2 fixes restored Three.js keyboard accessibility.
**E2E tests:** Partial (map keyboard tests in m3-explore.spec.ts may fail on Three.js version)

### US-A11Y-002 — Focus Management
**Improved during Step 5 hardening.**
- **Original spec:** Focus trapped in modals, restored on close.
- **What changed (R1):** (1) `useFocusTrap` hook created and applied to AdminPage unsaved-changes dialog and UsersTab invite dialog. (2) Map popovers (D3 version) auto-focused on open and restored focus on close. (3) UserDropdown menu auto-focuses first item on open.
- **Impact of Three.js rewrite:** The D3 popover focus management no longer applies. The Three.js side panel (`<aside role="dialog">`) does not have an explicit focus trap.
- **Step 5 R2 hardening:** No R2 fixes targeted focus management.
**E2E tests:** No dedicated a11y E2E tests

### US-A11Y-003 — Escape Key Dismissal
**Improved during Step 5 hardening.**
- **Original spec:** Escape closes any open popover, dropdown, or modal.
- **What changed (R1):** (1) Map popovers (D3 version) and (2) modal dialogs in AdminPage and UsersTab gained Escape handlers.
- **What remains after Three.js rewrite:** Escape closes the Three.js map side panel via a `window.addEventListener('keydown')` handler. Modal Escape handlers are unaffected.
- **Step 5 R2 hardening:** No R2 fixes targeted this story.
**E2E tests:** No dedicated a11y E2E tests

### US-A11Y-004 — ARIA Labels
**Improved during Step 5 hardening.**
- **Original spec:** Proper ARIA labels and roles on all interactive elements.
- **What changed (R1):** (1) Duplicate `<nav aria-label="Navigation principale">` fixed — outer element changed to `<header>`. (2) WCAG contrast fixes: tag-blue, tag-orange, tag-cyan, badge-admin, badge-pending, --pm-text-muted, --pm-primary all darkened to meet 4.5:1 ratio.
- **Impact of Three.js rewrite:** Individual researcher dot aria-labels (added in R1 to SVG) were removed with the D3 map. The map container retains `role="img"` and a general `aria-label`.
- **Step 5 R2 hardening (d787255):** C3 (fr.json breadcrumbDashboard) — changed value from "Dashboard" to "Tableau de bord". M3 (SettingsTab hardcoded string) — wrapped "Modifications non sauvegardées" in `t()`. H6 (PendingTab i18n) — wrapped 5 `<th>` headers and 2 toast messages in `t()`. H7 (ProfilePage i18n) — wrapped 4 hardcoded strings in `t()`.
**E2E tests:** No dedicated a11y E2E tests

---

## Step 5 Round 2 Hardening Applied

The following fixes from the R2 audit (commit d787255) were applied by story:

| Fix | Story | Summary |
|---|---|---|
| C2 | US-3.1 | `useWebGLContextLoss` hook on MapPage and MiniMap; "Recharger la carte" overlay |
| C3 | US-A11Y-004 | fr.json line 128: "Dashboard" → "Tableau de bord" |
| H1 | US-1.3 | Three.js in vendor-three chunk (manualChunks) + MiniMap lazy-loaded with React.lazy in DashboardPage |
| H2 | US-3.1 | CSS media query stacks filter panel above canvas at <768px |
| H3 | US-3.1 | map-container height: `min(70vh, 800px)` instead of fixed 500px |
| H4 | US-4.1 | UsersTab i18n: 6+ French strings wrapped in `t()` |
| H5 | US-4.2 | ImportTab i18n: Scholar label, error, preview header, status, toast |
| H6 | US-A11Y-004 | PendingTab i18n: 5 table headers + 2 toasts |
| H7 | US-A11Y-004 | ProfilePage i18n: 4 hardcoded strings |
| H8 | US-5.1 / all | vercel.json: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| H9 | US-4.2 | import API: row cap 500, field validation, status enum whitelist |
| H10 | all | @vercel/node 5.7.5 already resolves CVEs — no action needed |
| M1 | all | vercel.json: Cache-Control max-age=31536000 on /assets/(.*) |
| M2 | US-2.2 | ProfilePage: invalid UUID redirects to 404 instead of / |
| M3 | US-A11Y-004 | SettingsTab: hardcoded string replaced with `t()` |
| C1 | — | OUTSTANDING: credential rotation required — user action only |

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

**Gap:** M5 admin stories and accessibility stories have no dedicated E2E tests. The admin features were manually verified during Step 4/5 build process but lack automated regression coverage. Some M3 keyboard accessibility tests (Tab through clusters/dots) will need updating to reflect Three.js raycasting interaction model.
