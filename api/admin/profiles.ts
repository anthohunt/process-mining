import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

function getAdminFetch() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return { url, key }
}

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

async function adminPatch(url: string, key: string, table: string, id: string, body: Record<string, unknown>) {
  const res = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PATCH ${table} failed: ${res.status}`)
}

async function adminInsertAuditLog(url: string, key: string, entry: object) {
  await fetch(`${url}/rest/v1/audit_logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(entry),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await verifyAdmin(req)
  } catch (e) {
    return res.status(401).json({ error: (e as Error).message })
  }

  const { url, key } = getAdminFetch()

  if (req.method === 'PATCH') {
    const { id, action, reason } = req.body as { id: string; action: 'approve' | 'reject'; reason?: string }
    if (!id || !action) return res.status(400).json({ error: 'Missing id or action' })

    if (action === 'approve') {
      await adminPatch(url, key, 'researchers', id, { status: 'approved' })
      await adminInsertAuditLog(url, key, {
        action: 'Modification',
        detail: `Profil approuve: ${id}`,
        user_name: 'Admin',
      })
      return res.json({ ok: true })
    }

    if (action === 'reject') {
      await adminPatch(url, key, 'researchers', id, {
        status: 'rejected',
        rejection_reason: reason ?? null,
      })
      await adminInsertAuditLog(url, key, {
        action: 'Suppression',
        detail: `Profil rejete: ${id}`,
        user_name: 'Admin',
      })
      return res.json({ ok: true })
    }

    return res.status(400).json({ error: 'Invalid action' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
