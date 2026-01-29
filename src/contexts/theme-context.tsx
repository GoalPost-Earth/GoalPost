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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('default')

  const applyTheme = (color: ThemeColor) => {
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

  // Load and apply theme before first paint to avoid flashes of default theme
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeColor
    const nextTheme = savedTheme || 'default'
    setThemeColorState(nextTheme)
    applyTheme(nextTheme)
  }, [])

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color)
    localStorage.setItem(THEME_STORAGE_KEY, color)
    applyTheme(color)
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
