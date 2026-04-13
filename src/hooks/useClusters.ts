import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ClusterMember {
  id: string
  full_name: string
  lab: string
}

export interface Cluster {
  id: string
  name: string
  color: string
  sub_themes: string[]
  created_at: string
  researcher_count: number
  members: ClusterMember[]
}

async function fetchClusters(): Promise<Cluster[]> {
  const { data: clusters, error } = await supabase
    .from('clusters')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  if (!clusters) return []

  const { data: researchers } = await supabase
    .from('researchers')
    .select('id, full_name, lab, cluster_id')
    .eq('status', 'approved')

  return clusters.map(c => {
    const members = (researchers ?? [])
      .filter(r => r.cluster_id === c.id)
      .map(r => ({ id: r.id, full_name: r.full_name, lab: r.lab }))
    return {
      ...c,
      researcher_count: members.length,
      members,
    }
  })
}

export function useClusters() {
  return useQuery({
    queryKey: ['clusters'],
    queryFn: fetchClusters,
    staleTime: 60000,
    retry: 2,
  })
}
