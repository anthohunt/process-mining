import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResearcherList } from '../hooks/useResearchers'
import { getInitials, stringToColor } from '../lib/formatting'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'

export function ResearchersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [labFilter, setLabFilter] = useState('')
  const [themeFilter, setThemeFilter] = useState('')
  // Static (international) vs dynamic (french) community tabs
  const [originTab, setOriginTab] = useState<'all' | 'international' | 'fr'>('all')

  const { data, isLoading, isError, refetch } = useResearcherList(search, labFilter, themeFilter)

  // Build lab/theme options from full unfiltered data when available
  const allLabs = [...new Set((data ?? []).map(r => r.lab))].sort()
  const allThemes = [...new Set((data ?? []).flatMap(r => r.keywords ?? []))].sort()

  // Tab counts + origin-filtered list
  const countIntl = (data ?? []).filter(r => r.origin === 'international').length
  const countFr = (data ?? []).filter(r => r.origin === 'fr').length
  const filtered = (data ?? []).filter(r => originTab === 'all' || r.origin === originTab)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('researchers.title')}</h1>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/themes')}
          aria-label="Explorer les themes"
        >
          Explorer par theme
        </button>
      </div>

      {/* Static (international) vs dynamic (french) community tabs */}
      <div className="researcher-tabs" role="tablist" aria-label={t('researchers.tabs.aria')} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {([
          { key: 'all', label: t('researchers.tabs.all'), count: (data ?? []).length },
          { key: 'international', label: t('researchers.tabs.international'), count: countIntl },
          { key: 'fr', label: t('researchers.tabs.fr'), count: countFr },
        ] as const).map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={originTab === tab.key}
            className={`btn btn-sm ${originTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setOriginTab(tab.key)}
          >
            {tab.label} <span style={{ opacity: 0.7 }}>({tab.count})</span>
          </button>
        ))}
      </div>

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
          {allLabs.map(lab => <option key={lab} value={lab}>{lab}</option>)}
        </select>
        <select
          className="form-control"
          value={themeFilter}
          onChange={e => setThemeFilter(e.target.value)}
          aria-label={t('researchers.filterTheme')}
        >
          <option value="">{t('researchers.filterTheme')}</option>
          {allThemes.map(theme => <option key={theme} value={theme}>{theme}</option>)}
        </select>
        {(search || labFilter || themeFilter) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setLabFilter(''); setThemeFilter('') }}
            aria-label="Effacer les filtres"
          >
            Effacer
          </button>
        )}
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && (
        <ErrorState
          message={t('common.error')}
          onRetry={() => void refetch()}
          retryLabel={t('common.retry')}
        />
      )}

      {!isLoading && !isError && data && filtered.length === 0 && (
        <EmptyState message={t('researchers.noResults')} />
      )}

      {!isLoading && !isError && data && filtered.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table className="app-table" aria-label={t('researchers.title')}>
            <thead>
              <tr>
                <th>{t('researchers.table.name')}</th>
                <th>{t('researchers.table.lab')}</th>
                <th>{t('researchers.table.themes')}</th>
                <th>{t('researchers.table.publications')}</th>
                <th>{t('researchers.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/researchers/${r.id}`)}
                  style={{ cursor: 'pointer' }}
                >
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
                    {r.keywords?.length > 3 && (
                      <span className="tag tag-gray">+{r.keywords.length - 3}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{r.publication_count}</td>
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
