'use client'

import { Button, CarePointCard, EmptyState } from '@/components/ui'
import { CarePoint, Resource } from '@/gql/graphql'
import { Grid, GridItem, Link, VStack } from '@chakra-ui/react'
import React from 'react'

export default function ResourceCarePoints({
  resource,
}: {
  resource: Resource
}) {
  return (
    <VStack
      key="CarePoint"
      p={4}
      gap={4}
      bg={'gray.contrast'}
      borderRadius={'2xl'}
      boxShadow={'xs'}
      alignItems={'flex-start'}
    >
      {resource.carePoints.length === 0 && (
        <EmptyState
          title="No Care Points"
          description="Click here to add a care point by choosing a goal"
        >
          <Link href={`/goal`}>
            <Button variant="surface">Add A Care Point</Button>
          </Link>
        </EmptyState>
      )}

      <Grid
        key="goals"
        templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
        gap={6}
        width="100%"
      >
        {resource.carePoints.map((carePoint) => (
          <GridItem key={carePoint.id}>
            <CarePointCard carePoint={carePoint as CarePoint} />
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
