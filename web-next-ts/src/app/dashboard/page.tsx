'use client'

import React from 'react'
import { GET_LOGGED_IN_USER } from '../queries/DASHBOARD_QUERIES'
import CreateProfilePage from '../profile/CreateProfilePage'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useQuery } from '@apollo/client'
import { redirect } from 'next/navigation'

const Dashboard = () => {
  const { user } = useUser()

  const { data } = useQuery(GET_LOGGED_IN_USER, {
    variables: {
      authId: user?.sub ?? '',
    },
  })

  const member = data?.members[0]

  if (!member) {
    redirect('/profile/create')
  }

  return <div>page</div>
}

export default Dashboard
