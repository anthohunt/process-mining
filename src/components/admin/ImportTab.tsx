import { useState, useRef, DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { parseCsvFile, useCheckDuplicates, useImportRows, useImportScholar } from '../../hooks/useAdminImport'
import type { ParsedImportRow } from '../../hooks/useAdminImport'
import { EmptyState } from '../common/EmptyState'

interface ToastMsg { type: 'success' | 'error'; message: string }

interface Props {
  onToast: (msg: ToastMsg) => void
  onNavigateToLogs: () => void
}

export function ImportTab({ onToast, onNavigateToLogs }: Props) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [scholarUrl, setScholarUrl] = useState('')
  const [scholarError, setScholarError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ParsedImportRow[] | null>(null)
  const [importSuccess, setImportSuccess] = useState<number | null>(null)

  const checkDuplicates = useCheckDuplicates()
  const importRows = useImportRows()
  const importScholar = useImportScholar()

  const handleFile = async (file: File) => {
    setParseError(null)
    setPreview(null)
    setImportSuccess(null)
    try {
      const rows = await parseCsvFile(file)
      const withDups = await checkDuplicates.mutateAsync(rows)
      setPreview(withDups)
    } catch (err) {
      const msg = (err as Error).message
      if (msg === 'invalid_format') {
        setParseError(t('admin.import.invalidFormat'))
      } else {
        setParseError(t('common.error'))
      }
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  const handleScholarImport = async () => {
    setScholarError(null)
    setPreview(null)
    setImportSuccess(null)
    if (!scholarUrl.trim()) return
    try {
      const rows = await importScholar.mutateAsync(scholarUrl.trim())
      setPreview(rows)
    } catch (err) {
      const msg = (err as Error).message
      if (msg === 'scholar_not_configured') {
        setScholarError("L'import Google Scholar n'est pas encore configuré. Utilisez l'import CSV.")
      } else {
        setScholarError(t('admin.import.invalidUrl'))
      }
    }
  }

  const handleConfirmImport = async () => {
    if (!preview) return
    try {
      const result = await importRows.mutateAsync(preview)
      setImportSuccess(result.count)
      setPreview(null)
      onToast({ type: 'success', message: `${result.count} chercheur(s) import\u00e9(s).` })
    } catch {
      onToast({ type: 'error', message: t('common.error') })
    }
  }

  const handleClear = () => {
    setPreview(null)
    setParseError(null)
    setScholarError(null)
    setScholarUrl('')
    setImportSuccess(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const nonDupCount = preview ? preview.filter(r => !r.isDuplicate).length : 0

  return (
    <div id="admin-tab-admin-import">
      <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>{t('admin.tabs.import')}</h2>

      {/* CSV Drop Zone */}
      <div
        className={`upload-zone${isDragging ? ' upload-zone--active' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={t('admin.import.dropzone')}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
      >
        <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📁</span>
        <span>{t('admin.import.dropzone')}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileInput}
          aria-hidden="true"
        />
      </div>

      {parseError && (
        <div className="error-state" role="alert" style={{ marginTop: 12 }}>
          {parseError}
        </div>
      )}

      {/* Google Scholar URL */}
      <div style={{ marginTop: 20 }}>
        <label className="form-label" htmlFor="scholar-url">
          {t('admin.import.scholarUrl')}
          <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--pm-text-muted)', fontWeight: 400 }}>
            — Import via Google Scholar — nécessite une configuration serveur supplémentaire
          </span>
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input
            id="scholar-url"
            type="url"
            className="form-control"
            value={scholarUrl}
            onChange={e => setScholarUrl(e.target.value)}
            placeholder="https://scholar.google.com/citations?user=..."
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-outline btn-sm"
            onClick={() => void handleScholarImport()}
            disabled={importScholar.isPending || !scholarUrl.trim()}
            aria-label={t('admin.import.importBtn')}
          >
            {importScholar.isPending ? t('common.loading') : t('admin.import.importBtn')}
          </button>
        </div>
      </div>

      {scholarError && (
        <div className="error-state" role="alert" style={{ marginTop: 8 }}>
          {scholarError}
        </div>
      )}

      {/* Preview Table */}
      {preview && preview.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>
              {`Aperçu — ${preview.length} entrée(s)`}
              {preview.some(r => r.isDuplicate) && (
                <span className="tag tag-orange" style={{ marginLeft: 8 }}>
                  {preview.filter(r => r.isDuplicate).length} doublon(s)
                </span>
              )}
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={handleClear}>
              {t('admin.import.clear')}
            </button>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <table className="app-table" aria-label="Aper\u00e7u de l'import">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Labo</th>
                  <th>Themes</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ opacity: row.isDuplicate ? 0.6 : 1 }}>
                    <td>{row.nom}</td>
                    <td>{row.labo}</td>
                    <td>{row.themes}</td>
                    <td>
                      {row.isDuplicate ? (
                        <span className="tag tag-orange">{t('admin.import.duplicateWarning')}</span>
                      ) : (
                        <span className="tag tag-green">Nouveau</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={() => void handleConfirmImport()}
              disabled={importRows.isPending || nonDupCount === 0}
              aria-label={`Importer ${nonDupCount} chercheurs`}
            >
              {importRows.isPending
                ? t('common.loading')
                : t('admin.import.confirmBtn', { count: nonDupCount })}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleClear}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {preview && preview.length === 0 && (
        <EmptyState message="Aucune donn\u00e9e \u00e0 pr\u00e9visualiser." />
      )}

      {importSuccess !== null && (
        <div style={{ marginTop: 20 }}>
          <div className="empty-state" role="status" style={{ background: 'var(--pm-success-bg, #f0fdf4)', border: '1px solid var(--pm-success, #16a34a)', color: 'var(--pm-success, #16a34a)' }}>
            {importSuccess} chercheur(s) importé(s) avec succès.
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={onNavigateToLogs}
            style={{ marginTop: 8 }}
          >
            {t('admin.import.viewLogs')}
          </button>
        </div>
      )}
    </div>
  )
}
