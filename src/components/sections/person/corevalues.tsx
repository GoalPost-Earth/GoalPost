import { CoreValueCard } from '@/components/ui'
import { Person } from '@/gql/graphql'
import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'

export default function PersonCoreValues({ person }: { person: Person }) {
  return (
    <Grid
      key="coreValues"
      templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
      gap={6}
    >
      {person.coreValues.map((coreValue) => (
        <GridItem key={coreValue.id}>
          <CoreValueCard coreValue={coreValue} />
        </GridItem>
      ))}
    </Grid>
  )
}
