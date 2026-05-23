'use client'

import { useCallback, useEffect, useMemo, useRef, type FC } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { GET_ALL_ME_SPACES, GET_ALL_WE_SPACES } from '@/app/graphql/queries'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_DETAILS } from '@/app/graphql/queries/FIELD_CONTEXT_DETAILS_QUERIES'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import { focalEntityFromRoute } from '@/lib/focal-entity/route-matcher'
import { EntityBubble, type BubbleSize } from '@/components/ui/entity-bubble'
import {
  getConfigForType,
  type NodeType as PulseNodeType,
} from '@/lib/pulse-type-config'
import type { FocalEntityType } from '@/lib/focal-entity/types'
import {
  createNvlNodeElement,
  renderReactComponentToContainer,
} from '@/lib/nvl-utils'
import { createClusteredFieldNodePositions } from '@/lib/field-cluster-layout'
import type { NvlRefHandle } from '@/components/graph/visualizer'
import { dispatchOpenInfoDrawer } from '@/components/dashboard/entity-info-drawer'
import { GraphLoadingState } from './graph-loading-state'
import { PersonBubbleContent } from './person-bubble-content'

/**
 * GoalPost Graph View — the curated NVL surface (see kb/01-glossary.md).
 *
 * Renders the user's MeSpaces + WeSpaces as bespoke `EntityBubble` nodes
 * in a free-form clustered layout. This is the canonical "show me my
 * spaces visually" surface, distinct from Bloom Exploration (open-ended
 * neighborhood expansion).
 *
 * Data is sourced from the same Apollo queries the dashboard cards use
 * (`GET_ALL_ME_SPACES` + `GET_ALL_WE_SPACES`) with `cache-first` policy,
 * so flipping Dashboard ↔ Graph is a pure frontend toggle: no re-fetch,
 * no loading spinner, no network round-trip.
 *
 * Click a bubble to drill into `/protected/dashboard/space/[id]`.
 *
 * Zoom is driven by the floating studio action bar via the
 * `goalpost:graph-zoom-*` events (matches BloomView's contract).
 */

// Warm the NVL chunk as soon as this module is parsed (i.e. the moment the
// user enters Graph mode). The fetch runs in parallel with the Apollo data
// queries, so by the time descriptors arrive the chunk is cached and
// next/dynamic skips straight to the real visualizer — no "Preparing
// canvas" flash on top of the "Loading spaces" skeleton.
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

interface SpaceRecord {
  id: string
  name: string
  members?: Array<unknown>
  contexts?: Array<unknown>
  type: 'MeSpace' | 'WeSpace'
}

interface FieldContextRecord {
  id: string
  title: string
  emergentName?: string | null
  pulseCount: number
  spaceKind: 'MeSpace' | 'WeSpace'
}

interface PulseRecord {
  id: string
  title: string
  pulseType: PulseNodeType
  focalType: FocalEntityType
}

interface PersonRecord {
  id: string
  name: string
  firstName: string
  lastName: string
  photo: string | null
  role: 'OWNER' | 'PERSON'
  /**
   * Discriminator for the info-drawer + focal context. The spatial view
   * can't tell User vs PersonPulse from the GraphQL `Person` shape alone,
   * so we tag the owner as 'User' (always a real account) and field
   * people as 'PersonPulse' (the manual / doc-ingest add path).
   */
  focalType: 'User' | 'PersonPulse'
}

type Descriptor =
  | {
      kind: 'space'
      id: string
      type: 'MeSpace' | 'WeSpace'
      size: BubbleSize
      shape: (typeof BUBBLE_SHAPES)[number]
      icon: string
      title: string
      subtitle: string
      badge?: { text: string; variant: 'accent' | 'primary' }
    }
  | {
      kind: 'field'
      id: string
      type: 'FieldContext'
      spaceKind: 'MeSpace' | 'WeSpace'
      size: BubbleSize
      shape: (typeof BUBBLE_SHAPES)[number]
      icon: string
      title: string
      subtitle: string
      badge?: { text: string; variant: 'accent' | 'primary' }
    }
  | {
      kind: 'pulse'
      id: string
      type: FocalEntityType
      pulseType: PulseNodeType
      size: BubbleSize
      shape: (typeof BUBBLE_SHAPES)[number]
      icon: string
      title: string
      subtitle: string
      badge?: { text: string; variant: 'accent' | 'primary' }
    }
  | {
      kind: 'person'
      id: string
      type: 'User' | 'PersonPulse'
      size: BubbleSize
      shape: (typeof BUBBLE_SHAPES)[number]
      person: PersonRecord
    }

const NO_RELATIONSHIPS: Relationship[] = []

// Space bubbles can use the full size range — at the top level there are
// usually only a handful of spaces, so an `xl` hero bubble reads as the
// user's primary identity-bearing surface.
const SPACE_BUBBLE_SIZES: BubbleSize[] = [
  'xl',
  'lg',
  'md',
  'md',
  'sm',
  'lg',
  'md',
  'sm',
]

// Field-context bubbles drop the `xl`. A space can hold a dozen fields and
// the `xl` hitbox (440px) would dominate the cluster and crowd out
// neighbors — fields are peers, not heroes.
const FIELD_BUBBLE_SIZES: BubbleSize[] = [
  'lg',
  'md',
  'md',
  'sm',
  'md',
  'lg',
  'md',
  'sm',
]

const BUBBLE_SHAPES = [
  'circle',
  'organic-1',
  'organic-2',
  'organic-3',
  'circle',
  'organic-1',
  'organic-2',
  'circle',
] as const

// Must match the actual rendered diameters in EntityBubble's `sizeClasses`
// (entity-bubble.tsx:37-42). NVL uses this `size` as the node bounding box
// for hit-testing AND for `fit()` framing — if it's smaller than the
// visual, fit() under-counts the cluster and zooms in past the bubble
// edges, making them overlap on screen even though the layout math
// (createClusteredFieldNodePositions) spaced them correctly.
const SIZE_TO_HITBOX: Record<BubbleSize, number> = {
  sm: 180,
  md: 220,
  lg: 280,
  xl: 440,
}

export const SpatialView: FC = () => {
  const router = useRouter()
  const nvlRef = useRef<NvlRefHandle | null>(null)
  const containerCacheRef = useRef<Map<string, HTMLElement>>(new Map())

  // "In-space" / "in-field" are URL concepts, not focal-entity concepts.
  // We must NOT read `sessionContext.activeSpaceId` here — that value also
  // reflects *persisted* focal (the user's last space from a prior
  // session), which would make the graph view falsely render field
  // contexts at the dashboard root. Drive scope strictly from the current
  // pathname.
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
  const inSpace = !!activeSpaceId
  const inField = !!activeFieldId

  // Same queries the dashboard cards use → Apollo cache is already warm.
  // `cache-first` keeps the toggle truly instant (no network round-trip).
  const { data: meData, loading: meLoading } = useQuery(GET_ALL_ME_SPACES, {
    fetchPolicy: 'cache-first',
  })
  const { data: weData, loading: weLoading } = useQuery(GET_ALL_WE_SPACES, {
    fetchPolicy: 'cache-first',
  })

  // In-space details — `cache-first` is intentional even on cold load.
  // `CanvasHost` keeps `SpaceDashboardView` mounted (under
  // `visibility:hidden`) regardless of which canvas surface is active, so
  // the dashboard's `cache-and-network` `GET_SPACE_DETAILS` fetch always
  // runs at this route. Apollo dedupes our `cache-first` read against
  // that in-flight request, so we get the cached result the moment it
  // resolves — no double round-trip, no separate spinner.
  const { data: spaceDetailsData, loading: spaceDetailsLoading } = useQuery(
    GET_SPACE_DETAILS,
    {
      variables: { spaceId: activeSpaceId ?? '' },
      skip: !activeSpaceId,
      fetchPolicy: 'cache-first',
    }
  )

  // In-field details — `cache-first` mirrors the in-space rationale above.
  // The FieldContext detail page (`/protected/dashboard/field-context/[id]`)
  // already fires `GET_FIELD_CONTEXT_DETAILS` because `CanvasHost` keeps
  // that route content mounted (under `visibility:hidden`) regardless of
  // the active canvas view. Apollo dedupes against that in-flight query so
  // flipping into Graph view yields the cached result the moment it
  // resolves — no extra round-trip.
  const { data: fieldDetailsData, loading: fieldDetailsLoading } = useQuery(
    GET_FIELD_CONTEXT_DETAILS,
    {
      variables: { contextId: activeFieldId ?? '' },
      skip: !activeFieldId,
      fetchPolicy: 'cache-first',
    }
  )

  // People in the active field — owner of the parent space + any
  // PersonPulses (and Users) attached via HAS_PERSON. Same `cache-first`
  // rationale as the field/space queries above: the FieldContext detail
  // route already runs this query, so the cache is usually warm and the
  // Apollo dedupe handles cold loads.
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
      ...s,
      type: 'MeSpace' as const,
    }))
    const we = (weData?.weSpaces ?? []).map((s) => ({
      ...s,
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
      title: ctx.title || 'Untitled field',
      emergentName: ctx.emergentName ?? null,
      pulseCount: ctx.pulses?.length ?? 0,
      spaceKind,
    }))
  }, [inSpace, spaceDetailsData])

  // People to surface alongside the primary bubbles:
  //   - In-field: the parent space's owner (always shown) + every Person
  //     attached to the field via HAS_PERSON (PersonPulses created
  //     manually or via doc ingest, plus any Users present in the field).
  //   - In-space: the space's owner only — members are surfaced through
  //     dedicated UI elsewhere; the spatial canvas keeps the space scope
  //     focused on its field contexts.
  // Owner is tagged `User`, field-attached people as `PersonPulse` so the
  // info-drawer + focal-entity machinery branches correctly.
  const persons: PersonRecord[] = useMemo(() => {
    type RawPerson = {
      id: string
      name?: string | null
      firstName?: string | null
      lastName?: string | null
      photo?: string | null
    }
    const toRecord = (
      p: RawPerson,
      role: 'OWNER' | 'PERSON',
      focalType: 'User' | 'PersonPulse'
    ): PersonRecord => {
      const firstName = p.firstName ?? ''
      const lastName = p.lastName ?? ''
      const composed = `${firstName} ${lastName}`.trim()
      const name = p.name?.trim() || composed || 'Unnamed'
      return {
        id: p.id,
        name,
        firstName,
        lastName,
        photo: p.photo ?? null,
        role,
        focalType,
      }
    }

    if (inField) {
      const fieldCtx = (
        fieldPeopleData as
          | {
              fieldContexts?: Array<{
                people?: RawPerson[]
                meSpace?: Array<{ owner?: RawPerson[] }>
                weSpace?: Array<{ owner?: RawPerson[] }>
              }>
            }
          | undefined
      )?.fieldContexts?.[0]
      if (!fieldCtx) return []
      const owner =
        fieldCtx.meSpace?.[0]?.owner?.[0] ??
        fieldCtx.weSpace?.[0]?.owner?.[0] ??
        null
      const seen = new Set<string>()
      const records: PersonRecord[] = []
      if (owner?.id) {
        seen.add(owner.id)
        records.push(toRecord(owner, 'OWNER', 'User'))
      }
      for (const p of fieldCtx.people ?? []) {
        if (!p?.id || seen.has(p.id)) continue
        seen.add(p.id)
        records.push(toRecord(p, 'PERSON', 'PersonPulse'))
      }
      return records
    }

    if (inSpace) {
      const space = spaceDetailsData?.spaces?.[0]
      if (!space) return []
      const owner =
        'owner' in space && Array.isArray(space.owner)
          ? (space.owner[0] as RawPerson | undefined)
          : undefined
      if (!owner?.id) return []
      return [toRecord(owner, 'OWNER', 'User')]
    }

    return []
  }, [inField, fieldPeopleData, inSpace, spaceDetailsData])

  // In-field: surface the field's pulses (Goal / Resource / Story / Care /
  // CoreValue) as bubbles. Each pulse keeps its config-driven icon so the
  // type reads at a glance even before the title is parsed.
  const pulses: PulseRecord[] = useMemo(() => {
    if (!inField || !fieldDetailsData) return []
    const make = (
      list: Array<{ id: string; title?: string | null }> | undefined,
      pulseType: PulseNodeType,
      focalType: FocalEntityType
    ): PulseRecord[] =>
      (list ?? []).map((pulse) => ({
        id: pulse.id,
        title: pulse.title || 'Untitled pulse',
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

  // Stable descriptors. In-field mode produces pulse bubbles; in-space
  // mode produces field-context bubbles; top-level mode produces space
  // bubbles. Person bubbles (owner + field people) ride alongside the
  // primary bubbles in both in-field and in-space modes. The downstream
  // NVL + container pipeline is identical — `kind` only changes click
  // behavior.
  const descriptors: Descriptor[] = useMemo(() => {
    const personDescriptors = (offset: number): Descriptor[] =>
      persons.map((person, idx) => {
        const slot = offset + idx
        return {
          kind: 'person',
          id: person.id,
          type: person.focalType,
          size: FIELD_BUBBLE_SIZES[slot % FIELD_BUBBLE_SIZES.length],
          shape: BUBBLE_SHAPES[slot % BUBBLE_SHAPES.length],
          person,
        }
      })

    if (inField) {
      const pulseDescriptors: Descriptor[] = pulses.map((pulse, idx) => {
        const config = getConfigForType(pulse.pulseType)
        return {
          kind: 'pulse',
          id: pulse.id,
          type: pulse.focalType,
          pulseType: pulse.pulseType,
          size: FIELD_BUBBLE_SIZES[idx % FIELD_BUBBLE_SIZES.length],
          shape: BUBBLE_SHAPES[idx % BUBBLE_SHAPES.length],
          icon: config.icon,
          title: pulse.title,
          subtitle: config.label,
        }
      })
      return [...pulseDescriptors, ...personDescriptors(pulses.length)]
    }
    if (inSpace) {
      const fieldDescriptors: Descriptor[] = fieldContexts.map((ctx, idx) => {
        const isMe = ctx.spaceKind === 'MeSpace'
        const subtitle = ctx.emergentName
          ? `"${ctx.emergentName}"`
          : ctx.pulseCount > 0
            ? `${ctx.pulseCount} pulse${ctx.pulseCount === 1 ? '' : 's'}`
            : 'No pulses yet'
        return {
          kind: 'field',
          id: ctx.id,
          type: 'FieldContext',
          spaceKind: ctx.spaceKind,
          size: FIELD_BUBBLE_SIZES[idx % FIELD_BUBBLE_SIZES.length],
          shape: BUBBLE_SHAPES[idx % BUBBLE_SHAPES.length],
          icon: 'category',
          title: ctx.title,
          subtitle,
          badge:
            ctx.pulseCount > 0
              ? {
                  text: `${ctx.pulseCount} Pulse${ctx.pulseCount === 1 ? '' : 's'}`,
                  variant: isMe ? 'accent' : 'primary',
                }
              : undefined,
        }
      })
      return [...fieldDescriptors, ...personDescriptors(fieldContexts.length)]
    }
    return spaces.map((space, idx) => {
      const isMe = space.type === 'MeSpace'
      const contextCount = space.contexts?.length ?? 0
      const memberCount = space.members?.length ?? 0
      return {
        kind: 'space',
        id: space.id,
        type: space.type,
        size: SPACE_BUBBLE_SIZES[idx % SPACE_BUBBLE_SIZES.length],
        shape: BUBBLE_SHAPES[idx % BUBBLE_SHAPES.length],
        icon: isMe ? 'self_improvement' : 'groups',
        title: space.name,
        subtitle: isMe
          ? 'Inner Sanctuary'
          : memberCount > 0
            ? `${memberCount} member${memberCount === 1 ? '' : 's'}`
            : 'Collective Field',
        badge:
          contextCount > 0
            ? {
                text: `${contextCount} Field${contextCount === 1 ? '' : 's'}`,
                variant: isMe ? 'accent' : 'primary',
              }
            : undefined,
      }
    })
  }, [inField, pulses, inSpace, fieldContexts, spaces, persons])

  // Purge cached containers for spaces that no longer exist.
  useEffect(() => {
    const active = new Set(descriptors.map((d) => d.id))
    const cache = containerCacheRef.current
    for (const id of cache.keys()) {
      if (!active.has(id)) cache.delete(id)
    }
  }, [descriptors])

  // Build NVL nodes (invisible hitboxes — the visual is the EntityBubble
  // React component rendered into the `html` container).
  // Cluster gap of 120 keeps bubbles close (just outside the smallest
  // 110px hitbox) without making them visibly overlap. The post-mount
  // `fit()` call adapts the viewport to the resulting cluster.
  /* eslint-disable react-hooks/refs -- container cache must outlive renders
     so NVL doesn't re-mount node DOM on every position recompute */
  const nodes: Node[] = useMemo(() => {
    const positions = createClusteredFieldNodePositions(
      descriptors.map((d) => ({ id: d.id, size: d.size })),
      320
    )
    const cache = containerCacheRef.current
    return positions.map((position, idx) => {
      const desc = descriptors[idx]
      let container = cache.get(desc.id)
      if (!container) {
        container = createNvlNodeElement(`${desc.kind}-${desc.id}`)
        cache.set(desc.id, container)
      }
      return {
        id: desc.id,
        x: position.x,
        y: position.y,
        html: container,
        size: SIZE_TO_HITBOX[desc.size] ?? 140,
        color: 'rgba(0, 0, 0, 0)',
        stroke: 'rgba(0, 0, 0, 0)',
        strokeWidth: 0,
        caption: '',
      } as Node
    })
  }, [descriptors])
  /* eslint-enable react-hooks/refs */

  // One-hop edges among visible entities. Only in-field mode produces
  // anything today — the field scope is the only place we render two
  // entity types (pulses + people) and have first-class relationship
  // data (ResonanceLinks via `resonancesInContext`, CREATED_BY via
  // each pulse's `createdBy`). Edges to off-screen endpoints are
  // dropped so NVL never draws dangling arrows.
  const relationships: Relationship[] = useMemo(() => {
    if (!inField || !fieldDetailsData) return NO_RELATIONSHIPS
    const visibleIds = new Set(descriptors.map((d) => d.id))
    const edges: Relationship[] = []

    const links = (fieldDetailsData.fieldContexts?.[0]?.resonancesInContext ??
      []) as Array<{
      id: string
      label?: string | null
      source?: Array<{ id?: string | null } | null> | null
      target?: Array<{ id?: string | null } | null> | null
    }>
    for (const link of links) {
      const sourceId = link.source?.[0]?.id
      const targetId = link.target?.[0]?.id
      if (!sourceId || !targetId) continue
      if (!visibleIds.has(sourceId) || !visibleIds.has(targetId)) continue
      edges.push({
        id: `resonance-${link.id}`,
        from: sourceId,
        to: targetId,
        caption: link.label ?? 'resonance',
        type: 'RESONATES_WITH',
        color: 'rgba(167, 139, 250, 0.55)',
        width: 2,
      } as Relationship)
    }

    // INITIATED_BY is what every pulse-creation path actually writes
    // (`lib/chat/hitl.ts`, `api/pulse/create-from-conversation`, etc.).
    // The legacy `createdBy` field on the schema is aspirational and
    // never populated, so we read `initiatedBy` to get edges with
    // actual data behind them.
    const allPulses: Array<{
      id: string
      initiatedBy?: Array<{ id: string }> | null
    }> = [
      ...(fieldDetailsData.goalPulses ?? []),
      ...(fieldDetailsData.resourcePulses ?? []),
      ...(fieldDetailsData.storyPulses ?? []),
      ...(fieldDetailsData.carePulses ?? []),
      ...(fieldDetailsData.coreValuePulses ?? []),
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
        type: 'INITIATED_BY',
        color: 'rgba(255, 255, 255, 0.22)',
        width: 1.5,
      } as Relationship)
    }

    return edges
  }, [inField, descriptors, fieldDetailsData])

  const handleOpen = useCallback(
    (id: string) => {
      const desc = descriptors.find((d) => d.id === id)
      if (!desc) return
      if (desc.kind === 'pulse') {
        router.push(`/protected/dashboard/pulses/${id}`)
        return
      }
      if (desc.kind === 'field') {
        router.push(`/protected/dashboard/field-context/${id}`)
        return
      }
      if (desc.kind === 'person') {
        router.push(`/protected/dashboard/persons/${id}`)
        return
      }
      router.push(`/protected/dashboard/space/${id}`)
    },
    [descriptors, router]
  )

  // Mount React EntityBubbles into their NVL containers. Bubble body
  // opens the space; the (i) overlay opens the right-side details
  // drawer (see EntityInfoDrawer).
  useEffect(() => {
    descriptors.forEach((desc, idx) => {
      const container = containerCacheRef.current.get(desc.id)
      if (!container) return
      const animationDelay = idx * 0.08
      // Body clicks go through NVL's `onNodeClick` callback rather
      // than the bubble's React `onClick`. Wiring React on the body
      // would intercept the native mousedown that NVL's drag handler
      // listens for — which is what made the canvas feel
      // pan-only / unmovable before this. Only the (i) corner button
      // still uses React (with `stopImmediatePropagation`) so it can
      // open the info drawer without bubbling into NVL.
      const onInfoClick = () =>
        dispatchOpenInfoDrawer({
          type:
            desc.kind === 'pulse'
              ? 'Pulse'
              : desc.kind === 'person'
                ? 'Person'
                : desc.type,
          id: desc.id,
        })

      if (desc.kind === 'person') {
        renderReactComponentToContainer(
          <PersonBubbleContent
            person={desc.person}
            size={desc.size}
            animationDelay={animationDelay}
          />,
          container
        )
        return
      }

      renderReactComponentToContainer(
        <EntityBubble
          size={desc.size}
          shape={desc.shape}
          icon={desc.icon}
          title={desc.title}
          subtitle={desc.subtitle}
          badge={desc.badge}
          animationDelay={animationDelay}
          onInfoClick={onInfoClick}
        />,
        container
      )
    })
  }, [descriptors])

  // Auto-fit once per scope (top-level vs in-space-X vs in-field-X).
  // Tracking via a ref keyed off the scope string means we only re-fit
  // when entering / leaving a scope, not on every descriptor re-derivation.
  const lastFitScopeRef = useRef<string | null>(null)
  useEffect(() => {
    const scope = activeFieldId
      ? `field:${activeFieldId}`
      : activeSpaceId
        ? `space:${activeSpaceId}`
        : 'root'
    if (lastFitScopeRef.current === scope) return
    if (descriptors.length === 0) return
    // Defer one tick so NVL has time to lay nodes out before we measure.
    const timeout = window.setTimeout(() => {
      const ref = nvlRef.current
      if (!ref) return
      lastFitScopeRef.current = scope
      if (descriptors.length === 1) {
        ref.setZoom?.(1)
        return
      }
      if (typeof ref.fit !== 'function') return
      ref.fit(
        descriptors.map((d) => d.id),
        { animated: false, maxZoom: 0.7 }
      )
    }, 120)
    return () => window.clearTimeout(timeout)
  }, [descriptors, activeSpaceId, activeFieldId])

  // Listen for zoom commands from the floating canvas action bar — same
  // contract BloomView honors so both NVL surfaces feel identical.
  useEffect(() => {
    const adjust = (factor: number) => {
      const ref = nvlRef.current
      if (!ref || typeof ref.getScale !== 'function') return
      const current = ref.getScale()
      if (typeof current === 'number') ref.setZoom?.(current * factor)
    }
    const fit = () => {
      const ref = nvlRef.current
      if (
        !ref ||
        typeof ref.getNodes !== 'function' ||
        typeof ref.fit !== 'function'
      ) {
        return
      }
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

  // NVL owns clicks + drag now. `onNodeClick` fires on a *real* click
  // (NVL's DragNodeInteraction suppresses click-as-drag for us), so
  // dragging a node moves it through space and a tap routes to the
  // entity's page. The EntityBubble's `onClick` prop is intentionally
  // not passed in render below; the (i) corner button still uses
  // React `onClick` + `stopImmediatePropagation` so NVL doesn't also
  // see the info-button click as a node click.
  const mouseEventCallbacks: MouseEventCallbacks = useMemo(
    () => ({
      onNodeClick: (node) => handleOpen(node.id),
      onDrag: true,
      onPan: true,
      onZoom: true,
    }),
    [handleOpen]
  )

  // `layout: 'hierarchical'` runs the dagre tree algorithm. With our
  // INITIATED_BY edges (`pulse → person`), pulses become sources and
  // each creator becomes a sink — so a field initiated by one user
  // reads as "six pulses fanning into JD Addy" instead of a floating
  // cluster. `direction: 'down'` stacks layers top-to-bottom; nodes
  // without any visible edge (a lone PersonPulse, an unconnected
  // pulse) get parked alongside the main tree rather than being
  // pulled into it.
  const nvlOptions = useMemo(
    () => ({
      layout: 'hierarchical',
      layoutOptions: {
        direction: 'down' as const,
        packing: 'bin' as const,
      },
      initialZoom: 0.7,
      minScale: 0.2,
      maxScale: 3,
    }),
    []
  )

  const isEmpty = !loading && descriptors.length === 0

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Soft GoalPost backdrop — matches the rest of the studio */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[15%] left-[15%] w-[420px] h-[420px] rounded-full blur-[120px] animate-blob"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-primary) 12%, transparent)',
          }}
        />
        <div
          className="absolute bottom-[10%] right-[15%] w-[360px] h-[360px] rounded-full blur-[100px] animate-blob [animation-delay:2s]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--gp-accent-glow) 10%, transparent)',
          }}
        />
      </div>

      {loading && descriptors.length === 0 ? (
        <GraphLoadingState
          label={
            inField
              ? 'Loading pulses'
              : inSpace
                ? 'Loading field contexts'
                : 'Loading spaces'
          }
          subtitle={
            inField
              ? 'Gathering this field’s pulses.'
              : inSpace
                ? 'Gathering this space’s field contexts.'
                : 'Gathering your MeSpaces and WeSpaces.'
          }
        />
      ) : isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
            {inField ? 'graphic_eq' : inSpace ? 'category' : 'workspaces'}
          </span>
          <p className="text-sm text-white/55 max-w-md">
            {inField
              ? 'This field has no pulses yet. Add one from the dashboard view and it will appear here as a bubble.'
              : inSpace
                ? 'This space has no field contexts yet. Create one from the dashboard view and it will appear here as a bubble.'
                : 'No spaces to visualize yet. Create a MeSpace or WeSpace from the dashboard and they will appear here as bubbles.'}
          </p>
        </div>
      ) : (
        <GraphVisualizer
          ref={nvlRef}
          nodes={nodes}
          relationships={relationships}
          mouseEventCallbacks={mouseEventCallbacks}
          nvlOptions={nvlOptions}
        />
      )}
    </div>
  )
}
