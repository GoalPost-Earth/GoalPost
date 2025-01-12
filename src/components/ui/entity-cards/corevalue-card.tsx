import { Card, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { CoreValue } from '@/gql/graphql'
import { AutoLink } from '../autolink'

export const CoreValueCard = ({
  coreValue,
}: {
  coreValue: Pick<CoreValue, 'id' | 'name' | 'description'>
}) => {
  return (
    <Card.Root
      borderRadius="lg"
      boxShadow="md"
      bgColor="corevalue.subtle"
      p={4}
      gap={4}
      width="100%"
      height="100%"
    >
      <Link href={`/corevalue/${coreValue.id}`} style={{ width: '100%' }}>
        <Card.Title mb="2">
          <Text as="span" fontSize="sm" fontWeight="light">
            core value
          </Text>
          <Text fontWeight="bold">{coreValue.name}</Text>
        </Card.Title>
        {!!coreValue.description && (
          <Card.Body lineClamp={{ base: 2, lg: 3 }}>
            <AutoLink text={coreValue.description} />
          </Card.Body>
        )}
      </Link>
    </Card.Root>
  )
}
