import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useClusters } from '../hooks/useClusters'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'
import { ToastContainer, type ToastMessage } from '../components/common/Toast'

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
  }, [])
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  return { toasts, addToast, removeToast }
}

export function MapPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, addToast, removeToast } = useToast()

  // State passed from ProfilePage when "Voir sur la carte" is clicked
  const locationState = location.state as { researcherId?: string } | null
  const highlightedResearcherId = locationState?.researcherId ?? null

  const { data: clusters, isLoading, isError, refetch } = useClusters()
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null)
  const [themeFilter, setThemeFilter] = useState('')
  const [appliedFilter, setAppliedFilter] = useState('')

  // Show toast if navigated from profile with highlight
  useEffect(() => {
    if (highlightedResearcherId && clusters) {
      const found = clusters.some(c => c.members.some(m => m.id === highlightedResearcherId))
      if (!found) {
        addToast('info', 'Ce chercheur n\'a pas encore de position sur la carte.')
      }
    }
  }, [highlightedResearcherId, clusters, addToast])

  const filteredClusters = appliedFilter
    ? (clusters ?? []).filter(c => c.id === appliedFilter)
    : (clusters ?? [])

  // Compute the SVG viewBox centered on the highlighted researcher's dot
  const centeredViewBox = useMemo(() => {
    if (!highlightedResearcherId || !clusters || clusters.length === 0) return null
    const allClusters = clusters
    const cols = Math.ceil(Math.sqrt(allClusters.length))
    for (let i = 0; i < allClusters.length; i++) {
      const cluster = allClusters[i]
      const memberIdx = cluster.members.findIndex(m => m.id === highlightedResearcherId)
      if (memberIdx === -1) continue
      const col = i % cols
      const row = Math.floor(i / cols)
      const cx = 120 + col * (560 / Math.max(cols - 1, 1))
      const cy = 100 + row * (300 / Math.max(Math.ceil(allClusters.length / cols) - 1, 1))
      const r = 50 + cluster.researcher_count * 5
      const dotR = Math.min(r, 90) * 0.75
      const angle = (memberIdx / Math.max(cluster.members.length, 1)) * Math.PI * 2
      const dx = cx + Math.cos(angle) * dotR
      const dy = cy + Math.sin(angle) * dotR
      // ViewBox: 300x200 window centered on the dot
      return `${dx - 150} ${dy - 100} 300 200`
    }
    return null
  }, [highlightedResearcherId, clusters])

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <h1 className="page-title">{t('map.title')}</h1>

      <div
        className="map-container"
        role="img"
        aria-label={t('map.ariaLabel')}
        style={{ position: 'relative' }}
        onMouseLeave={() => setTooltip(null)}
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
                <select
                  className="form-control"
                  style={{ fontSize: 12 }}
                  aria-label={t('map.filterTheme')}
                  value={themeFilter}
                  onChange={e => setThemeFilter(e.target.value)}
                >
                  <option value="">{t('map.resetFilter')}</option>
                  {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setAppliedFilter(themeFilter)}
              >
                {t('map.apply')}
              </button>
              {appliedFilter && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  onClick={() => { setThemeFilter(''); setAppliedFilter('') }}
                >
                  {t('map.resetFilter')}
                </button>
              )}
            </div>

            {/* SVG Map */}
            <svg
              width="100%"
              height="100%"
              viewBox={centeredViewBox ?? "0 0 800 500"}
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', inset: 0, transition: 'viewBox 0.6s ease' }}
            >
              <rect width="800" height="500" fill="#0c1b33" />
              {filteredClusters.map((cluster, i) => {
                const cols = Math.ceil(Math.sqrt(filteredClusters.length))
                const col = i % cols
                const row = Math.floor(i / cols)
                const cx = 120 + col * (560 / Math.max(cols - 1, 1))
                const cy = 100 + row * (300 / Math.max(Math.ceil(filteredClusters.length / cols) - 1, 1))
                const r = 50 + cluster.researcher_count * 5

                return (
                  <g key={cluster.id}>
                    <circle
                      cx={cx} cy={cy}
                      r={Math.min(r, 90)}
                      fill={cluster.color}
                      fillOpacity={0.3}
                      stroke={cluster.color}
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                    />
                    <text
                      x={cx} y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={12}
                      fontFamily="Poppins, sans-serif"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {cluster.name.length > 14 ? cluster.name.slice(0, 14) + '…' : cluster.name}
                    </text>
                    {cluster.members.map((m, j) => {
                      const angle = (j / Math.max(cluster.members.length, 1)) * Math.PI * 2
                      const dotR = Math.min(r, 90) * 0.75
                      const dx = cx + Math.cos(angle) * dotR
                      const dy = cy + Math.sin(angle) * dotR
                      const isHighlighted = m.id === highlightedResearcherId

                      return (
                        <g key={m.id}>
                          {isHighlighted && (
                            <circle
                              cx={dx} cy={dy}
                              r={14}
                              fill="none"
                              stroke="#fff"
                              strokeWidth={2}
                              opacity={0.6}
                            >
                              <animate attributeName="r" values="10;18;10" dur="1.5s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <circle
                            cx={dx} cy={dy}
                            r={isHighlighted ? 8 : 6}
                            fill={isHighlighted ? '#fff' : cluster.color}
                            stroke={isHighlighted ? cluster.color : '#fff'}
                            strokeWidth={isHighlighted ? 2 : 1.5}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/researchers/${m.id}`)}
                            role="button"
                            aria-label={m.full_name}
                            onMouseEnter={e => {
                              const rect = (e.target as SVGCircleElement).ownerSVGElement?.getBoundingClientRect()
                              if (!rect) return
                              const svgX = parseFloat((e.target as SVGCircleElement).getAttribute('cx') ?? '0')
                              const svgY = parseFloat((e.target as SVGCircleElement).getAttribute('cy') ?? '0')
                              setTooltip({ x: svgX, y: svgY - 16, name: m.full_name })
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            <title>{m.full_name}</title>
                          </circle>
                        </g>
                      )
                    })}
                  </g>
                )
              })}

              {/* Tooltip */}
              {tooltip && (
                <g>
                  <rect
                    x={tooltip.x - 60}
                    y={tooltip.y - 24}
                    width={120}
                    height={22}
                    rx={4}
                    fill="rgba(0,0,0,0.8)"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={tooltip.x}
                    y={tooltip.y - 13}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={11}
                    fontFamily="Poppins, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {tooltip.name.length > 18 ? tooltip.name.slice(0, 18) + '…' : tooltip.name}
                  </text>
                </g>
              )}
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
