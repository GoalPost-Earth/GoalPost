/**
 * GOAL-386 — imported organizations on the in-field Bloom canvas.
 *
 * Pins:
 *   1. A field's organizations are painted as nodes, in a colour of their own
 *      (not the person pink, not the WeSpace field teal) and with a building
 *      icon, in both modes.
 *   2. That colour decodes to the `Organization` legend row — uncontested, so
 *      the row is offered and labels the node.
 *   3. A person's AFFILIATED_WITH edge to an organization is drawn, captioned
 *      and decoded by its own `Affiliated with` row.
 *   4. Switching Organization off hides the nodes AND their affiliation edges,
 *      and leaves the people.
 */
import type { Node } from '@neo4j-nvl/base'
import {
  ORGANIZATION_ICON,
  buildBloomCanvas,
  type BloomGraphInput,
} from './bloom-graph-builder'
import {
  BLOOM_PALETTE_DARK,
  BLOOM_PALETTE_LIGHT,
  type BloomPalette,
} from './bloom-palette'
import {
  applyBloomTypeFilters,
  countNodeTypes,
  countRelationshipTypes,
  nodeTypeKey,
  nodeTypeLabel,
  relationshipTypeKey,
} from './bloom-type-registry'

function fieldInput(palette: BloomPalette): BloomGraphInput {
  return {
    overlay: null,
    isDark: palette === BLOOM_PALETTE_DARK,
    palette,
    inField: true,
    inSpace: false,
    pulses: [],
    persons: [
      { id: 'person-ama', name: 'Ama Mensah', focalType: 'PersonPulse' },
      { id: 'person-kofi', name: 'Kofi Osei', focalType: 'PersonPulse' },
    ],
    organizations: [{ id: 'organization_acme', name: 'Acme Cooperative' }],
    weaves: [],
    resonances: [],
    connections: [],
    pulseAuthors: [],
    subContexts: [],
    fieldAnchor: null,
    inFieldSpaceKind: 'WeSpace',
    documentProvenance: { relationships: [], documentIds: new Set() },
    sweptEdges: [
      { type: 'AFFILIATED_WITH', fromId: 'person-ama', toId: 'organization_acme' },
      // An organization not on the canvas — must not dangle.
      { type: 'AFFILIATED_WITH', fromId: 'person-kofi', toId: 'organization_gone' },
    ],
    fieldContexts: [],
    spaceAnchor: null,
    inSpacePeople: [],
    spaces: [],
    currentUserId: null,
    ownedSpaceIds: new Set(),
  }
}

const orgNode = (nodes: Node[]) => nodes.find((n) => n.id === 'organization_acme')

describe.each([
  ['dark', BLOOM_PALETTE_DARK],
  ['light', BLOOM_PALETTE_LIGHT],
])('in-field organizations (%s)', (_mode, palette) => {
  it('paints each organization as a node with its own colour and icon', () => {
    const { nodes } = buildBloomCanvas(fieldInput(palette))
    const org = orgNode(nodes)
    expect(org).toMatchObject({
      caption: 'Acme Cooperative',
      color: palette.organization,
      icon: ORGANIZATION_ICON,
    })
    expect(org?.color).not.toBe(palette.person)
    expect(org?.color).not.toBe(palette.field.WeSpace)
    expect(org?.color).not.toBe(palette.field.MeSpace)
  })

  it('decodes to the Organization row, uncontested', () => {
    const org = orgNode(buildBloomCanvas(fieldInput(palette)).nodes)!
    expect(nodeTypeKey(org)).toBe('organization')
    expect(nodeTypeLabel(org)).toBe('Organization')
  })

  it('draws a person’s AFFILIATED_WITH edge, and only to a rendered org', () => {
    const { relationships } = buildBloomCanvas(fieldInput(palette))
    const affiliated = relationships.filter(
      (r) => relationshipTypeKey(r) === 'affiliated-with'
    )
    expect(affiliated).toHaveLength(1)
    expect(affiliated[0]).toMatchObject({
      from: 'person-ama',
      to: 'organization_acme',
      caption: 'AFFILIATED WITH',
    })
  })

  it('counts both for the legend', () => {
    const canvas = buildBloomCanvas(fieldInput(palette))
    expect(countNodeTypes(canvas.nodes).get('organization')).toBe(1)
    expect(
      countRelationshipTypes(canvas.relationships).get('affiliated-with')
    ).toBe(1)
  })

  it('switching Organization off hides the orgs and their edges, keeps people', () => {
    const filtered = applyBloomTypeFilters(
      buildBloomCanvas(fieldInput(palette)),
      new Set(['organization'])
    )
    expect(orgNode(filtered.nodes)).toBeUndefined()
    expect(filtered.nodes.map((n) => n.id).sort()).toEqual([
      'person-ama',
      'person-kofi',
    ])
    expect(filtered.relationships).toHaveLength(0)
  })
})

it('organizations stay off the root and in-space canvases', () => {
  const input = fieldInput(BLOOM_PALETTE_DARK)
  const { nodes } = buildBloomCanvas({ ...input, inField: false, inSpace: true })
  expect(orgNode(nodes)).toBeUndefined()
})
