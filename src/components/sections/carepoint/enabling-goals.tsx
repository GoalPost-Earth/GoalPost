'use client'

import { GoalCard } from '@/components'
import React from 'react'

import { Grid, GridItem } from '@chakra-ui/react'
import { CarePoint } from '@/gql/graphql'

export default function CarePointEnablingGoals({
  carePoint,
}: {
  key: string
  carePoint: CarePoint
}) {
  return (
    <>
      <Grid templateColumns="repeat(auto-fill, minmax(360px, 1fr))" gap={6}>
        {carePoint.enabledByGoals.map((goal) => (
          <GridItem key={goal.id}>
            <GoalCard goal={goal} />
          </GridItem>
        ))}
      </Grid>
    </>
  )
}
