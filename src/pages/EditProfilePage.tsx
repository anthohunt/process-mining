import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { useResearcherProfile } from '../hooks/useResearchers'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ToastContainer, type ToastMessage } from '../components/common/Toast'

interface PubDraft {
  id?: string
  title: string
  coauthors: string
  venue: string
  year: string
}

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

function useLabs() {
  return useQuery({
    queryKey: ['labs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('researchers').select('lab')
      if (error) throw new Error(error.message)
      return [...new Set((data ?? []).map(r => r.lab))].sort()
    },
    staleTime: 60000,
  })
}

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { toasts, addToast, removeToast } = useToast()

  const { data: profile, isLoading } = useResearcherProfile(id)
  const { data: labs = [] } = useLabs()

  // Form state
  const [name, setName] = useState('')
  const [lab, setLab] = useState('')
  const [bio, setBio] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [kwInput, setKwInput] = useState('')
  const [kwDuplicate, setKwDuplicate] = useState(false)
  const [publications, setPublications] = useState<PubDraft[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [pendingWarning, setPendingWarning] = useState(false)

  // Pre-populate when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? '')
      setLab(profile.lab ?? '')
      setBio(profile.bio ?? '')
      setKeywords(profile.keywords ?? [])
      setPublications(
        (profile.publications ?? []).map(p => ({
          id: p.id,
          title: p.title ?? '',
          coauthors: p.coauthors ?? '',
          venue: p.venue ?? '',
          year: p.year != null ? String(p.year) : '',
        }))
      )
    }
  }, [profile])

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

  if (isLoading) return <LoadingSpinner />

  // Keyword handlers
  const handleKwKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = kwInput.trim()
      if (!val) return
      if (keywords.map(k => k.toLowerCase()).includes(val.toLowerCase())) {
        setKwDuplicate(true)
        setTimeout(() => setKwDuplicate(false), 2000)
        return
      }
      setKeywords(prev => [...prev, val])
      setKwInput('')
    }
  }

  const removeKeyword = (kw: string) => {
    setKeywords(prev => prev.filter(k => k !== kw))
  }

  // Publication handlers
  const addPublication = () => {
    setPublications(prev => [...prev, { title: '', coauthors: '', venue: '', year: '' }])
  }

  const removePublication = (idx: number) => {
    setPublications(prev => prev.filter((_, i) => i !== idx))
  }

  const updatePublication = (idx: number, field: keyof PubDraft, value: string) => {
    setPublications(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  // Save handler
  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setNameError(true)
      return
    }
    setNameError(false)
    setPendingWarning(false)
    setIsSaving(true)

    try {
      // Update researcher record
      const { error: updateError } = await supabase
        .from('researchers')
        .update({
          full_name: name.trim(),
          lab,
          bio,
          keywords,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id!)

      if (updateError) {
        throw updateError
      }

      // Upsert publications: update existing (have id) and insert new ones (no id)
      const existing = publications.filter(p => p.id && p.title.trim())
      const newPubs = publications.filter(p => !p.id && p.title.trim())

      // Delete publications that were removed (had id but are no longer in the list)
      const keptIds = new Set(existing.map(p => p.id))
      const originalIds = (profile?.publications ?? []).map(p => p.id)
      const idsToDelete = originalIds.filter(pid => !keptIds.has(pid))
      if (idsToDelete.length > 0) {
        await supabase.from('publications').delete().in('id', idsToDelete)
      }

      // Update existing publications
      for (const pub of existing) {
        await supabase.from('publications').update({
          title: pub.title.trim(),
          coauthors: pub.coauthors.trim(),
          venue: pub.venue.trim(),
          year: pub.year ? parseInt(pub.year, 10) : null,
        }).eq('id', pub.id!)
      }

      // Insert new publications
      if (newPubs.length > 0) {
        const { error: pubError } = await supabase.from('publications').insert(
          newPubs.map(p => ({
            researcher_id: id!,
            title: p.title.trim(),
            coauthors: p.coauthors.trim(),
            venue: p.venue.trim(),
            year: p.year ? parseInt(p.year, 10) : null,
          }))
        )
        if (pubError) throw pubError
      }

      addToast('success', t('editProfile.saveSuccess'))
      setTimeout(() => navigate(`/researchers/${id}`), 2500)
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : ''
      if (message.includes('already_pending')) {
        setPendingWarning(true)
      } else {
        addToast('error', t('editProfile.saveError'))
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

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

      {pendingWarning && (
        <div className="banner-error" role="alert" style={{ marginBottom: 16 }}>
          {t('editProfile.pendingWarning')}
        </div>
      )}

      <div className="card">
        {/* Nom complet */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-name">
            {t('editProfile.name')} <span aria-hidden="true" style={{ color: 'var(--pm-error)' }}>*</span>
          </label>
          <input
            id="edit-name"
            type="text"
            className={`form-control${nameError ? ' error' : ''}`}
            value={name}
            onChange={e => { setName(e.target.value); if (nameError) setNameError(false) }}
            required
            aria-required="true"
            aria-invalid={nameError}
            aria-describedby={nameError ? 'edit-name-error' : undefined}
          />
          {nameError && (
            <div id="edit-name-error" className="form-error" role="alert">
              {t('editProfile.validationRequired')}
            </div>
          )}
        </div>

        {/* Laboratoire */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-lab">
            {t('editProfile.lab')}
          </label>
          <select
            id="edit-lab"
            className="form-control"
            value={lab}
            onChange={e => setLab(e.target.value)}
          >
            <option value="">— Choisir un laboratoire —</option>
            {labs.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Mots-cles */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-keywords">
            {t('editProfile.keywords')}
          </label>
          <div className="tag-input-wrapper">
            {keywords.map(kw => (
              <span key={kw} className="tag tag-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 4, marginBottom: 4 }}>
                {kw}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={() => removeKeyword(kw)}
                  aria-label={`Supprimer le mot-cle ${kw}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: 12, color: 'inherit', lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="edit-keywords"
              type="text"
              className="form-control"
              style={{ display: 'inline-block', width: 'auto', minWidth: 200 }}
              placeholder={t('editProfile.keywordPlaceholder')}
              value={kwInput}
              onChange={e => { setKwInput(e.target.value); setKwDuplicate(false) }}
              onKeyDown={handleKwKeyDown}
            />
          </div>
          {kwDuplicate && (
            <div className="form-error" role="alert" style={{ marginTop: 4 }}>
              {t('editProfile.duplicateKeyword')}
            </div>
          )}
        </div>

        {/* Biographie */}
        <div className="form-group">
          <label className="form-label" htmlFor="edit-bio">
            {t('editProfile.bio')}
          </label>
          <textarea
            id="edit-bio"
            className="form-control"
            rows={4}
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </div>

        {/* Publications */}
        <div className="form-group">
          <label className="form-label">{t('editProfile.publications')}</label>
          {publications.map((pub, idx) => (
            <div key={idx} className="card" style={{ marginBottom: 12, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>Publication {idx + 1}</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--pm-error)', borderColor: 'var(--pm-error)' }}
                  onClick={() => removePublication(idx)}
                  aria-label={`Supprimer la publication ${idx + 1}`}
                >
                  Supprimer
                </button>
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label" htmlFor={`pub-title-${idx}`}>{t('editProfile.publicationTitle')}</label>
                <input
                  id={`pub-title-${idx}`}
                  type="text"
                  className="form-control"
                  value={pub.title}
                  onChange={e => updatePublication(idx, 'title', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label" htmlFor={`pub-coauthors-${idx}`}>{t('editProfile.publicationCoauthors')}</label>
                <input
                  id={`pub-coauthors-${idx}`}
                  type="text"
                  className="form-control"
                  value={pub.coauthors}
                  onChange={e => updatePublication(idx, 'coauthors', e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor={`pub-venue-${idx}`}>{t('editProfile.publicationVenue')}</label>
                  <input
                    id={`pub-venue-${idx}`}
                    type="text"
                    className="form-control"
                    value={pub.venue}
                    onChange={e => updatePublication(idx, 'venue', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor={`pub-year-${idx}`}>{t('editProfile.publicationYear')}</label>
                  <input
                    id={`pub-year-${idx}`}
                    type="number"
                    className="form-control"
                    style={{ width: 90 }}
                    value={pub.year}
                    onChange={e => updatePublication(idx, 'year', e.target.value)}
                    min={1900}
                    max={2099}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addPublication}
          >
            {t('editProfile.addPublication')}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? t('common.loading') : t('editProfile.save')}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(id ? `/researchers/${id}` : '/researchers')}
            disabled={isSaving}
          >
            {t('editProfile.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
