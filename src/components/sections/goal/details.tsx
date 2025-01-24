'use client'

import { EditButton, EntityDetail } from '@/components'
import { Goal } from '@/gql/graphql'
import { HStack, Spacer, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

export default function GoalDetails({ goal }: { goal: Goal }) {
  return (
    <>
      <VStack
        key="Details"
        p={4}
        bg={'gray.contrast'}
        borderRadius={'2xl'}
        boxShadow={'xs'}
        alignItems={'flex-start'}
        width={{ lg: '70%' }}
      >
        <HStack width="100%" justifyContent="space-between">
          <Spacer />
          <Link href={`/goal/update/${goal.id}`}>
            <EditButton
              colorPalette="goal"
              size="xl"
              text="Edit Goal Details"
            />
          </Link>
        </HStack>
        <VStack gap={4}>
          <EntityDetail
            title="Description"
            entityName={goal.name}
            details={goal.description}
          />
          <EntityDetail title="Location" details={goal.location} />
          <EntityDetail title="Why" details={goal.why} />
          <EntityDetail title="Time" details={goal.time} />
          <EntityDetail title="Status" details={goal.status} />
        </VStack>
      </VStack>
    </>
  )
}
