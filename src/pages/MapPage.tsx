import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useClusters } from '../hooks/useClusters'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'

export function MapPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: clusters, isLoading, isError, refetch } = useClusters()

  return (
    <div>
      <h1 className="page-title">{t('map.title')}</h1>

      <div
        className="map-container"
        role="img"
        aria-label={t('map.ariaLabel')}
        style={{ position: 'relative' }}
      >
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingSpinner message={t('common.loading')} />
          </div>
        )}

        {isError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ErrorState
              message={t('map.error')}
              onRetry={() => void refetch()}
              retryLabel={t('map.retry')}
            />
          </div>
        )}

        {!isLoading && !isError && clusters && clusters.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState message={t('map.noData')} />
          </div>
        )}

        {!isLoading && !isError && clusters && clusters.length > 0 && (
          <>
            {/* Filter panel */}
            <div className="map-filter-panel">
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Filtres</div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>{t('map.filterTheme')}</label>
                <select className="form-control" style={{ fontSize: 12 }} aria-label={t('map.filterTheme')}>
                  <option value="">{t('map.resetFilter')}</option>
                  {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                {t('map.apply')}
              </button>
            </div>

            {/* SVG Map */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 500"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', inset: 0 }}
            >
              <rect width="800" height="500" fill="#0c1b33" />
              {clusters.map((cluster, i) => {
                const cols = Math.ceil(Math.sqrt(clusters.length))
                const col = i % cols
                const row = Math.floor(i / cols)
                const cx = 120 + col * (560 / Math.max(cols - 1, 1))
                const cy = 100 + row * (300 / Math.max(Math.ceil(clusters.length / cols) - 1, 1))
                const r = 50 + cluster.researcher_count * 5

                return (
                  <g key={cluster.id} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={cx} cy={cy}
                      r={Math.min(r, 90)}
                      fill={cluster.color}
                      fillOpacity={0.3}
                      stroke={cluster.color}
                      strokeWidth={2}
                    />
                    <text
                      x={cx} y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={12}
                      fontFamily="Poppins, sans-serif"
                      fontWeight={600}
                    >
                      {cluster.name.length > 14 ? cluster.name.slice(0, 14) + '…' : cluster.name}
                    </text>
                    {cluster.members.map((m, j) => {
                      const angle = (j / Math.max(cluster.members.length, 1)) * Math.PI * 2
                      const dotR = Math.min(r, 90) * 0.75
                      const dx = cx + Math.cos(angle) * dotR
                      const dy = cy + Math.sin(angle) * dotR
                      return (
                        <circle
                          key={m.id}
                          cx={dx} cy={dy}
                          r={6}
                          fill={cluster.color}
                          stroke="#fff"
                          strokeWidth={1.5}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/researchers/${m.id}`)}
                          role="button"
                          aria-label={m.full_name}
                        >
                          <title>{m.full_name}</title>
                        </circle>
                      )
                    })}
                  </g>
                )
              })}
            </svg>

            {/* Legend */}
            <div className="map-legend">
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12 }}>{t('map.legend')}</div>
              {clusters.map(c => (
                <div key={c.id} className="legend-item">
                  <div className="legend-dot" style={{ background: c.color }} />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
