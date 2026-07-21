'use client'

import type { FC } from 'react'
import type { RelatedPulseRow } from '@/lib/person-related-pulses'

/**
 * GOAL-314: the pulses a person authored (INITIATED_BY) or is mentioned in
 * (MENTIONED_IN), rendered as compact node cards. Shared by the entity-info
 * drawer and the full profile page so an upload-created PersonPulse's
 * contributions render identically on both surfaces. Each row pulls its icon +
 * themed color from pulse-type-config, so tints track light / dark / every
 * theme variant.
 */
export const RelatedPulsesList: FC<{
  rows: RelatedPulseRow[]
  onOpen: (id: string, title: string) => void
  /** Cap the number of rows shown; the remainder is summarised. */
  limit?: number
}> = ({ rows, onOpen, limit = 6 }) => {
  if (rows.length === 0) return null
  const shown = rows.slice(0, limit)
  const remaining = rows.length - shown.length

  return (
    <ul className="space-y-2">
      {shown.map((pulse) => (
        <li key={pulse.id}>
          <button
            type="button"
            onClick={() => onOpen(pulse.id, pulse.title)}
            className="group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20 px-3 py-2.5 transition-all cursor-pointer flex items-center gap-3"
          >
            <span
              className="size-8 shrink-0 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: `color-mix(in srgb, var(${pulse.cssVar}) 14%, transparent)`,
                borderColor: `color-mix(in srgb, var(${pulse.cssVar}) 30%, transparent)`,
              }}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ color: `var(${pulse.cssVar})` }}
              >
                {pulse.icon}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                {pulse.title}
              </p>
              <p className="text-[10px] text-gp-ink-muted dark:text-white/45 truncate">
                {pulse.relation}
                {pulse.contextTitle ? ` · ${pulse.contextTitle}` : ''}
              </p>
            </div>
            <span className="material-symbols-outlined text-[16px] shrink-0 text-gp-ink-soft group-hover:text-gp-primary group-hover:translate-x-0.5 transition-all">
              arrow_forward
            </span>
          </button>
        </li>
      ))}
      {remaining > 0 && (
        <li className="text-[11px] text-gp-ink-muted dark:text-white/45 px-3 pt-1">
          + {remaining} more
        </li>
      )}
    </ul>
  )
}
