interface Props {
  message?: string
  size?: 'sm' | 'md'
}

export function LoadingSpinner({ message = 'Chargement...', size = 'md' }: Props) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
