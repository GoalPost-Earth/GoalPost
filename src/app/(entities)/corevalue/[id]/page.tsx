import { query } from '@/app/lib/apollo-client'
import { GET_COREVALUE } from '@/app/graphql/queries'
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
  Avatar,
  EntityPageHeader,
  GenericTabs,
  EntityDetail,
  EntityOwnerCard,
} from '@/components'
import Link from 'next/link'
import { EntityEnum } from '@/constants'

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
          <Heading mt={5} fontSize="2xl" fontWeight="bold">
            {corevalue?.name}
          </Heading>

          <Box display={{ base: 'block', lg: 'none' }} width="100%" padding={0}>
            <Link href={`/person/${corevalue?.createdBy[0]?.id}`}>
              <EntityOwnerCard person={corevalue?.createdBy[0]} />
            </Link>
          </Box>

          <HStack alignItems="start" gap={30} width="100%">
            <GenericTabs
              entityId={id}
              entityType={EntityEnum.CoreValue}
              entityName={corevalue.name}
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
                      entityName={corevalue.name}
                      details={corevalue.description}
                    />
                    <EntityDetail
                      title="Who Supports"
                      details={corevalue.whoSupports}
                    />
                    <EntityDetail
                      title="Alignment Challenges"
                      details={corevalue.alignmentChallenges}
                    />
                    <EntityDetail
                      title="Alignment Examples"
                      details={corevalue.alignmentExamples}
                    />
                    <EntityDetail title="Why" details={corevalue.why} />
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
              <EntityOwnerCard person={corevalue?.createdBy[0]} />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </>
  )
}
