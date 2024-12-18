import { query } from '@/app/lib/apollo-client'
import ProfileDetailCard from '@/components/ProfileDetailCard'
import { Container, Heading, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { GET_COREVALUE } from '@/app/graphql/queries'

export default async function CoreValuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data } = await query({
    query: GET_COREVALUE,
    variables: { id },
  })

  const corevalue = data?.coreValues[0]

  return (
    <Container>
      <Heading>Core Value Details</Heading>
      <VStack>
        {/* <Avatar src="https://bit.ly/dan-abramov" size="2xl" /> */}

        <ProfileDetailCard title="Name" detail={corevalue.name} />
        <ProfileDetailCard title="Description" detail={corevalue.description} />
        <ProfileDetailCard title="Cares For" detail={corevalue.caresFor} />
        <ProfileDetailCard
          title="Who Supports"
          detail={corevalue.whoSupports}
        />
        <ProfileDetailCard
          title="Alignment Challenges"
          detail={corevalue.alignmentChallenges}
        />
        <ProfileDetailCard
          title="Alignment Examples"
          detail={corevalue.alignmentExamples}
        />
        <ProfileDetailCard title="Why" detail={corevalue.why} />

        <ProfileDetailCard
          title="Guides"
          detail={corevalue.guides.map((guide) => guide.name).join(', ')}
        />
      </VStack>
    </Container>
  )
}
