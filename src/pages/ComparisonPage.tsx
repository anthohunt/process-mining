import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResearcherList, useResearcherProfile } from '../hooks/useResearchers'
import { useSimilarity } from '../hooks/useSimilarity'
import { getInitials, stringToColor } from '../lib/formatting'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ToastContainer, type ToastMessage } from '../components/common/Toast'

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

interface ProfileMiniCardProps {
  researcherId: string
  commonThemes: string[]
}

function ProfileMiniCard({ researcherId, commonThemes }: ProfileMiniCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: profile, isLoading } = useResearcherProfile(researcherId)

  if (isLoading) return <div className="card"><LoadingSpinner /></div>
  if (!profile) return null

  const initials = getInitials(profile.full_name)
  const color = stringToColor(profile.full_name)

  return (
    <div className="card">
      {/* Avatar + Name */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div
          className="profile-avatar-lg"
          style={{ background: color, width: 64, height: 64, fontSize: 22, margin: '0 auto 8px' }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{profile.full_name}</div>
        <div style={{ fontSize: 13, color: 'var(--pm-text-muted)' }}>{profile.lab}</div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/researchers/${researcherId}`)}
          style={{ marginTop: 4, fontSize: 12 }}
        >
          Voir le profil →
        </button>
      </div>

      {/* Keywords */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pm-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('profile.keywords')}
        </div>
        <div>
          {profile.keywords?.map((k: string) => {
            const isCommon = commonThemes.some(c => c.toLowerCase() === k.toLowerCase())
            return (
              <span
                key={k}
                className={`tag ${isCommon ? 'tag-blue' : 'tag-gray'}`}
                style={isCommon ? { outline: '2px solid var(--pm-primary)', outlineOffset: 1 } : {}}
              >
                {k}
              </span>
            )
          })}
          {(!profile.keywords || profile.keywords.length === 0) && (
            <span style={{ fontSize: 13, color: 'var(--pm-text-muted)' }}>Aucun mot-cle.</span>
          )}
        </div>
      </div>

      {/* Publications */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pm-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('profile.publications')} ({profile.publications?.length ?? 0})
        </div>
        {profile.publications && profile.publications.length > 0 ? (
          <ul style={{ listStyle: 'none' }}>
            {profile.publications.slice(0, 3).map(pub => (
              <li key={pub.id} style={{ fontSize: 13, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--pm-border)' }}>
                <div style={{ fontWeight: 500 }}>{pub.title}</div>
                <div style={{ fontSize: 12, color: 'var(--pm-text-muted)' }}>
                  {[pub.venue, pub.year].filter(Boolean).join(' — ')}
                </div>
              </li>
            ))}
            {profile.publications.length > 3 && (
              <li style={{ fontSize: 12, color: 'var(--pm-text-muted)' }}>
                +{profile.publications.length - 3} autres publications
              </li>
            )}
          </ul>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--pm-text-muted)' }}>{t('profile.noPublications')}</p>
        )}
      </div>
    </div>
  )
}

function SimilarityGauge({ score, isError, isLoading }: { score: number; isError: boolean; isLoading: boolean }) {
  const pct = Math.round(score * 100)
  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference - (pct / 100) * circumference

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <LoadingSpinner />
    </div>
  )

  if (isError) return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ fontSize: 12, color: 'var(--pm-text-muted)' }}>Score de similarite indisponible</div>
    </div>
  )

  return (
    <div
      className="similarity-gauge"
      aria-label={`Score de similarite: ${pct}%`}
      role="img"
    >
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ display: 'block', margin: '0 auto 8px' }}>
        <circle cx="40" cy="40" r="36" fill="none" stroke="var(--pm-border)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke="var(--pm-primary)"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="40" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" fill="var(--pm-primary)" fontFamily="Poppins, sans-serif">
          {pct}%
        </text>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--pm-text-muted)', textAlign: 'center' }}>Similarite</div>
    </div>
  )
}

export function ComparisonPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { researcherId?: string; researcherName?: string } | null
  const { toasts, removeToast } = useToast()

  const [idA, setIdA] = useState<string>(locationState?.researcherId ?? '')
  const [idB, setIdB] = useState<string>('')

  const { data: researchers, isLoading: listLoading } = useResearcherList('', '', '')
  const {
    data: similarity,
    isLoading: simLoading,
    isError: simError,
  } = useSimilarity(idA || undefined, idB || undefined)

  const sameResearcher = !!idA && !!idB && idA === idB

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="breadcrumb">
        <a href="/researchers" onClick={e => { e.preventDefault(); navigate('/researchers') }}>
          {t('researchers.title')}
        </a>
        <span className="breadcrumb-sep">›</span>
        <span>Comparaison</span>
      </div>

      <h1 className="page-title" style={{ marginBottom: 20 }}>Comparer deux chercheurs</h1>

      {/* Researcher selectors */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chercheur A</label>
            <select
              className="form-control"
              value={idA}
              onChange={e => setIdA(e.target.value)}
              aria-label="Sélectionner le chercheur A"
            >
              <option value="">Sélectionner un chercheur...</option>
              {(researchers ?? []).map(r => (
                <option key={r.id} value={r.id}>{r.full_name} — {r.lab}</option>
              ))}
            </select>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--pm-text-muted)', paddingBottom: 8, fontWeight: 600 }}>vs</div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chercheur B</label>
            <select
              className="form-control"
              value={idB}
              onChange={e => setIdB(e.target.value)}
              aria-label="Sélectionner le chercheur B"
            >
              <option value="">Sélectionner un chercheur...</option>
              {(researchers ?? []).map(r => (
                <option key={r.id} value={r.id}>{r.full_name} — {r.lab}</option>
              ))}
            </select>
          </div>
        </div>
        {listLoading && <div style={{ marginTop: 8 }}><LoadingSpinner /></div>}
      </div>

      {/* Same researcher warning */}
      {sameResearcher && (
        <div className="banner-warning" role="alert">
          Veuillez selectionner deux chercheurs differents.
        </div>
      )}

      {/* Comparison layout */}
      {idA && idB && !sameResearcher && (
        <>
          <div className="comparison-layout">
            <ProfileMiniCard
              researcherId={idA}
              commonThemes={similarity?.common_themes ?? []}
            />

            <SimilarityGauge
              score={similarity?.score ?? 0}
              isLoading={simLoading}
              isError={simError}
            />

            <ProfileMiniCard
              researcherId={idB}
              commonThemes={similarity?.common_themes ?? []}
            />
          </div>

          {/* Common themes summary */}
          {!simLoading && !simError && similarity && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="card-title">Themes communs</h2>
              {similarity.common_themes.length > 0 ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    {similarity.common_themes.map(theme => (
                      <span key={theme} className="tag tag-blue" style={{ outline: '2px solid var(--pm-primary)', outlineOffset: 1 }}>
                        {theme}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--pm-text-muted)' }}>
                    Ces deux chercheurs partagent {similarity.common_themes.length} theme{similarity.common_themes.length > 1 ? 's' : ''} commun{similarity.common_themes.length > 1 ? 's' : ''} avec un score de similarite de {Math.round(similarity.score * 100)}%.
                    {similarity.algorithm && <span> (Algorithme: {similarity.algorithm})</span>}
                  </p>
                </>
              ) : (
                <p style={{ color: 'var(--pm-text-muted)', fontSize: 14 }}>Aucun theme commun.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Prompt if nothing selected */}
      {(!idA || !idB) && !sameResearcher && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
          <p style={{ color: 'var(--pm-text-muted)', fontSize: 14 }}>
            Selectionnez deux chercheurs ci-dessus pour voir leur comparaison et leur score de similarite.
          </p>
        </div>
      )}
    </div>
  )
}
