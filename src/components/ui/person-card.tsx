import { Heading, HStack, Stack } from '@chakra-ui/react'
import { Avatar } from '@/components/ui'
import Link from 'next/link'

export const PersonCard = ({
  id,
  name,
  photo,
}: {
  id: string
  name: string
  photo: string
}) => {
  return (
    <Link href={`/person/${id}`}>
      <HStack gap="4">
        <Avatar name={name} size="lg" src={photo} />
        <Stack>
          <Heading fontWeight="bold">{name}</Heading>
        </Stack>
      </HStack>
    </Link>
  )
}
