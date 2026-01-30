'use client'

import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
} from 'react'

type AnimationContextType = {
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
)

const ANIMATION_STORAGE_KEY = 'goalpost-animations-enabled'

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [animationsEnabled, setAnimationsEnabledState] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Mark when client-side hydration is complete
  useLayoutEffect(() => {
    setIsClient(true)
  }, [])

  // Load animation preference after hydration
  useLayoutEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem(ANIMATION_STORAGE_KEY)
      const nextEnabled =
        savedPreference === null ? false : savedPreference === 'true'
      setAnimationsEnabledState(nextEnabled)
    }
  }, [isClient])

  const setAnimationsEnabled = (enabled: boolean) => {
    setAnimationsEnabledState(enabled)
    // Only save to localStorage on client
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem(ANIMATION_STORAGE_KEY, String(enabled))
    }
  }

  return (
    <AnimationContext.Provider
      value={{ animationsEnabled, setAnimationsEnabled }}
    >
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimations() {
  const context = useContext(AnimationContext)
  if (context === undefined) {
    throw new Error('useAnimations must be used within an AnimationProvider')
  }
  return context
}
