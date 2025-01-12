'use client'

import {
  GET_COMMUNITIES_AND_THEIR_MEMBERS,
  GET_PEOPLE_NOT_IN_COMMUNITIES,
} from '@/app/graphql'
import { ApolloWrapper } from '@/components'
import { PersonCard } from '@/components/ui'
import { useQuery } from '@apollo/client'
import { Container, Flex, Heading, HStack, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export default function AllPeople() {
  const { data, loading, error } = useQuery(GET_COMMUNITIES_AND_THEIR_MEMBERS)
  const {
    data: nonMembersData,
    loading: nonMembersLoading,
    error: nonMembersError,
  } = useQuery(GET_PEOPLE_NOT_IN_COMMUNITIES)

  const nonMembers = {
    id: '',
    name: 'Non-Members',
    members: nonMembersData?.people ?? [],
  }

  const communities = [...(data?.communities ?? []), nonMembers]

  return (
    <ApolloWrapper
      data={data || nonMembersData}
      loading={loading || nonMembersLoading}
      error={error || nonMembersError}
    >
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
          communities.map((community) => {
            if (community.members.length === 0) {
              return <></>
            }

            return (
              <VStack key={community.id} my={10} gap={4} alignItems="start">
                <Heading>
                  <Link
                    href={
                      community?.id === '' ? '' : `/community/${community.id}`
                    }
                  >
                    {community.name}
                  </Link>
                </Heading>
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
                        photo={member.photo ?? ''}
                        person={member}
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
