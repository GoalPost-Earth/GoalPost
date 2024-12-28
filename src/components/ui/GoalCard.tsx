import { Goal } from '@/gql/graphql'
import { Badge, Card, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import GoalTypeBadge from './GoalTypeBadge'
import { Avatar } from './avatar'

const GoalCard = ({ goal }: { goal: Goal }) => (
  <Card.Root key={goal.id} height="100%">
    <Link key={goal.id} href={'/goal/' + goal.id}>
      <Card.Header py={2} bgColor="gray.100">
        <HStack>
          <GoalTypeBadge goal={goal} />
          <Text fontWeight="bold" textOverflow="ellipsis" truncate>
            {goal?.name}
          </Text>
        </HStack>
      </Card.Header>
      <Card.Body flex="1">
        <Card.Description>
          <Text lineClamp={4} textOverflow="ellipsis">
            {goal.description}
          </Text>
        </Card.Description>
      </Card.Body>
    </Link>
    <Link href={'/person/' + goal.motivatesPeople[0].id}>
      <Card.Footer justifyContent="flex-end">
        <HStack>
          <Avatar src={goal.motivatesPeople[0].photo ?? undefined} size="sm" />
          <Text fontSize="small" fontWeight="bold">
            {goal.motivatesPeople[0].name}
          </Text>
        </HStack>
      </Card.Footer>
    </Link>
  </Card.Root>
)

export default GoalCard
