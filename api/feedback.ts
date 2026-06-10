import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function notifyDiscord(row: {
  type: string; page: string; message: string; reporter_name: string; reporter_email: string
}) {
  const webhook = process.env.DISCORD_FEEDBACK_WEBHOOK
  if (!webhook) return // notification is best-effort; skip if not configured
  const isBug = row.type === 'bug'
  const who = row.reporter_name || row.reporter_email || 'Anonyme'
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'CartoPM Feedback',
        embeds: [{
          title: isBug ? '🐞 Bug signalé' : '💡 Suggestion',
          description: row.message.slice(0, 1800),
          color: isBug ? 0xdc3545 : 0x0d6efd,
          fields: [
            { name: 'Page', value: row.page || '—', inline: true },
            { name: 'Par', value: who, inline: true },
          ],
        }],
      }),
    })
  } catch {
    // ignore notification failures
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, page, message, name, email } = (req.body ?? {}) as {
    type?: string; page?: string; message?: string; name?: string; email?: string
  }

  if (type !== 'bug' && type !== 'suggestion') {
    return res.status(400).json({ error: 'Invalid type' })
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const row = {
    type,
    page: (page ?? '').slice(0, 300),
    message: message.trim().slice(0, 4000),
    reporter_name: (name ?? '').slice(0, 200),
    reporter_email: (email ?? '').slice(0, 200),
  }

  try {
    const admin = getAdminClient()
    const { error } = await admin.from('feedback').insert(row)
    if (error) return res.status(500).json({ error: error.message })
    await notifyDiscord(row)
    return res.status(201).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
