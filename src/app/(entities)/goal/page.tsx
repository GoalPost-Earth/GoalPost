'use client'
import React from 'react'
import { GET_PEOPLE_AND_THEIR_GOALS } from '@/app/graphql'
import { ApolloWrapper, PersonCard } from '@/components'
import GoalCard from '@/components/ui/goal-card'
import { useQuery } from '@apollo/client'
import {
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { IoArrowForwardCircleOutline } from 'react-icons/io5'

export default function AllGoals() {
  const { data, loading, error } = useQuery(GET_PEOPLE_AND_THEIR_GOALS, {
    variables: {
      personWhere: {
        communities_NONE: null,
      },
      goalLimit: 10,
    },
  })

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
                <PersonCard
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
                  <Text>All Goals</Text>
                  <IoArrowForwardCircleOutline />
                </Flex>
              </HStack>
              <HStack
                gap={6}
                width="100%"
                overflowX="scroll"
                whiteSpace="nowrap"
              >
                {person.goals.map((goal) => (
                  <Flex key={goal.id}>
                    <GoalCard
                      id={goal.id}
                      photo={goal.photo}
                      status={goal.status}
                      name={goal.name}
                      createdAt={goal.createdAt}
                      description={goal.description}
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
