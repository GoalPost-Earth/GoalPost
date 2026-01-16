'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { PulseTypeSuggestion } from './pulse-type-suggestion'
import { OfferingModal } from './offering-modal'
import { NodeType } from './pulse-node'
import { cn } from '@/lib/utils'

interface OfferingInputProps {
  onSubmit?: (value: string, type: NodeType, name: string) => void
  isLoading?: boolean
}

export function OfferingInput({
  onSubmit,
  isLoading = false,
}: OfferingInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // Set initial state
      gsap.set(containerRef.current, {
        opacity: 0,
        y: 40,
      })

      // Animate in
      gsap.to(containerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.1,
      })
    }

    return () => {
      if (containerRef.current) {
        gsap.killTweensOf(containerRef.current)
      }
    }
  }, [])

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      setShowSuggestion(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSelectPulseType = (type: NodeType, name: string) => {
    console.log('🎯 handleSelectPulseType called:', {
      type,
      name,
      hasOnSubmit: !!onSubmit,
      isLoading,
    })
    if (onSubmit && !isLoading) {
      console.log('📤 Calling onSubmit with:', { input, type, name })
      onSubmit(input, type, name)
      setInput('')
      setShowSuggestion(false)
    } else if (!onSubmit) {
      console.error('❌ onSubmit callback not provided')
    } else if (isLoading) {
      console.warn('⏳ Still loading, ignoring submit')
    }
  }

  const handleCloseSuggestion = () => {
    setShowSuggestion(false)
  }

  // If suggestion is open, show it inside the modal
  if (showSuggestion) {
    return (
      <OfferingModal
        isOpen={true}
        onClose={handleCloseSuggestion}
        position="center"
      >
        <PulseTypeSuggestion
          input={input}
          isOpen={true}
          onSelect={handleSelectPulseType}
          onClose={handleCloseSuggestion}
        />
      </OfferingModal>
    )
  }

  return (
    <>
      <div ref={containerRef} className="w-full max-w-160">
        <div className="relative group">
          {/* Glow effect for dark mode */}
          <div className="hidden dark:block absolute -inset-0.5 bg-linear-to-r from-gp-primary/30 via-gp-accent-glow/20 to-gp-primary/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />

          {/* Glass input glow for light mode */}
          <div className="dark:hidden absolute inset-0 -inset-x-2 bg-linear-to-r from-gp-primary/15 via-gp-accent-glow/15 to-gp-primary/15 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-1000" />

          {/* Input Container */}
          <div className="relative flex items-center gap-0 p-2 pl-3 rounded-3xl overflow-hidden bg-white/85 dark:bg-black/70 backdrop-filter dark:backdrop-blur-24 border border-slate-200 dark:border-white/12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-gp-primary/10 dark:from-gp-primary/20 to-transparent dark:to-gp-primary/5 border border-slate-300 dark:border-white/5 text-gp-primary shadow-sm dark:shadow-inner shrink-0 animate-breathing">
              <span className="material-symbols-outlined text-[26px]">spa</span>
            </div>

            {/* Input Field */}
            <input
              autoFocus
              disabled={isLoading}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Speak your intention..."
              className="flex-1 w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 font-light px-4 h-14 caret-gp-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-1 pr-1">
              <button
                disabled={isLoading}
                className="group/mic p-3 rounded-2xl hover:bg-white/10 dark:hover:bg-white/10 text-slate-400 dark:text-white/60 hover:text-slate-600 dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[24px] group-hover/mic:scale-110 transition-transform">
                  mic
                </span>
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-center size-12 rounded-2xl text-white transition-all shadow-[0_4px_15px_-3px_rgba(19,164,236,0.4)] dark:shadow-[0_0_15px_rgba(19,164,236,0.3)]',
                  isLoading
                    ? 'bg-gp-primary/50 dark:bg-gp-primary/50 cursor-not-allowed'
                    : 'bg-gp-primary hover:bg-gp-primary/90 dark:bg-gp-primary dark:hover:bg-gp-primary/80 hover:shadow-[0_6px_20px_-3px_rgba(19,164,236,0.6)] dark:hover:shadow-[0_0_25px_rgba(19,164,236,0.5)]'
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-[24px]',
                    isLoading && 'animate-spin'
                  )}
                >
                  {isLoading ? 'hourglass_bottom' : 'arrow_upward'}
                </span>
              </button>
            </div>
          </div>

          {/* Helper text */}
          <div className="absolute top-full left-0 right-0 mt-4 text-center animate-pulse-slow">
            <p className="text-slate-800 dark:text-white/90 text-sm font-medium tracking-wide">
              Offering something? Just type or speak.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
