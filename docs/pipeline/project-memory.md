# Project Memory — Process Mining Research Cartography

**Concept:** Bilingual (FR/EN) web app for mapping the process mining research landscape — researchers, themes, clusters, publications — with interactive SVG cartography, profile management, and admin tools. Inspired by processmining.org.

**Architecture:** 11 screens + login system. Vite + React + TypeScript frontend, Supabase backend (PostgreSQL + Auth + Edge Functions), D3.js for map/charts, deployed on Vercel.

**Kit status:** Spec, plan, tasks, rules verified. 25 feature tests registered. 5 milestone use-case documents with happy paths and edge cases approved.

**Git remote:** GitHub — https://github.com/anthohunt/process-mining (pushOnEpic: true)

**Deployment:** Vercel (account: anthonyjameshunt-4034, project: process-mining). Supabase resource: supabase-citrine-saddle (us-east-1, Free plan). 17 env vars synced to .env.local including VITE_-prefixed client vars.

**Skipped features:** None — Supabase provisioning completed in Step 3 (was previously deferred).

**Roadmap:** 5 milestones approved. M1: Dashboard, M2: Researchers & Profiles, M3: Map & Themes + Stats, M4: Auth & Profile Mgmt, M5: Administration. All milestones user-testable. Phase 0 scaffolding bundled into M1.

**Key Decisions:**
- Bilingual FR/EN via i18next
- Universal login (researchers + admins), not admin-only
- Profile approval workflow (researcher submits, admin approves)
- Researchers can only edit own profile
- Supabase for auth/DB/API, Vite + React + TypeScript
- D3.js for cluster map and charts
- Design inspired by processmining.org (Poppins, blue primary, dark navy hero)
