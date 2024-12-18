import { query } from '@/app/lib/apollo-client'
import ProfileDetailCard from '@/components/ProfileDetailCard'
import { Avatar } from '@/components/ui'
import { Container, defineStyle, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { GET_GOAL } from '@/app/graphql/queries'

export default async function ViewGoalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data } = await query({
    query: GET_GOAL,
    variables: { id },
  })

  const goal = data?.goals[0]

  return (
    <Container>
      <VStack>
        <Avatar src="https://bit.ly/dan-abramov" size="2xl" />
        <Text>{goal.name}</Text>

        <ProfileDetailCard title="First Name" detail={goal.name} />
      </VStack>
    </Container>
  )
}
