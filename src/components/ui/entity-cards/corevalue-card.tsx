import { Card } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { CoreValue } from '@/gql/graphql'

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
        <Card.Title mb="2" lineClamp={1} fontSize="xl" fontWeight="bolder">
          {coreValue.name}
        </Card.Title>
        {!!coreValue.description && (
          <Card.Body p={{ base: 0, lg: 5 }}>{coreValue.description}</Card.Body>
        )}
      </Link>
    </Card.Root>
  )
}
