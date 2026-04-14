import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuditLogs } from '../../hooks/useAuditLogs'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ErrorState } from '../common/ErrorState'
import { EmptyState } from '../common/EmptyState'

const ACTION_COLORS: Record<string, string> = {
  Ajout: 'tag-green',
  Modification: 'tag-blue',
  Suppression: 'tag-red',
  Import: 'tag-orange',
  Configuration: 'tag-blue',
  Inscription: 'tag-green',
}

function getActionColor(action: string): string {
  return ACTION_COLORS[action] ?? 'tag-gray'
}

const PAGE_SIZE = 50

export function LogsTab() {
  const { t } = useTranslation()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [activeFrom, setActiveFrom] = useState<string | null>(null)
  const [activeTo, setActiveTo] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useAuditLogs(activeFrom, activeTo, page, PAGE_SIZE)

  const logs = data?.logs ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleFilter = () => {
    setActiveFrom(fromDate || null)
    setActiveTo(toDate || null)
    setPage(1)
  }

  const handleClearFilter = () => {
    setFromDate('')
    setToDate('')
    setActiveFrom(null)
    setActiveTo(null)
    setPage(1)
  }

  return (
    <div id="admin-tab-admin-logs">
      <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>{t('admin.tabs.logs')}</h2>

      {/* Date filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <label className="form-label" htmlFor="log-from">{t('admin.logs.from')}</label>
          <input
            id="log-from"
            type="date"
            className="form-control"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ width: 160 }}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="log-to">{t('admin.logs.to')}</label>
          <input
            id="log-to"
            type="date"
            className="form-control"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{ width: 160 }}
          />
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleFilter}
          aria-label={t('admin.logs.filter')}
        >
          {t('admin.logs.filter')}
        </button>
        {(activeFrom || activeTo) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleClearFilter}
            aria-label={t('admin.logs.clearFilter')}
          >
            {t('admin.logs.clearFilter')}
          </button>
        )}
      </div>

      {isLoading && <LoadingSpinner />}

      {isError && (
        <ErrorState
          message={t('admin.logs.error')}
          onRetry={() => void refetch()}
          retryLabel={t('admin.logs.retry')}
        />
      )}

      {!isLoading && !isError && logs.length === 0 && (
        <EmptyState message={t('admin.logs.noLogs')} />
      )}

      {!isLoading && !isError && logs.length > 0 && (
        <>
          <div className="card" style={{ padding: 0 }}>
            <table className="app-table" aria-label={t('admin.tabs.logs')}>
              <thead>
                <tr>
                  <th>{t('admin.logs.date')}</th>
                  <th>{t('admin.logs.user')}</th>
                  <th>{t('admin.logs.action')}</th>
                  <th>{t('admin.logs.detail')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13, color: 'var(--pm-text-muted)' }}>
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td style={{ fontSize: 13 }}>{log.user_name ?? '—'}</td>
                    <td>
                      <span className={`tag ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--pm-text-muted)' }}>
                      {log.detail ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}
              role="navigation"
              aria-label="Pagination des logs"
            >
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Page précédente"
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Page suivante"
              >
                &raquo;
              </button>
              <span style={{ fontSize: 13, color: 'var(--pm-text-muted)', marginLeft: 8 }}>
                {`Page ${page} / ${totalPages} (${total} entrées)`}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
