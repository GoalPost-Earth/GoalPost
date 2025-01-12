import { ResourceCard } from '@/components/ui'
import { Person, Resource } from '@/gql/graphql'
import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'

export default function PersonResources({ person }: { person: Person }) {
  return (
    <Grid
      key="resources"
      templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
      gap={6}
    >
      {person.providesResources.map((resource) => (
        <GridItem key={resource.id}>
          <ResourceCard
            resource={{ ...resource, providedByPerson: [person] } as Resource}
          />
        </GridItem>
      ))}
    </Grid>
  )
}
