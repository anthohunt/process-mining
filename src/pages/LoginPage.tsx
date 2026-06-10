import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuthStore()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Show session expired message from URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('expired') === '1') {
      setError(t('login.sessionExpired'))
    }
  }, [location.search, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setIsLoading(true)

    if (mode === 'signup') {
      const result = await signUp(email, password)
      setIsLoading(false)
      if (result.error) {
        setError(result.error)
      } else if (result.needsConfirmation) {
        setInfo(t('login.confirmEmailSent'))
        setMode('login')
      } else {
        // signed in immediately → go fill in the profile
        navigate('/profile/new')
      }
      return
    }

    const result = await signIn(email, password)
    setIsLoading(false)
    if (result.error) {
      if (
        result.error.includes('network') ||
        result.error.includes('fetch') ||
        result.error.includes('Failed to fetch') ||
        result.error.includes('NetworkError') ||
        result.error.includes('aborted') ||
        result.error.includes('ERR_')
      ) {
        setError(t('login.serviceUnavailable'))
      } else {
        setError(t('login.invalidCredentials'))
      }
    } else {
      navigate('/')
    }
  }

  const handleDemo = async (role: 'researcher' | 'admin') => {
    setError(null)
    setInfo(null)
    setIsLoading(true)
    const demoEmail = role === 'admin' ? 'admin@cartoPM.fr' : 'researcher@cartoPM.fr'
    const demoPassword = 'demo123456'
    const result = await signIn(demoEmail, demoPassword)
    setIsLoading(false)
    if (result.error) {
      setError(`Demo non disponible: ${result.error}`)
    } else {
      navigate('/')
    }
  }

  const isSignup = mode === 'signup'

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>{isSignup ? t('login.signupTitle') : t('login.title')}</h1>
        {isSignup && (
          <p style={{ marginTop: 0, marginBottom: 16, fontSize: 14, color: 'var(--pm-text-muted, #666)' }}>
            {t('login.signupSubtitle')}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t('login.email')}</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">{t('login.password')}</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 6 : undefined}
              aria-required="true"
            />
          </div>

          {error && (
            <div className="form-error" role="alert" aria-live="assertive" style={{ marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}
          {info && (
            <div className="banner-warning" role="status" aria-live="polite" style={{ marginBottom: 12, fontSize: 14 }}>
              {info}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? t('common.loading') : isSignup ? t('login.signupSubmit') : t('login.submit')}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 14 }}>
          {isSignup ? (
            <span>
              {t('login.haveAccount')}{' '}
              <button type="button" className="link-button" style={{ background: 'none', border: 'none', color: 'var(--pm-primary, #0d6efd)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('login'); setError(null); setInfo(null) }}>
                {t('login.submit')}
              </button>
            </span>
          ) : (
            <span>
              {t('login.noAccount')}{' '}
              <button type="button" className="link-button" style={{ background: 'none', border: 'none', color: 'var(--pm-primary, #0d6efd)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }} onClick={() => { setMode('signup'); setError(null); setInfo(null) }}>
                {t('login.signupSubmit')}
              </button>
            </span>
          )}
        </div>

        {!isSignup && (
          <div className="login-demo-section">
            <p className="login-demo-label">Connexion demo</p>
            <div className="login-demo-btns">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => void handleDemo('researcher')}
                disabled={isLoading}
              >
                {t('login.demoResearcher')}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => void handleDemo('admin')}
                disabled={isLoading}
              >
                {t('login.demoAdmin')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
