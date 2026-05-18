'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type StudioMode = 'dashboard' | 'graph' | 'chat'
export type PaneId = 'left' | 'right'

export const STUDIO_MODES: StudioMode[] = ['dashboard', 'graph', 'chat']

interface PanesState {
  left: StudioMode
  /** `null` means only the left pane is visible (single-pane view). */
  right: StudioMode | null
  focusedPane: PaneId
  fullscreenPane: PaneId | null
}

interface StudioPanesContextValue extends PanesState {
  /** Convenience: the mode currently shown in the focused pane. */
  focusedMode: StudioMode
  setPaneMode: (pane: PaneId, mode: StudioMode) => void
  focusPane: (pane: PaneId) => void
  /** Opens or closes the second pane. Opening picks a sensible default. */
  setSplit: (split: boolean) => void
  toggleFullscreen: (pane: PaneId) => void
  exitFullscreen: () => void
  /** True for any (pane, mode) pair the user has loaded at least once this session. */
  isVisited: (pane: PaneId, mode: StudioMode) => boolean
}

const StudioPanesContext = createContext<StudioPanesContextValue | null>(null)

const STORAGE_KEY = 'goalpost.studio.panes.v1'

const DEFAULT_STATE: PanesState = {
  left: 'dashboard',
  right: 'chat',
  focusedPane: 'right',
  fullscreenPane: null,
}

// SSR-safe initial render — matches first client paint to avoid hydration
// mismatch. Real persisted state is restored from localStorage after mount.
const SSR_STATE: PanesState = {
  left: 'dashboard',
  right: null,
  focusedPane: 'left',
  fullscreenPane: null,
}

function isStudioMode(v: unknown): v is StudioMode {
  return v === 'dashboard' || v === 'graph' || v === 'chat'
}

function readStored(): PanesState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PanesState>
    const left = isStudioMode(parsed.left) ? parsed.left : DEFAULT_STATE.left
    const right =
      parsed.right === null || isStudioMode(parsed.right)
        ? parsed.right
        : DEFAULT_STATE.right
    const focusedPane: PaneId =
      parsed.focusedPane === 'left' || parsed.focusedPane === 'right'
        ? parsed.focusedPane
        : DEFAULT_STATE.focusedPane
    const fullscreenPane: PaneId | null =
      parsed.fullscreenPane === 'left' || parsed.fullscreenPane === 'right'
        ? parsed.fullscreenPane
        : null
    return { left, right, focusedPane, fullscreenPane }
  } catch {
    return null
  }
}

function visitKey(pane: PaneId, mode: StudioMode): string {
  return `${pane}:${mode}`
}

export function StudioPanesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PanesState>(SSR_STATE)
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set([visitKey(SSR_STATE.focusedPane, SSR_STATE.left)])
  )

  // After hydration, restore persisted state from localStorage. One-time
  // sync — matches the existing pattern in the studio.
  useEffect(() => {
    const stored = readStored() ?? DEFAULT_STATE
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time storage sync
    setState(stored)
    setVisited(() => {
      const next = new Set<string>()
      next.add(visitKey('left', stored.left))
      if (stored.right) next.add(visitKey('right', stored.right))
      return next
    })
  }, [])

  // Persist state changes.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota / private-mode errors
    }
  }, [state])

  const setPaneMode = useCallback((pane: PaneId, mode: StudioMode) => {
    setState((prev) => {
      if (pane === 'left' && prev.left === mode) return prev
      if (pane === 'right' && prev.right === mode) return prev
      return pane === 'left'
        ? { ...prev, left: mode, focusedPane: pane }
        : { ...prev, right: mode, focusedPane: pane }
    })
    setVisited((prev) => {
      const k = visitKey(pane, mode)
      if (prev.has(k)) return prev
      const next = new Set(prev)
      next.add(k)
      return next
    })
  }, [])

  const focusPane = useCallback((pane: PaneId) => {
    setState((prev) => {
      if (prev.focusedPane === pane) return prev
      // Can't focus the right pane if it isn't open.
      if (pane === 'right' && prev.right === null) return prev
      return { ...prev, focusedPane: pane }
    })
  }, [])

  const setSplit = useCallback((split: boolean) => {
    setState((prev) => {
      if (split && prev.right === null) {
        // Open the right pane with a mode different from the left if possible.
        const defaultRight: StudioMode = prev.left === 'chat' ? 'dashboard' : 'chat'
        return { ...prev, right: defaultRight, focusedPane: 'right' }
      }
      if (!split && prev.right !== null) {
        return {
          ...prev,
          right: null,
          focusedPane: 'left',
          fullscreenPane: null,
        }
      }
      return prev
    })
  }, [])

  const toggleFullscreen = useCallback((pane: PaneId) => {
    setState((prev) => ({
      ...prev,
      fullscreenPane: prev.fullscreenPane === pane ? null : pane,
      focusedPane: pane,
    }))
  }, [])

  const exitFullscreen = useCallback(() => {
    setState((prev) =>
      prev.fullscreenPane === null ? prev : { ...prev, fullscreenPane: null }
    )
  }, [])

  const isVisited = useCallback(
    (pane: PaneId, mode: StudioMode) => visited.has(visitKey(pane, mode)),
    [visited]
  )

  const focusedMode = state.focusedPane === 'left' ? state.left : (state.right ?? state.left)

  const value = useMemo<StudioPanesContextValue>(
    () => ({
      ...state,
      focusedMode,
      setPaneMode,
      focusPane,
      setSplit,
      toggleFullscreen,
      exitFullscreen,
      isVisited,
    }),
    [
      state,
      focusedMode,
      setPaneMode,
      focusPane,
      setSplit,
      toggleFullscreen,
      exitFullscreen,
      isVisited,
    ]
  )

  return (
    <StudioPanesContext.Provider value={value}>
      {children}
    </StudioPanesContext.Provider>
  )
}

export function useStudioPanes(): StudioPanesContextValue {
  const ctx = useContext(StudioPanesContext)
  if (!ctx) {
    throw new Error('useStudioPanes must be used inside <StudioPanesProvider>')
  }
  return ctx
}
