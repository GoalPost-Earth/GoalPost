'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

/**
 * The slice of an NVL instance (or our structural `NvlRefHandle`) this hook
 * drives. Both the raw `@neo4j-nvl` instance (NvlCanvas) and the studio's
 * `NvlRefHandle` (GraphVisualizer) expose these, so the hook is agnostic to
 * which one it's handed.
 */
interface ZoomableNvl {
  getScale?: () => number
  setZoom?: (zoom: number) => void
}

interface UseNvlPinchZoomOptions {
  /** Ref holding the live NVL instance / handle to zoom. */
  nvlRef: RefObject<ZoomableNvl | null>
  /** Reports the scale NVL actually settled on after each pinch step. */
  onScaleChange?: (scale: number) => void
}

/**
 * Bridge two-finger pinch gestures into NVL's zoom on touch devices.
 *
 * NVL's built-in zoom only listens to `wheel` events, which iPads and phones
 * never emit for a pinch — so without this, two-finger zoom is dead on touch.
 * We track the finger spread and drive NVL's own `setZoom()`, keeping NVL as
 * the single zoom engine (no DOM transforms of our own).
 *
 * Returns a **callback ref** to spread onto the element wrapping the NVL
 * canvas. A callback ref (rather than a plain ref + effect) is deliberate: the
 * surface element is often rendered conditionally (e.g. the studio Bloom view
 * only mounts its canvas once data loads), and a callback ref attaches the
 * listeners the moment that element mounts and detaches when it unmounts —
 * a plain-ref effect would run once at mount when the element is still absent
 * and never re-attach. The wrapped element must also carry `touch-action: none`
 * so the browser hands us the gesture instead of page-zooming first.
 *
 * We deliberately don't clamp the target zoom: NVL enforces its own configured
 * bounds inside `setZoom`, matching the existing +/- zoom buttons (which also
 * don't pre-clamp). Zoom is centered on the viewport — NVL's public `setZoom`
 * takes no focal point — so pinch zooms toward center, same as the buttons.
 */
export function useNvlPinchZoom({
  nvlRef,
  onScaleChange,
}: UseNvlPinchZoomOptions): (el: HTMLElement | null) => void {
  // Read the latest callback inside the live listeners without re-attaching
  // them every time the caller passes a new inline function.
  const onScaleChangeRef = useRef(onScaleChange)
  useEffect(() => {
    onScaleChangeRef.current = onScaleChange
  }, [onScaleChange])

  // Last finger-spread distance during an active pinch (null = no pinch).
  const pinchDistRef = useRef<number | null>(null)
  // The element we're currently bound to + its teardown.
  const boundElRef = useRef<HTMLElement | null>(null)
  const detachRef = useRef<(() => void) | null>(null)

  const attach = useCallback(
    (el: HTMLElement): (() => void) => {
      const distanceBetween = (a: Touch, b: Touch) =>
        Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          pinchDistRef.current = distanceBetween(e.touches[0], e.touches[1])
        }
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 2) return

        // We own any two-finger gesture on this surface — suppress the
        // browser's native page zoom even on the bootstrap frame before we
        // have a delta.
        e.preventDefault()

        const nvl = nvlRef.current
        if (
          !nvl ||
          typeof nvl.getScale !== 'function' ||
          typeof nvl.setZoom !== 'function'
        ) {
          return
        }

        const dist = distanceBetween(e.touches[0], e.touches[1])
        const last = pinchDistRef.current
        if (last == null || last === 0) {
          pinchDistRef.current = dist
          return
        }

        const ratio = dist / last
        pinchDistRef.current = dist
        // Ignore sub-pixel jitter so resting fingers don't drift the zoom.
        if (Math.abs(ratio - 1) < 0.005) return

        try {
          const currentScale = nvl.getScale()
          if (typeof currentScale === 'number') {
            nvl.setZoom(currentScale * ratio)
            // Report what NVL actually applied (it clamps to its own bounds),
            // not our requested target.
            const applied = nvl.getScale?.()
            if (typeof applied === 'number') onScaleChangeRef.current?.(applied)
          }
        } catch (error) {
          console.warn('Pinch zoom failed:', error)
        }
      }

      const handleTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
          pinchDistRef.current = null
        }
      }

      // Non-passive so preventDefault() actually suppresses native page zoom.
      el.addEventListener('touchstart', handleTouchStart, { passive: false })
      el.addEventListener('touchmove', handleTouchMove, { passive: false })
      el.addEventListener('touchend', handleTouchEnd, { passive: false })
      el.addEventListener('touchcancel', handleTouchEnd, { passive: false })

      return () => {
        el.removeEventListener('touchstart', handleTouchStart)
        el.removeEventListener('touchmove', handleTouchMove)
        el.removeEventListener('touchend', handleTouchEnd)
        el.removeEventListener('touchcancel', handleTouchEnd)
      }
    },
    [nvlRef]
  )

  // Stable callback ref: re-binds whenever the surface element mounts/unmounts.
  const surfaceRef = useCallback(
    (el: HTMLElement | null) => {
      if (boundElRef.current === el) return
      detachRef.current?.()
      detachRef.current = null
      boundElRef.current = el
      if (el) detachRef.current = attach(el)
    },
    [attach]
  )

  // Detach on unmount (React doesn't always call the callback ref with null
  // before teardown for a stable callback identity).
  useEffect(() => {
    return () => {
      detachRef.current?.()
      detachRef.current = null
      boundElRef.current = null
    }
  }, [])

  return surfaceRef
}
