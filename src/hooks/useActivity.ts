import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ActivityItem {
  id: string
  user_name: string | null
  action: string
  detail: string | null
  created_at: string
  researcher_id?: string | null
}

async function fetchActivity(): Promise<ActivityItem[]> {
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('id, user_name, action, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw new Error(error.message)
  if (!logs) return []

  // Try to match each log to a researcher by user_name
  const names = logs.map(l => l.user_name).filter(Boolean)
  if (names.length === 0) return logs

  const { data: researchers } = await supabase
    .from('researchers')
    .select('id, full_name')
    .in('full_name', names)

  const nameToId: Record<string, string> = {}
  researchers?.forEach(r => { nameToId[r.full_name] = r.id })

  return logs.map(log => ({
    ...log,
    researcher_id: log.user_name ? (nameToId[log.user_name] ?? null) : null,
  }))
}

export function useActivity() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    staleTime: 30000,
    retry: 2,
  })
}
