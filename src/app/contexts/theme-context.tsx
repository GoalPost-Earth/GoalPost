'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type ThemeColor = 'default' | 'warm' | 'forest' | 'purple' | 'emerald'

type ThemeContextType = {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'goalpost-theme-color'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('default')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeColor
    if (savedTheme) {
      setThemeColorState(savedTheme)
      applyTheme(savedTheme)
    }
    setMounted(true)
  }, [])

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

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color)
    localStorage.setItem(THEME_STORAGE_KEY, color)
    applyTheme(color)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

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
