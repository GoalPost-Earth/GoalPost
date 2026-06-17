'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * VisibleEntities — every entity currently rendered somewhere on the
 * canvas (Bloom cluster, Dashboard cards). Published by
 * the view components, consumed by the assistant runtime so the chat
 * model has the same "what is on the screen right now?" context the
 * user does.
 *
 * Without this channel the assistant only knows about
 * `activeSpaceId` + `focalEntity` (route + click). It can't see that
 * "JD's Tech Lab" is sitting in Bloom as a WeSpace node — so when the
 * user asks "show me what is in JD's Tech Lab," the model
 * fail-searches instead of recognising an entity already on screen.
 *
 * `source` lets the assistant tell where the entity was rendered (so
 * it can describe an action like "the WeSpace card you can see in the
 * dashboard" vs "the node in Bloom"). `type` is the GoalPost-level
 * label (`MeSpace`, `WeSpace`, `FieldContext`, etc.) — not the raw
 * Neo4j label list, just the surface kind.
 */

export type VisibleEntitySource = 'dashboard' | 'bloom'

export interface VisibleEntity {
  id: string
  name: string
  type: string
  source: VisibleEntitySource
}

interface VisibleEntitiesContextValue {
  /** Flat snapshot of every entity any view has published. */
  entities: VisibleEntity[]
  /**
   * Replace the slice owned by a given source. Views call this
   * whenever their rendered set changes (e.g. Bloom on every node
   * memo recompute). Pass an empty array to clear the slice (e.g.
   * when a view is unmounted but its provider is not).
   */
  publish: (source: VisibleEntitySource, next: VisibleEntity[]) => void
}

const VisibleEntitiesContext =
  createContext<VisibleEntitiesContextValue | null>(null)

export function VisibleEntitiesProvider({ children }: { children: ReactNode }) {
  // Internal shape: per-source array so a publish from one view never
  // wipes another view's slice. Flattened on read.
  const [slices, setSlices] = useState<
    Record<VisibleEntitySource, VisibleEntity[]>
  >({ dashboard: [], bloom: [] })

  const publish = useCallback<VisibleEntitiesContextValue['publish']>(
    (source, next) => {
      setSlices((prev) => {
        // Cheap shallow equality check — if the new list is identical
        // to the existing slice (same ids, same names, same order) we
        // skip the state update so consuming effects don't churn.
        const cur = prev[source]
        if (cur.length === next.length) {
          let same = true
          for (let i = 0; i < cur.length; i++) {
            if (
              cur[i].id !== next[i].id ||
              cur[i].name !== next[i].name ||
              cur[i].type !== next[i].type
            ) {
              same = false
              break
            }
          }
          if (same) return prev
        }
        return { ...prev, [source]: next }
      })
    },
    []
  )

  const entities = useMemo<VisibleEntity[]>(
    () => [...slices.dashboard, ...slices.bloom],
    [slices]
  )

  const value = useMemo<VisibleEntitiesContextValue>(
    () => ({ entities, publish }),
    [entities, publish]
  )

  return (
    <VisibleEntitiesContext.Provider value={value}>
      {children}
    </VisibleEntitiesContext.Provider>
  )
}

/**
 * Read the visible-entities snapshot + the publish callback. Safe
 * outside the provider (returns an empty snapshot + a no-op publish)
 * so non-studio surfaces don't crash when transitively importing the
 * hook.
 */
export function useVisibleEntities(): VisibleEntitiesContextValue {
  return (
    useContext(VisibleEntitiesContext) ?? {
      entities: [],
      publish: () => {},
    }
  )
}
