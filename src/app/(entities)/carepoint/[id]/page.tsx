import { query } from '@/app/lib/apollo-client'
import { GET_CAREPOINT } from '@/app/graphql/queries'
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
  EntityDetail,
  EntityOwnerCard,
  CarePointLinkedGoals,
} from '@/components'
import Link from 'next/link'
import { EntityEnum, TRIGGERS } from '@/constants'
import { CarePoint } from '@/gql/graphql'

export default async function ViewCarePointPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await query({
    query: GET_CAREPOINT,
    variables: { id },
  })

  const carepoint = data?.carePoints[0]

  if (error) {
    throw error
  }

  if (data.carePoints.length === 0) {
    throw new Error('Care Point not found')
  }

  return (
    <>
      <EntityPageHeader entity={carepoint.__typename!} />
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
            borderColor="carepoint.emphasized"
            name={carepoint?.description}
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
            {carepoint?.description}
          </Heading>

          <Box display={{ base: 'block', lg: 'none' }} width="100%" padding={0}>
            <Link href={`/person/${carepoint?.createdBy[0]?.id}`}>
              <EntityOwnerCard person={carepoint?.createdBy[0]} />
            </Link>
          </Box>

          <HStack alignItems="start" gap={30} width="100%">
            <GenericTabs
              entityId={id}
              entityType={EntityEnum.CarePoint}
              entityName={carepoint.description}
              triggers={Object.keys(TRIGGERS.CAREPOINTS).map(
                (key) =>
                  TRIGGERS.CAREPOINTS[key as keyof typeof TRIGGERS.CAREPOINTS]
              )}
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
                      entityName={carepoint.description}
                      details={carepoint.description}
                    />

                    <EntityDetail title="Status" details={carepoint.status} />
                  </VStack>
                </VStack>,
                <CarePointLinkedGoals
                  key="linkedGoals"
                  carePoint={carepoint as CarePoint}
                />,
              ]}
            />
            <Box display={{ base: 'none', lg: 'block' }} width="30%">
              <Spacer />
              <EntityOwnerCard person={carepoint?.createdBy[0]} />
            </Box>
          </HStack>
        </VStack>
      </Container>
    </>
  )
}
