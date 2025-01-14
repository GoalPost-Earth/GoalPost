import { Badge, Card, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import EllipseIcon from '../../icons/EllipseIcon'
import { Avatar } from '../avatar'
import { Resource } from '@/gql/graphql'
import { AutoLink } from '../autolink'

export const ResourceCard = ({ resource }: { resource: Resource }) => {
  const { id, name, description, status } = resource
  const owner = resource.providedByPerson?.length
    ? resource.providedByPerson[0]
    : undefined

  return (
    <Card.Root
      flexDirection={{ base: 'column', lg: 'row' }}
      overflow="hidden"
      borderRadius="lg"
      boxShadow="md"
      bgColor="resource.subtle"
      p={{ base: 4, lg: 0 }}
      gap={{ base: 4, lg: 0 }}
      width="100%"
      height="100%"
    >
      <Link href={`/resource/${id}`} style={{ width: '100%' }}>
        <Card.Body p={{ base: 0, lg: 5 }}>
          <Card.Title mb="2" lineClamp={1} fontSize="xl" fontWeight="bolder">
            {name}
          </Card.Title>
          <HStack justifyContent="space-between" width="100%">
            <HStack gap={2}>
              <Avatar
                src={owner?.photo ?? undefined}
                width="10px"
                height="10px"
              />
              <Text fontSize="xs">{owner?.name}</Text>
            </HStack>
            <Badge
              variant="subtle"
              p={2}
              bg="none"
              fontSize="xs"
              fontWeight="bold"
              ml="auto"
            >
              <EllipseIcon width="12px" height="12px" />
              {status}
            </Badge>
          </HStack>
          <Card.Description lineClamp={2}>
            <AutoLink text={description as string} />
          </Card.Description>
        </Card.Body>
      </Link>
    </Card.Root>
  )
}
