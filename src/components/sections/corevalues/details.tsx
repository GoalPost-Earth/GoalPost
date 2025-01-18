import { EditButton, EntityDetail } from '@/components'
import { CoreValue } from '@/gql/graphql'
import { HStack, Link, Spacer, VStack } from '@chakra-ui/react'
import React from 'react'

export default function CoreValueDetails({
  corevalue,
}: {
  corevalue: CoreValue
}) {
  return (
    <VStack
      key="Details"
      p={4}
      gap={4}
      bg={'gray.contrast'}
      borderRadius={'2xl'}
      boxShadow={'xs'}
      alignItems={'flex-start'}
      width={{ lg: '70%' }}
    >
      <HStack width="100%" justifyContent="space-between">
        <Spacer />
        <Link href={`/corevalue/update/${corevalue.id}`}>
          <EditButton
            colorPalette="corevalue"
            size="xl"
            text="Edit Core Value Details"
          />
        </Link>
      </HStack>
      <VStack gap={4}>
        <EntityDetail
          title="Description"
          entityName={corevalue.name}
          details={corevalue.description}
        />
        {/* <EntityDetail title="Who Supports" details={corevalue.whoSupports} /> */}
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
    </VStack>
  )
}
