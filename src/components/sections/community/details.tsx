import { EditButton, EntityDetail } from '@/components'
import { Community } from '@/gql/graphql'
import { HStack, Link, Spacer, VStack } from '@chakra-ui/react'
import React from 'react'

export default function CommunityDetails({
  community,
}: {
  community: Community
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
        <Link href={`/community/update/${community.id}/details`}>
          <EditButton
            colorPalette="community"
            size="xl"
            text="Edit Community Details"
          />
        </Link>
      </HStack>
      <VStack gap={4}>
        <EntityDetail
          title="Description"
          entityName={community.name}
          details={community.description}
        />
        <EntityDetail title="Location" details={community.location} />
        <EntityDetail title="Time" details={community.time} />
        <EntityDetail title="Status" details={community.status} />
      </VStack>
    </VStack>
  )
}
