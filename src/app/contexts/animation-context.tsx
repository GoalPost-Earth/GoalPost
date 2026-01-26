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
  const [mounted, setMounted] = useState(false)

  // Load animation preference before first paint
  useLayoutEffect(() => {
    const savedPreference = localStorage.getItem(ANIMATION_STORAGE_KEY)
    const nextEnabled =
      savedPreference === null ? false : savedPreference === 'true'
    setAnimationsEnabledState(nextEnabled)
    setMounted(true)
  }, [])

  const setAnimationsEnabled = (enabled: boolean) => {
    setAnimationsEnabledState(enabled)
    if (mounted) {
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
