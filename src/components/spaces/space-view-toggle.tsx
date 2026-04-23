'use client'

import { cn } from '@/lib/utils'

export type SpaceViewMode = 'graph' | 'details'

interface SpaceViewToggleProps {
  activeView: SpaceViewMode
  onViewChange: (view: SpaceViewMode) => void
  className?: string
}

/**
 * Toggle between graph (bubble canvas) and details (list/dashboard) views for a space.
 * Designed to sit alongside the NVL zoom controls or at the top of a details page.
 */
export function SpaceViewToggle({
  activeView,
  onViewChange,
  className,
}: SpaceViewToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 shadow-xl',
        className
      )}
    >
      <button
        onClick={(event) => {
          event.stopPropagation()
          onViewChange('graph')
        }}
        className={cn(
          'cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full transition-all duration-200',
          activeView === 'graph'
            ? 'bg-gp-primary/20 text-gp-primary'
            : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20'
        )}
        title="Graph view"
        aria-label="Switch to graph view"
      >
        <span className="material-symbols-outlined text-[20px]">hub</span>
      </button>
      <div className="w-px h-4 bg-gp-ink-soft/20 dark:bg-white/10" />
      <button
        onClick={(event) => {
          event.stopPropagation()
          onViewChange('details')
        }}
        className={cn(
          'cursor-pointer size-9 md:size-10 flex items-center justify-center rounded-full transition-all duration-200',
          activeView === 'details'
            ? 'bg-gp-primary/20 text-gp-primary'
            : 'text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-white/10 dark:hover:bg-white/20'
        )}
        title="Details view"
        aria-label="Switch to details view"
      >
        <span className="material-symbols-outlined text-[20px]">
          view_agenda
        </span>
      </button>
    </div>
  )
}
