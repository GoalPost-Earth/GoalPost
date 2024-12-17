'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { Box, Center, Container, Heading, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'
import { AvatarCarousel } from '@/components/sections'
import { useQuery } from '@apollo/client'
import { GET_LOGGED_IN_USER } from './queries/DASHBOARD_QUERIES'
import ApolloWrapper from '@/components/ApolloWrapper'

const HomeClient = () => {
  const { user } = useUser()
  const { data, loading, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { authId: user?.sub ?? '' },
    skip: !user?.sub,
  })
  console.log('🚀 ~ file: page.tsx:16 ~ data:', data)

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading></Heading>
        <AvatarCarousel />
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
      </Container>
    </ApolloWrapper>
  )
}

export default HomeClient
