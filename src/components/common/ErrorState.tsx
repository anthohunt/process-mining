interface Props {
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  message = 'Une erreur est survenue.',
  onRetry,
  retryLabel = 'Reessayer',
}: Props) {
  return (
    <div className="error-state" role="alert" aria-live="assertive">
      <span>⚠ {message}</span>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  )
}
