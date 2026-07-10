/**
 * Pure marker-stripping helpers for the assistant's streamed text.
 *
 * The assistant embeds machine-readable markers in its reply text that the UI
 * turns into inline rendering rather than prose:
 *   - `PERSON_PROFILE_FOUND: {…}` → render a PersonCard inline.
 *   - `BLOOM_GRAPH_OVERLAY: {…}`  → stripped from the visible bubble ONLY. The
 *     Bloom canvas overlay is applied from the `query_for_bloom` tool RESULT in
 *     `BloomOverlayToolPart`, never parsed from this text (kb/07 Rule 3) — so
 *     here the marker is just hidden so any stray JSON the model emits doesn't
 *     leak into the bubble.
 *
 * These functions are deliberately React-free and side-effect-free so they can
 * be unit-tested in isolation (`marker-strip.test.ts`). `EnhancedTextPart`
 * consumes them to compute the visible bubble text.
 */

import type { PersonProfileData } from './person-card'

export const PERSON_MARKER = 'PERSON_PROFILE_FOUND:'
export const BLOOM_MARKER = 'BLOOM_GRAPH_OVERLAY:'

export interface MarkerExtraction {
  json: string
  endIndex: number
}

/**
 * Find the next balanced JSON object inside `text` that starts at or after
 * `searchFrom`. Skips strings + escaped quotes correctly. Returns null when no
 * closing brace is found (streaming is still in flight).
 */
export function extractBalancedJson(
  text: string,
  searchFrom: number
): MarkerExtraction | null {
  const braceStart = text.indexOf('{', searchFrom)
  if (braceStart === -1) return null

  let braceCount = 0
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
    if (ch === '{') braceCount++
    else if (ch === '}') {
      braceCount--
      if (braceCount === 0) {
        return { json: text.substring(braceStart, i + 1), endIndex: i + 1 }
      }
    }
  }
  return null
}

/**
 * Strip every well-formed marker + JSON block of `marker` from `text`.
 *
 * `hideIncomplete` controls what happens to a marker whose JSON hasn't
 * finished streaming yet (braces not balanced) or that the model never closes:
 *   - false (the PERSON default) — the partial token is left in place, the
 *     historical behavior.
 *   - true (the BLOOM case, GOAL-280) — everything from the marker to the end
 *     of the available text is hidden, and a trailing partial *prefix* of the
 *     marker token is trimmed too. This keeps the raw overlay payload (the
 *     "Bloom/NVL query code") from flashing into the visible bubble mid-stream
 *     and then vanishing once it completes. Hiding the payload here is purely
 *     cosmetic and never blocks the canvas render: the overlay is applied from
 *     the `query_for_bloom` tool RESULT (`BloomOverlayToolPart`), independent of
 *     this text — nothing reads the unstripped marker for data anymore.
 */
export function stripMarker(
  text: string,
  marker: string,
  hideIncomplete = false
): string {
  if (!text.includes(marker)) {
    return hideIncomplete ? stripTrailingPartialMarker(text, marker) : text
  }
  let cleaned = text
  let cursor = cleaned.indexOf(marker)
  while (cursor !== -1) {
    const extraction = extractBalancedJson(cleaned, cursor + marker.length)
    if (!extraction) {
      // JSON still streaming in (or never closed). For hide-incomplete
      // markers, drop everything from the marker onward so the partial
      // payload is never shown; otherwise leave it untouched.
      if (hideIncomplete) cleaned = cleaned.substring(0, cursor)
      break
    }
    cleaned =
      cleaned.substring(0, cursor) + cleaned.substring(extraction.endIndex)
    cursor = cleaned.indexOf(marker)
  }
  return hideIncomplete ? stripTrailingPartialMarker(cleaned, marker) : cleaned
}

/**
 * Hide a trailing partial prefix of `marker` (e.g. the model has streamed
 * "BLOOM_GRAPH_OVER" but not the full token yet) so the marker name itself
 * doesn't flash before its JSON arrives. Only trims prefixes of `minLen`+
 * characters so it can never clip ordinary prose that merely ends in a common
 * letter.
 *
 * Safety depends on the marker: the default `minLen` of 6 is unambiguous for
 * `BLOOM_GRAPH_OVERLAY:` (its 6-char prefix is "BLOOM_", which never appears in
 * prose) but NOT for a marker whose 6-char prefix is a real word — e.g.
 * `PERSON_PROFILE_FOUND:` → "PERSON". Only ever call this (via
 * `stripMarker(..., hideIncomplete=true)`) for markers whose prefix is
 * unambiguous, or raise `minLen` past the first underscore for that marker.
 */
export function stripTrailingPartialMarker(
  text: string,
  marker: string,
  minLen = 6
): string {
  const max = Math.min(marker.length - 1, text.length)
  for (let len = max; len >= minLen; len--) {
    if (text.endsWith(marker.substring(0, len))) {
      return text.substring(0, text.length - len)
    }
  }
  return text
}

export interface ParsedElement {
  type: 'text' | 'person'
  content: string | PersonProfileData
}

/**
 * Split `rawText` on PERSON_PROFILE_FOUND markers so each person profile can
 * render as an inline PersonCard and the surrounding prose as markdown.
 *
 * IMPORTANT: `rawText` must still CONTAIN the PERSON markers — pass the
 * Bloom-stripped (but not person-stripped) text. Passing already-person-
 * stripped text leaves nothing to split on and silently drops every card.
 * `cleaned` is the fully-stripped fallback returned when no marker is present.
 * The Bloom marker is handled separately as a side effect — it has no inline
 * visual.
 */
export function parsePersonElements(
  rawText: string,
  cleaned: string
): ParsedElement[] {
  const elements: ParsedElement[] = []
  const parts = rawText.split(PERSON_MARKER)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (i === 0) {
      if (part.trim()) elements.push({ type: 'text', content: part.trim() })
      continue
    }
    const trimmed = part.trimStart()
    if (trimmed.startsWith('{')) {
      const extraction = extractBalancedJson(trimmed, 0)
      if (extraction) {
        try {
          const person = JSON.parse(extraction.json) as PersonProfileData
          elements.push({ type: 'person', content: person })
        } catch (err) {
          console.error('Failed to parse person JSON:', err)
        }
        const remainder = trimmed.substring(extraction.endIndex).trim()
        if (remainder) elements.push({ type: 'text', content: remainder })
      } else if (trimmed) {
        elements.push({ type: 'text', content: trimmed })
      }
    } else if (trimmed) {
      elements.push({ type: 'text', content: trimmed })
    }
  }
  return elements.length > 0 ? elements : [{ type: 'text', content: cleaned }]
}
