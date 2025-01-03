import Link from 'next/link'
import { Avatar } from '@/components/ui'
import { Box, Card, CardBodyProps, Text } from '@chakra-ui/react'

export default function ConnectionsCard({
  id,
  name,
  photo,
  ...rest
}: { id: string; name: string; photo?: string | null } & CardBodyProps) {
  return (
    <Card.Root key={id} maxWidth="380px" width="100%" borderRadius="md">
      <Link href={`/person/${id}`}>
        <Card.Body
          py={4}
          px={2}
          flexDirection="row"
          alignItems="center"
          gap={4}
          boxShadow="sm"
          {...rest}
        >
          <Avatar src={photo ?? undefined} />
          <Box>
            <Text>{name}</Text>
          </Box>
        </Card.Body>
      </Link>
    </Card.Root>
  )
}
