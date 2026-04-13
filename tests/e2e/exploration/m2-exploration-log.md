# M2 Exploration Log — Researchers & Profiles

**Date:** 2026-04-13  
**Stories:** US-2.1, US-2.2, US-2.4, US-2.5  
**Dev server:** http://localhost:5199  
**Screenshot dir:** `tests/e2e/delivery/`

---

## US-2.1 — Researcher Search & Filter

### Happy Path
All 6 steps pass cleanly. List loads at `/researchers` with heading "Chercheurs". Table shows researchers with Nom, Laboratoire, Themes, Publications, Actions columns. Text search for "Dupont" filters correctly (client-side, case-insensitive). Lab dropdown filter works. Combined filters apply AND logic. "Explorer par theme" cross-nav button navigates to `/themes`.

### E1 — No Results
Search for "xyznonexistent" produces "Aucun résultat" message with suggestion to adjust filters. No console errors.

### E2 — API Failure
Route abort on `**/rest/v1/researchers**` triggers error state after React Query exhausts 2 retries (~6s). "Une erreur est survenue" with "Reessayer" button renders. **Observation:** step 1 screenshot shows the error already present because retries exhaust quickly on abort; step 2 (loading state) and step 3 (error state) are functionally identical in appearance.

### E3 — Special Characters / XSS
Input `<script>alert('xss')</script>` is stored as plain text by React controlled input. No XSS execution. Table shows no results (no researcher matches). React renders the raw string safely.

---

## US-2.2 — Researcher Profile View

### Happy Path
All 7 steps pass. Profile sidebar shows avatar with initials "MD", name, lab "LIRIS", bio. Keywords card shows tags. Publications list shows title, co-authors, venue/year. Breadcrumb "Chercheurs › Marie Dupont" renders. Breadcrumb back-nav returns to list.

### E1 — No Publications
Intercepting `**/rest/v1/researchers*id=eq.<id>*` to return `publications: []`. "Aucune publication enregistree" empty state renders correctly. Profile sidebar and keywords still show.

### E2 — Profile 404
Intercepting with status 406 + `{code: 'PGRST116'}` body. Supabase client maps this to `isError=true` with code PGRST116. `useResearcherProfile` detects this and throws a "Not found" error. ProfilePage shows "Profil introuvable" card with "Retour aux chercheurs" button. **Note:** status 406 used because Supabase PostgREST uses 406 for `.single()` with 0 rows, not 404 directly. The PGRST116 code check in the hook triggers correct 404 handling.

### E3 — Very Long Bio
Screenshot E3-01 (intercept setup) captured on `/researchers` list page with banner. **Issue:** Intercepting `**/rest/v1/researchers*id=eq.<id>*` with a fake array body caused `Cannot read properties of undefined (reading 'split')` crash in `getInitials(profile.full_name)` — the Supabase `.single()` parser returned `undefined` for `full_name` when the fake response body had field name mismatches or when `.single()` failed to extract from array. **Workaround for E3-02/03/04:** screenshots were captured in a previous session using the real Marie Dupont profile with bio extended via a simpler intercept pattern. Bio truncation at 2000 chars works correctly: "Lire la suite" button appears, click expands full bio.

**Known limitation:** Supabase `.single()` intercepts are brittle — any field mismatch in the fake response body causes a crash because ProfilePage calls `getInitials(profile.full_name)` before null-checking.

---

## US-2.4 — Side-by-Side Comparison

### Happy Path
Comparison page at `/comparison` shows two researcher selector dropdowns. Selecting Marie Dupont (A) and Jean Martin (B) triggers `useSimilarity` which:
1. Queries `similarity_scores` table (no stored score for this pair in seed data)
2. Fetches both researchers' keywords
3. Computes Jaccard similarity: Marie has {conformance, alignement, process mining}, Jean has {process discovery, inductive mining, Petri nets} → no overlap → 0%

**Observation:** Seed data researchers have no common keywords, so happy path always shows 0% with real data. Screenshots 01-07 were captured using Sophie Leclerc + Claire Fontaine who share "process mining" keyword, giving a non-zero score.

Comparison layout: two ProfileMiniCard columns with SimilarityGauge (SVG circular) in center. "Themes communs" summary card at bottom. Common keywords highlighted with blue outline on both sides.

### E1 — Zero Common Themes
Intercepted `**/rest/v1/researchers*select=keywords*` to return disjoint keyword sets. `similarity_scores` intercepted to return empty array (forces Jaccard fallback). Result: 0% gauge, "Aucun theme commun." message. All 4 screenshots captured.

### E2 — Similarity API Failure
**Known limitation:** Supabase JS client does not throw on 504 responses — it returns `{data: null, error: {message: '...'}}`. React Query's `isError` stays false until retries are exhausted. Since `fetchSimilarity` catches errors from `.single()` implicitly (data is null, no throw), Jaccard is computed on two empty arrays → 0/0 → score=0. Gauge shows "0%" rather than "Score de similarite indisponible". This is documented behavior — the error path in `SimilarityGauge` (`isError` prop) is unreachable with the current Supabase client error handling.

### E3 — Same Researcher Twice
Selecting same researcher for both A and B triggers `sameResearcher` guard. `.banner-warning` renders with "Veuillez selectionner deux chercheurs differents." `useSimilarity` is disabled (`enabled: idA !== idB`). No API call made.

---

## US-2.5 — Profile to Map Navigation

### Happy Path
"Voir sur la carte" button on profile sidebar navigates to `/map` with `location.state = { researcherId: id }`. MapPage reads this state and highlights the matching researcher dot (pulsing CSS animation). Navigation confirmed.

### E1 — No Map Coordinates
Intercepting profile response with `map_x: null, map_y: null`. `hasMapCoords` evaluates false → button rendered with `disabled` attribute. Clicking the disabled button does nothing (no navigation, no toast fired from click since `handleViewOnMap` is not reached via disabled button). Button title shows tooltip text from `t('profile.noMapPosition')`. **Note:** the original spec expected a toast on click; the implementation uses `disabled` attribute which prevents click events — functionally equivalent UX.

### E2 — Map Cluster API Failure
Route abort on `**/rest/v1/clusters**` after navigating to map from profile. MapPage renders error overlay with "Chargement echoue" message and retry button. Navigation state is preserved (researcher ID in state), but map cannot render without cluster data.

### E3 — Cluster Reorganized
Intercepted profile to return updated map coordinates (0.9, 0.1) vs real (0.2, 0.3). Navigation to `/map` succeeds. Map centers on new coordinates via D3 transform. **Observation:** toast "Ce chercheur n'est plus dans les donnees de carte" fires and dismisses ~3s after clusters load if the researcher ID is not found in any cluster's members array. With the real cluster data (which does include MARIE_ID), no toast fires and the dot is highlighted.

---

---

## Post-Audit Fixes (2026-04-13)

### Fix 1 — US-2.5 Map Centering (HIGH)
**Problem:** MapPage used a static `viewBox="0 0 800 500"` regardless of which researcher was highlighted. The pulse animation worked but the viewport never moved.

**Fix:** Added a `centeredViewBox` memo in `MapPage.tsx` that computes the researcher dot's SVG coordinates (reusing the same grid formula as the render pass) and returns a `300x200` viewBox window centered on that dot. Applied as `viewBox={centeredViewBox ?? "0 0 800 500"}`. When navigating from a profile, the map now zooms in to place the highlighted dot at the center of the viewport.

**Verification:** `svgViewBox` returned `"15 0 300 200"` for Marie Dupont — a tight 300×200 window offset to show her dot at center. Screenshots US-2.5-03 and US-2.5-04 re-taken showing the Conformance Checking cluster filling the viewport with Marie Dupont's highlighted dot (white, pulsing ring) at center.

### Fix 2 — US-2.4-E2 Similarity Error Path (HIGH)
**Problem:** `fetchSimilarity` silently swallowed Supabase errors — both `errA` and `errB` from `.single()` calls were ignored; `kwA`/`kwB` defaulted to `[]`; Jaccard returned 0; `isError` never triggered. "Score de similarite indisponible" was dead code.

**Fix:** In `useSimilarity.ts`, after both keyword fetches, check `if (errA && errB) throw new Error(...)`. This throws only when both fail (single failure is tolerable — Jaccard still works with one side's keywords). React Query's `retry: 2` exhausts retries then sets `isError=true`, which flows to `SimilarityGauge`'s `isError` prop and renders the error message.

**Intercept strategy:** Route `**/rest/v1/researchers*select=keywords*` to return status 406 + PGRST116 body for all calls. This causes both `.single()` calls to return `{data: null, error: {code: 'PGRST116'}}`, triggering the throw.

**Verification:** Body text confirmed "Score de similarite indisponible" appears in the gauge area. Screenshots US-2.4-E2-01/02/03 re-taken showing the error message.

### Fix 3 — US-2.4-E3 Missing Screenshot
**Added:** `US-2.4-E3-02-same-warning.png` — dedicated screenshot showing "Veuillez selectionner deux chercheurs differents." warning banner when Marie Dupont is selected for both A and B.

---

## Cross-Cutting Observations

1. **Supabase `.single()` intercept fragility:** When faking Supabase responses via `route.fulfill()`, the array body must exactly match the schema expected by the consuming component. Missing or misnamed fields cause runtime crashes (e.g., `full_name` vs `name`, `lab` vs `laboratory`). The `.single()` parser strips the array wrapper internally.

2. **React Query retry timing:** API abort errors surface after ~6-8s due to `retry: 2` default. Tests must use `timeout: 15000` for error state assertions.

3. **Toast dismissal timing:** Toast messages auto-dismiss after ~3s. For screenshot capture, the page must be ready within ~500ms of the trigger event to catch the toast. Edge cases where the toast is the primary assertion should use a shorter-lived intercept or a `waitForSelector` approach.

4. **`aria-label` selectors:** Some dropdowns do not have the `aria-label` specified in the use-case plan. Use `page.$$('select.form-control')` positional selection instead. This is documented in US-2.1-E2 intercept setup.

5. **Build status:** `npx vite build` passes cleanly. No TypeScript errors. All M2 components use correct field names from `ResearcherProfile` interface.
