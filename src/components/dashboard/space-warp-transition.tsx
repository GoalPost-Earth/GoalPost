'use client'

import { useCallback, useEffect, useRef, useState, type FC } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import { useStudioCanvas } from '@/components/studio/studio-canvas-context'

/**
 * Event contract for the bubble→space "warp" animation. Any clickable
 * space surface (Graph View bubbles, Dashboard cards) dispatches this
 * with the source element's rect + a visual descriptor so the overlay
 * can render a clone that grows out of that rect and dissolves into the
 * destination view. The fade-out IS the loader — no spinner flash.
 */
export const OPEN_SPACE_WARP_EVENT = 'goalpost:open-space-warp'

export type SpaceWarpDescriptor = {
  spaceId: string
  /** Source element bounding rect (from getBoundingClientRect). */
  rect: { x: number; y: number; width: number; height: number }
  /** MeSpace = warm amber/rose, WeSpace = cool teal/emerald. */
  type: 'MeSpace' | 'WeSpace'
  title: string
  icon: 'self_improvement' | 'groups'
}

export function dispatchOpenSpaceWarp(detail: SpaceWarpDescriptor) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<SpaceWarpDescriptor>(OPEN_SPACE_WARP_EVENT, { detail })
  )
}

type WarpState =
  | { phase: 'idle' }
  | { phase: 'warping'; descriptor: SpaceWarpDescriptor }
  | { phase: 'settling'; descriptor: SpaceWarpDescriptor }

/**
 * Full-viewport overlay that animates a clone of the clicked space
 * bubble/card scaling up into a soft radial glow, then dissolves to
 * reveal the destination space-dashboard view. Mounts inside the
 * canvas pane so it persists across the `/protected/dashboard` →
 * `/protected/dashboard/space/[id]` route transition.
 */
export const SpaceWarpTransition: FC = () => {
  const router = useRouter()
  const { setCanvasView, canvasView } = useStudioCanvas()
  const [state, setState] = useState<WarpState>({ phase: 'idle' })
  const overlayRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const lastCanvasViewRef = useRef(canvasView)

  // Keep the latest canvasView in a ref so the listener (registered
  // once) can flip back to dashboard without re-binding.
  useEffect(() => {
    lastCanvasViewRef.current = canvasView
  }, [canvasView])

  // Stable handler — bind once so re-renders during animation don't
  // tear the event listener down mid-flight.
  const beginWarp = useCallback((descriptor: SpaceWarpDescriptor) => {
    setState({ phase: 'warping', descriptor })
  }, [])

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<SpaceWarpDescriptor>).detail
      if (!detail || !detail.spaceId || !detail.rect) return
      beginWarp(detail)
    }
    window.addEventListener(OPEN_SPACE_WARP_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_SPACE_WARP_EVENT, onOpen)
  }, [beginWarp])

  // GSAP timeline — runs once per warp.
  useEffect(() => {
    if (state.phase !== 'warping') return
    if (!cloneRef.current || !glowRef.current || !backdropRef.current) return

    const { descriptor } = state
    const { rect } = descriptor

    // Seed the clone at the source rect so the user perceives one
    // continuous element growing — not a sudden new shape.
    gsap.set(cloneRef.current, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      opacity: 1,
    })
    gsap.set(glowRef.current, { opacity: 0, scale: 0.6 })
    gsap.set(backdropRef.current, { opacity: 0 })

    const viewportW =
      typeof window !== 'undefined' ? window.innerWidth : rect.width
    const viewportH =
      typeof window !== 'undefined' ? window.innerHeight : rect.height
    const targetSize = Math.max(viewportW, viewportH) * 1.25
    const targetX = viewportW / 2 - targetSize / 2
    const targetY = viewportH / 2 - targetSize / 2

    const tl = gsap.timeline({
      onComplete: () => {
        // Route in mid-animation already happened (see below). Now
        // hand off to the "settling" phase that fades the overlay
        // out over the freshly-painted destination view.
        setState({ phase: 'settling', descriptor })
      },
    })

    // Fade in the radial backdrop first so the bubble appears to
    // brighten as the surrounding canvas dims into a warm wash.
    tl.to(
      backdropRef.current,
      { opacity: 1, duration: 0.28, ease: 'power2.out' },
      0
    )
      // Grow the clone to fill the viewport, easing into a soft glow.
      .to(
        cloneRef.current,
        {
          x: targetX,
          y: targetY,
          width: targetSize,
          height: targetSize,
          duration: 0.62,
          ease: 'power3.inOut',
        },
        0
      )
      // Overlay glow pulses up so the clone reads as plasma, not a
      // hard-edged shape, by the time it covers the viewport.
      .to(
        glowRef.current,
        {
          opacity: 1,
          scale: 1.4,
          duration: 0.5,
          ease: 'power2.out',
        },
        0.12
      )
      // Soften the clone's edges into the glow so the transition into
      // the destination doesn't feel like a curtain wipe.
      .to(
        cloneRef.current,
        { opacity: 0.65, duration: 0.32, ease: 'power2.inOut' },
        0.38
      )

    // Route slightly before the timeline ends so the destination is
    // painting underneath while the overlay is still at full opacity.
    // No spinner flash — the warp IS the loader.
    //
    // The canvasView flip happens at the same moment: by t=380ms the
    // backdrop is fully opaque, so flipping from graph→dashboard view
    // (so SpaceDashboardView is the route content the overlay
    // dissolves into) doesn't flash the SpacesOverview cards
    // underneath.
    const routeAt = window.setTimeout(() => {
      if (lastCanvasViewRef.current !== 'dashboard') {
        setCanvasView('dashboard')
      }
      router.push(`/protected/dashboard/space/${descriptor.spaceId}`)
    }, 380)

    return () => {
      window.clearTimeout(routeAt)
      tl.kill()
    }
  }, [state, router, setCanvasView])

  // Settle phase — fade the overlay out as the destination paints.
  useEffect(() => {
    if (state.phase !== 'settling') return
    if (!overlayRef.current) return

    const tl = gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.42,
      delay: 0.18,
      ease: 'power2.out',
      onComplete: () => setState({ phase: 'idle' }),
    })
    return () => {
      tl.kill()
    }
  }, [state])

  if (state.phase === 'idle') return null

  const { descriptor } = state
  const isMe = descriptor.type === 'MeSpace'

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[60] pointer-events-none overflow-hidden"
    >
      {/* Dim wash — pulls focus away from the source canvas. */}
      <div
        ref={backdropRef}
        className={cn(
          'absolute inset-0',
          'bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.4),rgba(2,6,23,0.85))]',
          'backdrop-blur-[6px]'
        )}
      />

      {/* Soft halo that blossoms as the clone grows. */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vmax] h-[140vmax] rounded-full blur-[140px] origin-center"
        style={{
          backgroundColor: isMe
            ? 'color-mix(in srgb, var(--gp-primary) 28%, transparent)'
            : 'color-mix(in srgb, var(--gp-accent-glow) 28%, transparent)',
          willChange: 'transform, opacity',
        }}
      />

      {/* The cloned bubble itself — fixed-positioned so its starting
          rect maps 1:1 to the source element on screen. */}
      <div
        ref={cloneRef}
        className={cn(
          'absolute left-0 top-0 rounded-full flex items-center justify-center',
          'border shadow-[0_0_60px_color-mix(in_srgb,var(--gp-primary)_45%,transparent)]',
          isMe
            ? 'bg-gradient-to-br from-amber-400/60 via-rose-500/40 to-amber-700/30 border-amber-200/40'
            : 'bg-gradient-to-br from-teal-400/60 via-emerald-500/40 to-teal-800/30 border-teal-200/40'
        )}
        style={{ willChange: 'transform, width, height, opacity' }}
      >
        <div className="flex flex-col items-center text-center px-6">
          <span className="material-symbols-outlined text-white/85 text-[clamp(2rem,6vw,5rem)]">
            {descriptor.icon}
          </span>
          <span className="mt-2 text-white/85 font-light tracking-wide text-[clamp(0.85rem,2vw,1.5rem)] line-clamp-1">
            {descriptor.title}
          </span>
        </div>
      </div>
    </div>
  )
}
