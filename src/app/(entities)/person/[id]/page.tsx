import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import { Box, Container, VStack } from '@chakra-ui/react'
import React from 'react'
import ApolloWrapper from '@/components/ApolloWrapper'
import { LoadingScreen } from '@/components/screens'
import UserInfo from '@/components/ui/user-info'
import UserProfile from '@/components/ui/user-profile'
import GenericTabs from '@/components/ui/generic-tabs'

const BKG_IMG_URL =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGhvbWUlMjBidWlsZGluZyUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800'

export default async function ViewPersonPage({
  params,
}: {
  readonly params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, loading, error } = await query({
    query: GET_PERSON,
    variables: { id },
  })

  const person = data?.people[0]

  if (!person) {
    return <LoadingScreen />
  }

  const bioData = [
    {
      key: 'First Name',
      value: person.firstName,
    },
    {
      key: 'Last Name',
      value: person.lastName,
    },
    {
      key: 'Phone Number',
      value: person.phone ?? '',
    },
    {
      key: 'Pronouns',
      value: person.pronouns ?? '',
    },

    {
      key: 'Location',
      value: person.location ?? '',
    },
  ]

  const triggers = ['About', 'People']

  const desktopTriggers = ['Recents', 'People']

  const content = [<UserInfo data={bioData} key="bio" />]

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container
        p={8}
        pt={{ md: 0 }}
        position="relative"
        display={{ base: 'flex', lg: 'block' }}
        flexDirection={'column'}
        alignItems={{ base: 'center' }}
        width={'100%'}
        isolation={'isolate'}
      >
        <VStack display={{ base: 'none', lg: 'flex' }} mx={-8}>
          <Box
            width={'100%'}
            height={'200px'}
            backgroundImage={`url(${BKG_IMG_URL})`}
            backgroundSize={'cover'}
            backgroundRepeat={'no-repeat'}
          ></Box>
        </VStack>
        <UserProfile
          user={{
            name: person.name,
            email: person.email ?? '',
            photo: person.photo ?? '',
          }}
          tabTriggers={triggers}
          tabContent={content}
        />
        <Box
          float={'right'}
          width={'calc(100% - 500px)'}
          display={{ base: 'none', lg: 'block' }}
        >
          <GenericTabs
            triggers={desktopTriggers}
            content={[]}
            props={{ justifyContent: { lg: 'flex-start' }, marginTop: '40px' }}
          />
        </Box>
      </Container>
    </ApolloWrapper>
  )
}
