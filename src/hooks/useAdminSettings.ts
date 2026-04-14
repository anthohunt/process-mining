import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface AppSettings {
  language: 'fr' | 'en'
  similarity_threshold: number
  nlp_algorithm: 'tfidf' | 'bert' | 'word2vec'
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'fr',
  similarity_threshold: 0.6,
  nlp_algorithm: 'tfidf',
}

async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')

  if (error) throw new Error(error.message)

  const map: Record<string, unknown> = {}
  for (const row of data ?? []) {
    map[row.key] = row.value
  }

  return {
    language: (map['language'] as 'fr' | 'en') ?? DEFAULT_SETTINGS.language,
    similarity_threshold: (map['similarity_threshold'] as number) ?? DEFAULT_SETTINGS.similarity_threshold,
    nlp_algorithm: (map['nlp_algorithm'] as 'tfidf' | 'bert' | 'word2vec') ?? DEFAULT_SETTINGS.nlp_algorithm,
  }
}

async function saveSettings(settings: AppSettings) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')

  const res = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(settings),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
    staleTime: 60000,
    retry: 2,
  })
}

export function useSaveSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  })
}
