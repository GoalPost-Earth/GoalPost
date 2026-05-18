'use client'

import { useEffect, useRef, useState, type FC } from 'react'
import { gsap } from 'gsap'
import { useStudioCanvas } from './studio-canvas-context'

/**
 * Glass pill that opens the floating chat panel. Anchored to bottom-right
 * on every viewport. Visible only when the effective chat layout is
 * 'floating' (desktop preference) or on mobile (where docked is forced off).
 *
 * Hidden when the floating panel itself is already open — the panel has
 * its own close affordance.
 */
export const FloatingChatTrigger: FC = () => {
  const { floatingChatOpen, toggleFloatingChat } = useStudioCanvas()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    if (floatingChatOpen) return
    if (!groupRef.current) return
    gsap.fromTo(
      groupRef.current,
      { scale: 0, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    )
  }, [floatingChatOpen])

  if (floatingChatOpen) return null

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
    toggleFloatingChat()
  }

  return (
    <div
      ref={groupRef}
      className="fixed bottom-6 right-6 z-40 group flex flex-col items-end gap-2"
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
          aria-label="Open chat"
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
            Open chat
          </div>
        </div>
      </div>
    </div>
  )
}
