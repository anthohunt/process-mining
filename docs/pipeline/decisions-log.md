# Decisions Log — Process Mining Research Cartography

Compiled from Step 5 quality hardening artifacts (Round 1).

---

## Architecture & Performance

### D1. Code splitting via React.lazy (C2)
**Decision:** Changed all 9 page imports from static to `React.lazy()` with `<Suspense>` fallback.
**Why:** Single 609 kB JS bundle forced every user to download the entire app on first visit. Vite emitted a warning. MapPage alone (105 kB) + d3 (~560 kB) were loaded even for dashboard-only visits.
**Result:** 18 separate chunks. Largest app chunk (MapPage) is 59 kB. Vendor bundle 477 kB (React + d3 — expected).
**Trade-off:** Added `<LoadingSpinner>` flash on first route navigation. Acceptable UX trade-off for ~10x smaller initial load.

### D2. Named d3 imports for tree-shaking (H4)
**Decision:** Changed `import * as d3 from 'd3'` to named imports (`zoom`, `select`, `zoomIdentity`, etc.).
**Why:** Wildcard import disabled tree-shaking — entire d3 library (~560 kB unminified) was bundled even though only force simulation and zoom primitives were used.
**Result:** Only used d3 modules included in the MapPage chunk.

### D3. Scoped publications fetch (H5/H11)
**Decision:** Added `.in('researcher_id', filteredIds)` to scope the publications query.
**Why:** Fetched ALL publications unconditionally on every researcher list load — O(publications) full table scan. With 105 researchers this was ~500 rows; at scale (10K researchers) this would OOM the browser tab.
**Result:** Publications fetch now scoped to displayed researchers only. Skipped entirely if filteredIds is empty.

### D4. Bounded similarity scores fetch (H6)
**Decision:** Added `.limit(10000)` safety cap to `similarity_scores` select in useStats.
**Why:** Similarity scores grow O(N^2) with researcher count. 500 researchers = 124,750 rows per page visit. At current scale (105 researchers) this is ~5,460 rows — manageable but growing.
**Trade-off:** 10K limit means the histogram is approximate for very large datasets. Server-side histogram via Postgres function would be ideal but deferred.

---

## Security

### D5. Admin role moved to app_metadata (H1)
**Decision:** Changed `user.user_metadata?.role` to `user.app_metadata?.role` in all 4 API endpoint files.
**Why:** `user_metadata` is user-writable via the Supabase client SDK. Any authenticated user could escalate to admin by calling `supabase.auth.updateUser({ data: { role: 'admin' } })` with the public anon key.
**Impact:** Requires Supabase admin to set roles via service role key. Frontend demo buttons still work because they login as pre-configured users whose `app_metadata.role` was set during account creation.

### D6. Route-level auth guard (H2)
**Decision:** Added `PrivateRoute` component wrapping `/admin` route. Redirects to `/login` if unauthenticated. Shows `<LoadingSpinner>` while auth state loads.
**Why:** Previously, `/admin` was accessible by typing the URL directly. The `AdminPage` component checked `isAdmin` and showed a message, but the page shell rendered and the API endpoints were still callable from the dev console.
**Trade-off:** Only `/admin` is guarded. `/researchers/:id/edit` relies on the form-level check (logged-in user can only edit their own profile). A broader `PrivateRoute` was considered but deferred since all other pages are public by design.

### D7. npm CVEs partially resolved (H3)
**Decision:** Ran `npm audit fix` for non-breaking fixes. 13 remaining CVEs in `undici` (transitive dep of `@vercel/node`) were NOT fixed.
**Why:** Auto-fixing undici requires `--force` installing `@vercel/node@4.0.0` (breaking change from current `^5.7.5`). These are server-side build tool vulnerabilities, not frontend runtime risks.
**Risk accepted:** Undici CVEs affect HTTP request handling in Node.js server context. Since Vercel Edge Functions run in a separate environment, the practical risk is low. Tracked for next major version bump.

---

## Stability

### D8. Double-click save guard (H7)
**Decision:** Added `savingRef = useRef(false)` guard in EditProfilePage.handleSave.
**Why:** React batches state updates asynchronously — there's a tick between click and `setIsSaving(true)` becoming effective in the DOM. A fast double-click fires `handleSave` twice, running two concurrent Supabase updates that could corrupt publications (double-delete/double-insert).
**Alternative considered:** Debounce on the button click. Rejected because a ref guard is simpler, has zero delay, and prevents the actual function from executing rather than just delaying it.

### D9. RFC-4180 CSV parser (H8)
**Decision:** Replaced naive `line.split(',')` with a proper `parseCsvLine()` function.
**Why:** French researcher names commonly contain commas (e.g., "Dupont, Marie"). The naive split corrupted these into wrong columns — silent data corruption on import.
**Result:** New parser handles quoted fields, escaped quotes (`""`), and commas within quotes per RFC 4180.

### D10. Toast timer cleanup (H9)
**Decision:** Added `toastTimersRef` with `useEffect` cleanup in AdminPage.
**Why:** `setTimeout` in `addToast` was never cleared on unmount — mild memory leak per toast shown. In React 18 the `setToasts` call on unmounted component is a no-op, but the timer itself leaked.

### D11. Auth listener cleanup (H10)
**Decision:** Store `onAuthStateChange` subscription and return unsubscribe function from `initialize()`.
**Why:** In HMR (dev mode) or test runners, each call to `initialize()` added another listener. Ghost listeners accumulated, causing multiple `setSession` calls per auth event.

---

## Accessibility

### D12. Keyboard-accessible SVG map (C3)
**Decision:** Added `tabIndex={0}`, `onKeyDown` (Enter/Space), and `aria-label` to all researcher dot hit circles and cluster circles.
**Why:** The SVG map was 100% mouse-only. Researcher dots had `role="button"` but no `tabIndex`. Cluster circles had no role, label, or keyboard handler. This was the most severe accessibility violation in the app.
**Trade-off:** Tab order through dozens of SVG elements on a dense map is not ideal UX. A "skip to list view" link (deferred, M12 in a11y report) would provide a better keyboard alternative. But basic keyboard access is the WCAG 2.1 AA minimum.

### D13. Focus traps on modals (C4)
**Decision:** Created `useFocusTrap(active: boolean)` hook. Applied to AdminPage unsaved-changes dialog and UsersTab invite dialog.
**Why:** Tab escaped modals into background content. This is a WCAG Critical violation (2.1.2 No Keyboard Trap — trap means focus stays IN the modal, not that it can't leave).
**Implementation:** Hook focuses first focusable element on open, intercepts Tab/Shift+Tab to cycle within container, restores focus to trigger on close. Also added Escape handlers on both modal overlays.

### D14. Popover keyboard management (C5)
**Decision:** Added `popoverRef` and `popoverTriggerRef` to map popovers. Auto-focus on open, Escape to close with focus restore.
**Why:** Map cluster and disambiguation popovers opened on click with no keyboard path to dismiss or interact with them.

### D15. Duplicate nav landmark fix (C6)
**Decision:** Changed outer `<nav>` to `<header>` in AppNavbar. Inner `<nav aria-label="Navigation principale">` retained.
**Why:** Two nested `<nav>` elements with identical `aria-label` caused screen readers to announce duplicate "Navigation principale" landmarks.

### D16. WCAG contrast fixes (H12-H17)
**Decision:** Darkened multiple CSS color values:
- `--pm-primary`: `#0d6efd` -> `#0b5ed7` (tag-blue, badge-admin, btn-primary)
- `tag-orange`/`badge-pending` text: `#997404` -> `#7a5c00`
- `tag-cyan` text: `#0a7d8c` -> `#055f6a`
- `--pm-text-muted`: `#6c757d` -> `#595f68`
**Why:** All failed WCAG 4.5:1 contrast ratio at their used font sizes (12-13px). The evaluator independently verified that some reported ratios were slightly off (btn-primary was borderline 4.50:1, not 3.06:1 as reported), but all tag colors genuinely failed.
**Trade-off:** Slightly darker visual appearance. The new `--pm-primary` (#0b5ed7) matches Bootstrap's btn-primary:hover color, so it feels familiar.

### D17. UserDropdown focus management (H15)
**Decision:** Added `menuRef`, auto-focus first `[role="menuitem"]` on open, Tab trap within menu items, focus restore to trigger on close.
**Why:** Menu opened without moving focus in. Keyboard users could not reach menu items (Tab went to the next page element, skipping the dropdown entirely).

---

## Deferred Decisions (Medium/Low — not fixed in Round 1)

| # | Issue | Why deferred |
|---|---|---|
| M1 | Redundant HEAD count queries on Dashboard | Performance impact negligible at current scale |
| M4 | Toast removes wrong item (`prev.slice(1)`) | Edge case only visible with rapid sequential toasts |
| M5 | MapPage popover fetch on unmounted component | React 18 no-op; no crash |
| M7 | PendingTab global isPending freezes all rows | Functional but poor UX with multiple admins |
| M8 | No security headers in vercel.json | Medium risk; requires CSP policy design |
| M9 | No rate limit on /api/admin/import | Admin-only endpoint; abuse requires auth |
| M10 | SVG charts opaque to screen readers | Complex fix (data tables for each chart) |
| M12 | No skip-to-content link | Quality-of-life a11y improvement |
| L8 | Demo credentials in client JS | Expected for demo mode; document in runbook |
