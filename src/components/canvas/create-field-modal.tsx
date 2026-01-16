'use client'

import { useState } from 'react'
import { OfferingModal } from '@/components/ui/offering-modal'
import { cn } from '@/lib/utils'

interface CreateFieldModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateField?: (description: string) => void | Promise<void>
  isLoading?: boolean
}

export function CreateFieldModal({
  isOpen,
  onClose,
  onCreateField,
  isLoading = false,
}: CreateFieldModalProps) {
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim() && !isLoading) {
      await onCreateField?.(description)
      setDescription('')
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <OfferingModal isOpen={isOpen} onClose={onClose} position="center">
      <div className="relative z-10 w-full animate-[float_6s_ease-in-out_infinite]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-16 right-4 md:-right-8 p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-gp-ink-muted dark:text-white/50 hover:text-gp-ink-strong dark:hover:text-white transition-all group"
        >
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">
            close
          </span>
        </button>

        {/* Modal Content */}
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-gp-glass-border dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Background Glow Effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gp-primary/20 dark:bg-gp-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gp-accent-glow/20 dark:bg-gp-accent-glow/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="flex flex-col items-center text-center relative z-10">
            {/* Icon */}
            <div className="mb-8 relative group cursor-pointer">
              <div className="absolute inset-0 bg-gp-primary/30 rounded-full blur-xl animate-pulse-slow group-hover:bg-gp-primary/50 transition-colors duration-500" />
              <div className="size-16 rounded-full bg-linear-to-br from-white to-gp-surface-soft dark:from-white/10 dark:to-white/5 border border-white dark:border-white/20 flex items-center justify-center backdrop-blur-xl shadow-md dark:shadow-inner group-hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined text-3xl text-gp-accent-glow drop-shadow-[0_0_10px_rgba(79,255,203,0.5)] animate-glow">
                  auto_awesome
                </span>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl font-light dark:font-extralight text-gp-ink-strong dark:text-white mb-3 tracking-tight leading-tight">
              What field
              <br />
              would you like to cultivate?
            </h2>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="w-full mb-8">
              <div className="w-full relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-gp-primary/30 to-gp-accent-glow/30 dark:from-gp-primary/50 dark:to-gp-accent-glow/50 rounded-2xl blur opacity-30 dark:opacity-20 group-hover:opacity-60 dark:group-hover:opacity-40 transition duration-500" />
                <div className="relative flex items-center">
                  <input
                    autoFocus
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your intention..."
                    className={cn(
                      'w-full rounded-2xl px-6 py-4 text-lg transition-all font-light',
                      'bg-white/90 dark:bg-black/40',
                      'border border-gp-glass-border dark:border-white/10',
                      'text-gp-ink-strong dark:text-white',
                      'placeholder-gp-ink-soft dark:placeholder-white/20',
                      'focus:outline-none focus:border-gp-primary/50 focus:bg-white dark:focus:bg-black/60',
                      'focus:shadow-[0_0_0_4px_rgba(14,165,233,0.1)]'
                    )}
                  />
                  <button
                    disabled={isLoading || !description.trim()}
                    onClick={handleSubmit}
                    className={cn(
                      'absolute right-2 p-2 rounded-xl transition-all',
                      isLoading || !description.trim()
                        ? 'bg-gp-primary/5 dark:bg-gp-primary/10 text-gp-primary/40 cursor-not-allowed'
                        : 'bg-gp-primary/10 dark:bg-gp-primary/20 text-gp-primary hover:bg-gp-primary hover:text-white'
                    )}
                  >
                    {isLoading ? (
                      <span className="material-symbols-outlined animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined">
                        arrow_upward
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Hint */}
        <p className="text-center mt-6 text-gp-ink-soft dark:text-white/30 text-xs font-mono">
          Press &apos;Enter&apos; to create, or &apos;Esc&apos; to cancel
        </p>
      </div>
    </OfferingModal>
  )
}
