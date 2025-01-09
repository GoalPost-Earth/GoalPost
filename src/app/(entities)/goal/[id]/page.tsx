import { query } from '@/app/lib/apollo-client'
import { GET_GOAL } from '@/app/graphql/queries'
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Spacer,
  VStack,
} from '@chakra-ui/react'
import React from 'react'
import {
  LoadingScreen,
  Avatar,
  EntityPageHeader,
  GenericTabs,
  EntityDetail,
  EntityOwnerCard,
  CarePointCard,
} from '@/components'
import Link from 'next/link'

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

  if (!goal) {
    return <LoadingScreen />
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
              <EntityOwnerCard person={goal?.motivatesPeople[0]} />
            </Link>
          </Box>

          <HStack alignItems="start" gap={30} width="100%">
            <GenericTabs
              editLink={`/goal/update/${id}`}
              onDeleteEntity="Goal"
              triggers={[
                'Details',
                'Enables Care Points',
                'Cared For By Care Points',
              ]}
              content={[
                <VStack
                  key="Details"
                  p={4}
                  bg={'gray.contrast'}
                  borderRadius={'2xl'}
                  boxShadow={'xs'}
                  alignItems={'flex-start'}
                  width={{ lg: '70%' }}
                >
                  <VStack gap={4}>
                    <EntityDetail
                      title="Description"
                      entityName={goal.name}
                      details={goal.description}
                    />
                    <EntityDetail title="Location" details={goal.location} />
                    <EntityDetail title="Time" details={goal.time} />
                    <EntityDetail title="Status" details={goal.status} />
                  </VStack>
                </VStack>,
                <Grid
                  key="enablesCarePoints"
                  templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
                  gap={6}
                >
                  {goal.enablesCarePoints.map((carePoint) => (
                    <GridItem key={carePoint.id}>
                      <CarePointCard
                        id={carePoint.id}
                        description={carePoint.description}
                        status={carePoint.status}
                      />
                    </GridItem>
                  ))}
                </Grid>,
                <Grid
                  key="caredForByCarePoints"
                  templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
                  gap={6}
                >
                  {goal.caredForByCarePoints.map((carePoint) => (
                    <GridItem key={carePoint.id}>
                      <CarePointCard
                        id={carePoint.id}
                        description={carePoint.description}
                        status={carePoint.status}
                      />
                    </GridItem>
                  ))}
                </Grid>,
              ]}
            />
            <Box display={{ base: 'none', lg: 'block' }} width="30%">
              <Spacer />
              <EntityOwnerCard person={goal?.motivatesPeople[0]} />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </>
  )
}
