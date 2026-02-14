'use client'

import { ReactNode, createContext, useContext, useState } from 'react'
import { GetLoggedInUserQuery } from '@/gql/graphql'
import { ApolloWrapper } from '@/app/lib/apollo-wrapper'
import { usePathname } from 'next/navigation'
import { UserProfile } from '@/types'

type ContextUser = UserProfile & GetLoggedInUserQuery['people'][0]

interface AppContextType {
  user?: ContextUser
  setUser: (user: ContextUser) => void
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
}

const AppContext = createContext<AppContextType>({
  user: undefined,
  setUser: () => {
    throw new Error('setUser function is not defined')
  },
  isAuthenticated: false,
  isLoading: false,
  logout: () => {
    throw new Error('logout function is not defined')
  },
})

export const useApp = () => {
  const context = useContext(AppContext)
  // Return default context instead of throwing to prevent build failures
  if (context === undefined) {
    return {
      user: undefined,
      setUser: () => {},
      isAuthenticated: false,
      isLoading: false,
      logout: () => {},
    }
  }
  return context
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith('/auth')
  const [user, setUser] = useState<ContextUser | undefined>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          // Extract and cache meSpaceId from user object for direct navigation
          const meSpace = (parsedUser.ownsSpaces || []).find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (space: any) => space.__typename === 'MeSpace'
          )
          if (meSpace?.id) {
            localStorage.setItem('meSpaceId', meSpace.id)
          }
          return parsedUser
        } catch {
          return undefined
        }
      }
    }
    return undefined
  })

  const setUserAndPersist = (user: ContextUser) => {
    setUser(user)
    // Save to localStorage - this is our session source of truth
    localStorage.setItem('user', JSON.stringify(user))
    // Extract and cache meSpaceId from user object for direct navigation
    const meSpace = (user.ownsSpaces || []).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (space: any) => space.__typename === 'MeSpace'
    )
    if (meSpace?.id) {
      localStorage.setItem('meSpaceId', meSpace.id)
    }
  }

  const handleLogout = () => {
    setUser(undefined)
    // Clear all session data
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('meSpaceId')
    document.cookie = 'accessToken=; path=/; max-age=0'
  }

  const value = {
    user,
    setUser: setUserAndPersist,
    isAuthenticated: !!user,
    isLoading: false,
    logout: handleLogout,
  }

  return (
    <AppContext.Provider value={value}>
      {isAuthRoute ? (
        <>{children}</>
      ) : (
        <ApolloWrapper>{children}</ApolloWrapper>
      )}
    </AppContext.Provider>
  )
}
