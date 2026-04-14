# Performance Audit Report — Round 1

## Executive Summary

- **Overall score: B**
- **Critical issues: 1**
- **High issues: 3**
- **Medium issues: 3**
- **Low issues: 2**

The app is locally fast in dev mode (FCP 96–264 ms), but the **production bundle is a single 609 kB JS chunk** with no code splitting — every user downloads the entire application on first visit regardless of which page they need. Three API data patterns are wasteful: publications are fetched wholesale on every researcher list load, the stats page fetches all similarity scores to compute a histogram client-side, and the dashboard issues three parallel HEAD requests (count queries) that are then re-issued by child components. Memory is stable across 3 journey cycles with no leak signature.

---

## A. Bundle Analysis

### Vite Build Output

```
dist/index.html                  0.77 kB │ gzip:   0.43 kB
dist/assets/index-y3zOPrkf.css  17.65 kB │ gzip:   3.97 kB
dist/assets/index-C9ieAOyU.js  609.05 kB │ gzip: 177.34 kB   ← WARNING
```

**Total JS (minified): 609 kB**
**Total JS (gzip): 177 kB**
**Total CSS (minified): 17.65 kB**

Vite itself emitted a warning: `Some chunks are larger than 500 kB after minification`.

### Chunk Composition (dev server modules, sorted by decoded size)

| File | Decoded Size |
|------|-------------|
| MapPage.tsx | 105 kB |
| EditProfilePage.tsx | 69 kB |
| ComparisonPage.tsx | 59 kB |
| StatsPage.tsx | 51 kB |
| ProfilePage.tsx | 45 kB |
| ResearchersPage.tsx | 32 kB |
| d3.js (dep) | loaded as single dep chunk |
| @supabase/supabase-js (dep) | loaded as single dep chunk |

**Key finding:** All 9 page components are statically imported in `App.tsx` — no `React.lazy()` anywhere. d3 (entire library ~560 kB unminified) is bundled even though only MapPage uses it.

### Tree-Shaking

d3 is imported as `import * as d3 from 'd3'` in `MapPage.tsx:4`. This prevents tree-shaking — the entire d3 library (force, geo, chord, voronoi, etc.) is included even though only force simulation and SVG drawing primitives are used.

---

## B. Core Web Vitals (Playwright Measurements)

All measurements taken via `performance.getEntriesByType('navigation')` and `getEntriesByType('paint')` on a local dev server (localhost:5199). Dev server serves unbundled ESM modules — production numbers will differ (see bundle findings for production concern).

| Screen | TTFB (ms) | DOM Content Loaded (ms) | Load Complete (ms) | FCP (ms) |
|--------|-----------|------------------------|--------------------|----------|
| `/` (Dashboard) | 3 | 103 | 104 | 264 |
| `/researchers` | 2 | 49 | 50 | 96 |
| `/map` | 4 | 80 | 82 | 128 |
| `/themes` | 2 | 93 | 95 | 128 |
| `/stats` | 4 | 81 | 82 | 120 |
| `/admin` | 4 | 124 | 128 | 160 |
| `/login` | 2 | 86 | 87 | 124 |

**Notes:**
- All TTFB values are excellent (2–4 ms) — local server, no network latency.
- FCP on Dashboard is highest at **264 ms** — likely because DashboardPage triggers the most concurrent data fetches on initial load (stats, clusters, activity feed all fire simultaneously).
- Admin page has highest DCL at **124 ms** — AdminPage is the largest single component that loads all tab sub-components eagerly.
- All values are within acceptable ranges for a local dev server. Production FCP on a real connection will be dominated by the 609 kB JS bundle download time.

**Estimated production FCP on 3G (~1.5 Mbps):** 177 kB gzip / (1.5 Mbps / 8) ≈ **~0.94 seconds** just for JS transfer, before parse/execute. Total FCP likely 2–3 seconds on slow connections — marginal for "Good" LCP target of <2.5s.

---

## C. Runtime Profiling

### FPS (Map Page — idle, 3-second measurement)

```
fps: 60
totalFrames: 181
duration: 3001 ms
```

**60 FPS at idle** — MapPage renders correctly at full frame rate when not under interaction stress. No dropped frames detected at rest.

### Memory (Map Page, post-load)

```
usedJSHeapSize: 10.8 MB
totalJSHeapSize: 13.9 MB
jsHeapSizeLimit: 4096 MB
```

Heap use is modest at 10–22 MB across pages. Well within safe limits.

---

## D. Network Efficiency

### Initial Page Load Request Count

On `/` (Dashboard), **81 network requests** fired (dev server ESM modules). In production this collapses to 3 requests (HTML + JS + CSS).

### API Request Pattern — Dashboard (`/`)

The following Supabase REST calls were observed on the Dashboard load:

```
HEAD /researchers?status=eq.approved    ← useStats count
HEAD /clusters                          ← useStats count
HEAD /publications                      ← useStats count
GET  /audit_logs?limit=5                ← ActivityFeed
GET  /clusters?order=name.asc          ← useClusters (MiniMap)
GET  /researchers?id=eq.{user_id}       ← authStore
GET  /researchers?keywords              ← useStats theme count
GET  /researchers?id,full_name&full_name=in.(Admin) ← audit log user resolve
GET  /researchers?id,full_name,lab,cluster_id       ← useClusters members
```

**Issue 1:** Three HEAD (count) requests for researchers/clusters/publications fire on every Dashboard load from `useStats`. These same counts are immediately re-fetched by child components that also call `useClusters` and other hooks. React Query deduplicates within a render cycle, but the HEAD queries are unique to `useStats` and fire redundantly when the Dashboard also loads `useClusters`.

**Issue 2 (CRITICAL):** `useResearchers.ts:fetchResearcherList` (line 71–83) fetches **all publications for all researchers** unconditionally on every researcher list load:

```ts
const { data: pubData } = await supabase
  .from('publications')
  .select('researcher_id')   // no WHERE clause — full table scan
```

This is a full table scan used only to compute per-researcher publication counts. With 1,000 researchers averaging 5 publications each, this transfers 5,000 rows on every `/researchers` page visit. Supabase has no count aggregation being used here.

**Issue 3 (HIGH):** `useStats.ts:fetchDetailedStats` (line 56–59) fetches **all similarity scores** to build a histogram client-side:

```ts
supabase.from('similarity_scores').select('score')  // no LIMIT
```

Similarity scores grow quadratically with researcher count (N² / 2 pairs). At 100 researchers = 4,950 rows; at 500 = 124,750 rows. This is unbounded and will become a severe bottleneck.

### Google Fonts

4 external font requests on every page load:
```
fonts.googleapis.com/css2?family=Poppins...
fonts.gstatic.com/s/poppins/... (×3 woff2 weights)
```

No `font-display: swap` was verified in CSS. These are render-blocking on first load. Low severity given Poppins is commonly cached, but adds latency on cold loads.

---

## E. Memory Leaks

### Heap measurements across 3 full journey cycles (no page refresh)

| Cycle | Page | Heap (MB) |
|-------|------|-----------|
| 0 | `/` (baseline) | 13.8 |
| 1 | `/researchers` | 16.7 |
| 1 | `/map` | 15.3 |
| 1 | `/stats` | 19.2 |
| 1 | `/themes` | 10.4 |
| 2 | `/` | 13.4 |
| 2 | `/researchers` | 16.3 |
| 2 | `/map` | 22.0 |
| 2 | `/stats` | 10.3 |
| 2 | `/themes` | 13.3 |
| 3 | `/` | 15.0 |
| 3 | `/researchers` | 11.3 |
| 3 | `/map` | 15.8 |
| 3 | `/stats` | 10.3 |
| 3 | `/themes` | 14.0 |

### Analysis

**No monotonic growth detected.** Heap values oscillate between 10–22 MB across all three cycles with no upward trend. The GC is reclaiming memory effectively between navigations.

**Cycle 2 `/map` spike to 22 MB** — elevated but recovered to 15.8 MB on cycle 3. Likely the d3 force simulation and SVG DOM nodes being held briefly after unmount. Not a sustained leak.

**Verdict: No memory leak.** The `authStore.onAuthStateChange` listener leak identified by the Stability Auditor (never unsubscribed) would accumulate in a long-lived SPA session without page refresh, but was not detectable in 3 cycles.

---

## Issue List

| # | Severity | Metric | Measured Value | Target | File / Root Cause | Suggested Fix |
|---|----------|--------|----------------|--------|--------------------|---------------|
| 1 | CRITICAL | Bundle size | 609 kB JS (single chunk) | <200 kB initial | `src/App.tsx:1-13` — all pages statically imported; `vite.config.ts` has no `manualChunks` | Wrap all Route elements with `React.lazy()` + `Suspense`; let Vite split per-route automatically |
| 2 | HIGH | d3 tree-shaking | Full d3 library bundled (~560 kB source) | Only used modules | `src/pages/MapPage.tsx:4` — `import * as d3 from 'd3'` | Change to named imports: `import { forceSimulation, forceManyBody, ... } from 'd3'` or use `d3-force` + `d3-selection` sub-packages only |
| 3 | HIGH | Publications fetch | Full table scan on every researcher list load | Paginated/counted server-side | `src/hooks/useResearchers.ts:71` — `select('researcher_id')` with no WHERE | Use `select('researcher_id', { count: 'exact', head: false })` grouped, or add a `publication_count` column to `researchers` table updated via trigger |
| 4 | HIGH | Similarity scores fetch | Unbounded `select('score')` — grows as O(N²) | Server-side histogram | `src/hooks/useStats.ts:58` — `supabase.from('similarity_scores').select('score')` | Compute histogram in a Postgres function/view; or at minimum add `.limit(10000)` as a safety cap |
| 5 | MEDIUM | Redundant HEAD queries | 3 HEAD count queries on Dashboard that are not reused | Shared query or combined RPC | `src/hooks/useStats.ts:13-20` — 3 separate HEAD calls not deduped with child component queries | Create a single Postgres RPC `get_dashboard_stats()` returning all counts in one round-trip |
| 6 | MEDIUM | No code splitting | All 9 pages + d3 + Supabase SDK in one chunk | Route-level splits | `vite.config.ts` — no `build.rollupOptions` | Add `manualChunks` to split vendor (react, react-dom, router, query), d3, supabase, and app pages |
| 7 | MEDIUM | FCP on Dashboard | 264 ms FCP (dev); ~2–3 s estimated on 3G | <1.8 s (Good LCP) | All heavy deps load synchronously before first paint | Code splitting (issue #1) will directly reduce this |
| 8 | LOW | Google Fonts blocking | 4 external font requests on cold load | Preloaded / self-hosted | `index.html` or CSS `@import` for Poppins | Self-host Poppins with `font-display: swap`; or add `<link rel="preconnect">` for fonts.gstatic.com |
| 9 | LOW | Client-side filtering | Text/theme search filters applied in JS after full data fetch | Server-side filtering | `src/hooks/useResearchers.ts:54-68` — q/theme filters applied after `await query` | Push `q` filter to `supabase.ilike('full_name', '%q%')` and keyword filter to `supabase.contains('keywords', [theme])` |

---

## Evidence

### Build output (verbatim)
```
vite v5.4.21 building for production...
✓ 761 modules transformed.
dist/index.html                  0.77 kB │ gzip:   0.43 kB
dist/assets/index-y3zOPrkf.css  17.65 kB │ gzip:   3.97 kB
dist/assets/index-C9ieAOyU.js  609.05 kB │ gzip: 177.34 kB
(!) Some chunks are larger than 500 kB after minification.
✓ built in 1.88s
```

### Key source locations
- No code splitting: `src/App.tsx:1-13` (9 static page imports)
- d3 wildcard import: `src/MapPage.tsx:4`
- Full publications fetch: `src/hooks/useResearchers.ts:71-83`
- Unbounded similarity scores: `src/hooks/useStats.ts:56-59`
- No vite chunking config: `vite.config.ts` (15 lines, no `build` key)
