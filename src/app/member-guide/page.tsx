'use client'

import React from 'react'
import { GET_MEMBERS } from '../graphql/queries/MEMBER_QUERIES'
import { Card, Text } from '@chakra-ui/react'
import { useQuery } from '@apollo/client'
import ApolloWrapper from '@/components/ApolloWrapper'

export default function MemberGuide() {
  const { data, loading, error } = useQuery(GET_MEMBERS)

  const members = data?.members || []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      {members.map((member) => (
        <Card.Root key={member.id}>
          <Card.Body>
            <Text>
              {member.firstName} {member.lastName}
            </Text>
          </Card.Body>
        </Card.Root>
      ))}
    </ApolloWrapper>
  )
}
