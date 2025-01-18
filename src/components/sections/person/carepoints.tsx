'use client'

import { Button, CarePointCard, EmptyState } from '@/components/ui'
import { CarePoint, Person } from '@/gql/graphql'
import { Grid, GridItem, Link, VStack } from '@chakra-ui/react'
import React from 'react'

export default function PersonCarePoints({ person }: { person: Person }) {
  return (
    <VStack
      key="Goals"
      p={4}
      gap={4}
      bg={'gray.contrast'}
      borderRadius={'2xl'}
      boxShadow={'xs'}
      alignItems={'flex-start'}
    >
      {person.carePoints.length === 0 && (
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
        templateColumns={{
          base: '1fr',
          lg: 'repeat(auto-fill, minmax(250px, 1fr))',
          xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
        }}
        gap={6}
        width="100%"
      >
        {person.carePoints.map((carePoint) => (
          <GridItem key={carePoint.id}>
            <CarePointCard carePoint={carePoint as CarePoint} />
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
