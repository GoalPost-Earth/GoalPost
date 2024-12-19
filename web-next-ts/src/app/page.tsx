'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { Box, Center, Container, Heading } from '@chakra-ui/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { AvatarCarousel } from '@/components/sections'
import { useQuery } from '@apollo/client'
import { GET_LOGGED_IN_USER } from './graphql/queries/DASHBOARD_QUERIES'
import ApolloWrapper from '@/components/ApolloWrapper'

const HomeClient = () => {
  const { user } = useUser()
  const { data, loading, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { authId: user?.sub ?? '' },
    skip: !user?.sub,
  })

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading>Hi JD!</Heading>
        <AvatarCarousel />
        <Center>
          <Box>
            {!user ? (
              <a href="/api/auth/login?returnTo=/">
                <Button colorPalette="yellow">Sign In</Button>
              </a>
            ) : (
              <Button
                as="a"
                colorPalette="red"
                href="/api/auth/logout?returnTo=/"
              >
                Log out
              </Button>
            )}
          </Box>
        </Center>
      </Container>
    </ApolloWrapper>
  )
}

export default HomeClient
