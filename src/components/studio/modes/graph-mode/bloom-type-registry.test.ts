/**
 * GOAL-350 — the Bloom canvas type filter.
 *
 * These lock the two invariants the story is actually about, both of which are
 * invisible in a screenshot and easy to regress:
 *
 *   1. Hiding a NODE type cascades to every edge incident to it, so NVL is
 *      never handed an arrow to a node that isn't drawn.
 *   2. Hiding a RELATIONSHIP type hides only edges — its endpoint nodes stay.
 *
 * Plus the property that keeps the toggle list honest: nothing is hidden that
 * the registry cannot name, because "not drawn" must never be mistakable for
 * "not there" or "not permitted" (kb/02-user-roles.md).
 */
import type { Node, Relationship } from '@neo4j-nvl/base'
import {
  BLOOM_NODE_TYPES,
  BLOOM_RELATIONSHIP_TYPES,
  DEFAULT_HIDDEN_TYPE_KEYS,
  applyBloomTypeFilters,
  countNodeTypes,
  countRelationshipTypes,
  nodeTypeKey,
  normalizeColor,
  relationshipTypeKey,
} from './bloom-type-registry'
import {
  BLOOM_PALETTE_DARK as DARK,
  BLOOM_PALETTE_LIGHT as LIGHT,
} from './bloom-palette'

const node = (id: string, color: string): Node =>
  ({ id, caption: id, color, size: 30 }) as Node

const edge = (
  id: string,
  from: string,
  to: string,
  color: string
): Relationship => ({ id, from, to, color, caption: id }) as Relationship

/**
 * A miniature in-field canvas: two goals and a person, the person authoring
 * both goals, plus a document resource that named them. GOAL-354: the document
 * is an ordinary Resource node, not a type of its own.
 */
function fieldCanvas() {
  return {
    nodes: [
      node('goal-1', DARK.pulse.goal),
      node('goal-2', DARK.pulse.goal),
      node('person-1', DARK.person),
      node('doc-1', DARK.pulse.resource),
    ],
    relationships: [
      edge('initiated-1', 'goal-1', 'person-1', DARK.initiatedEdge),
      edge('initiated-2', 'goal-2', 'person-1', DARK.initiatedEdge),
      edge('resonance-1', 'goal-1', 'goal-2', DARK.resonanceEdge),
      edge('extracted-1', 'doc-1', 'person-1', DARK.extractedEdge),
    ],
  }
}

describe('registry integrity', () => {
  it('gives every row a unique key across nodes and relationships', () => {
    // The hidden set is ONE set spanning both tables, so a duplicated key
    // would silently bind two unrelated toggles to each other.
    const keys = [...BLOOM_NODE_TYPES, ...BLOOM_RELATIONSHIP_TYPES].map(
      (r) => r.key
    )
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('opens with nothing hidden', () => {
    // Documents were the one default-off row until GOAL-346 reversed it on
    // `dev`: with the layer off, a person a document named has no other edge
    // and the canvas opened full of edgeless dots. The mechanism stays (the
    // volume argument that motivated it is still live) — the LIST is what has
    // to stay empty, or the reversal is silently undone.
    expect([...DEFAULT_HIDDEN_TYPE_KEYS]).toEqual([])
  })

  it('has no Document row — a document is an ordinary Resource (GOAL-354)', () => {
    // The row used to exist because the provenance layer minted a grey node
    // per document. Once a document became a ResourcePulse the field already
    // renders, that node was a duplicate under the same id: NVL drew one node
    // and the legend still offered a toggle for the twin it never painted.
    expect(BLOOM_NODE_TYPES.map((r) => r.key)).not.toContain('document')
    expect(nodeTypeKey(node('d', DARK.pulse.resource))).toBe('resource')
  })

  it('decodes every native edge colour in both modes', () => {
    const cases: Array<[string, string]> = [
      ['resonates-with', 'resonanceEdge'],
      ['weaves', 'weaveEdge'],
      ['connected-to', 'connectedEdge'],
      ['initiated-by', 'initiatedEdge'],
      ['structural', 'structuralEdge'],
      ['extracted-from', 'extractedEdge'],
    ]
    for (const [key, paletteKey] of cases) {
      const dark = DARK[paletteKey as keyof typeof DARK] as string
      const light = LIGHT[paletteKey as keyof typeof LIGHT] as string
      expect(relationshipTypeKey(edge('e', 'a', 'b', dark))).toBe(key)
      expect(relationshipTypeKey(edge('e', 'a', 'b', light))).toBe(key)
    }
  })
})


describe('applyBloomTypeFilters', () => {
  it('is a no-op — same object — when nothing is hidden', () => {
    const canvas = fieldCanvas()
    expect(applyBloomTypeFilters(canvas, new Set())).toBe(canvas)
  })

  it('cascades: hiding a node type drops every edge incident to it', () => {
    const { nodes, relationships } = applyBloomTypeFilters(
      fieldCanvas(),
      new Set(['person'])
    )
    expect(nodes.map((n) => n.id)).toEqual(['goal-1', 'goal-2', 'doc-1'])
    // Both `initiated` edges and the `extracted from` edge ended on the
    // person, so all three go. The goal↔goal resonance survives untouched.
    expect(relationships.map((r) => r.id)).toEqual(['resonance-1'])
  })

  it('hiding Resource takes the document hub and its EXTRACTED_FROM edge', () => {
    // GOAL-354: the hub is a Resource now, so it goes with that row, and the
    // edge cascades because one of its endpoints left the canvas.
    const { nodes, relationships } = applyBloomTypeFilters(
      fieldCanvas(),
      new Set(['resource'])
    )
    expect(nodes.map((n) => n.id)).toEqual(['goal-1', 'goal-2', 'person-1'])
    expect(relationships.map((r) => r.id)).toEqual([
      'initiated-1',
      'initiated-2',
      'resonance-1',
    ])
  })

  it('hiding a relationship type leaves its endpoint nodes on canvas', () => {
    const { nodes, relationships } = applyBloomTypeFilters(
      fieldCanvas(),
      new Set(['initiated-by'])
    )
    expect(nodes.map((n) => n.id)).toEqual([
      'goal-1',
      'goal-2',
      'person-1',
      'doc-1',
    ])
    expect(relationships.map((r) => r.id)).toEqual([
      'resonance-1',
      'extracted-1',
    ])
  })

  it('never leaves a dangling edge, whatever combination is hidden', () => {
    const allKeys = [...BLOOM_NODE_TYPES, ...BLOOM_RELATIONSHIP_TYPES].map(
      (r) => r.key
    )
    for (const key of allKeys) {
      const { nodes, relationships } = applyBloomTypeFilters(
        fieldCanvas(),
        new Set([key, 'person'])
      )
      const ids = new Set(nodes.map((n) => String(n.id)))
      for (const r of relationships) {
        expect(ids.has(String(r.from))).toBe(true)
        expect(ids.has(String(r.to))).toBe(true)
      }
    }
  })

  it('keeps anything the registry cannot name', () => {
    const canvas = {
      nodes: [node('mystery', '#123456')],
      relationships: [edge('mystery-edge', 'mystery', 'mystery', '#123456')],
    }
    // Hiding literally every known type must not drop an undecodable node:
    // silently withholding data the filter cannot even label would read as
    // missing content, or as a permission boundary.
    const hidden = new Set(
      [...BLOOM_NODE_TYPES, ...BLOOM_RELATIONSHIP_TYPES].map((r) => r.key)
    )
    const result = applyBloomTypeFilters(canvas, hidden)
    expect(result.nodes).toHaveLength(1)
    expect(result.relationships).toHaveLength(1)
  })
})

/**
 * Per-row counts — the numbers the legend prints beside each label.
 *
 * Tallied through the same winner-takes-all colour index the rows and the
 * filter resolve through, so the count and the switch it sits beside can never
 * disagree about which bucket an element landed in.
 */
describe('countNodeTypes / countRelationshipTypes', () => {
  it('tallies each type row by the colour it painted with', () => {
    const counts = countNodeTypes([
      node('p1', DARK.person),
      node('p2', DARK.person),
      node('g1', DARK.pulse.goal),
    ])
    expect(counts.get('person')).toBe(2)
    expect(counts.get('goal')).toBe(1)
  })

  it('counts light-mode paint into the same row as its dark counterpart', () => {
    const counts = countNodeTypes([
      node('p1', DARK.person),
      node('p2', LIGHT.person),
    ])
    expect(counts.get('person')).toBe(2)
  })

  it('leaves an undecodable colour uncounted rather than bucketing it', () => {
    const counts = countNodeTypes([
      node('x1', '#010203'),
      node('p1', DARK.person),
    ])
    expect(counts.get('person')).toBe(1)
    expect([...counts.values()].reduce((a, b) => a + b, 0)).toBe(1)
  })

  it('reports nothing for a type the canvas does not carry', () => {
    const counts = countNodeTypes([node('p1', DARK.person)])
    expect(counts.get('goal')).toBeUndefined()
    expect(countNodeTypes([]).size).toBe(0)
  })

  it('tallies relationship rows the same way', () => {
    const counts = countRelationshipTypes([
      edge('r1', 'a', 'b', DARK.initiatedEdge),
      edge('r2', 'a', 'c', DARK.initiatedEdge),
      edge('r3', 'b', 'c', DARK.resonanceEdge),
    ])
    expect(counts.get('initiated-by')).toBe(2)
    expect(counts.get('resonates-with')).toBe(1)
  })

  it('only ever keys a count to a row the legend can offer', () => {
    // A tally keyed to something no row carries would print a number with
    // nowhere to sit — or silently vanish from the panel.
    const nodeKeys = new Set(BLOOM_NODE_TYPES.map((r) => r.key))
    const counts = countNodeTypes([
      node('p1', DARK.person),
      node('s1', LIGHT.pulse.story),
      node('x1', '#010203'),
    ])
    for (const key of counts.keys()) expect(nodeKeys.has(key)).toBe(true)
  })
})

/**
 * Drift guard: node and relationship row keys share ONE flat namespace.
 *
 * Two things already depend on this and would break silently if a key were
 * reused across the two tables — the legend's `hidden` Set (one Set for both
 * kinds, so hiding an edge type would also hide a node type) and the legend's
 * merged count Map (one tally would clobber the other). Neither would throw;
 * both would just quietly lie.
 */
describe('row key namespace', () => {
  it('never reuses a key between node rows and relationship rows', () => {
    const all = [
      ...BLOOM_NODE_TYPES.map((r) => r.key),
      ...BLOOM_RELATIONSHIP_TYPES.map((r) => r.key),
    ]
    expect(new Set(all).size).toBe(all.length)
  })
})
