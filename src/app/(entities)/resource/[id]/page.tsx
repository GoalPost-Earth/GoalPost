import { query } from '@/app/lib/apollo-client'
import { GET_RESOURCE } from '@/app/graphql/queries'
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react'
import React from 'react'
import {
  LoadingScreen,
  ApolloWrapper,
  Avatar,
  EntityPageHeader,
  GenericTabs,
  EntityDetail,
  EntityOwnerCard,
} from '@/components'
import Link from 'next/link'

export default async function ViewResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, loading, error } = await query({
    query: GET_RESOURCE,
    variables: { id },
  })

  const resource = data?.resources[0]

  if (!resource) {
    return <LoadingScreen />
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
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
              editLink={`/resource/update/${id}`}
              onDeleteEntity="Resource"
              triggers={['Details', 'Linked Care Points']}
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
                      entityName={resource.name}
                      details={resource.description}
                    />
                    <EntityDetail title="Why" details={resource.why} />
                    <EntityDetail
                      title="Location"
                      details={resource.location}
                    />
                    <EntityDetail title="Time" details={resource.time} />
                    <EntityDetail title="Status" details={resource.status} />
                  </VStack>
                </VStack>,
                <VStack
                  key="Linked Care Points"
                  p={4}
                  bg={'gray.contrast'}
                  borderRadius={'2xl'}
                  boxShadow={'xs'}
                  alignItems={'flex-start'}
                >
                  <Text>Linked Care Points</Text>
                </VStack>,
              ]}
            />
            <Box display={{ base: 'none', lg: 'block' }} width="30%">
              <Spacer />
              <EntityOwnerCard person={resource?.providedByPerson[0]} />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </ApolloWrapper>
  )
}
