'use client'

import { useQuery } from '@apollo/client/react'
import { ReactNode, useEffect } from 'react'
import { GET_LOGGED_IN_USER } from '../graphql'
import { useApp } from './AppContext'

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useApp()

  const { data } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => {
    if (!user || !data?.people?.[0]) {
      return
    }

    const personData = data.people[0]

    // Ensure email is non-null (it should always exist for logged-in users)
    if (!personData.email) {
      console.error('Person data missing email')
      return
    }

    const mergedUser = { ...user, ...personData, email: personData.email }

    // Only update if the user data actually changed to prevent infinite loops
    if (JSON.stringify(user) !== JSON.stringify(mergedUser)) {
      setUser(mergedUser)
    }
  }, [data?.people, user, setUser])

  return <>{children}</>
}
