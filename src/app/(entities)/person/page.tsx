import {
  GET_COMMUNITIES_AND_THEIR_MEMBERS,
  GET_PEOPLE_NOT_IN_COMMUNITIES,
} from '@/app/graphql'
import { query } from '@/app/lib/apollo-client'
import { PersonCard } from '@/components/ui'
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

export default async function AllPeople() {
  const { data } = await query({
    query: GET_COMMUNITIES_AND_THEIR_MEMBERS,
  })
  const { data: nonMembersData } = await query({
    query: GET_PEOPLE_NOT_IN_COMMUNITIES,
  })

  const nonMembers = {
    id: '',
    name: 'Non-Members',
    members: nonMembersData?.people,
  }

  const communities = [...data?.communities, nonMembers]

  return (
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
                <Link
                  href={
                    community?.id === '' ? '' : `/community/${community.id}`
                  }
                >
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
            <HStack gap={6} width="100%" overflowX="scroll" whiteSpace="nowrap">
              {community.members.map((member) => (
                <Flex key={member.id}>
                  <PersonCard
                    id={member.id}
                    name={member.name}
                    info={member.email}
                    photo={member.photo ?? ''}
                    person={member}
                  />
                </Flex>
              ))}
            </HStack>
          </VStack>
        ))}
    </Container>
  )
}
