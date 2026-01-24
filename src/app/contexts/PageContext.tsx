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

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedTitle = localStorage.getItem('pageTitle')
      if (cachedTitle) {
        setPageTitle(cachedTitle)
      }
    }
  }, [])

  // Persist title to localStorage whenever it changes
  const updatePageTitle = (title: string) => {
    setPageTitle(title)
    if (typeof window !== 'undefined') {
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
