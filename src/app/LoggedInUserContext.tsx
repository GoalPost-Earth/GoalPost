'use client'
import { useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { GET_LOGGED_IN_USER } from './graphql'
import { useUser } from '@auth0/nextjs-auth0/client'

export const LoggedInUserContext = React.createContext({
  name: '',
  photo: '',
})

function LoggedInUserContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useUser()

  const { data } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
  })

  const [userValues, setUserValues] = useState({
    name: `${data?.people[0].firstName ?? ''} ${data?.people[0].lastName ?? ''}`,
    photo: `${data?.people[0].photo ?? ''}`,
  })

  useEffect(() => {
    if (data) {
      setUserValues({
        name: `${data?.people[0].firstName} ${data?.people[0].lastName}`,
        photo: `${data?.people[0].photo ?? ''}`,
      })
    }
  }, [data])

  return (
    <LoggedInUserContext.Provider value={userValues}>
      {children}
    </LoggedInUserContext.Provider>
  )
}

export default LoggedInUserContextProvider
