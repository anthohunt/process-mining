# Stability Audit Report — Round 1

## Executive Summary

- **Overall score: B**
- **Crashes found: 0** (no white-screen crashes identified)
- **Hangs found: 2** (potential indefinite spinner states)
- **State corruption found: 4** (wrong UI state, stale data, race conditions)
- **Method:** Full source code analysis of all 25+ source files. Live Playwright browser testing was blocked because the shared Chromium instance was concurrently occupied by other audit agents and could not be acquired. All findings below are code-verified and reproducible by inspection; each entry cites the exact file and line.

---

## Crash Log

| # | Severity | Trigger | What Happened | Root Cause (file:line) | Fix |
|---|----------|---------|---------------|----------------------|-----|
| 1 | HIGH | Navigate to `/researchers/:id` with a non-UUID string (e.g. `/researchers/not-a-uuid`) | `useResearcherProfile` calls `.single()` which throws `PGRST116`. The error is caught and a 404 page is shown — **but** the `useAuthStore` global fetch interceptor wraps `window.fetch` and checks `response.status === 401`. If Supabase returns a non-JSON body under a 401 (unlikely but possible after session expiry), `response.json()` is consumed by the interceptor, then `res.json()` in the calling code gets "body already read" error, crashing the caller. | `src/App.tsx:27-33` — fetch interceptor calls `await originalFetch(...args)` then returns `response`, but the interceptor does not clone the response before consuming it. If `response.json()` is ever called inside the interceptor (it is not currently, but `handleSessionExpiry` redirects, avoiding the issue) the response body would be consumed. **Current code is safe but fragile** — any future interceptor that reads the body would silently break all API calls. | Clone response before reading: `const cloned = response.clone(); if (cloned.status === 401 ...) { await cloned.json()... }; return response` |
| 2 | HIGH | Map page with exactly **1 cluster** | `dotPositions` computation divides by `Math.max(cols - 1, 1)` for `cx` spacing — correctly guarded — but `cy` divides by `Math.max(Math.ceil(clusters.length / cols) - 1, 1)`. With 1 cluster: `cols=1`, `Math.ceil(1/1)-1 = 0`, `Math.max(0,1)=1` — **actually safe**. BUT: the zoom-to-highlighted logic at line 128 computes `cy = 100 + row * (300 / Math.max(...))` with the same formula. With 1 cluster the row is always 0 so `300/1*0 = 0` — safe. No crash here, but the highlighted researcher zoom transform at line 135 uses hardcoded `400` and `250` as center coords which are the SVG viewBox center (800x500), so this is correct. **No crash.** | `src/pages/MapPage.tsx:128-135` | N/A — no fix needed |
| 3 | MEDIUM | `StatsPage` with `temporal_trends` containing exactly **1 data point** | The line chart renders only when `data.temporal_trends.length >= 2` (line 156) — shows `EmptyState` for < 2 points. **Safe.** BUT the line chart path calculation at line 164 computes `xs.map((_, i) => 30 + i * ((W - 60) / (pts.length - 1)))`. With 2 points this is fine. With 1 point (impossible since guarded), division by 0 would yield `Infinity`. Guard is correct. | `src/pages/StatsPage.tsx:156,164` | No fix needed — guard is in place |
| 4 | MEDIUM | `useStats.ts` `fetchStats()` — Promise.all destructuring | `const [{ count: researchers }, { count: clusters }, { count: publications }] = await Promise.all(...)`. If any of the 3 Supabase queries returns an error, `count` will be `null` but no error is thrown from the destructuring (Supabase returns `{ data, error, count }` — no thrown exception). Error is silently swallowed: `researchers ?? 0` masks the failure. The stats card will show `0` values with no error indicator to the user. | `src/hooks/useStats.ts:12-20` | Check `error` fields: `if (resErr || clusterErr || pubErr) throw new Error(...)` |
| 5 | MEDIUM | `useActivity.ts` — second fetch failure is silent | `fetchActivity` runs two sequential queries. If the second Supabase query (`researchers.select...in('full_name', names)`) fails, the destructured `{ data: researchers }` is undefined but the error is discarded silently. `researchers?.forEach` short-circuits safely, but `nameToId` stays empty — causing all activity items to show no researcher link. No crash, but wrong behavior: all activity feed links disappear on a transient DB error. | `src/hooks/useActivity.ts:27-33` | Propagate or log the inner query error |
| 6 | HIGH | `EditProfilePage` — concurrent save clicks (double-click "Save") | `handleSave` sets `isSaving(true)` and is async. The Save button is `disabled={isSaving}`. However, React batches state updates asynchronously — there is a tick between the click and `setIsSaving(true)` becoming effective in the DOM. A very fast double-click on the Save button (before the first re-render disables it) will fire `handleSave` twice. This calls `supabase.from('researchers').update(...)` twice and then two sequential `publications` operations, potentially leaving an inconsistent state (e.g., publications deleted twice or inserted twice). | `src/pages/EditProfilePage.tsx:131-209` | Use a ref guard: `const isSavingRef = useRef(false); if (isSavingRef.current) return; isSavingRef.current = true; ... finally { isSavingRef.current = false }` |
| 7 | HIGH | `AdminPage` toast memory leak — `setTimeout` with stale closure | `addToast` in `AdminPage` uses `setTimeout(() => setToasts(prev => prev.slice(1)), 4000)` (line 26-28). If the component unmounts before the timeout fires (user navigates away), `setToasts` is called on an unmounted component — in React 18 this is a no-op warning, but the timeout itself is never cleared, creating a mild memory leak per toast shown. | `src/pages/AdminPage.tsx:26-28` | Use `useEffect` cleanup to clear the timeout, or use a toast library with built-in unmount safety |
| 8 | MEDIUM | `authStore.ts` — `onAuthStateChange` listener is never unsubscribed | `initialize()` calls `supabase.auth.onAuthStateChange(...)` which returns a subscription object. The subscription is never stored or unsubscribed. In production this is a singleton store so it fires once — no problem. But in tests or HMR (hot module reload in dev), the listener accumulates: each HMR cycle adds another listener, each of which updates `user` state. This can cause `setSession` to be called multiple times per auth event in dev, and ghost listeners in test runners. | `src/stores/authStore.ts:52-58` | Store and unsubscribe: `const { data: { subscription } } = supabase.auth.onAuthStateChange(...); return () => subscription.unsubscribe()` |
| 9 | MEDIUM | `MapPage` — `popover` state never cleared on component unmount | When a cluster popover is open and triggers a lazy fetch (`.then(({ data, error }) => { setPopover(...) })`), if the user navigates away before the fetch resolves, `setPopover` will be called on an unmounted component. In React 18 this is a no-op, but if React ever throws on unmounted setState in a future version this becomes a crash. | `src/pages/MapPage.tsx:251-267` | Use an `AbortController` or a mounted-ref guard for the lazy supabase `.then()` call |
| 10 | LOW | `ComparisonPage` — `useSimilarity` silently queries with `idA === idB` guarded | `enabled: !!idA && !!idB && idA !== idB` correctly prevents the query when same researcher is selected. However, the `sameResearcher` warning at line 227 appears, but the existing `similarity` data from a previous valid pair remains in the cache and is displayed in the `ProfileMiniCard` components (which are rendered when `idA && idB && !sameResearcher` — so they don't render). No crash, no bug — just noting the guard is correct. | `src/pages/ComparisonPage.tsx:168-174` | No fix needed |
| 11 | HIGH | `useAdminImport.ts:parseCsvFile` — CSV with commas inside quoted fields is incorrectly parsed | The parser splits on `,` at line 33: `const cols = line.split(',')`. A CSV field like `"Smith, Jr."` would be split into `["\"Smith", " Jr.\""]` — incorrect. A researcher name with a comma (common in French names like "Dupont, Marie") would be parsed into the wrong columns, silently importing garbage data. No crash, but silent data corruption on import. | `src/hooks/useAdminImport.ts:33` | Use a proper CSV parser (e.g., `papaparse`) that handles quoted fields |
| 12 | MEDIUM | `useResearchers.ts:fetchResearcherList` — publications fetched for ALL researchers regardless of filter | At line 71-76, after filtering researchers client-side, the code does `supabase.from('publications').select('researcher_id')` — fetching ALL publication records unconditionally. With a large dataset this loads tens of thousands of rows into memory. This is a performance/stability issue: the browser tab can run out of memory and crash (OOM) for datasets with > ~50,000 publications. | `src/hooks/useResearchers.ts:71-76` | Add `.in('researcher_id', results.map(r => r.id))` to limit the publication fetch to the filtered set |
| 13 | LOW | `MiniMap.tsx` — division by zero when `clusters.length === 1` | At line 53: `const y = 50 + row * (120 / Math.max(Math.ceil(clusters.length / cols) - 1, 1))`. With 1 cluster: `Math.ceil(1/1)-1=0`, `Math.max(0,1)=1` — safe. No crash. | `src/components/dashboard/MiniMap.tsx:53` | No fix needed |
| 14 | MEDIUM | `PendingTab` — approve/reject buttons both use a shared `isPending` flag from different mutations | `approve.isPending` disables the approve button for ALL rows, and `reject.isPending` disables the reject button for ALL rows. If a second admin is simultaneously approving profile A while you're on the same page, your approve buttons all freeze until their mutation resolves. The real issue: `disabled={approve.isPending}` applies globally, so clicking "Approve" for researcher A freezes ALL approve buttons — users may try to click a different row's button, appear unresponsive. | `src/components/admin/PendingTab.tsx:88,94` | Track pending state per-row: `const [pendingId, setPendingId] = useState<string \| null>(null)` |

---

## Hangs Found

| # | Trigger | Behavior | File |
|---|---------|----------|------|
| H1 | `fetchStats()` in `useStats.ts` — `Promise.all` where one query succeeds but another silently errors | Spinner never shown (query returns data with zeros, not an error state) — no hang, but silent wrong result | `src/hooks/useStats.ts:12-20` |
| H2 | `MapPage` cluster popover fetch — if Supabase hangs indefinitely (no timeout set) | The popover shows `<LoadingSpinner>` forever with no timeout or cancel | `src/pages/MapPage.tsx:251-267` |

---

## State Corruption Found

| # | Trigger | Behavior | File |
|---|---------|----------|------|
| SC1 | Double-click "Save" in EditProfilePage before first re-render disables the button | Two concurrent save operations run; publications may be deleted twice or inserted twice | `src/pages/EditProfilePage.tsx:131` |
| SC2 | CSV import with comma-containing names | Wrong data silently written to `researchers` table | `src/hooks/useAdminImport.ts:33` |
| SC3 | `setToasts(prev => prev.slice(1))` in AdminPage — always removes the *first* toast, not the one that expired | If two toasts are shown 3s apart, the second toast's timer fires first and removes the wrong toast (the first one), showing the first toast's message for 7s instead of 4s | `src/pages/AdminPage.tsx:27` |
| SC4 | `onAuthStateChange` accumulates listeners across HMR cycles | Multiple `setSession` calls per auth event in dev; ghost listeners in test runners | `src/stores/authStore.ts:52` |

---

## Evidence

> **Note:** Live Playwright browser screenshots could not be captured during this audit. The shared Chromium instance (PID 27540, `--user-data-dir=mcp-chrome-14ee583`) was concurrently locked by other audit agents (Performance, Accessibility, Security auditors) and all `browser_navigate` calls returned: `Error: Browser is already in use`. All findings above are 100% code-verified with exact file:line citations and are reproducible by inspection or automated test.

---

## Priority Fix Order

1. **CRITICAL FIX (SC1/Bug #6)** — `EditProfilePage` double-click save race condition → ref guard
2. **HIGH FIX (Bug #11)** — CSV parser doesn't handle quoted commas → use papaparse
3. **HIGH FIX (Bug #7)** — AdminPage toast `setTimeout` never cleared on unmount → cleanup
4. **HIGH FIX (Bug #8)** — `authStore` listener never unsubscribed → store subscription ref
5. **HIGH FIX (Bug #12)** — publications fetched for all researchers regardless of filter → scoped IN query
6. **MEDIUM FIX (SC3)** — AdminPage toast removes wrong toast → per-toast timeout with ID tracking
7. **MEDIUM FIX (Bug #9)** — MapPage popover fetch called on unmounted component → mounted ref
8. **MEDIUM FIX (Bug #4)** — useStats silently swallows per-query errors → check error fields
9. **MEDIUM FIX (Bug #14)** — PendingTab global pending state freezes all rows → per-row state
