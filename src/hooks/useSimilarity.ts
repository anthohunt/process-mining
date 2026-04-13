import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface SimilarityResult {
  score: number
  algorithm: string
  common_themes: string[]
}

async function fetchSimilarity(idA: string, idB: string): Promise<SimilarityResult> {
  // Try stored similarity score (ordered pair)
  const { data: scoreA } = await supabase
    .from('similarity_scores')
    .select('score, algorithm')
    .eq('researcher_a', idA)
    .eq('researcher_b', idB)
    .order('computed_at', { ascending: false })
    .limit(1)
    .single()

  const { data: scoreB } = await supabase
    .from('similarity_scores')
    .select('score, algorithm')
    .eq('researcher_a', idB)
    .eq('researcher_b', idA)
    .order('computed_at', { ascending: false })
    .limit(1)
    .single()

  const stored = scoreA ?? scoreB

  // Fetch both profiles to compute common themes
  const [{ data: resA, error: errA }, { data: resB, error: errB }] = await Promise.all([
    supabase.from('researchers').select('keywords').eq('id', idA).single(),
    supabase.from('researchers').select('keywords').eq('id', idB).single(),
  ])

  if (errA && errB) {
    throw new Error('Failed to fetch researcher data for similarity computation')
  }

  const kwA: string[] = resA?.keywords ?? []
  const kwB: string[] = resB?.keywords ?? []
  const common_themes = kwA.filter(k => kwB.some(b => b.toLowerCase() === k.toLowerCase()))

  if (stored) {
    return {
      score: stored.score,
      algorithm: stored.algorithm ?? 'tfidf',
      common_themes,
    }
  }

  // Fallback: compute Jaccard similarity from keywords
  const setA = new Set(kwA.map(k => k.toLowerCase()))
  const setB = new Set(kwB.map(k => k.toLowerCase()))
  const intersection = [...setA].filter(k => setB.has(k)).length
  const union = new Set([...setA, ...setB]).size
  const score = union > 0 ? intersection / union : 0

  return { score, algorithm: 'jaccard', common_themes }
}

export function useSimilarity(idA: string | undefined, idB: string | undefined) {
  return useQuery({
    queryKey: ['similarity', idA, idB],
    queryFn: () => fetchSimilarity(idA!, idB!),
    enabled: !!idA && !!idB && idA !== idB,
    staleTime: 60000,
    retry: 2,
  })
}
