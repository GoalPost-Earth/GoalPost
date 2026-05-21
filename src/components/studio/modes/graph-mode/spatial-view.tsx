'use client'

import { useCallback, useEffect, useMemo, useRef, type FC } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { GET_ALL_ME_SPACES, GET_ALL_WE_SPACES } from '@/app/graphql/queries'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import { focalEntityFromRoute } from '@/lib/focal-entity/route-matcher'
import { EntityBubble, type BubbleSize } from '@/components/ui/entity-bubble'
import {
  createNvlNodeElement,
  renderReactComponentToContainer,
} from '@/lib/nvl-utils'
import { createClusteredFieldNodePositions } from '@/lib/field-cluster-layout'
import type { NvlRefHandle } from '@/components/graph/visualizer'
import { dispatchOpenInfoDrawer } from '@/components/dashboard/entity-info-drawer'
import { GraphLoadingState } from './graph-loading-state'

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

  // "In-space" is a URL concept, not a focal-entity concept. We must NOT
  // read `sessionContext.activeSpaceId` here — that value also reflects
  // *persisted* focal (the user's last space from a prior session), which
  // would make the graph view falsely render field contexts at the
  // dashboard root. Drive scope strictly from the current pathname.
  const pathname = usePathname()
  const activeSpaceId = useMemo(() => {
    const match = focalEntityFromRoute(pathname)
    if (!match) return null
    return match.type === 'MeSpace' || match.type === 'WeSpace'
      ? match.id
      : null
  }, [pathname])
  const inSpace = !!activeSpaceId

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

  const loading = inSpace ? spaceDetailsLoading : meLoading || weLoading

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

  // Stable descriptors. In-space mode produces field-context bubbles;
  // top-level mode produces space bubbles. The downstream NVL + container
  // pipeline is identical — `kind` only changes click behavior.
  const descriptors: Descriptor[] = useMemo(() => {
    if (inSpace) {
      return fieldContexts.map((ctx, idx) => {
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
  }, [inSpace, fieldContexts, spaces])

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
        container = createNvlNodeElement(`space-${desc.id}`)
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

  const handleOpen = useCallback(
    (id: string) => {
      const desc = descriptors.find((d) => d.id === id)
      if (!desc) return
      if (desc.kind === 'field') {
        router.push(`/protected/dashboard/field-context/${id}`)
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
      renderReactComponentToContainer(
        // Interaction model (matches dashboard cards):
        //   - Bubble body → opens the space (full warp navigation)
        //   - Corner icon → opens the info drawer (side pane)
        <EntityBubble
          size={desc.size}
          shape={desc.shape}
          icon={desc.icon}
          title={desc.title}
          subtitle={desc.subtitle}
          badge={desc.badge}
          animationDelay={idx * 0.08}
          onClick={() => handleOpen(desc.id)}
          onInfoClick={() =>
            dispatchOpenInfoDrawer({ type: desc.type, id: desc.id })
          }
        />,
        container
      )
    })
  }, [descriptors, handleOpen])

  // Auto-fit once per scope (top-level vs in-space-X). Tracking via a
  // ref keyed off the scope string means we only re-fit when entering /
  // leaving a space, not on every descriptor re-derivation.
  const lastFitScopeRef = useRef<string | null>(null)
  useEffect(() => {
    const scope = activeSpaceId ?? 'root'
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
  }, [descriptors, activeSpaceId])

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

  // Deliberately NOT wiring NVL's `onNodeClick`. NVL listens at the native
  // DOM level, so it would fire even when React's stopPropagation has
  // intercepted a corner-button click — causing single-clicks on the icon
  // to also trigger the bubble's body action. The EntityBubble's own
  // React onClick covers body clicks, which is the one canonical pathway
  // we want.
  const mouseEventCallbacks: MouseEventCallbacks = useMemo(
    () => ({
      onDrag: true,
      onPan: true,
      onZoom: true,
    }),
    []
  )

  // `layout: 'free'` makes NVL honor the (x, y) we computed via
  // createClusteredFieldNodePositions. Without it, the default
  // force-directed simulation ignores our positions and scatters the
  // bubbles across an empty canvas — which is why the initial `fit()`
  // was landing on whitespace.
  const nvlOptions = useMemo(
    () => ({
      layout: 'free',
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
          label={inSpace ? 'Loading field contexts' : 'Loading spaces'}
          subtitle={
            inSpace
              ? 'Gathering this space’s field contexts.'
              : 'Gathering your MeSpaces and WeSpaces.'
          }
        />
      ) : isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
            {inSpace ? 'category' : 'workspaces'}
          </span>
          <p className="text-sm text-white/55 max-w-md">
            {inSpace
              ? 'This space has no field contexts yet. Create one from the dashboard view and it will appear here as a bubble.'
              : 'No spaces to visualize yet. Create a MeSpace or WeSpace from the dashboard and they will appear here as bubbles.'}
          </p>
        </div>
      ) : (
        <GraphVisualizer
          ref={nvlRef}
          nodes={nodes}
          relationships={NO_RELATIONSHIPS}
          mouseEventCallbacks={mouseEventCallbacks}
          nvlOptions={nvlOptions}
        />
      )}
    </div>
  )
}
