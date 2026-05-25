'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { GetLoggedInUserQuery } from '@/gql/graphql'
import { ApolloWrapper } from '@/app/lib/apollo-wrapper'
import { usePathname } from 'next/navigation'
import { UserProfile } from '@/types'
import { NAVIGATION_HISTORY_STORAGE_PREFIX } from './NavigationHistoryContext'
import {
  invalidateAccessTokenCache,
  onSessionExpired,
} from '@/lib/auth/access-token-client'

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
    // Drop any cached bearer token first. Without this the module-scoped
    // cache in `access-token-client.ts` could survive a login or session
    // swap inside the same tab (cookie expiry → re-login as user B; the
    // first `getAccessToken()` call would return user A's still-cached
    // token before the 60s TTL elapses). Invalidating on every user-set
    // closes the cross-session window.
    invalidateAccessTokenCache()
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
    // Drop the in-memory access token cache so the next sign-in can't see
    // the previous user's bearer.
    invalidateAccessTokenCache()
    // Clear all session data
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('meSpaceId')
    localStorage.removeItem('goalpost.focalEntity.v1')
    // Per-user navigation history keys (one per user that ever logged in
    // on this browser). Sweep them all so the next login doesn't see
    // anyone else's trail.
    try {
      const toRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(NAVIGATION_HISTORY_STORAGE_PREFIX)) {
          toRemove.push(key)
        }
      }
      for (const key of toRemove) localStorage.removeItem(key)
    } catch {
      /* non-fatal */
    }
    document.cookie = 'accessToken=; path=/; max-age=0'
  }

  // The shared access-token helper emits `gp:session-expired` when the
  // server returns ERR_UNAUTHENTICATED (refresh also failed). Clean up
  // local state and bounce to /auth/login so a logged-in user whose
  // refresh token was revoked / expired doesn't sit watching a stream
  // of 401s in the network panel.
  useEffect(() => {
    return onSessionExpired(() => {
      handleLogout()
      if (typeof window === 'undefined') return
      const path = window.location.pathname
      if (path.startsWith('/auth')) return
      const returnTo = encodeURIComponent(path + window.location.search)
      window.location.href = `/auth/login?returnTo=${returnTo}`
    })
    // handleLogout closes over setUser only; it's effectively stable
    // for the lifetime of the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
