import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ResearcherListItem {
  id: string
  full_name: string
  lab: string
  keywords: string[]
  status: string
  publication_count: number
}

export interface ResearcherProfile {
  id: string
  user_id: string | null
  full_name: string
  lab: string
  bio: string
  keywords: string[]
  status: string
  rejection_reason: string | null
  map_x: number | null
  map_y: number | null
  cluster_id: string | null
  created_at: string
  updated_at: string
  publications: Publication[]
  clusters: { name: string; color: string } | null
}

export interface Publication {
  id: string
  researcher_id: string
  title: string
  coauthors: string
  venue: string
  year: number | null
}

async function fetchResearcherList(q: string, lab: string, theme: string): Promise<ResearcherListItem[]> {
  let query = supabase
    .from('researchers')
    .select('id, full_name, lab, keywords, status')
    .eq('status', 'approved')
    .order('full_name')

  if (lab) query = query.eq('lab', lab)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  let results = data ?? []

  // Client-side filter for text search (name or keyword)
  if (q) {
    const lower = q.toLowerCase()
    results = results.filter(r =>
      r.full_name.toLowerCase().includes(lower) ||
      r.keywords?.some((k: string) => k.toLowerCase().includes(lower))
    )
  }

  // Client-side filter for theme
  if (theme) {
    results = results.filter(r =>
      r.keywords?.some((k: string) => k.toLowerCase() === theme.toLowerCase())
    )
  }

  // Get publication counts scoped to displayed researchers only
  const filteredIds = results.map(r => r.id)
  const pubCounts: Record<string, number> = {}
  if (filteredIds.length > 0) {
    const { data: pubData } = await supabase
      .from('publications')
      .select('researcher_id')
      .in('researcher_id', filteredIds)
    pubData?.forEach(p => {
      pubCounts[p.researcher_id] = (pubCounts[p.researcher_id] ?? 0) + 1
    })
  }

  return results.map(r => ({
    ...r,
    publication_count: pubCounts[r.id] ?? 0,
  }))
}

async function fetchResearcherProfile(id: string): Promise<ResearcherProfile> {
  const { data, error, status } = await supabase
    .from('researchers')
    .select('*, publications(*), clusters(name, color)')
    .eq('id', id)
    .single()

  if (error) {
    if (status === 404 || error.code === 'PGRST116') {
      const err = new Error('Not found')
      ;(err as Error & { status: number }).status = 404
      throw err
    }
    throw new Error(error.message)
  }
  return data as ResearcherProfile
}

export function useResearcherList(q: string, lab: string, theme: string) {
  return useQuery({
    queryKey: ['researchers', q, lab, theme],
    queryFn: () => fetchResearcherList(q, lab, theme),
    staleTime: 30000,
    retry: 2,
  })
}

export function useResearcherProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => fetchResearcherProfile(id!),
    enabled: !!id,
    staleTime: 30000,
    retry: (failureCount, error) => {
      if ((error as Error & { status?: number }).status === 404) return false
      return failureCount < 2
    },
  })
}
