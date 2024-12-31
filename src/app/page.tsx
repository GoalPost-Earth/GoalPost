'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { Box, Center, Container, Heading } from '@chakra-ui/react'
import { AvatarCarousel } from '@/components/sections'
import ShowForms from './forms/page'
import { Person } from '@/gql/graphql'
import { useApp } from './contexts/AppContext'

const HomeClient = () => {
  const { user } = useApp()
  const community = user?.communities[0]

  return (
    <Container>
      <Heading marginBottom={5}>Hi {user?.firstName}!</Heading>

      <AvatarCarousel people={community?.members as Person[]} />
      <Center marginTop={10}>
        <ShowForms />
      </Center>
      <Box width="100%" display="flex" justifyContent="center" marginTop={10}>
        {!user ? (
          <Button as="a" colorPalette="yellow">
            Sign In
          </Button>
        ) : (
          <Button as="a" colorPalette="red" href="/api/auth/logout?returnTo=/">
            Log out
          </Button>
        )}
      </Box>
    </Container>
  )
}

export default HomeClient
