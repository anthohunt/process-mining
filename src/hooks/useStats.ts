import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface Stats {
  researchers: number
  themes: number
  clusters: number
  publications: number
}

async function fetchStats(): Promise<Stats> {
  const [
    { count: researchers },
    { count: clusters },
    { count: publications },
  ] = await Promise.all([
    supabase.from('researchers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('clusters').select('*', { count: 'exact', head: true }),
    supabase.from('publications').select('*', { count: 'exact', head: true }),
  ])

  // themes = unique keywords across all approved researchers
  const { data: kwData } = await supabase
    .from('researchers')
    .select('keywords')
    .eq('status', 'approved')

  const allKeywords = new Set<string>()
  kwData?.forEach(r => r.keywords?.forEach((k: string) => allKeywords.add(k)))

  return {
    researchers: researchers ?? 0,
    themes: allKeywords.size,
    clusters: clusters ?? 0,
    publications: publications ?? 0,
  }
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 30000,
    retry: 2,
  })
}

export interface DetailedStats {
  theme_distribution: { theme: string; count: number }[]
  temporal_trends: { year: number; count: number }[]
  similarity_histogram: { bucket: string; count: number }[]
}

async function fetchDetailedStats(): Promise<DetailedStats> {
  const [resResult, pubResult, scoreResult] = await Promise.all([
    supabase.from('researchers').select('keywords').eq('status', 'approved'),
    supabase.from('publications').select('year'),
    supabase.from('similarity_scores').select('score').limit(10000),
  ])

  if (resResult.error || pubResult.error || scoreResult.error) {
    throw new Error(resResult.error?.message ?? pubResult.error?.message ?? scoreResult.error?.message ?? 'Failed to fetch stats')
  }

  const researchers = resResult.data
  const publications = pubResult.data
  const scores = scoreResult.data

  // Theme distribution: count by keyword
  const themeCount: Record<string, number> = {}
  researchers?.forEach(r =>
    r.keywords?.forEach((k: string) => {
      themeCount[k] = (themeCount[k] ?? 0) + 1
    })
  )
  const theme_distribution = Object.entries(themeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([theme, count]) => ({ theme, count }))

  // Temporal trends: publication count by year
  const yearCount: Record<number, number> = {}
  publications?.forEach(p => {
    if (p.year) yearCount[p.year] = (yearCount[p.year] ?? 0) + 1
  })
  const temporal_trends = Object.entries(yearCount)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, count]) => ({ year: Number(year), count }))

  // Similarity histogram: buckets of 0.1
  const buckets: Record<string, number> = {}
  for (let i = 0; i < 10; i++) {
    buckets[`${(i * 0.1).toFixed(1)}-${((i + 1) * 0.1).toFixed(1)}`] = 0
  }
  scores?.forEach(s => {
    const b = Math.min(Math.floor(s.score * 10), 9)
    const key = `${(b * 0.1).toFixed(1)}-${((b + 1) * 0.1).toFixed(1)}`
    buckets[key] = (buckets[key] ?? 0) + 1
  })
  const similarity_histogram = Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }))

  return { theme_distribution, temporal_trends, similarity_histogram }
}

export function useDetailedStats() {
  return useQuery({
    queryKey: ['stats', 'detailed'],
    queryFn: fetchDetailedStats,
    staleTime: 60000,
    retry: 2,
  })
}
