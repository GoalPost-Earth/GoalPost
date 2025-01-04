'use client'

import { GET_ALL_GOALS } from '@/app/graphql'
import ApolloWrapper from '@/components/ApolloWrapper'
import GoalCard from '@/components/ui/goal-card'
import { useQuery } from '@apollo/client'
import { Container, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'

export default function AllGoals() {
  const { data, loading, error } = useQuery(GET_ALL_GOALS, {
    variables: {
      where: {
        motivatesPeople_NONE: null,
      },
    },
  })

  const goals = data?.goals ?? []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading>All Goals</Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {goals.map((goal) => (
            <GridItem key={goal.id}>
              <GoalCard
                id={goal.id}
                photo={goal.photo}
                name={goal.name}
                createdAt={goal.createdAt}
                description={goal.description}
              />
            </GridItem>
          ))}
        </Grid>
      </Container>
    </ApolloWrapper>
  )
}
