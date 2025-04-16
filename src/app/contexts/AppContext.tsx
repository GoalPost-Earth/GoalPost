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
import { UserProfile, useUser } from '@auth0/nextjs-auth0/client'
import { Person } from '@/gql/graphql'
import { ApolloWrapper } from '@/components'

export type ChurchOptions = 'council' | 'governorship' | 'stream' | 'campus'

type ContextUser = UserProfile & Person

interface AppContextType {
  user?: ContextUser
}

const AppContext = createContext<AppContextType>({
  user: undefined,
})

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<ContextUser | undefined>(
    undefined
  )
  const { user } = useUser()

  // Maintenance mode state

  const [UpdatePerson] = useMutation(UPDATE_PERSON_MUTATION)
  const { data, loading, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
    onCompleted: (data) => {
      if (!data?.people[0]) {
        return
      }
      setLoggedInUser({ ...user, ...data.people[0] } as ContextUser)
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
      setLoggedInUser(sessionUser)
    }
  }, [user])

  const value = useMemo(
    () => ({
      user: loggedInUser,
    }),
    [loggedInUser]
  )

  return (
    <AppContext.Provider value={value}>
      <ApolloWrapper data={data} loading={loading} error={error}>
        {children}
      </ApolloWrapper>
    </AppContext.Provider>
  )
}
