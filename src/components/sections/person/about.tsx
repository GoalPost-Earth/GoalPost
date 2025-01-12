import { EntityDetail } from '@/components'
import { Person } from '@/gql/graphql'
import { VStack } from '@chakra-ui/react'
import React from 'react'

export default function PersonAbout({ person }: { person: Person }) {
  return (
    <VStack
      key="Details"
      p={4}
      gap={4}
      bg={'gray.contrast'}
      borderRadius={'2xl'}
      boxShadow={'xs'}
      alignItems={'flex-start'}
      width={{ lg: '70%' }}
    >
      <EntityDetail
        title="Status"
        entityName={person.name + `'s Status`}
        details={person.status}
      />
      <EntityDetail
        title="Care Manual"
        entityName={person.name + `'s Care Manual`}
        details={person.careManual}
      />
      <EntityDetail
        title="Favourites"
        entityName={person.name + `'s Favourites`}
        details={person.favorites}
      />
      <EntityDetail
        title="Passions"
        entityName={person.name + `'s Passions`}
        details={person.passions}
      />
      <EntityDetail
        title="Traits"
        entityName={person.name + `'s Traits`}
        details={person.traits}
      />
      <EntityDetail
        title="Fields of Care"
        entityName={person.name + `'s Fields of Care`}
        details={person.fieldsOfCare}
      />
      <EntityDetail
        title="Interests"
        entityName={person.name + `'s Interests`}
        details={person.interests}
      />
    </VStack>
  )
}
