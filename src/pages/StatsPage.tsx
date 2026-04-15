import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useDetailedStats } from '../hooks/useStats'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'

interface ChartTooltip {
  x: number
  y: number
  label: string
  value: number
}

export function StatsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useDetailedStats()
  const [barTooltip, setBarTooltip] = useState<ChartTooltip | null>(null)
  const [lineTooltip, setLineTooltip] = useState<ChartTooltip | null>(null)
  const [histTooltip, setHistTooltip] = useState<ChartTooltip | null>(null)

  const handleBarHover = useCallback((e: React.MouseEvent<SVGRectElement>, label: string, value: number) => {
    const rect = e.currentTarget.closest('.chart-container')?.getBoundingClientRect()
    if (!rect) return
    setBarTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      label,
      value,
    })
  }, [])

  const handleLineHover = useCallback((e: React.MouseEvent<SVGCircleElement>, label: string, value: number) => {
    const rect = e.currentTarget.closest('.chart-container')?.getBoundingClientRect()
    if (!rect) return
    setLineTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      label,
      value,
    })
  }, [])

  const handleHistHover = useCallback((e: React.MouseEvent<SVGRectElement>, label: string, value: number) => {
    const rect = e.currentTarget.closest('.chart-container')?.getBoundingClientRect()
    if (!rect) return
    setHistTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      label,
      value,
    })
  }, [])

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorState message={t('stats.error')} onRetry={() => void refetch()} retryLabel={t('stats.retry')} />

  const W = 500
  const H = 240

  // Check for malformed data
  const hasValidThemeData = data && Array.isArray(data.theme_distribution)
  const hasValidTemporalData = data && Array.isArray(data.temporal_trends)
  const hasValidHistogramData = data && Array.isArray(data.similarity_histogram)

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">{t('stats.breadcrumbDashboard')}</Link>
        <span className="breadcrumb-sep">&gt;</span>
        <span>{t('stats.breadcrumbStats')}</span>
      </nav>

      <h1 className="page-title">{t('stats.title')}</h1>

      {/* Theme Distribution Bar Chart */}
      <div className="card">
        <h2 className="card-title">{t('stats.themeDistribution')}</h2>
        {!hasValidThemeData ? (
          <ErrorState message={t('stats.error')} onRetry={() => void refetch()} retryLabel={t('stats.retry')} />
        ) : data.theme_distribution.length === 0 ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          <div className="chart-container" role="img" aria-label={t('stats.themeDistribution')} style={{ position: 'relative' }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              {(() => {
                const items = data.theme_distribution
                const maxVal = Math.max(...items.map(d => d.count), 1)
                const barW = Math.floor((W - 40) / items.length) - 4
                return items.map((d, i) => {
                  const barH = Math.max(4, ((d.count / maxVal) * (H - 80)))
                  const x = 20 + i * (barW + 4)
                  const y = H - 64 - barH
                  const label = d.theme.length > 18 ? d.theme.slice(0, 18) + '\u2026' : d.theme
                  const tx = x + barW / 2
                  const ty = H - 56
                  return (
                    <g key={d.theme}>
                      <rect
                        x={x} y={y} width={barW} height={barH}
                        fill="var(--pm-primary)" rx={2}
                        style={{ cursor: 'pointer' }}
                        onMouseMove={(e) => handleBarHover(e, d.theme, d.count)}
                        onMouseLeave={() => setBarTooltip(null)}
                      >
                        <title>{d.theme}: {d.count}</title>
                      </rect>
                      <text
                        x={tx} y={ty}
                        textAnchor="end"
                        fontSize={9}
                        fill="var(--pm-text-muted)"
                        transform={`rotate(-35, ${tx}, ${ty})`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {label}
                      </text>
                      <text
                        x={x + barW / 2} y={y - 4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--pm-text)"
                        fontWeight={600}
                        style={{ fontFamily: 'Poppins, sans-serif', pointerEvents: 'none' }}
                      >
                        {d.count}
                      </text>
                    </g>
                  )
                })
              })()}
            </svg>
            {barTooltip && (
              <div
                className="popover"
                style={{
                  position: 'absolute',
                  left: barTooltip.x,
                  top: barTooltip.y,
                  transform: 'translate(-50%, -100%)',
                  padding: '6px 12px',
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <strong>{barTooltip.label}</strong>: {barTooltip.value}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Temporal Trends Line Chart */}
      <div className="card">
        <h2 className="card-title">{t('stats.temporalTrends')}</h2>
        {!hasValidTemporalData ? (
          <ErrorState message={t('stats.error')} onRetry={() => void refetch()} retryLabel={t('stats.retry')} />
        ) : data.temporal_trends.length < 2 ? (
          <EmptyState message={t('stats.noData')} />
        ) : (
          <div className="chart-container" role="img" aria-label={t('stats.temporalTrends')} style={{ position: 'relative' }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              {(() => {
                const pts = data.temporal_trends
                const maxVal = Math.max(...pts.map(d => d.count), 1)
                const xs = pts.map((_, i) => 30 + i * ((W - 60) / (pts.length - 1)))
                const ys = pts.map(d => H - 48 - ((d.count / maxVal) * (H - 80)))
                const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
                const tickStep = Math.max(1, Math.ceil(pts.length / 8))
                return (
                  <>
                    <polyline points={xs.map((x, i) => `${x},${ys[i]}`).join(' ')} fill="none" stroke="var(--pm-primary)" strokeWidth={2} />
                    <path d={`${path} L${xs[xs.length-1]},${H-48} L${xs[0]},${H-48} Z`} fill="var(--pm-primary)" fillOpacity={0.1} />
                    {pts.map((d, i) => (
                      <g key={d.year}>
                        <circle
                          cx={xs[i]} cy={ys[i]} r={4}
                          fill="var(--pm-primary)"
                          style={{ cursor: 'pointer' }}
                          onMouseMove={(e) => handleLineHover(e, String(d.year), d.count)}
                          onMouseLeave={() => setLineTooltip(null)}
                        >
                          <title>{d.year}: {d.count}</title>
                        </circle>
                        {(i % tickStep === 0 || i === pts.length - 1) && (
                          <text x={xs[i]} y={H - 28} textAnchor="middle" fontSize={10} fill="var(--pm-text-muted)">{d.year}</text>
                        )}
                      </g>
                    ))}
                  </>
                )
              })()}
            </svg>
            {lineTooltip && (
              <div
                className="popover"
                style={{
                  position: 'absolute',
                  left: lineTooltip.x,
                  top: lineTooltip.y,
                  transform: 'translate(-50%, -100%)',
                  padding: '6px 12px',
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <strong>{lineTooltip.label}</strong>: {lineTooltip.value}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Similarity Histogram */}
      <div className="card">
        <h2 className="card-title">{t('stats.similarityDistribution')}</h2>
        {!hasValidHistogramData ? (
          <ErrorState message={t('stats.error')} onRetry={() => void refetch()} retryLabel={t('stats.retry')} />
        ) : data.similarity_histogram.every(b => b.count === 0) ? (
          <EmptyState message={t('stats.needTwoResearchers')} />
        ) : (
          <div className="chart-container" role="img" aria-label={t('stats.similarityDistribution')} style={{ position: 'relative' }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              {(() => {
                const items = data.similarity_histogram
                const maxVal = Math.max(...items.map(d => d.count), 1)
                const barW = Math.floor((W - 40) / items.length) - 2
                return items.map((d, i) => {
                  const barH = Math.max(d.count > 0 ? 4 : 0, (d.count / maxVal) * (H - 60))
                  const x = 20 + i * (barW + 2)
                  const y = H - 44 - barH
                  return (
                    <g key={d.bucket}>
                      <rect
                        x={x} y={y} width={barW} height={barH}
                        fill="var(--pm-success)" rx={2}
                        style={{ cursor: d.count > 0 ? 'pointer' : 'default' }}
                        onMouseMove={(e) => handleHistHover(e, d.bucket, d.count)}
                        onMouseLeave={() => setHistTooltip(null)}
                      >
                        <title>{d.bucket}: {d.count}</title>
                      </rect>
                      {d.count > 0 && (
                        <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="var(--pm-text)" fontWeight={600}>
                          {d.count}
                        </text>
                      )}
                      <text x={x + barW / 2} y={H - 24} textAnchor="middle" fontSize={9} fill="var(--pm-text-muted)">
                        {d.bucket.split('-')[0]}
                      </text>
                    </g>
                  )
                })
              })()}
            </svg>
            {histTooltip && (
              <div
                className="popover"
                style={{
                  position: 'absolute',
                  left: histTooltip.x,
                  top: histTooltip.y,
                  transform: 'translate(-50%, -100%)',
                  padding: '6px 12px',
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <strong>{histTooltip.label}</strong>: {histTooltip.value}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
