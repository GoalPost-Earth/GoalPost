'use client'

import { GET_ALL_CAREPOINTS } from '@/app/graphql'
import { ApolloWrapper, CarePointCard } from '@/components'
import { useQuery } from '@apollo/client'
import { Container, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'

export default function AllCarePoints() {
  const { data, loading, error } = useQuery(GET_ALL_CAREPOINTS)

  const carepoints = data?.carePoints ?? []

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
          Care Points
        </Heading>
        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={6}
          my={10}
        >
          {carepoints.map((carepoint) => (
            <GridItem key={carepoint.id} height="100%">
              <CarePointCard carePoint={carepoint} />
            </GridItem>
          ))}
        </Grid>
      </Container>
    </ApolloWrapper>
  )
}
