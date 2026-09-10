/**
 * Canvas search ranking (GOAL — "search within this field context").
 *
 * The point of these cases is that a plain `caption.includes(q)` filter is not
 * good enough on a field carrying a hundred-plus nodes: the node the viewer is
 * reaching for has to come out on top, and the order has to be stable between
 * identical queries or the list reshuffles under the arrow keys.
 */
import type { Node } from '@neo4j-nvl/base'
import {
  matchBloomNodes,
  toSearchEntries,
  type BloomSearchEntry,
} from './bloom-search-match'
import { BLOOM_PALETTE_DARK } from './bloom-palette'
import { NODE_STYLE } from '@/lib/cypher-generator/node-style'

const entry = (caption: string, id = caption): BloomSearchEntry => ({
  id,
  caption,
  color: undefined,
  typeLabel: null,
})

const captions = (rows: BloomSearchEntry[]): string[] =>
  rows.map((r) => r.caption)

describe('matchBloomNodes', () => {
  it('returns the canvas as-is (capped) for an empty query', () => {
    const entries = [entry('Alpha'), entry('Beta'), entry('Gamma')]
    expect(captions(matchBloomNodes(entries, ''))).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ])
    expect(captions(matchBloomNodes(entries, '   '))).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ])
    expect(matchBloomNodes(entries, '', 2)).toHaveLength(2)
  })

  it('is uncapped by default, so callers get the true match count', () => {
    // The panel slices for rendering; the counter and the next/previous
    // arrows need every hit, or "50 of 120" would report 50.
    const entries = Array.from({ length: 120 }, (_, i) => entry(`Care ${i}`))
    expect(matchBloomNodes(entries, 'care')).toHaveLength(120)
    expect(matchBloomNodes(entries, '')).toHaveLength(120)
  })

  it('is case-insensitive and trims the query', () => {
    const entries = [entry('Robert Damashek')]
    expect(captions(matchBloomNodes(entries, '  ROBERT '))).toEqual([
      'Robert Damashek',
    ])
  })

  it('ranks prefix and word-start hits above mid-word ones', () => {
    const entries = [
      entry('Problem framing'), // mid-word "rob"
      entry('Jarod Robertson'), // word start
      entry('Robert Damashek'), // caption prefix
    ]
    expect(captions(matchBloomNodes(entries, 'rob'))).toEqual([
      'Robert Damashek',
      'Jarod Robertson',
      'Problem framing',
    ])
  })

  it('puts an exact caption match first', () => {
    const entries = [entry('Care about care'), entry('Care')]
    expect(captions(matchBloomNodes(entries, 'care'))[0]).toBe('Care')
  })

  it('treats punctuation as a word boundary', () => {
    // "Series: Notes" — the hit after the colon+space is a word start, so it
    // must outrank a genuinely mid-word hit of the same query.
    const entries = [entry('Unnotable drift'), entry('The Agora Series: Notes')]
    expect(captions(matchBloomNodes(entries, 'notes'))).toEqual([
      'The Agora Series: Notes',
    ])
    expect(captions(matchBloomNodes(entries, 'not'))).toEqual([
      'The Agora Series: Notes',
      'Unnotable drift',
    ])
  })

  it('breaks ties on caption length, then on canvas order', () => {
    const entries = [
      entry('Care work in practice'),
      entry('Care work'),
      entry('Care wo'),
    ]
    expect(captions(matchBloomNodes(entries, 'care w'))).toEqual([
      'Care wo',
      'Care work',
      'Care work in practice',
    ])

    // Same tier AND same length → original canvas order decides, so repeated
    // identical queries never reshuffle the list.
    const sameLength = [entry('Care ax'), entry('Care bx')]
    expect(captions(matchBloomNodes(sameLength, 'care'))).toEqual([
      'Care ax',
      'Care bx',
    ])
  })

  it('drops non-matches and honours the limit', () => {
    const entries = [entry('Alpha'), entry('Beta'), entry('Alpine')]
    expect(captions(matchBloomNodes(entries, 'al'))).toEqual([
      'Alpha',
      'Alpine',
    ])
    expect(matchBloomNodes(entries, 'al', 1)).toHaveLength(1)
    expect(matchBloomNodes(entries, 'zzz')).toEqual([])
  })
})

describe('toSearchEntries', () => {
  it('decodes the type label off the painted colour', () => {
    const nodes: Node[] = [
      {
        id: 'p1',
        caption: 'Robert Damashek',
        color: BLOOM_PALETTE_DARK.person,
      } as Node,
    ]
    expect(toSearchEntries(nodes)[0]).toEqual({
      id: 'p1',
      caption: 'Robert Damashek',
      color: BLOOM_PALETTE_DARK.person,
      typeLabel: 'Person',
    })
  })

  it('falls back to the id when a node carries no caption, and tolerates an undecodable colour', () => {
    const nodes: Node[] = [{ id: 'x1', color: '#123456' } as Node]
    expect(toSearchEntries(nodes)[0]).toEqual({
      id: 'x1',
      caption: 'x1',
      color: '#123456',
      typeLabel: null,
    })
  })
})

describe('nodeTypeLabel via toSearchEntries — contested colours', () => {
  it('refuses to label a colour more than one row claims', () => {
    // The WeSpace field tint is also the overlay's Organization colour. Naming
    // the index winner would tell the viewer an :Organization is a WeSpace.
    const contested = NODE_STYLE.Organization.color
    const nodes: Node[] = [
      { id: 'o1', caption: 'Some Org', color: contested } as Node,
    ]
    expect(toSearchEntries(nodes)[0].typeLabel).toBeNull()
  })

  it('still labels an uncontested colour', () => {
    const nodes: Node[] = [
      {
        id: 'g1',
        caption: 'Ship it',
        color: BLOOM_PALETTE_DARK.pulse.goal,
      } as Node,
    ]
    expect(toSearchEntries(nodes)[0].typeLabel).toBe('Goal')
  })
})
