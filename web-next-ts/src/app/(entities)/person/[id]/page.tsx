import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import ProfileDetailCard from '@/components/ProfileDetailCard'
import { Container, Image, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import ApolloWrapper from '@/components/ApolloWrapper'
import { LoadingScreen } from '@/components/screens'

export default async function ViewPersonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, loading, error } = await query({
    query: GET_PERSON,
    variables: { id },
  })

  const person = data?.people[0]
  console.log('🚀 ~ file: page.tsx:22 ~ person:', person)

  if (!person) {
    return <LoadingScreen />
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <VStack>
          <Image
            src="https://bit.ly/dan-abramov"
            // size="2xl"
            alt="Profile Picture"
          />
          <Text>{person?.name}</Text>

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
    </ApolloWrapper>
  )
}
