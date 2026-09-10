'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { BloomSearchEntry } from './modes/graph-mode/bloom-search-match'

/**
 * BloomSearch — the channel between the Bloom canvas and the search control
 * in the canvas header.
 *
 * Two directions, each using the mechanism this codebase already uses for it:
 *
 *   - UP (data): `BloomView` publishes the entries it is painting, exactly as
 *     it publishes to `visible-entities-context` for the assistant. Held in
 *     context because the header renders it.
 *   - DOWN (command): selecting a result dispatches a window event that
 *     `BloomView` listens for, the same idiom the floating action bar's zoom
 *     buttons use (`goalpost:graph-zoom-*`). The canvas owns the NVL ref;
 *     nothing else gets to reach into it.
 *
 * `scope` is what the canvas is currently rendering, so the control can name
 * it honestly — "Search this field context" on a FieldContext route, "Search
 * this space" inside a Space. Guessing that from the URL in the header would
 * drift from what Bloom actually painted the moment a chat overlay takes over.
 */

export type BloomSearchScope = 'field' | 'space' | 'root' | 'overlay'

export interface BloomSearchSnapshot {
  scope: BloomSearchScope
  entries: BloomSearchEntry[]
}

interface BloomSearchContextValue extends BloomSearchSnapshot {
  /** Replace the snapshot. Called by `BloomView` whenever its paint changes. */
  publish: (next: BloomSearchSnapshot) => void
  /** Ask the canvas to centre and highlight one node. */
  focusNode: (id: string) => void
}

/** Canvas-focus command. Payload is the painted node id. */
export const BLOOM_FOCUS_NODE_EVENT = 'goalpost:graph-focus-node'

export interface BloomFocusNodeDetail {
  id: string
}

const EMPTY_ENTRIES: BloomSearchEntry[] = []

const BloomSearchContext = createContext<BloomSearchContextValue | null>(null)

export function BloomSearchProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<BloomSearchSnapshot>({
    scope: 'root',
    entries: EMPTY_ENTRIES,
  })

  const publish = useCallback<BloomSearchContextValue['publish']>((next) => {
    setSnapshot((prev) => {
      // The canvas republishes on every paint recompute (a filter toggle, a
      // background refetch settling). Skipping identical snapshots keeps the
      // header from re-rendering — and, more importantly, keeps an open
      // results list from rebuilding under the viewer's arrow keys.
      if (prev.scope !== next.scope) return next
      if (prev.entries.length !== next.entries.length) return next
      for (let i = 0; i < prev.entries.length; i++) {
        const a = prev.entries[i]
        const b = next.entries[i]
        if (
          a.id !== b.id ||
          a.caption !== b.caption ||
          a.color !== b.color ||
          a.typeLabel !== b.typeLabel
        ) {
          return next
        }
      }
      return prev
    })
  }, [])

  const focusNode = useCallback((id: string) => {
    window.dispatchEvent(
      new CustomEvent<BloomFocusNodeDetail>(BLOOM_FOCUS_NODE_EVENT, {
        detail: { id },
      })
    )
  }, [])

  const value = useMemo<BloomSearchContextValue>(
    () => ({ ...snapshot, publish, focusNode }),
    [snapshot, publish, focusNode]
  )

  return (
    <BloomSearchContext.Provider value={value}>
      {children}
    </BloomSearchContext.Provider>
  )
}

/**
 * Read the canvas snapshot + the focus command. Safe outside the provider
 * (empty snapshot, no-op publish/focus) so surfaces that transitively import
 * the hook don't crash — matching `useVisibleEntities`.
 */
export function useBloomSearch(): BloomSearchContextValue {
  return (
    useContext(BloomSearchContext) ?? {
      scope: 'root',
      entries: EMPTY_ENTRIES,
      publish: () => {},
      focusNode: () => {},
    }
  )
}
