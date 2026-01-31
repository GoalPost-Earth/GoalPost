'use client'

import { useQuery } from '@apollo/client/react'
import { ReactNode, useEffect } from 'react'
import { GET_LOGGED_IN_USER } from '@/app/graphql'
import { useApp } from './AppContext'

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useApp()

  const { data, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all', // Allow partial data even if query has errors
  })

  // Log query errors but don't throw
  useEffect(() => {
    if (error) {
      console.error('UserDataProvider query error:', error.message)
    }
  }, [error])

  useEffect(() => {
    if (!user || !data?.people?.[0]) {
      return
    }

    try {
      const personData = data.people[0]

      // Ensure email is non-null (it should always exist for logged-in users)
      if (!personData.email) {
        console.error('Person data missing email')
        return
      }

      // Only merge specific fields to avoid type conflicts with partial Space objects
      const mergedUser = {
        ...user,
        id: personData.id,
        name: personData.name,
        email: personData.email,
      }

      // Only update if the user data actually changed to prevent infinite loops
      if (JSON.stringify(user) !== JSON.stringify(mergedUser)) {
        setUser(mergedUser)
      }
    } catch (err) {
      console.error('Error updating user data:', err)
    }
  }, [data?.people, user, setUser])

  return <>{children}</>
}
