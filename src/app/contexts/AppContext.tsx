'use client'

import { useQuery } from '@apollo/client/react'
import {
  ReactNode,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { GET_LOGGED_IN_USER } from '../graphql'
import { Person } from '@/gql/graphql'
import { usePathname } from 'next/navigation'
import { UserProfile } from '@/types'
import { ApolloWrapper } from '@/components/layout'

export type ChurchOptions = 'council' | 'governorship' | 'stream' | 'campus'

type ContextUser = UserProfile & Person

interface AppContextType {
  user?: ContextUser
  setUser: (user: ContextUser) => void
  logout: () => void
}

const AppContext = createContext<AppContextType>({
  user: undefined,
  setUser: () => {
    throw new Error('setUser function is not defined')
  },
  logout: () => {
    throw new Error('logout function is not defined')
  },
})

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
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

  const setUserAndPersist = useCallback((nextUser: ContextUser) => {
    setUser(nextUser)
    sessionStorage.setItem('user', JSON.stringify(nextUser))
  }, [])

  const { data, loading, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
  })

  useEffect(() => {
    if (!user || !data?.people?.[0]) {
      return
    }

    const mergedUser = { ...user, ...data.people[0] } as ContextUser
    setUserAndPersist(mergedUser)
  }, [data, setUserAndPersist, user])

  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem('user') ?? '{}')
    if (sessionUser.id && sessionUser.level) {
      setUser(sessionUser)
    }
  }, [])

  const logout = () => {
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
    logout,
  }

  return (
    <AppContext.Provider value={value}>
      {isAuthRoute ? (
        <>{children}</>
      ) : (
        <ApolloWrapper
          placeholder={!user}
          data={data}
          loading={loading}
          error={error}
        >
          {children}
        </ApolloWrapper>
      )}
    </AppContext.Provider>
  )
}
