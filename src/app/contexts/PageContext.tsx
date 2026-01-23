'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PageContextType {
  pageTitle: string
  setPageTitle: (title: string) => void
}

const PageContext = createContext<PageContextType | undefined>(undefined)

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState('GoalPost')

  return (
    <PageContext.Provider value={{ pageTitle, setPageTitle }}>
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
