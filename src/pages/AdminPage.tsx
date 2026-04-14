import { useState, useCallback, useEffect, useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { UsersTab } from '../components/admin/UsersTab'
import { PendingTab } from '../components/admin/PendingTab'
import { ImportTab } from '../components/admin/ImportTab'
import { SettingsTab } from '../components/admin/SettingsTab'
import { LogsTab } from '../components/admin/LogsTab'

type TabId = 'users' | 'pending' | 'import' | 'settings' | 'logs'

interface ToastMsg { type: 'success' | 'error'; message: string }

export function AdminPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabId>('users')
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [unsavedSettings, setUnsavedSettings] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingTab, setPendingTab] = useState<TabId | null>(null)
  const toastTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const dialogRef = useFocusTrap(showUnsavedDialog)

  useEffect(() => {
    return () => { toastTimersRef.current.forEach(clearTimeout) }
  }, [])

  const addToast = useCallback((msg: ToastMsg) => {
    setToasts(prev => [...prev, { ...msg }])
    const id = setTimeout(() => setToasts(prev => prev.slice(1)), 4000)
    toastTimersRef.current.push(id)
  }, [])

  const cancelTabSwitchWithEscape = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setPendingTab(null)
      setShowUnsavedDialog(false)
    }
  }, [])

  if (!isAdmin) {
    return (
      <div>
        <p style={{ color: 'var(--pm-danger)' }}>Acces refuse. Vous devez \u00eatre administrateur.</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          {t('common.back')}
        </button>
      </div>
    )
  }

  const handleTabClick = (tab: TabId) => {
    if (unsavedSettings && activeTab === 'settings' && tab !== 'settings') {
      setPendingTab(tab)
      setShowUnsavedDialog(true)
      return
    }
    setActiveTab(tab)
  }

  const confirmTabSwitch = () => {
    if (pendingTab) {
      setUnsavedSettings(false)
      setActiveTab(pendingTab)
      setPendingTab(null)
    }
    setShowUnsavedDialog(false)
  }

  const cancelTabSwitch = () => {
    setPendingTab(null)
    setShowUnsavedDialog(false)
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'users', label: t('admin.tabs.users') },
    { id: 'pending', label: t('admin.tabs.pending') },
    { id: 'import', label: t('admin.tabs.import') },
    { id: 'settings', label: t('admin.tabs.settings') },
    { id: 'logs', label: t('admin.tabs.logs') },
  ]

  return (
    <div>
      <h1 className="page-title">{t('admin.title')}</h1>

      {/* Tab bar */}
      <div className="admin-tabs" role="tablist" aria-label="Sections d'administration">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`admin-panel-${tab.id}`}
            id={`admin-tab-${tab.id}`}
            className={`admin-tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
            {tab.id === 'settings' && unsavedSettings && (
              <span style={{ marginLeft: 4, color: 'var(--pm-warning, #d97706)' }}>•</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        id={`admin-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`admin-tab-${activeTab}`}
        style={{ marginTop: 20 }}
      >
        {activeTab === 'users' && <UsersTab onToast={addToast} />}
        {activeTab === 'pending' && <PendingTab onToast={addToast} />}
        {activeTab === 'import' && (
          <ImportTab
            onToast={addToast}
            onNavigateToLogs={() => setActiveTab('logs')}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            onToast={addToast}
            onUnsavedChange={setUnsavedSettings}
          />
        )}
        {activeTab === 'logs' && <LogsTab />}
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="toast-container" aria-live="polite" aria-atomic="true">
          {toasts.map((toast, i) => (
            <div key={i} className={`toast toast-${toast.type}`} role="alert">
              {toast.message}
            </div>
          ))}
        </div>
      )}

      {/* Unsaved changes confirmation dialog */}
      {showUnsavedDialog && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Modifications non sauvegardées"
          onKeyDown={cancelTabSwitchWithEscape}
        >
          <div className="modal-card" ref={dialogRef}>
            <h3 style={{ marginTop: 0 }}>Modifications non sauvegardées</h3>
            <p style={{ color: 'var(--pm-text-muted)' }}>
              {t('admin.settings.unsavedChanges')}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={cancelTabSwitch}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-danger btn-sm" onClick={confirmTabSwitch}>
                Quitter quand même
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
