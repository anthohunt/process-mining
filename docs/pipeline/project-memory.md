# Project Memory — Process Mining Research Cartography

## Concept
Web app for mapping process mining research. Researchers enter themes, keywords, publications via structured forms. Auto-computes textual similarity (NLP) to reveal thematic proximity. Displays interactive cluster map. Bilingual FR/EN. Universal login: researchers edit own profiles (pending admin approval), admins get special panel.

## Status
Step 2 complete. Project Kit generated. Ready for Step 3 (pre-implementation).

## Sections (4 sections, 12 screens)
1. **Dashboard** (2) — Main dashboard (stats, activity, mini-map) + Detailed stats (charts)
2. **Chercheurs** (4) — List + Profile + Add/Edit form + Comparison
3. **Carte Thematique** (2) — Interactive cluster map + Explore themes list
4. **Administration** (4) — Users + Import + Settings + Logs + Pending profiles

## Milestones (5)
- M1: Setup + Dashboard (US-1.1, 1.2, 1.3)
- M2: Researchers & Profiles (US-2.1, 2.2, 2.4, 2.5)
- M3: Thematic Map & Themes (US-3.1-3.4, US-1.4)
- M4: Auth & Profile Management (US-5.1, 5.2, US-2.3)
- M5: Administration (US-4.1-4.4)

## Kit Files
spec.md, plan.md, tasks.md, rules.md, 5 use-case plans, 25 feature tests, 25 e2e scripts, registry.json

## Key Decisions
- Bilingual FR/EN via i18next
- Universal login (researchers + admins), not admin-only
- Profile approval workflow (researcher submits, admin approves)
- Researchers can only edit own profile
- Supabase for auth/DB/API, Vite + React + TypeScript
- D3.js for cluster map and charts
- Design inspired by processmining.org (Poppins, blue primary, dark navy hero)
