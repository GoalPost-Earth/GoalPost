'use client'

import { Button, EmptyState, GoalCard } from '@/components/ui'
import { Goal, Person } from '@/gql/graphql'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export default function PersonGoals({ person }: { person: Person }) {
  return (
    <VStack
      key="Goals"
      p={4}
      gap={4}
      bg={'gray.contrast'}
      borderRadius={'2xl'}
      boxShadow={'xs'}
      alignItems={'flex-start'}
    >
      {person.goals.length > 0 && (
        <HStack width="100%" justifyContent="space-between">
          <Spacer />
          <Link href={`/goal/create?personId=${person.id}`}>
            <Button size="sm" variant="surface">
              Add A Goal
            </Button>
          </Link>
        </HStack>
      )}
      {person.goals.length === 0 && (
        <EmptyState title="No Goals" description="Click here to add some">
          <Link href={`/goal/create?personId=${person.id}`}>
            <Button variant="surface">Add A Goal</Button>
          </Link>
        </EmptyState>
      )}

      <Grid
        key="goals"
        templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
        gap={6}
        width="100%"
      >
        {person.goals.map((goal) => (
          <GridItem key={goal.id}>
            <GoalCard goal={{ ...goal, motivatesPeople: [person] } as Goal} />
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
