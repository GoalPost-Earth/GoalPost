import Link from 'next/link'
import { Avatar } from '@/components/ui'
import { Card, CardBodyProps, Flex, Text } from '@chakra-ui/react'

export function PersonCard({
  id,
  name,
  photo,
  info,
  ...rest
}: {
  id: string
  name: string
  photo?: string | null
  info?: string | null
} & CardBodyProps) {
  return (
    <Card.Root
      key={id}
      // maxWidth="380px"
      width="100%"
      height="100%"
      borderRadius="md"
      bg="person.subtle"
    >
      <Link href={`/person/${id}`} style={{ height: '100%' }}>
        <Card.Body
          py={4}
          px={2}
          flexDirection="row"
          alignItems="center"
          gap={4}
          height="100%"
          boxShadow="sm"
          {...rest}
        >
          <Avatar src={photo ?? undefined} />
          <Flex flexDirection="column">
            <Text>{name}</Text>
            {info && (
              <Text fontWeight={300} fontSize="sm" textOverflow="ellipsis">
                {info}
              </Text>
            )}
          </Flex>
        </Card.Body>
      </Link>
    </Card.Root>
  )
}
