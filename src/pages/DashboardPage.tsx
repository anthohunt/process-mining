import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { StatGrid } from '../components/dashboard/StatGrid'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'

const MiniMap = lazy(() => import('../components/dashboard/MiniMap').then(m => ({ default: m.MiniMap })))

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
          <Suspense fallback={<div style={{ height: 200 }} />}>
            <MiniMap />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
