'use client'

import { useQuery } from '@apollo/client/react'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { GET_LOGGED_IN_USER } from '@/app/graphql'
import { Person } from '@/gql/graphql'
import { ApolloWrapper } from '@/app/lib/apollo-wrapper'
import { usePathname } from 'next/navigation'
import { UserProfile } from '@/types'

export type ChurchOptions = 'council' | 'governorship' | 'stream' | 'campus'

type ContextUser = UserProfile & Person

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
          return JSON.parse(storedUser)
        } catch {
          return undefined
        }
      }
    }
    return undefined
  })

  // Maintenance mode state

  const { data, loading } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
  })

  useEffect(() => {
    if (data?.people[0] && user) {
      const updatedUser = { ...user, ...data.people[0] } as ContextUser
      setUser(updatedUser)
      sessionStorage.setItem('user', JSON.stringify(updatedUser))
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem('user') ?? '{}')
    if (sessionUser.id && sessionUser.level) {
      setUser(sessionUser)
    }
  }, [])

  const setUserAndPersist = (user: ContextUser) => {
    setUser(user)
    sessionStorage.setItem('user', JSON.stringify(user))
  }

  const handleLogout = () => {
    setUser(undefined)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('user')
    document.cookie = 'accessToken=; path=/; max-age=0'
  }

  const value = {
    user,
    setUser: setUserAndPersist,
    isAuthenticated: !!user,
    isLoading: loading,
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
