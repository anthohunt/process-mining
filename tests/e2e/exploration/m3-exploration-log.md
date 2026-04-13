# M3 Exploration Log

## Round 3 Re-takes (2026-04-13)

The following screenshot groups were re-taken to fix byte-identical pairs from Round 2.
Each group is logged incrementally as it completes (appended by the script after each group).

## US-3.4-E1 — No Themes (Round 3 re-take)
- Step 1: Dashboard shown, clusters intercept set to return [] → US-3.4-E1-01-intercept.png (66697 bytes)
- Step 2: Navigated to /themes, captured during loading phase → US-3.4-E1-02-loaded.png (21803 bytes)
- Step 3: Empty state "Aucun theme disponible" visible → US-3.4-E1-03-empty-state.png (21803 bytes)

## US-3.4-E2 — Zero Researchers (Round 3 re-take)
- Step 1: Dashboard shown, clusters intercept with Empty Theme (0 members) + Process Discovery (1 member) → US-3.4-E2-01-intercept.png (66696 bytes)
- Step 2: Navigated to /themes, both cluster cards visible → US-3.4-E2-02-loaded.png (30510 bytes)
- Step 3: Zero-member card focused, clicked to show non-expandable → US-3.4-E2-03-zero-members.png (30507 bytes)

## US-1.4-E1 — Empty Stats Data (Round 3 re-take)
- Step 1: Dashboard shown, all stats endpoints intercepted with [] → US-1.4-E1-01-intercept.png (66696 bytes)
- Step 2: Navigated to /stats, top of page with breadcrumb and first chart → US-1.4-E1-02-loaded.png (44548 bytes)
- Step 3: Scrolled to bottom, all 3 empty chart messages visible → US-1.4-E1-03-empty-charts.png (44548 bytes)

## US-1.4-E3 — Error State (Round 3 re-take)
- Step 1: Dashboard shown, all stats endpoints intercepted with route.abort('failed') → US-1.4-E3-01-intercept.png (66697 bytes)
- Step 2: Navigated to /stats, captured during loading/retry phase → US-1.4-E3-02-loaded.png (16319 bytes)
- Step 3: All retries exhausted, "Erreur de chargement" with retry button visible → US-1.4-E3-03-error-state.png (17852 bytes)
- Used route.abort('failed') instead of route.fulfill({status:500}) to trigger real network errors

## US-3.2-E3 — Loading State (Round 3 re-take)
- Step 1: Map page shown with delayed-researcher intercept set up → US-3.2-E3-01-intercept.png (58090 bytes)
- Step 2: Reloaded /map, captured during loading phase → US-3.2-E3-02-popover-open.png (22108 bytes)
- Step 3: Data loaded, cluster popover opened → US-3.2-E3-03-loading.png (52897 bytes)

## US-3.4-E1 — Updated (Round 3, pass 2)
- Step 2: Full page at top (title + button + empty state) → US-3.4-E1-02-loaded.png
- Step 3: Element-level screenshot of .empty-state → US-3.4-E1-03-empty-state.png
- These now have different dimensions/content since step 3 is element-scoped

## US-1.4-E1 — Updated (Round 3, pass 2)
- Step 2: Full page at top (breadcrumb + title + first chart) → US-1.4-E1-02-loaded.png
- Step 3: Element-level screenshot of last chart card with empty state → US-1.4-E1-03-empty-charts.png
- These now have different dimensions/content since step 3 is element-scoped

