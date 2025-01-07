'use client'
import React, { useRef, createRef } from 'react'
import { GET_ALL_GOALS, GET_ALL_PEOPLE } from '@/app/graphql'
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
  const scrollContainerRefs = useRef(new Map())

  const { data, loading, error } = useQuery(GET_ALL_GOALS, {
    variables: {
      where: {
        motivatesPeople_NONE: null,
      },
    },
  })

  const { data: people } = useQuery(GET_ALL_PEOPLE, {
    variables: {
      where: {
        communities_NONE: null,
      },
    },
  })

  const members = people?.people ?? []
  const goals = data?.goals ?? []

  const membersWithGoalsAndTheirGoals = members.map((member) => ({
    ...member,
    goals: goals.filter((goal) =>
      goal.motivatesPeople.some((person) => person.id === member.id)
    ),
  }))

  const scrollToTheLeft = (memberId: string) => {
    const ref = scrollContainerRefs.current.get(memberId)?.current

    if (ref && ref.scrollBy) {
      ref.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

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
        {membersWithGoalsAndTheirGoals.map((member) => {
          if (!scrollContainerRefs.current.has(member.id)) {
            scrollContainerRefs.current.set(member.id, createRef())
          }

          return (
            <VStack key={member.id} my={10} gap={4} alignItems="start">
              <HStack justifyContent="space-between" width="100%">
                <PersonCard
                  id={member.id}
                  name={member.name}
                  photo={member.photo ?? ''}
                />
                <Flex
                  fontWeight="bold"
                  fontSize="sm"
                  gap={2}
                  alignItems="center"
                  cursor="pointer"
                  onClick={() => scrollToTheLeft(member.id)}
                >
                  <Text>All Goals</Text>
                  <IoArrowForwardCircleOutline />
                </Flex>
              </HStack>
              <HStack
                ref={scrollContainerRefs.current.get(member.id)}
                gap={6}
                width="100%"
                overflowX="scroll"
                whiteSpace="nowrap"
                scrollbarWidth="none"
              >
                {goals.map((goal) => (
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
