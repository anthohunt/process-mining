import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import { useAdminUsers, useUpdateUserRole, useRevokeUser, useInviteUser } from '../../hooks/useAdminUsers'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'
import { EmptyState } from '../common/EmptyState'
import { getInitials, stringToColor } from '../../lib/formatting'

interface ToastMsg { type: 'success' | 'error'; message: string }

interface Props {
  onToast: (msg: ToastMsg) => void
}

export function UsersTab({ onToast }: Props) {
  const { t } = useTranslation()
  const { user: currentUser } = useAuthStore()
  const { data, isLoading, isError, refetch } = useAdminUsers()
  const updateRole = useUpdateUserRole()
  const revokeUser = useRevokeUser()
  const inviteUser = useInviteUser()

  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<'admin' | 'researcher'>('researcher')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [selfRevokeWarning, setSelfRevokeWarning] = useState(false)

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <ErrorState
      message={t('common.error')}
      onRetry={() => void refetch()}
      retryLabel={t('common.retry')}
    />
  )

  const users = data ?? []

  const handleEditClick = (userId: string, currentRole: 'admin' | 'researcher') => {
    setEditingUserId(userId)
    setEditRole(currentRole)
  }

  const handleRoleSave = async () => {
    if (!editingUserId) return
    try {
      await updateRole.mutateAsync({ userId: editingUserId, role: editRole })
      onToast({ type: 'success', message: 'Role mis a jour.' })
    } catch {
      onToast({ type: 'error', message: t('common.error') })
    }
    setEditingUserId(null)
  }

  const handleRevokeClick = async (userId: string) => {
    if (userId === currentUser?.id) {
      setSelfRevokeWarning(true)
      setTimeout(() => setSelfRevokeWarning(false), 3000)
      return
    }
    try {
      await revokeUser.mutateAsync(userId)
      onToast({ type: 'success', message: 'Acces revoqu\u00e9.' })
    } catch {
      onToast({ type: 'error', message: t('common.error') })
    }
  }

  const handleInviteSubmit = async () => {
    if (!inviteEmail.trim()) return
    try {
      await inviteUser.mutateAsync(inviteEmail.trim())
      onToast({ type: 'success', message: t('admin.users.inviteSuccess') })
      setShowInviteDialog(false)
      setInviteEmail('')
    } catch {
      onToast({ type: 'error', message: t('admin.users.inviteError') })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{t('admin.tabs.users')}</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowInviteDialog(true)}
          id="invite-btn-admin"
          aria-label={t('admin.users.invite')}
        >
          + {t('admin.users.invite')}
        </button>
      </div>

      {selfRevokeWarning && (
        <div
          className="error-state"
          role="alert"
          style={{ marginBottom: 12 }}
        >
          {t('admin.users.selfRevoke')}
        </div>
      )}

      {users.length === 0 ? (
        <EmptyState message={t('admin.users.noUsers')} />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="app-table" id="admin-tab-admin-users" aria-label={t('admin.tabs.users')}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>{t('admin.users.email')}</th>
                <th>{t('admin.users.role')}</th>
                <th>{t('admin.users.status')}</th>
                <th>{t('admin.users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        className="activity-avatar"
                        style={{ background: stringToColor(u.full_name), width: 32, height: 32, fontSize: 11, flexShrink: 0 }}
                        aria-hidden="true"
                      >
                        {getInitials(u.full_name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.full_name}</span>
                      {u.id === currentUser?.id && (
                        <span className="tag tag-gray" style={{ fontSize: 10 }}>(vous)</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--pm-text-muted)', fontSize: 13 }}>{u.email}</td>
                  <td>
                    {editingUserId === u.id ? (
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '2px 6px', fontSize: 13 }}
                        value={editRole}
                        onChange={e => setEditRole(e.target.value as 'admin' | 'researcher')}
                        aria-label="Nouveau role"
                      >
                        <option value="researcher">Chercheur</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-researcher'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Chercheur'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-active' : 'badge-revoked'}`}>
                      {u.status === 'active' ? 'Actif' : 'Révoqué'}
                    </span>
                  </td>
                  <td>
                    {editingUserId === u.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleRoleSave}
                          disabled={updateRole.isPending}
                          aria-label="Sauvegarder le role"
                        >
                          Sauvegarder
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingUserId(null)}
                          aria-label="Annuler la modification"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEditClick(u.id, u.role)}
                          aria-label={`Modifier le role de ${u.full_name}`}
                        >
                          {t('admin.users.modify')}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => void handleRevokeClick(u.id)}
                          disabled={u.id === currentUser?.id}
                          aria-label={`Revoquer ${u.full_name}`}
                        >
                          {t('admin.users.revoke')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInviteDialog && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t('admin.users.invite')}
          onClick={e => { if (e.target === e.currentTarget) setShowInviteDialog(false) }}
        >
          <div className="modal-card" id="invite-dialog">
            <h3 style={{ marginTop: 0 }}>{t('admin.users.invite')}</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="invite-email">{t('admin.users.email')}</label>
              <input
                id="invite-email"
                type="email"
                className="form-control"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@exemple.com"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') void handleInviteSubmit() }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowInviteDialog(false); setInviteEmail('') }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => void handleInviteSubmit()}
                disabled={inviteUser.isPending || !inviteEmail.trim()}
              >
                {inviteUser.isPending ? t('common.loading') : 'Envoyer l\'invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
