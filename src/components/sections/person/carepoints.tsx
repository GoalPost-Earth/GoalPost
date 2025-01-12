import { CarePointCard } from '@/components/ui'
import { Person } from '@/gql/graphql'
import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'

export default function PersonCarePoints({ person }: { person: Person }) {
  return (
    <Grid
      key="coreValues"
      templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
      gap={6}
    >
      {person.carePoints.map((carepoint) => (
        <GridItem key={carepoint.id}>
          <CarePointCard carePoint={carepoint} />
        </GridItem>
      ))}
    </Grid>
  )
}
