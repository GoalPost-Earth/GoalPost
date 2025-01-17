'use client'

import { Button, CarePointCard, EmptyState } from '@/components'
import { Goal } from '@/gql/graphql'
import { Grid, GridItem, HStack, Link, Spacer, VStack } from '@chakra-ui/react'
import React from 'react'

export default function GoalEnablesCarePoints({ goal }: { goal: Goal }) {
  return (
    <VStack
      key="carePoints"
      p={4}
      gap={4}
      bg={'gray.contrast'}
      borderRadius={'2xl'}
      boxShadow={'xs'}
      alignItems={'flex-start'}
      width="100%"
    >
      {goal.enablesCarePoints.length > 0 && (
        <HStack width="100%" justifyContent="space-between">
          <Spacer />
          <Link href={`/carepoint/create?goalId=${goal.id}`}>
            <Button size="sm" variant="surface">
              Add A Care Point
            </Button>
          </Link>
        </HStack>
      )}
      {goal.enablesCarePoints.length === 0 && (
        <EmptyState title="No Care Points" description="Click here to add ">
          <Link href={`/carepoint/create?goalId=${goal.id}`}>
            <Button variant="surface">Add A Care Point</Button>
          </Link>
        </EmptyState>
      )}

      <Grid
        key="resources"
        templateColumns={{
          base: '1fr',
          lg: 'repeat(auto-fill, minmax(250px, 1fr))',
          xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
        }}
        gap={6}
        width="100%"
      >
        {goal.enablesCarePoints.map((carePoint) => (
          <GridItem key={carePoint.id}>
            <CarePointCard carePoint={carePoint} />
          </GridItem>
        ))}
      </Grid>
    </VStack>
  )
}
