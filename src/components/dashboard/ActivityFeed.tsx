import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useActivity } from '../../hooks/useActivity'
import { getInitials, stringToColor, formatRelativeTime } from '../../lib/formatting'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'
import { EmptyState } from '../common/EmptyState'

export function ActivityFeed() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useActivity()
  const navigate = useNavigate()

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <h2 className="card-title">{t('dashboard.activity.title')}</h2>

      {isLoading && <LoadingSpinner message={t('common.loading')} />}

      {isError && (
        <ErrorState
          message={t('dashboard.activity.error')}
          onRetry={() => void refetch()}
          retryLabel={t('dashboard.activity.retry')}
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState message={t('dashboard.activity.empty')} />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ul className="activity-list" aria-label="Activites recentes">
          {data.map(item => {
            const name = item.user_name ?? 'Utilisateur inconnu'
            const isDeleted = !item.user_name
            const color = stringToColor(name)
            const initials = getInitials(name)

            return (
              <li key={item.id} className="activity-item">
                <div
                  className="activity-avatar"
                  style={{ background: isDeleted ? '#adb5bd' : color }}
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="activity-body">
                  <div className="activity-text">
                    {isDeleted ? (
                      <span className="activity-name deleted" aria-label={`Utilisateur ${t('profile.deletedProfile')}`}>
                        {name} <em>{t('profile.deletedProfile')}</em>
                      </span>
                    ) : item.researcher_id ? (
                      <button
                        className="activity-name"
                        onClick={() => navigate(`/researchers/${item.researcher_id}`)}
                        aria-label={`Voir le profil de ${name}`}
                      >
                        {name}
                      </button>
                    ) : (
                      <button
                        className="activity-name"
                        onClick={() => navigate('/researchers')}
                        aria-label={`Voir la liste des chercheurs`}
                      >
                        {name}
                      </button>
                    )}
                    {' '}{item.action}{item.detail ? ` — ${item.detail}` : ''}
                  </div>
                  <div className="activity-time" aria-label={`Il y a ${formatRelativeTime(item.created_at)}`}>
                    {formatRelativeTime(item.created_at)}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
