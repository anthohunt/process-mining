# Stability Audit Evaluation — Round 1

**Evaluator:** Stability Evaluator Agent  
**Date:** 2026-04-14  
**Report evaluated:** `docs/pipeline/hardening-r1-stability-report.md`

---

## Tool Usage Assessment

The auditor correctly disclosed that live Playwright browser testing was blocked. The browser was concurrently occupied by other audit agents. This is an honest, accurate disclosure. The auditor pivoted to a full static code analysis and produced specific, file-cited findings — an appropriate adaptation to the constraint.

---

## Coverage Assessment

Required audit areas vs. what was covered:

| Area | Covered? | Notes |
|------|----------|-------|
| Network failure injection | Partial | Covered via code analysis (useStats silent error swallow, useActivity failure, MapPage indefinite spinner on DB hang). No live network fault injection since browser unavailable. |
| Rapid interaction stress | Yes | Double-click save race condition (EditProfilePage), global pending-state freeze (PendingTab) |
| Navigation abuse | Partial | Non-UUID researcher ID path briefly analyzed (finding #1). No live navigation stress testing. |
| Data edge cases | Yes | 1-cluster MapPage, 1-data-point StatsPage, CSV quoted-field corruption, publications OOM with large datasets |
| Viewport stress | Not covered | No mention of responsive layout or viewport-related breakage |
| Root cause diagnosis | Yes | Every finding includes exact file:line and a proposed fix |

**Coverage score: 5/6 areas addressed (viewport stress missing). Partial credit on network injection and navigation abuse due to browser unavailability.**

---

## Fabrication Check — 3 HIGH Findings Verified

### Finding #6: EditProfilePage double-click race condition (`src/pages/EditProfilePage.tsx:131`)

**Verdict: CONFIRMED.**

Read `src/pages/EditProfilePage.tsx` lines 130–209. `handleSave` is async. `setIsSaving(true)` is called at line 139 inside the function body — after the async tick begins. There is no ref guard before the state update. A fast second click before the first re-render could fire `handleSave` again. The publications delete and insert operations at lines 167–193 would run twice. The finding is accurate.

### Finding #11: CSV parser comma-in-field corruption (`src/hooks/useAdminImport.ts:33`)

**Verdict: CONFIRMED.**

Read `src/hooks/useAdminImport.ts` line 33: `const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))`. The split is on raw `,` with no RFC 4180 quoted-field handling. A name like `"Dupont, Marie"` produces three splits before the quote-strip, resulting in wrong column alignment. The finding is accurate.

### Finding #8: authStore listener never unsubscribed (`src/stores/authStore.ts:52`)

**Verdict: CONFIRMED.**

Read `src/stores/authStore.ts` lines 52–58. `supabase.auth.onAuthStateChange(...)` is called without storing the returned subscription object. The return value is discarded. No unsubscribe call exists anywhere in the file. Finding is accurate.

### Bonus verification — Finding #7: AdminPage toast memory leak (`src/pages/AdminPage.tsx:26-28`)

**Verdict: CONFIRMED.**

Read `src/pages/AdminPage.tsx` lines 25–28. `addToast` uses `useCallback` with `setTimeout(() => setToasts(prev => prev.slice(1)), 4000)`. There is no `clearTimeout` in a cleanup or `useEffect` return. Finding is accurate.

### Bonus verification — Finding #12: publications fetched for all researchers (`src/hooks/useResearchers.ts:71-76`)

**Verdict: CONFIRMED.**

Read `src/hooks/useResearchers.ts` lines 70–78. The query `supabase.from('publications').select('researcher_id')` has no `.in()` filter applied — it fetches every publication row unconditionally regardless of which researchers survived the client-side filter. Finding is accurate.

---

## Depth Assessment

All findings include:
- Exact file path and line number(s)
- Precise description of the failure mode
- Proposed fix
- Severity classification

Two findings (#1 and #2 in the crash log) correctly identify code paths that look dangerous but are currently safe, and honestly mark them as "no fix needed" rather than inflating the issue count. This is a sign of honest analysis.

The toast queue state corruption (SC3) is a subtle and correct observation: `prev.slice(1)` always removes the first toast, not the one whose timer expired. This would cause wrong-toast dismissal when multiple toasts overlap. Finding is specific and accurate.

One notable gap: the auditor did not attempt any viewport stress analysis (responsive CSS, overflow at narrow widths). This was an explicit audit requirement.

---

## Score

| Dimension | Score |
|-----------|-------|
| Coverage of required areas | 4/5 (viewport stress missing) |
| Fabrication — findings vs. reality | 5/5 (all sampled findings verified) |
| Depth and specificity | 5/5 |
| Honest disclosure of limitations | 5/5 |
| Fix quality | 5/5 |

**Overall score: 4 / 5**

**PASS** (threshold: >= 3)

---

## Summary

The Stability Auditor produced a high-quality code-only audit given the browser-locked constraint. All five findings sampled against the source code were accurate at the exact file:line cited — no fabrication detected. The report covers 5 of 6 required audit areas; viewport stress testing was entirely absent. Findings are specific, actionable, and honestly ranked by severity. The audit is fit for purpose and provides real, actionable findings for the fix phase.
