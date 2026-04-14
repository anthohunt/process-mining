# Quality Hardening — Round 1 Consolidated Report

**Date:** 2026-04-14
**Auditors:** Performance (4/5), Stability (4/5), Accessibility (4/5), Security (5/5) — all PASS

---

## Summary

| Domain | Score | Critical | High | Medium | Low |
|--------|-------|----------|------|--------|-----|
| Performance | B | 1 | 3 | 3 | 2 |
| Stability | B | 0 | 5 | 5 | 2 |
| Accessibility | ~72% AA | 4 | 6 | 7 | 4 |
| Security | HIGH risk | 1 | 3 | 2 | 3 |
| **TOTAL** | — | **6** | **17** | **17** | **11** |

**23 Critical + High issues to fix this round. 17 medium deferred. 11 low deferred.**

---

## CRITICAL Issues (fix immediately)

| # | Domain | Issue | File | Fix |
|---|--------|-------|------|-----|
| C1 | Security | `.env.local` has production credentials on disk (Postgres password, service role key, JWT secret) | `.env.local` | Rotate all credentials. Ensure never shared. Use Vercel env dashboard exclusively. |
| C2 | Perf | Single 609 kB JS bundle — no code splitting. All 9 pages statically imported. | `src/App.tsx:1-13` | `React.lazy()` + `Suspense` per route. Vite auto-splits. |
| C3 | A11y | SVG map completely keyboard-inaccessible. Researcher dots have `role="button"` but no `tabIndex`. Cluster circles have no role/label/keyboard handler. | `src/pages/MapPage.tsx:309,414,459` | Add `tabIndex={0}`, `onKeyDown`, `aria-label` to dots and clusters. |
| C4 | A11y | Modal dialogs (AdminPage unsaved-changes, UsersTab invite) have no focus trap. Tab escapes modal. | `src/pages/AdminPage.tsx:132-155`, `src/components/admin/UsersTab.tsx:209-249` | Focus trap: move focus to first element, cycle Tab within modal, restore on close. |
| C5 | A11y | Map popovers have no keyboard dismiss (Escape). No focus management on open. | `src/pages/MapPage.tsx:516-591` | Escape handler to close, move focus into popover on open. |
| C6 | A11y | Two nested `<nav aria-label="Navigation principale">` — duplicate landmarks. | `src/components/layout/AppNavbar.tsx:29,39` | Remove outer `<nav>` or use `<header>`; differentiate labels. |

---

## HIGH Issues (fix this round)

| # | Domain | Issue | File | Fix |
|---|--------|-------|------|-----|
| H1 | Security | Admin role stored in `user_metadata` (user-writable). Any user can escalate via Supabase anon key. | `api/admin/users.ts:22`, `import.ts:16`, `profiles.ts:20`, `settings.ts:16` | Move role to `app_metadata` (service role key only). |
| H2 | Security | No route-level auth guard. `/admin` accessible without login (UI-only block). | `src/App.tsx:51`, `src/pages/AdminPage.tsx:30` | Add `PrivateRoute` redirect to `/login`. |
| H3 | Security | 13 npm CVEs (6 high): undici, path-to-regexp, minimatch, esbuild/vite, ajv, smol-toml. | `package-lock.json` | `npm audit fix`. Update `@vercel/node`. |
| H4 | Perf | `import * as d3 from 'd3'` prevents tree-shaking. Full d3 (~560 kB) bundled for one page. | `src/pages/MapPage.tsx:4` | Named imports: `import { forceSimulation, ... } from 'd3'` or d3 sub-packages. |
| H5 | Perf | Full publications table scan on every researcher list load — no WHERE clause. | `src/hooks/useResearchers.ts:71` | Add `.in('researcher_id', filteredIds)` or server-side count. |
| H6 | Perf | Unbounded `similarity_scores` fetch grows O(N^2). 500 researchers = 125K rows. | `src/hooks/useStats.ts:58` | Server-side histogram via Postgres function, or `.limit(10000)`. |
| H7 | Stability | EditProfilePage double-click race: two concurrent saves corrupt publications. | `src/pages/EditProfilePage.tsx:131-209` | Ref guard: `if (savingRef.current) return`. |
| H8 | Stability | CSV parser splits on `,` — doesn't handle quoted fields. Comma in name corrupts import. | `src/hooks/useAdminImport.ts:33` | Use `papaparse` or handle quoted CSV properly. |
| H9 | Stability | AdminPage toast `setTimeout` never cleared on unmount — memory leak per toast. | `src/pages/AdminPage.tsx:26-28` | `useEffect` cleanup to clear timeout. |
| H10 | Stability | `authStore.onAuthStateChange` listener never unsubscribed. Accumulates on HMR. | `src/stores/authStore.ts:52-58` | Store subscription, return cleanup. |
| H11 | Stability | `useResearchers` fetches ALL publications unconditionally. OOM risk with large datasets. | `src/hooks/useResearchers.ts:71-76` | Scope query with `.in('researcher_id', ids)`. |
| H12 | A11y | `tag-blue` (#0d6efd on #e7f1ff): 3.1:1 fails at 12px. Same for `badge-admin`. | `src/index.css:493,510` | Darken text to #0044cc or #0856c8. |
| H13 | A11y | `tag-orange`/`badge-pending` (#997404 on #fff3cd): 3.1:1 fails at 12px. | `src/index.css:496,512` | Darken to #7a5c00. |
| H14 | A11y | `tag-cyan` (#0a7d8c on #cff4fc): 2.9:1 fails at 12px. | `src/index.css:495` | Darken to #055f6a. |
| H15 | A11y | `UserDropdown` menu opens without moving focus in. Keyboard users can't reach items. | `src/components/auth/UserDropdown.tsx:93-118` | Move focus to first menuitem on open. Tab cycles within. |
| H16 | A11y | `--pm-text-muted` (#6c757d) on alt bg (#f8f9fa): 4.45:1 fails. On white: 4.69:1 passes. **Evaluator correction:** only fix for alt-bg usage. | `src/index.css:16` | Darken to #595f68 for uses on non-white backgrounds. |
| H17 | A11y | `btn-primary` white on #0d6efd: **evaluator notes actual ratio ~4.50:1 (borderline).** Verify before changing. Tag contrasts still fail. | `src/index.css` | Verify with tool. If fails, darken to #0055d4. |

---

## MEDIUM Issues (deferred — fix if time permits)

| # | Domain | Issue | File |
|---|--------|-------|------|
| M1 | Perf | 3 redundant HEAD count queries on Dashboard | `src/hooks/useStats.ts:13-20` |
| M2 | Perf | Client-side text/theme filtering after full fetch | `src/hooks/useResearchers.ts:54-68` |
| M3 | Perf | ~2-3s FCP on 3G (fixed by code splitting) | `src/App.tsx` |
| M4 | Stability | Toast removes wrong item — `prev.slice(1)` not the expired one | `src/pages/AdminPage.tsx:27` |
| M5 | Stability | MapPage popover fetch on unmounted component | `src/pages/MapPage.tsx:251-267` |
| M6 | Stability | useStats silently swallows per-query errors (shows 0) | `src/hooks/useStats.ts:12-20` |
| M7 | Stability | PendingTab global isPending freezes ALL rows' buttons | `src/components/admin/PendingTab.tsx:88,94` |
| M8 | Security | No security headers in vercel.json (no CSP, HSTS, X-Frame-Options) | `vercel.json` |
| M9 | Security | No rate limit on /api/admin/import — unbounded rows | `api/admin/import.ts:32` |
| M10 | A11y | SVG charts opaque to screen readers (role="img" only) | `src/pages/StatsPage.tsx:86,159,217` |
| M11 | A11y | profile-avatar-lg div has aria-label but no role="img" | `src/pages/ProfilePage.tsx:123-129` |
| M12 | A11y | No skip-to-content link | `src/components/layout/AppLayout.tsx:8` |
| M13 | A11y | Spinner/SVG pulse no `prefers-reduced-motion` query | `src/index.css` |
| M14 | A11y | stat-grid/comparison-layout no responsive reflow at 200% zoom | `src/index.css:162,718` |
| M15 | A11y | Duplicate-keyword error auto-dismisses in 2s (too short for AT) | `src/pages/EditProfilePage.tsx:104-108` |
| M16 | A11y | DashboardPage minimap title is div not h2 | `src/pages/DashboardPage.tsx:18` |
| M17 | A11y | btn-ghost no :focus-visible style | `src/index.css:569-573` |

---

## LOW Issues (skip this round)

| # | Domain | Issue |
|---|--------|-------|
| L1 | Perf | Google Fonts (4 requests, no font-display, render-blocking on cold load) |
| L2 | Perf | Client-side researcher search filtering (could be server-side ilike) |
| L3 | Stability | Fetch interceptor doesn't clone response (safe but fragile) |
| L4 | Stability | ComparisonPage stale similarity data in cache (correctly guarded) |
| L5 | Security | Audit logs hardcode `user_name: 'Admin'` |
| L6 | Security | vite.config.ts no explicit `sourcemap: false` |
| L7 | Security | CSV import no field sanitization (Supabase parameterized, low risk) |
| L8 | Security | Demo credentials hardcoded in client JS |
| L9 | A11y | Explorer button aria-label/visible text mismatch |
| L10 | A11y | No autocomplete on EditProfilePage keyword input |
| L11 | A11y | ActivityFeed button loses surrounding sentence context |
