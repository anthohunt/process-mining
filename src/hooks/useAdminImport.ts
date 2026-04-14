import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface ImportRow {
  nom: string
  labo: string
  themes: string
  isDuplicate?: boolean
}

export interface ParsedImportRow extends ImportRow {
  isDuplicate: boolean
}

export async function parseCsvFile(file: File): Promise<ParsedImportRow[]> {
  const text = await file.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) throw new Error('empty')

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''))
  const nomIdx = headers.findIndex(h => h === 'nom' || h === 'name')
  const laboIdx = headers.findIndex(h => h === 'labo' || h === 'lab' || h === 'laboratoire' || h === 'laboratory')
  const themesIdx = headers.findIndex(h => h === 'themes' || h === 'theme' || h === 'keywords' || h === 'mots-cles')

  if (nomIdx === -1 || laboIdx === -1 || themesIdx === -1) {
    throw new Error('invalid_format')
  }

  const rows: ImportRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    rows.push({
      nom: cols[nomIdx] ?? '',
      labo: cols[laboIdx] ?? '',
      themes: cols[themesIdx] ?? '',
    })
  }
  return rows as ParsedImportRow[]
}

async function checkDuplicates(rows: ImportRow[]): Promise<ParsedImportRow[]> {
  const { data } = await supabase
    .from('researchers')
    .select('full_name, lab')

  const existing = new Set(
    (data ?? []).map(r => `${r.full_name.toLowerCase()}|${r.lab.toLowerCase()}`)
  )

  return rows.map(row => ({
    ...row,
    isDuplicate: existing.has(`${row.nom.toLowerCase()}|${row.labo.toLowerCase()}`),
  }))
}

async function importRows(rows: ParsedImportRow[]) {
  const toInsert = rows
    .filter(r => !r.isDuplicate)
    .map(r => ({
      full_name: r.nom,
      lab: r.labo,
      keywords: r.themes ? r.themes.split(';').map(t => t.trim()).filter(Boolean) : [],
      bio: '',
      status: 'approved' as const,
    }))

  if (toInsert.length === 0) return { count: 0 }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')

  const res = await fetch('/api/admin/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ rows: toInsert }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<{ count: number }>
}

async function importScholarUrl(_url: string): Promise<ParsedImportRow[]> {
  // The Supabase edge function for Scholar import is not yet deployed.
  throw new Error('scholar_not_configured')
}

export function useCheckDuplicates() {
  return useMutation({
    mutationFn: checkDuplicates,
  })
}

export function useImportRows() {
  return useMutation({
    mutationFn: importRows,
  })
}

export function useImportScholar() {
  return useMutation({
    mutationFn: importScholarUrl,
  })
}

export function useExistingResearchers() {
  return useQuery({
    queryKey: ['researchers-names'],
    queryFn: async () => {
      const { data } = await supabase.from('researchers').select('full_name, lab')
      return (data ?? []).map(r => `${r.full_name}|${r.lab}`)
    },
    staleTime: 60000,
  })
}
