'use client'

import { CarePointCard } from '@/components'
import { Goal } from '@/gql/graphql'
import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'

export default function GoalEnablesCarePoints({ goal }: { goal: Goal }) {
  return (
    <Grid templateColumns="repeat(auto-fill, minmax(360px, 1fr))" gap={6}>
      {goal.enablesCarePoints.map((carePoint) => (
        <GridItem key={carePoint.id}>
          <CarePointCard carePoint={carePoint} />
        </GridItem>
      ))}
    </Grid>
  )
}
