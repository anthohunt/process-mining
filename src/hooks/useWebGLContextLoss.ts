import { useEffect, useState, RefObject } from 'react'

export function useWebGLContextLoss(canvasContainerRef: RefObject<HTMLElement | null>) {
  const [contextLost, setContextLost] = useState(false)

  useEffect(() => {
    const container = canvasContainerRef.current
    if (!container) return

    const getCanvas = (): HTMLCanvasElement | null =>
      container.tagName === 'CANVAS'
        ? (container as HTMLCanvasElement)
        : container.querySelector('canvas')

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      setContextLost(true)
    }

    const handleContextRestored = () => {
      setContextLost(false)
    }

    // Observe DOM mutations so we attach once the canvas is added
    let canvas = getCanvas()
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost)
      canvas.addEventListener('webglcontextrestored', handleContextRestored)
    }

    const observer = new MutationObserver(() => {
      const newCanvas = getCanvas()
      if (newCanvas && newCanvas !== canvas) {
        canvas?.removeEventListener('webglcontextlost', handleContextLost)
        canvas?.removeEventListener('webglcontextrestored', handleContextRestored)
        canvas = newCanvas
        canvas.addEventListener('webglcontextlost', handleContextLost)
        canvas.addEventListener('webglcontextrestored', handleContextRestored)
      }
    })
    observer.observe(container, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      canvas?.removeEventListener('webglcontextlost', handleContextLost)
      canvas?.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [canvasContainerRef])

  return contextLost
}
