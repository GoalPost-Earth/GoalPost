'use client'

import { useEffect, useMemo, useState, type FC } from 'react'
import dynamic from 'next/dynamic'
import type { Node, Relationship } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { useFocalEntity } from '@/contexts'

const GraphVisualizer = dynamic(
  () =>
    import('@/components/graph/visualizer').then((mod) => mod.GraphVisualizer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40" />
      </div>
    ),
  }
)

interface NeighborhoodResponse {
  nodes: Node[]
  relationships: Relationship[]
}

/**
 * NVL "Bloom" exploration view. Fetches the focal entity's one-hop
 * neighborhood from `/api/graph/neighborhood` and renders it. Honors
 * `FocalEntityContext` — switching focal in chat / dashboard re-fetches.
 * When no focal is set the API returns the user's MeSpace by default so the
 * canvas is never empty on a neutral surface.
 *
 * Clicking a node updates the focal entity, which propagates back to the
 * other modes via FocalEntityContext.
 */
export const BloomView: FC = () => {
  const { focalEntity, setFocalEntity } = useFocalEntity()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  // Single status object so the in-flight transitions happen as one render —
  // satisfies react-hooks/set-state-in-effect by collapsing the cascading
  // updates into one (status changes are inherently external-system mirrors).
  const [status, setStatus] = useState<{
    state: 'idle' | 'loading' | 'ready' | 'error'
    data: NeighborhoodResponse
    error: string | null
  }>({
    state: 'idle',
    data: { nodes: [], relationships: [] },
    error: null,
  })

  useEffect(() => {
    const ctrl = new AbortController()
    void (async () => {
      try {
        const res = await fetch('/api/graph/neighborhood', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            focalType: focalEntity?.type ?? null,
            focalId: focalEntity?.id ?? null,
          }),
          signal: ctrl.signal,
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        const payload = (await res.json()) as NeighborhoodResponse
        if (ctrl.signal.aborted) return
        setStatus({ state: 'ready', data: payload, error: null })
      } catch (err) {
        if (ctrl.signal.aborted) return
        setStatus((prev) => ({
          ...prev,
          state: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
      }
    })()
    return () => ctrl.abort()
  }, [focalEntity?.type, focalEntity?.id])

  const loading = status.state === 'idle' || status.state === 'loading'
  const error = status.state === 'error' ? status.error : null
  const data = status.data

  const mouseEventCallbacks: MouseEventCallbacks = useMemo(
    () => ({
      onNodeClick: (node) => setSelectedNode(node),
      onCanvasClick: () => setSelectedNode(null),
      onDrag: true,
      onPan: true,
      onZoom: true,
    }),
    []
  )

  const isEmpty = !loading && !error && data.nodes.length === 0

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex">
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 max-w-md">
              Could not load graph: {error}
            </div>
          </div>
        )}
        {isEmpty && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
              hub
            </span>
            <p className="text-sm text-white/55 max-w-md">
              Nothing to render here yet. Add a field or a pulse and it will
              bloom into the graph.
            </p>
          </div>
        )}
        <GraphVisualizer
          nodes={data.nodes}
          relationships={data.relationships}
          mouseEventCallbacks={mouseEventCallbacks}
        />
      </div>

      {selectedNode && (
        <div className="w-80 h-full bg-slate-900/85 backdrop-blur-xl border-l border-white/10 overflow-y-auto z-20 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                Node
              </p>
              <h3 className="mt-1 text-xl font-bold text-white">
                {selectedNode.caption}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <span className="material-symbols-outlined text-lg leading-none">
                close
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: selectedNode.color }}
              aria-hidden="true"
            />
            <span className="text-xs text-white/60">
              {selectedNode.caption}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const id = String(selectedNode.id)
              // We don't have label-level type metadata from NVL — fall back to
              // 'FieldContext' for now if nothing else is known. The detail
              // page route + label cache will refine the type on resolve.
              setFocalEntity({
                type: 'FieldContext',
                id,
                focusedAt: new Date().toISOString(),
                source: 'manual',
              })
              setSelectedNode(null)
            }}
            className="w-full mt-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold py-2 transition-colors cursor-pointer"
          >
            Focus on this node
          </button>
        </div>
      )}
    </div>
  )
}
