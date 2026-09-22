'use client'

import { ResonanceSuggestionItem } from '@/components/ui/resonance-suggestion-item'
import { ResonanceThemeGroup } from '@/components/ui/resonance-theme-group'
import type { SuggestionGroup } from '@/lib/resonance/group-suggestions'

/**
 * The review queue's body: either one card per theme, or a flat list of pairs.
 *
 * Split out of the review modal so that modal stays inside the 400-line rule,
 * and so the two renderings sit side by side where it is obvious they must
 * offer the same per-pair controls.
 */

interface ListSuggestion {
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
  themeId?: string | null
  themeLabel?: string | null
}

interface ResonanceSuggestionListProps {
  grouped: boolean
  groups: SuggestionGroup<
    ListSuggestion & { themeId: string | null; themeLabel: string | null }
  >[]
  suggestions: ListSuggestion[]
  actionLoadingId?: string | null
  /** Omit BOTH to render read-only (a WeSpace GUEST may read but not act). */
  onAccept?: (id: string) => Promise<void>
  onDecline?: (id: string) => Promise<void>
  onReviewTheme?: (
    themeId: string,
    action: 'accept' | 'decline'
  ) => Promise<number | void>
}

export function ResonanceSuggestionList({
  grouped,
  groups,
  suggestions,
  actionLoadingId,
  onAccept,
  onDecline,
  onReviewTheme,
}: ResonanceSuggestionListProps) {
  const renderItem = (suggestion: ListSuggestion, showDescription: boolean) => (
    <ResonanceSuggestionItem
      key={suggestion.id}
      id={suggestion.id}
      label={suggestion.label}
      // Inside a group the header already carries the shared paragraph;
      // repeating it on every pair is the duplication this view removes.
      description={showDescription ? suggestion.description : ''}
      confidence={suggestion.confidence}
      evidence={suggestion.evidence}
      sourcePulseId={suggestion.sourcePulseId}
      sourcePulseContent={suggestion.sourcePulseContent}
      targetPulseId={suggestion.targetPulseId}
      targetPulseContent={suggestion.targetPulseContent}
      contextTitle={suggestion.contextTitle}
      onAccept={onAccept}
      onDecline={onDecline}
      isLoading={actionLoadingId === suggestion.id}
    />
  )

  if (!grouped) {
    return (
      <div className="space-y-4">
        {suggestions.map((suggestion) => renderItem(suggestion, true))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <ResonanceThemeGroup
          key={group.themeId ?? 'ungrouped'}
          themeId={group.themeId}
          label={group.label}
          description={group.description}
          count={group.count}
          minConfidence={group.minConfidence}
          maxConfidence={group.maxConfidence}
          onAcceptAll={
            onReviewTheme
              ? (themeId) => onReviewTheme(themeId, 'accept')
              : undefined
          }
          onDismissAll={
            onReviewTheme
              ? (themeId) => onReviewTheme(themeId, 'decline')
              : undefined
          }
        >
          {group.suggestions.map((suggestion) => renderItem(suggestion, false))}
        </ResonanceThemeGroup>
      ))}
    </div>
  )
}
