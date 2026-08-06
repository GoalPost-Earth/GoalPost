'use client'

import React, {
  createContext,
  useContext,
  useSyncExternalStore,
} from 'react'

type AnimationContextType = {
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(
  undefined
)

const ANIMATION_STORAGE_KEY = 'goalpost-animations-enabled'

// Minimal external store for the animation preference. Reading it through
// useSyncExternalStore is hydration-safe: the server snapshot (false) is also
// used for the first client render, so the className-affecting
// `animationsEnabled` never causes a hydration mismatch. React re-reads the
// persisted value right after hydration. This replaces the old isClient +
// setState-in-effect dance.
const listeners = new Set<() => void>()

function readEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ANIMATION_STORAGE_KEY) === 'true'
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  const onStorage = (event: StorageEvent) => {
    if (event.key === ANIMATION_STORAGE_KEY) callback()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', onStorage)
  }
}

function writeEnabled(enabled: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ANIMATION_STORAGE_KEY, String(enabled))
  }
  // Notify same-tab subscribers (the `storage` event only fires cross-tab).
  listeners.forEach((listener) => listener())
}

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const animationsEnabled = useSyncExternalStore(
    subscribe,
    readEnabled,
    () => false
  )

  const setAnimationsEnabled = (enabled: boolean) => {
    writeEnabled(enabled)
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
    // Return a default context instead of throwing to prevent build failures
    return {
      animationsEnabled: false,
      setAnimationsEnabled: () => {},
    }
  }
  return context
}
