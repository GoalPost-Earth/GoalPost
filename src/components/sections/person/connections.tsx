import { PersonCard } from '@/components'
import { EmptyState } from '@/components'
import { Person } from '@/gql/graphql'
import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'

export default function PersonConnections({ person }: { person: Person }) {
  if (person.connectedTo.length === 0) {
    return <EmptyState title="No Connections" />
  }

  return (
    <Grid
      key="connections"
      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
      gap={6}
    >
      {person.connectedTo.map((person) => (
        <GridItem key={person.id}>
          <PersonCard
            id={person.id}
            photo={person.photo ?? null}
            name={person.name}
          />
        </GridItem>
      ))}
    </Grid>
  )
}
