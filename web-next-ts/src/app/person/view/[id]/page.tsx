import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/queries/PERSON_QUERIES'
import ProfileDetailCard from '@/components/ProfileDetailCard'
import { Avatar } from '@/components/ui'
import { Container, defineStyle, Text, VStack } from '@chakra-ui/react'
import React from 'react'

export default async function ViewPersonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data } = await query({
    query: GET_PERSON,
    variables: { id },
  })

  const person = data?.people[0]

  const ringCss = defineStyle({
    outlineWidth: '2px',
    outlineColor: 'brand.500',
    outlineOffset: '2px',
    outlineStyle: 'solid',
  })

  return (
    <Container>
      <VStack>
        <Avatar
          name={person.fullName}
          src="https://bit.ly/dan-abramov"
          size="2xl"
          css={ringCss}
        />
        <Text>{person.fullName}</Text>

        <ProfileDetailCard title="First Name" detail={person.firstName} />
        <ProfileDetailCard title="Last Name" detail={person.lastName} />
        <ProfileDetailCard title="Email" detail={person.email} />
        <ProfileDetailCard title="Phone" detail={person.phone} />
        <ProfileDetailCard title="Location" detail={person.location} />
        <ProfileDetailCard title="Interests" detail={person.interests} />
        <ProfileDetailCard title="Pronouns" detail={person.pronouns} />
        <ProfileDetailCard title="Manual" detail={person.manual} link />
      </VStack>
    </Container>
  )
}
