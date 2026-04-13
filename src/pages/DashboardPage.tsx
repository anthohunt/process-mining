import { useTranslation } from 'react-i18next'
import { StatGrid } from '../components/dashboard/StatGrid'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { MiniMap } from '../components/dashboard/MiniMap'

export function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="page-title">{t('dashboard.title')}</h1>

      <StatGrid />

      <div className="two-col">
        <ActivityFeed />
        <div>
          <div className="card-title" style={{ marginBottom: 8 }}>{t('dashboard.minimap.title')}</div>
          <MiniMap />
        </div>
      </div>
    </div>
  )
}
