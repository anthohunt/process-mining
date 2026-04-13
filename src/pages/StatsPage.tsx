import { useTranslation } from 'react-i18next'
import { useDetailedStats } from '../hooks/useStats'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'

export function StatsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useDetailedStats()

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorState message={t('stats.error')} onRetry={() => void refetch()} retryLabel={t('stats.retry')} />

  const W = 500
  const H = 200

  return (
    <div>
      <h1 className="page-title">{t('stats.title')}</h1>

      {/* Theme Distribution Bar Chart */}
      <div className="card">
        <h2 className="card-title">{t('stats.themeDistribution')}</h2>
        {!data || data.theme_distribution.length === 0 ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          <div className="chart-container" role="img" aria-label={t('stats.themeDistribution')}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              {(() => {
                const items = data.theme_distribution
                const maxVal = Math.max(...items.map(d => d.count), 1)
                const barW = Math.floor((W - 40) / items.length) - 4
                return items.map((d, i) => {
                  const barH = Math.max(4, ((d.count / maxVal) * (H - 40)))
                  const x = 20 + i * (barW + 4)
                  const y = H - 24 - barH
                  return (
                    <g key={d.theme}>
                      <rect x={x} y={y} width={barW} height={barH} fill="var(--pm-primary)" rx={2}>
                        <title>{d.theme}: {d.count}</title>
                      </rect>
                      <text
                        x={x + barW / 2} y={H - 8}
                        textAnchor="middle"
                        fontSize={9}
                        fill="var(--pm-text-muted)"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {d.theme.length > 8 ? d.theme.slice(0, 8) + '…' : d.theme}
                      </text>
                      <text
                        x={x + barW / 2} y={y - 4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--pm-text)"
                        fontWeight={600}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {d.count}
                      </text>
                    </g>
                  )
                })
              })()}
            </svg>
          </div>
        )}
      </div>

      {/* Temporal Trends Line Chart */}
      <div className="card">
        <h2 className="card-title">{t('stats.temporalTrends')}</h2>
        {!data || data.temporal_trends.length < 2 ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          <div className="chart-container" role="img" aria-label={t('stats.temporalTrends')}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              {(() => {
                const pts = data.temporal_trends
                const maxVal = Math.max(...pts.map(d => d.count), 1)
                const xs = pts.map((_, i) => 30 + i * ((W - 60) / (pts.length - 1)))
                const ys = pts.map(d => H - 24 - ((d.count / maxVal) * (H - 40)))
                const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
                return (
                  <>
                    <polyline points={xs.map((x, i) => `${x},${ys[i]}`).join(' ')} fill="none" stroke="var(--pm-primary)" strokeWidth={2} />
                    <path d={`${path} L${xs[xs.length-1]},${H-24} L${xs[0]},${H-24} Z`} fill="var(--pm-primary)" fillOpacity={0.1} />
                    {pts.map((d, i) => (
                      <g key={d.year}>
                        <circle cx={xs[i]} cy={ys[i]} r={4} fill="var(--pm-primary)">
                          <title>{d.year}: {d.count}</title>
                        </circle>
                        <text x={xs[i]} y={H - 8} textAnchor="middle" fontSize={9} fill="var(--pm-text-muted)">{d.year}</text>
                      </g>
                    ))}
                  </>
                )
              })()}
            </svg>
          </div>
        )}
      </div>

      {/* Similarity Histogram */}
      <div className="card">
        <h2 className="card-title">{t('stats.similarityDistribution')}</h2>
        {!data || data.similarity_histogram.every(b => b.count === 0) ? (
          <EmptyState message={t('stats.needTwoResearchers')} />
        ) : (
          <div className="chart-container" role="img" aria-label={t('stats.similarityDistribution')}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              {(() => {
                const items = data.similarity_histogram
                const maxVal = Math.max(...items.map(d => d.count), 1)
                const barW = Math.floor((W - 40) / items.length) - 2
                return items.map((d, i) => {
                  const barH = Math.max(d.count > 0 ? 4 : 0, (d.count / maxVal) * (H - 40))
                  const x = 20 + i * (barW + 2)
                  const y = H - 24 - barH
                  return (
                    <g key={d.bucket}>
                      <rect x={x} y={y} width={barW} height={barH} fill="var(--pm-success)" rx={2}>
                        <title>{d.bucket}: {d.count}</title>
                      </rect>
                      <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={8} fill="var(--pm-text-muted)">
                        {d.bucket.split('-')[0]}
                      </text>
                    </g>
                  )
                })
              })()}
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
