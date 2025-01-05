import { query } from '@/app/lib/apollo-client'
import { GET_COMMUNITY } from '@/app/graphql/queries'
import MemberGuideDetailCard from '@/components/MemberGuideDetailCard'
import { Container, VStack } from '@chakra-ui/react'
import React from 'react'
import { ApolloWrapper } from '@/components'
import { LoadingScreen } from '@/components/screens'

export default async function ViewCommunityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, loading, error } = await query({
    query: GET_COMMUNITY,
    variables: { id },
  })

  const community = data?.communities[0]

  if (!community) {
    return <LoadingScreen />
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <VStack>
          <MemberGuideDetailCard title="Name" detail={community.name} />
          <MemberGuideDetailCard
            title="Description"
            detail={community.description}
          />

          <MemberGuideDetailCard
            title="Status"
            detail={community.status ? 'Active' : 'Inactive'}
          />
          <MemberGuideDetailCard title="Why" detail={community.why} />
          <MemberGuideDetailCard title="Location" detail={community.location} />
          <MemberGuideDetailCard title="Time" detail={community.time} />
          <MemberGuideDetailCard
            title="Created By"
            detail={community.createdBy[0].name}
          />
        </VStack>
      </Container>
    </ApolloWrapper>
  )
}
