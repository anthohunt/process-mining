import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getInitials, stringToColor } from '../lib/formatting'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { useAuthStore } from '../stores/authStore'

async function fetchProfile(id: string) {
  const { data, error } = await supabase
    .from('researchers')
    .select('*, publications(*), clusters(name, color)')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [bioExpanded, setBioExpanded] = useState(false)

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => fetchProfile(id!),
    enabled: !!id,
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !profile) {
    return (
      <div>
        <div className="breadcrumb">
          <a href="/researchers" onClick={e => { e.preventDefault(); navigate('/researchers') }}>
            {t('researchers.title')}
          </a>
          <span className="breadcrumb-sep">›</span>
          <span>{t('profile.notFound')}</span>
        </div>
        <ErrorState message={t('profile.notFound')} />
        <button className="btn btn-outline" onClick={() => navigate('/researchers')}>
          {t('profile.backToList')}
        </button>
      </div>
    )
  }

  const initials = getInitials(profile.full_name)
  const color = stringToColor(profile.full_name)
  const isOwn = user?.id === profile.user_id
  const isLoggedIn = !!user
  const bio: string = profile.bio ?? ''
  const bioTruncated = bio.length > 2000
  const displayBio = bioTruncated && !bioExpanded ? bio.slice(0, 2000) + '…' : bio

  return (
    <div>
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
          <div className="profile-avatar-lg" style={{ background: color }} aria-hidden="true">
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
                >
                  {bioExpanded ? t('profile.readLess') : t('profile.readMore')}
                </button>
              )}
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/comparison')}
              aria-label={`Comparer ${profile.full_name}`}
            >
              {t('profile.compare')}
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (!profile.map_x || !profile.map_y) {
                  alert(t('profile.noMapPosition'))
                  return
                }
                navigate('/map', { state: { researcherId: id } })
              }}
              aria-label={`Voir ${profile.full_name} sur la carte`}
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
              <button
                className="btn btn-outline btn-sm"
                disabled
                aria-label={t('profile.editLocked')}
                title={t('profile.editLocked')}
              >
                🔒 {t('profile.edit')}
              </button>
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
              <p style={{ color: 'var(--pm-text-muted)', fontSize: 14 }}>Aucun mot-cle.</p>
            )}
          </div>

          {/* Publications */}
          <div className="card">
            <h2 className="card-title">{t('profile.publications')}</h2>
            {profile.publications && profile.publications.length > 0 ? (
              <ul style={{ listStyle: 'none' }}>
                {profile.publications.map((pub: { id: string; title: string; coauthors: string; venue: string; year: number }) => (
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
