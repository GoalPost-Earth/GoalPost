'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useFocalEntity } from './FocalEntityContext'
import { useApp } from './AppContext'
import { getCachedLabel } from '@/lib/focal-entity/label-cache'
import type { FocalEntityType } from '@/lib/focal-entity/types'

export interface NavigationHistoryEntry {
  type: FocalEntityType
  id: string
  label?: string
  pathname: string
  visitedAt: string
}

interface NavigationHistoryContextValue {
  history: NavigationHistoryEntry[]
  goTo: (entry: NavigationHistoryEntry) => void
  clear: () => void
}

const FALLBACK: NavigationHistoryContextValue = {
  history: [],
  goTo: () => {},
  clear: () => {},
}

const NavigationHistoryContext =
  createContext<NavigationHistoryContextValue | undefined>(undefined)

export function useNavigationHistory(): NavigationHistoryContextValue {
  return useContext(NavigationHistoryContext) ?? FALLBACK
}

export const NAVIGATION_HISTORY_STORAGE_PREFIX = 'goalpost.navigationHistory.v1'
const STORAGE_KEY_PREFIX = NAVIGATION_HISTORY_STORAGE_PREFIX
const MAX_ENTRIES = 12

function storageKeyFor(userId: string | null | undefined): string | null {
  return userId ? `${STORAGE_KEY_PREFIX}.${userId}` : null
}

function readPersisted(userId: string | null | undefined): NavigationHistoryEntry[] {
  if (typeof window === 'undefined') return []
  const key = storageKeyFor(userId)
  if (!key) return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((entry): entry is NavigationHistoryEntry => {
        if (!entry || typeof entry !== 'object') return false
        const e = entry as Partial<NavigationHistoryEntry>
        return (
          typeof e.type === 'string' &&
          typeof e.id === 'string' &&
          typeof e.pathname === 'string' &&
          typeof e.visitedAt === 'string'
        )
      })
      .slice(-MAX_ENTRIES)
  } catch {
    return []
  }
}

function persist(
  userId: string | null | undefined,
  history: NavigationHistoryEntry[]
): void {
  if (typeof window === 'undefined') return
  const key = storageKeyFor(userId)
  if (!key) return
  try {
    window.localStorage.setItem(key, JSON.stringify(history))
  } catch {
    /* non-fatal */
  }
}

/**
 * Best-effort label hydration for entries that didn't get a label at click
 * time. Space + FieldContext have their labels written to localStorage by
 * their detail pages (see `label-cache.ts`), so we can recover them on a
 * cold reload before any new clicks happen.
 */
function hydrateLabel(entry: NavigationHistoryEntry): NavigationHistoryEntry {
  if (entry.label) return entry
  let cached: string | null = null
  if (entry.type === 'MeSpace' || entry.type === 'WeSpace') {
    cached = getCachedLabel('space', entry.id)
  } else if (entry.type === 'FieldContext') {
    cached = getCachedLabel('field', entry.id)
  }
  return cached ? { ...entry, label: cached } : entry
}

export function NavigationHistoryProvider({ children }: { children: ReactNode }) {
  const { user } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const { focalEntity } = useFocalEntity()

  // Stable snapshot of the current focal so goTo() can decide whether the
  // click is a real navigation or a no-op on the already-current entity.
  const focalRef = useRef(focalEntity)
  useEffect(() => {
    focalRef.current = focalEntity
  }, [focalEntity])

  const userId = user?.id ?? null

  // Lazy init from localStorage scoped to the current user. If a different
  // user logs in later, the userId-keyed effect below swaps the in-memory
  // state to that user's history.
  const [history, setHistory] = useState<NavigationHistoryEntry[]>(() =>
    readPersisted(userId).map(hydrateLabel)
  )

  // Swap to the right user's history when the auth state resolves /
  // changes. Without this, a hard reload on a protected route picks up the
  // previous tab's user (if there ever was one) until the next click.
  const lastUserIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (lastUserIdRef.current === userId) return
    lastUserIdRef.current = userId
    setHistory(readPersisted(userId).map(hydrateLabel))
  }, [userId])

  // Suppress the next focal-driven push after a user clicks a chip — the
  // truncation already moved that entry to the head, and the resulting
  // focal change would otherwise be a redundant push.
  const suppressNextRef = useRef<string | null>(null)

  // Track the last id we pushed so cosmetic re-renders (label resolves,
  // ambient context refresh) don't keep stacking duplicates.
  const lastPushedKeyRef = useRef<string | null>(null)

  // Observe focal changes. The FocalEntityProvider is the single source of
  // truth for "what is the user looking at right now" — both route-driven
  // navigation and explicit setFocalEntity calls funnel through it. Riding
  // on top of that means we don't have to wire ad-hoc click handlers across
  // every card / node / pulse view.
  useEffect(() => {
    if (!focalEntity) return
    const key = `${focalEntity.type}:${focalEntity.id}`

    // Suppress the immediate echo of a chip click — we already truncated
    // and pushed in goTo().
    if (suppressNextRef.current === key) {
      suppressNextRef.current = null
      lastPushedKeyRef.current = key
      return
    }

    setHistory((prev) => {
      const head = prev[prev.length - 1]
      if (head && head.type === focalEntity.type && head.id === focalEntity.id) {
        // Same entity — promote label / pathname if we now know them, but
        // do not push a duplicate.
        const updated: NavigationHistoryEntry = {
          ...head,
          label: focalEntity.label ?? head.label,
          pathname: pathname || head.pathname,
        }
        if (
          updated.label === head.label &&
          updated.pathname === head.pathname
        ) {
          return prev
        }
        return [...prev.slice(0, -1), updated]
      }
      lastPushedKeyRef.current = key
      const next: NavigationHistoryEntry = {
        type: focalEntity.type,
        id: focalEntity.id,
        label: focalEntity.label,
        pathname: pathname || '/protected',
        visitedAt: new Date().toISOString(),
      }
      const appended = [...prev, next]
      return appended.length > MAX_ENTRIES
        ? appended.slice(appended.length - MAX_ENTRIES)
        : appended
    })
  }, [focalEntity, pathname])

  // Persist after every change. Cheap — capped at MAX_ENTRIES.
  useEffect(() => {
    persist(userId, history)
  }, [userId, history])

  const goTo = useCallback(
    (entry: NavigationHistoryEntry) => {
      const key = `${entry.type}:${entry.id}`
      // Only arm the suppress flag when the click actually changes the
      // focal entity. A click on the already-current chip produces no
      // focal-change event to consume the flag, which would otherwise
      // eat the next real navigation.
      const current = focalRef.current
      const isNoOp =
        current && current.type === entry.type && current.id === entry.id
      if (!isNoOp) {
        suppressNextRef.current = key
      }
      setHistory((prev) => {
        const idx = prev.findIndex(
          (e) => e.type === entry.type && e.id === entry.id
        )
        if (idx === -1) {
          // Not in the trail (unusual — could happen if the trail was
          // cleared in another tab). Treat as a fresh push.
          return [
            ...prev.slice(-(MAX_ENTRIES - 1)),
            { ...entry, visitedAt: new Date().toISOString() },
          ]
        }
        // Browser-style: drop everything after the clicked entry, keep that
        // entry as the new head, refresh its visitedAt.
        const kept = prev.slice(0, idx)
        return [
          ...kept,
          { ...prev[idx], visitedAt: new Date().toISOString() },
        ]
      })
      if (entry.pathname && entry.pathname !== pathname) {
        router.push(entry.pathname)
      }
    },
    [pathname, router]
  )

  const clear = useCallback(() => {
    suppressNextRef.current = null
    lastPushedKeyRef.current = null
    setHistory([])
  }, [])

  const value = useMemo<NavigationHistoryContextValue>(
    () => ({ history, goTo, clear }),
    [history, goTo, clear]
  )

  return (
    <NavigationHistoryContext.Provider value={value}>
      {children}
    </NavigationHistoryContext.Provider>
  )
}
