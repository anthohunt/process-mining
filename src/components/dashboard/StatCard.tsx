import { useNavigate } from 'react-router-dom'
import { formatNumber } from '../../lib/formatting'

interface Props {
  label: string
  value: number | undefined
  navigateTo: string
  isLoading?: boolean
  ariaLabel?: string
}

export function StatCard({ label, value, navigateTo, isLoading, ariaLabel }: Props) {
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="stat-card skeleton skeleton-card" aria-busy="true" aria-label="Chargement..." />
  }

  return (
    <button
      className="stat-card"
      onClick={() => navigate(navigateTo)}
      aria-label={ariaLabel ?? `${value !== undefined ? formatNumber(value) : '0'} ${label}`}
    >
      <div className="stat-number" aria-hidden="true">
        {value !== undefined ? formatNumber(value) : '0'}
      </div>
      <div className="stat-label">{label}</div>
    </button>
  )
}
