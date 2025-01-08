'use client'

import { GET_PEOPLE_AND_THEIR_RESOURCES } from '@/app/graphql'
import { ApolloWrapper } from '@/components'
import { PersonInfo, ResourceCard } from '@/components/ui'
import { useQuery } from '@apollo/client'
import {
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import React from 'react'
import { IoArrowForwardCircleOutline } from 'react-icons/io5'

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
          Goals
        </Heading>

        {people.map((person) => {
          return (
            <VStack key={person.id} my={10} gap={4} alignItems="start">
              <HStack justifyContent="space-between" width="100%">
                <PersonInfo
                  id={person.id}
                  name={person.name}
                  photo={person.photo ?? ''}
                />
                <Flex
                  fontWeight="bold"
                  fontSize="sm"
                  gap={2}
                  alignItems="center"
                  cursor="pointer"
                >
                  <Text>All Resources</Text>
                  <IoArrowForwardCircleOutline />
                </Flex>
              </HStack>
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
                    <ResourceCard
                      id={resource.id}
                      name={resource.name}
                      description={resource.description ?? ''}
                      ownerPhoto={
                        resource.providedByPerson[0]?.photo ?? undefined
                      }
                      ownerName={
                        resource.providedByPerson[0]?.name ?? undefined
                      }
                      status={resource.status}
                    />
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
