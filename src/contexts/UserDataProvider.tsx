'use client'

import { useQuery } from '@apollo/client/react'
import { ReactNode, useEffect } from 'react'
import { GET_LOGGED_IN_USER } from '@/app/graphql'
import { useApp } from './AppContext'

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useApp()

  // Fetch complete user data on app initialization to ensure ownsSpaces is populated
  // This allows us to extract and store meSpaceId for direct navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { refetch } = useQuery<any>(GET_LOGGED_IN_USER as any, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email || !!localStorage.getItem('meSpaceId'),
    fetchPolicy: 'network-only', // Fetch fresh data to ensure we have ownsSpaces
  })

  // On app init, fetch user data if we don't have meSpaceId yet
  useEffect(() => {
    if (user?.email && !localStorage.getItem('meSpaceId')) {
      refetch().then((result) => {
        if (result.data?.people?.[0]) {
          const personData = result.data.people[0]
          // Extract meSpaceId from ownsSpaces
          const meSpace = (personData.ownsSpaces || []).find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (space: any) => space.__typename === 'MeSpace'
          )
          if (meSpace?.id) {
            localStorage.setItem('meSpaceId', meSpace.id)
          }
        }
      })
    }
  }, [user?.email, refetch])

  return <>{children}</>
}
