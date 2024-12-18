import { GET_ALL_GOALS } from '@/app/graphql'
import { query } from '@/app/lib/apollo-client'
import { Card, Container, Heading, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export default async function AllGoals() {
  const { data } = await query({
    query: GET_ALL_GOALS,
  })

  const goals = data?.goals ?? []

  return (
    <Container>
      <Heading>All Goals</Heading>
      {goals.map((goal) => (
        <Link key={goal.id} href={'/goal/' + goal.id}>
          <Card.Root key={goal.id} my={1}>
            <Card.Header py={2} bgColor="gray.100">
              {goal.name}
            </Card.Header>
            <Card.Body>
              <Card.Description>{goal.description}</Card.Description>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
              <Text fontSize="small" fontWeight="bold">
                {goal.motivatesPerson.name}
              </Text>
            </Card.Footer>
          </Card.Root>
        </Link>
      ))}
    </Container>
  )
}
