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
import { useFocalEntity } from '@/contexts'
import { focalEntityFromRoute } from '@/lib/focal-entity/route-matcher'
import type { FocalEntityType } from '@/lib/focal-entity/types'
import type { NvlRefHandle } from '@/components/graph/visualizer'
import { GraphLoadingState } from './graph-loading-state'
import { useBloomOverlay } from '../../bloom-overlay-context'
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
 *   - `me_`       lib/validation/space-validation.ts (MeSpace)
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
  if (id.startsWith('me_')) return 'MeSpace'
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
 * — MeSpaces are always `me_*` and would have been caught by the
 * prefix table above).
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

const SPACE_COLOR = {
  MeSpace: '#f59e0b', // amber — matches the Me Space card accent
  WeSpace: '#14b8a6', // teal — matches the We Space card accent
} as const

const SPACE_SIZE = {
  MeSpace: 44,
  WeSpace: 48,
} as const

// Field-context bubbles inherit a softer tint of their parent's palette so
// the in-space cluster reads as "the same space, one level deeper."
const FIELD_COLOR = {
  MeSpace: '#fbbf24', // amber-400 — slightly warmer than space accent
  WeSpace: '#5eead4', // teal-300 — slightly lighter than space accent
} as const

const FIELD_SIZE = 36

// Pulse palette mirrors `--gp-{goal|resource|story|care|coreValue}` from
// globals.css so Bloom nodes read with the same semantics as everywhere
// else in the app. Hex values are duplicated here because NVL needs
// resolved colors at node-render time — it cannot consume CSS variables.
const PULSE_COLOR: Record<
  'goal' | 'resource' | 'story' | 'care' | 'coreValue',
  string
> = {
  goal: '#38bdf8',
  resource: '#4ade80',
  story: '#c084fc',
  care: '#10b981',
  coreValue: '#8b5cf6',
}

const PULSE_SIZE = 32

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

export const BloomView: FC = () => {
  const { setFocalEntity } = useFocalEntity()
  const { overlay } = useBloomOverlay()
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
      return pulses.map(
        (pulse) =>
          ({
            id: pulse.id,
            caption: pulse.name,
            color: PULSE_COLOR[pulse.pulseType],
            size: PULSE_SIZE,
          }) as Node
      )
    }
    if (inSpace) {
      return fieldContexts.map(
        (ctx) =>
          ({
            id: ctx.id,
            caption: ctx.name,
            color: FIELD_COLOR[ctx.spaceKind],
            size: FIELD_SIZE,
          }) as Node
      )
    }
    return spaces.map(
      (space) =>
        ({
          id: space.id,
          caption: space.name,
          color: SPACE_COLOR[space.type],
          size: SPACE_SIZE[space.type],
        }) as Node
    )
  }, [overlay, inField, pulses, inSpace, fieldContexts, spaces])

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
    if (inField && resonances.length > 0) {
      // Filter to edges whose endpoints are actually rendered — keeps
      // NVL from drawing dangling arrows to ghost nodes when a resonance
      // points to a pulse that didn't load (e.g. permissions on a shared
      // pulse).
      const pulseIds = new Set(pulses.map((p) => p.id))
      return dedupe(
        resonances
          .filter(
            (r) => pulseIds.has(r.sourceId) && pulseIds.has(r.targetId)
          )
          .map(
            (r) =>
              ({
                id: r.id,
                from: r.sourceId,
                to: r.targetId,
                caption: r.label,
              }) as Relationship
          )
      )
    }
    return EMPTY_RELATIONSHIPS
  }, [overlay, inField, resonances, pulses])

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
        return pulses.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.focalType,
          source: 'bloom' as const,
        }))
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
        const overlayNode = overlay.nodes.find((n) => n.id === id)
        // Three-tier resolution: labels (precise) → id prefix (stable
        // server-side convention) → color (last-resort visual encoding).
        // Color works for legacy bare-UUID Persons + WeSpaces that
        // arrived through chat overlays before the labels-on-NVLNode
        // patch landed, so a chat user clicking an old node still gets
        // the unified drawer instead of the minimal inline panel.
        const drawerType =
          labelsToInfoEntityType(overlayNode?.labels) ??
          idPrefixToInfoEntityType(id) ??
          colorToInfoEntityType(overlayNode?.color)
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
        }
        return
      }
      if (inSpace) {
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
    [overlay, inField, pulses, inSpace, fieldContexts, spaces, setFocalEntity]
  )

  // A double click drills *into* the entity by changing the route, which
  // re-scopes the canvas (scope is derived strictly from the pathname via
  // focalEntityFromRoute): a top-level space → its field contexts, an
  // in-space field → its pulses. These are the same dashboard routes the
  // drawer's "Open full page" CTA uses, so the studio canvas stays mounted
  // and re-scopes inward. Overlay nodes and pulses have no page route, so a
  // double click on them falls back to the single-click drawer behavior.
  // NVL fires the single-click `onNodeClick` (which opens the drawer)
  // *before* this handler, so for the navigating cases we close that drawer
  // first — otherwise it lingers open over the freshly drilled-in scope.
  const handleNodeNavigate = useCallback(
    (node: Node) => {
      const id = String(node.id)
      if (overlay || inField) {
        handleNodeClick(node)
        return
      }
      if (inSpace) {
        const ctx = fieldContexts.find((f) => f.id === id)
        if (ctx) {
          dispatchCloseInfoDrawer()
          router.push(`/protected/dashboard/field-context/${ctx.id}`)
        }
        return
      }
      const space = spaces.find((s) => s.id === id)
      if (space) {
        dispatchCloseInfoDrawer()
        router.push(`/protected/dashboard/space/${space.id}`)
      }
    },
    [overlay, inField, inSpace, fieldContexts, spaces, router, handleNodeClick]
  )

  const mouseEventCallbacks: MouseEventCallbacks = useMemo(
    () => ({
      onNodeClick: (node) => handleNodeClick(node),
      onNodeDoubleClick: (node) => handleNodeNavigate(node),
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
    [handleNodeClick, handleNodeNavigate]
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
