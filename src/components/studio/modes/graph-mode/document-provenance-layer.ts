import type { Relationship } from '@neo4j-nvl/base'
import type { BloomPalette } from './bloom-palette'

/**
 * The EXTRACTED_FROM edges from each document to the people it named.
 *
 * ## Why this no longer builds nodes
 *
 * GOAL-346 added this layer when a document was its own `:Document` node, so
 * the layer had to put one on the canvas before it could draw an edge to it.
 * GOAL-354 made a document a `:ResourcePulse`, which means the in-field pulse
 * set ALREADY renders it — as an ordinary green Resource, by the ordinary
 * HAS_PULSE path.
 *
 * Minting a node here as well put every document on the canvas twice under one
 * id (`bloom-graph-builder` concatenates the two lists without deduping), and
 * the duplicate was not harmless: the legend derives its rows from the colours
 * in the node array, so it offered a "Document" toggle for a node NVL never
 * drew, and hiding Resource left the invisible twin behind still wearing the
 * Resource paint. A document is a Resource; it gets no separate node and no
 * type of its own.
 *
 * So this contributes edges only, and `documentIds` names the resources those
 * edges start from — the canvas needs that set to route a click on a document
 * hub to the Document drawer.
 *
 * Kept out of `bloom-view.tsx` on purpose: that file is already ~1800 lines
 * against CLAUDE.md's 400-line component rule, so this ships as a pure
 * derivation with no React in it — which also makes it directly unit testable,
 * unlike the memos inside the component.
 */

/** Minimal document shape — matches GET_DOCUMENTS_BY_FIELD_CONTEXT. */
export interface ProvenanceDocument {
  id: string
  filename?: string | null
  extractedPeople?: { id: string }[] | null
  /**
   * The pulses ingestion minted from this document. Only ids are read here;
   * the query already selects them for the field page's document list, so this
   * costs no extra round-trip.
   */
  extractedPulses?: { id: string }[] | null
}

export interface DocumentProvenanceLayer {
  relationships: Relationship[]
  /** Resource ids that are document hubs — i.e. an edge here starts on them. */
  documentIds: ReadonlySet<string>
}

/**
 * A FRESH object per call, deliberately not a shared module-level singleton.
 * Every early return below hands its result straight to the caller, so one
 * shared instance would let a single caller that ever mutated `relationships`
 * poison every later empty build for the lifetime of the module. The
 * allocation is free at this call rate.
 */
const empty = (): DocumentProvenanceLayer => ({
  relationships: [],
  documentIds: new Set<string>(),
})

/**
 * Build the layer.
 *
 * Both endpoint sets are required because `bloom-view` maintains a strict
 * invariant that NVL is never handed a relationship whose endpoint isn't
 * rendered — a dangling arrow is a visual bug NVL will not resolve for us.
 * `visibleDocumentIds` is the in-field pulse set: a document that somehow
 * isn't on canvas contributes nothing, since there is no longer a node minted
 * here to hang its edges on.
 */
export function buildDocumentProvenanceLayer(params: {
  documents: readonly ProvenanceDocument[] | null | undefined
  visiblePersonIds: ReadonlySet<string>
  visibleDocumentIds: ReadonlySet<string>
  palette: BloomPalette
  visible: boolean
}): DocumentProvenanceLayer {
  const { documents, visiblePersonIds, visibleDocumentIds, palette, visible } =
    params
  if (!visible || !documents || documents.length === 0) return empty()

  const relationships: Relationship[] = []
  const documentIds = new Set<string>()

  for (const doc of documents) {
    if (!doc?.id) continue
    // The document renders as its own ResourcePulse or not at all.
    if (!visibleDocumentIds.has(doc.id)) continue

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

    documentIds.add(doc.id)
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

  return { relationships, documentIds }
}
