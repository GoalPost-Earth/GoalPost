'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { GET_ALL_ME_SPACES, GET_ALL_WE_SPACES } from '@/app/graphql/queries'
import { GET_SPACE_DETAILS } from '@/app/graphql/queries/SPACE_DETAILS_QUERIES'
import { useFocalEntity } from '@/contexts'
import { createClusteredFieldNodePositions } from '@/lib/field-cluster-layout'
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

export const BloomView: FC = () => {
  const router = useRouter()
  const { setFocalEntity, sessionContext } = useFocalEntity()
  const { overlay } = useBloomOverlay()
  const { publish: publishVisibleEntities } = useVisibleEntities()
  const nvlRef = useRef<NvlRefHandle | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // When the user is inside a Space, render that space's field contexts
  // instead of the top-level space cluster — same context-flip the Graph
  // view performs (see spatial-view.tsx). Overlay still takes priority
  // over both modes.
  const activeSpaceId = sessionContext.activeSpaceId
  const inSpace = !!activeSpaceId && !overlay

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

  const loading = inSpace ? spaceDetailsLoading : meLoading || weLoading

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

  // Native NVL nodes — caption / color / size only. NVL paints these
  // directly without any HTML container; that's the "minimal GoalPost
  // opinionation" the kb calls out.
  //
  // Precedence:
  //   1. Overlay (chat-pushed subgraph) — always wins; cleared via the
  //      "Custom view from chat" chip in the canvas header.
  //   2. In-space scope — the active Space's field contexts.
  //   3. Default — the user's MeSpace + WeSpace cluster.
  const nodes: Node[] = useMemo(() => {
    if (overlay) {
      const positions = createClusteredFieldNodePositions(
        overlay.nodes.map((n) => ({ id: n.id, size: 'lg' })),
        130
      )
      return overlay.nodes.map((n, idx) => {
        const position = positions[idx] ?? { x: 0, y: 0 }
        return {
          id: n.id,
          x: position.x,
          y: position.y,
          caption: n.caption ?? n.id,
          color: n.color ?? '#cbd5e1',
          size: n.size ?? 30,
        } as Node
      })
    }
    if (inSpace) {
      if (fieldContexts.length === 0) return []
      const positions = createClusteredFieldNodePositions(
        fieldContexts.map((f) => ({ id: f.id, size: 'md' })),
        110
      )
      return positions.map((position, idx) => {
        const ctx = fieldContexts[idx]
        return {
          id: ctx.id,
          x: position.x,
          y: position.y,
          caption: ctx.name,
          color: FIELD_COLOR[ctx.spaceKind],
          size: FIELD_SIZE,
        } as Node
      })
    }
    if (spaces.length === 0) return []
    const positions = createClusteredFieldNodePositions(
      spaces.map((s) => ({ id: s.id, size: 'lg' })),
      130
    )
    return positions.map((position, idx) => {
      const space = spaces[idx]
      return {
        id: space.id,
        x: position.x,
        y: position.y,
        caption: space.name,
        color: SPACE_COLOR[space.type],
        size: SPACE_SIZE[space.type],
      } as Node
    })
  }, [overlay, inSpace, fieldContexts, spaces])

  const relationships: Relationship[] = useMemo(() => {
    if (!overlay) return EMPTY_RELATIONSHIPS
    return overlay.relationships.map(
      (r) =>
        ({
          id: r.id,
          from: r.from,
          to: r.to,
          caption: r.caption ?? '',
        }) as Relationship
    )
  }, [overlay])

  // Publish whatever Bloom is currently rendering so the assistant can
  // recognise entities by name (e.g. "show me what is in JD's Tech Lab"
  // resolves to the WeSpace already on screen instead of fail-searching).
  // Each precedence branch maps to a typed entity list:
  //   - overlay   → its own bag (type inferred from caption since the
  //                 overlay payload does not carry a GoalPost type)
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
  }, [overlay, inSpace, fieldContexts, spaces, publishVisibleEntities])

  const handleNodeClick = useCallback(
    (node: Node) => {
      setSelectedNode(node)
      // Overlay nodes are an opaque NVL bag whose type is not tracked
      // here — surface them in the side panel without mutating focal.
      if (overlay) return
      if (inSpace) {
        const ctx = fieldContexts.find((f) => f.id === String(node.id))
        if (ctx) {
          setFocalEntity({
            type: 'FieldContext',
            id: ctx.id,
            focusedAt: new Date().toISOString(),
            source: 'manual',
          })
        }
        return
      }
      const space = spaces.find((s) => s.id === String(node.id))
      if (space) {
        setFocalEntity({
          type: space.type,
          id: space.id,
          focusedAt: new Date().toISOString(),
          source: 'manual',
        })
      }
    },
    [overlay, inSpace, fieldContexts, spaces, setFocalEntity]
  )

  const mouseEventCallbacks: MouseEventCallbacks = useMemo(
    () => ({
      onNodeClick: (node) => handleNodeClick(node),
      onCanvasClick: () => setSelectedNode(null),
      onDrag: true,
      onPan: true,
      onZoom: true,
    }),
    [handleNodeClick]
  )

  // `layout: 'free'` makes NVL honor the (x, y) we computed. Without it,
  // the default force-directed simulation would scatter unconnected nodes
  // across an empty canvas and the post-mount `fit()` would land on
  // whitespace.
  const nvlOptions = useMemo(
    () => ({
      layout: 'free',
      initialZoom: 0.7,
      minScale: 0.2,
      maxScale: 3,
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
  const scopeKey = `${overlay?.generation ?? 'none'}|${activeSpaceId ?? 'root'}`
  const [prevScopeKey, setPrevScopeKey] = useState(scopeKey)
  if (prevScopeKey !== scopeKey) {
    setPrevScopeKey(scopeKey)
    setSelectedNode(null)
  }

  const lastFitScopeRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastFitScopeRef.current === scopeKey) return
    if (nodes.length === 0) return
    const timeout = window.setTimeout(() => {
      const ref = nvlRef.current
      if (!ref) return
      lastFitScopeRef.current = scopeKey
      if (nodes.length === 1) {
        ref.setZoom?.(1)
        return
      }
      if (typeof ref.fit !== 'function') return
      ref.fit(
        nodes.map((n) => n.id),
        { animated: false, maxZoom: 1.4 }
      )
    }, 120)
    return () => window.clearTimeout(timeout)
  }, [nodes, scopeKey])

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
    !overlay && !loading && (inSpace ? fieldContexts.length === 0 : spaces.length === 0)

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex">
      <div className="flex-1 relative">
        {!overlay && loading && nodes.length === 0 ? (
          <GraphLoadingState
            label="Bloom is gathering"
            subtitle={
              inSpace
                ? 'Native NVL view of this space’s field contexts.'
                : 'Native NVL view of your spaces.'
            }
          />
        ) : isEmpty ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <span className="material-symbols-outlined text-5xl text-white/20 mb-3">
              {inSpace ? 'category' : 'hub'}
            </span>
            <p className="text-sm text-white/55 max-w-md">
              {inSpace
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
          />
        )}
      </div>

      {selectedNode && (
        <div className="w-80 h-full bg-slate-900/85 backdrop-blur-xl border-l border-white/10 overflow-y-auto z-20 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                {overlay ? 'Node' : inSpace ? 'Field' : 'Space'}
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
              {overlay
                ? 'From chat'
                : inSpace
                  ? 'Field context'
                  : (spaces.find((s) => s.id === String(selectedNode.id))?.type ??
                    'Space')}
            </span>
          </div>

          {!overlay && (
            <button
              type="button"
              onClick={() => {
                const id = String(selectedNode.id)
                router.push(
                  inSpace
                    ? `/protected/dashboard/field-context/${id}`
                    : `/protected/dashboard/space/${id}`
                )
              }}
              className="w-full mt-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold py-2 transition-colors cursor-pointer"
            >
              {inSpace ? 'Open field' : 'Open space'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
