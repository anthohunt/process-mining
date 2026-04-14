import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

async function getAuthHeader(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return `Bearer ${session.access_token}`
}

export interface PendingProfile {
  id: string
  full_name: string
  lab: string
  keywords: string[]
  created_at: string
  updated_at: string
  user_id: string | null
}

async function fetchPendingProfiles(): Promise<PendingProfile[]> {
  const { data, error } = await supabase
    .from('researchers')
    .select('id, full_name, lab, keywords, created_at, updated_at, user_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as PendingProfile[]
}

async function approveProfile(id: string) {
  const auth = await getAuthHeader()
  const res = await fetch('/api/admin/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify({ id, action: 'approve' }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
}

async function rejectProfile({ id, reason }: { id: string; reason?: string }) {
  const auth = await getAuthHeader()
  const res = await fetch('/api/admin/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify({ id, action: 'reject', reason }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
}

export function usePendingProfiles() {
  return useQuery({
    queryKey: ['pending-profiles'],
    queryFn: fetchPendingProfiles,
    staleTime: 15000,
    retry: 2,
  })
}

export function useApproveProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: approveProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-profiles'] })
      qc.invalidateQueries({ queryKey: ['researchers'] })
    },
  })
}

export function useRejectProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rejectProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-profiles'] })
    },
  })
}
