import { query } from '@/app/lib/apollo-client'
import { GET_RESOURCE } from '@/app/graphql/queries'
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
} from '@/components'
import Link from 'next/link'
import { EntityEnum, TRIGGERS } from '@/constants'
import {
  ResourceCarePoints,
  ResourceDetails,
  ResourceProvidedBy,
  ResourceRelatedCommunities,
  ResourceRelatedGoals,
  ResourceRelatedResources,
} from '@/components/sections/resource'
import { Resource } from '@/gql/graphql'

export default async function ViewResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await query({
    query: GET_RESOURCE,
    variables: { id },
  })

  const resource = data?.resources[0]

  if (error) {
    throw error
  }

  if (data.resources?.length === 0) {
    throw new Error('Resource not found')
  }

  return (
    <>
      <EntityPageHeader entity={resource.__typename!} />
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
            borderColor="resource.emphasized"
            name={resource?.name}
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
            {resource?.name}
          </Heading>

          <Box display={{ base: 'block', lg: 'none' }} width="100%" padding={0}>
            <Link href={`/person/${resource?.providedByPerson[0].id}`}>
              <EntityOwnerCard person={resource?.providedByPerson[0]} />
            </Link>
          </Box>

          <HStack alignItems="start" gap={30} width="100%">
            <GenericTabs
              entityId={id}
              entityType={EntityEnum.Resource}
              entityName={resource.name}
              triggers={Object.keys(TRIGGERS.RESOURCE).map(
                (key) =>
                  TRIGGERS.RESOURCE[key as keyof typeof TRIGGERS.RESOURCE]
              )}
              content={[
                <ResourceDetails
                  key="Details"
                  resource={resource as Resource}
                />,
                <ResourceRelatedGoals
                  key="Goals"
                  resource={resource as Resource}
                />,
                <ResourceRelatedCommunities
                  key="Communities"
                  resource={resource as Resource}
                />,
                <ResourceCarePoints
                  key="CarePoints"
                  resource={resource as Resource}
                />,
                <ResourceRelatedResources
                  key="Resources"
                  resource={resource as Resource}
                />,
                <ResourceProvidedBy
                  key="ProvidedBy"
                  resource={resource as Resource}
                />,
              ]}
            />
            <Box display={{ base: 'none', lg: 'block' }} width="30%">
              <Spacer />
              <EntityOwnerCard person={resource?.providedByPerson[0]} />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </>
  )
}
