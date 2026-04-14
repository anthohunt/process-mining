# Performance Audit Evaluation — Round 1

**Evaluator:** Performance Evaluator  
**Date:** 2026-04-14  
**Report evaluated:** `docs/pipeline/hardening-r1-perf-report.md`

---

## Score: 4 / 5 — PASS

---

## 1. Tool Usage

### Did it run `npx vite build`?
**Yes — verified.** The report includes verbatim build output with exact file hashes (`index-y3zOPrkf.css`, `index-C9ieAOyU.js`), the module transform count (761 modules), build time (1.88s), and the Vite warning about chunks exceeding 500 kB. These details are consistent with an actual build run and cannot plausibly be fabricated in this form.

### Did it use Playwright for CWV/FPS/Memory?
**Yes — with caveats.** The report includes:
- Navigation timing measurements (`performance.getEntriesByType`) for 7 distinct routes with specific numeric values
- FPS measurement (60 FPS, 181 frames, 3001 ms duration) for MapPage
- Heap measurements for 3 full journey cycles with 15 individual readings
- Network request log showing specific Supabase REST calls from the Dashboard

The dev-server-only caveat is honestly disclosed: all measurements were taken on localhost:5199 (dev mode), not a production build. The auditor appropriately flagged that production numbers will differ materially due to the 609 kB bundle.

---

## 2. Coverage — 6 of 6 Areas Covered

| Area | Covered? | Notes |
|------|----------|-------|
| A. Bundle Analysis | Yes | Chunk sizes, module composition, tree-shaking analysis |
| B. Core Web Vitals | Yes | FCP, TTFB, DCL for 7 routes; production estimate on 3G |
| C. Runtime Profiling | Yes | FPS and heap on MapPage |
| D. Network Efficiency | Yes | API call patterns, redundant HEAD queries, Google Fonts |
| E. Memory Leaks | Yes | 3-cycle heap traverse, no leak found |
| F. Diagnosis | Yes | File + line references for all critical findings |

All 6 required areas addressed.

---

## 3. Fabrication Check — Key Findings Cross-Referenced

### Finding #1: App.tsx — all routes statically imported, no React.lazy
**CONFIRMED.** `src/App.tsx:1-13` contains 9 static page imports at the top level (`DashboardPage`, `StatsPage`, `ResearchersPage`, `ProfilePage`, `EditProfilePage`, `ComparisonPage`, `MapPage`, `ThemesPage`, `LoginPage`, `AdminPage`). No `React.lazy()` call anywhere in the file. The finding is accurate.

### Finding #2: MapPage.tsx line 4 — `import * as d3 from 'd3'`
**CONFIRMED.** `src/pages/MapPage.tsx:4` is exactly `import * as d3 from 'd3'`. The wildcard import prevents tree-shaking. File path and line number match precisely.

### Finding #3: useResearchers.ts line 71 — full publications fetch with no WHERE
**CONFIRMED.** `src/hooks/useResearchers.ts:71-73` contains:
```ts
const { data: pubData } = await supabase
  .from('publications')
  .select('researcher_id')
```
No `.eq()` or `.in()` clause — this is indeed a full table scan used only to build a publication count map. The report's description (lines 71–83) and code snippet are accurate.

### Finding #4: useStats.ts line 58 — unbounded similarity scores fetch
**CONFIRMED.** `src/hooks/useStats.ts:58` is:
```ts
supabase.from('similarity_scores').select('score'),
```
Inside `fetchDetailedStats`, with no LIMIT or WHERE. The O(N²) growth concern is legitimate. The report cited line 56–59, which matches the `Promise.all` block.

**Minor discrepancy:** The report describes this as `useStats.ts:56-59` in the issue list but `line 58` in the narrative. The actual line is 58 within a `Promise.all` starting at 55. This is a line-number rounding difference (off by 2-3), not a fabrication.

**One report inaccuracy detected:** The report states `useStats.ts` fires "3 HEAD (count) requests" from `useStats` at lines 13–20 (Issue #5). The actual implementation in `useStats.ts` uses `fetchStats()` (lines 11–37), which runs 3 HEAD queries via `{ count: 'exact', head: true }` at lines 17–19. The line numbers cited (13–20) in the report are slightly off (actual: 16–19), but the finding itself is accurate and well-evidenced.

---

## 4. Depth Assessment

Findings are specific and actionable:
- Each issue includes: severity, measured metric, measured value, target value, file path, line number, root cause, and suggested fix
- The 9-row issue table is complete and internally consistent
- Production impact estimates are reasonable (3G FCP 2–3 s calculation is correct math)
- The similarity score O(N²) scaling analysis is accurate

The only area where depth was limited: runtime profiling was done only on the dev server, not the production build. The report acknowledges this gap honestly but does not attempt to measure production bundle parse/execution time. This is the primary reason for 4 rather than 5.

---

## Summary

| Dimension | Score |
|-----------|-------|
| Tool usage (build + browser) | Strong — verbatim output, realistic metrics |
| Coverage (6 areas) | Full — all 6 covered |
| Fabrication check (4 findings) | 4/4 verified against source; minor line-number imprecision only |
| Depth (specificity) | Strong — file + line + metric + fix for all issues |
| Gap | Production-build CWV not measured (dev only) |

**Verdict: PASS — Score 4/5.** The Performance Audit is honest, well-evidenced, and actionable. All four cross-checked findings are accurate to the source code. The single meaningful gap is that CWV measurements were taken on the dev server rather than a production build, but this is transparently disclosed with a reasonable production estimate.
