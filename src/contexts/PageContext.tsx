'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PageContextType {
  pageTitle: string
  setPageTitle: (title: string) => void
}

const PageContext = createContext<PageContextType | undefined>(undefined)

export function PageContextProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads the cached title on the client and falls back to
  // 'GoalPost' during SSR. pageTitle is never rendered into SSR markup (it is
  // only consumed via setPageTitle), so there is no hydration mismatch.
  const [pageTitle, setPageTitle] = useState(() =>
    typeof window === 'undefined'
      ? 'GoalPost'
      : localStorage.getItem('pageTitle') || 'GoalPost'
  )

  // Persist title to localStorage whenever it changes (only on client)
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
    // Return a default context instead of throwing to prevent build failures
    return {
      pageTitle: 'GoalPost',
      setPageTitle: () => {},
    }
  }
  return context
}
