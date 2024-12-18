import { GET_ALL_COREVALUES } from '@/app/graphql'
import { query } from '@/app/lib/apollo-client'
import { Card, Container, Heading, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export default async function AllCoreValues() {
  const { data } = await query({
    query: GET_ALL_COREVALUES,
  })

  const corevalues = data?.coreValues ?? []

  return (
    <Container>
      <Heading>All CoreValues</Heading>
      {corevalues.map((corevalue) => (
        <Link key={corevalue.id} href={'/corevalue/' + corevalue.id}>
          <Card.Root key={corevalue.id} my={1}>
            <Card.Header py={2} bgColor="gray.100">
              {corevalue.name}
            </Card.Header>
            {!!corevalue.description && (
              <Card.Body>
                <Card.Description>{corevalue.description}</Card.Description>
              </Card.Body>
            )}
          </Card.Root>
        </Link>
      ))}
    </Container>
  )
}
