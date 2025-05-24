'use client'

import { useMutation, useQuery } from '@apollo/client'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { GET_LOGGED_IN_USER, UPDATE_PERSON_MUTATION } from '../graphql'
import { Person } from '@/gql/graphql'
import { ApolloWrapper } from '@/components'
import { usePathname } from 'next/navigation'
import { UserProfile } from '@/types'

export type ChurchOptions = 'council' | 'governorship' | 'stream' | 'campus'

type ContextUser = UserProfile & Person

interface AppContextType {
  user?: ContextUser
  setUser: (user: ContextUser) => void
}

const AppContext = createContext<AppContextType>({
  user: undefined,
  setUser: () => {
    throw new Error('setUser function is not defined')
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

  const [UpdatePerson] = useMutation(UPDATE_PERSON_MUTATION)
  const { data, loading, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
    onCompleted: (data) => {
      if (!data?.people[0]) {
        return
      }
      setUser({ ...user, ...data.people[0] } as ContextUser)
      sessionStorage.setItem(
        'user',
        JSON.stringify({ ...user, ...data.people[0] })
      )
      if (data?.people[0].authId !== user?.id) {
        UpdatePerson({
          variables: {
            where: { email_EQ: user?.email },
            update: {
              authId_SET: user?.id,
            },
          },
        })
      }
    },
  })

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

  const value = {
    user,
    setUser: setUserAndPersist,
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
