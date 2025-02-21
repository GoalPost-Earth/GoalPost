import { HStack } from '@chakra-ui/react'
import React from 'react'
import { Avatar } from '../ui'
import Link from 'next/link'
import { Person } from '@/gql/graphql'

const AvatarCarousel = ({ people = [] }: { people: Person[] }) => {
  return (
    <HStack gap="4" wrap="wrap" alignItems="center" justifyContent="center">
      {people.map((person) => (
        <Link key={person.id} href={`/person/${person.id}`}>
          <Avatar
            name={person.name}
            src={person?.photo ?? undefined}
            size="xl"
          />
        </Link>
      ))}
    </HStack>
  )
}

export default AvatarCarousel
