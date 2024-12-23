import { HStack } from '@chakra-ui/react'
import React from 'react'
import { Avatar } from '../ui'
import { Member } from '@/gql/graphql'

const AvatarCarousel = ({ members = [] }: { members: Member[] }) => {
  return (
    <HStack gap="4">
      {members.map((member) => (
        <Avatar
          key={member.id}
          name={member.name}
          src={member.photo ?? ''}
          size="xl"
        />
      ))}
    </HStack>
  )
}

export default AvatarCarousel
