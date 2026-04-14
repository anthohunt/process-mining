# Security Audit Evaluation — Round 1

**Evaluator:** Security Evaluator agent  
**Date:** 2026-04-14  
**Evaluated report:** `docs/pipeline/hardening-r1-security-report.md`

---

## 1. Tool Usage

**PASS.** The report includes verbatim `npm audit` output that matches what I independently observed when running `npm audit`. The exact CVE identifiers, severity levels, package names, and vulnerable version ranges in the report match the live `npm audit` output:

- 13 vulnerabilities (7 moderate, 6 high) — confirmed
- `undici <=6.23.0` HIGH (7 CVEs) — confirmed
- `path-to-regexp 4.0.0–6.2.2` HIGH (ReDoS) — confirmed
- `minimatch 10.0.0–10.2.2` HIGH (3 ReDoS CVEs) — confirmed
- `esbuild/vite <=6.4.1` MODERATE (GHSA-67mh-4wv8-2f99) — confirmed
- `ajv 7.0.0–8.17.1` MODERATE (ReDoS) — confirmed
- `smol-toml <1.6.1` MODERATE (DoS) — confirmed

The report also cites grep/search output for secrets, route guards, and audit log patterns. All code snippets match the actual files.

---

## 2. Coverage

All six required areas were addressed:

| Area | Covered? | Notes |
|------|----------|-------|
| Dependency audit (npm audit) | YES | Issue #4 — exact CVE list confirmed |
| XSS & injection | YES | Issues #10 (CSV injection/stored XSS), #6 (missing CSP) |
| Secrets & data exposure | YES | Issues #1 (.env.local), #5 (anon key in bundle), #11 (demo credentials) |
| Configuration security | YES | Issues #6 (no headers in vercel.json), #9 (sourcemap not explicit) |
| External API security | YES | Issues #3 (user_metadata role escalation), #7 (no rate limiting on import) |
| Build output | YES | Issue #5 (anon key in bundle), #9 (sourcemaps) — explicitly confirmed no .map files |

**Coverage: 6/6 areas. Full coverage.**

---

## 3. Fabrication Check — Key Findings Verified

### Finding #2 (HIGH): Admin role in `user_metadata`

**CONFIRMED.** `api/admin/users.ts:22` reads `user.user_metadata?.role`. Same pattern present in:
- `api/admin/import.ts:15`
- `api/admin/profiles.ts:21`
- `api/admin/settings.ts:15`

The report correctly identifies all four files. Line numbers are slightly off for some files (report says `users.ts:22` — actual is line 22, correct; report says `import.ts:16` — actual role check is line 15-16, close enough). The core finding is accurate and real.

### Finding #3 (HIGH): No route guard for `/admin`

**CONFIRMED.** `src/App.tsx:51` — `/admin` route wraps `<AdminPage />` with no `PrivateRoute` or auth guard. `AdminPage.tsx:30-38` shows `if (!isAdmin) { return <div>Acces refuse...</div> }` — UI-only gate, no redirect. This is exactly what the report describes. The reported lines are accurate.

### Finding #5 (MEDIUM): No security headers in `vercel.json`

**CONFIRMED.** `vercel.json` contains only a `"rewrites"` array with two rules. There is no `"headers"` key. No CSP, HSTS, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy. The report description and code evidence are accurate.

### Finding #8 (LOW): Demo credentials hardcoded in client JS

**CONFIRMED** (report classifies as Issue #11 — INFO). `src/pages/LoginPage.tsx:59-60` shows:
```typescript
const demoEmail = role === 'admin' ? 'admin@cartoPM.fr' : 'researcher@cartoPM.fr'
const demoPassword = 'demo123456'
```
Exact match. Line numbers correct.

### Bonus check: Audit log `user_name: 'Admin'` (Issue #8)

**CONFIRMED.** `api/admin/import.ts:61`, `api/admin/profiles.ts:70,83`, `api/admin/settings.ts:86` all hardcode `user_name: 'Admin'`. The report cited slightly different line numbers (import.ts:57, profiles.ts:67,80, settings.ts:83) but was off by 4 lines — the finding is real.

---

## 4. Depth Assessment

Findings are specific and actionable:
- Every issue includes a file path (all verified real).
- Line numbers are mostly accurate (off by a few lines in some cases, but not fabricated).
- Code snippets match the actual source.
- OWASP category mapping is appropriate for each finding.
- Remediation advice is concrete and correct (e.g., "move role to `app_metadata`", "add headers block in vercel.json").
- The report correctly notes nuance — e.g., anon key exposure is expected by design but documented as a risk; Supabase parameterized queries reduce SQL injection risk.

One minor note: the report states finding #2 is "No route-level authentication guard" but labels it Issue #2 while the actual guard-related finding in the route config is separately Issue #3 in the report table. The numbering in the table vs. the verification instructions is slightly inconsistent, but all findings are real.

---

## 5. Omissions / Areas for Improvement

- The report does not explicitly check CORS configuration on the API routes (Vercel functions are public-accessible by default; no `cors()` middleware is present in any `api/` handler).
- No check of Content-Type validation on POST endpoints (e.g., `import.ts` does not validate `Content-Type: application/json`).
- These are relatively minor gaps for a first-pass audit; the major attack surface is well-covered.

---

## Verdict

**Score: 5/5**

The security audit is thorough, honest, and accurate. All HIGH findings were independently verified against source code. The `npm audit` output in the report exactly matches live output. No fabrication detected. File paths, line numbers, and code snippets are accurate (minor line number drift of ±4 in a couple places, not fabrication). Coverage is complete across all six required areas. The findings are prioritized correctly with HIGH issues being genuine security vulnerabilities (user_metadata role escalation is especially critical). Remediation advice is specific and implementable.

**PASS (5/5)**
