import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import { Box, Container, Grid, GridItem, VStack } from '@chakra-ui/react'
import React from 'react'
import UserInfo from '@/components/ui/user-info'
import UserProfile from '@/components/ui/user-profile'
import GenericTabs from '@/components/ui/generic-tabs'
import ProfileBackground from '@/components/ui/profile-background'
import ActionButtons from '@/components/ui/action-buttons'
import ConnectionsCard from '@/components/ui/connections-card'
import ConnectionsInfo from '@/components/ui/connections-info'

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

  const triggers = ['About', 'Connections']

  const desktopTriggers = ['Recents', 'Connections']

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
          props={{ justifyContent: { lg: 'flex-start' }, marginTop: '40px' }}
        />
      </Box>
    </Container>
  )
}
