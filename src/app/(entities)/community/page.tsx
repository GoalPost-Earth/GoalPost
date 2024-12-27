'use client'

import { GET_ALL_COMMUNITIES } from '@/app/graphql'
import ApolloWrapper from '@/components/ApolloWrapper'
import { useQuery } from '@apollo/client'
import { Card, Container, Heading } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export default function AllCommunities() {
  const { data, loading, error } = useQuery(GET_ALL_COMMUNITIES)

  const communities = data?.communities ?? []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading>All Communities</Heading>
        {communities.map((community) => (
          <Link href={'/community/' + community.id} key={community.id}>
            <Card.Root key={community.id} my={1}>
              <Card.Header py={2} bgColor="gray.100">
                {community.name}
              </Card.Header>
              <Card.Body>
                <Card.Description>{community.description}</Card.Description>
              </Card.Body>
              <Card.Footer justifyContent="flex-end"></Card.Footer>
            </Card.Root>
          </Link>
        ))}
      </Container>
    </ApolloWrapper>
  )
}
