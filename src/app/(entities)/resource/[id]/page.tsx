import { query } from '@/app/lib/apollo-client'
import { GET_RESOURCE } from '@/app/graphql/queries'
import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import React from 'react'
import { ApolloWrapper } from '@/components'
import { LoadingScreen } from '@/components/screens'
import ResourceDetails from '@/components/ui/resource-details'
import EllipseIcon from '@/components/icons/EllipseIcon'
import ResourceOwnerCard from '@/components/ui/resource-owner-card'
import {
  ActionButtons,
  Avatar,
  DeleteButton,
  EditButton,
  ProfileBackground,
} from '@/components/ui'

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
      <Container>
        <ProfileBackground />
        <VStack alignItems={'center'} gap={3}>
          <Flex
            flexDirection={{ base: 'column', lg: 'row' }}
            gap={5}
            alignItems={{ base: 'center', lg: 'flex-end' }}
            justifyContent="center"
            position={{ lg: 'absolute' }}
            left={{ lg: '70px' }}
            top={{ lg: '150px' }}
          >
            <Avatar
              src={undefined}
              width={200}
              height={200}
              border={'10px solid white'}
              name={resource?.name}
              fontSize="60px"
            />
            <Flex flexDirection={'column'} gap={2} pb={5}>
              <Flex alignItems="center" gap={2}>
                <Heading fontSize="2xl">{resource?.name}</Heading>
                <EllipseIcon />
              </Flex>
              <Text
                display={{ base: 'none', lg: 'block' }}
                fontWeight={'light'}
              >
                Resource
              </Text>
            </Flex>
          </Flex>
          <Box display={{ base: 'block', lg: 'none' }}>
            <ActionButtons />
          </Box>
        </VStack>
        <Container
          display="flex"
          gap={3}
          mt={{ base: 10, lg: '150px' }}
          flexDirection={{ base: 'column', lg: 'row' }}
          alignItems={{ base: 'center', lg: 'flex-start' }}
        >
          <VStack
            justifyContent="center"
            gap={4}
            maxWidth={'400px'}
            width={'100%'}
          >
            <ResourceOwnerCard
              name={resource?.providedByPerson[0]?.name}
              image={resource?.providedByPerson[0]?.photo ?? undefined}
              email={resource?.providedByPerson[0]?.email ?? ''}
            />
            <HStack display={{ base: 'none', lg: 'block' }}>
              <EditButton />
              <DeleteButton />
            </HStack>
          </VStack>
          {resource && <ResourceDetails resource={resource} />}
        </Container>
      </Container>
    </ApolloWrapper>
  )
}
