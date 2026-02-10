'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
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

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [aiMode, setAiModeState] = useState<AssistantMode>('default')
  const [resonanceLinkageEnabled, setResonanceLinkageEnabledState] =
    useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem('assistantMode')
      if (storedMode && ['default', 'aiden', 'braider'].includes(storedMode)) {
        setAiModeState(storedMode as AssistantMode)
      }

      const storedResonance = localStorage.getItem('resonanceLinkageEnabled')
      if (storedResonance !== null) {
        setResonanceLinkageEnabledState(storedResonance === 'true')
      }
    }
  }, [])

  // Save to localStorage when changed
  const setAiMode = (mode: AssistantMode) => {
    setAiModeState(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistantMode', mode)
    }
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
