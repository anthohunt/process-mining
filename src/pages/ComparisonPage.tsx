import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'

export function ComparisonPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="page-title">{t('nav.researchers')} — Comparaison</h1>
      <div className="breadcrumb">
        <a href="/researchers" onClick={e => { e.preventDefault(); navigate('/researchers') }}>
          {t('researchers.title')}
        </a>
        <span className="breadcrumb-sep">›</span>
        <span>Comparaison</span>
      </div>
      <EmptyState message="Selectionnez deux chercheurs depuis leurs profils pour lancer une comparaison." />
    </div>
  )
}
