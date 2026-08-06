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
 * Two canonical canvas surfaces — see kb/01-glossary.md.
 * - `dashboard` → Dashboard View (cards of spaces / route content)
 * - `bloom`     → Bloom Exploration (native NVL, open-ended)
 *
 * The legacy Graph View (a GoalPost-curated NVL surface) has been
 * deprecated and removed; Bloom Exploration is now the sole graph surface.
 */
export type CanvasView = 'dashboard' | 'bloom'

interface CanvasState {
  canvasOpen: boolean
  /**
   * Whether the docked chat panel is shown at all. Distinct from
   * `fullscreenSide`: fullscreening the canvas is a temporary "focus this
   * side" state, whereas `chatOpen: false` is the user opting OUT of the
   * assistant entirely (GOAL-313) — it survives navigation and reloads, and
   * only an explicit "Show chat" affordance brings the panel back.
   *
   * Docked layout only; the floating layout uses `floatingChatOpen`.
   */
  chatOpen: boolean
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
  setChatOpen: (open: boolean) => void
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
  chatOpen: true,
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
      // Unlike `floatingChatOpen`, this one IS restored: hiding the assistant
      // is a deliberate "leave me alone" preference, so it has to survive a
      // reload the way `canvasView` does. Falling back to `true` when the
      // stored `canvasOpen` is false repairs a both-panels-closed payload,
      // which would otherwise restore an empty studio.
      chatOpen:
        typeof parsed.chatOpen === 'boolean'
          ? parsed.chatOpen || parsed.canvasOpen === false
          : DEFAULT_STATE.chatOpen,
      // A fullscreened side only means something when both panels are
      // available, so clamp it to null if either is stored closed — otherwise
      // a `{ chatOpen: false, fullscreenSide: 'chat' }` payload rehydrates
      // into a panel that is fullscreened and hidden at the same time.
      fullscreenSide:
        (parsed.fullscreenSide === 'canvas' ||
          parsed.fullscreenSide === 'chat') &&
        parsed.canvasOpen !== false &&
        parsed.chatOpen !== false
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
        // Migrate any persisted legacy 'graph' preference onto 'dashboard'.
        parsed.canvasView === 'bloom' || parsed.canvasView === 'dashboard'
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
      // Never leave the studio with nothing in it — closing the canvas
      // implies the chat comes back.
      chatOpen: prev.canvasOpen ? true : prev.chatOpen,
    }))
  }, [])

  const setCanvasOpen = useCallback((open: boolean) => {
    setState((prev) => {
      if (prev.canvasOpen === open) return prev
      return {
        ...prev,
        canvasOpen: open,
        fullscreenSide: open ? prev.fullscreenSide : null,
        chatOpen: open ? prev.chatOpen : true,
      }
    })
  }, [])

  const setChatOpen = useCallback((open: boolean) => {
    setState((prev) => {
      if (prev.chatOpen === open) return prev
      return {
        ...prev,
        chatOpen: open,
        // Cleared in BOTH directions, unlike `setCanvasOpen`. Hiding a
        // fullscreened panel would strand the layout; and on the way back,
        // `fullscreenSide: 'canvas'` would out-rank `chatOpen` in the shell's
        // reconcile effect and immediately re-collapse the panel the user just
        // asked for — with the restore pill now gone (it hides itself once
        // `chatOpen` is true), leaving no obvious way back to the assistant.
        // "Show chat" has to be authoritative.
        fullscreenSide: null,
        canvasOpen: open ? prev.canvasOpen : true,
      }
    })
  }, [])

  const toggleFullscreen = useCallback((side: 'canvas' | 'chat') => {
    setState((prev) => ({
      ...prev,
      // Fullscreening either side implicitly keeps the canvas mounted so
      // toggling back is instant.
      canvasOpen: true,
      // Likewise, a side can't be fullscreened while it's hidden.
      chatOpen: side === 'chat' ? true : prev.chatOpen,
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
            floatingChatOpen:
              layout === 'floating' ? prev.floatingChatOpen : false,
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
      prev.floatingChatOpen === open
        ? prev
        : { ...prev, floatingChatOpen: open }
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
      setChatOpen,
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
      setChatOpen,
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
