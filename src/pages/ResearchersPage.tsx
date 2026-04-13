import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getInitials, stringToColor } from '../lib/formatting'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'

interface Researcher {
  id: string
  full_name: string
  lab: string
  keywords: string[]
  status: string
}

async function fetchResearchers(q: string, lab: string): Promise<Researcher[]> {
  let query = supabase
    .from('researchers')
    .select('id, full_name, lab, keywords, status')
    .eq('status', 'approved')
    .order('full_name')

  if (lab) query = query.eq('lab', lab)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  if (q) {
    const lower = q.toLowerCase()
    return (data ?? []).filter(r =>
      r.full_name.toLowerCase().includes(lower) ||
      r.keywords?.some((k: string) => k.toLowerCase().includes(lower))
    )
  }
  return data ?? []
}

export function ResearchersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [labFilter, setLabFilter] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['researchers', search, labFilter],
    queryFn: () => fetchResearchers(search, labFilter),
    staleTime: 30000,
  })

  const labs = [...new Set((data ?? []).map(r => r.lab))].sort()

  return (
    <div>
      <h1 className="page-title">{t('researchers.title')}</h1>

      <div className="search-bar">
        <input
          type="search"
          className="form-control"
          placeholder={t('researchers.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label={t('researchers.search')}
        />
        <select
          className="form-control"
          value={labFilter}
          onChange={e => setLabFilter(e.target.value)}
          aria-label={t('researchers.filterLab')}
        >
          <option value="">{t('researchers.filterLab')}</option>
          {labs.map(lab => <option key={lab} value={lab}>{lab}</option>)}
        </select>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={() => void refetch()} />}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState message={t('researchers.noResults')} />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table className="app-table" aria-label={t('researchers.title')}>
            <thead>
              <tr>
                <th>{t('researchers.table.name')}</th>
                <th>{t('researchers.table.lab')}</th>
                <th>{t('researchers.table.themes')}</th>
                <th>{t('researchers.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id} onClick={() => navigate(`/researchers/${r.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className="activity-avatar"
                        style={{ background: stringToColor(r.full_name), width: 32, height: 32, fontSize: 11, flexShrink: 0 }}
                        aria-hidden="true"
                      >
                        {getInitials(r.full_name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{r.full_name}</span>
                    </div>
                  </td>
                  <td>{r.lab}</td>
                  <td>
                    {r.keywords?.slice(0, 3).map(k => (
                      <span key={k} className="tag tag-blue">{k}</span>
                    ))}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={e => { e.stopPropagation(); navigate(`/researchers/${r.id}`) }}
                      aria-label={`Voir le profil de ${r.full_name}`}
                    >
                      {t('researchers.viewProfile')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
