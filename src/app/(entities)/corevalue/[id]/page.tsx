import { query } from '@/app/lib/apollo-client'
import { GET_COREVALUE } from '@/app/graphql/queries'
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Spacer,
  Stack,
  VStack,
} from '@chakra-ui/react'
import React from 'react'
import {
  Avatar,
  EntityPageHeader,
  GenericTabs,
  EntityOwnerCard,
  DeleteButton,
} from '@/components'
import Link from 'next/link'
import { EntityEnum, TRIGGERS } from '@/constants'
import {
  CoreValueAlignedGoals,
  CoreValueCommunitiesGuided,
  CoreValueDetails,
  CoreValueRelatedMembers,
} from '@/components/sections/corevalues'
import { CoreValue } from '@/gql/graphql'

export default async function ViewCoreValuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await query({
    query: GET_COREVALUE,
    variables: { id },
  })

  if (error) {
    throw error
  }

  if (data.coreValues.length === 0) {
    throw new Error('Core Value not found')
  }
  const corevalue = data?.coreValues[0]

  return (
    <>
      <EntityPageHeader entity={corevalue.__typename!} />
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
            src={undefined}
            width={200}
            height={200}
            border={'10px solid'}
            colorPalette={'bg'}
            borderColor="corevalue.emphasized"
            name={corevalue?.name}
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
          <Stack
            mt={5}
            width="100%"
            flexDirection={{ base: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'center' }}
          >
            <Heading fontSize="2xl" fontWeight="bold">
              {corevalue?.name}
            </Heading>

            <Box>
              <DeleteButton
                entityId={corevalue.id}
                entityType={EntityEnum.CoreValue}
                entityName={corevalue.name}
              />
            </Box>
          </Stack>

          <Box display={{ base: 'block', lg: 'none' }} width="100%" padding={0}>
            <Link href={`/person/${corevalue?.createdBy[0]?.id}`}>
              <EntityOwnerCard
                owner={corevalue?.createdBy[0]}
                entity={corevalue}
              />
            </Link>
          </Box>

          <HStack alignItems="start" gap={30} width="100%">
            <GenericTabs
              entityId={id}
              entityType={EntityEnum.CoreValue}
              entityName={corevalue.name}
              triggers={Object.keys(TRIGGERS.COREVALUE).map(
                (key) =>
                  TRIGGERS.COREVALUE[key as keyof typeof TRIGGERS.COREVALUE]
              )}
              content={[
                <CoreValueDetails
                  key="Details"
                  corevalue={corevalue as CoreValue}
                />,
                <CoreValueAlignedGoals
                  key="Aligned Goals"
                  corevalue={corevalue as CoreValue}
                />,
                <CoreValueRelatedMembers
                  key="Related Members"
                  corevalue={corevalue as CoreValue}
                />,
                <CoreValueCommunitiesGuided
                  key="Communities Guided"
                  corevalue={corevalue as CoreValue}
                />,
              ]}
            />
            <Box display={{ base: 'none', lg: 'block' }} width="30%">
              <Spacer />
              <EntityOwnerCard
                owner={corevalue?.createdBy[0]}
                entity={corevalue}
              />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </>
  )
}
