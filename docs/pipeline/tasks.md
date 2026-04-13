# Tasks — Process Mining Research Cartography

## Phase 0: Project Setup

### T-001: Initialize Vite + React + TypeScript project
- **User story:** Setup (pre-requisite)
- **Files:** `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `.gitignore`, `.env.example`
- **Dependencies:** None
- **Done when:** `npm run dev` starts without errors, blank page renders at localhost.

### T-002: Configure design tokens as CSS custom properties
- **User story:** Setup
- **Files:** `src/index.css`
- **Dependencies:** T-001
- **Done when:** All colors, typography, spacing, and effects from `design-profile.json` are available as `--pm-*` CSS variables, and Poppins font is loaded.

### T-003: Set up React Router with screen routes
- **User story:** Setup
- **Files:** `src/App.tsx`, `src/pages/*.tsx` (stub pages)
- **Dependencies:** T-001
- **Done when:** Routes `/`, `/stats`, `/researchers`, `/researchers/:id`, `/researchers/:id/edit`, `/comparison`, `/map`, `/themes`, `/login`, `/admin` all render stub pages.

### T-004: Set up i18next with FR/EN translations
- **User story:** Setup (bilingual)
- **Files:** `src/i18n/index.ts`, `src/i18n/fr.json`, `src/i18n/en.json`
- **Dependencies:** T-001
- **Done when:** `useTranslation()` hook works, switching language changes text, FR is default.

### T-005: Set up Supabase client and auth store
- **User story:** Setup
- **Files:** `src/lib/supabase.ts`, `src/stores/authStore.ts`, `.env.example`
- **Dependencies:** T-001
- **Done when:** Supabase client connects, auth store holds login state, `.env.example` documents required vars.

### T-006: Set up Vitest and Playwright configs
- **User story:** Setup
- **Files:** `vitest.config.ts`, `playwright.config.ts`, `tests/features/registry.json`
- **Dependencies:** T-001
- **Done when:** `npm test` runs Vitest with 0 tests passing, `npx playwright test` runs with no errors.

### T-007: Create Supabase schema migrations
- **User story:** Setup
- **Files:** `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/002_rls_policies.sql`, `supabase/migrations/003_seed_data.sql`
- **Dependencies:** T-005
- **Done when:** `supabase db push` creates all tables, RLS policies active, seed data inserted.

---

## Phase 1: M1 — Setup + Dashboard (US-1.1, US-1.2, US-1.3)

### T-010: Build AppNavbar component
- **User story:** US-1.1, US-1.2, US-1.3 (shared)
- **Files:** `src/components/layout/AppNavbar.tsx`, `src/components/layout/AppLayout.tsx`
- **Dependencies:** T-002, T-003, T-004
- **Done when:** Navbar renders with brand "CartoPM", nav tabs (Dashboard, Chercheurs, Carte, Statistiques, Themes), login button, and language toggle. Tabs highlight on active route. Admin tab hidden unless admin role.

### T-011: Build StatCard and StatGrid components
- **User story:** US-1.1
- **Files:** `src/components/dashboard/StatCard.tsx`, `src/components/dashboard/StatGrid.tsx`, `src/hooks/useStats.ts`
- **Dependencies:** T-007, T-010
- **Done when:** Dashboard displays 4 stat cards fetched from `/api/stats`. Cards are clickable and navigate to corresponding sections. Loading and error states work.

### T-012: Build ActivityFeed component
- **User story:** US-1.2
- **Files:** `src/components/dashboard/ActivityFeed.tsx`, `src/components/dashboard/ActivityItem.tsx`
- **Dependencies:** T-007, T-010
- **Done when:** Activity feed shows last 5 items with avatar (colored initials), name, action, relative timestamp. Clicking a name navigates to profile. Empty state works.

### T-013: Build MiniMap component
- **User story:** US-1.3
- **Files:** `src/components/dashboard/MiniMap.tsx`, `src/hooks/useClusters.ts`
- **Dependencies:** T-007, T-010
- **Done when:** Mini-map renders simplified SVG cluster preview. Hover shows blue outline + pointer cursor. Click navigates to `/map`. Empty/loading states work.

### T-014: Assemble DashboardPage
- **User story:** US-1.1, US-1.2, US-1.3
- **Files:** `src/pages/DashboardPage.tsx`
- **Dependencies:** T-011, T-012, T-013
- **Done when:** Dashboard page shows stat grid on top, two-column layout below (activity left, mini-map right). All data fetched from real API.

### T-015: Write feature tests for M1
- **User story:** US-1.1, US-1.2, US-1.3
- **Files:** `tests/features/FT-001-dashboard-stats.test.js`, `tests/features/FT-002-activity-feed.test.js`, `tests/features/FT-003-mini-map.test.js`, `tests/e2e/tests/ft-001.js`, `tests/e2e/tests/ft-002.js`, `tests/e2e/tests/ft-003.js`
- **Dependencies:** T-014
- **Done when:** All Playwright tests pass, covering happy paths and edge cases via `page.route()` interception.

---

## Phase 2: M2 — Researchers & Profiles (US-2.1, US-2.2, US-2.4, US-2.5)

### T-020: Build SearchBar component
- **User story:** US-2.1
- **Files:** `src/components/researchers/SearchBar.tsx`
- **Dependencies:** T-010
- **Done when:** Search input with lab and theme dropdown filters renders. Emits filter state changes via callbacks.

### T-021: Build ResearcherList component
- **User story:** US-2.1
- **Files:** `src/components/researchers/ResearcherList.tsx`, `src/components/researchers/ResearcherRow.tsx`, `src/hooks/useResearchers.ts`, `src/pages/ResearchersPage.tsx`
- **Dependencies:** T-007, T-020
- **Done when:** Table renders researchers with name, lab, theme tags, publication count, and "Voir" button. Search and filters work in real-time with AND logic. Cross-nav "Explorer par theme" button works. Empty/error states handled.

### T-022: Build ResearcherProfile components
- **User story:** US-2.2
- **Files:** `src/components/researchers/ResearcherProfile.tsx`, `src/components/researchers/ProfileSidebar.tsx`, `src/components/researchers/KeywordsCard.tsx`, `src/components/researchers/PublicationsList.tsx`, `src/pages/ProfilePage.tsx`
- **Dependencies:** T-007, T-010
- **Done when:** Profile page shows sidebar (avatar, name, lab, bio) + keywords as tags + publications list. "Voir sur la carte" and "Comparer" buttons work. Breadcrumb navigates back. Empty publication state handled.

### T-023: Build ComparisonView components
- **User story:** US-2.4
- **Files:** `src/components/researchers/ComparisonView.tsx`, `src/components/researchers/SimilarityGauge.tsx`, `src/hooks/useSimilarity.ts`, `src/pages/ComparisonPage.tsx`
- **Dependencies:** T-007, T-022
- **Done when:** Two profiles side by side with similarity gauge (circular percentage), common themes highlighted with blue outline, summary card at bottom. Handles 0% similarity and API errors.

### T-024: Implement profile-to-map navigation
- **User story:** US-2.5
- **Files:** `src/pages/ProfilePage.tsx` (update), `src/pages/MapPage.tsx` (update for centering)
- **Dependencies:** T-022
- **Done when:** "Voir sur la carte" button passes researcher ID as route state. Map page reads it and centers/highlights the researcher dot.

### T-025: Write feature tests for M2
- **User story:** US-2.1, US-2.2, US-2.4, US-2.5
- **Files:** `tests/features/FT-004-*.test.js`, `tests/features/FT-005-*.test.js`, `tests/features/FT-006-*.test.js`, `tests/features/FT-007-*.test.js`, `tests/e2e/tests/ft-004.js` through `ft-007.js`
- **Dependencies:** T-021, T-022, T-023, T-024
- **Done when:** All Playwright tests pass for researcher list, profile, comparison, and cross-nav.

---

## Phase 3: M3 — Thematic Map & Themes (US-3.1, US-3.2, US-3.3, US-3.4, US-1.4)

### T-030: Build ThematicMap with D3 zoom/pan
- **User story:** US-3.1
- **Files:** `src/components/map/ThematicMap.tsx`, `src/components/map/ClusterRegion.tsx`, `src/components/map/ResearcherDot.tsx`, `src/components/map/MapFilterPanel.tsx`, `src/components/map/MapLegend.tsx`, `src/pages/MapPage.tsx`
- **Dependencies:** T-007, T-010
- **Done when:** SVG map renders clusters as colored regions, researcher dots positioned correctly. Zoom/pan via d3-zoom. Filter panel filters by theme/lab. Legend shows cluster colors. Cross-nav "Vue en liste" button works. Empty/error states handled.

### T-031: Build ClusterPopover for member display
- **User story:** US-3.2
- **Files:** `src/components/map/ClusterPopover.tsx`
- **Dependencies:** T-030
- **Done when:** Clicking a cluster region shows a popover with member names (clickable links to profiles) and theme tags. Close on click-outside or Escape. Handles 50+ members with truncation.

### T-032: Implement researcher dot hover/click
- **User story:** US-3.3
- **Files:** `src/components/map/ResearcherDot.tsx` (update)
- **Dependencies:** T-030
- **Done when:** Hovering a dot shows the researcher name tooltip. Clicking navigates to profile. Cursor changes to pointer. Minimum 24px touch target maintained at all zoom levels.

### T-033: Build ThemeExplorer with expandable cluster cards
- **User story:** US-3.4
- **Files:** `src/components/themes/ThemeExplorer.tsx`, `src/components/themes/ClusterCard.tsx`, `src/pages/ThemesPage.tsx`
- **Dependencies:** T-007, T-010
- **Done when:** Grid of cluster cards renders with name, researcher count, sub-theme tags. Click expands to show member links. Cross-nav "Voir sur la carte" button works. Color-coded borders match map legend. Empty state handled.

### T-034: Build DetailedStats charts
- **User story:** US-1.4
- **Files:** `src/components/stats/DetailedStats.tsx`, `src/components/stats/ThemeBarChart.tsx`, `src/components/stats/TrendLineChart.tsx`, `src/components/stats/SimilarityHistogram.tsx`, `src/pages/StatsPage.tsx`
- **Dependencies:** T-007, T-010
- **Done when:** Bar chart (theme distribution), line chart (temporal trends), and histogram (similarity scores) render with real data. Hover tooltips work. Empty/error states handled. Breadcrumb to dashboard works.

### T-035: Write feature tests for M3
- **User story:** US-3.1, US-3.2, US-3.3, US-3.4, US-1.4
- **Files:** `tests/features/FT-008-*.test.js` through `FT-012-*.test.js`, `tests/e2e/tests/ft-008.js` through `ft-012.js`
- **Dependencies:** T-030 through T-034
- **Done when:** All Playwright tests pass for map interactions, theme explorer, and stats charts.

---

## Phase 4: M4 — Auth & Profile Management (US-5.1, US-5.2, US-2.3)

### T-040: Build LoginScreen
- **User story:** US-5.1
- **Files:** `src/components/auth/LoginScreen.tsx`, `src/pages/LoginPage.tsx`
- **Dependencies:** T-005, T-010
- **Done when:** Login card renders with email/password fields. Submitting authenticates via Supabase. Demo buttons log in as researcher or admin. Error states for invalid credentials and unreachable API. Redirects to dashboard on success.

### T-041: Build UserDropdown for navbar
- **User story:** US-5.1
- **Files:** `src/components/auth/UserDropdown.tsx`, `src/components/layout/AppNavbar.tsx` (update)
- **Dependencies:** T-040
- **Done when:** After login, navbar shows avatar initials + name. Click opens dropdown with "Mon profil" and "Deconnexion." Admin badge shown for admin role. Dropdown closes on click outside or Escape. Logout reverts to anonymous state.

### T-042: Build ProfileForm (add/edit)
- **User story:** US-2.3
- **Files:** `src/components/researchers/ProfileForm.tsx`, `src/components/researchers/TagInput.tsx`, `src/components/researchers/PublicationBlock.tsx`, `src/pages/EditProfilePage.tsx`
- **Dependencies:** T-005, T-022
- **Done when:** Form renders with name, lab select, tag input for keywords, bio textarea, repeatable publication blocks. Approval banner shown. Save submits to API (status: pending). Cancel navigates back. Validation on required fields. Add/remove publications and tags work.

### T-043: Implement profile edit button states
- **User story:** US-5.2
- **Files:** `src/pages/ProfilePage.tsx` (update)
- **Dependencies:** T-040, T-042
- **Done when:** Own profile: "Modifier" button active and navigates to edit form. Other's profile: "Modifier" button disabled with lock icon and tooltip. Not logged in: "Modifier" button hidden. Submitted profile appears in admin pending list.

### T-044: Write feature tests for M4
- **User story:** US-5.1, US-5.2, US-2.3
- **Files:** `tests/features/FT-013-*.test.js` through `FT-016-*.test.js`, `tests/e2e/tests/ft-013.js` through `ft-016.js`
- **Dependencies:** T-040 through T-043
- **Done when:** All Playwright tests pass for login, logout, profile form, and edit button states.

---

## Phase 5: M5 — Administration (US-4.1, US-4.2, US-4.3, US-4.4)

### T-050: Build AdminPanel with tab navigation
- **User story:** US-4.1, US-4.2, US-4.3, US-4.4 (shared)
- **Files:** `src/components/admin/AdminPanel.tsx`, `src/pages/AdminPage.tsx`
- **Dependencies:** T-040
- **Done when:** Admin panel renders with sub-nav tabs (Utilisateurs, Import, Parametres, Logs, Profils en attente). Only accessible when logged in as admin. Redirects to login otherwise.

### T-051: Build UserManagement component
- **User story:** US-4.1
- **Files:** `src/components/admin/UserManagement.tsx`, `src/components/admin/PendingProfiles.tsx`
- **Dependencies:** T-050
- **Done when:** User table with name, email, role badge, status badge, Modifier/Revoquer buttons. Invite button opens form. Pending profiles tab shows Approve/Reject buttons. Actions call real API. Self-revoke prevention.

### T-052: Build BulkImport component
- **User story:** US-4.2
- **Files:** `src/components/admin/BulkImport.tsx`, `src/lib/csv-parser.ts`
- **Dependencies:** T-050
- **Done when:** Drag-and-drop upload zone accepts CSV/Excel files. Papa Parse / SheetJS parse client-side. Preview table shows parsed data. Google Scholar URL input fetches via edge function. Confirm button imports records. Error states for invalid format and unreachable Scholar.

### T-053: Build AppSettings component
- **User story:** US-4.3
- **Files:** `src/components/admin/AppSettings.tsx`, `src/hooks/useSettings.ts`
- **Dependencies:** T-050
- **Done when:** Language radio buttons, similarity slider with live value display, NLP algorithm dropdown. Save button persists to API. Unsaved changes prompt on navigation. Edge case: 0.0 threshold warning.

### T-054: Build AuditLogs component
- **User story:** US-4.4
- **Files:** `src/components/admin/AuditLogs.tsx`, `src/hooks/useAuditLogs.ts`
- **Dependencies:** T-050
- **Done when:** Table with date, user, action tag (color-coded), detail. Date range filter. Pagination (50 per page). Empty state for no results. Error state for API failure.

### T-055: Write feature tests for M5
- **User story:** US-4.1, US-4.2, US-4.3, US-4.4
- **Files:** `tests/features/FT-017-*.test.js` through `FT-021-*.test.js`, `tests/e2e/tests/ft-017.js` through `ft-021.js`
- **Dependencies:** T-050 through T-054
- **Done when:** All Playwright tests pass for admin panel, user management, import, settings, and logs.

---

## Phase 6: Accessibility & Cross-cutting

### T-060: Implement keyboard navigation
- **User story:** US-A11Y-001
- **Files:** All components (audit/fix tabindex, focus order)
- **Dependencies:** T-055
- **Done when:** Tab/Shift+Tab traverse all interactive elements in logical order on every screen. Enter/Space activates focused elements.

### T-061: Implement focus management
- **User story:** US-A11Y-002
- **Files:** All page components (focus on navigation), modal/popover components (focus trap)
- **Dependencies:** T-060
- **Done when:** Screen changes move focus to heading. Modals trap focus. Closing modal returns focus to trigger.

### T-062: Implement Escape key dismissal
- **User story:** US-A11Y-003
- **Files:** `UserDropdown.tsx`, `ClusterPopover.tsx`, `ConfirmDialog.tsx`
- **Dependencies:** T-060
- **Done when:** Escape closes all popovers, dropdowns, and dialogs.

### T-063: Add ARIA labels
- **User story:** US-A11Y-004
- **Files:** All components
- **Dependencies:** T-060
- **Done when:** All buttons, links, inputs have `aria-label` or visible label. Stat cards announce full context. Gauge announces percentage. Map SVG has descriptive `aria-label`.

### T-064: Write accessibility tests
- **User story:** US-A11Y-001 through US-A11Y-004
- **Files:** `tests/features/FT-022-*.test.js` through `FT-025-*.test.js`, `tests/e2e/tests/ft-022.js` through `ft-025.js`
- **Dependencies:** T-060 through T-063
- **Done when:** All Playwright accessibility tests pass (keyboard nav, focus management, escape, ARIA).

---

## Phase 7: CI/CD & Deployment

### T-070: Set up GitHub Actions CI
- **Files:** `.github/workflows/ci.yml`
- **Dependencies:** T-064
- **Done when:** On push: lint, Vitest, Playwright tests, build. Fails on any red.

### T-071: Configure Vercel deployment
- **Files:** `vercel.json`
- **Dependencies:** T-070
- **Done when:** `git push` to main triggers Vercel deploy. Preview URLs on PRs. Environment variables configured.
