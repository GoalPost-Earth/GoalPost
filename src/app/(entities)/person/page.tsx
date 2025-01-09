'use client'
import { GET_COMMUNITIES_AND_THEIR_MEMBERS } from '@/app/graphql'
import { ApolloWrapper } from '@/components'
import { PersonCard } from '@/components/ui'
import { useQuery } from '@apollo/client'
import {
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { IoArrowForwardCircleOutline } from 'react-icons/io5'

export default function AllPeople() {
  const { data, loading, error } = useQuery(GET_COMMUNITIES_AND_THEIR_MEMBERS)

  const communities = data?.communities

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading
          position="sticky"
          left={4}
          my={5}
          fontSize="3xl"
          fontWeight="extrabold"
        >
          People
        </Heading>
        {communities &&
          communities.map((community) => (
            <VStack key={community.id} my={10} gap={4} alignItems="start">
              <HStack justifyContent="space-between" width="100%">
                <Heading>
                  <Link href={`/community/${community.id}`}>
                    {community.name}
                  </Link>
                </Heading>
                <Flex
                  fontWeight="bold"
                  fontSize="sm"
                  gap={2}
                  alignItems="center"
                  cursor="pointer"
                >
                  <Text>All People</Text>
                  <IoArrowForwardCircleOutline />
                </Flex>
              </HStack>
              <HStack
                gap={6}
                width="100%"
                overflowX="scroll"
                whiteSpace="nowrap"
              >
                {community.members.map((member) => (
                  <Flex key={member.id}>
                    <PersonCard
                      id={member.id}
                      name={member.name}
                      info={member.email}
                    />
                  </Flex>
                ))}
              </HStack>
            </VStack>
          ))}
      </Container>
    </ApolloWrapper>
  )
}
