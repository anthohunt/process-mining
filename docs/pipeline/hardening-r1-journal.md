# Quality Hardening — Round 1 Journal

## Timeline

| Time | Event |
|------|-------|
| 2026-04-14 | Round 1 started. 4 auditors dispatched: Performance, Stability, Accessibility, Security |

---
## Security Auditor — 2026-04-14

**Task #4 completed.** Full security audit of source code and build configuration.

### Key Findings
1. **CRITICAL** — `.env.local` contains real production credentials (Postgres password, service role key, JWT secret, OIDC token). File is gitignored but exists on disk. Rotate all credentials.
2. **HIGH** — Admin role stored in user-writable `user_metadata` (not `app_metadata`) across all 4 API route files. Any user can escalate to admin via Supabase anon key.
3. **HIGH** — No route-level authentication guard in React Router. `/admin` shows only a UI message to non-admins; unauthenticated users can reach the page shell.
4. **HIGH** — 13 npm CVEs (6 high): undici (HTTP smuggling, DoS), path-to-regexp (ReDoS), minimatch (ReDoS), esbuild/vite (dev CORS bypass), ajv (ReDoS), smol-toml (DoS).
5. **MEDIUM** — No security headers in `vercel.json` (no CSP, HSTS, X-Frame-Options).
6. **MEDIUM** — No rate limiting on `/api/admin/import` — unlimited rows accepted per request.
7. **LOW** — Audit logs hardcode `user_name: 'Admin'` instead of real user identity.
8. **LOW** — Demo credentials (`demo123456`) hardcoded in client-side JS, visible to anyone.

**Report:** `docs/pipeline/hardening-r1-security-report.md`

---
## Stability Auditor — 2026-04-14

**Task #2 completed.** Full source code stability audit (25+ files). Live Playwright browser testing was blocked — Chromium browser instance was concurrently locked by other audit agents throughout the session.

### Key Findings
1. **HIGH** — `EditProfilePage` save button: double-click race condition before React re-render disables it. Two concurrent saves can corrupt publications (double-delete/double-insert). Fix: ref guard.
2. **HIGH** — CSV import parser (`useAdminImport.ts:33`) splits on `,` without handling quoted fields. Names with commas silently import into wrong columns.
3. **HIGH** — `AdminPage` toast `setTimeout` never cleared on unmount. Memory leak per toast.
4. **HIGH** — `authStore.onAuthStateChange` listener never unsubscribed. Accumulates listeners across HMR, ghost listeners in tests.
5. **HIGH** — `useResearchers.ts:fetchResearcherList` fetches ALL publications for ALL researchers unconditionally. OOM risk with large datasets.
6. **MEDIUM** — AdminPage toast queue bug: `prev.slice(1)` always removes the oldest toast, not the expired one. Wrong toast dismissed on overlap.
7. **MEDIUM** — MapPage cluster popover: lazy Supabase fetch has no cancellation/timeout; shows infinite spinner if DB hangs.
8. **MEDIUM** — `useStats.ts:fetchStats` silently swallows per-query errors (shows 0 instead of error state).
9. **MEDIUM** — `PendingTab`: global `approve.isPending`/`reject.isPending` freezes ALL rows' buttons during any single mutation.
10. **LOW** — `authStore.ts`: fetch interceptor in App.tsx doesn't clone response before returning — fragile but currently safe.

**Report:** `docs/pipeline/hardening-r1-stability-report.md`

---
## Accessibility Auditor — 2026-04-14

**Task #3 completed.** Full static source code accessibility audit (all 25 component/page files + index.css). Live Playwright axe-core scan was blocked — Chromium browser locked by concurrent audit agents throughout the session.

### Key Findings
1. **CRITICAL** — SVG map (`MapPage`) is completely inaccessible to keyboard users. Researcher dots have `role="button"` but no `tabIndex`. Cluster circles have no role, label, or keyboard handler. 100% of map interactivity is mouse-only.
2. **CRITICAL** — Modal dialogs (AdminPage unsaved-changes, UsersTab invite) have no focus trap. Tab escapes the modal into background content.
3. **CRITICAL** — Map popovers have no keyboard dismiss (Escape) and no focus management on open.
4. **CRITICAL** — Two nested `<nav aria-label="Navigation principale">` elements (same label) — screen readers announce duplicate landmarks.
5. **HIGH** — `btn-primary` (#ffffff on #0d6efd) fails WCAG AA contrast: 3.06:1. Affects all primary CTAs (Login, Save, Approve, etc.).
6. **HIGH** — `tag-blue`/`badge-admin` (#0d6efd on #e7f1ff): 3.1:1 — fails at 12px.
7. **HIGH** — `tag-orange`/`badge-pending` (#997404 on #fff3cd): 3.1:1 — fails at 12px.
8. **HIGH** — `tag-cyan` (#0a7d8c on #cff4fc): 2.9:1 — fails at 12px.
9. **HIGH** — `--pm-text-muted` (#6c757d on white): 4.48:1 — fails at 13px (needs 4.5:1 minimum).
10. **HIGH** — `UserDropdown` menu opens without moving focus into it — keyboard users cannot reach menu items.
11. **MEDIUM** — No skip-to-content link. Keyboard users must Tab through all 6+ nav items every page.
12. **MEDIUM** — SVG charts (StatsPage) wrapped in `role="img"` only — data completely inaccessible to screen readers.
13. **MEDIUM** — Spinner and highlighted-researcher pulse animation have no `prefers-reduced-motion` media query.
14. **MEDIUM** — Stat-grid (4-col), two-col, comparison-layout have no responsive reflow at 200% zoom.
15. **MEDIUM** — Duplicate-keyword error auto-dismisses in 2 seconds — too short for AT users.

**Report:** `docs/pipeline/hardening-r1-a11y-report.md`

---
## Stability Evaluator — 2026-04-14

**Task #6 completed.** Evaluated the Stability Audit report against the actual source code.

### Verdict: PASS — Score 4/5

- **Fabrication check:** 5 findings sampled against source code — all confirmed accurate at the exact file:line cited. No fabrication detected.
- **Coverage:** 5 of 6 required audit areas covered. Viewport stress testing entirely absent (not mentioned anywhere in the report).
- **Depth:** All findings include file:line, precise failure mode, and proposed fix. Two findings correctly identified fragile-but-safe code paths and honestly marked them as no-fix-needed.
- **Limitation disclosure:** Honest and accurate — Playwright browser lock was a real constraint; auditor adapted with thorough static analysis.
- **Notable gap:** No viewport stress analysis (responsive layout breakage, overflow at narrow widths).

**Eval report:** `docs/pipeline/hardening-r1-stability-eval.md`

---
## Accessibility Evaluator — 2026-04-14

**Task #7 completed.** Evaluated the Accessibility Audit report against actual source code and independently recalculated contrast ratios.

### Verdict: PASS — Score 4/5

- **Tool usage:** Auditor correctly disclosed Playwright was unavailable. Static analysis substitution is honest and clearly labeled. No fake axe results.
- **Coverage:** All 5 required areas covered (automated scan approximation, keyboard, screen reader, contrast, motion/zoom).
- **Fabrication check:** 9 findings spot-checked against source — all structural findings confirmed at exact file:line:
  - MapPage researcher dots: `role="button"` confirmed, `tabIndex` confirmed absent (MapPage.tsx ~471)
  - Cluster circles: no role/tabIndex/aria-label confirmed (MapPage.tsx ~407-420)
  - Map popovers: no Escape handler or focus management confirmed (MapPage.tsx ~516-591)
  - Modal focus traps: confirmed absent in AdminPage.tsx:131-154 and UsersTab.tsx:209-249
  - Nested nav landmarks: confirmed identical labels at AppNavbar.tsx:29,39
  - Auto-dismiss 2s timeout: confirmed at EditProfilePage.tsx:105
  - DashboardPage card-title div: confirmed not a heading at DashboardPage.tsx:18
  - ResearchersPage aria-label mismatch: confirmed at ResearchersPage.tsx:30,32
  - StatsPage charts with role="img" only: confirmed at StatsPage.tsx:86,159,217
- **Contrast ratio errors:** Several contrast ratios were computed incorrectly. Independently verified:
  - `--pm-text-muted` on white: report says 4.48:1 (FAIL), actual is **4.69:1 (PASS)**. The finding is a false positive for white background use.
  - `btn-primary` white on #0d6efd: report marks as "Critical" FAIL at 3.06:1, actual is **~4.50:1 (borderline PASS)**. Most significant error in the report.
  - tag-blue, tag-orange, tag-cyan: ratios wrong by 0.5–1.3 points, but all still fail 4.5:1 threshold — failure direction is correct.
- **Notable gap:** Invite dialog `autoFocus` on first input is a partial mitigation for focus-trap issue not noted in the report.

**Eval report:** `docs/pipeline/hardening-r1-a11y-eval.md`

---
## Security Evaluator — 2026-04-14

**Task #8 completed.** Evaluated the Security Audit report against actual source code and live `npm audit`.

### Verdict: PASS — Score 5/5

- **Tool usage:** `npm audit` output in report independently confirmed — exact 13 CVEs, packages, severities, and version ranges match live output. No fabrication.
- **Coverage:** All 6 required areas covered (dependency audit, XSS/injection, secrets, config, external API, build output).
- **Fabrication check:** 5 findings sampled against source:
  - `user_metadata` role escalation (users.ts:22, import.ts:15, profiles.ts:21, settings.ts:15) — confirmed
  - No route guard for /admin (App.tsx:51, AdminPage.tsx:30) — confirmed
  - No security headers in vercel.json — confirmed (only rewrites key present)
  - Demo credentials hardcoded (LoginPage.tsx:59-60) — confirmed
  - Audit log `user_name: 'Admin'` hardcoded (import.ts:61, profiles.ts:70,83, settings.ts:86) — confirmed
- **Line number accuracy:** Mostly accurate; minor drift of ±4 lines in a couple places (not fabrication).
- **Depth:** All findings include file:line, OWASP category, code snippet, and concrete remediation. Nuance noted (anon key exposure is expected by design; Supabase parameterized queries reduce SQL injection risk).
- **Minor gaps:** No explicit check of CORS on API routes; no Content-Type validation check. Not disqualifying.

---
## Performance Auditor — 2026-04-14

**Task #1 completed.** Full performance audit: Vite build analysis, Core Web Vitals across 7 screens, FPS profiling, network request tracing, and 3-cycle memory leak endurance test.

### Key Findings
1. **CRITICAL** — Single 609 kB JS bundle (177 kB gzip). No code splitting. All 9 page components statically imported in `App.tsx`. Vite itself warns. Fix: `React.lazy()` per route.
2. **HIGH** — `import * as d3 from 'd3'` in `MapPage.tsx:4` disables tree-shaking — entire d3 library bundled even though only force simulation primitives are used.
3. **HIGH** — `useResearchers.ts:71` fetches ALL publications unconditionally (no WHERE clause) on every researcher list load to compute counts client-side. Full table scan scales with O(publications).
4. **HIGH** — `useStats.ts:58` fetches ALL similarity scores with no limit. Grows O(N²) with researcher count. At 500 researchers = 124,750 rows per page visit.
5. **MEDIUM** — Dashboard fires 3 redundant HEAD count queries (researchers, clusters, publications) not shared with child component queries. Should be a single RPC call.
6. **MEDIUM** — Client-side text/theme search filters (`useResearchers.ts:54-68`) applied after fetching full researcher list — server-side filtering would reduce transfer.
7. **LOW** — Google Fonts (Poppins) loaded via external CDN on every page — 4 requests, no `font-display: swap` guard, potentially render-blocking on cold load.
8. **NO LEAK** — Memory stable across 3 full journey cycles (10–22 MB range, no upward trend). GC reclaims effectively between navigations.

### CWV Summary (local dev)
- TTFB: 2–4 ms (excellent, local)
- FCP: 96–264 ms (dev server); estimated 2–3 s on 3G after code splitting
- Dashboard FCP 264 ms is worst screen — most concurrent fetches on load
- FPS on MapPage: 60 fps at idle

**Report:** `docs/pipeline/hardening-r1-perf-report.md`

**Eval report:** `docs/pipeline/hardening-r1-security-eval.md`

---
## Performance Evaluator — 2026-04-14

**Task #5 completed.** Evaluated the Performance Audit report against the actual source code and build config.

### Verdict: PASS — Score 4/5

- **Tool usage:** Build output confirmed genuine — exact file hashes, module count (761), build time (1.88s), and Vite warning present. Playwright measurements include navigation timing for 7 routes, FPS (60fps/3s MapPage), heap data across 3 cycles, and API network trace. Honest disclosure that all CWV was dev-server-only (not production build).
- **Coverage:** All 6 required areas covered (Bundle Analysis, Core Web Vitals, Runtime Profiling, Network Efficiency, Memory Leaks, Diagnosis).
- **Fabrication check:** All 4 key findings verified against source:
  - App.tsx:1-13 — 9 static imports, no React.lazy — **confirmed**
  - MapPage.tsx:4 — `import * as d3 from 'd3'` — **confirmed exact line**
  - useResearchers.ts:71 — full publications fetch, no WHERE clause — **confirmed**
  - useStats.ts:58 — unbounded `similarity_scores` select — **confirmed**
- **Depth:** Issue table complete with severity, measured value, target, file:line, root cause, and fix for all 9 issues. O(N²) scaling analysis is mathematically correct.
- **Gap:** CWV/runtime profiling done on dev server only, not production build. Production numbers for FCP and bundle parse time were estimated, not measured.

**Eval report:** `docs/pipeline/hardening-r1-perf-eval.md`
