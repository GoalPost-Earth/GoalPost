'use client'

import { useMemo, type FC, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PULSE_TYPE_CONFIG, type NodeType } from '@/lib/pulse-type-config'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getEditablePulseType } from './field-section-primitives'

/**
 * Filter the Pulses section down to the types you care about.
 *
 * A field that has been through an article import mixes Goals, Resources,
 * Stories, Care and Core Values in one list, ordered by recency rather than by
 * kind — so "show me the resources" meant reading every row. This is that
 * question, asked once.
 *
 * A dropdown rather than a row of chips: the section header already carries
 * Select / Import Articles / Add Pulse, and a chip per type pushed that row
 * wide enough to squeeze the heading beside it down to one word per line. One
 * pill costs a fixed amount of space no matter how many types a field holds.
 *
 * Only types the field ACTUALLY holds are listed, and each carries its count.
 * Offering a filter for a type with nothing behind it would be a control that
 * can only ever empty the list — the same rule the Bloom legend follows.
 *
 * Colour and icon come from `pulse-type-config.ts`, the single source of truth
 * for entity semantics, so a row here always matches the badge on the pulses
 * it filters to.
 */

export interface PulseTypeCount {
  type: NodeType
  count: number
}

/** Counts per pulse type, in the canonical config order, present types only. */
export function usePulseTypeCounts(
  pulses: Array<{ __typename: string }>
): PulseTypeCount[] {
  return useMemo(() => {
    const counts = new Map<NodeType, number>()
    for (const pulse of pulses) {
      const type = getEditablePulseType(pulse.__typename)
      if (!type) continue
      counts.set(type, (counts.get(type) ?? 0) + 1)
    }
    return (Object.keys(PULSE_TYPE_CONFIG) as NodeType[])
      .filter((type) => counts.has(type))
      .map((type) => ({ type, count: counts.get(type) ?? 0 }))
  }, [pulses])
}

interface PulseTypeFilterProps {
  counts: PulseTypeCount[]
  /** Types switched OFF. Empty means everything shows. */
  hidden: ReadonlySet<NodeType>
  onToggle: (type: NodeType) => void
  onShowAll: () => void
}

export const PulseTypeFilter: FC<PulseTypeFilterProps> = ({
  counts,
  hidden,
  onToggle,
  onShowAll,
}) => {
  // One type is not a filter — there is nothing to narrow to.
  if (counts.length < 2) return null

  const shownCount = counts.filter((row) => !hidden.has(row.type)).length
  const filtering = shownCount < counts.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            filtering
              ? `Filter pulses by type — showing ${shownCount} of ${counts.length} types`
              : 'Filter pulses by type'
          }
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2',
            'text-xs font-medium transition-all cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary/50',
            // Tinted while a type is switched off, so a filtered list never
            // looks like a short one.
            filtering
              ? 'border-gp-primary/40 bg-gp-primary/10 dark:bg-gp-primary/15 text-gp-primary hover:bg-gp-primary/20'
              : 'border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10'
          )}
        >
          <span
            className="material-symbols-outlined text-[16px] leading-none"
            aria-hidden="true"
          >
            filter_list
          </span>
          {filtering ? `${shownCount} of ${counts.length} types` : 'All types'}
          <span
            className="material-symbols-outlined text-[16px] leading-none opacity-70"
            aria-hidden="true"
          >
            expand_more
          </span>
        </button>
      </DropdownMenuTrigger>

      {/* `z-[100]` clears the dialog this can open inside of (content z-90,
          overlay z-80). The primitive's default z-50 would put the menu
          BEHIND the modal that contains its trigger. */}
      <DropdownMenuContent
        align="end"
        className="z-[100] w-52 bg-gp-surface-strong dark:bg-gp-surface-dark border-gp-glass-border"
      >
        {counts.map(({ type, count }) => {
          const config = PULSE_TYPE_CONFIG[type]
          return (
            <DropdownMenuCheckboxItem
              key={type}
              checked={!hidden.has(type)}
              // Keep the menu open: picking types is usually more than one
              // decision, and a menu that shuts on every tick makes you
              // reopen it per type.
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={() => onToggle(type)}
              className="gp-menu-item cursor-pointer text-xs"
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[16px] leading-none',
                  config.color
                )}
                aria-hidden="true"
              >
                {config.icon}
              </span>
              <span className="flex-1 truncate">{config.label}</span>
              <span className="tabular-nums text-[11px] text-gp-ink-muted">
                {count}
              </span>
            </DropdownMenuCheckboxItem>
          )
        })}

        {filtering && (
          <>
            <DropdownMenuSeparator className="bg-gp-glass-border" />
            <DropdownMenuItem
              onSelect={() => onShowAll()}
              className="gp-menu-item cursor-pointer justify-center text-[11px] font-bold uppercase tracking-wider text-gp-primary"
            >
              Show all types
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The section has pulses, but the filter is hiding all of them.
 *
 * Worth its own state rather than an empty list: "nothing here" and "nothing
 * shown" are different facts about a field, and only one of them is the
 * viewer's own doing. The same distinction the Bloom canvas draws between an
 * empty scope and one filtered to nothing.
 */
export const PulseTypeFilterEmpty: FC<{
  /** The filter itself — kept on screen, since it is the way back. */
  typeFilter: ReactNode
  totalPulses: number
  onShowAll: () => void
}> = ({ typeFilter, totalPulses, onShowAll }) => (
  <div className="flex flex-col gap-3">
    <div className="flex justify-end">{typeFilter}</div>
    <div className="rounded-2xl border border-dashed border-gp-glass-border bg-gp-glass-bg/30 px-4 py-6 text-center">
      <p className="text-xs text-gp-ink-muted">
        Every pulse type is switched off, so none of this field&apos;s{' '}
        {totalPulses} pulses are showing.
      </p>
      <button
        type="button"
        onClick={onShowAll}
        className="gp-glass-hover mt-3 cursor-pointer rounded-full border border-gp-primary/40 px-4 py-2 text-xs font-semibold text-gp-primary"
      >
        Show all types
      </button>
    </div>
  </div>
)
