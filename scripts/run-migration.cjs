/**
 * Execute SQL migration against Supabase using the PostgREST rpc endpoint.
 * Splits the migration into batches and runs each via the SQL API.
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://deylsvqlogdooxqumhdz.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  .split('\n').find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY'))
  ?.split('=')[1]?.replace(/"/g, '');

const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '004_real_researcher_data.sql');
const fullSql = fs.readFileSync(sqlFile, 'utf8');

// Split into individual statements
const statements = fullSql
  .split('\n')
  .filter(l => l.trim() && !l.startsWith('--'))
  .join('\n')
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log(`Total statements: ${statements.length}`);

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });
  return res;
}

// Use the pg_net or direct SQL execution via Supabase Management API
async function executeBatch(sql) {
  // Supabase exposes a SQL endpoint at /pg/query for service role
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res;
}

async function main() {
  // First try: execute via service role using the REST API to delete + insert
  // Supabase doesn't have a raw SQL endpoint via REST, so we use the PostgREST API

  console.log('Step 1: Clearing old data via REST API...');

  // Delete in correct FK order
  const tables = ['similarity_scores', 'publications', 'audit_logs', 'researchers', 'clusters'];
  for (const table of tables) {
    // Delete all rows - use a filter that matches everything
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=not.is.null`, {
      method: 'DELETE',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
    if (!res.ok && res.status !== 404) {
      // Try alternative: delete with no filter using special header
      const res2 = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'DELETE',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=minimal',
          'x-client-info': 'migration'
        }
      });
      console.log(`  ${table}: ${res2.status}`);
    } else {
      console.log(`  ${table}: ${res.status} OK`);
    }
  }

  console.log('\nStep 2: Inserting clusters...');
  // Parse cluster inserts from SQL
  const clusterData = [];
  const clusterRegex = /INSERT INTO clusters.*?VALUES \((.+?)\);/g;
  let match;
  while ((match = clusterRegex.exec(fullSql)) !== null) {
    const vals = match[1];
    // Parse: 'id', 'name', 'color', ARRAY[...]
    const idMatch = vals.match(/^'([^']+)'/);
    const nameMatch = vals.match(/, '([^']+)',/);
    const colorMatch = vals.match(/, '(#[^']+)'/);
    const subThemesMatch = vals.match(/ARRAY\[(.+)\]/);

    if (idMatch && nameMatch && colorMatch) {
      const subThemes = subThemesMatch
        ? subThemesMatch[1].split(',').map(s => s.trim().replace(/'/g, ''))
        : [];
      clusterData.push({
        id: idMatch[1],
        name: nameMatch[1],
        color: colorMatch[1],
        sub_themes: subThemes
      });
    }
  }

  if (clusterData.length > 0) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/clusters`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(clusterData)
    });
    console.log(`  Clusters inserted: ${res.status} (${clusterData.length} rows)`);
    if (!res.ok) console.log('  Error:', await res.text());
  }

  console.log('\nStep 3: Inserting researchers (batches of 20)...');
  // Parse researcher inserts
  const researcherLines = fullSql.split('\n').filter(l => l.includes("INSERT INTO researchers"));
  const researchers = [];
  for (const line of researcherLines) {
    const valsMatch = line.match(/VALUES \((.+)\);$/);
    if (!valsMatch) continue;

    // More robust parsing: extract values between the VALUES ( and );
    const raw = valsMatch[1];

    // Use a state machine to parse SQL values
    const vals = parseSqlValues(raw);
    if (vals.length >= 9) {
      researchers.push({
        id: vals[0],
        full_name: vals[1],
        lab: vals[2],
        bio: vals[3],
        keywords: vals[4], // array
        status: vals[5],
        map_x: parseFloat(vals[6]),
        map_y: parseFloat(vals[7]),
        cluster_id: vals[8]
      });
    }
  }

  // Insert in batches
  for (let i = 0; i < researchers.length; i += 20) {
    const batch = researchers.slice(i, i + 20);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/researchers`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(batch)
    });
    process.stdout.write(`  Batch ${Math.floor(i/20)+1}/${Math.ceil(researchers.length/20)}: ${res.status}`);
    if (!res.ok) {
      const err = await res.text();
      console.log(` ERROR: ${err.substring(0, 200)}`);
    } else {
      console.log(` OK (${batch.length} rows)`);
    }
  }
  console.log(`  Total researchers: ${researchers.length}`);

  console.log('\nStep 4: Inserting publications (batches of 50)...');
  const pubLines = fullSql.split('\n').filter(l => l.includes("INSERT INTO publications"));
  const publications = [];
  for (const line of pubLines) {
    const valsMatch = line.match(/VALUES \((.+)\);$/);
    if (!valsMatch) continue;
    const vals = parseSqlValues(valsMatch[1]);
    if (vals.length >= 5) {
      publications.push({
        researcher_id: vals[0],
        title: vals[1],
        coauthors: vals[2],
        venue: vals[3],
        year: parseInt(vals[4])
      });
    }
  }

  for (let i = 0; i < publications.length; i += 50) {
    const batch = publications.slice(i, i + 50);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/publications`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(batch)
    });
    process.stdout.write(`  Batch ${Math.floor(i/50)+1}/${Math.ceil(publications.length/50)}: ${res.status}`);
    if (!res.ok) {
      const err = await res.text();
      console.log(` ERROR: ${err.substring(0, 200)}`);
    } else {
      console.log(` OK (${batch.length} rows)`);
    }
  }
  console.log(`  Total publications: ${publications.length}`);

  console.log('\nStep 5: Inserting similarity scores (batches of 50)...');
  const simLines = fullSql.split('\n').filter(l => l.includes("INSERT INTO similarity_scores"));
  const similarities = [];
  for (const line of simLines) {
    const valsMatch = line.match(/VALUES \((.+)\);$/);
    if (!valsMatch) continue;
    const vals = parseSqlValues(valsMatch[1]);
    if (vals.length >= 4) {
      similarities.push({
        researcher_a: vals[0],
        researcher_b: vals[1],
        score: parseFloat(vals[2]),
        algorithm: vals[3]
      });
    }
  }

  for (let i = 0; i < similarities.length; i += 50) {
    const batch = similarities.slice(i, i + 50);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/similarity_scores`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(batch)
    });
    process.stdout.write(`  Batch ${Math.floor(i/50)+1}: ${res.status}`);
    if (!res.ok) {
      const err = await res.text();
      console.log(` ERROR: ${err.substring(0, 200)}`);
    } else {
      console.log(` OK (${batch.length} rows)`);
    }
  }
  console.log(`  Total similarities: ${similarities.length}`);

  console.log('\nStep 6: Inserting audit logs...');
  const logLines = fullSql.split('\n').filter(l => l.includes("INSERT INTO audit_logs"));
  const logs = [];
  for (const line of logLines) {
    const valsMatch = line.match(/VALUES \((.+?), now\(\)/);
    if (!valsMatch) continue;
    const vals = parseSqlValues(valsMatch[1]);
    if (vals.length >= 3) {
      // Extract interval
      const intervalMatch = line.match(/interval '(\d+) hours'/);
      const hoursAgo = intervalMatch ? parseInt(intervalMatch[1]) : 1;
      const created = new Date(Date.now() - hoursAgo * 3600000).toISOString();
      logs.push({
        user_name: vals[0],
        action: vals[1],
        detail: vals[2],
        created_at: created
      });
    }
  }

  if (logs.length > 0) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(logs)
    });
    console.log(`  Audit logs: ${res.status} (${logs.length} rows)`);
    if (!res.ok) console.log('  Error:', await res.text());
  }

  // Verify
  console.log('\n--- Verification ---');
  const counts = {};
  for (const table of ['clusters', 'researchers', 'publications', 'similarity_scores', 'audit_logs']) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    const count = res.headers.get('content-range');
    console.log(`  ${table}: ${count}`);
  }

  console.log('\nMigration complete!');
}

// Parse SQL VALUES string into array, handling quoted strings and ARRAY[] syntax
function parseSqlValues(raw) {
  const result = [];
  let i = 0;
  while (i < raw.length) {
    // Skip whitespace and commas
    while (i < raw.length && (raw[i] === ' ' || raw[i] === ',')) i++;
    if (i >= raw.length) break;

    if (raw[i] === "'") {
      // Quoted string
      i++; // skip opening quote
      let val = '';
      while (i < raw.length) {
        if (raw[i] === "'" && raw[i + 1] === "'") {
          val += "'";
          i += 2;
        } else if (raw[i] === "'") {
          i++; // skip closing quote
          break;
        } else {
          val += raw[i];
          i++;
        }
      }
      result.push(val);
    } else if (raw.substring(i, i + 5) === 'ARRAY') {
      // ARRAY[...] → parse as JS array
      const start = raw.indexOf('[', i);
      const end = raw.indexOf(']', start);
      const inner = raw.substring(start + 1, end);
      const arr = inner.split(',').map(s => {
        s = s.trim();
        if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
        return s;
      }).filter(s => s.length > 0);
      result.push(arr);
      i = end + 1;
      // Skip optional ::text[]
      if (raw.substring(i, i + 8) === '::text[]') i += 8;
    } else {
      // Number or unquoted value
      let val = '';
      while (i < raw.length && raw[i] !== ',' && raw[i] !== ')') {
        val += raw[i];
        i++;
      }
      result.push(val.trim());
    }
  }
  return result;
}

main().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
