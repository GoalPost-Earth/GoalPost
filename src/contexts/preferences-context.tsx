'use client'

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  ReactNode,
} from 'react'
import type { AssistantMode } from '@/lib/simulation'

interface PreferencesContextType {
  aiMode: AssistantMode
  setAiMode: (mode: AssistantMode) => void
  resonanceLinkageEnabled: boolean
  setResonanceLinkageEnabled: (enabled: boolean) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
)

export const usePreferences = () => {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}

const VALID_MODES: AssistantMode[] = ['default', 'aiden', 'braider']
const AI_MODE_STORAGE_KEY = 'assistantMode'

// aiMode is rendered into markup (the assistant thread shows the mode's icon,
// label and title attribute), so it must be hydration-safe. useSyncExternalStore
// returns the server snapshot ('default') during SSR and the first client render,
// then re-reads the persisted value after hydration — no mismatch. A lazy
// initializer would read localStorage during the hydration render and diverge
// from the server HTML for anyone whose stored mode isn't 'default'.
const aiModeListeners = new Set<() => void>()

function readAiMode(): AssistantMode {
  if (typeof window === 'undefined') return 'default'
  const stored = localStorage.getItem(AI_MODE_STORAGE_KEY)
  return stored && VALID_MODES.includes(stored as AssistantMode)
    ? (stored as AssistantMode)
    : 'default'
}

function subscribeAiMode(callback: () => void): () => void {
  aiModeListeners.add(callback)
  const onStorage = (event: StorageEvent) => {
    if (event.key === AI_MODE_STORAGE_KEY) callback()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    aiModeListeners.delete(callback)
    window.removeEventListener('storage', onStorage)
  }
}

function writeAiMode(mode: AssistantMode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AI_MODE_STORAGE_KEY, mode)
  }
  // Notify same-tab subscribers (the `storage` event only fires cross-tab).
  aiModeListeners.forEach((listener) => listener())
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const aiMode = useSyncExternalStore(
    subscribeAiMode,
    readAiMode,
    () => 'default' as AssistantMode
  )

  // resonanceLinkageEnabled is only read inside the settings dialog, which is
  // not force-mounted, so it never appears in the hydration markup — a lazy
  // initializer is hydration-safe here.
  const [resonanceLinkageEnabled, setResonanceLinkageEnabledState] = useState(
    () => {
      if (typeof window === 'undefined') return true
      const stored = localStorage.getItem('resonanceLinkageEnabled')
      return stored === null ? true : stored === 'true'
    }
  )

  const setAiMode = (mode: AssistantMode) => {
    writeAiMode(mode)
  }

  const setResonanceLinkageEnabled = (enabled: boolean) => {
    setResonanceLinkageEnabledState(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('resonanceLinkageEnabled', String(enabled))
    }
  }

  return (
    <PreferencesContext.Provider
      value={{
        aiMode,
        setAiMode,
        resonanceLinkageEnabled,
        setResonanceLinkageEnabled,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}
