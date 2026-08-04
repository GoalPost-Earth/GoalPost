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
  // Async since GOAL-323: logout round-trips to /api/auth/logout so the
  // server can expire the HttpOnly cookies and revoke the refresh token.
  // Callers that only need the UI to flip logged-out can fire-and-forget.
  logout: () => Promise<void>
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
      logout: async () => {},
    }
  }
  return context
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith('/auth')
  // SSR-safe: start with no user on both the server and the first client
  // paint. Reading localStorage in a lazy initializer diverges the two (server
  // has no user, client has the stored one), which made ProtectedRoute render
  // the spinner on the server but the full shell on first client paint —
  // failing hydration on every protected route. The user is loaded from
  // localStorage in the mount effect below, gated by `isHydrated`.
  const [user, setUser] = useState<ContextUser | undefined>(undefined)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load the persisted session after mount (never during render). Until this
  // runs, `isLoading` is true so ProtectedRoute shows its spinner on both the
  // server and the first client render — identical HTML, no mismatch — and the
  // redirect-to-login effect waits rather than bouncing a logged-in user.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        const meSpace = (parsedUser.ownsSpaces || []).find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (space: any) => space.__typename === 'MeSpace'
        )
        if (meSpace?.id) {
          localStorage.setItem('meSpaceId', meSpace.id)
        }
        setUser(parsedUser)
      }
    } catch {
      // corrupt/absent session → stay logged out
    } finally {
      setIsHydrated(true)
    }
  }, [])

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

  // Browser-side half of logout. Deliberately separate from the server call
  // below so the `session-expired` path — where the server has already
  // expired the cookies and the refresh token is already dead — can reuse it
  // without firing a pointless second request.
  const clearLocalSession = () => {
    setUser(undefined)
    // Drop the in-memory access token cache so the next sign-in can't see
    // the previous user's bearer.
    invalidateAccessTokenCache()
    // Every localStorage touch sits inside the try: a throw here (private
    // mode, quota, a disabled-storage browser) must not reject the caller's
    // promise, which both logout call sites fire un-awaited.
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('meSpaceId')
      localStorage.removeItem('goalpost.focalEntity.v1')
      // Per-user navigation history keys (one per user that ever logged in
      // on this browser). Sweep them all so the next login doesn't see
      // anyone else's trail.
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
  }

  // GOAL-323: the auth cookies are HttpOnly, so no amount of
  // `document.cookie` clearing here can touch them — only the server can
  // expire them, and only the server can revoke the 30-day refresh token.
  // Without this round-trip "Log out" left a fully usable session in the
  // browser, which is the whole bug on a shared device.
  //
  // The local clear runs FIRST, and the request is deliberately not awaited.
  // Awaiting it left the dashboard fully rendered for the duration of the
  // round-trip — measured at ~2.3s against remote Aura, since the route does
  // a Neo4j write — so every logout had a window where the app still looked
  // signed in and the button read as broken. On a shared device that window
  // is the bug this ticket exists to close.
  //
  // `keepalive` lets the request outlive the redirect (and a closed tab), so
  // revocation still happens even though nothing is waiting on it.
  //
  // Residual, accepted: if the user re-logs-in before the in-flight POST
  // lands, its `Max-Age=0` response can clear the *new* session's cookies.
  // That needs a re-login inside ~2s and is self-healing — the next
  // access-token call 401s and bounces to /auth/login — whereas the dead
  // window it replaces was guaranteed on every single logout.
  const handleLogout = async () => {
    clearLocalSession()
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        // The HttpOnly cookies are the credential the route authenticates
        // against; same-origin sends them without exposing them to JS.
        // Cookies are attached by the browser regardless of the localStorage
        // wipe above, so clearing first costs the request nothing.
        credentials: 'same-origin',
        keepalive: true,
        signal: AbortSignal.timeout(5000),
      })
    } catch {
      // Offline / timeout / 5xx: the server-side revocation didn't happen.
      // Local state is already wiped, and the stale cookies are rejected on
      // the next refresh cycle.
    }
  }

  // The shared access-token helper emits `session-expired` when the
  // server returns ERR_UNAUTHENTICATED (refresh also failed). Clean up
  // local state and bounce to /auth/login so a logged-in user whose
  // refresh token was revoked / expired doesn't sit watching a stream
  // of 401s in the network panel.
  useEffect(() => {
    return onSessionExpired(() => {
      // Local cleanup only: `/api/auth/access-token` already cleared the
      // cookies on its terminal 401, and the refresh token that got us here
      // is expired or revoked. Calling /api/auth/logout would be a request
      // that can authenticate nothing.
      clearLocalSession()
      if (typeof window === 'undefined') return
      const path = window.location.pathname
      if (path.startsWith('/auth')) return
      const returnTo = encodeURIComponent(path + window.location.search)
      window.location.href = `/auth/login?returnTo=${returnTo}`
    })
    // clearLocalSession closes over setUser only; it's effectively stable
    // for the lifetime of the provider, so an empty dep array is correct —
    // re-subscribing on every render would churn the listener for nothing.
  }, [])

  const value = {
    user,
    setUser: setUserAndPersist,
    isAuthenticated: !!user,
    // True until the persisted session is read from localStorage post-mount.
    // Keeps SSR and first client paint identical (both "loading") so hydration
    // matches, and prevents ProtectedRoute from redirecting before we know.
    isLoading: !isHydrated,
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
