import { query } from '@/app/lib/apollo-client'
import { GET_GOAL } from '@/app/graphql/queries'
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Spacer,
  VStack,
} from '@chakra-ui/react'
import React from 'react'
import {
  Avatar,
  EntityPageHeader,
  GenericTabs,
  EntityOwnerCard,
  GoalDetails,
  GoalCoreValues,
  GoalEnablesCarePoints,
  GoalCaredForByCarePoints,
  GoalMotivatesPeople,
  GoalMotivatesCommunities,
  GoalRelatedResources,
} from '@/components'
import Link from 'next/link'
import { EntityEnum, TRIGGERS } from '@/constants'
import { Goal } from '@/gql/graphql'

export default async function ViewGoalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await query({
    query: GET_GOAL,
    variables: { id },
  })

  const goal = data?.goals[0]

  if (error) {
    throw error
  }

  if (data.goals.length === 0) {
    throw new Error('Goal not found')
  }

  return (
    <>
      <EntityPageHeader entity={goal.__typename!} />
      <VStack alignItems={'center'} gap={3}>
        <Flex
          flexDirection={{ base: 'column', lg: 'row' }}
          gap={5}
          alignItems={{ base: 'center', lg: 'flex-end' }}
          justifyContent="center"
          position={{ lg: 'absolute' }}
          left={{ lg: '70px' }}
          top={{ lg: '120px' }}
        >
          <Avatar
            src={goal.photo ?? undefined}
            width={200}
            height={200}
            border={'10px solid'}
            colorPalette={'bg'}
            borderColor="goal.emphasized"
            name={goal?.name}
            fontSize="60px"
          />
        </Flex>
      </VStack>

      <Container
        display="flex"
        gap={3}
        mt={{ base: 10, lg: '120px' }}
        flexDirection={{ base: 'column', lg: 'row' }}
        alignItems={{ base: 'center', lg: 'flex-start' }}
        width="100%"
      >
        <VStack width="100%" justifyContent="center" alignItems="start" gap={4}>
          <Heading mt={5} fontSize="2xl" fontWeight="bold">
            {goal?.name}
          </Heading>

          <Box display={{ base: 'block', lg: 'none' }} width="100%" padding={0}>
            <Link href={`/person/${goal?.motivatesPeople[0]?.id}`}>
              <EntityOwnerCard
                person={goal?.motivatesPeople[0]}
                community={goal?.motivatesCommunities[0]}
              />
            </Link>
          </Box>

          <HStack alignItems="start" gap={30} width="100%">
            <GenericTabs
              entityId={id}
              entityType={EntityEnum.Goal}
              entityName={goal.name}
              triggers={Object.keys(TRIGGERS.GOAL).map(
                (key) => TRIGGERS.GOAL[key as keyof typeof TRIGGERS.GOAL]
              )}
              content={[
                <GoalDetails key="details" goal={goal as Goal} />,
                <GoalCoreValues key="coreValues" goal={goal as Goal} />,
                <GoalEnablesCarePoints
                  key="enablesCarePoints"
                  goal={goal as Goal}
                />,
                <GoalCaredForByCarePoints
                  key="caredForByCarePoints"
                  goal={goal as Goal}
                />,
                <GoalMotivatesPeople
                  key="motivatesPeople"
                  goal={goal as Goal}
                />,
                <GoalMotivatesCommunities
                  key="motivatesCommunities"
                  goal={goal as Goal}
                />,
                <GoalRelatedResources
                  key="relatedResources"
                  goal={goal as Goal}
                />,
              ]}
            />
            <Box display={{ base: 'none', lg: 'block' }} width="30%">
              <Spacer />
              <EntityOwnerCard
                person={goal?.motivatesPeople[0]}
                community={goal?.motivatesCommunities[0]}
              />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </>
  )
}
