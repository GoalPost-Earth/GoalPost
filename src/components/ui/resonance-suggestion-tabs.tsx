'use client'

import { cn } from '@/lib/utils'

/**
 * The review modal's Pending / Accepted / Declined tabs.
 *
 * Split out of the review modal so that modal stays inside the 400-line rule
 * once it gained the per-field filter (GOAL-384).
 */

export type ResonanceTabStatus = 'pending' | 'accepted' | 'declined'

interface ResonanceSuggestionTabsProps {
  activeTab: ResonanceTabStatus
  counts: Record<ResonanceTabStatus, number>
  onChange: (status: ResonanceTabStatus) => void
}

export function ResonanceSuggestionTabs({
  activeTab,
  counts,
  onChange,
}: ResonanceSuggestionTabsProps) {
  return (
    <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
      {(['pending', 'accepted', 'declined'] as const).map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize',
            activeTab === status
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          )}
        >
          {status}
          {/* min-w + horizontal padding, not a fixed w-5: a Space can queue
              three-digit counts (159 in the GOAL-353 report) and a fixed 20px
              circle clipped them. */}
          {counts[status] > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-semibold text-white bg-slate-600 rounded-full dark:bg-slate-500">
              {counts[status]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
