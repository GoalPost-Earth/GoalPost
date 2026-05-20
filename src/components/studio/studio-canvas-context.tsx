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

export type FullscreenSide = 'canvas' | 'chat' | null
export type ChatLayout = 'docked' | 'floating'
/**
 * Three canonical canvas surfaces — see kb/01-glossary.md.
 * - `dashboard` → Dashboard View (cards of spaces / route content)
 * - `graph`     → Graph View (GoalPost-curated NVL, focal-entity centered)
 * - `bloom`     → Bloom Exploration (native NVL, open-ended)
 *
 * The kb is explicit: Graph View and Bloom Exploration are NOT
 * synonymous and must never be conflated. They live as sibling top-level
 * options, not as a sub-toggle of "Graph."
 */
export type CanvasView = 'dashboard' | 'graph' | 'bloom'

interface CanvasState {
  canvasOpen: boolean
  fullscreenSide: FullscreenSide
  /** User's desktop layout preference. Mobile always forces 'floating'. */
  chatLayout: ChatLayout
  /** Whether the floating chat panel is currently open. */
  floatingChatOpen: boolean
  /** What the canvas surfaces: the route's dashboard content, or the NVL graph. */
  canvasView: CanvasView
}

interface StudioCanvasContextValue extends CanvasState {
  toggleCanvas: () => void
  setCanvasOpen: (open: boolean) => void
  toggleFullscreen: (side: 'canvas' | 'chat') => void
  exitFullscreen: () => void
  setChatLayout: (layout: ChatLayout) => void
  toggleFloatingChat: () => void
  setFloatingChatOpen: (open: boolean) => void
  setCanvasView: (view: CanvasView) => void
}

const StudioCanvasContext = createContext<StudioCanvasContextValue | null>(null)

const STORAGE_KEY = 'goalpost.studio.canvas.v1'

const DEFAULT_STATE: CanvasState = {
  canvasOpen: true,
  fullscreenSide: null,
  chatLayout: 'docked',
  floatingChatOpen: false,
  canvasView: 'dashboard',
}

// SSR-safe initial render — keeps server and first client paint identical.
const SSR_STATE: CanvasState = DEFAULT_STATE

function readStored(): CanvasState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CanvasState>
    return {
      canvasOpen:
        typeof parsed.canvasOpen === 'boolean'
          ? parsed.canvasOpen
          : DEFAULT_STATE.canvasOpen,
      fullscreenSide:
        parsed.fullscreenSide === 'canvas' || parsed.fullscreenSide === 'chat'
          ? parsed.fullscreenSide
          : null,
      chatLayout:
        parsed.chatLayout === 'floating' || parsed.chatLayout === 'docked'
          ? parsed.chatLayout
          : DEFAULT_STATE.chatLayout,
      // floatingChatOpen is intentionally NOT restored — the panel always
      // boots closed so a refresh doesn't pop it open unexpectedly.
      floatingChatOpen: false,
      canvasView:
        parsed.canvasView === 'graph' ||
        parsed.canvasView === 'bloom' ||
        parsed.canvasView === 'dashboard'
          ? parsed.canvasView
          : DEFAULT_STATE.canvasView,
    }
  } catch {
    return null
  }
}

export function StudioCanvasProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CanvasState>(SSR_STATE)

  // One-time storage sync after hydration.
  useEffect(() => {
    const stored = readStored()
    if (!stored) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time storage sync
    setState(stored)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore quota / private-mode errors
    }
  }, [state])

  const toggleCanvas = useCallback(() => {
    setState((prev) => ({
      ...prev,
      canvasOpen: !prev.canvasOpen,
      // Closing the canvas while it's fullscreened would leave the layout
      // in a dead state, so always clear the fullscreen flag on close.
      fullscreenSide: prev.canvasOpen ? null : prev.fullscreenSide,
    }))
  }, [])

  const setCanvasOpen = useCallback((open: boolean) => {
    setState((prev) => {
      if (prev.canvasOpen === open) return prev
      return {
        ...prev,
        canvasOpen: open,
        fullscreenSide: open ? prev.fullscreenSide : null,
      }
    })
  }, [])

  const toggleFullscreen = useCallback((side: 'canvas' | 'chat') => {
    setState((prev) => ({
      ...prev,
      // Fullscreening either side implicitly keeps the canvas mounted so
      // toggling back is instant.
      canvasOpen: true,
      fullscreenSide: prev.fullscreenSide === side ? null : side,
    }))
  }, [])

  const exitFullscreen = useCallback(() => {
    setState((prev) =>
      prev.fullscreenSide === null ? prev : { ...prev, fullscreenSide: null }
    )
  }, [])

  const setChatLayout = useCallback((layout: ChatLayout) => {
    setState((prev) =>
      prev.chatLayout === layout
        ? prev
        : {
            ...prev,
            chatLayout: layout,
            // Switching away from floating closes any open floating panel.
            floatingChatOpen: layout === 'floating' ? prev.floatingChatOpen : false,
            // Switching away from docked clears any fullscreen-side flag since
            // there's no longer a split to fullscreen.
            fullscreenSide: layout === 'docked' ? prev.fullscreenSide : null,
          }
    )
  }, [])

  const toggleFloatingChat = useCallback(() => {
    setState((prev) => ({ ...prev, floatingChatOpen: !prev.floatingChatOpen }))
  }, [])

  const setFloatingChatOpen = useCallback((open: boolean) => {
    setState((prev) =>
      prev.floatingChatOpen === open ? prev : { ...prev, floatingChatOpen: open }
    )
  }, [])

  const setCanvasView = useCallback((view: CanvasView) => {
    setState((prev) =>
      prev.canvasView === view ? prev : { ...prev, canvasView: view }
    )
  }, [])

  const value = useMemo<StudioCanvasContextValue>(
    () => ({
      ...state,
      toggleCanvas,
      setCanvasOpen,
      toggleFullscreen,
      exitFullscreen,
      setChatLayout,
      toggleFloatingChat,
      setFloatingChatOpen,
      setCanvasView,
    }),
    [
      state,
      toggleCanvas,
      setCanvasOpen,
      toggleFullscreen,
      exitFullscreen,
      setChatLayout,
      toggleFloatingChat,
      setFloatingChatOpen,
      setCanvasView,
    ]
  )

  return (
    <StudioCanvasContext.Provider value={value}>
      {children}
    </StudioCanvasContext.Provider>
  )
}

export function useStudioCanvas(): StudioCanvasContextValue {
  const ctx = useContext(StudioCanvasContext)
  if (!ctx) {
    throw new Error(
      'useStudioCanvas must be used inside <StudioCanvasProvider>'
    )
  }
  return ctx
}
