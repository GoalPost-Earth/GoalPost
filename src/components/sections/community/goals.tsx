'use client'

import { Button, EmptyState, GoalCard } from '@/components/ui'
import { Community } from '@/gql/graphql'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export default function CommunityGoals({
  community,
}: {
  community: Community
}) {
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
      {community.goals?.length > 0 ? (
        <HStack width="100%" justifyContent="space-between">
          <Spacer />
          <Link href={`/goal/create?communityId=${community.id}`}>
            <Button size="sm" variant="surface">
              Add A Goal
            </Button>
          </Link>
        </HStack>
      ) : (
        <EmptyState title="No Goals" description="Click here to add some">
          <Link href={`/goal/create?communityId=${community.id}`}>
            <Button variant="surface">Add A Goal</Button>
          </Link>
        </EmptyState>
      )}

      <Grid
        key="goals"
        templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
        gap={6}
        width="100%"
      >
        {community.goals?.map((goal) => (
          <GridItem key={goal.id}>
            <GoalCard goal={goal} />
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
