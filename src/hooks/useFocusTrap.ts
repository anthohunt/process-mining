import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!active) return
    previousFocusRef.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusable.length > 0) focusable[0].focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusableNow = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusableNow.length === 0) return
      const first = focusableNow[0]
      const last = focusableNow[focusableNow.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocusRef.current && 'focus' in previousFocusRef.current) {
        (previousFocusRef.current as HTMLElement).focus()
      }
    }
  }, [active])

  return containerRef
}
