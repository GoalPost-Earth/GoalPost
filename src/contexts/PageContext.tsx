'use client'

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'

interface PageContextType {
  pageTitle: string
  setPageTitle: (title: string) => void
}

const PageContext = createContext<PageContextType | undefined>(undefined)

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState('GoalPost')
  const [isClient, setIsClient] = useState(false)

  // Mark when client-side hydration is complete
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize from localStorage on mount (only after hydration)
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const cachedTitle = localStorage.getItem('pageTitle')
      if (cachedTitle) {
        setPageTitle(cachedTitle)
      }
    }
  }, [isClient])

  // Persist title to localStorage whenever it changes (only on client)
  const updatePageTitle = (title: string) => {
    setPageTitle(title)
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('pageTitle', title)
    }
  }

  return (
    <PageContext.Provider value={{ pageTitle, setPageTitle: updatePageTitle }}>
      {children}
    </PageContext.Provider>
  )
}

export function usePageContext() {
  const context = useContext(PageContext)
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageContextProvider')
  }
  return context
}
