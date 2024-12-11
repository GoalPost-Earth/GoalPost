'use client'

import React from 'react'
import { query } from '../lib/ApolloClient'
import { GET_MEMBERS } from './GET_MEMBERS'
import { useQuery } from '@apollo/client'
import { Card, Text } from '@chakra-ui/react'

export default async function page() {
  const { data } = await useQuery(GET_MEMBERS)
  console.log('🚀 ~ file: page.tsx:7 ~ data:', data)

  const members = data?.people || []

  return (
    <div>
      {members.map((member) => (
        <Card.Root key={member.id}>
          <Card.Body>
            <Text>
              {member.firstName} {member.lastName}
            </Text>
          </Card.Body>
        </Card.Root>
      ))}
    </div>
  )
}
