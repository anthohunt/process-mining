import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import * as d3 from 'd3'
import { useClusters } from '../hooks/useClusters'
import { supabase } from '../lib/supabase'
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

interface PopoverData {
  x: number
  y: number
  clusterId: string
  clusterName: string
  members: { id: string; full_name: string; lab: string }[]
  subThemes: string[]
  membersLoading: boolean
}

interface DisambiguationData {
  x: number
  y: number
  researchers: { id: string; full_name: string }[]
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 5
const TRUNCATE_MEMBERS = 10

export function MapPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, addToast, removeToast } = useToast()

  const locationState = location.state as { researcherId?: string } | null
  const highlightedResearcherId = locationState?.researcherId ?? null

  const { data: clusters, isLoading, isError, refetch } = useClusters()
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null)
  const [themeFilter, setThemeFilter] = useState('')
  const [labFilter, setLabFilter] = useState('')
  const [appliedThemeFilter, setAppliedThemeFilter] = useState('')
  const [appliedLabFilter, setAppliedLabFilter] = useState('')
  const [popover, setPopover] = useState<PopoverData | null>(null)
  const [disambiguation, setDisambiguation] = useState<DisambiguationData | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  // Show toast if navigated from profile with highlight
  useEffect(() => {
    if (highlightedResearcherId && clusters) {
      const found = clusters.some(c => c.members.some(m => m.id === highlightedResearcherId))
      if (!found) {
        addToast('info', t('profile.noMapPosition'))
      }
    }
  }, [highlightedResearcherId, clusters, addToast, t])

  // Get unique labs
  const allLabs = useMemo(() => {
    if (!clusters) return []
    const labs = new Set<string>()
    clusters.forEach(c => c.members.forEach(m => { if (m.lab) labs.add(m.lab) }))
    return Array.from(labs).sort()
  }, [clusters])

  const filteredClusters = useMemo(() => {
    let result = clusters ?? []
    if (appliedThemeFilter) {
      result = result.filter(c => c.id === appliedThemeFilter)
    }
    if (appliedLabFilter) {
      result = result.map(c => ({
        ...c,
        members: c.members.filter(m => m.lab === appliedLabFilter),
        researcher_count: c.members.filter(m => m.lab === appliedLabFilter).length,
      })).filter(c => c.members.length > 0)
    }
    return result
  }, [clusters, appliedThemeFilter, appliedLabFilter])

  // D3 Zoom setup
  useEffect(() => {
    const svg = svgRef.current
    const g = gRef.current
    if (!svg || !g) return

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.setAttribute('transform', event.transform.toString())
        // Close popover and disambiguation on zoom/pan
        setPopover(null)
        setDisambiguation(null)
      })

    d3.select(svg).call(zoom)
    zoomRef.current = zoom

    // If highlighted researcher, zoom to their position
    if (highlightedResearcherId && clusters && clusters.length > 0) {
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
        const transform = d3.zoomIdentity.translate(400 - dx * 2, 250 - dy * 2).scale(2)
        d3.select(svg).transition().duration(600).call(zoom.transform, transform)
        break
      }
    }

    return () => {
      d3.select(svg).on('.zoom', null)
    }
  }, [clusters, highlightedResearcherId])

  const handleApplyFilter = () => {
    setAppliedThemeFilter(themeFilter)
    setAppliedLabFilter(labFilter)
    setPopover(null)
    setDisambiguation(null)
  }

  const handleResetFilter = () => {
    setThemeFilter('')
    setLabFilter('')
    setAppliedThemeFilter('')
    setAppliedLabFilter('')
    setPopover(null)
    setDisambiguation(null)
  }

  // Compute dot positions for all filtered clusters
  const dotPositions = useMemo(() => {
    const positions: Map<string, { x: number; y: number; clusterId: string; clusterColor: string }> = new Map()
    const cols = Math.ceil(Math.sqrt(filteredClusters.length))
    filteredClusters.forEach((cluster, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const cx = 120 + col * (560 / Math.max(cols - 1, 1))
      const cy = 100 + row * (300 / Math.max(Math.ceil(filteredClusters.length / cols) - 1, 1))
      const r = 50 + cluster.researcher_count * 5
      const dotR = Math.min(r, 90) * 0.75
      cluster.members.forEach((m, j) => {
        const angle = (j / Math.max(cluster.members.length, 1)) * Math.PI * 2
        const dx = cx + Math.cos(angle) * dotR
        const dy = cy + Math.sin(angle) * dotR
        positions.set(m.id, { x: dx, y: dy, clusterId: cluster.id, clusterColor: cluster.color })
      })
    })
    return positions
  }, [filteredClusters])

  // Find overlapping dots
  const getOverlappingDots = useCallback((dotId: string): { id: string; full_name: string }[] => {
    const pos = dotPositions.get(dotId)
    if (!pos) return []
    const overlapping: { id: string; full_name: string }[] = []
    filteredClusters.forEach(cluster => {
      cluster.members.forEach(m => {
        const mPos = dotPositions.get(m.id)
        if (mPos && Math.abs(mPos.x - pos.x) < 8 && Math.abs(mPos.y - pos.y) < 8) {
          overlapping.push({ id: m.id, full_name: m.full_name })
        }
      })
    })
    return overlapping
  }, [dotPositions, filteredClusters])

  const navigateToProfile = useCallback(async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('researchers')
        .select('id')
        .eq('id', memberId)
        .single()
      if (error) {
        addToast('error', t('map.profileUnavailable'))
        return
      }
      navigate(`/researchers/${memberId}`)
    } catch {
      addToast('error', t('map.profileUnavailable'))
    }
  }, [navigate, addToast, t])

  const handleDotClick = useCallback((memberId: string, memberName: string, screenX: number, screenY: number) => {
    setPopover(null)
    const overlapping = getOverlappingDots(memberId)
    if (overlapping.length > 1) {
      const containerRect = containerRef.current?.getBoundingClientRect()
      setDisambiguation({
        x: screenX - (containerRect?.left ?? 0),
        y: screenY - (containerRect?.top ?? 0),
        researchers: overlapping,
      })
    } else {
      void navigateToProfile(memberId)
    }
  }, [getOverlappingDots, navigateToProfile])

  const handleClusterClick = useCallback((clusterId: string, screenX: number, screenY: number) => {
    setDisambiguation(null)
    const cluster = filteredClusters.find(c => c.id === clusterId)
    if (!cluster) return
    const containerRect = containerRef.current?.getBoundingClientRect()
    const popoverX = screenX - (containerRect?.left ?? 0)
    const popoverY = screenY - (containerRect?.top ?? 0)

    // Show popover immediately with loading state
    setPopover({
      x: popoverX,
      y: popoverY,
      clusterId: cluster.id,
      clusterName: cluster.name,
      members: [],
      subThemes: cluster.sub_themes,
      membersLoading: true,
    })

    // Lazily fetch members for this cluster
    supabase
      .from('researchers')
      .select('id, full_name, lab, cluster_id')
      .eq('cluster_id', clusterId)
      .eq('status', 'approved')
      .then(({ data, error }) => {
        if (error) {
          setPopover(prev => prev?.clusterId === clusterId
            ? { ...prev, membersLoading: false, members: cluster.members }
            : prev)
          return
        }
        const members = (data ?? []).map(r => ({ id: r.id, full_name: r.full_name, lab: r.lab }))
        setPopover(prev => prev?.clusterId === clusterId
          ? { ...prev, membersLoading: false, members }
          : prev)
      })
  }, [filteredClusters])

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as Element
    // In SVG, closest works on SVG elements too
    if (
      target.closest('.popover') ||
      target.closest('.map-filter-panel') ||
      target.closest('.map-legend') ||
      target.closest('[data-cluster-region]') ||
      target.closest('[data-researcher-dot]')
    ) {
      return
    }
    // Also check if the target IS one of those elements (for SVG)
    if (
      target.hasAttribute('data-cluster-region') ||
      target.hasAttribute('data-researcher-dot')
    ) {
      return
    }
    setPopover(null)
    setDisambiguation(null)
  }, [])

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{t('map.title')}</h1>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/themes')}
        >
          {t('map.viewList')}
        </button>
      </div>

      <div
        ref={containerRef}
        className="map-container"
        role="img"
        aria-label={t('map.ariaLabel')}
        style={{ position: 'relative' }}
        onClick={handleContainerClick}
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
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>{t('map.filterLab')}</label>
                <select
                  className="form-control"
                  style={{ fontSize: 12 }}
                  aria-label={t('map.filterLab')}
                  value={labFilter}
                  onChange={e => setLabFilter(e.target.value)}
                >
                  <option value="">{t('map.resetFilter')}</option>
                  {allLabs.map(lab => <option key={lab} value={lab}>{lab}</option>)}
                </select>
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleApplyFilter}
              >
                {t('map.apply')}
              </button>
              {(appliedThemeFilter || appliedLabFilter) && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  onClick={handleResetFilter}
                >
                  {t('map.resetFilter')}
                </button>
              )}
            </div>

            {/* SVG Map */}
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 800 500"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', inset: 0 }}
            >
              <rect width="800" height="500" fill="#0c1b33" />
              <g ref={gRef}>
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
                        data-cluster-region={cluster.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClusterClick(cluster.id, e.clientX, e.clientY)
                        }}
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
                        {cluster.name.length > 14 ? cluster.name.slice(0, 14) + '\u2026' : cluster.name}
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
                            {/* Invisible larger hit area for minimum touch target */}
                            <circle
                              cx={dx} cy={dy}
                              r={12}
                              fill="transparent"
                              stroke="none"
                              style={{ cursor: 'pointer' }}
                              data-researcher-dot={m.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDotClick(m.id, m.full_name, e.clientX, e.clientY)
                              }}
                              onMouseEnter={() => {
                                setTooltip({ x: dx, y: dy - 16, name: m.full_name })
                              }}
                              onMouseLeave={() => setTooltip(null)}
                              role="button"
                              aria-label={m.full_name}
                            />
                            <circle
                              cx={dx} cy={dy}
                              r={isHighlighted ? 8 : 6}
                              fill={isHighlighted ? '#fff' : cluster.color}
                              stroke={isHighlighted ? cluster.color : '#fff'}
                              strokeWidth={isHighlighted ? 2 : 1.5}
                              style={{ cursor: 'pointer', pointerEvents: 'none' }}
                            />
                          </g>
                        )
                      })}
                    </g>
                  )
                })}

                {/* Tooltip */}
                {tooltip && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect
                      x={tooltip.x - 60}
                      y={tooltip.y - 24}
                      width={120}
                      height={22}
                      rx={4}
                      fill="rgba(0,0,0,0.8)"
                    />
                    <text
                      x={tooltip.x}
                      y={tooltip.y - 13}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={11}
                      fontFamily="Poppins, sans-serif"
                    >
                      {tooltip.name.length > 18 ? tooltip.name.slice(0, 18) + '\u2026' : tooltip.name}
                    </text>
                  </g>
                )}
              </g>
            </svg>

            {/* Cluster Popover */}
            {popover && (
              <div
                className="popover"
                style={{
                  left: Math.min(popover.x, (containerRef.current?.offsetWidth ?? 500) - 300),
                  top: Math.min(popover.y, (containerRef.current?.offsetHeight ?? 400) - 250),
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{popover.clusterName}</div>
                {popover.subThemes.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    {popover.subThemes.map(st => (
                      <span key={st} className="tag tag-blue">{st}</span>
                    ))}
                  </div>
                )}
                {popover.membersLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                    <LoadingSpinner message={t('common.loading')} size="sm" />
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: 'var(--pm-text-muted)' }}>
                      {t('map.clusterMembers')} ({popover.members.length})
                    </div>
                    <ul style={{ listStyle: 'none', maxHeight: 200, overflowY: 'auto' }}>
                      {popover.members.slice(0, TRUNCATE_MEMBERS).map(m => (
                        <li key={m.id} style={{ padding: '3px 0' }}>
                          <button
                            className="btn-ghost"
                            style={{ fontSize: 13, padding: '2px 0', color: 'var(--pm-primary)' }}
                            onClick={() => void navigateToProfile(m.id)}
                          >
                            {m.full_name}
                          </button>
                          <span style={{ fontSize: 11, color: 'var(--pm-text-muted)', marginLeft: 4 }}>{m.lab}</span>
                        </li>
                      ))}
                    </ul>
                    {popover.members.length > TRUNCATE_MEMBERS && (
                      <div style={{ fontSize: 12, color: 'var(--pm-text-muted)', marginTop: 4 }}>
                        {t('map.andNOthers', { count: popover.members.length - TRUNCATE_MEMBERS })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Disambiguation Popover */}
            {disambiguation && (
              <div
                className="popover"
                style={{
                  left: Math.min(disambiguation.x, (containerRef.current?.offsetWidth ?? 500) - 250),
                  top: Math.min(disambiguation.y, (containerRef.current?.offsetHeight ?? 400) - 200),
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12 }}>
                  {t('map.disambiguation')}
                </div>
                <ul style={{ listStyle: 'none' }}>
                  {disambiguation.researchers.map(r => (
                    <li key={r.id} style={{ padding: '3px 0' }}>
                      <button
                        className="btn-ghost"
                        style={{ fontSize: 13, padding: '2px 0', color: 'var(--pm-primary)' }}
                        onClick={() => void navigateToProfile(r.id)}
                      >
                        {r.full_name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
