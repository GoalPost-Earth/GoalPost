/**
 * Group resonance suggestions by the theme they express.
 *
 * Pure and UI-free so the grouping rule can be tested without mounting the
 * review modal, and so any future surface (an export, the assistant) groups
 * identically.
 *
 * Discovery writes one FieldResonance per theme and points every pair at it,
 * but the pair ALSO still carries its own copy of the theme's label and
 * description. That copy is what this reads for display, so a suggestion
 * written before themes existed still renders with its label intact.
 */

export interface GroupableSuggestion {
  id: string
  label: string
  description: string
  confidence: number
  themeId: string | null
  themeLabel: string | null
}

export interface SuggestionGroup<T extends GroupableSuggestion> {
  /** FieldResonance id, or null for the catch-all bucket. */
  themeId: string | null
  label: string
  description: string
  suggestions: T[]
  count: number
  minConfidence: number
  maxConfidence: number
}

/** Bucket for pairs with no theme edge — never hidden, only sorted last. */
export const UNGROUPED_LABEL = 'Ungrouped'

/**
 * Suggestions in, groups out — ordered largest first, with the ungrouped
 * bucket always last.
 *
 * Biggest-first because the reviewer's time is the scarce thing: the 31-pair
 * theme is where one decision saves the most, so it should not be buried under
 * a run of single-pair groups.
 *
 * Grouping is by `themeId` and NOT by label: two Spaces, or two concurrent
 * sweeps, can produce separate nodes with the same name, and silently merging
 * them would let one "Accept all" button imply authority over pairs its
 * theme-scoped request will not actually touch.
 */
export function groupSuggestionsByTheme<T extends GroupableSuggestion>(
  suggestions: T[]
): SuggestionGroup<T>[] {
  const byTheme = new Map<string, SuggestionGroup<T>>()

  for (const suggestion of suggestions) {
    // Distinguish "no theme" from a theme whose id is the empty string.
    const key = suggestion.themeId ?? '\u0000ungrouped'
    const existing = byTheme.get(key)

    if (existing) {
      existing.suggestions.push(suggestion)
      existing.count += 1
      existing.minConfidence = Math.min(
        existing.minConfidence,
        suggestion.confidence
      )
      existing.maxConfidence = Math.max(
        existing.maxConfidence,
        suggestion.confidence
      )
      // Prefer any non-empty description we come across: a theme write can
      // fail for one pair and succeed for the next, and an empty header reads
      // as a bug rather than as missing data.
      if (!existing.description && suggestion.description) {
        existing.description = suggestion.description
      }
      // Same for the label: a group whose first pair carried a blank theme
      // label should still show the real name once a later pair supplies it.
      if (
        existing.themeId !== null &&
        existing.label === UNGROUPED_LABEL &&
        suggestion.themeLabel?.trim()
      ) {
        existing.label = suggestion.themeLabel.trim()
      }
      continue
    }

    byTheme.set(key, {
      themeId: suggestion.themeId ?? null,
      // A themeless pair is NOT a theme. Falling back to its own label named
      // the catch-all bucket after whichever pair happened to land first, so a
      // pile of unrelated pairs rendered as a group called "Ethics as Practice"
      // with one arbitrary paragraph presented as describing all of them.
      //
      // Tested for null/undefined, not truthiness: '' is a real theme id here,
      // same as in the grouping key below.
      label:
        suggestion.themeId !== null && suggestion.themeId !== undefined
          ? suggestion.themeLabel?.trim() ||
            suggestion.label?.trim() ||
            UNGROUPED_LABEL
          : UNGROUPED_LABEL,
      description: suggestion.description ?? '',
      suggestions: [suggestion],
      count: 1,
      minConfidence: suggestion.confidence,
      maxConfidence: suggestion.confidence,
    })
  }

  return [...byTheme.values()].sort((a, b) => {
    // Ungrouped last, whatever its size.
    if (a.themeId === null && b.themeId !== null) return 1
    if (b.themeId === null && a.themeId !== null) return -1
    if (b.count !== a.count) return b.count - a.count
    return a.label.localeCompare(b.label)
  })
}
