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
  const { rows } = req.body as { rows: Array<{ full_name: string; lab: string; keywords: string[]; bio: string; status: string }> }

  if (!Array.isArray(rows) || rows.length === 0) return res.json({ count: 0 })

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
