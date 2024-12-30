'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { Box, Center, Container, Heading } from '@chakra-ui/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { AvatarCarousel } from '@/components/sections'
import { useMutation, useQuery } from '@apollo/client'
import { GET_LOGGED_IN_USER } from './graphql/queries/DASHBOARD_QUERIES'
import ApolloWrapper from '@/components/ApolloWrapper'
import ShowForms from './forms/page'
import { UPDATE_PERSON_MUTATION } from './graphql'
import { Person } from '@/gql/graphql'

const HomeClient = () => {
  const { user } = useUser()
  const [UpdatePerson] = useMutation(UPDATE_PERSON_MUTATION)
  const { data, loading, error } = useQuery(GET_LOGGED_IN_USER, {
    variables: { email: user?.email ?? '' },
    skip: !user?.email,
    onCompleted: (data) => {
      if (!data?.people[0]) {
        return
      }

      if (data?.people[0].authId !== user?.sub) {
        UpdatePerson({
          variables: {
            where: { email_EQ: user?.email },
            update: {
              authId_SET: user?.sub,
            },
          },
        })
      }
    },
  })

  const person = data?.people[0]
  const community = person?.communities[0]

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading marginBottom={5}>Hi {person?.firstName}!</Heading>

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
