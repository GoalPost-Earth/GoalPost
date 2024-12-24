import { Goal } from '@/gql/graphql'
import { Badge } from '@chakra-ui/react'
import React from 'react'

const GoalTypeBadge = ({ goal }: { goal: Goal }) => {
  return <Badge colorPalette="blue">{goal.type.toUpperCase()}</Badge>
}

export default GoalTypeBadge
