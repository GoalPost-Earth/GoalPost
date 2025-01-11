import Link from 'next/link'
import { Avatar } from '@/components/ui'
import {
  Card,
  CardBodyProps,
  CardHeaderProps,
  Flex,
  Text,
} from '@chakra-ui/react'
import { Person } from '@/gql/graphql'

export function PersonCard({
  id,
  name,
  photo,
  info,
  person,
  ...rest
}: {
  id: string
  name: string
  photo?: string | null
  info?: string | null
  person?: Pick<Person, 'id' | 'name' | 'photo'>
} & CardHeaderProps) {
  return (
    <Card.Root
      key={id}
      // maxWidth="380px"
      width="100%"
      height="100%"
      borderRadius="md"
      bg="person.subtle"
      {...rest}
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
