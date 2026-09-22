'use client'

import { Button } from '@/components/ui/button'
import { ResonanceSuggestionItem } from '@/components/ui/resonance-suggestion-item'

/**
 * One-pair-at-a-time review, with progress and prev/next.
 *
 * Kept alongside the grouped queue rather than replaced by it: grouping is what
 * makes a 117-suggestion import tractable, but a reviewer who wants to weigh
 * each pair individually should still be able to, and the Accepted/Declined
 * tabs have no groups to offer.
 *
 * Split out of the review modal to keep that file inside the 400-line rule.
 */

interface CarouselSuggestion {
  id: string
  label: string
  description: string
  confidence: number
  evidence: string
  sourcePulseId: string
  sourcePulseContent: string
  targetPulseId: string
  targetPulseContent: string
  contextTitle: string
}

interface ResonanceReviewCarouselProps {
  suggestion: CarouselSuggestion
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  onExit: () => void
  /** Omit BOTH to render read-only (a WeSpace GUEST may read but not act). */
  onAccept?: (id: string) => Promise<void>
  onDecline?: (id: string) => Promise<void>
  isLoading?: boolean
}

export function ResonanceReviewCarousel({
  suggestion,
  index,
  total,
  onPrev,
  onNext,
  onExit,
  onAccept,
  onDecline,
  isLoading = false,
}: ResonanceReviewCarouselProps) {
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-gp-ink-muted">
          Reviewing {index + 1} of {total}
        </span>
        {/* Narrower on a phone so the label keeps its room. */}
        <div className="h-1 w-20 shrink-0 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--gp-ink-soft)_25%,transparent)] sm:w-32">
          <div
            className="h-full bg-gp-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ResonanceSuggestionItem
        id={suggestion.id}
        label={suggestion.label}
        description={suggestion.description}
        confidence={suggestion.confidence}
        evidence={suggestion.evidence}
        sourcePulseId={suggestion.sourcePulseId}
        sourcePulseContent={suggestion.sourcePulseContent}
        targetPulseId={suggestion.targetPulseId}
        targetPulseContent={suggestion.targetPulseContent}
        contextTitle={suggestion.contextTitle}
        // Undefined when the viewer lacks `canEditContent` — the item then
        // renders read-only rather than showing controls the accept/decline
        // routes would reject (kb/02-user-roles.md).
        onAccept={onAccept}
        onDecline={onDecline}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-between gap-2 border-t border-gp-glass-border pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={index === 0}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            chevron_left
          </span>
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Back to list
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={index >= total - 1}
        >
          <span className="hidden sm:inline">Next</span>
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            chevron_right
          </span>
        </Button>
      </div>
    </div>
  )
}
