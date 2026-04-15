import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminSettings, useSaveSettings } from '../../hooks/useAdminSettings'
import type { AppSettings } from '../../hooks/useAdminSettings'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'

interface ToastMsg { type: 'success' | 'error'; message: string }

interface Props {
  onToast: (msg: ToastMsg) => void
  onUnsavedChange: (dirty: boolean) => void
}

export function SettingsTab({ onToast, onUnsavedChange }: Props) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useAdminSettings()
  const saveSettings = useSaveSettings()

  const [form, setForm] = useState<AppSettings>({
    language: 'fr',
    similarity_threshold: 0.6,
    nlp_algorithm: 'tfidf',
  })
  const [isDirty, setIsDirty] = useState(false)
  const [showZeroWarning, setShowZeroWarning] = useState(false)
  const [prevThreshold, setPrevThreshold] = useState<number>(0.6)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  useEffect(() => {
    onUnsavedChange(isDirty)
  }, [isDirty, onUnsavedChange])

  if (isLoading) return <LoadingSpinner />
  if (isError) return (
    <ErrorState
      message={t('common.error')}
      onRetry={() => void refetch()}
      retryLabel={t('common.retry')}
    />
  )

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (key === 'similarity_threshold') {
      setPrevThreshold(form.similarity_threshold)
    }
    setForm(f => ({ ...f, [key]: value }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (form.similarity_threshold === 0) {
      setShowZeroWarning(true)
      return
    }
    await doSave()
  }

  const doSave = async () => {
    try {
      await saveSettings.mutateAsync(form)
      setIsDirty(false)
      setShowZeroWarning(false)
      onToast({ type: 'success', message: t('admin.settings.saveSuccess') })
    } catch {
      onToast({ type: 'error', message: t('admin.settings.saveError') })
    }
  }

  const handleConfirmZero = () => void doSave()

  const handleCancelZero = () => {
    setShowZeroWarning(false)
    setForm(f => ({ ...f, similarity_threshold: prevThreshold }))
  }

  return (
    <div id="admin-tab-admin-settings">
      <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 18 }}>{t('admin.tabs.settings')}</h2>

      {/* Language section */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>{t('admin.settings.language')}</h3>
        <div style={{ display: 'flex', gap: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="radio"
              name="language"
              value="fr"
              checked={form.language === 'fr'}
              onChange={() => update('language', 'fr')}
              aria-label="Français"
            />
            <span>Français</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="radio"
              name="language"
              value="en"
              checked={form.language === 'en'}
              onChange={() => update('language', 'en')}
              aria-label="English"
            />
            <span>English</span>
          </label>
        </div>
      </section>

      {/* Similarity threshold section */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>{t('admin.settings.threshold')}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={form.similarity_threshold}
            onChange={e => update('similarity_threshold', parseFloat(e.target.value))}
            style={{ flex: 1 }}
            aria-label={t('admin.settings.threshold')}
            aria-valuenow={form.similarity_threshold}
            aria-valuemin={0}
            aria-valuemax={1}
          />
          <span
            style={{ minWidth: 40, fontWeight: 700, fontSize: 16, color: 'var(--pm-primary)' }}
            aria-live="polite"
            aria-atomic="true"
          >
            {form.similarity_threshold.toFixed(2)}
          </span>
        </div>
        {form.similarity_threshold === 0 && (
          <p style={{ color: 'var(--pm-warning, #d97706)', fontSize: 13, margin: '8px 0 0 0' }}>
            {t('admin.settings.thresholdWarning')}
          </p>
        )}
      </section>

      {/* NLP algorithm section */}
      <section className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, fontSize: 15 }}>{t('admin.settings.algorithm')}</h3>
        <select
          className="form-control"
          style={{ maxWidth: 340 }}
          value={form.nlp_algorithm}
          onChange={e => update('nlp_algorithm', e.target.value as AppSettings['nlp_algorithm'])}
          aria-label={t('admin.settings.algorithm')}
        >
          <option value="tfidf">TF-IDF (Rapide, recommandé)</option>
          <option value="bert">BERT (Contextuel, lent)</option>
          <option value="word2vec">Word2Vec (Vectoriel)</option>
        </select>
      </section>

      {showZeroWarning && (
        <div
          role="alertdialog"
          aria-label="Confirmation seuil zéro"
          style={{
            marginBottom: 12,
            padding: '12px 16px',
            border: '1px solid var(--pm-warning, #d97706)',
            borderRadius: 8,
            background: 'var(--pm-warning-bg, #fffbeb)',
            color: 'var(--pm-warning, #d97706)',
          }}
        >
          <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>{t('admin.settings.thresholdWarning')}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleConfirmZero}
              disabled={saveSettings.isPending}
              aria-label="Confirmer la sauvegarde avec seuil zéro"
            >
              {saveSettings.isPending ? t('common.loading') : 'Confirmer'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleCancelZero}
              disabled={saveSettings.isPending}
              aria-label="Annuler et restaurer le seuil précédent"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {!showZeroWarning && (
        <button
          className="btn btn-primary"
          onClick={() => void handleSave()}
          disabled={saveSettings.isPending}
          aria-label={t('admin.settings.save')}
        >
          {saveSettings.isPending ? t('common.loading') : t('admin.settings.save')}
        </button>
      )}

      {isDirty && (
        <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--pm-text-muted)' }}>
          {t('admin.settings.unsavedLabel')}
        </span>
      )}
    </div>
  )
}
