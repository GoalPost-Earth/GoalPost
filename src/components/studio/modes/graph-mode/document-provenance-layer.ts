import type { Node, Relationship } from '@neo4j-nvl/base'
import type { BloomPalette } from './bloom-palette'

/**
 * GOAL-346: the Document provenance layer for the in-field Bloom view —
 * Document nodes plus the EXTRACTED_FROM edges out to the people each one
 * named.
 *
 * Why this exists: the in-field view builds nodes for pulses, people, weaves,
 * the field anchor and nested sub-contexts, and edges for resonance,
 * authorship, weaves, connections and nesting. Documents were not on the
 * canvas at all and EXTRACTED_FROM was never drawn — so a person a document
 * named, who authored no pulse and has no CONNECTED_TO edge, rendered with no
 * edges whatsoever. That is the "people hovering independently" this fixes.
 *
 * Kept out of `bloom-view.tsx` on purpose: that file is already ~1880 lines
 * against CLAUDE.md's 400-line component rule, so this ships as a pure
 * derivation with no React in it — which also makes it directly unit
 * testable, unlike the memos inside the component.
 *
 * This is the FIRST entry of the per-type visibility model GOAL-350
 * generalizes: `visible` is passed in rather than read from a local boolean,
 * so the layer becomes one row of a type-toggle list without being rewritten.
 */

/** Minimal document shape — matches GET_DOCUMENTS_BY_FIELD_CONTEXT. */
export interface ProvenanceDocument {
  id: string
  filename?: string | null
  extractedPeople?: { id: string }[] | null
}

export interface DocumentProvenanceLayer {
  nodes: Node[]
  relationships: Relationship[]
}

/**
 * A FRESH object per call, deliberately not a shared module-level singleton.
 * Every early return below hands its result straight to the caller, so one
 * shared instance would let a single caller that ever mutated `nodes` poison
 * every later empty build for the lifetime of the module — surfacing as
 * documents leaking onto a canvas with the toggle switched off. The
 * allocation is free at this call rate.
 */
const empty = (): DocumentProvenanceLayer => ({ nodes: [], relationships: [] })

/** Matches PERSON_SIZE's scale in bloom-view; documents read as peers of people. */
export const DOCUMENT_SIZE = 18

/**
 * Build the layer.
 *
 * `visiblePersonIds` is the set of person nodes already on canvas. Edges are
 * filtered against it because `bloom-view` maintains a strict invariant that
 * NVL is never handed a relationship whose endpoint isn't rendered — a
 * dangling arrow is a visual bug, and NVL will not resolve it for us.
 *
 * A document whose extracted people are ALL off-canvas contributes no node.
 * Rendering it would put an isolated Document on the canvas, which is the
 * same disconnected-node problem this layer set out to remove, merely moved
 * onto a different node type.
 */
export function buildDocumentProvenanceLayer(params: {
  documents: readonly ProvenanceDocument[] | null | undefined
  visiblePersonIds: ReadonlySet<string>
  palette: BloomPalette
  visible: boolean
}): DocumentProvenanceLayer {
  const { documents, visiblePersonIds, palette, visible } = params
  if (!visible || !documents || documents.length === 0) return empty()

  const nodes: Node[] = []
  const relationships: Relationship[] = []

  for (const doc of documents) {
    if (!doc?.id) continue

    // Dedupe within a document: the same person can be returned twice if they
    // were extracted across re-ingests, and two identical relationship ids
    // would collide in NVL.
    const linkedPersonIds = new Set<string>()
    for (const person of doc.extractedPeople ?? []) {
      if (person?.id && visiblePersonIds.has(person.id)) {
        linkedPersonIds.add(person.id)
      }
    }
    if (linkedPersonIds.size === 0) continue

    nodes.push({
      id: doc.id,
      caption: doc.filename?.trim() || 'Document',
      color: palette.documentNode,
      size: DOCUMENT_SIZE,
    } as Node)

    for (const personId of linkedPersonIds) {
      relationships.push({
        id: `extracted-from-${doc.id}-${personId}`,
        from: doc.id,
        to: personId,
        caption: 'extracted from',
        color: palette.extractedEdge,
        width: 1.5,
      } as Relationship)
    }
  }

  return { nodes, relationships }
}
