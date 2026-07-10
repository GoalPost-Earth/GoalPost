/**
 * Pure auto-signal detectors for assistant turns.
 *
 * The chat route's `onFinish` callback hands the persisted UIMessagePart[]
 * to these functions and writes one `AssistantFeedback` row per returned
 * signal. Detectors are kept dependency-free so they can be exercised
 * directly in unit tests without spinning up a model or a graph driver.
 *
 * If you add a new signal: keep the surface as a pure function that
 * takes inert inputs and returns plain `AutoSignal` objects.
 */

import type {
  AssistantFeedbackSource,
  AssistantFeedbackRating,
} from './assistant-feedback.service'

export interface AutoSignal {
  source: AssistantFeedbackSource
  rating: AssistantFeedbackRating
  autoSignal: string
  ruleViolated?: string
}

/** Narrow shape of the parts we actually need to inspect. */
interface PartLike {
  type?: string
  text?: unknown
  toolName?: unknown
  isError?: unknown
  output?: unknown
  result?: unknown
}

function asParts(parts: unknown): PartLike[] {
  return Array.isArray(parts) ? (parts as PartLike[]) : []
}

/**
 * Extract the concatenated user-visible text from the parts array. A part
 * counts as text iff `type === 'text'` AND `text` is a non-empty string.
 * Tool-call and reasoning parts are intentionally excluded — they don't
 * render to the user.
 */
export function extractAssistantText(parts: unknown): string {
  return asParts(parts)
    .filter(
      (p): p is PartLike & { text: string } =>
        p?.type === 'text' && typeof p.text === 'string' && p.text.length > 0
    )
    .map((p) => p.text)
    .join('')
}

/**
 * Machine-readable markers the assistant embeds in its text for the UI to turn
 * into side effects (a PersonCard, a Bloom overlay). The frontend STRIPS these
 * marker + JSON blocks before rendering — the raw payloads never reach the
 * person's eyes (see components/assistant-ui/marker-strip.ts). The JSON
 * intentionally carries raw ids / graph labels the UI needs.
 *
 * Order + incomplete-handling MUST mirror the frontend so the detector scans
 * exactly what the reader saw (enhanced-message-text.tsx strips BLOOM first
 * with hideIncomplete=true, then PERSON with hideIncomplete=false):
 *   - BLOOM_GRAPH_OVERLAY: an unclosed/malformed block is dropped from the
 *     marker onward — it never renders, so the detector must not see it.
 *   - PERSON_PROFILE_FOUND: an unclosed/malformed block is LEFT IN PLACE —
 *     the frontend renders the partial as raw text (a genuine Rule-1 leak the
 *     reader saw), so the detector MUST still scan it and flag it. Dropping it
 *     here would hide a real leak.
 */
const UI_MARKERS = [
  { token: 'BLOOM_GRAPH_OVERLAY:', dropIncomplete: true },
  { token: 'PERSON_PROFILE_FOUND:', dropIncomplete: false },
] as const

/**
 * Remove every well-formed `<MARKER>: { …balanced JSON… }` block from `text`,
 * mirroring what the frontend strips before display. Without this, the Rule-1
 * detector scans the un-stripped marker payloads and flags their intentional
 * ids / graph labels as leaks — a false positive that floods the triage
 * dashboard with phantom `auto_rule_violation` rows (GOAL-296). We scan the
 * SAME text a reader would, minus the machine-only payloads.
 */
export function stripUiMarkers(text: string): string {
  let cleaned = text
  for (const { token, dropIncomplete } of UI_MARKERS) {
    let cursor = cleaned.indexOf(token)
    while (cursor !== -1) {
      const braceStart = cleaned.indexOf('{', cursor + token.length)
      const end =
        braceStart === -1 ? -1 : matchBalancedJsonEnd(cleaned, braceStart)
      if (end === -1) {
        // Incomplete / malformed (no `{`, or never closed). Mirror the
        // frontend: BLOOM drops from the marker onward; PERSON is left in
        // place (the reader saw the partial, so keep it for the detector).
        if (dropIncomplete) cleaned = cleaned.substring(0, cursor)
        break
      }
      cleaned = cleaned.substring(0, cursor) + cleaned.substring(end)
      cursor = cleaned.indexOf(token)
    }
  }
  return cleaned
}

/**
 * Return the index just PAST the balanced `}` that closes the object starting
 * at `braceStart`, or -1 if unbalanced. String-aware so a `}` inside a JSON
 * string value doesn't close the object early.
 */
function matchBalancedJsonEnd(text: string, braceStart: number): number {
  let depth = 0
  let inString = false
  let escapeNext = false
  for (let i = braceStart; i < text.length; i++) {
    const ch = text[i]
    if (escapeNext) {
      escapeNext = false
      continue
    }
    if (ch === '\\') {
      escapeNext = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return i + 1
    }
  }
  return -1
}

/**
 * Empty-text detector: no text part produced. Captures the "blank
 * assistant bubble" failure mode that Rule 7 in kb/07-ai-assistant-ux.md
 * exists to prevent — when it leaks through (e.g. a reasoning model
 * returning no text after a tool error), we want a hard signal.
 */
export function detectEmptyText(parts: unknown): AutoSignal[] {
  const text = extractAssistantText(parts)
  if (text.length > 0) return []
  return [
    {
      source: 'auto_empty_text',
      rating: 'negative',
      autoSignal: 'empty_text',
    },
  ]
}

/**
 * Tool-error detector: any tool-result part flagged `isError: true` (the
 * AI SDK v5 convention) or where the result payload itself carries an
 * `error` discriminator.
 *
 * Multiple errored tools in one turn produce one signal per tool — they
 * may indicate independent failure modes worth triaging separately.
 */
export function detectToolErrors(parts: unknown): AutoSignal[] {
  const signals: AutoSignal[] = []
  for (const part of asParts(parts)) {
    const type = typeof part.type === 'string' ? part.type : ''
    // AI SDK v5 marks tool results with type 'tool-<name>' or 'tool-result'.
    // The shape varies a bit between versions; cover both.
    const looksLikeToolResult =
      type === 'tool-result' || type.startsWith('tool-')
    if (!looksLikeToolResult) continue

    const isError = part.isError === true
    const output = part.output ?? part.result
    const outputHasError =
      output !== null &&
      typeof output === 'object' &&
      'error' in (output as Record<string, unknown>) &&
      Boolean((output as Record<string, unknown>).error)

    if (!isError && !outputHasError) continue

    const toolName =
      typeof part.toolName === 'string' && part.toolName.length > 0
        ? part.toolName
        : type.startsWith('tool-')
          ? type.slice('tool-'.length)
          : 'unknown'

    signals.push({
      source: 'auto_tool_error',
      rating: 'negative',
      autoSignal: `tool_error:${toolName}`,
    })
  }
  return signals
}

/**
 * Rule-1 violation detector (kb/07-ai-assistant-ux.md).
 *
 * Patterns we flag in user-visible assistant text:
 *
 *   - Raw entity ids: `me_…`, `ws_…`, `ctx_…`, `pulse_…`, `comm_…`,
 *     `res_…`, `log_…` — followed by ≥6 hex/alphanumeric chars.
 *   - Bare UUIDs anywhere in chat copy.
 *   - The literal `__typename` string.
 *   - Internal graph labels appearing as case-sensitive standalone tokens
 *     (`GoalPulse`, `ResourcePulse`, `StoryPulse`, `FieldContext`,
 *     `WeSpace`, `MeSpace`, `FieldPulse`, `ResonanceLink`). Case
 *     sensitivity is what distinguishes "MeSpace" (leak) from "me space"
 *     (legitimate copy).
 *
 * Returns one signal per distinct violation type so the dashboard can
 * filter / aggregate. Multiple regex hits within the same category
 * collapse to a single signal — we only need to know the rule was broken,
 * not how many times.
 */
const RAW_ID_PATTERN =
  /\b(me|ws|ctx|pulse|comm|res|log|feedback|thread|turn|doc)_[a-zA-Z0-9-]{6,}\b/
const UUID_PATTERN =
  /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/i
const TYPENAME_PATTERN = /\b__typename\b/
const GRAPH_LABEL_PATTERN =
  /\b(GoalPulse|ResourcePulse|StoryPulse|CarePulse|CoreValuePulse|FieldContext|FieldPulse|WeSpace|MeSpace|ResonanceLink|FieldResonance|SpaceMembership|ConversationThread|ConversationTurn|ConversationChunk|AssistantFeedback)\b/

export function detectRuleViolations(text: string): AutoSignal[] {
  if (!text) return []
  const signals: AutoSignal[] = []

  if (RAW_ID_PATTERN.test(text)) {
    signals.push({
      source: 'auto_rule_violation',
      rating: 'negative',
      autoSignal: 'rule_1_raw_id_leak',
      ruleViolated: 'rule_1_raw_id_leak',
    })
  } else if (UUID_PATTERN.test(text)) {
    // Only flag a bare UUID when we didn't already flag a prefixed id —
    // they overlap (`me_<uuid>` matches both) and we want one signal per
    // category, not duplicates.
    signals.push({
      source: 'auto_rule_violation',
      rating: 'negative',
      autoSignal: 'rule_1_uuid_leak',
      ruleViolated: 'rule_1_uuid_leak',
    })
  }

  if (TYPENAME_PATTERN.test(text)) {
    signals.push({
      source: 'auto_rule_violation',
      rating: 'negative',
      autoSignal: 'rule_1_typename_leak',
      ruleViolated: 'rule_1_typename_leak',
    })
  }

  if (GRAPH_LABEL_PATTERN.test(text)) {
    signals.push({
      source: 'auto_rule_violation',
      rating: 'negative',
      autoSignal: 'rule_1_graph_label_leak',
      ruleViolated: 'rule_1_graph_label_leak',
    })
  }

  return signals
}

/**
 * Run every detector against an assistant turn and return the union of
 * signals. The chat route writes one feedback row per returned signal.
 */
export function detectAutoSignals(parts: unknown): AutoSignal[] {
  // Rule-1 detection must run on what the PERSON saw, so strip the machine-only
  // UI marker payloads first (GOAL-296) — otherwise their intentional ids /
  // graph labels register as phantom leaks. Empty-text / tool-error detection
  // work off the raw parts and are unaffected.
  const visibleText = stripUiMarkers(extractAssistantText(parts))
  return [
    ...detectEmptyText(parts),
    ...detectToolErrors(parts),
    ...detectRuleViolations(visibleText),
  ]
}
