import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import { Box, Container, HStack, Text } from '@chakra-ui/react'
import React from 'react'
import {
  GenericTabs,
  ProfileBackground,
  UserInfo,
  PersonProfile,
  PersonAbout,
  PersonConnections,
  PersonCommunities,
  PersonResources,
  PersonGoals,
  PersonCoreValues,
  PersonCarePoints,
} from '@/components'
import { Person } from '@/gql/graphql'
import { EntityEnum, TRIGGERS } from '@/constants'

export default async function ViewPersonPage({
  params,
}: {
  readonly params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await query({
    query: GET_PERSON,
    variables: { id },
  })

  const person = data?.people[0]

  if (error) {
    throw error
  }

  if (data.people.length === 0) {
    throw new Error('Person not found')
  }

  const isMember = person?.communitiesConnection.edges.length > 0

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
      value: person.phone,
    },
    {
      key: 'Pronouns',
      value: person.pronouns,
    },

    {
      key: 'Location',
      value: person.location,
    },
  ]

  const personTriggers = Object.keys(TRIGGERS.PERSON).map(
    (key) => TRIGGERS.PERSON[key as keyof typeof TRIGGERS.PERSON]
  )
  const memberTriggers = Object.keys(TRIGGERS.MEMBER).map(
    (key) => TRIGGERS.MEMBER[key as keyof typeof TRIGGERS.MEMBER]
  )
  const triggers = isMember
    ? [...personTriggers, ...memberTriggers]
    : personTriggers

  return (
    <Container
      position="relative"
      display={{ base: 'flex', lg: 'block' }}
      flexDirection={'column'}
      alignItems={{ base: 'center' }}
      width={'100%'}
      isolation={'isolate'}
    >
      <>
        <ProfileBackground />{' '}
        <PersonProfile
          user={person as Person}
          tabTriggers={triggers}
          tabContent={[
            <>
              <UserInfo data={bioData} key="bio" />
              <Box mt={5} display={{ base: 'block', lg: 'none' }}>
                <Text fontSize="sm" fontWeight="bold" my={5}>
                  Membership Data
                </Text>
                <PersonAbout key="about" person={person as Person} />
              </Box>
            </>,

            <PersonConnections key="connections" person={person as Person} />,
            <PersonCommunities key="communities" person={person as Person} />,
            <PersonResources key="resources" person={person as Person} />,
            <PersonGoals key="goals" person={person as Person} />,
            <PersonCarePoints key="carepoints" person={person as Person} />,
            <PersonCoreValues key="corevalues" person={person as Person} />,
          ]}
        />{' '}
        <HStack
          float={'right'}
          width={{ lg: 'calc(100% - 450px)', xl: 'calc(100% - 500px)' }}
          display={{ base: 'none', lg: 'flex' }}
          alignItems="flex-start"
          gap={0}
        >
          <>
            <GenericTabs
              entityId={id}
              entityType={EntityEnum.Person}
              entityName={person.name}
              triggers={triggers}
              content={[
                <PersonAbout key="about" person={person as Person} />,
                <PersonConnections
                  key="connections"
                  person={person as Person}
                />,
                <PersonCommunities
                  key="communities"
                  person={person as Person}
                />,
                <PersonResources key="resources" person={person as Person} />,
                <PersonGoals key="goals" person={person as Person} />,
                <PersonCarePoints key="carepoints" person={person as Person} />,
                <PersonCoreValues key="corevalues" person={person as Person} />,
              ]}
              props={{
                justifyContent: 'flex-start',
                marginTop: '40px',
                width: { lg: '80%', xl: '100%' },
              }}
            />
          </>
        </HStack>
      </>
    </Container>
  )
}
