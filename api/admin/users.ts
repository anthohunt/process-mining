import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key, { auth: { persistSession: false } })
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
  const role = user.app_metadata?.role ?? user.user_metadata?.role
  if (role !== 'admin') throw new Error('Forbidden')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await verifyAdmin(req)
  } catch (e) {
    return res.status(401).json({ error: (e as Error).message })
  }

  const admin = getAdminClient()

  if (req.method === 'GET') {
    const { data, error } = await admin.auth.admin.listUsers()
    if (error) return res.status(500).json({ error: error.message })
    const users = (data.users ?? []).map(u => ({
      id: u.id,
      email: u.email ?? '',
      full_name: u.user_metadata?.full_name ?? u.email ?? '',
      role: (u.user_metadata?.role as string) ?? 'researcher',
      status: u.banned_until ? 'revoked' : 'active',
      created_at: u.created_at,
    }))
    return res.json(users)
  }

  if (req.method === 'PATCH') {
    const { userId, action, role, ban_duration } = req.body as {
      userId: string
      action: 'update_role' | 'revoke'
      role?: string
      ban_duration?: string
    }
    if (!userId) return res.status(400).json({ error: 'Missing userId' })

    if (action === 'update_role' && role) {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        user_metadata: { role },
        app_metadata: { role },
      })
      if (error) return res.status(500).json({ error: error.message })
      return res.json({ ok: true })
    }

    if (action === 'revoke') {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: ban_duration ?? '876600h',
      })
      if (error) return res.status(500).json({ error: error.message })
      return res.json({ ok: true })
    }

    return res.status(400).json({ error: 'Invalid action' })
  }

  if (req.method === 'POST') {
    // Invite user
    const { email } = req.body as { email: string }
    if (!email) return res.status(400).json({ error: 'Missing email' })
    const url = `${process.env.SUPABASE_URL}/rest/v1/invitations`
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email, role: 'researcher', accepted: false }),
    })
    if (!r.ok) {
      const text = await r.text()
      return res.status(r.status).json({ error: text })
    }
    return res.json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
