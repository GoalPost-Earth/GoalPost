import { PULSE_TYPE_CONFIG } from '@/lib/pulse-type-config'

/**
 * Pure helpers for the inline pulse-suggestion cards (GOAL-272). Kept out of
 * the component file so the renderer stays under the 400-line component limit
 * (CLAUDE.md): per-type visuals, the result-shape guard, and the
 * sessionStorage-backed accept/dismiss decision store.
 */

export type Decision = 'pending' | 'accepted' | 'dismissed'

export type SuggestionTypeKey =
  | 'person'
  | 'goal'
  | 'resource'
  | 'story'
  | 'care'
  | 'value'

/**
 * Per-type icon + themed color. Pulse types come from the single source of
 * truth (pulse-type-config); person has no pulse-type entry, so it uses the
 * primary brand color + a person glyph.
 */
const TYPE_VISUALS: Record<
  SuggestionTypeKey,
  { icon: string; colorClass: string; cssVar: string }
> = {
  person: {
    icon: 'person',
    colorClass: 'text-gp-primary',
    cssVar: '--gp-primary',
  },
  goal: {
    icon: PULSE_TYPE_CONFIG.goal.icon,
    colorClass: PULSE_TYPE_CONFIG.goal.color,
    cssVar: PULSE_TYPE_CONFIG.goal.cssVar,
  },
  resource: {
    icon: PULSE_TYPE_CONFIG.resource.icon,
    colorClass: PULSE_TYPE_CONFIG.resource.color,
    cssVar: PULSE_TYPE_CONFIG.resource.cssVar,
  },
  story: {
    icon: PULSE_TYPE_CONFIG.story.icon,
    colorClass: PULSE_TYPE_CONFIG.story.color,
    cssVar: PULSE_TYPE_CONFIG.story.cssVar,
  },
  care: {
    icon: PULSE_TYPE_CONFIG.care.icon,
    colorClass: PULSE_TYPE_CONFIG.care.color,
    cssVar: PULSE_TYPE_CONFIG.care.cssVar,
  },
  value: {
    icon: PULSE_TYPE_CONFIG.coreValue.icon,
    colorClass: PULSE_TYPE_CONFIG.coreValue.color,
    cssVar: PULSE_TYPE_CONFIG.coreValue.cssVar,
  },
}

export function visualsFor(type: string): {
  icon: string
  colorClass: string
  cssVar: string
} {
  return TYPE_VISUALS[type as SuggestionTypeKey] ?? TYPE_VISUALS.person
}

export interface PulseSuggestionShape {
  name?: string
  type?: string
  typeLabel?: string
  sourceSnippet?: string | null
  writeTool?: 'create_person' | 'create_pulse'
  createArgs?: Record<string, unknown>
}

interface SuggestionsResultShape {
  status?: string
  suggestions?: PulseSuggestionShape[]
  fieldContextTitle?: string | null
}

export function isSuggestionsResult(
  result: unknown
): result is SuggestionsResultShape {
  if (!result || typeof result !== 'object') return false
  const r = result as SuggestionsResultShape
  return Array.isArray(r.suggestions)
}

function decisionStorageKey(turnId: string, index: number): string {
  return `gp:pulse-suggestion:${turnId}:${index}`
}

/**
 * Read a persisted accept/dismiss decision. Decisions persist in sessionStorage
 * keyed by (turnId, index) so a reload can't re-fire an already-accepted
 * suggestion (which would create a duplicate).
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
