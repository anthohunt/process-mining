import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'
import { getInitials, stringToColor } from '../../lib/formatting'
import { supabase } from '../../lib/supabase'

function useOwnResearcherId(userId: string | undefined) {
  return useQuery({
    queryKey: ['own-researcher-id', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('researchers')
        .select('id')
        .eq('user_id', userId!)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data?.id ?? null
    },
    enabled: !!userId,
    staleTime: 60000,
  })
}

export function UserDropdown() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAdmin, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: ownResearcherId } = useOwnResearcherId(user?.id)

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

  // Focus first menu item on open
  useEffect(() => {
    if (open && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]')
      first?.focus()
    }
  }, [open])

  // Close on Escape; trap Tab within menu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      } else if (e.key === 'Tab' && menuRef.current) {
        const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'))
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
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
        <div className="dropdown-menu" role="menu" aria-label="Menu utilisateur" ref={menuRef}>
          <button
            className="dropdown-item"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              if (ownResearcherId) {
                navigate(`/researchers/${ownResearcherId}`)
              } else {
                navigate('/researchers')
              }
            }}
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
