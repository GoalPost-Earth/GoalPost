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

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('assistantMode')
      if (stored && ['default', 'aiden', 'braider'].includes(stored)) {
        setAiModeState(stored as AssistantMode)
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

  return (
    <PreferencesContext.Provider value={{ aiMode, setAiMode }}>
      {children}
    </PreferencesContext.Provider>
  )
}
