import { EditButton, EntityDetail } from '@/components'
import { CarePoint } from '@/gql/graphql'
import { getHumanReadableDate } from '@/utils'
import { HStack, Link, Spacer, VStack } from '@chakra-ui/react'
import React from 'react'

export default function CarePointDetails({
  carepoint,
}: {
  carepoint: CarePoint
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
      width={{ lg: '80%' }}
    >
      <HStack width="100%" justifyContent="space-between">
        <Spacer />
        <Link href={`/carepoint/update/${carepoint.id}`}>
          <EditButton
            colorPalette="carepoint"
            size="xl"
            text="Edit CarePoint Details"
          />
        </Link>
      </HStack>

      <VStack gap={4} width="100%">
        <EntityDetail
          title="Description"
          entityName={carepoint.name}
          details={carepoint.description}
        />
        <EntityDetail title="Status" details={carepoint.status} />
        <EntityDetail title="Why" details={carepoint.why} />
        <EntityDetail title="Location" details={carepoint.location} />
        <EntityDetail title="Time" details={carepoint.time} />
        <EntityDetail
          title="Level Fulfilled"
          details={carepoint.levelFulfilled}
        />
        <EntityDetail
          title="Fulfillment Date"
          details={
            carepoint.fulfillmentDate
              ? getHumanReadableDate(carepoint.fulfillmentDate ?? '')
              : undefined
          }
        />
        <EntityDetail
          title="Success Measures"
          details={carepoint.successMeasures}
        />
        <EntityDetail
          title="Issues Identified"
          details={carepoint.issuesIdentified}
        />
        <EntityDetail
          title="Issues Resolved"
          details={carepoint.issuesResolved}
        />
      </VStack>
    </VStack>
  )
}
