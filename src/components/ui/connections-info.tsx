import { Flex, Text } from '@chakra-ui/react'
import { Avatar } from './avatar'
import Link from 'next/link'

export function ConnectionsInfo({
  photo,
  name,
  id,
}: {
  photo: string
  name: string
  id: string
}) {
  return (
    <Flex _notLast={{ borderBottom: '1.5px solid #e2e8f0' }} width="100%">
      <Link href={`/person/${id}`}>
        <Flex gap={6} align="center" py={2}>
          <Avatar src={photo} />
          <Text>{name}</Text>
        </Flex>
      </Link>
    </Flex>
  )
}
