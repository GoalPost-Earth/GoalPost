'use client'

import { useMutation, useQuery } from '@apollo/client'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { GET_LOGGED_IN_USER, UPDATE_PERSON_MUTATION } from '../graphql'
import { UserProfile } from '@auth0/nextjs-auth0/client'
import { Person } from '@/gql/graphql'
import { ApolloWrapper } from '@/components'

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
  const isAuthRoute = window.location.pathname.startsWith('/auth')
  const [user, setUser] = useState<ContextUser | undefined>(undefined)

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
      if (data?.people[0].authId !== user?.sub) {
        UpdatePerson({
          variables: {
            where: { email_EQ: user?.email },
            update: {
              authId_SET: user?.sub,
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

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user]
  )

  return (
    <AppContext.Provider value={value}>
      {isAuthRoute ? (
        <>{children}</>
      ) : (
        <ApolloWrapper data={data} loading={loading} error={error}>
          {children}
        </ApolloWrapper>
      )}
    </AppContext.Provider>
  )
}
