'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { NVLNode, NVLRelationship } from '@/lib/cypher-generator/types'

/**
 * BloomOverlay — a chat-driven payload that, when set, REPLACES Bloom's
 * default Apollo-cached space view with the AI-generated subgraph.
 *
 * The flow:
 *   - The assistant calls `query_for_bloom`, the server validates +
 *     executes safe Cypher, the tool returns NVL nodes/rels.
 *   - `BloomOverlayToolPart` (the `query_for_bloom` tool-call renderer)
 *     reads that tool RESULT directly and calls `setOverlay`, switching
 *     the canvas to Bloom. The overlay is applied from the authoritative
 *     tool result — NOT from any JSON the model re-serialises into its
 *     reply text (that path dropped nodes; see kb/07 Rule 3). Any stray
 *     `BLOOM_GRAPH_OVERLAY:` marker the model still emits is only stripped
 *     from the visible bubble by `EnhancedTextPart`, never parsed for data.
 *   - `BloomView` reads `useBloomOverlay()`; when an overlay is
 *     present, it renders the overlay instead of the default
 *     MeSpace/WeSpace cluster.
 *   - The "Custom view from chat" chip in CanvasHost calls
 *     `clearOverlay()` to fall back to the default view.
 *
 * State is intentionally session-only (no localStorage). The chat
 * thread itself is the audit trail; persisting overlay payloads
 * across reloads would create stale renders that disagree with the
 * underlying graph.
 *
 * `generation` is a monotonic counter the marker parser bumps so
 * BloomView can re-fit the canvas whenever a fresh overlay arrives,
 * even if subsequent payloads happen to share the same nodes.
 */

export interface BloomOverlay {
  summary: string
  nodes: NVLNode[]
  relationships: NVLRelationship[]
  generation: number
}

interface BloomOverlayContextValue {
  overlay: BloomOverlay | null
  setOverlay: (
    next: Pick<BloomOverlay, 'summary' | 'nodes' | 'relationships'>
  ) => void
  clearOverlay: () => void
}

const BloomOverlayContext = createContext<BloomOverlayContextValue | null>(null)

export function BloomOverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlayState] = useState<BloomOverlay | null>(null)

  const setOverlay = useCallback<BloomOverlayContextValue['setOverlay']>(
    (next) => {
      setOverlayState((prev) => ({
        summary: next.summary,
        nodes: next.nodes,
        relationships: next.relationships,
        generation: (prev?.generation ?? 0) + 1,
      }))
    },
    []
  )

  const clearOverlay = useCallback(() => {
    setOverlayState(null)
  }, [])

  const value = useMemo(
    () => ({ overlay, setOverlay, clearOverlay }),
    [overlay, setOverlay, clearOverlay]
  )

  return (
    <BloomOverlayContext.Provider value={value}>
      {children}
    </BloomOverlayContext.Provider>
  )
}

export function useBloomOverlay(): BloomOverlayContextValue {
  const ctx = useContext(BloomOverlayContext)
  if (!ctx) {
    throw new Error(
      'useBloomOverlay must be used inside <BloomOverlayProvider>'
    )
  }
  return ctx
}
