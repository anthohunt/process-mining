import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import { useLangStore } from '../../stores/langStore'
import { UserDropdown } from '../auth/UserDropdown'

export function AppNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { user, isAdmin } = useAuthStore()
  const { lang, toggle } = useLangStore()

  const navItems = [
    { label: t('nav.dashboard'), path: '/' },
    { label: t('nav.researchers'), path: '/researchers' },
    { label: t('nav.map'), path: '/map' },
    { label: t('nav.stats'), path: '/stats' },
    { label: t('nav.themes'), path: '/themes' },
    ...(isAdmin ? [{ label: t('nav.admin'), path: '/admin' }] : []),
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="app-navbar">
      <a
        href="/"
        className="brand"
        onClick={e => { e.preventDefault(); navigate('/') }}
        aria-label="CartoPM — Retour au tableau de bord"
      >
        Carto<span>PM</span>
      </a>

      <nav aria-label="Navigation principale">
        {navItems.map(item => (
          <button
            key={item.path}
            className={isActive(item.path) ? 'active' : ''}
            onClick={() => navigate(item.path)}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="navbar-right">
        <button
          className="lang-toggle"
          onClick={toggle}
          aria-label={`Changer la langue — actuellement ${lang.toUpperCase()}`}
        >
          {lang.toUpperCase()}
        </button>

        {user ? (
          <UserDropdown />
        ) : (
          <button
            className="btn btn-sm btn-outline"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => navigate('/login')}
            aria-label={t('nav.login')}
          >
            {t('nav.login')}
          </button>
        )}
      </div>
    </header>
  )
}
