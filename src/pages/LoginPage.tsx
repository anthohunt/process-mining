import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
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
    setIsLoading(true)
    const result = await signIn(email, password)
    setIsLoading(false)
    if (result.error) {
      if (
        result.error.includes('Invalid') ||
        result.error.includes('credentials') ||
        result.error.includes('invalid_credentials') ||
        result.error.includes('Email not confirmed') === false && result.error.toLowerCase().includes('email')
      ) {
        setError(t('login.invalidCredentials'))
      } else if (
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

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>{t('login.title')}</h1>

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
              autoComplete="current-password"
              aria-required="true"
            />
          </div>

          {error && (
            <div className="form-error" role="alert" aria-live="assertive" style={{ marginBottom: 12, fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? t('common.loading') : t('login.submit')}
          </button>
        </form>

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
      </div>
    </div>
  )
}
