import {
  buildDocumentProvenanceLayer,
  type ProvenanceDocument,
} from './document-provenance-layer'
import { DEFAULT_EDGE_CAPTIONS } from './edge-caption'
import {
  BLOOM_PALETTE_DARK,
  BLOOM_PALETTE_LIGHT,
  type BloomPalette,
} from './bloom-palette'

/**
 * GOAL-354: the layer contributes EXTRACTED_FROM edges and nothing else. It
 * used to mint a `:Document` node per document, which — once a document became
 * a ResourcePulse the field already renders — put every document on canvas
 * twice under one id. These tests pin the edges-only contract, and in
 * particular that an edge is never drawn to a hub or a person that isn't on
 * canvas (bloom-view's no-dangling-edge invariant).
 */

const palette: BloomPalette = BLOOM_PALETTE_DARK

const ids = (xs: string[]) => new Set(xs)

const doc = (
  id: string,
  people: string[],
  filename: string | null = `${id}.pdf`
): ProvenanceDocument => ({
  id,
  filename,
  extractedPeople: people.map((p) => ({ id: p })),
})

const build = (params: {
  documents?: readonly ProvenanceDocument[] | null
  persons?: string[]
  docsOnCanvas?: string[]
  visible?: boolean
}) =>
  buildDocumentProvenanceLayer({
    documents: params.documents ?? [],
    visiblePersonIds: ids(params.persons ?? []),
    visibleDocumentIds: ids(params.docsOnCanvas ?? []),
    palette,
    visible: params.visible ?? true,
  })

describe('buildDocumentProvenanceLayer', () => {
  describe('when there is nothing to draw', () => {
    it('returns empty when toggled off, however much data is present', () => {
      const layer = build({
        documents: [doc('d1', ['p1'])],
        persons: ['p1'],
        docsOnCanvas: ['d1'],
        visible: false,
      })
      expect(layer.relationships).toEqual([])
      expect(layer.documentIds.size).toBe(0)
    })

    it('returns empty for null / absent / empty document lists', () => {
      for (const documents of [null, undefined, []] as const) {
        const layer = buildDocumentProvenanceLayer({
          documents,
          visiblePersonIds: ids(['p1']),
          visibleDocumentIds: ids(['d1']),
          palette,
          visible: true,
        })
        expect(layer.relationships).toEqual([])
        expect(layer.documentIds.size).toBe(0)
      }
    })

    it('returns empty when no person is on canvas', () => {
      const layer = build({
        documents: [doc('d1', ['p1'])],
        persons: [],
        docsOnCanvas: ['d1'],
      })
      expect(layer.relationships).toEqual([])
    })
  })

  describe('no-dangling-edge invariant', () => {
    it('draws nothing for a document that is not itself on canvas', () => {
      const layer = build({
        documents: [doc('d1', ['p1'])],
        persons: ['p1'],
        docsOnCanvas: [],
      })
      expect(layer.relationships).toEqual([])
      expect(layer.documentIds.has('d1')).toBe(false)
    })

    it('drops an off-canvas document while its siblings still render', () => {
      const layer = build({
        documents: [doc('d1', ['p1']), doc('d2', ['p2'])],
        persons: ['p1', 'p2'],
        docsOnCanvas: ['d2'],
      })
      expect(layer.relationships).toHaveLength(1)
      // GOAL-362: drawn person->document, matching the stored
      // (Person)-[:EXTRACTED_FROM]->(pulse) edge.
      expect(layer.relationships[0].to).toBe('d2')
      expect([...layer.documentIds]).toEqual(['d2'])
    })

    it('emits edges only for person ids present in visiblePersonIds', () => {
      const layer = build({
        documents: [doc('d1', ['p1', 'ghost'])],
        persons: ['p1'],
        docsOnCanvas: ['d1'],
      })
      expect(layer.relationships.map((r) => r.from)).toEqual(['p1'])
    })

    it('never references an id outside the two visible sets', () => {
      const layer = build({
        documents: [doc('d1', ['p1', 'p2']), doc('d2', ['p2'])],
        persons: ['p1', 'p2'],
        docsOnCanvas: ['d1', 'd2'],
      })
      const allowed = ids(['d1', 'd2', 'p1', 'p2'])
      for (const rel of layer.relationships) {
        expect(allowed.has(String(rel.from))).toBe(true)
        expect(allowed.has(String(rel.to))).toBe(true)
      }
    })

    it('anchors every edge at its own document', () => {
      const layer = build({
        documents: [doc('d1', ['p1']), doc('d2', ['p1'])],
        persons: ['p1'],
        docsOnCanvas: ['d1', 'd2'],
      })
      expect(layer.relationships.map((r) => r.to).sort()).toEqual(['d1', 'd2'])
    })
  })

  describe('relationship id uniqueness (NVL collision safety)', () => {
    it('yields ONE relationship when a person is listed twice on a document', () => {
      const layer = build({
        documents: [doc('d1', ['p1', 'p1'])],
        persons: ['p1'],
        docsOnCanvas: ['d1'],
      })
      expect(layer.relationships).toHaveLength(1)
    })

    it('keeps ids unique across two documents that share a person', () => {
      const layer = build({
        documents: [doc('d1', ['p1']), doc('d2', ['p1'])],
        persons: ['p1'],
        docsOnCanvas: ['d1', 'd2'],
      })
      const seen = new Set(layer.relationships.map((r) => r.id))
      expect(seen.size).toBe(layer.relationships.length)
    })
  })

  describe('documentIds', () => {
    it('contains only hubs that actually produced an edge', () => {
      const layer = build({
        documents: [doc('d1', ['p1']), doc('d2', [])],
        persons: ['p1'],
        docsOnCanvas: ['d1', 'd2'],
      })
      expect([...layer.documentIds]).toEqual(['d1'])
    })
  })

  describe('malformed input', () => {
    it('skips documents with a missing id without throwing', () => {
      const layer = build({
        documents: [{ id: '', extractedPeople: [{ id: 'p1' }] }, doc('d1', ['p1'])],
        persons: ['p1'],
        docsOnCanvas: ['d1'],
      })
      expect(layer.relationships).toHaveLength(1)
    })

    it('skips extracted person entries that carry no id', () => {
      const layer = build({
        documents: [
          { id: 'd1', extractedPeople: [{ id: '' }, { id: 'p1' }] },
        ],
        persons: ['p1'],
        docsOnCanvas: ['d1'],
      })
      expect(layer.relationships.map((r) => r.from)).toEqual(['p1'])
    })

    it('tolerates a null extractedPeople list', () => {
      const layer = build({
        documents: [{ id: 'd1', extractedPeople: null }],
        persons: ['p1'],
        docsOnCanvas: ['d1'],
      })
      expect(layer.relationships).toEqual([])
    })
  })

  describe('paint', () => {
    it.each([
      ['dark', BLOOM_PALETTE_DARK],
      ['light', BLOOM_PALETTE_LIGHT],
    ])('paints the edge with %s extractedEdge', (_mode, pal) => {
      const layer = buildDocumentProvenanceLayer({
        documents: [doc('d1', ['p1'])],
        visiblePersonIds: ids(['p1']),
        visibleDocumentIds: ids(['d1']),
        palette: pal as BloomPalette,
        visible: true,
      })
      expect(layer.relationships[0].color).toBe(
        (pal as BloomPalette).extractedEdge
      )
      expect(layer.relationships[0].color).toBeDefined()
    })

    it('gives the two palettes distinct edge colors (light/dark parity)', () => {
      expect(BLOOM_PALETTE_LIGHT.extractedEdge).not.toBe(
        BLOOM_PALETTE_DARK.extractedEdge
      )
    })

    it('captions the edge exactly as the legend row names it', () => {
      const layer = build({
        documents: [doc('d1', ['p1'])],
        persons: ['p1'],
        docsOnCanvas: ['d1'],
      })
      // GOAL-362: the caption now resolves through the shared edge-caption
      // table rather than a literal here, so the legend row, this layer and
      // the generic sweep cannot drift apart on wording.
      // GOAL-362: canvas captions are uppercased (edge-caption.ts), while the
      // legend row keeps title case — so this compares against the shared
      // default, uppercased, rather than a literal that could drift.
      expect(layer.relationships[0].caption).toBe(
        DEFAULT_EDGE_CAPTIONS.EXTRACTED_FROM.toUpperCase()
      )
      expect(layer.relationships[0].caption).toBe('EXTRACTED FROM')
    })
  })

  describe('purity', () => {
    it('does not mutate the documents it reads', () => {
      const documents = [doc('d1', ['p1'])]
      const snapshot = JSON.stringify(documents)
      build({ documents, persons: ['p1'], docsOnCanvas: ['d1'] })
      expect(JSON.stringify(documents)).toBe(snapshot)
    })

    it('does not mutate the visible sets it is handed', () => {
      const persons = ids(['p1'])
      const docs = ids(['d1'])
      buildDocumentProvenanceLayer({
        documents: [doc('d1', ['p1'])],
        visiblePersonIds: persons,
        visibleDocumentIds: docs,
        palette,
        visible: true,
      })
      expect([...persons]).toEqual(['p1'])
      expect([...docs]).toEqual(['d1'])
    })

    it('returns fresh containers, never a shared singleton', () => {
      const a = build({ documents: [], visible: true })
      const b = build({ documents: [], visible: true })
      expect(a.relationships).not.toBe(b.relationships)
      expect(a.documentIds).not.toBe(b.documentIds)
    })
  })
})
