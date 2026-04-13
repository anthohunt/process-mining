import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useClusters } from '../../hooks/useClusters'
import { LoadingSpinner } from '../common/LoadingSpinner'

export function MiniMap() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: clusters, isLoading, isError } = useClusters()

  const handleClick = () => navigate('/map')

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="mini-map-placeholder">
          <LoadingSpinner message={t('dashboard.minimap.loading')} />
        </div>
      )
    }

    if (isError) {
      return (
        <div className="mini-map-placeholder">
          <span>{t('dashboard.minimap.fallback')}</span>
        </div>
      )
    }

    if (!clusters || clusters.length === 0) {
      return (
        <div className="mini-map-placeholder">
          <span>{t('dashboard.minimap.noData')}</span>
        </div>
      )
    }

    // Render simplified SVG cluster preview
    return (
      <svg
        className="mini-map-svg"
        viewBox="0 0 400 220"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="400" height="220" fill="#0c1b33" />
        {clusters.map((cluster, i) => {
          // Spread clusters across the viewbox in a grid-like pattern
          const cols = Math.ceil(Math.sqrt(clusters.length))
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = 60 + col * (280 / Math.max(cols - 1, 1))
          const y = 50 + row * (120 / Math.max(Math.ceil(clusters.length / cols) - 1, 1))
          const r = 20 + (cluster.researcher_count * 3)

          return (
            <g key={cluster.id}>
              <circle
                cx={x}
                cy={y}
                r={Math.min(r, 40)}
                fill={cluster.color}
                fillOpacity={0.6}
                stroke={cluster.color}
                strokeWidth={1}
              />
              {cluster.members.slice(0, 5).map((m, j) => {
                const angle = (j / 5) * Math.PI * 2
                const dotX = x + Math.cos(angle) * (Math.min(r, 40) * 0.7)
                const dotY = y + Math.sin(angle) * (Math.min(r, 40) * 0.7)
                return (
                  <circle
                    key={m.id}
                    cx={dotX}
                    cy={dotY}
                    r={3}
                    fill="#fff"
                    fillOpacity={0.8}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div
      className="mini-map-container"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={t('dashboard.minimap.clickHint')}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
    >
      {renderContent()}
      {!isLoading && !isError && clusters && clusters.length > 0 && (
        <div className="mini-map-overlay">
          {t('dashboard.minimap.clickHint')}
        </div>
      )}
    </div>
  )
}
