import { EditButton, EntityDetail } from '@/components'
import { Resource } from '@/gql/graphql'
import { HStack, Link, Spacer, VStack } from '@chakra-ui/react'
import React from 'react'

export default function ResourceDetails({ resource }: { resource: Resource }) {
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
        <Link href={`/resource/update/${resource.id}`}>
          <EditButton
            colorPalette="resource"
            size="xl"
            text="Edit Resource Details"
          />
        </Link>
      </HStack>

      <VStack gap={4} width="100%">
        <EntityDetail
          title="Description"
          entityName={resource.name}
          details={resource.description}
        />
        <EntityDetail title="Why" details={resource.why} />
        <EntityDetail title="Location" details={resource.location} />
        <EntityDetail title="Time" details={resource.time} />
        <EntityDetail title="Status" details={resource.status} />
      </VStack>
    </VStack>
  )
}
