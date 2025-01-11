import { Heading, HStack, Stack } from '@chakra-ui/react'
import { Avatar } from '@/components/ui'
import Link from 'next/link'
import { Person } from '@/gql/graphql'

export const PersonInfo = ({
  person,
}: {
  person: Pick<Person, 'id' | 'name' | 'photo'>
}) => {
  const { id, name, photo } = person
  return (
    <Link href={`/person/${id}`}>
      <HStack gap="4">
        <Avatar name={name} size="lg" src={photo ?? undefined} />
        <Stack>
          <Heading fontWeight="bold">{name}</Heading>
        </Stack>
      </HStack>
    </Link>
  )
}
