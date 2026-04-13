/**
 * Format a number with thousands separators (French locale uses space).
 * e.g. 100000 → "100 000"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

/**
 * Format a date as a relative timestamp.
 * e.g. "il y a 2 heures"
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `il y a ${diffD}j`
  return date.toLocaleDateString('fr-FR')
}

/**
 * Get initials from a full name. e.g. "Marie Dupont" → "MD"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('')
}

/**
 * Generate a deterministic color from a string (for avatars).
 */
const AVATAR_COLORS = [
  '#0d6efd', '#198754', '#dc3545', '#fd7e14',
  '#6610f2', '#0dcaf0', '#d63384', '#20c997',
]
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
