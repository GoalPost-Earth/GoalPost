'use client'

import { useEffect, useRef, useState, type FC } from 'react'
import { gsap } from 'gsap'
import { useStudioPanes } from './studio-panes-context'

interface FloatingAssistantTriggerProps {
  isOpen: boolean
  onClick: () => void
}

/**
 * Bottom-left glass pill that opens the existing AIAssistantPanel. Hidden
 * when chat is already visible in either pane — that surface owns the AI
 * conversation directly, so the floating trigger would be redundant.
 */
export const FloatingAssistantTrigger: FC<FloatingAssistantTriggerProps> = ({
  isOpen,
  onClick,
}) => {
  const { left, right } = useStudioPanes()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  const hidden = left === 'chat' || right === 'chat'

  useEffect(() => {
    if (hidden) return
    if (!groupRef.current) return
    gsap.fromTo(
      groupRef.current,
      { scale: 0, opacity: 0, y: 20 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }
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
    onClick()
  }

  return (
    <div
      ref={groupRef}
      className="fixed bottom-6 left-6 z-40 group flex flex-col items-start gap-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleClick}
          className="cursor-pointer relative flex items-center justify-center size-12 rounded-full bg-white/50 dark:bg-slate-900/50 hover:bg-white/70 dark:hover:bg-slate-900/70 transition-all duration-300 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 backdrop-blur-md"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 25px color-mix(in srgb, var(--gp-primary) 35%, transparent)`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
          aria-label="Ask Aiden"
        >
          <span className="material-symbols-outlined text-2xl text-slate-600 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
            psychology
          </span>
          {!isOpen && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 size-2.5 bg-gp-primary rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          )}
        </button>

        <div
          className={`absolute bottom-full left-0 mb-3 w-max transition-all duration-300 pointer-events-none ${
            showTooltip && !isOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-900 dark:text-white/90 shadow-xl">
            Ask Aiden
          </div>
        </div>
      </div>
    </div>
  )
}
