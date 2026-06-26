'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

interface Point {
  x: number
  y: number
}

/** State captured when a one-finger pan begins, so each move resolves the pan
 *  absolutely from the gesture's start rather than from the previous frame. */
interface PanAnchor {
  /** NVL pan (world coords) at gesture start. */
  panX: number
  panY: number
  /** Touch position (client/CSS px) at gesture start. */
  clientX: number
  clientY: number
  /** NVL scale at gesture start (a one-finger pan can't also zoom). */
  scale: number
}

/** Minimal shape of the hit-test result we read from NVL's `getHits`. */
interface NvlHitResult {
  nvlTargets?: {
    nodes?: unknown[]
    relationships?: unknown[]
  }
}

/**
 * The slice of an NVL instance (or our structural `NvlRefHandle`) this hook
 * drives. Both the raw `@neo4j-nvl` instance (NvlCanvas) and the studio's
 * `NvlRefHandle` (GraphVisualizer) expose these, so the hook is agnostic to
 * which one it's handed. All methods are optional and feature-detected so an
 * older/partial handle simply no-ops the gesture rather than throwing.
 */
interface TouchableNvl {
  getScale?: () => number
  setZoom?: (zoom: number) => void
  getPan?: () => Point
  setPan?: (panX: number, panY: number) => void
  getHits?: (
    evt: { clientX: number; clientY: number },
    targets?: ('node' | 'relationship')[]
  ) => NvlHitResult
}

interface UseNvlTouchGesturesOptions {
  /** Ref holding the live NVL instance / handle to drive. */
  nvlRef: RefObject<TouchableNvl | null>
  /** Reports the scale NVL actually settled on after each pinch step. */
  onScaleChange?: (scale: number) => void
}

// Below this ratio change we treat a pinch frame as resting-finger jitter.
const PINCH_JITTER = 0.005

/**
 * Bridge touch gestures into NVL on touch devices (iPad / phones):
 *   - **Two fingers** → pinch-to-zoom (NVL's built-in zoom only listens to
 *     `wheel`, which touch never emits, so without this pinch zoom is dead).
 *   - **One finger on empty canvas** → pan the viewport. NVL pans on mouse
 *     drag but does not translate a single-finger touch drag into a pan, so
 *     on touch the canvas is stuck unless you have a trackpad/Pencil.
 *
 * A one-finger drag that *starts on a node or relationship* is left alone, so
 * the existing tap-to-drill / node interaction keeps working and we never
 * hijack a node gesture into a pan (GOAL-276 acceptance criteria).
 *
 * We keep NVL as the single source of truth for the viewport transform: pinch
 * drives `setZoom()` and pan drives `setPan()` (no DOM transforms of our own).
 *
 * Returns a **callback ref** to spread onto the element wrapping the NVL
 * canvas. A callback ref (rather than a plain ref + effect) is deliberate: the
 * surface element is often rendered conditionally (e.g. the studio Bloom view
 * only mounts its canvas once data loads), and a callback ref attaches the
 * listeners the moment that element mounts and detaches when it unmounts —
 * a plain-ref effect would run once at mount when the element is still absent
 * and never re-attach. The wrapped element must also carry `touch-action: none`
 * so the browser hands us the gesture instead of page-zooming/scrolling first.
 *
 * Pan converts a screen-pixel drag delta into NVL's world-space pan with the
 * inverse of NVL's own screen→world map (`world = pan + dpr·(client−center) /
 * scale`): `Δpan = −dpr·Δclient / scale`. Dividing by `scale` keeps the grabbed
 * point pinned under the finger at every zoom level. Zoom deliberately isn't
 * pre-clamped — NVL enforces its own bounds inside `setZoom`, matching the +/−
 * zoom buttons.
 */
export function useNvlTouchGestures({
  nvlRef,
  onScaleChange,
}: UseNvlTouchGesturesOptions): (el: HTMLElement | null) => void {
  // Read the latest callback inside the live listeners without re-attaching
  // them every time the caller passes a new inline function.
  const onScaleChangeRef = useRef(onScaleChange)
  useEffect(() => {
    onScaleChangeRef.current = onScaleChange
  }, [onScaleChange])

  // Last finger-spread distance during an active pinch (null = no pinch).
  const pinchDistRef = useRef<number | null>(null)
  // Anchor captured when a one-finger pan begins (null = not panning, e.g. the
  // gesture started on a node or with multiple fingers). Resolving each move
  // absolutely from this anchor keeps panning immune to NVL's deferred
  // setPan/getPan (flushed on the next frame), which would otherwise drop
  // deltas and drift on fast multi-touch bursts (120 Hz ProMotion).
  const panAnchorRef = useRef<PanAnchor | null>(null)
  // The element we're currently bound to + its teardown.
  const boundElRef = useRef<HTMLElement | null>(null)
  const detachRef = useRef<(() => void) | null>(null)

  const attach = useCallback(
    (el: HTMLElement): (() => void) => {
      const distanceBetween = (a: Touch, b: Touch) =>
        Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

      // True when the point sits on a node/relationship, so a one-finger drag
      // there belongs to NVL (node interaction) rather than to panning. On any
      // failure we allow panning — node touch-drag isn't supported today and a
      // stationary tap still drills via the synthesized click on touchend.
      const startsOnGraphElement = (touch: Touch): boolean => {
        const nvl = nvlRef.current
        if (!nvl || typeof nvl.getHits !== 'function') return false
        try {
          const { nvlTargets } = nvl.getHits(
            { clientX: touch.clientX, clientY: touch.clientY },
            ['node', 'relationship']
          )
          return (
            (nvlTargets?.nodes?.length ?? 0) > 0 ||
            (nvlTargets?.relationships?.length ?? 0) > 0
          )
        } catch (error) {
          console.warn('NVL hit-test failed; allowing pan:', error)
          return false
        }
      }

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          // Two fingers down → pinch; cancel any in-flight pan.
          pinchDistRef.current = distanceBetween(e.touches[0], e.touches[1])
          panAnchorRef.current = null
          return
        }
        if (e.touches.length === 1) {
          pinchDistRef.current = null
          panAnchorRef.current = null
          const touch = e.touches[0]
          // Only pan when the drag begins on empty canvas — a drag starting on
          // a node/relationship belongs to NVL (interaction / tap-to-drill).
          if (startsOnGraphElement(touch)) return
          const nvl = nvlRef.current
          const pan = nvl?.getPan?.()
          const scale = nvl?.getScale?.()
          if (pan && typeof scale === 'number' && scale) {
            panAnchorRef.current = {
              panX: pan.x,
              panY: pan.y,
              clientX: touch.clientX,
              clientY: touch.clientY,
              scale,
            }
          }
          return
        }
        panAnchorRef.current = null
      }

      const handlePinch = (e: TouchEvent) => {
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
        if (Math.abs(ratio - 1) < PINCH_JITTER) return

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

      const handlePan = (e: TouchEvent) => {
        const anchor = panAnchorRef.current
        if (!anchor) return

        const nvl = nvlRef.current
        if (!nvl || typeof nvl.setPan !== 'function') return

        // We're driving the pan, so stop any native scroll/refresh.
        e.preventDefault()

        const touch = e.touches[0]
        // Resolve the pan absolutely from the gesture's start anchor, inverting
        // NVL's screen→world map (`world = pan + dpr·(client−center) / scale`)
        // so the grabbed point tracks the finger at any zoom:
        // Δpan = −dpr·Δclient / scale. Anchoring (vs. accumulating per frame)
        // sidesteps NVL flushing setPan only on the next animation frame.
        const dpr = window.devicePixelRatio || 1
        try {
          nvl.setPan(
            anchor.panX - (dpr * (touch.clientX - anchor.clientX)) / anchor.scale,
            anchor.panY - (dpr * (touch.clientY - anchor.clientY)) / anchor.scale
          )
        } catch (error) {
          console.warn('Touch pan failed:', error)
        }
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 2) {
          handlePinch(e)
        } else if (e.touches.length === 1) {
          handlePan(e)
        }
      }

      const handleTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) pinchDistRef.current = null
        // Clear the pan anchor on full lift. A leftover finger after a pinch is
        // intentionally NOT re-anchored (its gesture was never node-gated), so
        // panning always requires a fresh single-finger touch.
        if (e.touches.length === 0) panAnchorRef.current = null
      }

      // Non-passive so preventDefault() actually suppresses native page
      // zoom/scroll during our gestures.
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
