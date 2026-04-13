import { useTranslation } from 'react-i18next'
import { useStats } from '../../hooks/useStats'
import { StatCard } from './StatCard'
import { ErrorState } from '../common/ErrorState'

export function StatGrid() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useStats()

  if (isError) {
    return (
      <div className="stat-grid" style={{ display: 'block' }}>
        <ErrorState
          message={t('dashboard.noData')}
          onRetry={() => void refetch()}
          retryLabel={t('dashboard.retry')}
        />
      </div>
    )
  }

  const allZero = data && data.researchers === 0 && data.themes === 0 && data.clusters === 0 && data.publications === 0

  return (
    <>
      <div className="stat-grid" role="region" aria-label="Statistiques globales">
        <StatCard
          label={t('dashboard.stats.researchers')}
          value={data?.researchers}
          navigateTo="/researchers"
          isLoading={isLoading}
          ariaLabel={`${data?.researchers ?? 0} ${t('dashboard.stats.researchers')}`}
        />
        <StatCard
          label={t('dashboard.stats.themes')}
          value={data?.themes}
          navigateTo="/themes"
          isLoading={isLoading}
          ariaLabel={`${data?.themes ?? 0} ${t('dashboard.stats.themes')}`}
        />
        <StatCard
          label={t('dashboard.stats.clusters')}
          value={data?.clusters}
          navigateTo="/map"
          isLoading={isLoading}
          ariaLabel={`${data?.clusters ?? 0} ${t('dashboard.stats.clusters')}`}
        />
        <StatCard
          label={t('dashboard.stats.publications')}
          value={data?.publications}
          navigateTo="/researchers"
          isLoading={isLoading}
          ariaLabel={`${data?.publications ?? 0} ${t('dashboard.stats.publications')}`}
        />
      </div>
      {allZero && (
        <p
          style={{ fontSize: 13, color: 'var(--pm-text-muted)', marginBottom: 16, textAlign: 'center' }}
          role="status"
        >
          {t('dashboard.noData')}
        </p>
      )}
    </>
  )
}
