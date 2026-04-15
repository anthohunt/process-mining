import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useCallback } from 'react'
import { useResearcherProfile } from '../hooks/useResearchers'
import { getInitials, stringToColor } from '../lib/formatting'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { ToastContainer, type ToastMessage } from '../components/common/Toast'
import { useAuthStore } from '../stores/authStore'

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
  }, [])
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])
  return { toasts, addToast, removeToast }
}

export function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [bioExpanded, setBioExpanded] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isValidUuid = id ? UUID_RE.test(id) : false

  const { data: profile, isLoading, isError, error } = useResearcherProfile(isValidUuid ? id : undefined)

  const is404 = !isValidUuid || (isError && (
    (error as Error & { status?: number }).status === 404 ||
    (error as Error).message === 'Not found' ||
    (error as Error).message?.includes('PGRST116')
  ))

  if (isLoading) return <LoadingSpinner />

  if (is404 || (isError && !profile)) {
    return (
      <div>
        <div className="breadcrumb">
          <a href="/researchers" onClick={e => { e.preventDefault(); navigate('/researchers') }}>
            {t('researchers.title')}
          </a>
          <span className="breadcrumb-sep">›</span>
          <span>{t('profile.notFound')}</span>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2 style={{ marginBottom: 8 }}>{t('profile.notFound')}</h2>
          <p style={{ color: 'var(--pm-text-muted)', marginBottom: 20, fontSize: 14 }}>
            {t('profile.notFoundDetail')}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/researchers')}>
            {t('profile.backToList')}
          </button>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <div className="breadcrumb">
          <a href="/researchers" onClick={e => { e.preventDefault(); navigate('/researchers') }}>
            {t('researchers.title')}
          </a>
          <span className="breadcrumb-sep">›</span>
          <span>{t('profile.errorBreadcrumb')}</span>
        </div>
        <ErrorState />
      </div>
    )
  }

  if (!profile) return null

  const initials = getInitials(profile.full_name)
  const color = stringToColor(profile.full_name)
  const isOwn = user?.id === profile.user_id
  const isLoggedIn = !!user
  const bio: string = profile.bio ?? ''
  const bioTruncated = bio.length > 2000
  const displayBio = bioTruncated && !bioExpanded ? bio.slice(0, 2000) + '…' : bio

  function handleViewOnMap() {
    if (!profile!.map_x || !profile!.map_y) {
      addToast('info', t('profile.noMapPosition'))
      return
    }
    navigate('/map', { state: { researcherId: id } })
  }

  const hasMapCoords = !!(profile.map_x && profile.map_y)

  const isRejected = profile.status === 'rejected' && !!profile.rejection_reason

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {isOwn && isRejected && (
        <div className="banner-error" role="alert" style={{ marginBottom: 16 }}>
          <strong>{t('profile.rejectionBanner')}</strong> {t('profile.rejectionReason')} : {profile.rejection_reason}
        </div>
      )}

      <div className="breadcrumb">
        <a href="/researchers" onClick={e => { e.preventDefault(); navigate('/researchers') }}>
          {t('researchers.title')}
        </a>
        <span className="breadcrumb-sep">›</span>
        <span>{profile.full_name}</span>
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <div className="card profile-sidebar">
          <div
            className="profile-avatar-lg"
            style={{ background: color }}
            aria-label={`Avatar de ${profile.full_name}`}
          >
            {initials}
          </div>
          <div className="profile-name">{profile.full_name}</div>
          <div className="profile-lab">{profile.lab}</div>
          {bio && (
            <div className="profile-bio">
              {displayBio}
              {bioTruncated && (
                <button
                  className="btn-ghost"
                  onClick={() => setBioExpanded(e => !e)}
                  style={{ display: 'block', marginTop: 4, fontSize: 13 }}
                  aria-label={bioExpanded ? t('profile.readLess') : t('profile.readMore')}
                >
                  {bioExpanded ? t('profile.readLess') : t('profile.readMore')}
                </button>
              )}
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/comparison', { state: { researcherId: id, researcherName: profile.full_name } })}
              aria-label={`Comparer ${profile.full_name}`}
            >
              {t('profile.compare')}
            </button>

            <button
              id="profile-map-link"
              className="btn btn-outline btn-sm"
              onClick={handleViewOnMap}
              disabled={!hasMapCoords}
              aria-label={`Voir ${profile.full_name} sur la carte`}
              title={!hasMapCoords ? t('profile.noMapPosition') : undefined}
            >
              {t('profile.viewOnMap')}
            </button>

            {isLoggedIn && isOwn && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/researchers/${id}/edit`)}
                aria-label={`Modifier le profil de ${profile.full_name}`}
              >
                {t('profile.edit')}
              </button>
            )}
            {isLoggedIn && !isOwn && (
              <div>
                <button
                  className="btn btn-outline btn-sm"
                  disabled
                  aria-label={t('profile.editLocked')}
                  title={t('profile.editLocked')}
                >
                  🔒 {t('profile.edit')}
                </button>
                <p style={{ fontSize: 12, color: 'var(--pm-text-muted)', marginTop: 4 }}>
                  {t('profile.editLocked')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div>
          {/* Keywords */}
          <div className="card">
            <h2 className="card-title">{t('profile.keywords')}</h2>
            {profile.keywords?.length > 0 ? (
              <div>
                {profile.keywords.map((k: string) => (
                  <span key={k} className="tag tag-blue">{k}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--pm-text-muted)', fontSize: 14 }}>{t('profile.noKeywords')}</p>
            )}
          </div>

          {/* Publications */}
          <div className="card">
            <h2 className="card-title">{t('profile.publications')}</h2>
            {profile.publications && profile.publications.length > 0 ? (
              <ul style={{ listStyle: 'none' }}>
                {profile.publications.map((pub) => (
                  <li key={pub.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--pm-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{pub.title}</div>
                    {pub.coauthors && <div style={{ fontSize: 13, color: 'var(--pm-text-muted)' }}>{pub.coauthors}</div>}
                    <div style={{ fontSize: 12, color: 'var(--pm-text-muted)' }}>
                      {[pub.venue, pub.year].filter(Boolean).join(' — ')}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--pm-text-muted)', fontSize: 14 }}>{t('profile.noPublications')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
