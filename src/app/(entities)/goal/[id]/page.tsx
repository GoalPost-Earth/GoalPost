import { query } from '@/app/lib/apollo-client'
import ProfileDetailCard from '@/components/ProfileDetailCard'
import {
  Badge,
  Container,
  Heading,
  HStack,
  Image,
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
        <HStack mt={2} width="100%">
          <Text>{goal.name}</Text>
          <Spacer />
          <Badge size="lg" colorPalette="brand">
            {goal.type.toUpperCase()}
          </Badge>
        </HStack>

        {goal.motivatesPerson.length > 0 &&
          goal.motivatesPerson.map((person) => (
            <Text key={person.id}>{person.name} is motivated by this goal</Text>
          ))}

        <Image
          src={goal.photo ?? 'https://via.placeholder.com/400'}
          alt="Profile background"
          width={400}
        />

        <ProfileDetailCard title="Name" detail={goal.name} />
        <ProfileDetailCard title="Description" detail={goal.description} />
        <ProfileDetailCard title="Status" detail={goal.status} />
        <ProfileDetailCard
          title="Success Measures"
          detail={goal.successMeasures}
        />
        <ProfileDetailCard title="Location" detail={goal.location} />
        <ProfileDetailCard title="Type" detail={goal.type} />
        <ProfileDetailCard
          title="Created By"
          detail={goal.createdBy[0]?.name}
        />
      </VStack>
    </Container>
  )
}
