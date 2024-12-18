import React from 'react'
import { query } from '@/app/lib/apollo-client'
import { GET_MEMBERS } from '../queries/GET_MEMBERS'
import { Card, Text } from '@chakra-ui/react'

export default async function page() {
  const { data } = await query({
    query: GET_MEMBERS,
  })

  const members = data?.members || []

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
