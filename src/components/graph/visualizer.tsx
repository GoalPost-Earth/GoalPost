'use client'

import { forwardRef } from 'react'
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
 * Public subset of the underlying NVL instance methods the studio relies on.
 * Typed structurally so we don't depend on which copy of `@neo4j-nvl/base`
 * the resolver picks (the react package ships its own nested copy).
 */
export interface NvlRefHandle {
  getScale: () => number
  setZoom: (zoom: number) => void
  fit: (nodeIds: string[], opts?: Record<string, unknown>) => void
  getNodes: () => Node[]
}

/**
 * Client-side only graph visualizer wrapper
 * Prevents @neo4j-nvl/react from being imported on the server
 *
 * Forwards the underlying NVL instance so callers can drive pan/zoom/fit
 * programmatically (e.g. the studio's floating zoom controls).
 */
export const GraphVisualizer = forwardRef<NvlRefHandle, GraphVisualizerProps>(
  function GraphVisualizer(
    { nodes, relationships, mouseEventCallbacks, nvlOptions },
    ref
  ) {
    return (
      <InteractiveNvlWrapper
        // The NVL type identity differs between the top-level and nested
        // copies of `@neo4j-nvl/base`; cast through `never` so our structural
        // ref handle stays the public surface.
        ref={ref as never}
        nodes={nodes}
        rels={relationships}
        mouseEventCallbacks={mouseEventCallbacks}
        nvlOptions={nvlOptions}
      />
    )
  }
)
