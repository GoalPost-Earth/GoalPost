/**
 * Shared types for the AI-driven Cypher → Bloom flow.
 *
 * NVL shape mirrors the contract used by `/api/graph/neighborhood/route.ts`
 * (RawNode/RawRel → NVLNode/NVLRelationship). Keep these aligned so a node
 * payload from either source can drop straight into the Bloom canvas.
 */

export interface NVLNode {
  id: string
  caption?: string
  size?: number
  color?: string
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
