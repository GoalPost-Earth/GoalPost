'use client'

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import { useApp } from './AppContext'
import {
  focalEntityFromRoute,
  type FocalRouteHints,
} from '@/lib/focal-entity/route-matcher'
import {
  isFocalEntityType,
  type FocalEntity,
  type FocalEntityParent,
  type FocalEntityType,
  type SessionContext,
} from '@/lib/focal-entity/types'

const STORAGE_KEY = 'goalpost.focalEntity.v1'
const PERSIST_DEBOUNCE_MS = 1000
const FOCAL_API_PATH = '/api/user/focal-entity'

interface PersistedShape {
  type: FocalEntityType
  id: string
  label?: string
}

interface ServerFocalResponse {
  focalEntity: {
    type: string
    id: string
    label: string | null
    focusedAt: string
  } | null
}

interface FocalEntityContextValue {
  focalEntity: FocalEntity | null
  /**
   * The focal derived purely from the current route, ignoring manual /
   * persisted overrides. This is the user's *location* in the app tree —
   * what the breadcrumb must reflect. Tapping a node in Bloom/Graph sets a
   * `manual` focal (for assistant scope), which must NOT change where the
   * breadcrumb says the user is. Null on neutral surfaces (dashboard root,
   * /graph, /assistant) that don't encode a focal entity.
   */
  routeFocalEntity: FocalEntity | null
  sessionContext: SessionContext
  setFocalEntity: (entity: FocalEntity | null) => void
  setFocalLabel: (
    id: string,
    label: string,
    refinedType?: FocalEntityType
  ) => void
  setFocalParents: (id: string, parents: FocalEntityParent[]) => void
}

const EMPTY_SESSION_CONTEXT: SessionContext = {
  currentUserId: null,
  activeSpaceId: null,
  activeFieldContextId: null,
  focalEntity: null,
  currentUserName: null,
  activeSpaceName: null,
  activeSpaceType: null,
  activeFieldContextTitle: null,
  activeSpaceOwnedByCurrentUser: false,
}

// Permissive default so non-protected pages and tests don't crash when the
// hook is called outside a provider.
const FALLBACK_VALUE: FocalEntityContextValue = {
  focalEntity: null,
  routeFocalEntity: null,
  sessionContext: EMPTY_SESSION_CONTEXT,
  setFocalEntity: () => {},
  setFocalLabel: () => {},
  setFocalParents: () => {},
}

const FocalEntityContext = createContext<FocalEntityContextValue | undefined>(
  undefined
)

export function useFocalEntity(): FocalEntityContextValue {
  return useContext(FocalEntityContext) ?? FALLBACK_VALUE
}

function readPersisted(): PersistedShape | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedShape | null
    if (!parsed || !isFocalEntityType(parsed.type) || !parsed.id) return null
    return {
      type: parsed.type,
      id: parsed.id,
      label: typeof parsed.label === 'string' ? parsed.label : undefined,
    }
  } catch {
    return null
  }
}

function buildHints(user: ReturnType<typeof useApp>['user']): FocalRouteHints {
  const meSpaceIds: string[] = []
  type OwnedSpace = { id?: string; __typename?: string }
  const ownsSpaces =
    (user as { ownsSpaces?: OwnedSpace[] } | undefined)?.ownsSpaces ?? []
  for (const s of ownsSpaces) {
    if (s.__typename === 'MeSpace' && s.id) meSpaceIds.push(s.id)
  }
  return {
    meSpaceIds,
    currentUserId: user?.id ?? null,
  }
}

function enrichWithLabel(
  entity: FocalEntity,
  cache: Record<string, { label: string; type?: FocalEntityType }>,
  parentsCache: Record<string, FocalEntityParent[]>
): FocalEntity {
  const parents = parentsCache[entity.id]
  const exact = cache[`${entity.type}:${entity.id}`]
  if (exact) {
    return {
      ...entity,
      type: exact.type ?? entity.type,
      label: exact.label,
      parents,
    }
  }
  for (const key of Object.keys(cache)) {
    if (key.endsWith(`:${entity.id}`)) {
      return {
        ...entity,
        type: cache[key].type ?? entity.type,
        label: cache[key].label,
        parents,
      }
    }
  }
  return parents ? { ...entity, parents } : entity
}

export function FocalEntityProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user } = useApp()

  const hints = useMemo(() => buildHints(user), [user])

  // Lazy initializer — runs once on first client render. `readPersisted`
  // guards `typeof window === 'undefined'` so SSR pre-renders see null;
  // first client paint reads the actual stored value with no effect needed.
  // The localStorage value is a cache for fast first paint; the server is
  // the source of truth (see the hydration effect below). If the server
  // returns a different focal on mount, `serverSeed` overrides this.
  const [persistedSeed] = useState<PersistedShape | null>(() => readPersisted())
  const [serverSeed, setServerSeed] = useState<PersistedShape | null>(null)

  const [manualFocal, setManualFocal] = useState<FocalEntity | null>(null)

  // Clear manual override on navigation — route should always win after nav.
  // React's recommended "adjusting state on prop change" pattern (per
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  // is to compare against state during render, not to setState in an effect.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    if (manualFocal) setManualFocal(null)
  }

  // Note: we don't manually clear persistedSeed / manualFocal on logout.
  // AppContext.handleLogout wipes the localStorage key, and the protected
  // layout unmounts on redirect — taking this provider's state with it.
  // The next login remounts from a clean slate.

  const [labelCache, setLabelCache] = useState<
    Record<string, { label: string; type?: FocalEntityType }>
  >({})
  const [parentsCache, setParentsCache] = useState<
    Record<string, FocalEntityParent[]>
  >({})

  const setFocalParents = useCallback(
    (id: string, parents: FocalEntityParent[]) => {
      if (!id) return
      setParentsCache((prev) => {
        // Same identity = same array reference; skip the state update so
        // consumers don't re-render when nothing changed.
        const existing = prev[id]
        if (
          existing &&
          existing.length === parents.length &&
          existing.every(
            (p, i) =>
              p.id === parents[i].id &&
              p.type === parents[i].type &&
              p.label === parents[i].label
          )
        ) {
          return prev
        }
        return { ...prev, [id]: parents }
      })
    },
    []
  )

  const setFocalLabel = useCallback(
    (id: string, label: string, refinedType?: FocalEntityType) => {
      if (!id || !label) return
      setLabelCache((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(prev)) {
          if (key.endsWith(`:${id}`)) {
            next[key] = { label, type: refinedType ?? prev[key].type }
          }
        }
        if (refinedType) {
          next[`${refinedType}:${id}`] = { label, type: refinedType }
        }
        return next
      })
    },
    []
  )

  const setFocalEntity = useCallback((entity: FocalEntity | null) => {
    setManualFocal(entity)
  }, [])

  // Stage 1: identity-only memo. Recomputes when the inputs that change the
  // current focal identity change (manual override, route, hydration). The
  // generated `focusedAt` is stable across re-renders that don't change any
  // of these — including label-cache updates, which is the next stage.
  const focalIdentity = useMemo<FocalEntity | null>(() => {
    if (manualFocal) return manualFocal

    const routeMatch = focalEntityFromRoute(pathname, hints)
    if (routeMatch) {
      return {
        type: routeMatch.type,
        id: routeMatch.id,
        focusedAt: new Date().toISOString(),
        source: 'route',
      }
    }

    // Server wins over localStorage — once the hydration effect resolves,
    // `serverSeed` reflects the user's last focal across devices. The
    // localStorage seed only matters during the brief window between first
    // paint and the GET resolving.
    const seed = serverSeed ?? persistedSeed
    if (seed) {
      return {
        type: seed.type,
        id: seed.id,
        label: seed.label,
        focusedAt: new Date().toISOString(),
        source: 'persisted',
      }
    }

    return null
  }, [manualFocal, pathname, hints, persistedSeed, serverSeed])

  // Stage 2: enrich with the latest label and parent chain from their caches,
  // without disturbing the focused-at timestamp. This is what consumers read.
  const focalEntity = useMemo<FocalEntity | null>(() => {
    if (!focalIdentity) return null
    return enrichWithLabel(focalIdentity, labelCache, parentsCache)
  }, [focalIdentity, labelCache, parentsCache])

  // Route-only focal — deliberately ignores `manualFocal` and the persisted
  // seed so the breadcrumb tracks the user's *location*, not the last node
  // they tapped in Bloom/Graph (which sets a `manual` focal). Enriched from
  // the same label/parent caches the detail pages populate, so the full
  // `Dashboard › Space › Field` chain survives node selection.
  const routeFocalEntity = useMemo<FocalEntity | null>(() => {
    const routeMatch = focalEntityFromRoute(pathname, hints)
    if (!routeMatch) return null
    const identity: FocalEntity = {
      type: routeMatch.type,
      id: routeMatch.id,
      focusedAt: focalIdentity?.focusedAt ?? '',
      source: 'route',
    }
    return enrichWithLabel(identity, labelCache, parentsCache)
  }, [pathname, hints, focalIdentity?.focusedAt, labelCache, parentsCache])

  // Hydrate from the server once a user is in scope. The server is the
  // source of truth for "where the user last was" so a fresh browser /
  // device picks up their focal from their previous session. If the
  // request fails (offline, server hiccup) we silently fall back to the
  // localStorage seed — best-effort, never blocking the UI.
  useEffect(() => {
    const userId = user?.id
    if (!userId) return
    const ctrl = new AbortController()
    void (async () => {
      try {
        const res = await fetch(FOCAL_API_PATH, {
          method: 'GET',
          credentials: 'include',
          signal: ctrl.signal,
        })
        if (!res.ok) return
        const data = (await res.json()) as ServerFocalResponse
        if (ctrl.signal.aborted) return
        const focal = data.focalEntity
        if (focal && isFocalEntityType(focal.type) && focal.id) {
          setServerSeed({
            type: focal.type,
            id: focal.id,
            label: focal.label ?? undefined,
          })
        }
      } catch {
        // Network / auth failures are non-fatal — localStorage cache
        // keeps the UI responsive.
      }
    })()
    return () => ctrl.abort()
  }, [user?.id])

  // Persist (debounced) to BOTH localStorage and the server on focal
  // change. localStorage is the fast first-paint cache; the server is the
  // cross-device source of truth.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handle = window.setTimeout(() => {
      try {
        if (focalEntity) {
          const shape: PersistedShape = {
            type: focalEntity.type,
            id: focalEntity.id,
            label: focalEntity.label,
          }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shape))
          // Best-effort server write — a 401 / network blip must not
          // disrupt the UI. The next focal change retries naturally.
          if (user?.id) {
            void fetch(FOCAL_API_PATH, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: focalEntity.type,
                id: focalEntity.id,
                label: focalEntity.label ?? null,
              }),
            }).catch(() => {
              /* non-fatal */
            })
          }
        }
        // Don't clear on null — navigating to a neutral route shouldn't wipe
        // persistence. AppContext.handleLogout clears explicitly.
      } catch {
        // localStorage write failures are non-fatal.
      }
    }, PERSIST_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [focalEntity, user?.id])

  const sessionContext = useMemo<SessionContext>(() => {
    const currentUserId = user?.id ?? null
    const currentUserName = user?.firstName ?? null
    let activeSpaceId: string | null = null
    let activeFieldContextId: string | null = null
    // Phase 1a name hints (see SessionContext doc): names the client already
    // knows, so the chat route can skip the server-side Neo4j name resolve.
    let activeSpaceName: string | null = null
    let activeSpaceType: 'MeSpace' | 'WeSpace' | null = null
    let activeFieldContextTitle: string | null = null

    if (focalEntity) {
      if (focalEntity.type === 'MeSpace' || focalEntity.type === 'WeSpace') {
        activeSpaceId = focalEntity.id
        activeSpaceType = focalEntity.type
        activeSpaceName = focalEntity.label ?? null
      }
      if (focalEntity.type === 'FieldContext') {
        activeFieldContextId = focalEntity.id
        activeFieldContextTitle = focalEntity.label ?? null
      }
    }

    // The enclosing Space for an active FieldContext is surfaced via the
    // focal entity's resolved parent chain (the field-context page pushes it
    // through setFocalParents) — see below. The legacy
    // /protected/spaces/*/fields/[field] path-parsing fallback was removed
    // with those routes.

    // When the active space id came from the URL (not the focal entity) we may
    // still know its name + subtype from the focal entity's resolved parent
    // chain (detail pages push this via setFocalParents). If not, these stay
    // null and the chat route falls back to its authoritative DB resolve.
    if (activeSpaceId && !activeSpaceName && focalEntity?.parents) {
      const parent = focalEntity.parents.find((p) => p.id === activeSpaceId)
      if (parent && (parent.type === 'MeSpace' || parent.type === 'WeSpace')) {
        activeSpaceName = parent.label
        activeSpaceType = parent.type
      }
    }

    // Ownership is authoritative here: it comes from the user's OWN owned-space
    // list (user.ownsSpaces), not a guess. Drives the "your space" vs
    // "<name>'s space" phrasing only — never authorization.
    const ownsSpaces =
      (user as { ownsSpaces?: Array<{ id?: string }> } | undefined)
        ?.ownsSpaces ?? []
    const activeSpaceOwnedByCurrentUser = Boolean(
      activeSpaceId && ownsSpaces.some((s) => s.id === activeSpaceId)
    )

    // Intentionally NO localStorage('meSpaceId') fallback here. A cached
    // MeSpace id is not the user's *current* Space — it's the Space they
    // own. Pretending otherwise causes the assistant to say "This is your
    // MeSpace" on the dashboard root, where the user has not entered any
    // Space. When the user is on a neutral surface, activeSpaceId is
    // genuinely null and the model must call get_my_spaces to scope.

    return {
      currentUserId,
      currentUserName,
      activeSpaceId,
      activeFieldContextId,
      activeSpaceName,
      activeSpaceType,
      activeFieldContextTitle,
      activeSpaceOwnedByCurrentUser,
      focalEntity,
    }
  }, [user, focalEntity])

  const value = useMemo<FocalEntityContextValue>(
    () => ({
      focalEntity,
      routeFocalEntity,
      sessionContext,
      setFocalEntity,
      setFocalLabel,
      setFocalParents,
    }),
    [
      focalEntity,
      routeFocalEntity,
      sessionContext,
      setFocalEntity,
      setFocalLabel,
      setFocalParents,
    ]
  )

  return (
    <FocalEntityContext.Provider value={value}>
      {children}
    </FocalEntityContext.Provider>
  )
}
