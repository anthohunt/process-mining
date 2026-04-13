interface Props {
  message: string
  children?: React.ReactNode
}

export function EmptyState({ message, children }: Props) {
  return (
    <div className="empty-state" role="status">
      <span>{message}</span>
      {children}
    </div>
  )
}
