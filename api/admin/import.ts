import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

async function verifyAdmin(req: VercelRequest): Promise<void> {
  const auth = req.headers['authorization']
  if (!auth?.startsWith('Bearer ')) throw new Error('Unauthorized')
  const token = auth.slice(7)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new Error('Unauthorized')
  const role = user.app_metadata?.role
  if (role !== 'admin') throw new Error('Forbidden')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await verifyAdmin(req)
  } catch (e) {
    return res.status(401).json({ error: (e as Error).message })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const body = req.body as { rows?: unknown }
  const { rows } = body

  if (!Array.isArray(rows) || rows.length === 0) return res.json({ count: 0 })

  if (rows.length > 500) {
    return res.status(400).json({ errors: [`Row count ${rows.length} exceeds maximum of 500`] })
  }

  const VALID_STATUSES = new Set(['active', 'pending', 'rejected'])
  const validationErrors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as Record<string, unknown>
    if (typeof row !== 'object' || row === null) {
      validationErrors.push(`Row ${i}: must be an object`)
      continue
    }
    if (typeof row.name !== 'string' || row.name.trim().length === 0 || row.name.length > 200) {
      validationErrors.push(`Row ${i}: name must be a non-empty string ≤200 chars`)
    }
    if (row.lab !== undefined && (typeof row.lab !== 'string' || row.lab.length > 200)) {
      validationErrors.push(`Row ${i}: lab must be a string ≤200 chars`)
    }
    if (row.keywords !== undefined) {
      if (!Array.isArray(row.keywords) || row.keywords.length > 50) {
        validationErrors.push(`Row ${i}: keywords must be an array of ≤50 items`)
      } else {
        for (let k = 0; k < row.keywords.length; k++) {
          if (typeof row.keywords[k] !== 'string' || (row.keywords[k] as string).length > 50) {
            validationErrors.push(`Row ${i}: keyword[${k}] must be a string ≤50 chars`)
          }
        }
      }
    }
    if (row.status !== undefined && !VALID_STATUSES.has(row.status as string)) {
      validationErrors.push(`Row ${i}: status must be one of active, pending, rejected`)
    }
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors })
  }

  const insertRes = await fetch(`${url}/rest/v1/researchers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  })

  if (!insertRes.ok) {
    const text = await insertRes.text()
    return res.status(500).json({ error: `Insert failed: ${insertRes.status} ${text}` })
  }

  await fetch(`${url}/rest/v1/audit_logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      action: 'Import',
      detail: `Import de ${rows.length} chercheur(s)`,
      user_name: 'Admin',
    }),
  })

  return res.json({ count: rows.length })
}
