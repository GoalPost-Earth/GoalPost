'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { ToolCallMessagePartComponent } from '@assistant-ui/react'
import { Workflow } from 'lucide-react'
import { useBloomOverlay } from '@/components/studio/bloom-overlay-context'
import { useStudioCanvas } from '@/components/studio/studio-canvas-context'
import { ToolStatusPart } from './tool-status-tool-ui'
import type { NVLNode, NVLRelationship } from '@/lib/cypher-generator/types'

/**
 * Bloom overlay renderer — the `query_for_bloom` tool-call part.
 *
 * WHY THIS EXISTS (the bug it fixes): the overlay used to be driven off the
 * model's REPLY TEXT — the assistant was told to copy the tool's
 * `{ summary, nodes, relationships }` payload back out as a
 * `BLOOM_GRAPH_OVERLAY: {…}` marker, which `EnhancedTextPart` parsed and pushed
 * into the Bloom context. LLMs transcribe large JSON unreliably: for
 * "show my connection to Naa and Ashong" the tool returned 3 nodes + 2 edges,
 * but the model re-emitted only 1 node and 0 edges, so the canvas showed just
 * the user ("the graph is not showing anything"). See kb/07 Rule 3 — a tool
 * result must be the source of truth, never the model's re-serialization.
 *
 * The tool-call part receives the tool's `result` directly, so we apply the
 * EXACT payload the executor produced. The model no longer needs to echo the
 * payload; it just narrates. `EnhancedTextPart` still strips any stray
 * BLOOM marker so a payload the model emits anyway never shows in the bubble.
 *
 * Renders the same status chip as the other read tools (running / done) via
 * `ToolStatusPart`, plus a re-open pill once the overlay has been produced so
 * the user can return to this graph after the global overlay moves on.
 */

interface BloomToolResult {
  found?: boolean
  summary?: string
  nodes?: NVLNode[]
  relationships?: NVLRelationship[]
}

export interface BloomOverlayPayload {
  summary: string
  nodes: NVLNode[]
  relationships: NVLRelationship[]
}

/**
 * Normalize the `query_for_bloom` tool result into the overlay payload — or
 * null when there is nothing renderable. This is the whole point of the fix:
 * the payload passes through VERBATIM from the tool result (every node, every
 * edge), never re-derived from the model's text. Only found=true results with
 * at least one node are applied; found=false / error / partial / empty shapes
 * yield null so the canvas is never yanked to an empty or half-copied graph
 * (the generator already returns found=false for zero nodes — this is the
 * fail-closed backstop).
 */
export function toBloomOverlayPayload(
  result: unknown
): BloomOverlayPayload | null {
  if (!result || typeof result !== 'object') return null
  const r = result as BloomToolResult
  if (r.found !== true) return null
  if (!Array.isArray(r.nodes) || !Array.isArray(r.relationships)) return null
  if (r.nodes.length === 0) return null
  return {
    summary: typeof r.summary === 'string' ? r.summary : '',
    nodes: r.nodes,
    relationships: r.relationships,
  }
}

export const BloomOverlayToolPart: ToolCallMessagePartComponent = (props) => {
  const { result } = props
  const { setOverlay } = useBloomOverlay()
  const { setCanvasView, setCanvasOpen } = useStudioCanvas()
  const appliedRef = useRef(false)

  const payload = useMemo(() => toBloomOverlayPayload(result), [result])

  // Apply the overlay from the AUTHORITATIVE tool result exactly once, when the
  // call completes with renderable nodes. Dedup via a ref so re-renders (and
  // React strict-mode's double effect invoke) don't re-yank the canvas.
  useEffect(() => {
    if (!payload || appliedRef.current) return
    appliedRef.current = true
    setOverlay(payload)
    setCanvasOpen(true)
    setCanvasView('bloom')
  }, [payload, setOverlay, setCanvasOpen, setCanvasView])

  const reopen = () => {
    if (!payload) return
    setOverlay(payload)
    setCanvasOpen(true)
    setCanvasView('bloom')
  }

  return (
    <>
      {/* Same live status chip every other read tool shows. */}
      <ToolStatusPart {...props} />
      {payload ? (
        <div className="mt-1.5">
          <BloomReopenButton
            summary={payload.summary.trim()}
            nodeCount={payload.nodes.length}
            relCount={payload.relationships.length}
            onOpen={reopen}
          />
        </div>
      ) : null}
    </>
  )
}

function BloomReopenButton({
  summary,
  nodeCount,
  relCount,
  onOpen,
}: {
  summary: string
  nodeCount: number
  relCount: number
  onOpen: () => void
}) {
  const label = summary || 'Open graph view'
  const counts =
    nodeCount > 0 || relCount > 0
      ? ` (${nodeCount} node${nodeCount === 1 ? '' : 's'}, ${relCount} edge${relCount === 1 ? '' : 's'})`
      : ''
  return (
    <button
      type="button"
      onClick={onOpen}
      title={`Open this graph in Bloom${counts}`}
      aria-label={`Open graph: ${label}${counts}`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gp-primary/10 hover:bg-gp-primary/20 border border-gp-primary/30 text-xs font-medium text-gp-primary transition-colors cursor-pointer max-w-full"
    >
      <Workflow className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate max-w-[220px]">{label}</span>
    </button>
  )
}
