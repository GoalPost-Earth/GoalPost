'use client'

import {
  useMessagePartText,
  TextMessagePartProvider,
} from '@assistant-ui/react'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import { defaultComponents } from './markdown-text'
import { PersonCard, PersonProfileData } from './person-card'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Workflow } from 'lucide-react'
import remarkGfm from 'remark-gfm'
import { useBloomOverlay } from '@/components/studio/bloom-overlay-context'
import { useStudioCanvas } from '@/components/studio/studio-canvas-context'
import {
  PERSON_MARKER,
  BLOOM_MARKER,
  stripMarker,
  collectPayloads,
  parsePersonElements,
} from './marker-strip'
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

export const EnhancedTextPart = memo(function EnhancedTextPart() {
  const { text: rawTextContent, status } = useMessagePartText()
  const isRunning = status.type === 'running'

  const { setOverlay } = useBloomOverlay()
  const { setCanvasView, setCanvasOpen } = useStudioCanvas()
  const appliedBloomPayloadsRef = useRef<Set<string>>(new Set())
  // Remember every overlay this message ever carried so the user can
  // re-open it later — the global BloomOverlay context only holds the
  // most recent overlay, which is cleared either by another message or
  // by the "Custom view from chat" chip. Keyed by the raw JSON to dedupe
  // streaming re-renders without re-parsing.
  const [storedOverlays, setStoredOverlays] = useState<BloomOverlayPayload[]>(
    []
  )

  // Hide the Bloom overlay marker first — including a still-streaming or
  // never-closed payload — so the raw NVL JSON never appears in the bubble
  // (GOAL-280). Person markers are stripped next and split out below so
  // PersonCard can still render inline; doing Bloom first means the payload is
  // gone even in the PersonCard branch.
  const bloomStripped = useMemo(
    () => stripMarker(rawTextContent, BLOOM_MARKER, true),
    [rawTextContent]
  )
  const personStripped = useMemo(
    () => stripMarker(bloomStripped, PERSON_MARKER),
    [bloomStripped]
  )
  const textContent = useMemo(() => personStripped.trim(), [personStripped])

  // Bloom-overlay side effect — runs whenever a fresh BLOOM_GRAPH_OVERLAY
  // payload appears. Dedup via a ref-tracked set keyed on the raw JSON
  // string so re-renders during streaming don't push the same overlay
  // twice. Each freshly-seen payload is also pushed onto `storedOverlays`
  // so the message can render a re-open button for it after the global
  // context has moved on.
  useEffect(() => {
    if (!rawTextContent.includes(BLOOM_MARKER)) return
    const payloads = collectPayloads(rawTextContent, BLOOM_MARKER)
    const fresh: BloomOverlayPayload[] = []
    for (const raw of payloads) {
      if (appliedBloomPayloadsRef.current.has(raw)) continue
      appliedBloomPayloadsRef.current.add(raw)
      const parsed = parseBloomPayload(raw)
      if (!parsed) continue
      fresh.push(parsed)
      setOverlay({
        summary: parsed.summary,
        nodes: parsed.nodes,
        relationships: parsed.relationships,
      })
      setCanvasOpen(true)
      setCanvasView('bloom')
    }
    if (fresh.length > 0) {
      setStoredOverlays((prev) => [...prev, ...fresh])
    }
  }, [rawTextContent, setOverlay, setCanvasView, setCanvasOpen])

  const reopenOverlay = useCallback(
    (payload: BloomOverlayPayload) => {
      setOverlay({
        summary: payload.summary,
        nodes: payload.nodes,
        relationships: payload.relationships,
      })
      setCanvasOpen(true)
      setCanvasView('bloom')
    },
    [setOverlay, setCanvasOpen, setCanvasView]
  )

  // Parse person cards off `bloomStripped` (Bloom marker already hidden, PERSON
  // marker still present) — NOT `personStripped`, which has the PERSON marker
  // stripped out, leaving nothing for parsePersonElements to split on (that
  // silently broke card rendering). `textContent` is the fully-stripped
  // fallback when no marker is present.
  const parsedContent = useMemo(
    () => parsePersonElements(bloomStripped, textContent),
    [bloomStripped, textContent]
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
            <TextMessagePartProvider
              key={`text-${index}`}
              text={txt}
              isRunning={isRunning}
            >
              <MarkdownTextPrimitive
                remarkPlugins={[remarkGfm]}
                className="aui-md"
                components={defaultComponents}
              />
            </TextMessagePartProvider>
          )
        })}
        <BloomOverlayButtons overlays={storedOverlays} onOpen={reopenOverlay} />
      </div>
    )
  }

  return (
    <>
      <TextMessagePartProvider text={textContent} isRunning={isRunning}>
        <MarkdownTextPrimitive
          remarkPlugins={[remarkGfm]}
          className="aui-md"
          components={defaultComponents}
        />
      </TextMessagePartProvider>
      <BloomOverlayButtons overlays={storedOverlays} onOpen={reopenOverlay} />
    </>
  )
})

/**
 * Renders a small pill per overlay this message produced. The button
 * re-applies the saved payload (same three actions auto-apply takes
 * during streaming) so the user can return to that specific graph
 * answer even after the global Bloom overlay was cleared or replaced.
 */
function BloomOverlayButtons({
  overlays,
  onOpen,
}: {
  overlays: BloomOverlayPayload[]
  onOpen: (overlay: BloomOverlayPayload) => void
}) {
  if (overlays.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {overlays.map((overlay, idx) => {
        const summary = overlay.summary?.trim()
        const nodeCount = overlay.nodes.length
        const relCount = overlay.relationships.length
        const label = summary || 'Open graph view'
        const counts =
          nodeCount > 0 || relCount > 0
            ? ` (${nodeCount} node${nodeCount === 1 ? '' : 's'}, ${relCount} edge${relCount === 1 ? '' : 's'})`
            : ''
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onOpen(overlay)}
            title={`Open this graph in Bloom${counts}`}
            aria-label={`Open graph: ${label}${counts}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gp-primary/10 hover:bg-gp-primary/20 border border-gp-primary/30 text-xs font-medium text-gp-primary transition-colors cursor-pointer max-w-full"
          >
            <Workflow className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[220px]">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
