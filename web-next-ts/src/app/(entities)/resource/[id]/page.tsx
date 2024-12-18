import { query } from '@/app/lib/apollo-client'
import { GET_RESOURCE } from '@/app/graphql/queries'
import ProfileDetailCard from '@/components/ProfileDetailCard'
import { Container, Image, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import ApolloWrapper from '@/components/ApolloWrapper'
import { LoadingScreen } from '@/components/screens'

export default async function ViewResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, loading, error } = await query({
    query: GET_RESOURCE,
    variables: { id },
  })

  const resource = data?.resources[0]

  if (!resource) {
    return <LoadingScreen />
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <VStack>
          <ProfileDetailCard title="Name" detail={resource.name} />
          <ProfileDetailCard
            title="Description"
            detail={resource.description}
          />

          <ProfileDetailCard title="Status" detail={resource.status} />
          <ProfileDetailCard title="Why" detail={resource.why} />
          <ProfileDetailCard title="Location" detail={resource.location} />
          <ProfileDetailCard title="Time" detail={resource.time} />
          <ProfileDetailCard
            title="Provided By"
            detail={resource.providedByPerson[0].name}
          />
        </VStack>
      </Container>
    </ApolloWrapper>
  )
}
