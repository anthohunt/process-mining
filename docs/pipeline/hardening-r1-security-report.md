# Security Audit Report — Round 1

## Executive Summary
- **Overall risk: HIGH**
- Vulnerabilities found: 13 npm CVEs (6 high, 7 moderate); 4 code-level issues (2 high, 2 medium)
- Dependencies with CVEs: 6 packages (ajv, esbuild/vite, minimatch, path-to-regexp, smol-toml, undici)

---

## Issue List

| # | Severity | OWASP Category | Issue | File:Line | Evidence | Fix |
|---|----------|----------------|-------|-----------|----------|-----|
| 1 | **CRITICAL** | A02 Cryptographic Failures | `.env.local` contains full production credentials (Postgres password, service role key, JWT secret, OIDC token) committed adjacent to gitignored pattern `.env*.local`. File is gitignored but exists on disk with real secrets. | `.env.local` | `POSTGRES_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `VERCEL_OIDC_TOKEN` all present in plaintext | Rotate all credentials immediately. Ensure `.env.local` is never shared. Consider using Vercel's environment variable dashboard exclusively. |
| 2 | **HIGH** | A01 Broken Access Control | No route-level authentication guard in React Router. `/admin` and all protected routes are accessible client-side without authentication (only UI hides content; `AdminPage` renders a plain "access denied" message, not a redirect). A non-authenticated user hitting `/admin` directly gets the full page shell. | `src/App.tsx:51`, `src/pages/AdminPage.tsx:30-38` | No `<ProtectedRoute>` or auth guard wrapping any route. `isAdmin` check is UI-only. | Add a `PrivateRoute` component that redirects to `/login` for unauthenticated users, and a separate admin guard for `/admin`. |
| 3 | **HIGH** | A01 Broken Access Control | Admin role check reads `user_metadata.role` from the client-side JWT. Any user who can set their own `user_metadata.role = 'admin'` (e.g., via Supabase direct API call with anon key) would pass the `verifyAdmin()` check on all API routes. Role should be stored server-side (Supabase `app_metadata`, not `user_metadata`). | `api/admin/users.ts:22`, `api/admin/import.ts:16`, `api/admin/profiles.ts:20`, `api/admin/settings.ts:16` | `const role = user.user_metadata?.role` — `user_metadata` is user-writable | Move role to `app_metadata` (set via service role key only). Change check to `user.app_metadata?.role`. |
| 4 | **HIGH** | A06 Vulnerable Components | 6 npm dependencies have CVEs: `undici` (7 CVEs including HTTP smuggling, DoS, insufficient randomness), `path-to-regexp` (ReDoS — backtracking regex), `minimatch` (3 ReDoS CVEs), `esbuild`/`vite` (GHSA-67mh-4wv8-2f99 — dev server CORS bypass), `ajv` (ReDoS), `smol-toml` (DoS). | `package-lock.json` | `npm audit` output: 13 vulns, 6 high | Run `npm audit fix` for non-breaking fixes. `smol-toml` is fixable without breaking changes. For `@vercel/node` deps, update to latest `@vercel/node` which pins fixed transitive deps. |
| 5 | **MEDIUM** | A02 Cryptographic Failures | `VITE_SUPABASE_ANON_KEY` (JWT) is baked into the production JavaScript bundle and visible to any client. This is expected for Supabase anon keys (by design), but the anon key expiry is year 2095 (`exp: 2091619962`), providing a 70-year window if the key is ever compromised. | `dist/assets/index-C9ieAOyU.js` | JWT `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` found in bundle | Accept as expected for anon key, but document this in a security runbook. Ensure Supabase RLS policies are the actual security boundary, not obscurity. |
| 6 | **MEDIUM** | A05 Security Misconfiguration | `vercel.json` has no security headers (no `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`). CSP is absent entirely, meaning XSS would have no browser-level mitigation. | `vercel.json` | File contains only rewrites, zero security headers | Add a `headers` block in `vercel.json` with a strict CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`. |
| 7 | **MEDIUM** | A05 Security Misconfiguration | No rate limiting on any API route. The `/api/admin/import` endpoint accepts arbitrary arrays of rows with no size cap. A malicious admin could import unlimited records in a single request, causing unbounded DB writes. | `api/admin/import.ts:32` | `if (!Array.isArray(rows) \|\| rows.length === 0) return res.json({ count: 0 })` — no maximum row count | Add `if (rows.length > 500) return res.status(400).json({ error: 'Too many rows' })` or similar guard. |
| 8 | **LOW** | A09 Security Logging Failures | Audit log entries for admin actions hardcode `user_name: 'Admin'` instead of recording the actual authenticated user. This defeats the purpose of the audit log for accountability. | `api/admin/import.ts:57`, `api/admin/profiles.ts:67,80`, `api/admin/settings.ts:83` | `user_name: 'Admin'` literal in all server-side audit entries | Extract the verified user's identity from the JWT in `verifyAdmin()` and return it; pass it down to audit log insertions. |
| 9 | **LOW** | A05 Security Misconfiguration | `vite.config.ts` has no explicit `build.sourcemap: false`. Currently source maps are not generated (confirmed: no `.map` files in `dist/`), but this is only because Vite's default is `false`. An inadvertent config change could expose source maps. | `vite.config.ts` | No `build` key present | Explicitly set `build: { sourcemap: false }` to document the intent and prevent accidental enabling. |
| 10 | **LOW** | A03 Injection | CSV import parsing in `parseCsvFile` does minimal sanitization (strips leading/trailing quotes) but does not sanitize field values before inserting into the database. A CSV with a researcher name containing SQL-like strings would be passed directly to Supabase. Supabase uses parameterized queries internally, so SQL injection risk is low, but stored XSS could occur if bio/name fields are later rendered unsafely. | `src/hooks/useAdminImport.ts:33` | `cols[nomIdx] ?? ''` — raw value used without sanitization | Trim and length-cap each field before submission. Enforce max lengths server-side in `api/admin/import.ts`. |
| 11 | **INFO** | A07 Auth Failures | Demo credentials hardcoded in source: `admin@cartoPM.fr` / `demo123456` and `researcher@cartoPM.fr` / `demo123456`. If the demo accounts exist in production with these credentials, any user can log in as an admin. | `src/pages/LoginPage.tsx:59-60` | Plaintext credentials in client-side JS | Disable or remove demo accounts in production, or ensure they do not have admin privileges. Prefer environment-variable-gated demo mode. |

---

## Evidence

### A. npm audit output (summary)
```
13 vulnerabilities (7 moderate, 6 high)

undici <=6.23.0 — HIGH (7 CVEs: HTTP smuggling, DoS, insufficient randomness)
path-to-regexp 4.0.0–6.2.2 — HIGH (ReDoS backtracking)
minimatch 10.0.0–10.2.2 — HIGH (3 ReDoS CVEs)
esbuild <=0.24.2 / vite <=6.4.1 — MODERATE (dev CORS bypass GHSA-67mh-4wv8-2f99)
ajv 7.0.0–8.17.1 — MODERATE (ReDoS with $data option)
smol-toml <1.6.1 — MODERATE (DoS via commented lines)
```

### B. user_metadata role escalation vector
```typescript
// api/admin/users.ts:22 — ALL four API files have same pattern
const role = user.user_metadata?.role
if (role !== 'admin') throw new Error('Forbidden')
// user_metadata is user-controlled; should use app_metadata
```

### C. No route auth guard
```typescript
// src/App.tsx — no PrivateRoute wrapping
<Route element={<AppLayout />}>
  <Route path="/" element={<DashboardPage />} />
  ...
  <Route path="/admin" element={<AdminPage />} />  // No auth guard
</Route>
// AdminPage.tsx:30 — only UI-level block, not redirect
if (!isAdmin) {
  return <div><p>Acces refuse...</p>...</div>
}
```

### D. No security headers in vercel.json
```json
{
  "rewrites": [...]
  // No "headers" key — CSP, HSTS, X-Frame-Options all absent
}
```

### E. Production bundle contains VITE_ anon key
```
dist/assets/index-C9ieAOyU.js contains:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRleWxzdnFsb2dkb294cXVtaGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNDM5NjIsImV4cCI6MjA5MTYxOTk2Mn0...
exp: 2091619962 (year ~2035) — long-lived key
```

### F. Demo credentials in client code
```typescript
// src/pages/LoginPage.tsx:59-60
const demoEmail = role === 'admin' ? 'admin@cartoPM.fr' : 'researcher@cartoPM.fr'
const demoPassword = 'demo123456'
```

### G. Audit log identity not captured
```typescript
// api/admin/import.ts:57 — same in profiles.ts and settings.ts
body: JSON.stringify({
  action: 'Import',
  detail: `Import de ${rows.length} chercheur(s)`,
  user_name: 'Admin',  // hardcoded — real actor not recorded
})
```

### H. Build output
- No source maps in `dist/` — GOOD
- 11 `console.*` calls remain in production bundle — LOW risk (mostly from libraries)
- No leaked service role key in bundle — GOOD
