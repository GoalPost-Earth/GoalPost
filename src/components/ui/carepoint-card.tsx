import { Badge, Card, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import EllipseIcon from '../icons/EllipseIcon'
import { CarePoint } from '@/gql/graphql'

export function CarePointCard({
  carePoint,
  ...rest
}: {
  carePoint: Pick<CarePoint, 'id' | 'description' | 'status'>
}) {
  return (
    <Link
      href={`/carepoint/${carePoint.id}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <Card.Root width="100%" height="100%" bgColor="carepoint.subtle">
        <Card.Body width="100%" height="100%">
          <HStack>
            <Text fontWeight="bold" fontSize="sm">
              Care Point
            </Text>
            <Badge
              variant="subtle"
              p={2}
              bg="none"
              fontSize="xs"
              fontWeight="bold"
              ml="auto"
            >
              <EllipseIcon width="12px" height="12px" />
              {carePoint.status}
            </Badge>
          </HStack>
          <HStack lineClamp={3} mt={4} fontSize="md">
            {carePoint.description}
          </HStack>
        </Card.Body>
      </Card.Root>
    </Link>
  )
}
