# Hardening Round 2 — Applied Fixes

> ⚠️ C1 OUTSTANDING: `.env.local` contains real credentials. User must rotate Postgres password, Supabase service role key, JWT secret via Supabase dashboard + Vercel env vars. This cannot be done by agents.

---

## H8 — Security Headers (vercel.json)

**File:** `vercel.json`

Added a `headers` block for `source: "/(.*)"` with the following headers:

| Header | Value |
|---|---|
| Content-Security-Policy | See below |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |

**CSP policy:**
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
object-src 'none';
base-uri 'self'
```

**Rationale:**
- `'unsafe-inline'` on `script-src` and `style-src`: Vite injects inline scripts at build time; removing this would require nonce-based CSP wired through the build pipeline (out of scope). Still blocks all external script origins.
- `https://*.supabase.co` + `wss://*.supabase.co`: required for Supabase REST and realtime WebSocket connections.
- `https://fonts.googleapis.com` + `https://fonts.gstatic.com`: Google Fonts loaded in `index.html`.
- `data:` and `blob:` on `img-src`: Three.js renders to canvas and may produce blob/data URLs.
- `frame-ancestors 'none'` is equivalent to `X-Frame-Options: DENY` but honoured by modern browsers that prefer CSP.

The existing `/assets/(.*)` Cache-Control entry (added by perf-fixer) was preserved.

---

## H9 — Import API field validation (api/admin/import.ts)

**File:** `api/admin/import.ts` (~line 32)

Added per-row validation before any database write:

- **Row cap:** returns 400 if `rows.length > 500`
- **name:** required string, 1–200 chars
- **lab:** optional string, ≤200 chars
- **keywords:** optional array, ≤50 items, each item a string ≤50 chars
- **status:** optional enum — must be one of `active`, `pending`, `rejected` if present
- On any violation: returns `{ errors: [...] }` with HTTP 400, listing all violations before any insert

No zod was added (not in project deps); manual validation used instead.

---

## H10 — @vercel/node CVEs

**Checked:** `npm view @vercel/node version` → `5.7.5` (already at latest as of 2026-04-15).

**`npm audit --production` result:** `found 0 vulnerabilities`

The 6 high-severity CVEs documented in the Round 2 audit (minimatch/path-to-regexp ReDoS, undici CRLF/smuggling/DoS) are resolved in `@vercel/node` 5.7.5. No manual package.json update was required — the project was already at the latest version. No further action needed.

---

## Build verification

`npm run build` passes after all changes.
