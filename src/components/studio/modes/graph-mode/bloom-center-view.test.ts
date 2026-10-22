/**
 * GOAL-383 — center on a node.
 *
 * Pins the centered view's derivation: the centered node plus its one-hop
 * neighbours, growth (never replacement) as more nodes are expanded, and that
 * NVL is never handed an edge to a node the view isn't showing.
 */
import type { Node, Relationship } from '@neo4j-nvl/base'
import { buildCenteredCanvas } from './bloom-center-view'

const node = (id: string): Node => ({ id, caption: id })
const rel = (from: string, to: string): Relationship => ({
  id: `${from}-${to}`,
  from,
  to,
})

// a — b — c — d, plus b — e and an island f.
const canvas = {
  nodes: ['a', 'b', 'c', 'd', 'e', 'f'].map(node),
  relationships: [rel('a', 'b'), rel('b', 'c'), rel('c', 'd'), rel('e', 'b')],
}

const ids = (expanded: string[]) =>
  buildCenteredCanvas(canvas, expanded).nodes.map((n) => n.id)

describe('buildCenteredCanvas', () => {
  it('shows the centered node and its one-hop neighbours, in either direction', () => {
    // b is the `to` of a→b and e→b and the `from` of b→c.
    expect(ids(['b'])).toEqual(['a', 'b', 'c', 'e'])
  })

  it('adds an expanded neighbour’s connections and keeps what was on screen', () => {
    const before = ids(['b'])
    const after = ids(['b', 'c'])
    expect(after).toEqual(['a', 'b', 'c', 'd', 'e'])
    for (const id of before) expect(after).toContain(id)
  })

  it('keeps growing across repeated expansions', () => {
    expect(ids(['a'])).toEqual(['a', 'b'])
    expect(ids(['a', 'b'])).toEqual(['a', 'b', 'c', 'e'])
    expect(ids(['a', 'b', 'c'])).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('shows a node with no connections on its own', () => {
    expect(ids(['f'])).toEqual(['f'])
  })

  it('only hands NVL edges whose endpoints are both shown', () => {
    const { nodes, relationships } = buildCenteredCanvas(canvas, ['a'])
    const shown = new Set(nodes.map((n) => n.id))
    expect(relationships.map((r) => r.id)).toEqual(['a-b'])
    for (const r of relationships) {
      expect(shown.has(String(r.from))).toBe(true)
      expect(shown.has(String(r.to))).toBe(true)
    }
  })

  it('draws an edge between two neighbours that did not pull each other in', () => {
    const triangle = {
      nodes: ['x', 'y', 'z'].map(node),
      relationships: [rel('x', 'y'), rel('x', 'z'), rel('y', 'z')],
    }
    const { relationships } = buildCenteredCanvas(triangle, ['x'])
    expect(relationships.map((r) => r.id)).toContain('y-z')
  })

  it('ignores an edge to a node that is not on the canvas', () => {
    const dangling = {
      nodes: [node('a')],
      relationships: [rel('a', 'ghost')],
    }
    const { nodes, relationships } = buildCenteredCanvas(dangling, ['a'])
    expect(nodes.map((n) => n.id)).toEqual(['a'])
    expect(relationships).toEqual([])
  })

  it('is empty when the centered node has left the canvas', () => {
    expect(buildCenteredCanvas(canvas, ['gone'])).toEqual({
      nodes: [],
      relationships: [],
    })
  })
})
