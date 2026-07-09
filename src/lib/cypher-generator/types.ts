/**
 * Shared types for the AI-driven Cypher → Bloom flow.
 *
 * NVLNode/NVLRelationship is the node payload contract the Bloom canvas
 * consumes (originally shared with the removed Graph View's neighborhood
 * route; this file is the sole definition now). `execute.ts` produces it.
 */

export interface NVLNode {
  id: string
  caption?: string
  size?: number
  color?: string
  /**
   * The Neo4j labels the node carried in the source graph. Optional and
   * advisory — used by Bloom's overlay click handler to map a node back
   * to an InfoEntityType so the unified drawer can open instead of the
   * minimal inline panel. Drop this and the overlay falls back to the
   * inline panel (current behaviour pre-2026-05-25).
   */
  labels?: string[]
}

export interface NVLRelationship {
  id: string
  from: string
  to: string
  caption?: string
}

export interface BloomQueryResult {
  found: boolean
  summary: string
  nodes: NVLNode[]
  relationships: NVLRelationship[]
}
