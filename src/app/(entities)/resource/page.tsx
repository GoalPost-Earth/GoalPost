'use client'

import { GET_PEOPLE_AND_THEIR_RESOURCES } from '@/app/graphql'
import { ApolloWrapper } from '@/components'
import { PersonInfo, ResourceCard } from '@/components/ui'
import { Resource } from '@/gql/graphql'
import { useQuery } from '@apollo/client'
import { Container, Flex, Heading, HStack, VStack } from '@chakra-ui/react'
import React from 'react'

export default function AllResources() {
  const { data, loading, error } = useQuery(GET_PEOPLE_AND_THEIR_RESOURCES)

  const people = data?.people ?? []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container
        overflowX="scroll"
        padding={4}
        paddingRight={0}
        position="relative"
      >
        <Heading
          position="sticky"
          left={4}
          my={5}
          fontSize="3xl"
          fontWeight="extrabold"
        >
          Resources
        </Heading>

        {people.map((person) => {
          return (
            <VStack key={person.id} my={10} gap={4} alignItems="start">
              <PersonInfo person={person} />
              <HStack
                gap={6}
                width="100%"
                overflowX="scroll"
                whiteSpace="nowrap"
                alignItems="start"
              >
                {person.providesResources.map((resource) => (
                  <Flex
                    key={resource.id}
                    minWidth="300px"
                    maxWidth="300px"
                    height="150px"
                  >
                    <ResourceCard resource={resource as Resource} />
                  </Flex>
                ))}
              </HStack>
            </VStack>
          )
        })}
      </Container>
    </ApolloWrapper>
  )
}
