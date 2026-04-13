# Project Memory — Process Mining Research Cartography

**Concept:** Bilingual (FR/EN) web app for mapping the process mining research landscape — researchers, themes, clusters, publications — with interactive SVG cartography, profile management, and admin tools. Inspired by processmining.org.

**Architecture:** 11 screens + login system. Vite + React + TypeScript frontend, Supabase backend (PostgreSQL + Auth + Edge Functions), D3.js for map/charts, deployed on Vercel.

**M1 complete** (commit 87ddd14, pushed). Full scaffold + Dashboard with StatGrid, ActivityFeed, MiniMap. 44 exploration screenshots, 18 passing Playwright regression tests. 7-table Supabase schema deployed with seed data.

**Git remote:** GitHub — https://github.com/anthohunt/process-mining (pushOnEpic: true)

**Deployment:** Vercel (account: anthonyjameshunt-4034, project: process-mining). Supabase resource: supabase-citrine-saddle (us-east-1, Free plan). 17 env vars synced to .env.local.

**Next:** M2 — Researchers & Profiles (US-2.1, US-2.2, US-2.4, US-2.5). Searchable list, profiles, comparison, map navigation.

**Roadmap:** M1 done, M2-M5 remaining. M2: Researchers & Profiles, M3: Map & Themes + Stats, M4: Auth & Profile Mgmt, M5: Administration.

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
