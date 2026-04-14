import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface AuditLog {
  id: string
  user_id: string | null
  user_name: string | null
  action: string
  detail: string | null
  created_at: string
}

async function fetchAuditLogs(
  from: string | null,
  to: string | null,
  page: number,
  pageSize: number
): Promise<{ logs: AuditLog[]; total: number }> {
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (from) query = query.gte('created_at', from + 'T00:00:00')
  if (to) query = query.lte('created_at', to + 'T23:59:59')

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return { logs: (data ?? []) as AuditLog[], total: count ?? 0 }
}

export function useAuditLogs(
  from: string | null,
  to: string | null,
  page: number,
  pageSize = 50
) {
  return useQuery({
    queryKey: ['audit-logs', from, to, page, pageSize],
    queryFn: () => fetchAuditLogs(from, to, page, pageSize),
    staleTime: 15000,
    retry: 2,
  })
}
