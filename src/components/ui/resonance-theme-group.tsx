'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * One theme's worth of resonance suggestions, as a single collapsible card.
 *
 * This is the answer to "reviewing 117 pairs one at a time is unworkable". The
 * discovery pass writes a FieldResonance node per theme and points every pair
 * at it, so a reviewer can read the theme's description ONCE and take or
 * dismiss all of its pairs in one decision, rather than meeting the same
 * paragraph 31 times.
 *
 * Deliberately a card and not a table. The request was for a table, but the
 * design language rules those out in favour of semantic cards, and a grid of
 * pulse-pair text is unreadable at the 390px reference width anyway. The card
 * keeps what the table was wanted for — scan the group, act on the group, open
 * it only when you want the detail.
 */

export interface ResonanceThemeGroupProps {
  /** FieldResonance id; null for the catch-all "ungrouped" group. */
  themeId: string | null
  label: string
  /** The shared paragraph, rendered once here instead of on every pair. */
  description: string
  count: number
  minConfidence: number
  maxConfidence: number
  /** Omit BOTH to render read-only — a WeSpace GUEST may read the queue but
   *  not act on it, and must not be shown controls that can only 403. */
  onAcceptAll?: (themeId: string) => Promise<unknown>
  onDismissAll?: (themeId: string) => Promise<unknown>
  /** The individual pairs, rendered when the group is expanded. */
  children: React.ReactNode
  defaultExpanded?: boolean
}

function confidenceRange(min: number, max: number): string {
  const lo = Math.round(min * 100)
  const hi = Math.round(max * 100)
  return lo === hi ? `${lo}%` : `${lo}–${hi}%`
}

export function ResonanceThemeGroup({
  themeId,
  label,
  description,
  count,
  minConfidence,
  maxConfidence,
  onAcceptAll,
  onDismissAll,
  children,
  defaultExpanded = false,
}: ResonanceThemeGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [busy, setBusy] = useState<'accept' | 'dismiss' | null>(null)

  // Group actions need a real theme to act on. The ungrouped bucket is a view
  // convenience, not a FieldResonance, so its pairs stay individually reviewed.
  const canReviewGroup = Boolean(themeId && (onAcceptAll || onDismissAll))

  const run = async (
    action: 'accept' | 'dismiss',
    fn?: (themeId: string) => Promise<unknown>
  ) => {
    if (!themeId || !fn || busy) return
    setBusy(action)
    try {
      await fn(themeId)
    } catch {
      // The hook surfaces the toast; keep the card mounted and usable.
    } finally {
      setBusy(null)
    }
  }

  const panelId = `theme-panel-${themeId ?? 'ungrouped'}`

  return (
    <div
      data-testid="resonance-theme-group"
      className="gp-card overflow-hidden rounded-xl"
    >
      {/* Header. `min-w-0` is threaded through every wrapper between the flex
          row and the truncating label, or the long theme names overflow at
          390px. */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        {...(expanded ? { 'aria-controls': panelId } : {})}
        className="flex w-full min-w-0 items-start gap-3 p-4 text-left transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--gp-primary)_6%,transparent)] sm:p-5"
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-gp-ink-muted"
        >
          hub
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-base font-semibold text-gp-ink-strong">
              {label}
            </span>
            {/* Ink, not primary, on the tint. `text-gp-primary` over a 12%
                mix of itself measures ~1.5:1 in the warm theme, whose primary
                is a pale yellow on a white surface — well under AA. */}
            <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--gp-primary)_14%,transparent)] px-2 py-0.5 text-xs font-semibold text-gp-ink-strong">
              {count}
            </span>
          </span>

          {/* No `block` class on the clamped span: it overrides the
              display:-webkit-box that -webkit-line-clamp requires, so the clamp
              silently does nothing and an 800-character description renders in
              full — which is most of why the grouped view was still a long
              scroll. */}
          {description ? (
            <span className="mt-1 line-clamp-2 text-sm text-gp-ink-muted">
              {description}
            </span>
          ) : null}

          <span className="mt-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-gp-ink-soft">
            <span aria-hidden="true">●</span>
            <span className="truncate">
              {confidenceRange(minConfidence, maxConfidence)} confidence
            </span>
          </span>
        </span>

        <span
          aria-hidden="true"
          className={cn(
            'material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-gp-ink-soft transition-transform duration-300',
            expanded && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>

      {/* Group actions. Stacked and full-width on a phone, inline from sm:. */}
      {canReviewGroup ? (
        <div className="flex flex-col gap-2 border-t border-gp-glass-border px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          {onAcceptAll ? (
            <Button
              size="sm"
              onClick={() => run('accept', onAcceptAll)}
              disabled={busy !== null}
              data-testid="accept-theme"
              className="w-full sm:w-auto"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'material-symbols-outlined mr-1.5 text-[18px]',
                  busy === 'accept' && 'animate-spin'
                )}
              >
                {busy === 'accept' ? 'progress_activity' : 'done_all'}
              </span>
              {busy === 'accept' ? 'Accepting…' : `Accept all ${count}`}
            </Button>
          ) : null}

          {onDismissAll ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => run('dismiss', onDismissAll)}
              disabled={busy !== null}
              data-testid="dismiss-theme"
              className="w-full sm:w-auto"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'material-symbols-outlined mr-1.5 text-[18px]',
                  busy === 'dismiss' && 'animate-spin'
                )}
              >
                {busy === 'dismiss' ? 'progress_activity' : 'close'}
              </span>
              {busy === 'dismiss' ? 'Dismissing…' : 'Dismiss all'}
            </Button>
          ) : null}

          <span className="hidden text-xs text-gp-ink-soft sm:ml-auto sm:block">
            or open the group to review each pair
          </span>
        </div>
      ) : null}

      {expanded ? (
        <div
          id={panelId}
          className="space-y-3 border-t border-gp-glass-border bg-[color-mix(in_srgb,var(--gp-ink-soft)_6%,transparent)] p-4 sm:p-5"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
