import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import {
  Box,
  Card,
  CardBodyProps,
  Container,
  Grid,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import ApolloWrapper from '@/components/ApolloWrapper'
import { LoadingScreen } from '@/components/screens'
import UserInfo from '@/components/ui/user-info'
import UserProfile from '@/components/ui/user-profile'
import GenericTabs from '@/components/ui/generic-tabs'
import Link from 'next/link'
import ProfileBackground from '@/components/ui/profile-background'
import { Avatar } from '@/components/ui'
import ActionButtons from '@/components/ui/action-buttons'

function ConnectionsCard({
  id,
  name,
  photo,
  ...rest
}: { id: string; name: string; photo?: string | null } & CardBodyProps) {
  return (
    <Card.Root
      key={id}
      maxWidth="380px"
      border="none"
      width="100%"
      _notLast={{
        borderBottom: { base: '1px solid', lg: 'none' },
        borderColor: 'gray.subtle',
      }}
      borderRadius={{ base: 'none', lg: '10px' }}
    >
      <Link href={`/person/${id}`}>
        <Card.Body
          py={4}
          px={'10px'}
          flexDirection="row"
          gap={4}
          boxShadow="0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.25)"
          {...rest}
        >
          <Avatar src={photo ?? undefined} />
          <Box>
            <Text>{name}</Text>
            <Text fontSize="sm" fontWeight="light">
              Seed CoC
            </Text>
          </Box>
        </Card.Body>
      </Link>
    </Card.Root>
  )
}

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

  console.log(person)

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

  const triggers = ['About', 'Connections']

  const desktopTriggers = ['Recents', 'Connections']

  const connections = (
    <Box>
      <Box mb={4}>
        <Text fontSize="sm" fontWeight="light" my={1}>
          Created by
        </Text>
        <ConnectionsCard
          id={person.id}
          name={person.name}
          photo={person.photo}
          borderRadius={'10px'}
        />
      </Box>
      <Box>
        <Text fontSize="sm" fontWeight="light" my={1}>
          Other Connections
        </Text>
        <Grid
          templateColumns={{
            base: 'repeat(auto-fill, 1fr)',
            lg: 'repeat(auto-fill, minmax(360px, 1fr))',
          }}
          width="100%"
          gap={{ base: 0, lg: 4 }}
          bg={{ base: 'gray.contrast', lg: 'none' }}
          borderRadius={{ base: '8px', lg: 'none' }}
          px={{ base: 4, lg: 0 }}
        >
          {person.connectedTo.map((person) => (
            <ConnectionsCard
              key={person.id}
              id={person.id}
              name={person.name}
              photo={person.photo}
              borderRadius={{ base: 'none', lg: '10px' }}
              boxShadow={{
                base: 'none',
                lg: '0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 1px 3px 0px rgba(0, 0, 0, 0.25)',
              }}
              border="none"
              width={{ base: '100%', lg: 'auto' }}
              paddingX={{ base: 0, lg: '10px' }}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  )

  const content = [<UserInfo data={bioData} key="bio" />, connections]

  const desktopContent = [null, connections]

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
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
            top={{ lg: '250px' }}
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
    </ApolloWrapper>
  )
}
