'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { Box, Center, Container, Heading } from '@chakra-ui/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { AvatarCarousel } from '@/components/sections'
import { useQuery } from '@apollo/client'
import { GET_LOGGED_IN_USER } from './graphql/queries/DASHBOARD_QUERIES'
import ApolloWrapper from '@/components/ApolloWrapper'
import { Member } from '@/gql/graphql'
import ShowForms from './forms/page'

const HomeClient = () => {
  const { user } = useUser()
  const { data, loading, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
  })

  const member = data?.members[0]
  const community = member?.community[0]

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading marginBottom={5}>Hi {member?.firstName}!</Heading>

        <AvatarCarousel members={community?.hasMembers as Member[]} />
        <Center marginTop={10}>
          <ShowForms />
        </Center>
        <Box width="100%" display="flex" justifyContent="center" marginTop={10}>
          {!user ? (
            <Button as="a" colorPalette="yellow">
              Sign In
            </Button>
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
      </Container>
    </ApolloWrapper>
  )
}

export default HomeClient
