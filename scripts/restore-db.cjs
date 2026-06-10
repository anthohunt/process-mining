/**
 * Restore DB schema + data into a fresh Supabase project via the Management API.
 * SQL runs server-side (no direct Postgres connection needed — avoids IPv6 issue).
 *
 * Usage: SUPABASE_PAT=sbp_xxx PROJECT_REF=xxx node scripts/restore-db.cjs
 */
const fs = require('fs');
const path = require('path');

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.PROJECT_REF;
if (!PAT || !REF) { console.error('Missing SUPABASE_PAT or PROJECT_REF'); process.exit(1); }

const FILES = [
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_rls_policies.sql',
  'supabase/migrations/004_real_researcher_data.sql',
];

async function runSQL(label, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`❌ ${label} -> HTTP ${res.status}`);
    console.error(text.slice(0, 2000));
    return false;
  }
  console.log(`✅ ${label} -> HTTP ${res.status}`);
  return true;
}

(async () => {
  for (const f of FILES) {
    const sql = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    const ok = await runSQL(f, sql);
    if (!ok) { console.error('Aborting.'); process.exit(1); }
  }
  // Verify counts
  const verify = `select
    (select count(*) from clusters) as clusters,
    (select count(*) from researchers) as researchers,
    (select count(*) from publications) as publications;`;
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: verify }),
  });
  console.log('Verify:', await res.text());
})();
