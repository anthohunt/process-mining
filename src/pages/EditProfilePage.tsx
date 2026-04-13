import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div>
        <p>{t('login.sessionExpired')}</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          {t('nav.login')}
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">{t('editProfile.title')}</h1>
      <div className="breadcrumb">
        <a href="/researchers" onClick={e => { e.preventDefault(); navigate('/researchers') }}>
          {t('researchers.title')}
        </a>
        <span className="breadcrumb-sep">›</span>
        <span>{t('editProfile.title')}</span>
      </div>
      <div className="banner-warning" role="alert">
        {t('editProfile.approvalBanner')}
      </div>
      <p style={{ color: 'var(--pm-text-muted)', fontSize: 14 }}>
        Formulaire de modification — disponible en M4.
      </p>
      <button className="btn btn-outline" onClick={() => navigate(id ? `/researchers/${id}` : '/researchers')}>
        {t('editProfile.cancel')}
      </button>
    </div>
  )
}
