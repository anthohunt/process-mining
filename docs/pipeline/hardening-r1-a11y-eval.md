# Accessibility Audit Evaluation — Round 1

**Evaluator:** Accessibility Evaluator agent  
**Date:** 2026-04-14  
**Report evaluated:** `hardening-r1-a11y-report.md`

---

## 1. Tool Usage

The auditor correctly disclosed that Playwright was unavailable and conducted a static source-code analysis instead. This is an honest limitation statement. A browser-based axe-core run was not possible, and the auditor did not fabricate axe scan results — it listed *predicted* violations with appropriate hedging ("Estimated axe violations: 8–12 distinct rules"). No fabrication here; the limitation is real and clearly communicated.

**Coverage of tool usage: Honest and transparent.**

---

## 2. Coverage

| Audit Area | Status |
|-----------|--------|
| Automated scan (axe-core) | Substituted with static prediction — acceptable given constraint |
| Keyboard navigation | Covered with specific element analysis |
| Screen reader simulation | Covered — landmarks, heading hierarchy, live regions all checked |
| Color & contrast | Covered — table with computed ratios |
| Motion & preferences | Covered — zoom/reflow analysis + `prefers-reduced-motion` gap noted |

All five required areas were addressed. The substitution for automated scanning is clearly labeled as an approximation.

**Coverage: 5/5 areas addressed. No area skipped.**

---

## 3. Fabrication Check — Findings vs. Source Code

Spot-checked 8 findings against actual source:

### Issue #1 — Map keyboard access (MapPage.tsx:309, :459)
**VERIFIED.** `src/pages/MapPage.tsx` line 471 confirms `role="button"` on the hit circle at approximately line 456–473, with `onClick` and `onMouseEnter` but **no `tabIndex`**. The outer container at line 309 is `role="img"`. Finding is accurate.

### Issue #2 — Cluster circles (MapPage.tsx:414-420)
**VERIFIED.** Lines 407–420 show the cluster `<circle>` has `data-cluster-region`, `onClick`, `style={{ cursor: 'pointer' }}`, but **no `role`, no `tabIndex`, no `aria-label`**. Finding is accurate.

### Issue #3 — Popover keyboard dismiss (MapPage.tsx:516-591)
**VERIFIED.** Lines 516–591 show cluster and disambiguation popovers are plain `<div>` elements with no `onKeyDown`, no Escape handler, and no focus management on open. Finding is accurate.

### Issue #4 — Modal focus trapping (AdminPage.tsx:132-155, UsersTab.tsx:209-249)
**VERIFIED.** `AdminPage.tsx` lines 131–154: the unsaved-changes dialog has `role="dialog"` and `aria-modal="true"` but no focus trap — no `useEffect` to move focus, no Tab interception. `UsersTab.tsx` lines 209–249: the invite dialog has `autoFocus` on the email input (partial mitigation) but no Tab cycling trap. Finding is accurate, though the `autoFocus` in UsersTab is a partial positive not mentioned in the report.

### Issue #5 — Nested nav (AppNavbar.tsx:29,39)
**VERIFIED.** Line 29: `<nav className="app-navbar" aria-label="Navigation principale">` and line 39: `<nav aria-label="Navigation principale">` — two `<nav>` elements with identical aria-labels. Finding is accurate.

### Issue #16 — Auto-dismiss timeout (EditProfilePage.tsx:104-108)
**VERIFIED.** `src/pages/EditProfilePage.tsx` line 105 shows `setTimeout(() => setKwDuplicate(false), 2000)`. Finding is accurate.

### Issue #17 — DashboardPage heading (DashboardPage.tsx:18)
**VERIFIED.** Line 18 is `<div className="card-title" style={{ marginBottom: 8 }}>` — a `<div>`, not a heading element. Finding is accurate.

### Issue #19 — Label in Name (ResearchersPage.tsx:29)
**VERIFIED.** Line 30 has `aria-label="Explorer les themes"` and line 32 shows visible text `Explorer par theme` — the mismatch is real. Finding is accurate.

### Issue #11 — SVG charts without data alternatives (StatsPage.tsx:86,159,217)
**VERIFIED.** Lines 86, 159, 217 show `<div className="chart-container" role="img" aria-label={...}>` with no hidden data table or summary inside. Finding is accurate.

**Fabrication check: 0 fabricated findings. All 9 spot-checked findings reference real file locations and real code patterns.**

---

## 4. Contrast Ratio Accuracy — Critical Issue Found

The auditor computed contrast ratios from hex values. Several ratios are materially wrong. Independently computed values using the WCAG 2.1 relative luminance formula:

| Element | Report Ratio | Actual Ratio | Report Verdict | Correct Verdict |
|---------|-------------|-------------|----------------|-----------------|
| `--pm-text-muted` (#6c757d) on white | 4.48:1 | **4.69:1** | FAIL | **PASS** (AA normal text) |
| `--pm-text-muted` on #f8f9fa alt bg | 4.27:1 | **4.45:1** | FAIL | FAIL (correct) |
| `tag-blue` (#0d6efd on #e7f1ff) | 3.06:1 | **3.95:1** | FAIL | FAIL (still fails 4.5:1) |
| `btn-primary` (white on #0d6efd) | 3.06:1 | **4.50:1** | FAIL | **PASS** (barely, ~4.50:1) |
| `tag-orange` (#997404 on #fff3cd) | 3.12:1 | **3.90:1** | FAIL | FAIL (still fails) |
| `tag-cyan` (#0a7d8c on #cff4fc) | 2.86:1 | **4.16:1** | FAIL | FAIL (still fails 4.5:1 at 12px) |
| `tag-green` (#198754 on #d1e7dd) | 3.22:1 | **3.49:1** | FAIL | FAIL (still fails) |

**Key errors:**

1. **`--pm-text-muted` on white (4.69:1 actual):** The report says 4.48:1 and classifies it as a FAIL. The actual ratio is 4.69:1 which *passes* WCAG AA for normal text (threshold 4.5:1). The report's most prominent contrast finding (Issue #6) is based on an incorrect ratio. The muted text on alt background (#f8f9fa) does fail at 4.45:1, so there is a real (narrower) problem, but not as widespread as described.

2. **`btn-primary` white on #0d6efd (4.50:1 actual):** The report declares this "Critical contrast finding" and states it "fails WCAG AA." The actual ratio is approximately 4.50:1, which is right at the threshold — essentially a borderline pass. This is the most significant error in the report: a "Critical" finding that is arguably not a WCAG failure.

3. **Other tag ratios:** The tag-blue, tag-orange, tag-cyan values are wrong (off by 0.5–1.3 ratio points) but the failure direction is the same — they all still fail 4.5:1. The incorrect numbers reduce confidence but do not change the FAIL verdict for those elements.

The contrast computation errors suggest the auditor may have used an imprecise manual formula or rounded intermediate values incorrectly. The structural findings (keyboard, ARIA, focus) are reliable; the contrast section needs recalculation.

---

## 5. Depth Assessment

**Strengths:**
- Every issue includes WCAG criterion, affected file+line, and a concrete fix suggestion.
- Keyboard section distinguishes well-implemented patterns from broken ones — specifically calling out that `ThemesPage` cluster cards correctly implement `onKeyDown` while `MapPage` does not.
- Screen reader section correctly identifies the `LoadingSpinner`, `ErrorState`, `ToastContainer` ARIA live region implementations.
- Motion section identifies two specific animation sites (SVG pulse + loading spinner) and the absence of `@media (prefers-reduced-motion)` — confirmed: no `@media` rules at all exist in `index.css`.
- Zoom/reflow analysis identifies four specific grid/layout patterns by class name, all verified in `index.css`.

**Weaknesses:**
- Contrast ratios are computed incorrectly for several values (see Section 4).
- Issue #4 does not note that `UsersTab` invite dialog has `autoFocus` on the first input, which partially mitigates the focus management gap.
- Issue #7 (nav lang-toggle at 12px) is hedged and inconclusive — the auditor corrects a false positive mid-finding but doesn't land on a clear verdict.
- The report does not check whether `.btn-ghost:focus-visible` actually suppresses focus rings in practice (Issue #15) — this would require browser testing.

---

## 6. Summary

| Dimension | Score (1-5) | Notes |
|-----------|------------|-------|
| Honesty about limitations | 5 | Browser lock clearly disclosed; no fake axe results |
| Coverage | 5 | All 5 areas addressed |
| Finding accuracy (structural) | 5 | All 9 structural findings spot-checked and confirmed |
| Contrast ratio accuracy | 2 | Multiple incorrect values; one "Critical" finding (btn-primary) is likely a false positive; muted-text-on-white finding is also incorrect |
| Depth & specificity | 4 | Good WCAG citations and fix recommendations; minor gaps on mitigations noted above |

**Overall Score: 4/5**

The structural accessibility findings — keyboard navigation failures, missing focus trapping, nested nav landmarks, missing skip link, ARIA issues, auto-dismiss timeout — are all verified accurate and represent genuine work. The report is thorough and honest about its methodology. However, the contrast section has systematic calculation errors that introduce at least one likely false positive (btn-primary) and one misclassified finding (muted text on white). These errors are meaningful but do not invalidate the report's overall usefulness.

**Verdict: PASS (4/5)**

---

*Evaluation conducted 2026-04-14 by Accessibility Evaluator agent. Contrast ratios independently recalculated using WCAG 2.1 relative luminance formula.*
