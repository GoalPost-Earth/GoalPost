import { GET_ALL_PEOPLE } from '@/app/graphql'
import { query } from '@/app/lib/apollo-client'
import { Avatar } from '@/components/ui'
import { Card, Container, Heading, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export default async function AllPeople() {
  const { data } = await query({
    query: GET_ALL_PEOPLE,
  })

  const people = data?.people

  return (
    <Container>
      <Heading>All People</Heading>
      {people.map((person) => (
        <Link href={'/person/' + person.id} key={person.id}>
          <Card.Root key={person.id} my={1}>
            <Card.Header p={2} bgColor="gray.100">
              <HStack>
                <Avatar src="https://bit.ly/dan-abramov" /> {person.fullName}
              </HStack>
            </Card.Header>
            <Card.Body p={2}>
              <Text>{person.email}</Text>
              <Text>{person.phone}</Text>
            </Card.Body>
          </Card.Root>
        </Link>
      ))}
    </Container>
  )
}
