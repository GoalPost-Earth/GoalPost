'use client'

import { Button, EmptyState, ResourceCard } from '@/components/ui'
import { Community } from '@/gql/graphql'
import { Grid, GridItem, HStack, Link, Spacer, VStack } from '@chakra-ui/react'
import React from 'react'

export default function CommunityResources({
  community,
}: {
  community: Community
}) {
  return (
    <VStack
      key="Resources"
      p={4}
      gap={4}
      bg={'gray.contrast'}
      borderRadius={'2xl'}
      boxShadow={'xs'}
      alignItems={'flex-start'}
      width="100%"
    >
      {community.resources.length > 0 && (
        <HStack width="100%" justifyContent="space-between">
          <Spacer />
          <Link href={`/resource/create?communityId=${community.id}`}>
            <Button size="sm" variant="surface">
              Add A Resource
            </Button>
          </Link>
        </HStack>
      )}
      {community.resources.length === 0 && (
        <EmptyState title="No Resources" description="Click here to add some">
          <Link href={`/resource/create?communityId=${community.id}`}>
            <Button variant="surface">Add A Resource</Button>
          </Link>
        </EmptyState>
      )}

      <Grid
        key="resources"
        templateColumns={{
          base: '1fr',
          lg: 'repeat(auto-fill, minmax(250px, 1fr))',
          xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
        }}
        gap={6}
        width="100%"
      >
        {community.resources.map((resource) => (
          <GridItem key={resource.id}>
            <ResourceCard resource={resource} />
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
