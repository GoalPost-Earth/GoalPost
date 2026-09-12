'use client'

import type { FC } from 'react'
import { useFocalEntity } from '@/contexts'
import { useFieldContextCanEditContent } from '@/hooks/use-field-context-permissions'
import { useResonanceDiscovery } from '@/hooks/useResonanceDiscovery'
import { cn } from '@/lib/utils'

/**
 * Studio-shell entry for a manual resonance discovery sweep (WF-06, GOAL-368).
 *
 * The field-context page already had a Discover button, but only in its
 * Resonances section header — Dashboard view only, below the fold, and never
 * used in practice. After an import, members look at the floating action bar
 * (where Upload / Import live, in BOTH canvas views), so the trigger lives here
 * too. The sweep covers the field's whole Space; the triggering field goes
 * first.
 *
 * Unlike Suggestions (review, open to every role), this WRITES suggestions, so
 * it renders only for `canEditContent` (kb/02-user-roles.md) — the route
 * re-gates server-side and enforces the per-Space cooldown.
 *
 * In-flight state is shared with the page's section button via
 * `useResonanceDiscovery`, so the two can't double-fire and spin together.
 */
export const ResonanceDiscoverAction: FC = () => {
  // Route-only focal, as ResonanceSuggestionsAction: a node tapped in Bloom
  // sets a `manual` focal, which must not make this button vanish.
  const { routeFocalEntity } = useFocalEntity()

  const fieldContextId =
    routeFocalEntity?.type === 'FieldContext' ? routeFocalEntity.id : null

  const spaceId =
    fieldContextId && routeFocalEntity?.parents
      ? (routeFocalEntity.parents.find(
          (parent) => parent.type === 'MeSpace' || parent.type === 'WeSpace'
        )?.id ?? null)
      : null

  const canEditContent = useFieldContextCanEditContent(fieldContextId)
  const { triggerDiscovery, isLoading } = useResonanceDiscovery({
    fieldContextId,
    spaceId,
  })

  if (!fieldContextId || !spaceId || !canEditContent) return null

  return (
    <button
      type="button"
      onClick={triggerDiscovery}
      disabled={isLoading}
      data-testid="discover-resonances-action-bar"
      aria-label={
        isLoading
          ? 'Discovering resonances across this space'
          : 'Discover resonances across every field in this space'
      }
      aria-busy={isLoading}
      title={
        isLoading
          ? 'Looking for resonances across this space…'
          : 'Let AI look for resonances across every field in this space now, instead of waiting for the nightly run'
      }
      className="gp-glass-hover cursor-pointer flex items-center gap-1.5 md:gap-2 px-2.5 md:pl-4 md:pr-4 h-10 md:h-11 rounded-full gp-glass border border-gp-glass-border hover:border-gp-primary/40 hover:shadow-[0_0_50px_color-mix(in_srgb,var(--gp-primary)_35%,transparent)] transition-all disabled:cursor-wait disabled:opacity-80 disabled:hover:shadow-none disabled:hover:border-gp-glass-border"
    >
      {/* Fixed hue pair for the same contrast reason as the sibling actions
          (the themed primary reaches warm's #ffc233, ~1.8:1 on light glass).
          Violet sets "AI proposes" apart from blue review and the teal /
          amber create actions. */}
      <span
        className={cn(
          'material-symbols-outlined text-[20px] leading-none text-violet-600 dark:text-violet-300',
          isLoading && 'animate-spin'
        )}
        aria-hidden="true"
      >
        {isLoading ? 'progress_activity' : 'auto_awesome'}
      </span>
      <span className="hidden sm:inline text-sm font-semibold text-gp-ink-strong">
        {isLoading ? 'Discovering…' : 'Discover'}
      </span>
    </button>
  )
}
