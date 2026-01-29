'use client'

import {
  ReactNode,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Person } from '@/gql/graphql'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types'

export type ChurchOptions = 'council' | 'governorship' | 'stream' | 'campus'

type ContextUser = UserProfile & Person

interface AppContextType {
  user?: ContextUser
  setUser: (user: ContextUser) => void
  logout: () => void
  login: (email: string, password: string) => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AppContext = createContext<AppContextType>({
  user: undefined,
  setUser: () => {
    throw new Error('setUser function is not defined')
  },
  logout: () => {
    throw new Error('logout function is not defined')
  },
  login: async () => {
    throw new Error('login function is not defined')
  },
  isLoading: false,
  isAuthenticated: false,
})

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<ContextUser | undefined>(undefined)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state on client only
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          return
        }

        // First, check if access token exists in cookies via API
        const tokenResponse = await fetch('/api/auth/access-token', {
          method: 'GET',
          credentials: 'include', // Include cookies
        })

        const storedUser = localStorage.getItem('user')

        if (tokenResponse.ok && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            if (parsedUser.id) {
              setUser(parsedUser)
            }
          } catch {
            // Invalid JSON in localStorage
            localStorage.removeItem('user')
          }
        } else {
          // No valid token, clear auth state
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const setUserAndPersist = useCallback((nextUser: ContextUser) => {
    setUser(nextUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(nextUser))
    }
  }, [])

  const logout = useCallback(() => {
    setUser(undefined)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      document.cookie = 'accessToken=; path=/; max-age=0'
    }
    router.push('/auth/login')
  }, [router])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Login failed')
        }

        const data = await response.json()
        const { user, token, refreshToken } = data

        // Store user in localStorage (token is in httpOnly cookie)
        localStorage.setItem('user', JSON.stringify(user))
        // Also store token in localStorage for client-side verification
        if (token) {
          localStorage.setItem('accessToken', token)
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        setUserAndPersist(user)

        // Redirect to spaces
        router.push('/protected/spaces')
      } catch (error) {
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router, setUserAndPersist]
  )

  const value = {
    user,
    setUser: setUserAndPersist,
    logout,
    login,
    isLoading,
    // isAuthenticated requires both user and access token
    // Safe for SSR - only access localStorage on client after mount
    isAuthenticated: !!(
      isMounted &&
      user?.id &&
      typeof window !== 'undefined' &&
      localStorage.getItem('accessToken')
    ),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
