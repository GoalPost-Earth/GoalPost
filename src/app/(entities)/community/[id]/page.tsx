'use client'

import { GET_COMMUNITY } from '@/app/graphql/queries'
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
import React, { use, useEffect } from 'react'
import {
  Avatar,
  EntityPageHeader,
  GenericTabs,
  EntityOwnerCard,
  DeleteButton,
  ApolloWrapper,
} from '@/components'
import Link from 'next/link'
import { Community } from '@/gql/graphql'
import { EntityEnum, TRIGGERS } from '@/constants'
import {
  CommunityCoreValues,
  CommunityDetails,
  CommunityGoals,
  CommunityMembers,
  CommunityResources,
  RelatedCommunities,
} from '@/components'
import { useQuery } from '@apollo/client'

export default function ViewCommunityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data, loading, error, refetch } = useQuery(GET_COMMUNITY, {
    variables: { id },
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    refetch()
  }, [refetch])

  const community = data?.communities[0]

  if (error) {
    throw error
  }

  if (!community) return <></>

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
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
          <Stack
            mt={5}
            width="100%"
            flexDirection={{ base: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'center' }}
          >
            <Heading fontSize="2xl" fontWeight="bold">
              {community?.name}
            </Heading>

            <Box>
              <DeleteButton
                entityId={community.id}
                entityType={EntityEnum.Community}
                entityName={community.name}
              />
            </Box>
          </Stack>

          <Box display={{ base: 'block', lg: 'none' }} width="100%" padding={0}>
            <Link href={`/person/${community?.createdBy[0]?.id}`}>
              <EntityOwnerCard
                owner={community?.createdBy[0]}
                entity={community}
              />
            </Link>
          </Box>

          <HStack alignItems="start" gap={30} width="100%">
            <GenericTabs
              entityId={id}
              entityType={EntityEnum.Community}
              entityName={community.name}
              triggers={Object.keys(TRIGGERS.COMMUNITY).map(
                (key) =>
                  TRIGGERS.COMMUNITY[key as keyof typeof TRIGGERS.COMMUNITY]
              )}
              content={[
                <CommunityDetails
                  key="details"
                  community={community as Community}
                />,
                <CommunityMembers
                  key="members"
                  community={community as Community}
                />,
                <CommunityGoals
                  key="goals"
                  community={community as Community}
                />,
                <CommunityResources
                  key="resources"
                  community={community as Community}
                />,
                <RelatedCommunities
                  key="related-communities"
                  community={community as Community}
                />,
                <CommunityCoreValues
                  key="corevalues"
                  community={community as Community}
                />,
              ]}
            />
            <Box display={{ base: 'none', lg: 'block' }} width="30%">
              <Spacer />
              <EntityOwnerCard
                owner={community?.createdBy[0]}
                entity={community}
              />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </ApolloWrapper>
  )
}
