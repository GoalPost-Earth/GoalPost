'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import {
  dispatchOpenInfoDrawer,
  dispatchCloseInfoDrawer,
  type InfoEntityType,
} from '@/components/dashboard/entity-info-drawer'
import { useQuery } from '@apollo/client/react'
import type {
  ExternalCallbacks,
  HitTargets,
  Node,
  Relationship,
} from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { GET_ALL_ME_SPACES, GET_ALL_WE_SPACES } from '@/app/graphql/queries'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import { useFocalEntity } from '@/contexts'
import { focalEntityFromRoute } from '@/lib/focal-entity/route-matcher'
import type { FocalEntityType } from '@/lib/focal-entity/types'
import type { NvlRefHandle } from '@/components/graph/visualizer'
import { GraphLoadingState } from './graph-loading-state'
import { BloomLegend } from './bloom-legend'
import {
  SPACE_COLOR,
  FIELD_COLOR,
  PULSE_COLOR,
  PERSON_COLOR,
  STRUCTURAL_EDGE_COLOR,
  RESONANCE_EDGE_COLOR,
  INITIATED_EDGE_COLOR,
} from './bloom-palette'
import {
  useBloomOverlay,
  type BloomOverlay,
} from '../../bloom-overlay-context'
import {
  useVisibleEntities,
  type VisibleEntity,
} from '../../visible-entities-context'

/**
 * Bloom Exploration — the native NVL rendering of the user's spaces.
 *
 * Per kb/01-glossary.md: "A separate, more open-ended graph surface that
 * exposes native Neo4j NVL exploration capabilities ... with minimal
 * GoalPost-specific opinionation."
 *
 * Architectural rule (set by the user): Bloom does NOT fetch — it is a
 * pure visual transform of the same Apollo-cached data the Dashboard
 * cards and Graph view already loaded. Toggling between the three
 * canvas views is therefore a zero-network frontend change.
 *
 * Visual differentiation from Graph view:
 *   - Graph view → custom `EntityBubble` HTML nodes (GoalPost-styled).
 *   - Bloom view → native NVL nodes (caption + color + size only),
 *     letting NVL render and interact with them as it would by default.
 */

// Warm the NVL chunk as soon as this module is parsed. The fetch runs in
// parallel with the Apollo queries above so by the time the cache resolves
// the chunk is cached and next/dynamic skips the "Preparing canvas" flash
// that otherwise stacks behind the data skeleton.
const visualizerChunk = import('@/components/graph/visualizer').then(
  (mod) => mod.GraphVisualizer
)

const GraphVisualizer = dynamic(() => visualizerChunk, {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full bg-slate-950">
      <GraphLoadingState label="Preparing canvas" />
    </div>
  ),
})

const EMPTY_RELATIONSHIPS: Relationship[] = []

// How long to wait after a single click before treating it as a drill — long
// enough for a double-click (drawer) to arrive and cancel it.
const SINGLE_CLICK_DELAY = 250

/**
 * Map a Neo4j label (as carried on `NVLNode.labels` from the cypher
 * generator / neighborhood route) to the drawer's `InfoEntityType`.
 *
 * Every pulse subtype collapses to 'Pulse' — `PulseDetailsBody` resolves
 * the concrete __typename itself. Person/User/PersonPulse collapse to
 * 'Person' for the same reason. Anything we don't recognise (e.g. the
 * `Community` anchor, or a label the generator started returning before
 * this map caught up) returns null — Bloom falls back to its inline
 * minimal panel for those, which is strictly safer than dispatching the
 * drawer with a bogus type.
 */
const LABEL_TO_INFO_TYPE: Record<string, InfoEntityType> = {
  MeSpace: 'MeSpace',
  WeSpace: 'WeSpace',
  FieldContext: 'FieldContext',
  GoalPulse: 'Pulse',
  ResourcePulse: 'Pulse',
  StoryPulse: 'Pulse',
  CarePulse: 'Pulse',
  CoreValuePulse: 'Pulse',
  FieldPulse: 'Pulse',
  Pulse: 'Pulse',
  Person: 'Person',
  User: 'Person',
  PersonPulse: 'Person',
  Document: 'Document',
  ResonanceLink: 'ResonanceLink',
}

function labelsToInfoEntityType(
  labels: string[] | undefined
): InfoEntityType | null {
  if (!labels) return null
  for (const l of labels) {
    const mapped = LABEL_TO_INFO_TYPE[l]
    if (mapped) return mapped
  }
  return null
}

/**
 * Heuristic fallback when an overlay node arrives without `labels` (older
 * chat threads cached from before the labels-on-NVLNode patch, or an
 * occasional model emission that prunes the field from the BLOOM_GRAPH_OVERLAY
 * JSON). GoalPost id prefixes are stable conventions written by the
 * server-side creation paths:
 *   - `me_`       lib/validation/space-validation.ts (app-created MeSpace)
 *   - `mespace_`  scripts/migrate-prod-to-dev.ts (prod-migrated MeSpace)
 *   - `context_`  lib/chat/hitl.ts (FieldContext) — production path
 *   - `ctx_`      legacy / fixture data only; kept as a safety net
 *   - `pulse_`    api/pulse/create-from-conversation
 *   - `rl_`       api/resonance/suggestions/[id]/accept (ResonanceLink)
 *   - `doc_`      Document
 *   - `person_`   lib/chat/hitl.ts (Person — HITL-created profiles)
 *
 * Ambiguity: legacy Persons and all WeSpaces use bare UUIDs (no prefix).
 * For those, we return null and let the caller fall back to the inline
 * minimal panel rather than guessing wrong and opening the drawer at
 * the wrong entity. (`chunk_` and `log_` exist elsewhere in the codebase
 * but are not exposed as Bloom entities, so they're intentionally
 * absent from this table.)
 */
function idPrefixToInfoEntityType(id: string): InfoEntityType | null {
  if (id.startsWith('me_') || id.startsWith('mespace_')) return 'MeSpace'
  if (id.startsWith('ctx_') || id.startsWith('context_')) return 'FieldContext'
  if (id.startsWith('pulse_')) return 'Pulse'
  if (id.startsWith('rl_')) return 'ResonanceLink'
  if (id.startsWith('doc_')) return 'Document'
  if (id.startsWith('person_')) return 'Person'
  return null
}

/**
 * Final fallback: derive the entity type from the NVL node's color. The
 * cypher generator's `styleFor` (lib/cypher-generator/execute.ts:81) and
 * the neighborhood route's `NODE_STYLE` (api/graph/neighborhood/route.ts:49)
 * both encode the entity type via a stable color palette — so even when
 * `labels` is missing AND the id is a bare UUID (legacy Users, all
 * WeSpaces), the color hint is still present on the overlay node.
 *
 * MeSpace vs WeSpace cannot be distinguished by color alone (both
 * '#86efac'); we resolve that ambiguity by treating bare-UUID green
 * nodes as WeSpaces (the only Space type that uses bare UUIDs in prod
 * — MeSpaces are always prefixed `me_*` or `mespace_*` and would have
 * been caught by the prefix table above).
 *
 * Pulse subtypes have distinct colors but all collapse to the 'Pulse'
 * drawer type — `PulseDetailsBody` resolves the concrete __typename
 * via its own GraphQL query.
 */
function colorToInfoEntityType(
  color: string | undefined
): InfoEntityType | null {
  if (!color) return null
  switch (color.toLowerCase()) {
    case '#86efac':
      return 'WeSpace'
    case '#fde68a':
      return 'FieldContext'
    case '#f9a8d4':
      return 'Person'
    case '#93c5fd':
    case '#a7f3d0':
    case '#c4b5fd':
    case '#fca5a5':
    case '#fcd34d':
      return 'Pulse'
    case '#d8b4fe':
    case '#e9d5ff':
      return 'ResonanceLink'
    default:
      return null
  }
}

/**
 * Resolve an overlay node's id to an InfoEntityType using the three-tier
 * cascade (precise labels → stable id prefix → last-resort color). Shared by
 * `handleNodeClick` (which drawer-type it maps to) and `handleNodeNavigate`
 * (whether it has a drill route) so the two paths can never disagree on what
 * an overlay node *is*.
 */
function resolveOverlayEntityType(
  overlay: BloomOverlay,
  id: string
): InfoEntityType | null {
  const overlayNode = overlay.nodes.find((n) => n.id === id)
  return (
    labelsToInfoEntityType(overlayNode?.labels) ??
    idPrefixToInfoEntityType(id) ??
    colorToInfoEntityType(overlayNode?.color)
  )
}

const SPACE_SIZE = {
  MeSpace: 44,
  WeSpace: 48,
} as const

const FIELD_SIZE = 36

const PULSE_SIZE = 32

const PERSON_SIZE = 30
// The root "You" hub reads slightly larger than its spokes — it's the
// identity node every space radiates from.
const YOU_SIZE = 44


// Minimal read shape for the owner/member person fields on the space
// queries — the generated MeSpace | WeSpace union is awkward to narrow inline.
type RawPersonLite = {
  id: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
}

// Neo4j-GraphQL relationship fields can arrive as a single object or a
// single-element array depending on the selection — normalize both.
function firstOf<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : (v ?? undefined)
}

function composeName(p: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
}): string {
  const composed = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
  return p.name?.trim() || composed || 'Unnamed'
}

interface SpaceRecord {
  id: string
  name: string
  type: 'MeSpace' | 'WeSpace'
}

interface FieldContextRecord {
  id: string
  name: string
  spaceKind: 'MeSpace' | 'WeSpace'
}

interface PulseRecord {
  id: string
  name: string
  pulseType: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
  focalType: FocalEntityType
}

interface ResonanceRecord {
  id: string
  sourceId: string
  targetId: string
  label: string
}

interface PersonRecord {
  id: string
  name: string
  // Owner is a User; field-attached people are PersonPulses. We branch the
  // focal-entity machinery on this exactly like SpatialView does.
  focalType: 'User' | 'PersonPulse'
}

// In-space people carry their relationship to the space so the hub-and-spoke
// edge picks the right caption (owns vs member).
interface SpacePersonRecord {
  id: string
  name: string
  role: 'OWNER' | 'MEMBER'
}

export const BloomView: FC = () => {
  const { setFocalEntity } = useFocalEntity()
  const { overlay, clearOverlay } = useBloomOverlay()
  const { publish: publishVisibleEntities } = useVisibleEntities()
  const nvlRef = useRef<NvlRefHandle | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  // Hover-driven cursor. NVL renders native canvas nodes, so there's no
  // HTML element we can put `cursor: pointer` on the way we do for the
  // EntityBubble in SpatialView. We bind a wrapper ref + an `onHover`
  // callback and mutate `style.cursor` directly when the mouse is over
  // a node — going through React state for every mousemove would
  // re-render the canvas chunk on every pixel.
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null)
  const isHoveringNodeRef = useRef(false)
  const router = useRouter()
  // Single-click drills, double-click opens the drawer. NVL has no built-in
  // single-vs-double debounce — it emits raw DOM events, so a double-click
  // fires two `onNodeClick`s then `onNodeDoubleClick`. A naive single=drill
  // wiring would navigate away on the first click before the double-click
  // drawer intent registers. So we hold the drill in a timer
  // (`clickTimerRef`): if a second click (or `onNodeDoubleClick`) arrives
  // first, we cancel the pending drill and open the drawer instead.
  const clickTimerRef = useRef<number | null>(null)

  // "In-space" / "in-field" are URL concepts, not focal-entity concepts.
  // Reading `sessionContext.activeSpaceId` would conflate the user's
  // *persisted* last-space with the *current route* — at the dashboard
  // root that would render field contexts when we should be showing
  // top-level spaces. Drive the scope strictly from the pathname.
  // Overlay still takes priority over both modes.
  const pathname = usePathname()
  const { activeSpaceId, activeFieldId } = useMemo(() => {
    const match = focalEntityFromRoute(pathname)
    if (!match) return { activeSpaceId: null, activeFieldId: null }
    if (match.type === 'MeSpace' || match.type === 'WeSpace') {
      return { activeSpaceId: match.id, activeFieldId: null }
    }
    if (match.type === 'FieldContext') {
      return { activeSpaceId: null, activeFieldId: match.id }
    }
    return { activeSpaceId: null, activeFieldId: null }
  }, [pathname])
  const inSpace = !!activeSpaceId && !overlay
  const inField = !!activeFieldId && !overlay

  // Identical Apollo queries to SpacesOverview + SpatialView. `cache-first`
  // hits the warm cache on every flip — zero network round-trip.
  const { data: meData, loading: meLoading } = useQuery(GET_ALL_ME_SPACES, {
    fetchPolicy: 'cache-first',
  })
  const { data: weData, loading: weLoading } = useQuery(GET_ALL_WE_SPACES, {
    fetchPolicy: 'cache-first',
  })

  // In-space details — `cache-first` is intentional even on cold load:
  // `CanvasHost` keeps `SpaceDashboardView` mounted at this route (under
  // `visibility:hidden`) regardless of canvas view, and that component
  // always fires the `cache-and-network` `GET_SPACE_DETAILS` fetch.
  // Apollo dedupes our read against that in-flight request — Bloom gets
  // the result the moment it resolves with no double round-trip.
  const { data: spaceDetailsData, loading: spaceDetailsLoading } = useQuery(
    GET_SPACE_DETAILS,
    {
      variables: { spaceId: activeSpaceId ?? '' },
      skip: !activeSpaceId,
      fetchPolicy: 'cache-first',
    }
  )

  // In-field details — `cache-first` mirrors the in-space rationale above.
  // The FieldContext detail page already fires `GET_FIELD_CONTEXT_DETAILS`
  // because `CanvasHost` keeps the route content mounted under
  // `visibility:hidden` regardless of the active canvas view, so flipping
  // into Bloom reads the cached result with no extra round-trip.
  const { data: fieldDetailsData, loading: fieldDetailsLoading } = useQuery(
    GET_FIELD_CONTEXT_DETAILS,
    {
      variables: { contextId: activeFieldId ?? '' },
      skip: !activeFieldId,
      fetchPolicy: 'cache-first',
    }
  )

  // People in the active field — the parent space's owner + every Person
  // attached via HAS_PERSON. SpatialView already runs this exact query at
  // this route, so `cache-first` reads the warm cache (Apollo dedupes a
  // cold load against the in-flight request). Bloom needs these to render
  // the INITIATED_BY edges with a real person endpoint to point at.
  const { data: fieldPeopleData } = useQuery(GET_FIELD_CONTEXT_PEOPLE, {
    variables: { contextId: activeFieldId ?? '' },
    skip: !activeFieldId,
    fetchPolicy: 'cache-first',
  })

  const loading = inField
    ? fieldDetailsLoading
    : inSpace
      ? spaceDetailsLoading
      : meLoading || weLoading

  const spaces: SpaceRecord[] = useMemo(() => {
    const me = (meData?.meSpaces ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      type: 'MeSpace' as const,
    }))
    const we = (weData?.weSpaces ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      type: 'WeSpace' as const,
    }))
    return [...me, ...we]
  }, [meData, weData])

  const fieldContexts: FieldContextRecord[] = useMemo(() => {
    if (!inSpace) return []
    const space = spaceDetailsData?.spaces?.[0]
    if (!space) return []
    const spaceKind =
      space.__typename === 'MeSpace' ? 'MeSpace' : 'WeSpace'
    const contexts = ('contexts' in space ? space.contexts : undefined) ?? []
    return contexts.map((ctx) => ({
      id: ctx.id,
      name: ctx.title || 'Untitled field',
      spaceKind,
    }))
  }, [inSpace, spaceDetailsData])

  const pulses: PulseRecord[] = useMemo(() => {
    if (!inField || !fieldDetailsData) return []
    const make = (
      list: Array<{ id: string; title?: string | null }> | undefined,
      pulseType: PulseRecord['pulseType'],
      focalType: FocalEntityType
    ): PulseRecord[] =>
      (list ?? []).map((pulse) => ({
        id: pulse.id,
        name: pulse.title || 'Untitled pulse',
        pulseType,
        focalType,
      }))
    return [
      ...make(fieldDetailsData.goalPulses, 'goal', 'GoalPulse'),
      ...make(fieldDetailsData.resourcePulses, 'resource', 'ResourcePulse'),
      ...make(fieldDetailsData.storyPulses, 'story', 'StoryPulse'),
      ...make(fieldDetailsData.carePulses, 'care', 'CarePulse'),
      ...make(
        fieldDetailsData.coreValuePulses,
        'coreValue',
        'CoreValuePulse'
      ),
    ]
  }, [inField, fieldDetailsData])

  // People to render alongside the pulses in-field: the parent space's
  // owner + every member of that space + any Person attached to the field.
  // These are the endpoints the INITIATED_BY edges point at — without them
  // NVL would drop every initiated edge as dangling. Mirrors SpatialView's
  // `persons` memo.
  const persons: PersonRecord[] = useMemo(() => {
    if (!inField) return []
    type RawPerson = {
      id: string
      name?: string | null
      firstName?: string | null
      lastName?: string | null
    }
    const toRecord = (
      p: RawPerson,
      focalType: PersonRecord['focalType']
    ): PersonRecord => {
      const composed = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
      return {
        id: p.id,
        name: p.name?.trim() || composed || 'Unnamed',
        focalType,
      }
    }
    const fieldCtx = (
      fieldPeopleData as
        | {
            fieldContexts?: Array<{
              people?: RawPerson[]
              meSpace?: Array<{
                owner?: RawPerson[]
                members?: Array<{ member?: RawPerson[] } | null>
              }>
              weSpace?: Array<{
                owner?: RawPerson[]
                members?: Array<{ member?: RawPerson[] } | null>
              }>
            }>
          }
        | undefined
    )?.fieldContexts?.[0]
    if (!fieldCtx) return []
    // A field belongs to exactly one space (MeSpace or WeSpace).
    const space = fieldCtx.weSpace?.[0] ?? fieldCtx.meSpace?.[0] ?? null
    const owner = space?.owner?.[0] ?? null
    const seen = new Set<string>()
    const records: PersonRecord[] = []
    if (owner?.id) {
      seen.add(owner.id)
      records.push(toRecord(owner, 'User'))
    }
    // Parent-space members participate in the field too — surface them so they
    // appear and so member-authored pulses keep their INITIATED_BY edge (NVL
    // drops any edge whose person endpoint isn't a visible node).
    for (const m of space?.members ?? []) {
      const mm = m?.member?.[0]
      if (!mm?.id || seen.has(mm.id)) continue
      seen.add(mm.id)
      records.push(toRecord(mm, 'User'))
    }
    for (const p of fieldCtx.people ?? []) {
      if (!p?.id || seen.has(p.id)) continue
      seen.add(p.id)
      records.push(toRecord(p, 'PersonPulse'))
    }
    return records
  }, [inField, fieldPeopleData])

  // Resonance edges between pulses inside the active field. The Apollo
  // payload only resolves `source`/`target` when both pulse subtype
  // fragments matched (i.e. both endpoints are pulse entities), so we
  // filter to entries with both ids present — that drops any edge whose
  // endpoint is a non-pulse / inaccessible node without breaking the
  // visualisation.
  const resonances: ResonanceRecord[] = useMemo(() => {
    if (!inField || !fieldDetailsData) return []
    const context = fieldDetailsData.fieldContexts?.[0]
    const links = (context?.resonancesInContext ?? []) as Array<{
      id: string
      label?: string | null
      source?: Array<{ id?: string | null } | null> | null
      target?: Array<{ id?: string | null } | null> | null
    }>
    return links.flatMap((link) => {
      const sourceId = link.source?.[0]?.id
      const targetId = link.target?.[0]?.id
      if (!sourceId || !targetId) return []
      return [
        {
          id: link.id,
          sourceId,
          targetId,
          label: link.label ?? '',
        },
      ]
    })
  }, [inField, fieldDetailsData])

  // The current user — owner of the (single) MeSpace per the one-MeSpace
  // invariant. Drives the root "You" hub node and its owns/member edges out
  // to every space.
  const currentUserId = useMemo<string | null>(() => {
    const owner = firstOf(
      (
        meData?.meSpaces?.[0] as
          | { owner?: RawPersonLite | RawPersonLite[] | null }
          | undefined
      )?.owner
    )
    return owner?.id ?? null
  }, [meData])

  // In-space scope: the active space's owner + members, rendered as person
  // spokes off the space hub. Each carries its role so the edge reads
  // "owns" or "member".
  const inSpacePeople = useMemo<SpacePersonRecord[]>(() => {
    if (!inSpace) return []
    const space = spaceDetailsData?.spaces?.[0] as
      | {
          owner?: RawPersonLite | RawPersonLite[] | null
          members?: Array<{
            member?: RawPersonLite | RawPersonLite[] | null
          } | null> | null
        }
      | undefined
    if (!space) return []
    const out: SpacePersonRecord[] = []
    const seen = new Set<string>()
    const owner = firstOf(space.owner)
    if (owner?.id) {
      seen.add(owner.id)
      out.push({ id: owner.id, name: composeName(owner), role: 'OWNER' })
    }
    for (const m of space.members ?? []) {
      const mm = firstOf(m?.member)
      if (!mm?.id || seen.has(mm.id)) continue
      seen.add(mm.id)
      out.push({ id: mm.id, name: composeName(mm), role: 'MEMBER' })
    }
    return out
  }, [inSpace, spaceDetailsData])

  // The space itself, rendered as the central hub in its in-space view.
  const spaceAnchor = useMemo(() => {
    if (!inSpace || !activeSpaceId) return null
    const space = spaceDetailsData?.spaces?.[0]
    if (!space) return null
    const kind: 'MeSpace' | 'WeSpace' =
      space.__typename === 'MeSpace' ? 'MeSpace' : 'WeSpace'
    return { id: activeSpaceId, name: space.name || 'Space', kind }
  }, [inSpace, activeSpaceId, spaceDetailsData])

  // Native NVL nodes — caption / color / size only. NVL paints these
  // directly without any HTML container; that's the "minimal GoalPost
  // opinionation" the kb calls out.
  //
  // No x/y is set on any node: with `layout: 'forceDirected'`, supplying
  // positions makes NVL treat the layout as already-settled and the
  // simulation never runs until the user disturbs a node. Letting NVL
  // place everything from scratch is what makes the force-directed shape
  // appear on first load.
  //
  // Precedence:
  //   1. Overlay (chat-pushed subgraph) — always wins; cleared via the
  //      "Custom view from chat" chip in the canvas header.
  //   2. In-field scope — the active FieldContext's pulses.
  //   3. In-space scope — the active Space's field contexts.
  //   4. Default — the user's MeSpace + WeSpace cluster.
  const nodes: Node[] = useMemo(() => {
    if (overlay) {
      return overlay.nodes.map(
        (n) =>
          ({
            id: n.id,
            caption: n.caption ?? n.id,
            color: n.color ?? '#cbd5e1',
            size: n.size ?? 30,
          }) as Node
      )
    }
    if (inField) {
      const pulseNodes = pulses.map(
        (pulse) =>
          ({
            id: pulse.id,
            caption: pulse.name,
            color: PULSE_COLOR[pulse.pulseType],
            size: PULSE_SIZE,
          }) as Node
      )
      const personNodes = persons.map(
        (person) =>
          ({
            id: person.id,
            caption: person.name,
            color: PERSON_COLOR,
            size: PERSON_SIZE,
          }) as Node
      )
      return [...pulseNodes, ...personNodes]
    }
    if (inSpace) {
      // Hub-and-spoke: the space anchors the cluster, its field contexts and
      // owner/members radiate off it via the structural edges below.
      const anchorNode: Node[] = spaceAnchor
        ? [
            {
              id: spaceAnchor.id,
              caption: spaceAnchor.name,
              color: SPACE_COLOR[spaceAnchor.kind],
              size: SPACE_SIZE[spaceAnchor.kind],
            } as Node,
          ]
        : []
      const fieldNodes = fieldContexts.map(
        (ctx) =>
          ({
            id: ctx.id,
            caption: ctx.name,
            color: FIELD_COLOR[ctx.spaceKind],
            size: FIELD_SIZE,
          }) as Node
      )
      const peopleNodes = inSpacePeople.map(
        (p) =>
          ({
            id: p.id,
            caption: p.name,
            color: PERSON_COLOR,
            size: PERSON_SIZE,
          }) as Node
      )
      return [...anchorNode, ...fieldNodes, ...peopleNodes]
    }
    // Root: the current user is the hub; each space hangs off it.
    const spaceNodes = spaces.map(
      (space) =>
        ({
          id: space.id,
          caption: space.name,
          color: SPACE_COLOR[space.type],
          size: SPACE_SIZE[space.type],
        }) as Node
    )
    const youNode: Node[] =
      currentUserId && spaces.length > 0
        ? [
            {
              id: currentUserId,
              caption: 'You',
              color: PERSON_COLOR,
              size: YOU_SIZE,
            } as Node,
          ]
        : []
    return [...youNode, ...spaceNodes]
  }, [
    overlay,
    inField,
    pulses,
    persons,
    inSpace,
    fieldContexts,
    spaces,
    spaceAnchor,
    inSpacePeople,
    currentUserId,
  ])

  const relationships: Relationship[] = useMemo(() => {
    // Dedupe defensively on `from|type|to` even when the backend should
    // already be sending unique edges — both the cypher-generator overlay
    // path and the Apollo resonance path have produced duplicates before,
    // and a doubled edge is more visually misleading than a missing one.
    const dedupe = (rels: Relationship[]): Relationship[] => {
      const seen = new Set<string>()
      const out: Relationship[] = []
      for (const r of rels) {
        const key = `${r.from}|${r.caption ?? ''}|${r.to}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push(r)
      }
      return out
    }
    if (overlay) {
      return dedupe(
        overlay.relationships.map(
          (r) =>
            ({
              id: r.id,
              from: r.from,
              to: r.to,
              caption: r.caption ?? '',
            }) as Relationship
        )
      )
    }
    if (inField) {
      // Endpoints that are actually rendered. Edges to anything off-screen
      // (a resonance into an inaccessible pulse, an initiator whose person
      // node didn't load) are dropped so NVL never draws a dangling arrow.
      const visibleIds = new Set<string>([
        ...pulses.map((p) => p.id),
        ...persons.map((p) => p.id),
      ])
      const edges: Relationship[] = []

      // RESONATES_WITH — pulse↔pulse semantic links. Built unconditionally
      // now (previously gated on `resonances.length > 0`); the dedupe below
      // handles the empty case, and most fields have zero resonances, so the
      // old guard is what made Bloom look edge-less next to the Graph view.
      for (const r of resonances) {
        if (!visibleIds.has(r.sourceId) || !visibleIds.has(r.targetId)) continue
        edges.push({
          id: `resonance-${r.id}`,
          from: r.sourceId,
          to: r.targetId,
          caption: r.label,
          color: RESONANCE_EDGE_COLOR,
          width: 2,
        } as Relationship)
      }

      // INITIATED_BY — pulse → the person who created it. This is the edge
      // every pulse-creation path actually writes (lib/chat/hitl.ts, the
      // create-from-conversation route, etc.), so it's the one that gives
      // Bloom visible structure. The generated GraphQL types don't surface
      // `initiatedBy`, so we read it through a narrow cast mirroring
      // SpatialView's relationships builder.
      const allPulses = [
        ...((fieldDetailsData?.goalPulses ?? []) as Array<{
          id: string
          initiatedBy?: Array<{ id: string }> | null
        }>),
        ...((fieldDetailsData?.resourcePulses ?? []) as Array<{
          id: string
          initiatedBy?: Array<{ id: string }> | null
        }>),
        ...((fieldDetailsData?.storyPulses ?? []) as Array<{
          id: string
          initiatedBy?: Array<{ id: string }> | null
        }>),
        ...((fieldDetailsData?.carePulses ?? []) as Array<{
          id: string
          initiatedBy?: Array<{ id: string }> | null
        }>),
        ...((fieldDetailsData?.coreValuePulses ?? []) as Array<{
          id: string
          initiatedBy?: Array<{ id: string }> | null
        }>),
      ]
      for (const pulse of allPulses) {
        if (!visibleIds.has(pulse.id)) continue
        const initiatorId = pulse.initiatedBy?.[0]?.id
        if (!initiatorId || !visibleIds.has(initiatorId)) continue
        edges.push({
          id: `initiated-by-${pulse.id}-${initiatorId}`,
          from: pulse.id,
          to: initiatorId,
          caption: 'initiated',
          color: INITIATED_EDGE_COLOR,
          width: 1.5,
        } as Relationship)
      }

      return dedupe(edges)
    }
    if (inSpace && spaceAnchor) {
      // Space —has→ each field context; owner/member —owns|member→ space.
      const visibleIds = new Set<string>([
        spaceAnchor.id,
        ...fieldContexts.map((f) => f.id),
        ...inSpacePeople.map((p) => p.id),
      ])
      const edges: Relationship[] = []
      for (const ctx of fieldContexts) {
        edges.push({
          id: `has-${spaceAnchor.id}-${ctx.id}`,
          from: spaceAnchor.id,
          to: ctx.id,
          caption: 'has',
          color: STRUCTURAL_EDGE_COLOR,
          width: 1.5,
        } as Relationship)
      }
      for (const p of inSpacePeople) {
        if (!visibleIds.has(p.id)) continue
        const owns = p.role === 'OWNER'
        edges.push({
          id: `${owns ? 'owns' : 'member'}-${p.id}-${spaceAnchor.id}`,
          from: p.id,
          to: spaceAnchor.id,
          caption: owns ? 'owns' : 'member',
          color: STRUCTURAL_EDGE_COLOR,
          width: 1.5,
        } as Relationship)
      }
      return dedupe(edges)
    }
    if (!inField && !inSpace) {
      // Root: the current user is the hub; each visible space hangs off it
      // with an `owns` (MeSpace, or a WeSpace they created) or `member`
      // (a WeSpace they only belong to) edge.
      if (!currentUserId || spaces.length === 0) return EMPTY_RELATIONSHIPS
      const ownedIds = new Set<string>([
        ...(meData?.meSpaces ?? []).map((s) => s.id),
        ...(weData?.weSpaces ?? [])
          .filter(
            (s) =>
              firstOf(
                (s as { owner?: RawPersonLite | RawPersonLite[] | null })
                  .owner
              )?.id === currentUserId
          )
          .map((s) => s.id),
      ])
      const edges: Relationship[] = spaces.map((space) => {
        const owns = ownedIds.has(space.id)
        return {
          id: `${owns ? 'owns' : 'member'}-${currentUserId}-${space.id}`,
          from: currentUserId,
          to: space.id,
          caption: owns ? 'owns' : 'member',
          color: STRUCTURAL_EDGE_COLOR,
          width: 1.5,
        } as Relationship
      })
      return dedupe(edges)
    }
    return EMPTY_RELATIONSHIPS
  }, [
    overlay,
    inField,
    resonances,
    pulses,
    persons,
    fieldDetailsData,
    inSpace,
    spaceAnchor,
    fieldContexts,
    inSpacePeople,
    currentUserId,
    spaces,
    meData,
    weData,
  ])

  // Publish whatever Bloom is currently rendering so the assistant can
  // recognise entities by name (e.g. "show me what is in JD's Tech Lab"
  // resolves to the WeSpace already on screen instead of fail-searching).
  // Each precedence branch maps to a typed entity list:
  //   - overlay   → its own bag (type inferred from caption since the
  //                 overlay payload does not carry a GoalPost type)
  //   - in-field  → the active FieldContext's pulses (typed by subtype)
  //   - in-space  → the active Space's field contexts
  //   - default   → the user's MeSpace + WeSpace cluster
  useEffect(() => {
    const bloomEntities: VisibleEntity[] = (() => {
      if (overlay) {
        return overlay.nodes.map((n) => ({
          id: n.id,
          name: n.caption ?? n.id,
          // Overlay payloads do not carry a typed label — surface as
          // "OverlayNode" so the model still has a hint.
          type: 'OverlayNode',
          source: 'bloom' as const,
        }))
      }
      if (inField) {
        // Pulses + the people now rendered as person nodes. Publishing
        // people lets the assistant resolve someone who is visibly on the
        // Bloom canvas by name instead of fail-searching.
        return [
          ...pulses.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.focalType as VisibleEntity['type'],
            source: 'bloom' as const,
          })),
          ...persons.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.focalType as VisibleEntity['type'],
            source: 'bloom' as const,
          })),
        ]
      }
      if (inSpace) {
        return fieldContexts.map((f) => ({
          id: f.id,
          name: f.name,
          type: 'FieldContext',
          source: 'bloom' as const,
        }))
      }
      return spaces.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        source: 'bloom' as const,
      }))
    })()
    publishVisibleEntities('bloom', bloomEntities)
  }, [
    overlay,
    inField,
    pulses,
    persons,
    inSpace,
    fieldContexts,
    spaces,
    publishVisibleEntities,
  ])

  const handleNodeClick = useCallback(
    (node: Node) => {
      const id = String(node.id)
      const label = typeof node.caption === 'string' ? node.caption : undefined
      // Overlay nodes carry their Neo4j labels through from the cypher
      // generator (NVLNode.labels). If we can map the primary label to
      // an InfoEntityType, open the unified drawer just like a default
      // Bloom node click. If not (e.g. `Community` anchor, or any label
      // that's not in our entity vocabulary), fall back to the inline
      // minimal panel — strictly safer than dispatching the drawer with
      // a guessed type.
      if (overlay) {
        // Three-tier resolution (labels → id prefix → color) lives in
        // `resolveOverlayEntityType`. Color works for legacy bare-UUID
        // Persons + WeSpaces that arrived through chat overlays before the
        // labels-on-NVLNode patch landed, so a chat user clicking an old
        // node still gets the unified drawer instead of the minimal inline
        // panel.
        const drawerType = resolveOverlayEntityType(overlay, id)
        if (drawerType) {
          dispatchOpenInfoDrawer({ type: drawerType, id, label })
          return
        }
        setSelectedNode(node)
        return
      }

      if (inField) {
        const pulse = pulses.find((p) => p.id === id)
        if (pulse) {
          setFocalEntity({
            type: pulse.focalType,
            id: pulse.id,
            focusedAt: new Date().toISOString(),
            source: 'manual',
          })
          dispatchOpenInfoDrawer({ type: 'Pulse', id: pulse.id, label })
          return
        }
        const person = persons.find((p) => p.id === id)
        if (person) {
          setFocalEntity({
            type: person.focalType,
            id: person.id,
            focusedAt: new Date().toISOString(),
            source: 'manual',
          })
          dispatchOpenInfoDrawer({ type: 'Person', id: person.id, label })
        }
        return
      }
      if (inSpace) {
        if (spaceAnchor && id === spaceAnchor.id) {
          setFocalEntity({
            type: spaceAnchor.kind,
            id: spaceAnchor.id,
            focusedAt: new Date().toISOString(),
            source: 'manual',
          })
          dispatchOpenInfoDrawer({
            type: spaceAnchor.kind,
            id: spaceAnchor.id,
            label,
          })
          return
        }
        const person = inSpacePeople.find((p) => p.id === id)
        if (person) {
          dispatchOpenInfoDrawer({ type: 'Person', id: person.id, label })
          return
        }
        const ctx = fieldContexts.find((f) => f.id === id)
        if (ctx) {
          setFocalEntity({
            type: 'FieldContext',
            id: ctx.id,
            focusedAt: new Date().toISOString(),
            source: 'manual',
          })
          dispatchOpenInfoDrawer({
            type: 'FieldContext',
            id: ctx.id,
            label,
          })
        }
        return
      }
      // Root scope. The "You" hub opens the current user's Person drawer.
      if (currentUserId && id === currentUserId) {
        dispatchOpenInfoDrawer({ type: 'Person', id: currentUserId, label })
        return
      }
      const space = spaces.find((s) => s.id === id)
      if (space) {
        setFocalEntity({
          type: space.type,
          id: space.id,
          focusedAt: new Date().toISOString(),
          source: 'manual',
        })
        dispatchOpenInfoDrawer({ type: space.type, id: space.id, label })
      }
    },
    [
      overlay,
      inField,
      pulses,
      persons,
      inSpace,
      spaceAnchor,
      inSpacePeople,
      currentUserId,
      fieldContexts,
      spaces,
      setFocalEntity,
    ]
  )

  // A single click drills *into* the entity by changing the route, which
  // re-scopes the canvas (scope is derived strictly from the pathname via
  // focalEntityFromRoute): a top-level space → its field contexts, an
  // in-space field → its pulses. These are the same dashboard routes the
  // drawer's "Open full page" CTA uses, so the studio canvas stays mounted
  // and re-scopes inward. A click on an overlay (chat custom-view) node that
  // resolves to a Space/FieldContext drills the same way (and clears the
  // overlay); pulses and people have no page route, so a click on them falls
  // back to opening the drawer. We close any drawer left open (e.g. from a
  // prior double-click) before navigating so it doesn't linger over the
  // freshly drilled-in scope.
  const handleNodeNavigate = useCallback(
    (node: Node) => {
      const id = String(node.id)
      // A chat-driven custom view is a *starting point* for exploration, not
      // a dead end. When a click lands on an overlay node that resolves to a
      // navigable entity (a Space or a FieldContext), drill into its dashboard
      // route — the same routes the default Bloom cluster and the drawer's
      // "Open full page" CTA use — and clear the overlay so the user lands in
      // the consistent default navigation canvas rather than staying trapped
      // in the frozen subgraph. Nodes with no page route (pulses, people,
      // resonance links, documents) keep drawer-on-click. Resolution mirrors
      // handleNodeClick's three tiers: labels → id prefix → color.
      if (overlay) {
        const entityType = resolveOverlayEntityType(overlay, id)
        if (entityType === 'FieldContext') {
          dispatchCloseInfoDrawer()
          clearOverlay()
          router.push(`/protected/dashboard/field-context/${id}`)
          return
        }
        if (entityType === 'MeSpace' || entityType === 'WeSpace') {
          dispatchCloseInfoDrawer()
          clearOverlay()
          router.push(`/protected/dashboard/space/${id}`)
          return
        }
        handleNodeClick(node)
        return
      }
      if (inField) {
        handleNodeClick(node)
        return
      }
      if (inSpace) {
        const ctx = fieldContexts.find((f) => f.id === id)
        if (ctx) {
          dispatchCloseInfoDrawer()
          router.push(`/protected/dashboard/field-context/${ctx.id}`)
          return
        }
        // Space anchor / person spoke — no drill route, open the drawer.
        handleNodeClick(node)
        return
      }
      const space = spaces.find((s) => s.id === id)
      if (space) {
        dispatchCloseInfoDrawer()
        router.push(`/protected/dashboard/space/${space.id}`)
        return
      }
      // Root "You" hub — no drill route, open the drawer.
      handleNodeClick(node)
    },
    [
      overlay,
      inField,
      inSpace,
      fieldContexts,
      spaces,
      router,
      handleNodeClick,
      clearOverlay,
    ]
  )

  // First click schedules a drill; if a second click lands before it fires,
  // that's a double-click → cancel the drill and open the drawer instead.
  const handleSingleClick = useCallback(
    (node: Node) => {
      if (clickTimerRef.current !== null) {
        // Second click of a double-click — drill is still pending, swap to
        // the drawer.
        window.clearTimeout(clickTimerRef.current)
        clickTimerRef.current = null
        handleNodeClick(node)
        return
      }
      clickTimerRef.current = window.setTimeout(() => {
        clickTimerRef.current = null
        handleNodeNavigate(node)
      }, SINGLE_CLICK_DELAY)
    },
    [handleNodeClick, handleNodeNavigate]
  )

  // Fallback for NVL builds that surface `onNodeDoubleClick` without a second
  // `onNodeClick`: cancel the pending drill and open the drawer. If the drill
  // was already cancelled by the second click above, the drawer is already
  // open — re-dispatching the same entity is idempotent and harmless.
  const handleDoubleClick = useCallback(
    (node: Node) => {
      if (clickTimerRef.current !== null) {
        window.clearTimeout(clickTimerRef.current)
        clickTimerRef.current = null
      }
      handleNodeClick(node)
    },
    [handleNodeClick]
  )

  // Cancel a pending drill if the view unmounts mid-debounce so we never
  // router.push after teardown.
  useEffect(() => {
    return () => {
      if (clickTimerRef.current !== null) {
        window.clearTimeout(clickTimerRef.current)
      }
    }
  }, [])

  const mouseEventCallbacks: MouseEventCallbacks = useMemo(
    () => ({
      onNodeClick: (node) => handleSingleClick(node),
      onNodeDoubleClick: (node) => handleDoubleClick(node),
      onCanvasClick: () => setSelectedNode(null),
      onHover: (_element, hitTargets: HitTargets) => {
        const hoveringNode = hitTargets.nodes.length > 0
        if (hoveringNode === isHoveringNodeRef.current) return
        isHoveringNodeRef.current = hoveringNode
        const wrapper = canvasWrapperRef.current
        if (wrapper) wrapper.style.cursor = hoveringNode ? 'pointer' : ''
      },
      onDrag: true,
      onPan: true,
      onZoom: true,
    }),
    [handleSingleClick, handleDoubleClick]
  )

  // Bloom is a force-directed exploration surface. The pre-computed (x, y)
  // values on each node act as seed positions for NVL's force simulation —
  // it settles from there rather than starting cold, which keeps the
  // post-mount `fit()` from landing on whitespace.
  // `layoutOptions` is what actually drives the force simulation. Without
  // these tuned values NVL's defaults produce a degenerate layout (nodes
  // all collapsed near the gravity center) — that's why on first load you
  // only saw one node and had to nudge to "wake up" the sim. These match
  // the proven settings in `src/components/canvas/nvl-canvas.tsx:124-136`.
  const nvlOptions = useMemo(
    () => ({
      layout: 'forceDirected',
      initialZoom: 0.7,
      // NVL's real clamp keys are minZoom/maxZoom — minScale/maxScale are
      // silently ignored, leaving the permissive 0.075–10 defaults in force.
      minZoom: 0.2,
      maxZoom: 3,
      layoutOptions: {
        simulationIterations: 400,
        gravity: 25,
        linkDistance: 1,
        charge: 0,
        linkStrength: 1.0,
      },
    }),
    []
  )

  // Scope key identifies "which cluster is currently being rendered":
  //   - overlay generation (assistant-pushed subgraph)
  //   - activeSpaceId (top-level vs in-space)
  // Both side-panel selection and the auto-fit need to react when the
  // scope flips. The side-panel clear uses the "compare against previous
  // state during render" pattern (matches FocalEntityContext) to avoid
  // cascading renders. The fit uses a per-scope ref so it only fires
  // once per (scope, nodes-ready) pair without a setState round-trip.
  const scopeKey = `${overlay?.generation ?? 'none'}|${
    activeFieldId
      ? `field:${activeFieldId}`
      : activeSpaceId
        ? `space:${activeSpaceId}`
        : 'root'
  }`
  const [prevScopeKey, setPrevScopeKey] = useState(scopeKey)
  if (prevScopeKey !== scopeKey) {
    setPrevScopeKey(scopeKey)
    setSelectedNode(null)
  }

  // Fit once per scope. The force simulation calls `onLayoutDone` when it
  // settles — that's when fit() lands on real positions instead of
  // whitespace. A long fallback timeout covers the edge case where the
  // callback never fires (e.g. single-node scope with no simulation).
  const lastFitScopeRef = useRef<string | null>(null)
  const isInitialLayoutRef = useRef(true)
  useEffect(() => {
    isInitialLayoutRef.current = true
  }, [scopeKey])

  // Kick the force simulation whenever the scope's node set is first
  // populated. Without this, NVL's force layout can stay quiescent on a
  // cold mount and the canvas shows a single overlapping cluster until
  // the user drags a node — `restart()` is what that drag implicitly does.
  const lastKickedScopeRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastKickedScopeRef.current === scopeKey) return
    if (nodes.length === 0) return
    const ref = nvlRef.current
    if (!ref || typeof ref.restart !== 'function') return
    lastKickedScopeRef.current = scopeKey
    // A short delay lets the NVL wrapper finish wiring up the new nodes
    // (`addAndUpdateElementsInGraph` happens in a separate effect) before
    // we restart the simulation against them. We retry with a longer
    // delay on failure because the first `restart()` can throw on a cold
    // mount when the NVL instance is wired up but the simulation context
    // isn't ready yet — the symptom is a chip showing "Custom view from
    // chat" with a completely empty canvas because nodes never get a
    // position. Logging the warning lets us tell that case apart from
    // a torn-down-instance race during fast nav.
    const timers: number[] = []
    const tryRestart = (attempt: number) => {
      try {
        nvlRef.current?.restart?.()
      } catch (err) {
        console.warn(
          `[bloom-view] NVL restart() failed (attempt ${attempt})`,
          err instanceof Error ? err.message : err
        )
        if (attempt < 2) {
          timers.push(
            window.setTimeout(() => tryRestart(attempt + 1), 400)
          )
        }
      }
    }
    timers.push(window.setTimeout(() => tryRestart(1), 50))
    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [nodes, scopeKey])

  const fitToScope = useCallback(() => {
    if (lastFitScopeRef.current === scopeKey) return
    const ref = nvlRef.current
    if (!ref) return
    lastFitScopeRef.current = scopeKey
    isInitialLayoutRef.current = false
    if (nodes.length === 0) return
    if (nodes.length === 1) {
      ref.setZoom?.(1)
      return
    }
    if (typeof ref.fit !== 'function') return
    ref.fit(
      nodes.map((n) => n.id),
      { animated: false, maxZoom: 1.4 }
    )
  }, [nodes, scopeKey])

  useEffect(() => {
    if (nodes.length === 0) return
    const fallback = window.setTimeout(() => {
      if (!isInitialLayoutRef.current) return
      fitToScope()
    }, 2500)
    return () => window.clearTimeout(fallback)
  }, [nodes, scopeKey, fitToScope])

  const nvlCallbacks: Partial<ExternalCallbacks> = useMemo(
    () => ({
      onLayoutDone: () => {
        if (!isInitialLayoutRef.current) return
        fitToScope()
      },
    }),
    [fitToScope]
  )

  // Listen for zoom commands from the floating canvas action bar — same
  // contract SpatialView honors.
  useEffect(() => {
    const adjust = (factor: number) => {
      const ref = nvlRef.current
      if (!ref || typeof ref.getScale !== 'function') return
      const current = ref.getScale()
      if (typeof current === 'number') ref.setZoom?.(current * factor)
    }
    const fit = () => {
      const ref = nvlRef.current
      if (!ref || typeof ref.getNodes !== 'function' || typeof ref.fit !== 'function') return
      const allNodes = ref.getNodes()
      const ids = allNodes.map((n) => n.id)
      if (ids.length <= 1) {
        ref.setZoom?.(1)
        return
      }
      ref.fit(ids, { animated: true, maxZoom: 1.4 })
    }
    const onIn = () => adjust(1.2)
    const onOut = () => adjust(0.8)
    const onFit = () => fit()
    window.addEventListener('goalpost:graph-zoom-in', onIn)
    window.addEventListener('goalpost:graph-zoom-out', onOut)
    window.addEventListener('goalpost:graph-zoom-fit', onFit)
    return () => {
      window.removeEventListener('goalpost:graph-zoom-in', onIn)
      window.removeEventListener('goalpost:graph-zoom-out', onOut)
      window.removeEventListener('goalpost:graph-zoom-fit', onFit)
    }
  }, [])

  const isEmpty =
    !overlay &&
    !loading &&
    (inField
      ? pulses.length === 0
      : inSpace
        ? fieldContexts.length === 0
        : spaces.length === 0)

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex">
      <div ref={canvasWrapperRef} className="flex-1 relative">
        {!overlay && loading && nodes.length === 0 ? (
          <GraphLoadingState
            label="Bloom is gathering"
            subtitle={
              inField
                ? 'Native NVL view of this field’s pulses.'
                : inSpace
                  ? 'Native NVL view of this space’s field contexts.'
                  : 'Native NVL view of your spaces.'
            }
          />
        ) : isEmpty ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
              {inField ? 'graphic_eq' : inSpace ? 'category' : 'hub'}
            </span>
            <p className="text-sm text-white/55 max-w-md">
              {inField
                ? 'This field has no pulses yet. Add one from the dashboard view and it will appear here as a native NVL node.'
                : inSpace
                  ? 'This space has no field contexts yet. Create one from the dashboard view and it will appear here as a native NVL node.'
                  : 'Nothing to render yet. Create a MeSpace or WeSpace from the dashboard and they will appear here as native NVL nodes.'}
            </p>
          </div>
        ) : (
          <GraphVisualizer
            ref={nvlRef}
            nodes={nodes}
            relationships={relationships}
            mouseEventCallbacks={mouseEventCallbacks}
            nvlOptions={nvlOptions}
            nvlCallbacks={nvlCallbacks}
          />
        )}

        {/* Decodes the bare colored NVL circles. Derives its rows from the
            same nodes/relationships above, so it only lists what's on screen. */}
        <BloomLegend nodes={nodes} relationships={relationships} />
      </div>

      {/* Inline panel only for overlay nodes (chat artifacts with no
          persisted entity behind them). Real node clicks open the
          unified EntityInfoDrawer mounted in CanvasHost. */}
      {selectedNode && overlay && (
        <div className="w-80 h-full bg-slate-900/85 backdrop-blur-xl border-l border-white/10 overflow-y-auto z-20 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                Node
              </p>
              <h3 className="mt-1 text-xl font-bold text-white">
                {selectedNode.caption}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <span className="material-symbols-outlined text-lg leading-none">
                close
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: selectedNode.color }}
              aria-hidden="true"
            />
            <span className="text-xs text-white/60 uppercase tracking-wider">
              From chat
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
