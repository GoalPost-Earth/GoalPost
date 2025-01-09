'use client'

import { GET_ALL_COMMUNITIES } from '@/app/graphql'
import { ApolloWrapper, CommunityCard } from '@/components'
import { Community } from '@/gql/graphql'
import { useQuery } from '@apollo/client'
import { Container, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'

export default function AllCommunities() {
  const { data, loading, error } = useQuery(GET_ALL_COMMUNITIES)

  const communities = data?.communities ?? []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container p={4}>
        <Heading
          position="sticky"
          left={4}
          my={5}
          fontSize="3xl"
          fontWeight="extrabold"
        >
          Communities
        </Heading>
        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={6}
          my={10}
        >
          {communities.map((community) => (
            <GridItem key={community.id} height="200px">
              <CommunityCard community={community as Community} height="100%" />
            </GridItem>
          ))}
        </Grid>
      </Container>
    </ApolloWrapper>
  )
}
