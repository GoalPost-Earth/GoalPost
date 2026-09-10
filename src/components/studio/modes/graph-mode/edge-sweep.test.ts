/**
 * GOAL-362 — the generic edge layer.
 *
 * The invariant these guard: the sweep may only ADD. A hand-built family must
 * always win for an edge it already draws, and the sweep must never hand NVL
 * an arrow to a node that isn't rendered.
 */
import {
  buildSweptRelationships,
  edgeKey,
  sweptEdgeKeys,
  type SweptEdge,
} from './edge-sweep'
import { BLOOM_PALETTE_DARK } from './bloom-palette'
import { relationshipTypeKey } from './bloom-type-registry'

const palette = BLOOM_PALETTE_DARK

const build = (
  edges: SweptEdge[],
  visible: string[],
  existing: string[] = []
) =>
  buildSweptRelationships({
    edges,
    visibleIds: new Set(visible),
    existing: new Set(existing),
    palette,
  })

describe('buildSweptRelationships', () => {
  it('paints a relationship type no hand-built family covers', () => {
    // MENTIONED_IN is the standing example — the canvas never drew it.
    const rels = build(
      [{ type: 'MENTIONED_IN', fromId: 'p1', toId: 'pulse1', label: 'Interviewed' }],
      ['p1', 'pulse1']
    )
    expect(rels).toHaveLength(1)
    expect(rels[0].from).toBe('p1')
    expect(rels[0].to).toBe('pulse1')
    expect(rels[0].caption).toBe('INTERVIEWED')
  })

  it('draws authorship person->pulse, reversing how it is stored', () => {
    const rels = build(
      [{ type: 'INITIATED_BY', fromId: 'pulse1', toId: 'p1' }],
      ['p1', 'pulse1']
    )
    expect(rels[0].from).toBe('p1')
    expect(rels[0].to).toBe('pulse1')
    expect(rels[0].caption).toBe('AUTHORED')
  })

  it('drops an edge whose endpoint is not rendered', () => {
    expect(
      build(
        [{ type: 'MENTIONED_IN', fromId: 'p1', toId: 'offscreen' }],
        ['p1']
      )
    ).toHaveLength(0)
  })

  it('yields to a layer that already drew the same edge', () => {
    const rels = build(
      [{ type: 'INITIATED_BY', fromId: 'pulse1', toId: 'p1' }],
      ['p1', 'pulse1'],
      [edgeKey('p1', 'pulse1', 'INITIATED_BY')]
    )
    expect(rels).toHaveLength(0)
  })

  it('keys identity on relationship TYPE, never the caption', () => {
    // The bug this guards: the hand-built author family reads
    // `initiatedBy { id }`, which carries no edge properties, so it can only
    // caption "AUTHORED"; the sweep reads `r.label` and captions
    // "INTERVIEWEE". A caption-keyed dedupe calls those different edges and
    // draws BOTH — the exact duplicate this feature exists to remove.
    const key = edgeKey('p1', 'pulse1', 'INITIATED_BY')
    const rels = build(
      [{ type: 'INITIATED_BY', fromId: 'pulse1', toId: 'p1', label: 'Interviewee' }],
      ['p1', 'pulse1'],
      [key]
    )
    expect(rels).toHaveLength(0)
  })

  it('treats CONNECTED_TO as undirected, so the two layers cannot each draw it', () => {
    // The hand-built family orders endpoints by the `people` array; the sweep
    // reports the stored direction. Roughly half of all connections disagree.
    expect(edgeKey('p1', 'p2', 'CONNECTED_TO')).toBe(
      edgeKey('p2', 'p1', 'CONNECTED_TO')
    )
    // Directed types must NOT normalise — a pulse authored by a person and a
    // person extracted from that pulse are different edges.
    expect(edgeKey('a', 'b', 'MENTIONED_IN')).not.toBe(
      edgeKey('b', 'a', 'MENTIONED_IN')
    )
    const rels = build(
      [{ type: 'CONNECTED_TO', fromId: 'p2', toId: 'p1', label: 'my wife' }],
      ['p1', 'p2'],
      [edgeKey('p1', 'p2', 'CONNECTED_TO')]
    )
    expect(rels).toHaveLength(0)
  })

  it('gives each drawn edge a unique NVL id', () => {
    const rels = build(
      [
        { type: 'INITIATED_BY', fromId: 'pulse1', toId: 'p1', label: 'Author' },
        // Same pair and type, different label — must collapse to ONE line, so
        // two relationships can never share an id.
        { type: 'INITIATED_BY', fromId: 'pulse1', toId: 'p1', label: 'Co-author' },
        { type: 'EXTRACTED_FROM', fromId: 'p1', toId: 'pulse1' },
      ],
      ['p1', 'pulse1']
    )
    expect(new Set(rels.map((r) => r.id)).size).toBe(rels.length)
    expect(rels).toHaveLength(2)
  })

  it('sweptEdgeKeys reports exactly the edges the sweep will draw', () => {
    const edges: SweptEdge[] = [
      { type: 'MENTIONED_IN', fromId: 'p1', toId: 'pulse1' },
      { type: 'MENTIONED_IN', fromId: 'p1', toId: 'offscreen' },
      { type: 'EXTRACTED_FROM', fromId: 'x', toId: 'x' },
    ]
    const visible = new Set(['p1', 'pulse1', 'x'])
    const keys = sweptEdgeKeys(edges, visible)
    const drawn = buildSweptRelationships({
      edges,
      visibleIds: visible,
      existing: new Set<string>(),
      palette,
    })
    // A key for every drawn edge and nothing more — otherwise a hand-built
    // family stands down for an edge the sweep then declines to draw, and the
    // relationship disappears from the canvas entirely.
    expect(keys.size).toBe(drawn.length)
  })

  it('drops self-loops', () => {
    expect(
      build([{ type: 'EXTRACTED_FROM', fromId: 'x', toId: 'x' }], ['x'])
    ).toHaveLength(0)
  })

  it('dedupes repeated rows within one sweep', () => {
    const rels = build(
      [
        { type: 'MENTIONED_IN', fromId: 'p1', toId: 'pulse1' },
        { type: 'MENTIONED_IN', fromId: 'p1', toId: 'pulse1' },
      ],
      ['p1', 'pulse1']
    )
    expect(rels).toHaveLength(1)
  })

  it('gives every swept edge a colour the legend can decode', () => {
    // The whole point of the `otherEdge` row: a relationship type added to the
    // graph tomorrow must still arrive decodable and switchable, with no code
    // change here. An undecodable colour would mean a permanently unfilterable
    // edge (applyBloomTypeFilters never hides what it cannot name).
    const types = [
      'INITIATED_BY',
      'CREATED_BY',
      'MENTIONED_IN',
      'CONNECTED_TO',
      'EXTRACTED_FROM',
      'WEAVES',
      'WOVEN_FOR',
      'SOME_FUTURE_EDGE',
    ]
    for (const type of types) {
      const rels = build([{ type, fromId: 'a', toId: 'b' }], ['a', 'b'])
      expect(rels).toHaveLength(1)
      expect(relationshipTypeKey(rels[0])).not.toBeNull()
    }
  })

  it('returns nothing for an empty or absent edge list', () => {
    expect(build([], ['a'])).toEqual([])
    expect(
      buildSweptRelationships({
        edges: null,
        visibleIds: new Set(['a']),
        existing: new Set(),
        palette,
      })
    ).toEqual([])
  })

  it('skips malformed rows rather than emitting a broken relationship', () => {
    const rels = build(
      [
        { type: '', fromId: 'a', toId: 'b' },
        { type: 'MENTIONED_IN', fromId: '', toId: 'b' },
        { type: 'MENTIONED_IN', fromId: 'a', toId: '' },
      ] as SweptEdge[],
      ['a', 'b']
    )
    expect(rels).toEqual([])
  })
})
