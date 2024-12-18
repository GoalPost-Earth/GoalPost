import React from 'react'
import { GET_LOGGED_IN_USER } from '../graphql/queries/DASHBOARD_QUERIES'
import { getSession } from '@auth0/nextjs-auth0'
// import { redirect } from 'next/navigation'
import { query } from '../lib/apollo-client'

const Dashboard = async () => {
  const session = await getSession()
  const user = session?.user

  const { data } = query({
    query: GET_LOGGED_IN_USER,
    variables: {
      authId: user?.sub ?? '',
    },
  })

  const member = data?.members[0]
  console.log('🚀 ~ file: page.tsx:20 ~ member:', member)

  // if (!member) {
  //   redirect('/profile/create')
  // }

  return <div>page</div>
}

export default Dashboard
