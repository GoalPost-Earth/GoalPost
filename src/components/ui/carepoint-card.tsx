import { Badge, Card, HStack } from '@chakra-ui/react'
import Link from 'next/link'
import EllipseIcon from '../icons/EllipseIcon'

export function CarePointCard({
  id,
  description,
  status,
}: {
  id: string
  description: string
  status: string
}) {
  return (
    <Link href={`/carepoint/${id}`} style={{ width: '100%' }}>
      <Card.Root width="100%" bgColor="carepoints.subtle">
        <Card.Body width="100%">
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
          <HStack>{description}</HStack>
        </Card.Body>
      </Card.Root>
    </Link>
  )
}
