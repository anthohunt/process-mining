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

async function adminUpsertSetting(supabaseUrl: string, key: string, settingKey: string, value: unknown) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/app_settings?key=eq.${encodeURIComponent(settingKey)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ value }),
    }
  )
  if (res.ok) {
    const affected = res.headers.get('content-range')
    if (affected && affected.endsWith('/0')) {
      const ins = await fetch(`${supabaseUrl}/rest/v1/app_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ key: settingKey, value }),
      })
      if (!ins.ok) throw new Error(`Insert setting failed: ${ins.status}`)
    }
    return
  }
  throw new Error(`Upsert setting failed: ${res.status}`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await verifyAdmin(req)
  } catch (e) {
    return res.status(401).json({ error: (e as Error).message })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const { language, similarity_threshold, nlp_algorithm } = req.body as {
    language: string
    similarity_threshold: number
    nlp_algorithm: string
  }

  await adminUpsertSetting(supabaseUrl, serviceKey, 'language', language)
  await adminUpsertSetting(supabaseUrl, serviceKey, 'similarity_threshold', similarity_threshold)
  await adminUpsertSetting(supabaseUrl, serviceKey, 'nlp_algorithm', nlp_algorithm)

  await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      action: 'Configuration',
      detail: `Parametres mis a jour: langue=${language}, seuil=${similarity_threshold}, algo=${nlp_algorithm}`,
      user_name: 'Admin',
    }),
  })

  return res.json({ ok: true })
}
