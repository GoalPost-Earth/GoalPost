/**
 * Pure helpers for the inline resonance-suggestion cards. Mirrors
 * connection-suggestions-helpers.ts (kept out of the component file so the
 * renderer stays under the 400-line component limit, CLAUDE.md): the
 * result-shape guard and a sessionStorage-backed accept/dismiss decision store,
 * scoped to resonance suggestions so it never collides with pulse- or
 * connection-suggestion keys.
 */

export type Decision = 'pending' | 'accepted' | 'dismissed'

export type ResonanceStrength = 'loose' | 'moderate' | 'strong'

export interface ResonanceSuggestionShape {
  /** Display label for the first pulse (its title). */
  sourceName?: string
  /** Display label for the second pulse (its title). */
  targetName?: string
  /** Short theme of the resonance ("a shared sense of belonging"). */
  label?: string | null
  /** One-line plain-words description of why the two resonate. */
  why?: string | null
  /** Qualitative strength — never a raw score (Rule 1, kb/07). */
  strength?: ResonanceStrength
  /** Short verbatim quote from the dialogue that surfaced the resonance. */
  sourceSnippet?: string | null
  writeTool?: 'create_resonance'
  /** Carries resolved pulse ids + contextId (internal) — never rendered. */
  createArgs?: Record<string, unknown>
}

interface ResonanceSuggestionsResultShape {
  status?: string
  suggestions?: ResonanceSuggestionShape[]
}

export function isResonanceSuggestionsResult(
  result: unknown
): result is ResonanceSuggestionsResultShape {
  if (!result || typeof result !== 'object') return false
  const r = result as ResonanceSuggestionsResultShape
  return Array.isArray(r.suggestions)
}

/** Human-readable label for a qualitative strength ("strong resonance"). */
export function strengthLabel(strength: ResonanceStrength | undefined): string {
  switch (strength) {
    case 'strong':
      return 'strong'
    case 'loose':
      return 'loose'
    case 'moderate':
    default:
      return 'moderate'
  }
}

function decisionStorageKey(turnId: string, index: number): string {
  return `gp:resonance-suggestion:${turnId}:${index}`
}

/**
 * Read a persisted accept/dismiss decision. Decisions persist in sessionStorage
 * keyed by (turnId, index) so a reload can't re-fire an already-accepted
 * suggestion (which would attempt a duplicate resonance — idempotent server-side
 * anyway, but the UI should stay settled).
 */
export function readStoredDecision(
  turnId: string | null,
  index: number
): Decision {
  if (!turnId || typeof window === 'undefined') return 'pending'
  try {
    const v = window.sessionStorage.getItem(decisionStorageKey(turnId, index))
    return v === 'accepted' || v === 'dismissed' ? v : 'pending'
  } catch {
    return 'pending'
  }
}

export function persistDecision(
  turnId: string | null,
  index: number,
  decision: Decision
): void {
  if (!turnId || typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(decisionStorageKey(turnId, index), decision)
  } catch {
    // sessionStorage may be unavailable (private mode quota) — decisions then
    // live only in component state, which is acceptable.
  }
}
