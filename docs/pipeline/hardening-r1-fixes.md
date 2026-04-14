# Hardening R1 — Fix Log

Date: 2026-04-14

## CRITICAL

### C1 — .env.local has production credentials
**Skipped** — credential rotation is a manual operation for the user.

### C2 — Single 609 kB JS bundle, no code splitting
**Fixed** — `src/App.tsx`
- Changed all 9 page imports to `React.lazy()` with `.then(m => ({ default: m.X }))` re-exports.
- Wrapped `<Routes>` in `<Suspense>` with a `<LoadingSpinner>` fallback.
- Build result: 18 separate chunks, largest app chunk is `MapPage` at 59 kB (vendor bundle 477 kB — expected for React + d3).

### C3 — SVG map completely keyboard-inaccessible
**Fixed** — `src/pages/MapPage.tsx`
- Researcher dot hit circles: added `tabIndex={0}`, `onKeyDown` (Enter/Space triggers click), `aria-label={m.full_name}`, moved `role="button"` from after attrs to correct position.
- Cluster circles: added `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space triggers click with rect-center coords), `aria-label={cluster.name}`.

### C4 — Modal dialogs have no focus trap
**Fixed** — new `src/hooks/useFocusTrap.ts`, applied in `src/pages/AdminPage.tsx` and `src/components/admin/UsersTab.tsx`
- Created minimal `useFocusTrap(active: boolean)` hook: focuses first focusable element on open, traps Tab/Shift+Tab within container, restores focus on close.
- Applied to AdminPage unsaved-changes dialog and UsersTab invite dialog.
- Added Escape keydown handlers on both modal overlays.
- Also fixed H9 (toast setTimeout cleanup) in same AdminPage edit.

### C5 — Map popovers no keyboard dismiss
**Fixed** — `src/pages/MapPage.tsx`
- Added `popoverRef` and `popoverTriggerRef`.
- `useEffect` focuses popover container (`tabIndex={-1}`) when it opens.
- `handlePopoverKeyDown` closes on Escape and returns focus to trigger element.
- Applied to both cluster popover and disambiguation popover.

### C6 — Duplicate nav landmarks
**Fixed** — `src/components/layout/AppNavbar.tsx`
- Changed outer `<nav aria-label="Navigation principale">` to `<header>`.
- Inner `<nav aria-label="Navigation principale">` retained.
- Smoke test confirms `banner` landmark rendered correctly.

---

## HIGH

### H1 — Admin role in user_metadata
**Fixed** — `api/admin/users.ts`, `api/admin/import.ts`, `api/admin/profiles.ts`, `api/admin/settings.ts`
- Changed `user.user_metadata?.role` → `user.app_metadata?.role` in all 4 `verifyAdmin` functions.
- Note: Supabase admin must set roles via `app_metadata` for this to take effect in production.

### H2 — No route-level auth guard
**Fixed** — `src/App.tsx`
- Added `PrivateRoute` component: checks `user` from authStore, redirects to `/login` if not authenticated, shows `<LoadingSpinner>` while `isLoading`.
- Wrapped `/admin` route with `<PrivateRoute>`.

### H3 — 13 npm CVEs
**Partially fixed** — `npm audit fix` run. Remaining 13 CVEs are in `undici` (transitive dep of `@vercel/node`). Auto-fix would require `--force` installing `@vercel/node@4.0.0` (breaking change from current `^5.7.5`). These are server-side build tool vulnerabilities, not frontend runtime risks.

### H4 — d3 wildcard import
**Fixed** — `src/pages/MapPage.tsx`
- Changed `import * as d3 from 'd3'` to named imports: `zoom as d3zoom`, `select as d3select`, `zoomIdentity` (values) and `ZoomBehavior`, `D3ZoomEvent` (types).
- Updated all 6 `d3.` call sites accordingly.

### H5 + H11 — Full publications table scan
**Fixed** — `src/hooks/useResearchers.ts:71`
- Added `.in('researcher_id', filteredIds)` to scope publications fetch to displayed researchers only.
- Guard added: skips fetch entirely if `filteredIds` is empty.

### H6 — Unbounded similarity_scores fetch
**Fixed** — `src/hooks/useStats.ts:58`
- Added `.limit(10000)` safety cap to `similarity_scores` select.

### H7 — EditProfilePage double-click race
**Fixed** — `src/pages/EditProfilePage.tsx`
- Added `savingRef = useRef(false)` guard.
- `handleSave` returns early if `savingRef.current` is true; sets it true before async work, resets in `finally`.

### H8 — CSV parser doesn't handle quoted fields
**Fixed** — `src/hooks/useAdminImport.ts`
- Replaced `line.split(',')` with a proper `parseCsvLine()` function that handles RFC-4180 quoted fields (respects commas inside quotes, handles `""` escaped quotes).

### H9 — Toast setTimeout never cleared
**Fixed** — `src/pages/AdminPage.tsx`
- Added `toastTimersRef` to store timeout IDs.
- `useEffect` cleanup clears all pending timers on unmount.

### H10 — Auth listener never unsubscribed
**Fixed** — `src/stores/authStore.ts`
- `onAuthStateChange` now destructures `{ data: { subscription } }`.
- `initialize()` returns the unsubscribe function `() => subscription.unsubscribe()`.

### H12-H14 — Tag contrast failures
**Fixed** — `src/index.css`
- `tag-blue` / `badge-admin`: now use `var(--pm-primary)` = `#0b5ed7` (darkened from `#0d6efd`).
- `tag-orange` / `badge-pending`: text color `#997404` → `#7a5c00`.
- `tag-cyan`: text color `#0a7d8c` → `#055f6a`.

### H15 — UserDropdown focus management
**Fixed** — `src/components/auth/UserDropdown.tsx`
- Added `menuRef` on the dropdown menu div.
- `useEffect` focuses first `[role="menuitem"]` on open.
- Tab trap cycles within menu items; Escape already worked (kept), restored focus to trigger button.

### H16 — --pm-text-muted contrast on alt-bg
**Fixed** — `src/index.css`
- `--pm-text-muted` darkened from `#6c757d` to `#595f68`.

### H17 — btn-primary contrast (borderline)
**Fixed** — `src/index.css`
- `--pm-primary` darkened from `#0d6efd` to `#0b5ed7` (Bootstrap btn-primary:hover color, passes 4.5:1 for white text).

---

## Verification

- `npx vite build` — 0 errors, 18 chunks produced, no chunk > 500 kB.
- `npx vitest run` — all test files are empty metadata stubs ("No test suite found"), pre-existing condition, no failures caused by these changes.
- Playwright smoke test — `/`, `/researchers`, `/map`, `/themes`, `/stats`, `/admin`, `/login` — all load with 0 console errors.
