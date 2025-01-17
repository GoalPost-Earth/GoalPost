'use client'

import { CarePointCard } from '@/components'
import DefaultTabContent from '@/components/ui/default-tab-content'
import { Goal } from '@/gql/graphql'
import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'

export default function GoalCaredForByCarePoints({ goal }: { goal: Goal }) {
  return goal.caredForByCarePoints.length > 0 ? (
    <Grid templateColumns="repeat(auto-fill, minmax(360px, 1fr))" gap={6}>
      {goal.caredForByCarePoints.map((carePoint) => (
        <GridItem key={carePoint.id}>
          <CarePointCard carePoint={carePoint} />
        </GridItem>
      ))}
    </Grid>
  ) : (
    <DefaultTabContent />
  )
}
