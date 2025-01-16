import { Badge, Box, Card, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import EllipseIcon from '../../icons/EllipseIcon'
import { CarePoint } from '@/gql/graphql'
import { AutoLink } from '../autolink'

export function CarePointCard({
  carePoint,
  ...rest
}: {
  carePoint: Pick<CarePoint, 'id' | 'name' | 'description' | 'status'>
}) {
  return (
    <Link
      href={`/carepoint/${carePoint.id}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <Card.Root width="100%" height="100%" bgColor="carepoint.subtle">
        <Card.Header>
          <HStack>
            <Text lineClamp={1} fontWeight="bold">
              {carePoint.name}
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
        </Card.Header>
        <Card.Body width="100%" height="100%">
          {!!carePoint.description && (
            <Box padding={0} lineClamp={{ base: 2, lg: 3 }}>
              <AutoLink text={carePoint.description} />
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    </Link>
  )
}
