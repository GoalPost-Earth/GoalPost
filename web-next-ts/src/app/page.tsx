/* eslint-disable @next/next/no-html-link-for-pages */
import { Button } from '@/components/ui/button'
import { Text } from '@chakra-ui/react'
import { getSession } from '@auth0/nextjs-auth0'
import Link from 'next/link'

export default async function Home() {
  const session = await getSession()
  const user = session?.user

  return (
    <div>
      <main>
        <Text>Welcome to Goal Post</Text>

        <Link href="/forms">
          <Button>Form</Button>
        </Link>
        <Link href="/members">
          <Button>Show Members</Button>
        </Link>

        {!user ? (
          <a href="/api/auth/login?returnTo=/">
            <Button colorPalette="yellow">Log in</Button>
          </a>
        ) : (
          <a href="/api/auth/logout?returnTo=/">
            <Button colorPalette="red">Log out</Button>
          </a>
        )}
      </main>
    </div>
  )
}
