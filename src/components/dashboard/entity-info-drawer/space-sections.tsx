'use client'

import type { FC } from 'react'
import { cn } from '@/lib/utils'
import type { GetSpaceDetailsCompleteQuery } from '@/gql/graphql'
import { SectionHeader } from './shared'
import { ShowMoreToggle, useExpandableList } from './expandable-list'
import { dispatchOpenInfoDrawer } from './types'

/**
 * Truncated list sections of the Space drawer (GOAL-315). Split out of
 * `space-details-body.tsx` so each section owns its own expand/collapse
 * state instead of the body carrying a hook per list, and so the body stays
 * inside the 400-line component budget.
 */

type SpaceNode = GetSpaceDetailsCompleteQuery['spaces'][number]
export type SpaceMembershipRow = Extract<
  SpaceNode,
  { members: unknown }
>['members'][number]

const MEMBER_LIMIT = 6

export const SpaceMembersSection: FC<{ members: SpaceMembershipRow[] }> = ({
  members,
}) => {
  const { visible, hiddenCount, expanded, toggle } = useExpandableList(
    members,
    MEMBER_LIMIT
  )
  if (members.length === 0) return null

  return (
    <section className="px-6 pb-5">
      <SectionHeader>Members ({members.length})</SectionHeader>
      <ul className="mt-2 space-y-1.5">
        {visible.map((m) => {
          const mp = m.member?.[0]
          const name = mp
            ? mp.name ||
              `${mp.firstName ?? ''} ${mp.lastName ?? ''}`.trim() ||
              'Member'
            : 'Member'
          const role = m.role || 'MEMBER'
          return (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
            >
              <button
                type="button"
                onClick={() =>
                  mp?.id &&
                  dispatchOpenInfoDrawer({
                    type: 'Person',
                    id: mp.id,
                    label: name,
                  })
                }
                disabled={!mp?.id}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer disabled:cursor-default flex-1"
              >
                <div className="size-7 shrink-0 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gp-ink-strong dark:text-white/85 truncate text-left">
                  {name}
                </span>
              </button>
              <span className="text-[10px] uppercase tracking-wider text-gp-ink-muted dark:text-white/45 shrink-0">
                {role}
              </span>
            </li>
          )
        })}
        {hiddenCount > 0 && (
          <li className="pt-0.5">
            <ShowMoreToggle
              expanded={expanded}
              hiddenCount={hiddenCount}
              onToggle={toggle}
              itemLabel="members"
            />
          </li>
        )}
      </ul>
    </section>
  )
}

export const VisibilityChoice: FC<{
  label: string
  hint: string
  active: boolean
  onClick: () => void
  disabled?: boolean
}> = ({ label, hint, active, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex-1 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      active
        ? 'border-gp-primary/60 bg-gp-primary/10 ring-1 ring-gp-primary/40'
        : 'border-gp-glass-border bg-white/40 hover:bg-white/60 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]'
    )}
  >
    <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
      {label}
    </p>
    <p className="text-[10px] text-gp-ink-muted dark:text-white/50 mt-0.5">
      {hint}
    </p>
  </button>
)
