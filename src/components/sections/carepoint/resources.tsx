'use client'

import { EmptyState, ResourceCard } from '@/components'
import React from 'react'

import { Grid, GridItem, VStack } from '@chakra-ui/react'
import { CarePoint } from '@/gql/graphql'

export default function CarePointLinkedResources({
  carePoint,
}: {
  key: string
  carePoint: CarePoint
}) {
  return (
    <VStack bg={'bg'} p={4} borderRadius={'2xl'} boxShadow={'xs'}>
      {carePoint.resources.length === 0 && (
        <EmptyState
          title="No linked resources"
          description="This care point is not linked to any resources"
        />
      )}
      <Grid
        templateColumns="repeat(auto-fill, minmax(350px, 1fr))"
        gap={6}
        width="100%"
      >
        {carePoint.resources.map((resource) => (
          <GridItem key={resource.id}>
            <ResourceCard resource={resource} />
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
