import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function AdminPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()

  if (!isAdmin) {
    return (
      <div>
        <p style={{ color: 'var(--pm-danger)' }}>Acces refuse. Vous devez etre administrateur.</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          {t('common.back')}
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">{t('admin.title')}</h1>
      <p style={{ color: 'var(--pm-text-muted)', fontSize: 14 }}>
        Panneau d''administration — disponible en M5.
      </p>
    </div>
  )
}
