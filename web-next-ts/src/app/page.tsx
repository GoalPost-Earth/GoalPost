'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { Box, Center, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'

const HomeClient = () => {
  const { user } = useUser()

  return (
    <div>
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
    </div>
  )
}

export default HomeClient
