'use client'

import { GET_USER_BY_ID, GET_PERSON } from '@/app/graphql/queries'
import {
  INVITE_PERSON_MUTATION,
  CANCEL_INVITE_MUTATION,
} from '@/app/graphql/mutations'
import { Box, Container, HStack, Text, Button, Flex } from '@chakra-ui/react'
import React, { use, useEffect } from 'react'
import {
  GenericTabs,
  UserInfo,
  PersonProfile,
  PersonAbout,
  PersonConnections,
  PersonCommunities,
  PersonResources,
  PersonGoals,
  PersonCoreValues,
  PersonCarePoints,
  ApolloWrapper,
  EntityPageHeader,
} from '@/components'
import { Person } from '@/gql/graphql'
import { EntityEnum, TRIGGERS } from '@/constants'
import { useQuery, useMutation } from '@apollo/client'
import { toaster } from '@/components/ui/toaster'
import { useApp } from '@/app/contexts'

export default function ViewPersonPage({
  params,
}: {
  readonly params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data, loading, error, refetch } = useQuery(GET_PERSON, {
    variables: { id },
    fetchPolicy: 'network-only',
  })

  const { data: usersData, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id },
    fetchPolicy: 'network-only',
  })

  const [invitePerson, { loading: inviteLoading }] = useMutation(
    INVITE_PERSON_MUTATION
  )
  const [cancelInvite, { loading: cancelInviteLoading }] = useMutation(
    CANCEL_INVITE_MUTATION
  )

  useEffect(() => {
    refetch()
  }, [refetch])

  const person = data?.people[0]
  const user = usersData?.people[0]

  const { user: currentUser } = useApp()

  if (error) {
    throw error
  }

  if (!person) return <></>

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

  console.log('Person ', person)

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
        <>
          <EntityPageHeader entity={EntityEnum.Person} />{' '}
          <PersonProfile
            user={person as Person}
            tabTriggers={triggers}
            tabContent={[
              <>
                {/* Invite button for non-user persons */}
                {!user && !userLoading && (
                  <Flex
                    justifyContent={'center'}
                    alignItems={'center'}
                    width={'100%'}
                    mb={5}
                    mt={{ base: 3, lg: 0 }}
                  >
                    {person.inviteSent ? (
                      <Button
                        colorScheme="red"
                        colorPalette="red"
                        size="sm"
                        borderRadius={'3xl'}
                        loading={cancelInviteLoading}
                        onClick={async () => {
                          await cancelInvite({
                            variables: {
                              personId: person.id,
                            },
                          })
                          toaster.success({
                            title: 'Invite Cancelled',
                            description:
                              'Successfully cancelled the invite for this person.',
                            meta: { closable: true },
                          })
                        }}
                      >
                        Cancel invite
                      </Button>
                    ) : (
                      <Button
                        colorPalette="green"
                        size="sm"
                        borderRadius={'3xl'}
                        loading={inviteLoading}
                        onClick={async () => {
                          try {
                            const res = await invitePerson({
                              variables: {
                                personId: person.id,
                                input: [
                                  {
                                    description: `${person.firstName} ${person.lastName} was invited to join GoalPost!`,
                                    // Optionally add more fields as needed
                                    createdBy: {
                                      connect: [
                                        {
                                          where: {
                                            node: { id_EQ: currentUser?.id },
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            })
                            console.log('🚀 ~ page.tsx:188 ~ res:', res)
                            // Log the invite action

                            toaster.success({
                              title: 'Invite Sent',
                              description:
                                'Successfully invited the person to join GoalPost!',
                              meta: { closable: true },
                            })
                          } catch (e) {
                            console.error(e)
                            toaster.error({
                              title: 'Invitation Failed',
                              description:
                                'Unable to send invite. Please try again later.',
                              meta: { closable: true },
                            })
                          }
                        }}
                      >
                        {inviteLoading ? 'Sending...' : 'Invite'}
                      </Button>
                    )}
                  </Flex>
                )}
                <UserInfo data={bioData} key="bio" />
                <Box mt={5} display={{ base: 'block', lg: 'none' }}>
                  <Text fontSize="sm" fontWeight="bold" my={5}>
                    Membership Data
                  </Text>
                  <PersonAbout key="about" person={person as Person} />
                </Box>
              </>,

              <PersonConnections key="connections" person={person as Person} />,
              <PersonResources key="resources" person={person as Person} />,
              <PersonCommunities key="communities" person={person as Person} />,
              <PersonGoals key="goals" person={person as Person} />,
              <PersonCarePoints key="carepoints" person={person as Person} />,
              <PersonCoreValues key="corevalues" person={person as Person} />,
            ]}
          />
          <HStack
            float={'right'}
            width="calc(100% - 500px)"
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
                  <PersonResources key="resources" person={person as Person} />,
                  <PersonCommunities
                    key="communities"
                    person={person as Person}
                  />,
                  <PersonGoals key="goals" person={person as Person} />,
                  <PersonCarePoints
                    key="carepoints"
                    person={person as Person}
                  />,
                  <PersonCoreValues
                    key="corevalues"
                    person={person as Person}
                  />,
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
    </ApolloWrapper>
  )
}
