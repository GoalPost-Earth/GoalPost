import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import { Box, Container, Grid, GridItem, VStack } from '@chakra-ui/react'
import React from 'react'
import {
  ActionButtons,
  CommunityCard,
  ConnectionsCard,
  ConnectionsInfo,
  GenericTabs,
  ProfileBackground,
  UserInfo,
  UserProfile,
} from '@/components/ui'
import Link from 'next/link'

export default async function ViewPersonPage({
  params,
}: {
  readonly params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data } = await query({
    query: GET_PERSON,
    variables: { id },
  })

  const person = data?.people[0]

  const isMember = person.communities.length > 0

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
      value: person.phone ?? 'n/a',
    },
    {
      key: 'Pronouns',
      value: person.pronouns ?? 'n/a',
    },

    {
      key: 'Location',
      value: person.location ?? 'n/a',
    },
  ]

  const memberTriggers = ['Communities', 'Goals', 'People', 'Core Values']

  const triggers = isMember
    ? ['About', 'Connections', ...memberTriggers]
    : ['About', 'Connections']

  const desktopTriggers = isMember
    ? ['Recents', 'Connections', ...memberTriggers]
    : ['Recents', 'Connections']

  const content = [
    <UserInfo data={bioData} key="bio" />,
    person.connectedTo.length > 0 ? (
      <VStack
        key="connections"
        padding={4}
        borderRadius="md"
        border="1px"
        borderColor="gray.200"
        gap={2}
        bg="gray.contrast"
      >
        {person.connectedTo.map((person) => (
          <ConnectionsInfo
            key={person.id}
            photo={person.photo ?? ''}
            name={person.name}
            id={person.id}
          />
        ))}
      </VStack>
    ) : null,
    <VStack gap={4} key="communities">
      {person.communities.map((community) => (
        <Link key={community.id} href={`/community/${community.id}`}>
          <CommunityCard
            name={community.name}
            description={community.description}
            members={community.members}
          />
        </Link>
      ))}
    </VStack>,
  ]

  const desktopContent = [
    null,
    person.connectedTo.length > 0 ? (
      <Grid
        key="connections"
        templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
        gap={6}
      >
        {person.connectedTo.map((person) => (
          <GridItem key={person.id}>
            <ConnectionsCard
              id={person.id}
              photo={person.photo ?? ''}
              name={person.name}
            />
          </GridItem>
        ))}
      </Grid>
    ) : null,
    <Grid
      key="communities"
      templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
      gap={6}
    >
      {person.communities.map((community) => (
        <GridItem key={community.id}>
          <Link href={`/community/${community.id}`}>
            <CommunityCard
              name={community.name}
              description={community.description}
              members={community.members}
            />
          </Link>
        </GridItem>
      ))}
    </Grid>,
  ]

  return (
    <Container
      position="relative"
      display={{ base: 'flex', lg: 'block' }}
      flexDirection={'column'}
      alignItems={{ base: 'center' }}
      width={'100%'}
      isolation={'isolate'}
    >
      <ProfileBackground />
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
        <Box
          position={'absolute'}
          top={{ lg: '260px' }}
          right={{ lg: 'clamp(0.25rem, 6.8vw - 4.1rem, 4.375rem)' }}
          display={{ base: 'none', lg: 'block' }}
        >
          <ActionButtons />
        </Box>
        <GenericTabs
          triggers={desktopTriggers}
          content={desktopContent}
          props={{
            justifyContent: 'flex-start',
            marginTop: '40px',
            width: { lg: '80%', xl: '100%' },
          }}
        />
      </Box>
    </Container>
  )
}
