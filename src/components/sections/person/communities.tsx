import { CommunityCard } from '@/components/ui'
import { Community, Person } from '@/gql/graphql'
import { Grid, GridItem } from '@chakra-ui/react'
import React from 'react'

export default function PersonCommunities({ person }: { person: Person }) {
  return (
    <Grid
      key="communities"
      templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
      gap={6}
    >
      {person.communities.map((community) => (
        <GridItem key={community.id}>
          <CommunityCard community={community as Community} />
        </GridItem>
      ))}
    </Grid>
  )
}
