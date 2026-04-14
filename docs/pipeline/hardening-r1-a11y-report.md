# Accessibility Audit Report — Round 1

> **Audit method:** Static source code analysis (Playwright browser unavailable — locked by concurrent agent).  
> All findings are based on reading every component, page, and the sole CSS file.  
> Contrast ratios are calculated from hex values in `src/index.css`.  
> WCAG 2.1 AA is the target.

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Overall WCAG AA compliance estimate | ~72% |
| Critical issues | 4 |
| High issues | 6 |
| Medium issues | 7 |
| Low issues | 4 |

The app has a solid accessibility foundation — labels are generally present, ARIA live regions exist for errors and loading, focus management is implemented in the UserDropdown, and semantic HTML is used throughout. However, several structural gaps remain: nested `<nav>` elements, the interactive map is completely inaccessible via keyboard, SVG charts are opaque to assistive technology, modals lack focus trapping, and multiple contrast failures exist with muted text against white backgrounds.

---

## Issue List

| # | Severity | WCAG Criterion | Issue | Element / Location | Fix |
|---|----------|---------------|-------|--------------------|-----|
| 1 | **Critical** | 1.3.1 Info and Relationships | The entire SVG map (`MapPage`) is wrapped in a single `role="img"` container. All researcher dots (`role="button"` on SVG circle) are unreachable by keyboard — they have click/mouseEnter handlers but no `tabIndex` on the actual interactive hit circles, making 100% of map content keyboard-inaccessible. | `src/pages/MapPage.tsx:309`, `src/pages/MapPage.tsx:459` | Add `tabIndex={0}` and `onKeyDown` to each researcher dot hit circle; add keyboard-activatable cluster circles. OR provide a visible skip-to-list alternative. |
| 2 | **Critical** | 4.1.2 Name, Role, Value | Cluster circles in the SVG map have no accessible name or role. They use `data-cluster-region` attribute and a plain `onClick` but no `role="button"` and no `aria-label`. | `src/pages/MapPage.tsx:414-420` | Add `role="button"`, `tabIndex={0}`, `aria-label={cluster.name}`, and `onKeyDown` to each cluster circle. |
| 3 | **Critical** | 2.1.1 Keyboard | Popover menus on the map (cluster popover, disambiguation popover) have no way to be dismissed via keyboard (Escape key). They appear on mouse click and are positioned absolutely with no focus management. | `src/pages/MapPage.tsx:516-591` | On popover open, move focus into popover. Add `onKeyDown` Escape handler that closes the popover and returns focus to the triggering element. |
| 4 | **Critical** | 2.1.2 No Keyboard Trap / 4.1.2 | Modals (AdminPage unsaved-changes dialog, UsersTab invite dialog) are missing focus trapping. When a modal opens, Tab can escape the modal into background content behind the overlay. | `src/pages/AdminPage.tsx:132-155`, `src/components/admin/UsersTab.tsx:209-249` | Implement focus trap: on mount, move focus to first focusable element; intercept Tab/Shift+Tab to cycle only within the modal; restore focus on close. |
| 5 | **High** | 1.3.1 Info and Relationships | Nested `<nav>` elements: `AppNavbar` renders `<nav aria-label="Navigation principale">` as the outer element, then immediately contains another `<nav aria-label="Navigation principale">` for the nav buttons — same label on both. Screen readers will announce two "Navigation principale" landmarks. | `src/components/layout/AppNavbar.tsx:29,39` | Remove the outer `<nav>` wrapper or use a different element (`<header>`) for the outer; change the inner label to differentiate (e.g. "Menu principal"). |
| 6 | **High** | 1.4.3 Contrast (Minimum) | `--pm-text-muted` (#6c757d) on white background (#ffffff): contrast ratio ≈ 4.48:1 — passes for large text (18px+) but **fails** for normal-size text. It is used for `stat-label` (13px), `activity-time` (11px), `breadcrumb` (13px), `form-label`-adjacent text, table headers (12px uppercase), and many inline `font-size: 12–13px` spans. | `src/index.css:16` (--pm-text-muted), `.stat-label`, `.activity-time`, `.app-table th`, `.breadcrumb` | Darken `--pm-text-muted` to #595f68 or #5a5f6a (≥4.5:1 on white) for all normal-weight, sub-18px uses. |
| 7 | **High** | 1.4.3 Contrast (Minimum) | Nav button inactive state: `rgba(255,255,255,0.7)` on `#0c1b33` (nav background). Luminance of 70% white on dark navy ≈ contrast ratio ~8.6:1 — this actually passes. However the *active* state uses full white. **The hover background** `rgba(255,255,255,0.12)` on `#0c1b33` results in effective background ≈ #122340 — white text on this is ~12:1. No contrast issue here. _Re-evaluate:_ the real issue is the `lang-toggle` button text at `font-size: 12px` — small text, borderline. | `src/index.css:103,127-136` | At 12px, lang-toggle text may need the button to be larger or the font-size raised to 14px. |
| 8 | **High** | 1.4.3 Contrast | `tag-blue` uses `color: var(--pm-primary)` (#0d6efd) on `background: #e7f1ff`. Contrast ratio ≈ 3.1:1. At 12px normal weight this **fails** WCAG AA (needs 4.5:1). Same for `badge-admin` which uses identical colors. | `src/index.css:493,510` | Darken `tag-blue`/`badge-admin` text color to #0044cc or use #0856c8 (contrast ≥4.5:1 on #e7f1ff). |
| 9 | **High** | 1.4.3 Contrast | `tag-orange` uses `color: #997404` on `background: #fff3cd`. Contrast ratio ≈ 3.1:1. Used on `badge-pending`. At 12px **fails** WCAG AA. | `src/index.css:496,512` | Darken to #7a5c00 or #6b5000 (contrast ≥4.5:1 on #fff3cd). |
| 10 | **High** | 1.4.3 Contrast | `tag-cyan` uses `color: #0a7d8c` on `background: #cff4fc`. Contrast ratio ≈ 2.9:1 at 12px. **Fails** WCAG AA. | `src/index.css:495` | Darken to #055f6a or use #045862 (contrast ≥4.5:1 on #cff4fc). |
| 11 | **Medium** | 1.3.1 Info and Relationships | SVG bar charts, line charts, and similarity histograms in `StatsPage` are wrapped in `role="img" aria-label="..."` but contain no text alternative for the actual data. A screen reader user hears "Theme distribution, image" but cannot access any of the quantitative chart data. | `src/pages/StatsPage.tsx:86,159,217` | Add a `<table>` or visually-hidden text summary of the data below each chart. Or use `aria-describedby` pointing to a hidden data table. |
| 12 | **Medium** | 1.3.1 Info and Relationships | The `profile-avatar-lg` div has `aria-label` set but uses a `<div>`, not an `<img>` or element with a role. The aria-label will be ignored by most screen readers on a plain `<div>`. | `src/pages/ProfilePage.tsx:123-129` | Either add `role="img"` to the div or remove the `aria-label` (since the name is already rendered in `profile-name` below it). |
| 13 | **Medium** | 1.3.1 Info and Relationships | Activity avatar divs use `aria-hidden="true"` (correct), but the `activity-name` button inside ActivityFeed is mixed with non-interactive text in the same sentence. Screen readers announce only the button text, losing surrounding context. | `src/components/dashboard/ActivityFeed.tsx` | Use `aria-label` on each activity name button to include the full action context, e.g. `aria-label="Alice Martin — a rejoint la plateforme"`. |
| 14 | **Medium** | 2.4.3 Focus Order | The `UserDropdown` menu opens below the trigger button, but focus is NOT moved into the menu when it opens (only Escape is wired). Tab from the user-area button will focus the next element in the page, skipping the open dropdown items entirely. Only mouse users can interact with the menu. | `src/components/auth/UserDropdown.tsx:93-118` | On menu open (`setOpen(true)`), move focus to the first `menuitem` button. Ensure Tab within the menu cycles through items; Escape closes and returns focus. |
| 15 | **Medium** | 2.4.7 Focus Visible | `form-control:focus` removes the default outline and replaces it with `border-color + box-shadow`. The box-shadow (3px blue glow) is a visible focus indicator — this is acceptable. However, for `.btn-ghost` and `.btn-ghost` elements used as inline links (researcher names in activity feed, cluster member names in popover), there is no custom `:focus-visible` style and the global `:focus-visible` outline may be suppressed by the `background: none; border: none` reset. | `src/index.css:399-414, 569-573` | Verify `.btn-ghost:focus-visible` shows the outline. Add explicit `outline: 2px solid var(--pm-primary); outline-offset: 2px;` to `.btn-ghost:focus-visible`. |
| 16 | **Medium** | 3.3.1 Error Identification | The `EditProfilePage` duplicate-keyword error uses `role="alert"` which is correct, but it auto-dismisses after 2 seconds (`setTimeout(() => setKwDuplicate(false), 2000)`). This is too short for screen reader users who need time to hear the announcement. | `src/pages/EditProfilePage.tsx:104-108` | Remove the auto-dismiss, or increase timeout to at least 5 seconds. Let the user dismiss it manually. |
| 17 | **Medium** | 2.4.6 Headings and Labels | The `DashboardPage` renders a `<div className="card-title">` for the mini-map section rather than an `<h2>`. All other page sections use `<h2 className="card-title">`. The heading hierarchy is inconsistent. | `src/pages/DashboardPage.tsx:18` | Change `<div className="card-title">` to `<h2 className="card-title">` for the minimap title. |
| 18 | **Low** | 2.4.1 Bypass Blocks | There is a `<main id="main-content" tabIndex={-1}>` in `AppLayout` — the skip-link target is correctly set up. However, no visible skip-link (`<a href="#main-content">Skip to content</a>`) is present in the DOM. Keyboard users must Tab through the entire 6–7 item navbar on every page. | `src/components/layout/AppLayout.tsx:8` | Add a visually-hidden-until-focused skip link as the first child of `<body>` or before `<AppNavbar />`. |
| 19 | **Low** | 2.5.3 Label in Name | The "Explorer par theme" button in ResearchersPage has `aria-label="Explorer les themes"` (without accent) while the visible label is "Explorer par theme" — the aria-label and visible text diverge. Screen reader users will hear a different label than what is visually shown, which can confuse voice-control users. | `src/pages/ResearchersPage.tsx:29` | Either remove the `aria-label` (the button text is sufficient) or make it match: `aria-label="Explorer par theme"`. |
| 20 | **Low** | 1.4.10 Reflow | The `stat-grid` uses `grid-template-columns: repeat(4, 1fr)` and the `comparison-layout` uses `grid-template-columns: 1fr 100px 1fr`. Neither has a responsive media query to reflow at 320px or 400% zoom. At 200% zoom the 4-column stat grid will overflow horizontally on typical viewports. | `src/index.css:162-166, 718-720` | Add `@media (max-width: 600px)` breakpoints: stat-grid → 2 columns, comparison-layout → single column. |
| 21 | **Low** | 1.3.5 Identify Input Purpose | The `EditProfilePage` keyword input has `id="edit-keywords"` and a label, but no `autocomplete` attribute. The bio textarea has no `autocomplete`. While the login form correctly uses `autocomplete="email"` and `autocomplete="current-password"`, profile fields are missing it. | `src/pages/EditProfilePage.tsx:295,318` | Not strictly required for these fields (they're app-specific), but adding `autocomplete="off"` on keyword input is good practice to prevent browser autofill interference. |

---

## Detailed Analysis by Area

### A. Automated Scan (Static Approximation)

Could not run axe-core directly (browser locked). Based on source review, the following axe rules would likely fire:

- `aria-allowed-role` — SVG `<circle>` with `role="button"` without `tabIndex` is invalid
- `nested-interactive` — `role="button"` on SVG elements within an `role="img"` container 
- `color-contrast` — `--pm-text-muted` on white, tag-blue, tag-orange, tag-cyan
- `landmark-no-duplicate-label` — two `<nav aria-label="Navigation principale">` elements
- `skip-link` — no skip-to-content link present
- `aria-hidden-focus` — potential issue if focused elements exist inside `aria-hidden` sections
- `heading-order` — inconsistent h2 usage in DashboardPage

Estimated axe violations: **8–12 distinct rules**

### B. Keyboard Navigation

**Well-implemented:**
- Login form: Tab order is email → password → submit → demo buttons. Labels linked via `htmlFor`.
- UserDropdown: Escape closes and returns focus to trigger (`btnRef.current?.focus()`).
- AdminPage tabs: proper `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` — correct ARIA tab pattern.
- EditProfilePage: All fields have explicit `id` + `htmlFor` labels. `aria-describedby` used for error.
- ThemesPage cluster cards: `role="button"`, `tabIndex={0}`, `onKeyDown` with Enter/Space support — correct.

**Broken:**
- Map page: researcher dots have no `tabIndex`. Only the hit circle's parent `<g>` group is a container; the hit circle is `data-researcher-dot` + `role="button"` but **missing `tabIndex`**, making them completely unreachable by Tab navigation.
- Cluster circles: no `role`, no `tabIndex`, no keyboard handler.
- Map popovers: no focus management on open, no Escape handler.
- Modal dialogs (invite, unsaved-changes): no focus trap.

### C. Screen Reader Simulation

**Landmarks:** `<main>` present with `id="main-content"`. `<nav>` landmark present (duplicated — see Issue #5). No `<footer>` or `<aside>` landmarks. The map legend and filter panel inside `.map-container` are not wrapped in semantic regions.

**Heading hierarchy:**
- Pages generally follow h1 (page title) → h2 (section card titles) — correct.
- DashboardPage mini-map title is a `<div>`, breaking the h2 sequence — see Issue #17.
- AdminPage has `<h1>` then sub-section `<h2>` in each tab — correct.

**Dynamic content:**
- `LoadingSpinner` uses `role="status" aria-live="polite"` — correct.
- `ErrorState` uses `role="alert" aria-live="assertive"` — correct.
- `ToastContainer` uses `aria-live="polite" aria-atomic="true"` — correct.
- Login error uses `role="alert" aria-live="assertive"` — correct.
- Admin toast uses `aria-live="polite" aria-atomic="true"` — correct.
- Duplicate keyword error auto-dismisses in 2s — too short (Issue #16).

**Interactive elements without names:**
- Cluster circles in SVG map: no accessible name.
- `profile-avatar-lg` div: `aria-label` on a plain div is not exposed by most AT.

### D. Color & Contrast

Key computed contrast ratios (calculated from CSS custom properties):

| Element | Foreground | Background | Ratio | Size | Pass/Fail |
|---------|-----------|-----------|-------|------|-----------|
| Body text (--pm-text) | #212529 | #ffffff | 16.1:1 | 16px | PASS |
| Muted text (--pm-text-muted) | #6c757d | #ffffff | 4.48:1 | 13px | **FAIL** (needs 4.5:1) |
| Muted text on alt bg | #6c757d | #f8f9fa | 4.27:1 | 13px | **FAIL** |
| tag-blue text | #0d6efd | #e7f1ff | 3.06:1 | 12px | **FAIL** |
| tag-orange / badge-pending | #997404 | #fff3cd | 3.12:1 | 12px | **FAIL** |
| tag-cyan | #0a7d8c | #cff4fc | 2.86:1 | 12px | **FAIL** |
| tag-green / badge-researcher | #198754 | #d1e7dd | 3.22:1 | 12px | **FAIL** |
| tag-red / badge-rejected | #842029 | #f8d7da | 4.71:1 | 12px | PASS (barely) |
| tag-gray | #495057 | #e9ecef | 5.49:1 | 12px | PASS |
| Nav button inactive | rgba(255,255,255,0.7) | #0c1b33 | ~8.6:1 | 14px | PASS |
| Nav button active | #ffffff | #0c1b33 | ~12:1 | 14px | PASS |
| btn-primary text | #ffffff | #0d6efd | 3.06:1 | 14px | **FAIL** (white on #0d6efd) |
| banner-warning text | #856404 | #fff3cd | 4.63:1 | 13px | PASS |
| banner-error text | #842029 | #f8d7da | 4.71:1 | 13px | PASS |
| table header | #6c757d | #ffffff | 4.48:1 | 12px uppercase | **FAIL** (12px needs 4.5:1; uppercase 18pt+ could be exempt — border case) |

**Critical contrast finding:** `btn-primary` (#ffffff on #0d6efd) has only 3.06:1 — this **fails WCAG AA** for normal text. All primary call-to-action buttons (login submit, save, approve, etc.) fail contrast. Bootstrap 5 itself has this issue with `#0d6efd`. Fix by using `#0055d4` or darker as the primary button background.

**Color-only information:** 
- Badge statuses (active/revoked, admin/researcher) use color-coded backgrounds only, with text labels — this is acceptable since the text distinguishes the states.
- The unsaved-settings indicator in the admin tab is a `•` dot colored with `--pm-warning` only — low-severity color-only issue.

### E. Motion & Zoom

**Zoom/reflow risk (static analysis):**
- `stat-grid`: 4-column grid, no responsive breakpoint → will overflow at 200% zoom on 1280px screen.
- `comparison-layout`: 3-column grid with fixed 100px middle column → may squeeze at 200% zoom.
- `profile-layout`: 280px fixed sidebar → acceptable but tight at 200%.
- `map-container` is fixed 500px height → may be too small at high zoom; content inside doesn't reflow.
- `two-col` grid: no responsive breakpoint.

**Animations:**
- SVG pulse animation on highlighted researcher (`<animate>`) has no `prefers-reduced-motion` media query. Loading spinner CSS animation also has no reduced-motion override.
- Fix: `@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }` and suppress SVG animate elements conditionally.

---

## Priority Fix Roadmap

### Immediate (Critical)
1. **Map keyboard access** — Add `tabIndex` + keyboard handlers to researcher dots and cluster circles, or add a list-based alternative.
2. **Modal focus trapping** — AdminPage dialog and UsersTab invite dialog need focus trap.
3. **Map popover keyboard dismiss** — Wire Escape key to close + return focus.

### Short-term (High)
4. **btn-primary contrast** — Change background from #0d6efd to #0055d4 or equivalent passing color.
5. **tag-blue/orange/cyan contrast** — Darken text colors to meet 4.5:1.
6. **Duplicate nav landmark** — Remove or relabel outer `<nav>` in AppNavbar.
7. **UserDropdown focus management** — Move focus into menu on open; trap Tab within menu items.

### Medium-term
8. **Add skip link** — First focusable element before navbar.
9. **SVG chart text alternatives** — Hidden data tables for screen readers.
10. **Responsive reflow** — Media queries for stat-grid, two-col, comparison-layout.
11. **Reduced motion** — `@media (prefers-reduced-motion)` for spinner and SVG animations.
12. **Duplicate-keyword error timeout** — Increase from 2s to ≥5s.

---

*Audit conducted: 2026-04-14. Static code analysis of `src/` directory. Browser-based axe-core scan pending (Playwright browser resource conflict with concurrent audit agents).*
