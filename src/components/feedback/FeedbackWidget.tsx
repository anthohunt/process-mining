import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'

export function FeedbackWidget() {
  const { t } = useTranslation()
  const location = useLocation()
  const { user } = useAuthStore()

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'bug' | 'suggestion'>('bug')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setType('bug'); setMessage(''); setSending(false); setDone(false); setError(null)
  }

  const close = () => { setOpen(false); reset() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          page: location.pathname,
          message,
          name: (user?.user_metadata?.full_name as string) ?? '',
          email: user?.email ?? '',
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'error')
      }
      setDone(true)
    } catch (err) {
      setError(t('feedback.error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
        aria-label={t('feedback.open')}
        style={{
          position: 'fixed', right: 20, bottom: 20, zIndex: 900,
          borderRadius: 24, padding: '10px 18px', boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        }}
      >
        {t('feedback.open')}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('feedback.title')}
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            className="card"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 460 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{t('feedback.title')}</h2>
              <button type="button" className="btn-ghost" onClick={close} aria-label={t('common.close')} style={{ fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {done ? (
              <div>
                <div className="banner-warning" role="status" style={{ marginBottom: 16 }}>
                  {t('feedback.thanks')}
                </div>
                <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={close}>
                  {t('common.close')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="fb-type">{t('feedback.type')}</label>
                  <select id="fb-type" className="form-control" value={type} onChange={e => setType(e.target.value as 'bug' | 'suggestion')}>
                    <option value="bug">{t('feedback.bug')}</option>
                    <option value="suggestion">{t('feedback.suggestion')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fb-message">{t('feedback.message')}</label>
                  <textarea
                    id="fb-message"
                    className="form-control"
                    rows={5}
                    placeholder={t('feedback.placeholder')}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: 12, color: 'var(--pm-text-muted, #777)', margin: '4px 0 0' }}>
                    {t('feedback.pageHint')}: <code>{location.pathname}</code>
                  </p>
                </div>

                {error && <div className="form-error" role="alert" style={{ marginBottom: 12 }}>{error}</div>}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={sending || !message.trim()}
                  aria-busy={sending}
                >
                  {sending ? t('common.loading') : t('feedback.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
