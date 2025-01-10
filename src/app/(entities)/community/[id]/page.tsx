import { query } from '@/app/lib/apollo-client'
import { GET_COMMUNITY } from '@/app/graphql/queries'
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
  Avatar,
  EntityPageHeader,
  GenericTabs,
  EntityDetail,
  EntityOwnerCard,
  CommunityCard,
  ResourceCard,
  PersonCard,
} from '@/components'
import Link from 'next/link'
import { Community, Resource } from '@/gql/graphql'
import { EntityEnum } from '@/constants'

export default async function ViewCommunityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await query({
    query: GET_COMMUNITY,
    variables: { id },
  })

  const community = data?.communities[0]

  if (error) {
    throw error
  }

  if (data.communities.length === 0) {
    throw new Error('Community not found')
  }

  return (
    <>
      <EntityPageHeader entity={community.__typename!} />
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
            borderColor="community.emphasized"
            name={community?.name}
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
            {community?.name}
          </Heading>

          <Box display={{ base: 'block', lg: 'none' }} width="100%" padding={0}>
            <Link href={`/person/${community?.createdBy[0]?.id}`}>
              <EntityOwnerCard person={community?.createdBy[0]} />
            </Link>
          </Box>

          <HStack alignItems="start" gap={30} width="100%">
            <GenericTabs
              entityId={id}
              entityType={EntityEnum.Community}
              entityName={community.name}
              triggers={[
                'Details',
                'Related Communities',
                'Resources',
                'Members',
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
                      entityName={community.name}
                      details={community.description}
                    />
                    <EntityDetail
                      title="Location"
                      details={community.location}
                    />
                    <EntityDetail title="Time" details={community.time} />
                    <EntityDetail title="Status" details={community.status} />
                  </VStack>
                </VStack>,
                <Grid
                  key="relatedCommunities"
                  templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
                  gap={6}
                >
                  {community.relatedCommunities.map((community) => (
                    <GridItem key={community.id}>
                      <CommunityCard community={community as Community} />
                    </GridItem>
                  ))}
                </Grid>,
                <Grid
                  key="resources"
                  templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
                  gap={6}
                >
                  {community.resources.map((resource) => (
                    <GridItem key={resource.id}>
                      <ResourceCard resource={resource as Resource} />
                    </GridItem>
                  ))}
                </Grid>,
                <Grid
                  key="members"
                  templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
                  gap={6}
                >
                  {community.members.map((person) => (
                    <GridItem key={person.id}>
                      <PersonCard
                        id={person.id}
                        name={person.name}
                        photo={person.photo}
                      />
                    </GridItem>
                  ))}
                </Grid>,
              ]}
            />
            <Box display={{ base: 'none', lg: 'block' }} width="30%">
              <Spacer />
              <EntityOwnerCard person={community?.createdBy[0]} />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </>
  )
}
