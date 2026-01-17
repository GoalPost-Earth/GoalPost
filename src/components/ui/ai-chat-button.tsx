'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface AIChatButtonProps {
  onClick: () => void
  isOpen: boolean
}

export function AIChatButton({ onClick, isOpen }: AIChatButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    if (buttonRef.current && groupRef.current) {
      // Initial entrance animation
      gsap.fromTo(
        groupRef.current,
        {
          scale: 0,
          opacity: 0,
          y: 20,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
          delay: 0.5,
        }
      )
    }
  }, [])

  const handleClick = () => {
    if (buttonRef.current) {
      // Click animation
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
      className="fixed bottom-6 right-6 z-40 group flex flex-col items-end gap-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleClick}
          className="cursor-pointer relative flex items-center justify-center size-12 rounded-full glass-panel bg-white/50 dark:bg-slate-900/50 hover:bg-white/70 dark:hover:bg-slate-900/70 shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] dark:hover:shadow-[0_0_25px_rgba(19,164,236,0.3)] transition-all duration-300 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 backdrop-blur-md"
          aria-label="AI Assistant"
        >
          <span className="material-symbols-outlined text-2xl text-slate-600 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
            psychology
          </span>

          {/* Pulsing indicator dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 size-2.5 bg-gp-primary rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          )}
        </button>

        {/* Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-3 w-max transition-all duration-300 pointer-events-none ${
            showTooltip && !isOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-900 dark:text-white/90 shadow-xl">
            AI Assistant
          </div>
        </div>
      </div>
    </div>
  )
}
