/**
 * Pure helpers for the inline "capture and resonate" cards (conversation↔pulse).
 * Mirrors resonance-suggestions-helpers.ts: the result-shape guard and a
 * sessionStorage-backed decision store, scoped with its own key prefix so it
 * never collides with pulse / connection / resonance suggestion keys. Reuses the
 * shared ResonanceStrength + strengthLabel from resonance-suggestions-helpers.
 */

import type { NodeType } from '@/lib/pulse-type-config'
import type { ResonanceStrength } from './resonance-suggestions-helpers'

export type Decision = 'pending' | 'accepted' | 'dismissed'

export interface ResonantPulseSuggestionShape {
  /** Title of the new pulse to capture from the dialogue. */
  newPulseName?: string
  /** Living-system type key of the new pulse (goal/resource/story/care/value). */
  newPulseType?: string
  /** User-facing label for the new pulse's type chip. */
  newPulseTypeLabel?: string
  /** Title of the existing pulse it resonates with. */
  existingPulseName?: string
  /** Short theme of the resonance. */
  label?: string | null
  /** One-line plain-words description of why they resonate. */
  why?: string | null
  /** Qualitative strength — never a raw score (Rule 1, kb/07). */
  strength?: ResonanceStrength
  /** Short verbatim quote from the dialogue. */
  sourceSnippet?: string | null
  writeTool?: 'create_resonant_pulse'
  /** Carries the resolved existing-pulse id + new-pulse args — never rendered. */
  createArgs?: Record<string, unknown>
}

interface ResonantPulseSuggestionsResultShape {
  status?: string
  suggestions?: ResonantPulseSuggestionShape[]
}

export function isResonantPulseSuggestionsResult(
  result: unknown
): result is ResonantPulseSuggestionsResultShape {
  if (!result || typeof result !== 'object') return false
  const r = result as ResonantPulseSuggestionsResultShape
  return Array.isArray(r.suggestions)
}

/**
 * Map a suggestion type key to the pulse-type-config NodeType (the config uses
 * `coreValue`, suggestions use `value`). Returns null for an unknown key so the
 * caller can fall back to a neutral chip rather than crash.
 */
export function suggestionTypeToNodeType(
  type: string | undefined
): NodeType | null {
  switch (type) {
    case 'goal':
      return 'goal'
    case 'resource':
      return 'resource'
    case 'story':
      return 'story'
    case 'care':
      return 'care'
    case 'value':
      return 'coreValue'
    default:
      return null
  }
}

function decisionStorageKey(turnId: string, index: number): string {
  return `gp:resonant-pulse-suggestion:${turnId}:${index}`
}

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
