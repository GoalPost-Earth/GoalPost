'use client'

import { useMemo, useState, type FC } from 'react'
import dynamic from 'next/dynamic'
import type { Node } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { ONTOLOGY_NODES, ONTOLOGY_RELATIONSHIPS } from './ontology-data'

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

/**
 * Stock NVL "Bloom" exploration view. Pan/zoom/drag enabled, click a node
 * to open a right-side details panel (mirrors Neo4j Bloom's inspector).
 * Phase 1 reuses the ontology dataset; swapping to a real Cypher
 * neighborhood query is the only change for the next iteration.
 */
export const BloomView: FC = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

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

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex">
      <div className="flex-1 relative">
        <GraphVisualizer
          nodes={ONTOLOGY_NODES}
          relationships={ONTOLOGY_RELATIONSHIPS}
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
            <code className="font-mono text-xs">{selectedNode.id}</code>
          </div>

          <div className="space-y-3 text-xs text-white/70">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-1">
                Properties
              </p>
              <dl className="space-y-1">
                <div className="flex justify-between gap-3">
                  <dt className="text-white/50">id</dt>
                  <dd className="font-mono">{String(selectedNode.id)}</dd>
                </div>
                {selectedNode.size != null && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">size</dt>
                    <dd className="font-mono">{String(selectedNode.size)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
