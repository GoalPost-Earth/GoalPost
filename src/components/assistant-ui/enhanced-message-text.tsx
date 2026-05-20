'use client'

import {
  useMessagePartText,
  TextMessagePartProvider,
} from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import { PersonCard, PersonProfileData } from './person-card'
import { memo, useEffect, useMemo, useRef } from 'react'
import remarkGfm from 'remark-gfm'
import { useBloomOverlay } from '@/components/studio/bloom-overlay-context'
import { useStudioCanvas } from '@/components/studio/studio-canvas-context'
import type {
  NVLNode,
  NVLRelationship,
} from '@/lib/cypher-generator/types'

/**
 * Custom text message part component.
 *
 * Detects two server-emitted markers in the streamed assistant text:
 *   - `PERSON_PROFILE_FOUND: {…}` → render a PersonCard inline.
 *   - `BLOOM_GRAPH_OVERLAY: {…}`  → push the payload into the Bloom
 *     overlay context and switch the canvas to Bloom. The marker
 *     itself is stripped from the visible text so the user sees only
 *     the model's natural-language summary.
 *
 * Why a marker rather than a tool-result subscriber: the assistant-ui
 * runtime renders tool calls/results inside the message bubble, but
 * has no clean side-channel into sibling React contexts. The marker
 * pattern is the same hook PersonCard already uses — proven and
 * isolated.
 */

interface MarkerExtraction {
  json: string
  endIndex: number
}

/**
 * Find the next balanced JSON object inside `text` that starts at or
 * after `searchFrom`. Skips strings + escaped quotes correctly. Returns
 * null when no closing brace is found (streaming is still in flight).
 */
function extractBalancedJson(
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

interface BloomOverlayPayload {
  summary: string
  nodes: NVLNode[]
  relationships: NVLRelationship[]
}

function parseBloomPayload(raw: string): BloomOverlayPayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<BloomOverlayPayload>
    if (
      typeof parsed.summary !== 'string' ||
      !Array.isArray(parsed.nodes) ||
      !Array.isArray(parsed.relationships)
    ) {
      return null
    }
    return parsed as BloomOverlayPayload
  } catch (error) {
    console.warn('[enhanced-message-text] Failed to parse Bloom payload:', error)
    return null
  }
}

const PERSON_MARKER = 'PERSON_PROFILE_FOUND:'
const BLOOM_MARKER = 'BLOOM_GRAPH_OVERLAY:'

/**
 * Strip every well-formed marker + JSON block of `marker` from `text`.
 * Markers whose JSON isn't yet closed (mid-stream) are left alone so the
 * partial token doesn't briefly flash before being cleaned up.
 */
function stripMarker(text: string, marker: string): string {
  if (!text.includes(marker)) return text
  let cleaned = text
  let cursor = cleaned.indexOf(marker)
  while (cursor !== -1) {
    const extraction = extractBalancedJson(cleaned, cursor + marker.length)
    if (!extraction) break
    cleaned =
      cleaned.substring(0, cursor) + cleaned.substring(extraction.endIndex)
    cursor = cleaned.indexOf(marker)
  }
  return cleaned
}

/**
 * Walk through `text` and return every closed JSON payload that follows
 * `marker`. Used by the Bloom side-effect that pushes overlays into
 * context — we want every overlay the model emitted, not just the
 * first.
 */
function collectPayloads(text: string, marker: string): string[] {
  const payloads: string[] = []
  let cursor = text.indexOf(marker)
  while (cursor !== -1) {
    const extraction = extractBalancedJson(text, cursor + marker.length)
    if (!extraction) break
    payloads.push(extraction.json)
    cursor = text.indexOf(marker, extraction.endIndex)
  }
  return payloads
}

interface ParsedElement {
  type: 'text' | 'person'
  content: string | PersonProfileData
}

/**
 * Split `rawText` on PERSON_PROFILE_FOUND markers (keeping the existing
 * inline-PersonCard render behavior). The Bloom marker is handled
 * separately as a side effect — it has no inline visual.
 */
function parsePersonElements(rawText: string, cleaned: string): ParsedElement[] {
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

export const EnhancedTextPart = memo(function EnhancedTextPart() {
  const { text: rawTextContent, status } = useMessagePartText()
  const isRunning = status.type === 'running'

  const { setOverlay } = useBloomOverlay()
  const { setCanvasView, setCanvasOpen } = useStudioCanvas()
  const appliedBloomPayloadsRef = useRef<Set<string>>(new Set())

  // Strip both marker types from the visible text. Person markers are
  // still split out below so PersonCard can render inline.
  const personStripped = useMemo(
    () => stripMarker(rawTextContent, PERSON_MARKER),
    [rawTextContent]
  )
  const textContent = useMemo(
    () => stripMarker(personStripped, BLOOM_MARKER).trim(),
    [personStripped]
  )

  // Bloom-overlay side effect — runs whenever a fresh BLOOM_GRAPH_OVERLAY
  // payload appears. Dedup via a ref-tracked set keyed on the raw JSON
  // string so re-renders during streaming don't push the same overlay
  // twice.
  useEffect(() => {
    if (!rawTextContent.includes(BLOOM_MARKER)) return
    const payloads = collectPayloads(rawTextContent, BLOOM_MARKER)
    for (const raw of payloads) {
      if (appliedBloomPayloadsRef.current.has(raw)) continue
      appliedBloomPayloadsRef.current.add(raw)
      const parsed = parseBloomPayload(raw)
      if (!parsed) continue
      setOverlay({
        summary: parsed.summary,
        nodes: parsed.nodes,
        relationships: parsed.relationships,
      })
      setCanvasOpen(true)
      setCanvasView('bloom')
    }
  }, [rawTextContent, setOverlay, setCanvasView, setCanvasOpen])

  const parsedContent = useMemo(
    () => parsePersonElements(personStripped, textContent),
    [personStripped, textContent]
  )

  const hasPersonProfile = parsedContent.some((el) => el.type === 'person')

  if (hasPersonProfile) {
    return (
      <div className="space-y-3">
        {parsedContent.map((element, index) => {
          if (element.type === 'person') {
            return (
              <PersonCard
                key={`person-${index}`}
                person={element.content as PersonProfileData}
                className="my-2"
              />
            )
          }
          const txt = (element.content as string).trim()
          if (!txt) return null
          return (
            <div
              key={`text-${index}`}
              className="prose prose-sm dark:prose-invert max-w-none"
            >
              {txt}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <TextMessagePartProvider text={textContent} isRunning={isRunning}>
      <MarkdownTextPrimitive remarkPlugins={[remarkGfm]} className="aui-md" />
    </TextMessagePartProvider>
  )
})
