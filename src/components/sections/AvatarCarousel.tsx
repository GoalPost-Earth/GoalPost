import { HStack } from '@chakra-ui/react'
import React from 'react'
import { Avatar } from '../ui'
import { Member } from '@/gql/graphql'
import Link from 'next/link'

const AvatarCarousel = ({ members = [] }: { members: Member[] }) => {
  return (
    <HStack gap="4">
      {members.map((member) => (
        <Link key={member.id} href={`/person/${member.id}`}>
          <Avatar
            name={member.name}
            src={member?.photo ?? undefined}
            size="xl"
          />
        </Link>
      ))}
    </HStack>
  )
}

export default AvatarCarousel
