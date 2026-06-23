/**
 * Pure helpers for the inline connection-suggestion cards. Mirrors
 * pulse-suggestions-helpers.ts (kept out of the component file so the renderer
 * stays under the 400-line component limit, CLAUDE.md): the result-shape guard
 * and a sessionStorage-backed accept/dismiss decision store, scoped to
 * connection suggestions so it never collides with pulse-suggestion keys.
 */

export type Decision = 'pending' | 'accepted' | 'dismissed'

export interface ConnectionSuggestionShape {
  /** Display label — the other person's name, or "Ada ↔ Ben". */
  name?: string
  /** The relationship in the user's words, inferred from the dialogue. */
  why?: string | null
  sourceSnippet?: string | null
  writeTool?: 'create_connection'
  /** Carries resolved person ids (internal) — never rendered. */
  createArgs?: Record<string, unknown>
}

interface ConnectionSuggestionsResultShape {
  status?: string
  suggestions?: ConnectionSuggestionShape[]
}

export function isConnectionSuggestionsResult(
  result: unknown
): result is ConnectionSuggestionsResultShape {
  if (!result || typeof result !== 'object') return false
  const r = result as ConnectionSuggestionsResultShape
  return Array.isArray(r.suggestions)
}

function decisionStorageKey(turnId: string, index: number): string {
  return `gp:connection-suggestion:${turnId}:${index}`
}

/**
 * Read a persisted accept/dismiss decision. Decisions persist in sessionStorage
 * keyed by (turnId, index) so a reload can't re-fire an already-accepted
 * suggestion (which would create a duplicate connection).
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
