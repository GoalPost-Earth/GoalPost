import { GoalCard } from '@/components/ui'
import { Person } from '@/gql/graphql'
import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'

export default function PersonGoals({ person }: { person: Person }) {
  return (
    <Grid
      key="goals"
      templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
      gap={6}
    >
      {person.goals.map((goal) => (
        <GridItem key={goal.id}>
          <GoalCard goal={goal} />
        </GridItem>
      ))}
    </Grid>
  )
}
