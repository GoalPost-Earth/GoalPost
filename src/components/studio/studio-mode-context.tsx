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

export type StudioMode = 'dashboard' | 'graph' | 'assistant' | 'voice'

export const STUDIO_MODES: StudioMode[] = [
  'dashboard',
  'graph',
  'assistant',
  'voice',
]

interface StudioModeContextValue {
  mode: StudioMode
  previousMode: StudioMode | null
  setMode: (next: StudioMode) => void
  /** True for any mode the user has loaded at least once this session. */
  isVisited: (m: StudioMode) => boolean
  /** Voice overlay is the ambient voice companion — available from any mode via `V`. */
  voiceOverlayOpen: boolean
  setVoiceOverlayOpen: (open: boolean) => void
}

const StudioModeContext = createContext<StudioModeContextValue | null>(null)

const STORAGE_KEY = 'goalpost.studio.activeMode.v1'

function readStoredMode(): StudioMode {
  if (typeof window === 'undefined') return 'dashboard'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && STUDIO_MODES.includes(raw as StudioMode)) {
      return raw as StudioMode
    }
  } catch {
    // ignore
  }
  return 'dashboard'
}

export function StudioModeProvider({ children }: { children: ReactNode }) {
  // Initial render — server-safe constant 'dashboard' on both server + client
  // so SSR matches the first client paint and avoids a hydration mismatch.
  // The persisted mode is restored after mount in the effect below.
  const [mode, setModeState] = useState<StudioMode>('dashboard')
  const [previousMode, setPreviousMode] = useState<StudioMode | null>(null)
  const [visited, setVisited] = useState<Set<StudioMode>>(
    () => new Set(['dashboard'])
  )
  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false)

  // After hydration, restore the user's last active mode from localStorage.
  // setState in this effect is intentional — it's the canonical "sync from
  // external store on mount" pattern, runs once per session.
  useEffect(() => {
    const stored = readStoredMode()
    if (stored === 'dashboard') return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time storage sync
    setModeState(stored)
    setVisited((prev) => {
      if (prev.has(stored)) return prev
      const next = new Set(prev)
      next.add(stored)
      return next
    })
  }, [])

  const setMode = useCallback((next: StudioMode) => {
    setModeState((current) => {
      if (current === next) return current
      setPreviousMode(current)
      return next
    })
    setVisited((prev) => {
      if (prev.has(next)) return prev
      const updated = new Set(prev)
      updated.add(next)
      return updated
    })
  }, [])

  const isVisited = useCallback((m: StudioMode) => visited.has(m), [visited])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // ignore
    }
  }, [mode])

  const value = useMemo<StudioModeContextValue>(
    () => ({
      mode,
      previousMode,
      setMode,
      isVisited,
      voiceOverlayOpen,
      setVoiceOverlayOpen,
    }),
    [mode, previousMode, setMode, isVisited, voiceOverlayOpen]
  )

  return (
    <StudioModeContext.Provider value={value}>
      {children}
    </StudioModeContext.Provider>
  )
}

export function useStudioMode(): StudioModeContextValue {
  const ctx = useContext(StudioModeContext)
  if (!ctx) {
    throw new Error('useStudioMode must be used inside <StudioModeProvider>')
  }
  return ctx
}
