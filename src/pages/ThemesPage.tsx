import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useClusters } from '../hooks/useClusters'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'

export function ThemesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: clusters, isLoading, isError, refetch } = useClusters()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div>
      <h1 className="page-title">{t('themes.title')}</h1>

      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/map')}>
          {t('themes.viewOnMap')}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState message={t('themes.error')} onRetry={() => void refetch()} retryLabel={t('themes.retry')} />}
      {!isLoading && !isError && clusters && clusters.length === 0 && (
        <EmptyState message={t('themes.noData')} />
      )}

      {!isLoading && !isError && clusters && (
        <div className="card-grid">
          {clusters.map(cluster => {
            const isOpen = expandedId === cluster.id
            const hasMembers = cluster.members.length > 0
            return (
              <div
                key={cluster.id}
                className="cluster-card"
                style={{ borderLeft: `4px solid ${cluster.color}` }}
              >
                <div
                  className="cluster-card-header"
                  onClick={() => {
                    if (hasMembers) setExpandedId(isOpen ? null : cluster.id)
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-controls={`cluster-body-${cluster.id}`}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ' ') && hasMembers) {
                      e.preventDefault()
                      setExpandedId(isOpen ? null : cluster.id)
                    }
                  }}
                  style={!hasMembers ? { cursor: 'default' } : undefined}
                >
                  <div className="cluster-color-dot" style={{ background: cluster.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{cluster.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--pm-text-muted)' }}>
                      {t('themes.researchers_other', { count: cluster.researcher_count })}
                    </div>
                  </div>
                  <div>
                    {cluster.sub_themes.slice(0, 2).map(st => (
                      <span key={st} className="tag tag-gray">{st}</span>
                    ))}
                  </div>
                  {hasMembers && (
                    <span style={{ fontSize: 10, color: 'var(--pm-text-muted)' }}>{isOpen ? '\u25B2' : '\u25BC'}</span>
                  )}
                </div>

                {isOpen && (
                  <div className="cluster-card-body" id={`cluster-body-${cluster.id}`}>
                    {cluster.members.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--pm-text-muted)', paddingTop: 12 }}>
                        {t('themes.noMembers')}
                      </p>
                    ) : (
                      <>
                        <ul style={{ listStyle: 'none', paddingTop: 12 }}>
                          {cluster.members.map(m => (
                            <li key={m.id} style={{ padding: '4px 0' }}>
                              <button
                                className="btn-ghost"
                                style={{ fontSize: 13, padding: '2px 0', color: 'var(--pm-primary)' }}
                                onClick={() => navigate(`/researchers/${m.id}`)}
                              >
                                {m.full_name}
                              </button>
                              <span style={{ fontSize: 12, color: 'var(--pm-text-muted)', marginLeft: 6 }}>
                                ({m.lab})
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div style={{ paddingTop: 8, borderTop: '1px solid var(--pm-border)', marginTop: 8 }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/researchers?theme=${encodeURIComponent(cluster.name)}`)}
                          >
                            {t('themes.viewAllResearchers')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
