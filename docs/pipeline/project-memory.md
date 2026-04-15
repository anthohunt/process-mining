# Project Memory — Process Mining Research Cartography

**Concept:** Bilingual (FR/EN) web app mapping the process mining research landscape — researchers, themes, clusters, publications — with interactive Three.js WebGL cartography, profile management, and admin tools.

**Architecture:** 11 screens + login. Vite + React 18 + TypeScript, Supabase backend (PostgreSQL + Auth + Edge Functions), D3.js for statistics charts only, Three.js for map/minimap/thumbnails, deployed on Vercel. Code-split via React.lazy (18 chunks).

**Git remote:** https://github.com/anthohunt/process-mining
**Deployment:** Vercel (process-mining-six.vercel.app). Supabase: supabase-citrine-saddle (us-east-1, Free).

**Milestones:** M1 (Dashboard), M2 (Researchers & Profiles), M3 (Thematic Map & Stats), M4 (Auth & Profile Management), M5 (Administration). All deployed.

**Step 5 — Hardening Round 1:** 51 issues found (6C/17H/17M/11L), 22 fixed. Key fixes: code splitting, keyboard-accessible SVG map, focus traps on modals, PrivateRoute auth guard, app_metadata role check, d3 tree-shaking, scoped data fetching, WCAG contrast, RFC-4180 CSV parser, double-click guard, auth listener cleanup. 90/90 E2E tests passing.

**Post-M5 Three.js rewrite (commits e7141f9, a71d4bf):** D3 SVG map on MapPage replaced with Three.js floating-nebula scene (clusters as glowing spheres, researchers as particle dots, OrbitControls, camera fly-to, slide-in side panel). Dashboard MiniMap upgraded from SVG to Three.js nebula preview. ThemesPage cluster cards got Three.js ClusterThumbnail component. SVG-based keyboard map navigation was removed.

**Step 5 — Hardening Round 2 (commit d787255):** Production audit on deployed Three.js app. 3C/10H/8M/4L found. All C+H fixed: WebGL context loss handler (C2), fr.json i18n fix (C3), security headers in vercel.json (H8), import API field validation (H9), @vercel/node CVEs already resolved (H10), i18n fixes across UsersTab/ImportTab/PendingTab/ProfilePage/SettingsTab (H4-H7, M3), responsive map height/filter panel (H2-H3), asset cache headers (M1), invalid UUID → 404 (M2). C1 (credential rotation) is OUTSTANDING — requires user action via Supabase + Vercel dashboards.

**Step 6 — Reconciliation:** 11 unchanged, 13 modified, 0 new, 0 removed stories. All 24 user stories (20 feature + 4 a11y) delivered. Modified count increased from 10→13 due to Three.js rewrites of US-1.3, US-3.4, and reclassification of US-A11Y-001 (map keyboard nav degraded by rewrite).

**Key decisions:** Supabase for auth/DB/API. Three.js for visual map (not geographic). D3.js retained for statistics charts. Universal login (researchers + admins). Profile approval workflow. Admin role in app_metadata. Demo mode with hardcoded credentials.

**Deferred:** Map keyboard accessibility (Three.js particles are not DOM-focusable), chart SR accessibility, skip-to-content link, medium/low security items. C1 credential rotation requires user action.

**Data:** 105 real researchers, 5 clusters, 7 Supabase tables with seed data.
