# Project Memory — Process Mining Research Cartography

**Concept:** Bilingual (FR/EN) web app mapping the process mining research landscape — researchers, themes, clusters, publications — with interactive SVG cartography, profile management, and admin tools.

**Architecture:** 11 screens + login. Vite + React 18 + TypeScript, Supabase backend (PostgreSQL + Auth + Edge Functions), D3.js for map/charts, deployed on Vercel. Code-split via React.lazy (18 chunks).

**Git remote:** https://github.com/anthohunt/process-mining
**Deployment:** Vercel (process-mining.vercel.app). Supabase: supabase-citrine-saddle (us-east-1, Free).

**Milestones:** M1 (Dashboard), M2 (Researchers & Profiles), M3 (Thematic Map & Stats), M4 (Auth & Profile Management), M5 (Administration). All deployed.

**Step 5 — Hardening:** 1 round. 51 issues found (6C/17H/17M/11L), 22 fixed. Key fixes: code splitting, keyboard-accessible SVG map, focus traps on modals, PrivateRoute auth guard, app_metadata role check, d3 tree-shaking, scoped data fetching, WCAG contrast, RFC-4180 CSV parser, double-click guard, auth listener cleanup. 90/90 E2E tests passing.

**Step 6 — Reconciliation:** 14 unchanged, 10 modified, 0 new, 0 removed stories. All 24 user stories (20 feature + 4 a11y) delivered. M5 admin stories lack E2E tests.

**Key decisions:** Supabase for auth/DB/API. D3.js for conceptual map (not geographic). Universal login (researchers + admins). Profile approval workflow. Admin role in app_metadata. Demo mode with hardcoded credentials.

**Deferred:** 17 medium + 11 low issues from hardening (CSP headers, rate limiting, skip-link, chart SR access, responsive reflow, npm CVEs in undici).

**Data:** 105 real researchers, 5 clusters, 7 Supabase tables with seed data.
