import { useEffect, useState, useRef } from 'react'

export interface ElementPosition {
  top: number
  left: number
  width: number
  height: number
  isVisible: boolean
}

export interface TooltipPosition {
  top: number
  left: number
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOOLTIP_OFFSET = 24
const TOOLTIP_WIDTH = 320
const TOOLTIP_HEIGHT = 280

export function useTourOverlay(
  selector?: string,
  preferredPosition: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'bottom'
) {
  const [elementPosition, setElementPosition] =
    useState<ElementPosition | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    position: preferredPosition,
  })
  const observerRef = useRef<ResizeObserver | MutationObserver | null>(null)

  useEffect(() => {
    // Reset positions immediately when selector changes
    setElementPosition(null)
    setTooltipPosition({
      top: 0,
      left: 0,
      position: preferredPosition,
    })

    // For centered tooltips (no selector), calculate center position immediately
    if (!selector) {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const centeredTop = (viewportHeight - TOOLTIP_HEIGHT) / 2
      const centeredLeft = (viewportWidth - TOOLTIP_WIDTH) / 2

      setTooltipPosition({
        top: Math.max(0, centeredTop),
        left: Math.max(0, centeredLeft),
        position: 'center',
      })
      return
    }

    const findAndHighlightElement = () => {
      const element = document.querySelector(selector) as HTMLElement

      if (!element) {
        setElementPosition(null)
        return
      }

      const rect = element.getBoundingClientRect()
      const isVisible = rect.width > 0 && rect.height > 0

      const position: ElementPosition = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        isVisible,
      }

      setElementPosition(position)

      // Calculate tooltip position
      const tooltipPos = calculateTooltipPosition(rect, preferredPosition)
      setTooltipPosition(tooltipPos)
    }

    // Initial find
    findAndHighlightElement()

    // Watch for changes using ResizeObserver
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      observerRef.current = new ResizeObserver(() => {
        findAndHighlightElement()
      })
      observerRef.current.observe(element)
    }

    // Also observe scroll and window resize
    const handleScroll = () => findAndHighlightElement()
    const handleResize = () => findAndHighlightElement()

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    // Retry finding element periodically for the first second
    // This helps handle cases where element appears after initial load
    let retryCount = 0
    const retryInterval = setInterval(() => {
      retryCount++
      const el = document.querySelector(selector) as HTMLElement | null
      if (el && !elementPosition) {
        findAndHighlightElement()
      }
      if (retryCount >= 5) {
        clearInterval(retryInterval)
      }
    }, 200)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
      clearInterval(retryInterval)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [selector, preferredPosition])

  return { elementPosition, tooltipPosition }
}

function calculateTooltipPosition(
  elementRect: DOMRect,
  preferredPosition: 'top' | 'bottom' | 'left' | 'right' | 'center'
): TooltipPosition {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Try preferred position first
  const positions = getPositionVariants(preferredPosition)

  for (const pos of positions) {
    const { top, left, fits } = calculatePosition(
      elementRect,
      pos,
      viewportWidth,
      viewportHeight
    )
    if (fits) {
      return { top, left, position: pos }
    }
  }

  // Fallback to bottom if nothing fits
  const { top, left } = calculatePosition(
    elementRect,
    'bottom',
    viewportWidth,
    viewportHeight
  )
  return { top, left, position: 'bottom' }
}

function getPositionVariants(
  preferred: 'top' | 'bottom' | 'left' | 'right' | 'center'
): Array<'top' | 'bottom' | 'left' | 'right' | 'center'> {
  const order: Record<
    string,
    Array<'top' | 'bottom' | 'left' | 'right' | 'center'>
  > = {
    top: ['top', 'bottom', 'right', 'left', 'center'],
    bottom: ['bottom', 'top', 'right', 'left', 'center'],
    left: ['left', 'right', 'bottom', 'top', 'center'],
    right: ['right', 'left', 'bottom', 'top', 'center'],
    center: ['center'],
  }
  return order[preferred] || order['bottom']
}

function calculatePosition(
  elementRect: DOMRect,
  position: 'top' | 'bottom' | 'left' | 'right' | 'center',
  viewportWidth: number,
  viewportHeight: number
): { top: number; left: number; fits: boolean } {
  let top = 0
  let left = 0
  let fits = true

  const centerX = elementRect.left + elementRect.width / 2
  const centerY = elementRect.top + elementRect.height / 2

  switch (position) {
    case 'top':
      top = elementRect.top - TOOLTIP_HEIGHT - TOOLTIP_OFFSET
      left = centerX - TOOLTIP_WIDTH / 2
      fits = top >= 0 && left >= 0 && left + TOOLTIP_WIDTH <= viewportWidth
      break
    case 'bottom':
      top = elementRect.bottom + TOOLTIP_OFFSET
      left = centerX - TOOLTIP_WIDTH / 2
      fits =
        top + TOOLTIP_HEIGHT <= viewportHeight &&
        left >= 0 &&
        left + TOOLTIP_WIDTH <= viewportWidth
      break
    case 'left':
      top = centerY - TOOLTIP_HEIGHT / 2
      left = elementRect.left - TOOLTIP_WIDTH - TOOLTIP_OFFSET
      fits = left >= 0 && top >= 0 && top + TOOLTIP_HEIGHT <= viewportHeight
      break
    case 'right':
      top = centerY - TOOLTIP_HEIGHT / 2
      left = elementRect.right + TOOLTIP_OFFSET
      fits =
        left + TOOLTIP_WIDTH <= viewportWidth &&
        top >= 0 &&
        top + TOOLTIP_HEIGHT <= viewportHeight
      break
    case 'center':
      // Center the tooltip in the viewport
      top = (viewportHeight - TOOLTIP_HEIGHT) / 2
      left = (viewportWidth - TOOLTIP_WIDTH) / 2
      fits = true
      break
  }

  // Clamp to viewport
  const clampedTop = Math.max(0, Math.min(top, viewportHeight - TOOLTIP_HEIGHT))
  const clampedLeft = Math.max(0, Math.min(left, viewportWidth - TOOLTIP_WIDTH))

  // Check if clamping caused overlap with the element
  if (position !== 'center' && (clampedTop !== top || clampedLeft !== left)) {
    // Check for overlap
    const tooltipRect = {
      top: clampedTop,
      left: clampedLeft,
      right: clampedLeft + TOOLTIP_WIDTH,
      bottom: clampedTop + TOOLTIP_HEIGHT,
    }

    const hasOverlap =
      tooltipRect.left < elementRect.right &&
      tooltipRect.right > elementRect.left &&
      tooltipRect.top < elementRect.bottom &&
      tooltipRect.bottom > elementRect.top

    if (hasOverlap) {
      // If there's overlap after clamping, mark as not fitting
      fits = false
    }
  }

  return { top: clampedTop, left: clampedLeft, fits }
}
