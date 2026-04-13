import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import { getInitials, stringToColor } from '../../lib/formatting'

export function UserDropdown() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAdmin, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const name = user?.user_metadata?.full_name ?? user?.email ?? 'User'
  const initials = getInitials(name)
  const color = stringToColor(name)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div className="user-dropdown-wrapper" ref={wrapperRef}>
      <button
        ref={btnRef}
        className="user-area-btn"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu utilisateur — ${name}${isAdmin ? ' (Admin)' : ''}`}
      >
        <div className="user-avatar-sm" style={{ background: color }} aria-hidden="true">
          {initials}
        </div>
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </span>
        {isAdmin && (
          <span className="badge badge-admin" style={{ fontSize: 10 }}>
            {t('common.adminBadge')}
          </span>
        )}
        <span aria-hidden="true" style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
      </button>

      {open && (
        <div className="dropdown-menu" role="menu" aria-label="Menu utilisateur">
          <button
            className="dropdown-item"
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/researchers') }}
          >
            {t('nav.myProfile')}
          </button>
          <div className="dropdown-divider" />
          <button
            className="dropdown-item"
            role="menuitem"
            onClick={handleLogout}
          >
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
