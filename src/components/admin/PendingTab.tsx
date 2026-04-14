import { useTranslation } from 'react-i18next'
import { usePendingProfiles, useApproveProfile, useRejectProfile } from '../../hooks/usePendingProfiles'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'
import { EmptyState } from '../common/EmptyState'

interface ToastMsg { type: 'success' | 'error'; message: string }

interface Props {
  onToast: (msg: ToastMsg) => void
}

export function PendingTab({ onToast }: Props) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = usePendingProfiles()
  const approve = useApproveProfile()
  const reject = useRejectProfile()

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <ErrorState
      message={t('common.error')}
      onRetry={() => void refetch()}
      retryLabel={t('common.retry')}
    />
  )

  const profiles = data ?? []

  const handleApprove = async (id: string) => {
    try {
      await approve.mutateAsync(id)
      onToast({ type: 'success', message: 'Profil approuv\u00e9.' })
    } catch {
      onToast({ type: 'error', message: t('common.error') })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await reject.mutateAsync({ id })
      onToast({ type: 'success', message: 'Profil rejet\u00e9.' })
    } catch {
      onToast({ type: 'error', message: t('common.error') })
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>{t('admin.tabs.pending')}</h2>

      {profiles.length === 0 ? (
        <EmptyState message={t('admin.pending.noPending')} />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="app-table" id="admin-tab-admin-pending" aria-label={t('admin.tabs.pending')}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Laboratoire</th>
                <th>Themes</th>
                <th>Soumis le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.full_name}</td>
                  <td>{p.lab}</td>
                  <td>
                    {(p.keywords ?? []).slice(0, 3).map(k => (
                      <span key={k} className="tag tag-blue">{k}</span>
                    ))}
                    {p.keywords?.length > 3 && (
                      <span className="tag tag-gray">+{p.keywords.length - 3}</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--pm-text-muted)', fontSize: 13 }}>
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => void handleApprove(p.id)}
                        disabled={approve.isPending}
                        aria-label={`Approuver le profil de ${p.full_name}`}
                      >
                        {t('admin.pending.approve')}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => void handleReject(p.id)}
                        disabled={reject.isPending}
                        aria-label={`Rejeter le profil de ${p.full_name}`}
                      >
                        {t('admin.pending.reject')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
