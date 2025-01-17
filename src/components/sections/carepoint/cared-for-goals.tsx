'use client'

import { EmptyState, GoalCard } from '@/components'
import React from 'react'

import { Grid, GridItem, VStack } from '@chakra-ui/react'
import { CarePoint } from '@/gql/graphql'

export default function CarePointGoalsCaredFor({
  carePoint,
}: {
  key: string
  carePoint: CarePoint
}) {
  return (
    <VStack bg={'bg'} p={4} borderRadius={'2xl'} boxShadow={'xs'}>
      {carePoint.caresForGoals.length === 0 && (
        <EmptyState
          title="No goals cared for"
          description="This care point is not caring for any goals."
        />
      )}
      <Grid
        templateColumns="repeat(auto-fill, minmax(350px, 1fr))"
        gap={6}
        width="100%"
      >
        {carePoint.caresForGoals.map((goal) => (
          <GridItem key={goal.id}>
            <GoalCard goal={goal} />
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
