'use client'

import { GET_ALL_COREVALUES } from '@/app/graphql'
import { ApolloWrapper, CoreValueCard } from '@/components'
import { useQuery } from '@apollo/client'
import { Container, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'

export default function AllCoreValues() {
  const { data, loading, error } = useQuery(GET_ALL_COREVALUES)

  const corevalues = data?.coreValues ?? []

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
          Core Values
        </Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {corevalues.map((corevalue) => (
            <GridItem key={corevalue.id} height="100%">
              <CoreValueCard coreValue={corevalue} />
            </GridItem>
          ))}
        </Grid>
      </Container>
    </ApolloWrapper>
  )
}
