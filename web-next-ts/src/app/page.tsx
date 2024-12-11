/* eslint-disable @next/next/no-html-link-for-pages */
import { Button } from '@/components/ui/button'
import { Box, Center, Text } from '@chakra-ui/react'
import { getSession } from '@auth0/nextjs-auth0'
import Link from 'next/link'
import { query } from './lib/ApolloClient'
import { GET_LOGGED_IN_USER } from './queries/DASHBOARD_QUERIES'
import CreateProfilePage from './profile/CreateProfilePage'

export default async function Home() {
  const session = await getSession()
  const user = session?.user

  const { data } = await query({
    query: GET_LOGGED_IN_USER,
    variables: { authId: user?.sub ?? '' },
  })
  const member = data.members[0]

  if (!member) {
    return <CreateProfilePage />
  }

  return (
    <div>
      <main>
        <Center>
          <Box>
            <Text>Welcome to Goalpost</Text>

            <Link href="/forms">
              <Button>Form</Button>
            </Link>
            <Link href="/members">
              <Button>Show Members</Button>
            </Link>

            {!user ? (
              <a href="/api/auth/login?returnTo=/">
                <Button colorPalette="yellow">Sign In</Button>
              </a>
            ) : (
              <a href="/api/auth/logout?returnTo=/">
                <Button colorPalette="red">Log out</Button>
              </a>
            )}
          </Box>
        </Center>
      </main>
    </div>
  )
}
