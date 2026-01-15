'use client'

import {
  ReactNode,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { UserProfile } from '@/types'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: UserProfile) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          setTokenState(storedToken)
          setUserState(JSON.parse(storedUser))
          console.log(storedUser)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
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

        setTokenState(token)
        setUserState(user)

        // Redirect to spaces
        router.push('/protected/spaces')
      } catch (error) {
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    setTokenState(null)
    setUserState(null)
    router.push('/auth/login')
  }, [router])

  const setUser = useCallback((newUser: UserProfile) => {
    setUserState(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
