'use client'

import { GET_ALL_PEOPLE } from '@/app/graphql'
import ApolloWrapper from '@/components/ApolloWrapper'
import { Avatar } from '@/components/ui'
import { useQuery } from '@apollo/client'
import {
  Box,
  Card,
  Container,
  Heading,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { LuPhone } from 'react-icons/lu'

export default function AllPeople() {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)

  const people = data?.people ?? []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading>All People</Heading>
        {people.map((person) => (
          <Link href={'/person/' + person.id} key={person.id}>
            <Card.Root my={1}>
              <Card.Header p={2} bgColor="gray.100">
                <HStack>
                  <Avatar src="https://bit.ly/dan-abramov" /> {person.name}
                </HStack>
              </Card.Header>
              <Card.Body p={2}>
                <Text>{person.email}</Text>
                {!!person.phone && (
                  <>
                    <Link href={`tel:${person.phone}`}>
                      <HStack>
                        <IconButton
                          colorPalette="brand"
                          aria-label="phone"
                          size="xs"
                          borderRadius={100}
                        >
                          <LuPhone />
                        </IconButton>
                        <Text>{person.phone}</Text>
                      </HStack>
                    </Link>

                    <Box my={2}>
                      <hr />
                    </Box>
                  </>
                )}

                {!!person.guidedBy.length && (
                  <>
                    <Box>
                      <Heading size="sm">Core Values:</Heading>
                      {person.guidedBy.map((coreValue, index) => (
                        <Text key={coreValue.name} as="span" fontSize="sm">
                          {coreValue.name}
                          {index < person.guidedBy.length - 1 && (
                            <Text as="span">, </Text>
                          )}
                        </Text>
                      ))}
                    </Box>
                    <Box my={2}>
                      <hr />
                    </Box>
                  </>
                )}
              </Card.Body>
            </Card.Root>
          </Link>
        ))}
      </Container>
    </ApolloWrapper>
  )
}
