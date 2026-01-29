'use client'

import type { Node, Relationship } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'

interface GraphVisualizerProps {
  nodes: Node[]
  relationships: Relationship[]
  mouseEventCallbacks?: MouseEventCallbacks
  nvlOptions?: Record<string, unknown>
}

/**
 * Client-side only graph visualizer wrapper
 * Prevents @neo4j-nvl/react from being imported on the server
 */
export function GraphVisualizer({
  nodes,
  relationships,
  mouseEventCallbacks,
  nvlOptions,
}: GraphVisualizerProps) {
  return (
    <InteractiveNvlWrapper
      nodes={nodes}
      rels={relationships}
      mouseEventCallbacks={mouseEventCallbacks}
      nvlOptions={nvlOptions}
    />
  )
}
