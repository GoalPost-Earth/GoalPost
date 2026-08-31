'use client'

import { useEffect, useRef, useState, type FC } from 'react'
import { gsap } from 'gsap'

interface FloatingChatTriggerProps {
  /** Hides the pill — the surface it summons is already on screen. */
  hidden: boolean
  /** Brings the chat back. */
  onOpen: () => void
  /** Tooltip + accessible name. */
  label: string
}

/**
 * Glass pill that summons the chat. Anchored to the bottom-right corner on
 * every viewport.
 *
 * Two callers, one affordance:
 *  - floating layout (desktop preference / mobile) — opens the slide-out panel
 *  - docked layout with the chat hidden (GOAL-313) — restores the docked panel
 *
 * It's deliberately the same pill in both cases: once a user has learned that
 * the bottom-right glass pill brings the assistant back, that has to hold
 * regardless of which layout they're in.
 */
export const FloatingChatTrigger: FC<FloatingChatTriggerProps> = ({
  hidden,
  onOpen,
  label,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    if (hidden) return
    if (!groupRef.current) return
    gsap.fromTo(
      groupRef.current,
      { scale: 0, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    )
  }, [hidden])

  if (hidden) return null

  const handleClick = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      })
    }
    onOpen()
  }

  return (
    <div
      ref={groupRef}
      // Below `md` the pill stacks ABOVE the canvas action bar rather than
      // sharing its band (GOAL-340): the bar is a `bottom-6` centred row at
      // `z-30`, so on a narrow viewport it reaches into this corner and the
      // pill — one layer higher — silently swallowed taps meant for the bar's
      // last control. `md`, not the legend's `sm` (bloom-legend.tsx does the
      // same thing on the opposite corner), because the bar gets WIDER at
      // `sm`: every label in it is `hidden sm:inline`, so 640px is exactly
      // where it grows back into the corner.
      className="fixed bottom-20 right-6 z-40 group flex flex-col items-end gap-2 md:bottom-6"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleClick}
          className="cursor-pointer relative flex items-center justify-center size-12 rounded-full bg-white/60 dark:bg-slate-900/60 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300 border border-slate-300 dark:border-white/15 backdrop-blur-md"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 25px color-mix(in srgb, var(--gp-primary) 35%, transparent)`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
          aria-label={label}
        >
          <span className="material-symbols-outlined text-2xl text-slate-700 dark:text-white/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            psychology
          </span>
          <span className="absolute top-0 right-0 -mt-1 -mr-1 size-2.5 bg-gp-primary rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
        </button>

        <div
          className={
            showTooltip
              ? 'absolute bottom-full right-0 mb-3 w-max transition-all duration-300 pointer-events-none opacity-100 translate-y-0'
              : 'absolute bottom-full right-0 mb-3 w-max transition-all duration-300 pointer-events-none opacity-0 translate-y-2'
          }
        >
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-900 dark:text-white/90 shadow-xl">
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}
