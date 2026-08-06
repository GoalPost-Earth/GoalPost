'use client'

import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
} from 'react'

export type ThemeColor = 'default' | 'warm' | 'forest' | 'purple' | 'emerald'

type ThemeContextType = {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'goalpost-theme-color'

// Module-level so it has a stable identity (no effect-dep churn) and lives
// outside the component the React Compiler analyzes.
function applyTheme(color: ThemeColor) {
  // Remove all theme classes
  document.documentElement.classList.remove(
    'theme-warm',
    'theme-forest',
    'theme-purple',
    'theme-emerald'
  )

  // Add new theme class if not default
  if (color !== 'default') {
    document.documentElement.classList.add(`theme-${color}`)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer reads the persisted theme on the client and falls back to
  // 'default' during SSR. themeColor is never rendered into markup (only the
  // <html> class is mutated imperatively), so there is no hydration mismatch.
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() =>
    typeof window === 'undefined'
      ? 'default'
      : (localStorage.getItem(THEME_STORAGE_KEY) as ThemeColor) || 'default'
  )

  // Apply the theme class to <html> before first paint whenever it changes.
  // A DOM mutation in a layout effect is a side effect, not a setState, so it
  // avoids the cascading-render the effect-driven initializer used to cause.
  useLayoutEffect(() => {
    applyTheme(themeColor)
  }, [themeColor])

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color)
    localStorage.setItem(THEME_STORAGE_KEY, color)
    // The layout effect above re-applies the DOM class on the resulting render.
  }

  // Always render provider so consumers never see undefined context
  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
