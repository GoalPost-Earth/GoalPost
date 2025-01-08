import { Card, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { Avatar } from './avatar'

export const CoreValueCard = ({
  id,
  ownerPhoto,
  name,
  ownerName,
  description,
}: {
  id: string
  ownerPhoto: string | null | undefined
  name: string
  ownerName: string
  description: string | null | undefined
}) => {
  return (
    <Card.Root
      flexDirection={{ base: 'column', lg: 'row' }}
      overflow="hidden"
      maxW="xl"
      borderRadius="lg"
      boxShadow="md"
      bgColor="coreValue.subtle"
      p={{ base: 4, lg: 0 }}
      gap={{ base: 4, lg: 0 }}
      width="100%"
      height="100%"
    >
      <Link href={`/corevalue/${id}`} style={{ width: '100%' }}>
        <Card.Body p={{ base: 0, lg: 5 }}>
          <Card.Title mb="2" lineClamp={1} fontSize="xl" fontWeight="bolder">
            {name}
          </Card.Title>
          <HStack gap={2}>
            <Avatar src={ownerPhoto ?? undefined} width="10px" height="10px" />
            <Text fontSize="xs">{ownerName}</Text>
          </HStack>
          <Card.Description lineClamp={2}>{description}</Card.Description>
        </Card.Body>
      </Link>
    </Card.Root>
  )
}
