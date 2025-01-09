import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import { Container, Grid, GridItem, HStack, VStack } from '@chakra-ui/react'
import React from 'react'
import {
  CommunityCard,
  PersonCard,
  ConnectionsInfo,
  GenericTabs,
  ProfileBackground,
  UserInfo,
  UserProfile,
  ResourceCard,
  GoalCard,
  CoreValueCard,
} from '@/components'
import { Community, Person, Resource } from '@/gql/graphql'

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

  const isMember = person?.communities.length > 0

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

  const memberTriggers = ['Communities', 'Resources', 'Goals', 'Core Values']

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
            photo={person.photo ?? undefined}
            name={person.name}
            id={person.id}
          />
        ))}
      </VStack>
    ) : null,
    <VStack gap={4} key="communities">
      {person.communities.map((community) => (
        <CommunityCard key={community.id} community={community as Community} />
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
            <PersonCard
              id={person.id}
              photo={person.photo ?? null}
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
          <CommunityCard community={community as Community} />
        </GridItem>
      ))}
    </Grid>,
    <Grid
      key="resources"
      templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
      gap={6}
    >
      {person.providesResources.map((resource) => (
        <GridItem key={resource.id}>
          <ResourceCard
            resource={{ ...resource, providedByPerson: [person] } as Resource}
          />
        </GridItem>
      ))}
    </Grid>,
    <Grid
      key="goals"
      templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
      gap={6}
    >
      {person.goals.map((goal) => (
        <GridItem key={goal.id}>
          <GoalCard
            id={goal.id}
            photo={goal.photo ?? null}
            name={goal.name}
            createdAt={goal.createdAt}
            description={goal.description}
          />
        </GridItem>
      ))}
    </Grid>,
    <Grid
      key="coreValues"
      templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
      gap={6}
    >
      {person.coreValues.map((coreValue) => (
        <GridItem key={coreValue.id}>
          <CoreValueCard coreValue={coreValue} />
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
        user={person as Person}
        tabTriggers={triggers}
        tabContent={content}
      />
      <HStack
        float={'right'}
        width={{ lg: 'calc(100% - 450px)', xl: 'calc(100% - 500px)' }}
        display={{ base: 'none', lg: 'flex' }}
        alignItems="flex-start"
        gap={0}
      >
        <GenericTabs
          editLink={`/person/update/${id}`}
          onDeleteEntity="Person"
          triggers={desktopTriggers}
          content={desktopContent}
          props={{
            justifyContent: 'flex-start',
            marginTop: '40px',
            width: { lg: '80%', xl: '100%' },
          }}
        />
      </HStack>
    </Container>
  )
}
