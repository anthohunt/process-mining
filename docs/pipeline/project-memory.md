# Project Memory — Process Mining Research Cartography

**Concept:** Bilingual (FR/EN) web app for mapping the process mining research landscape — researchers, themes, clusters, publications — with interactive SVG cartography, profile management, and admin tools. Inspired by processmining.org.

**Architecture:** 11 screens + login system. Vite + React + TypeScript frontend, Supabase backend (PostgreSQL + Auth + Edge Functions), D3.js for map/charts, deployed on Vercel.

**M1 complete** (commit 87ddd14). Full scaffold + Dashboard with StatGrid, ActivityFeed, MiniMap. 44 exploration screenshots, 18 passing Playwright regression tests. 7-table Supabase schema deployed with seed data.

**M2 complete** (commit 25129c5, deployed). Researcher list with search/filter (AND logic), profile view (sidebar, keywords, publications, breadcrumb), side-by-side comparison (Jaccard gauge, common themes highlighting), profile-to-map navigation (SVG viewBox centering). 61 exploration screenshots, 22 Playwright specs. Auditor caught 2 HIGH bugs (map centering not implemented, similarity error path unreachable) — both fixed in Round 2.

**Git remote:** GitHub — https://github.com/anthohunt/process-mining (pushOnEpic: true)

**Deployment:** Vercel (account: anthonyjameshunt-4034, project: process-mining). Supabase resource: supabase-citrine-saddle (us-east-1, Free plan). 17 env vars synced to .env.local.

**M3 complete** (deployed). Interactive D3 cluster map with zoom/pan, filter panel (theme+lab), legend, cluster popovers with lazy member loading (truncated at 10), researcher dots with hover tooltips and disambiguation for overlaps, theme list with expandable cards and cross-navigation, detailed statistics with bar/line/histogram D3 charts and breadcrumb. 26 Playwright specs all passing.

**Next:** M4 — Auth & Profile Management (US-5.1, US-5.2, US-2.3). Login system, profile editing, approval workflow.

**Roadmap:** M1-M3 done, M4-M5 remaining. M4: Auth & Profile Mgmt, M5: Administration.

**Known issues from M1:**
- fetchStats() returns 0 via ?? 0 instead of throwing — StatGrid error/retry unreachable under API abort
- formatRelativeTime() is FR-only — needs i18n wiring
- Supabase-js quirk: HTTP 500 parsed as data, HTTP 400 with PostgREST body triggers isError correctly
- Chromium CORS strips content-range unless access-control-expose-headers set in mocked responses

**Key Decisions:**
- Bilingual FR/EN via i18next
- Universal login (researchers + admins), not admin-only
- Profile approval workflow (researcher submits, admin approves)
- Researchers can only edit own profile
- Supabase for auth/DB/API, Vite + React + TypeScript
- D3.js for cluster map and charts
- Design inspired by processmining.org (Poppins, blue primary, dark navy hero)
