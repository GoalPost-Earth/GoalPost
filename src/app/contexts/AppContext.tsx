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
  const [user, setUser] = useState<ContextUser | undefined>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          return JSON.parse(storedUser)
        } catch {
          return undefined
        }
      }
    }
    return undefined
  })

  const setUserAndPersist = useCallback((nextUser: ContextUser) => {
    setUser(nextUser)
    localStorage.setItem('user', JSON.stringify(nextUser))
    sessionStorage.setItem('user', JSON.stringify(nextUser))
  }, [])

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('accessToken')
        const sessionUser = sessionStorage.getItem('user')

        if (storedToken && sessionUser) {
          const parsedUser = JSON.parse(sessionUser)
          if (parsedUser.id && parsedUser.level) {
            setUser(parsedUser)
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Login failed')
        }

        const data = await response.json()
        const { user, token, refreshToken } = data

        // Store auth data
        localStorage.setItem('accessToken', token)
        localStorage.setItem('user', JSON.stringify(user))
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

  const logout = useCallback(() => {
    setUser(undefined)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('user')
    document.cookie = 'accessToken=; path=/; max-age=0'
    router.push('/auth/login')
  }, [router])

  const value = {
    user,
    setUser: setUserAndPersist,
    logout,
    login,
    isLoading,
    isAuthenticated: !!user && !!localStorage.getItem('accessToken'),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
