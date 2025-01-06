import { query } from '@/app/lib/apollo-client'
import MemberGuideDetailCard from '@/components/MemberGuideDetailCard'
import { Container, Heading, VStack } from '@chakra-ui/react'
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

        <MemberGuideDetailCard title="Name" detail={corevalue.name} />
        <MemberGuideDetailCard
          title="Description"
          detail={corevalue.description}
        />
        <MemberGuideDetailCard
          title="Who Supports"
          detail={corevalue.whoSupports}
        />
        <MemberGuideDetailCard
          title="Alignment Challenges"
          detail={corevalue.alignmentChallenges}
        />
        <MemberGuideDetailCard
          title="Alignment Examples"
          detail={corevalue.alignmentExamples}
        />
        <MemberGuideDetailCard title="Why" detail={corevalue.why} />

        <MemberGuideDetailCard
          title="Embraced By"
          detail={corevalue.isEmbracedBy
            .map((person) => person?.name)
            .join(', ')}
        />
      </VStack>
    </Container>
  )
}
