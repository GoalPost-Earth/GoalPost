import { query } from '@/app/lib/apollo-client'
import ProfileDetailCard from '@/components/ProfileDetailCard'
import { Avatar } from '@/components/ui'
import {
  Badge,
  Container,
  defineStyle,
  Heading,
  HStack,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react'
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
      <Heading>Goal Details</Heading>
      <VStack>
        {/* <Avatar src="https://bit.ly/dan-abramov" size="2xl" /> */}
        <HStack mt={2} width="100%">
          <Text>{goal.name}</Text>
          <Spacer />
          <Badge size="lg" colorPalette="brand">
            {goal.type.toUpperCase()}
          </Badge>
        </HStack>
        <HStack width="100%" mb={2}>
          <Spacer />
          <Text fontWeight="bold" fontSize="xs">
            {goal.person.name}
          </Text>
        </HStack>

        <ProfileDetailCard title="Name" detail={goal.name} />
        <ProfileDetailCard title="Description" detail={goal.description} />
        <ProfileDetailCard title="Location" detail={goal.location} />
      </VStack>
    </Container>
  )
}
