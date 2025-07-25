'use client'

import React from 'react'
import {
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Community, Goal, Person, Resource } from '@/gql/graphql'
import { useApp } from './contexts/AppContext'
import { GET_ALL_COMMUNITIES, GET_RECENT_ACTIONS } from './graphql'
import { useQuery } from '@apollo/client'
import {
  ApolloWrapper,
  AvatarCarousel,
  ActionCard,
  Avatar,
  CommunityCard,
  LoadingScreen,
  GoalCard,
  CarePointsIcon,
  GoalsIcon,
  PeopleIcon,
  SettingsIcon,
  ResourceCard,
  PersonCard,
  CoreValuesIcon,
  CarePointCard,
  CoreValueCard,
} from '@/components'

const HomeClient = () => {
  const { user } = useApp()
  const connections = user?.connections

  const { data, loading, error } = useQuery(GET_RECENT_ACTIONS, {
    pollInterval: 60000,
  })
  const { data: communityData } = useQuery(GET_ALL_COMMUNITIES, {
    pollInterval: 60000,
  })

  const communities = communityData?.communities

  if (!(data && communities)) {
    return <LoadingScreen />
  }

  const recentLogs = (data?.logs ?? [])
    .filter((log) => log && log.id)
    .map((log) => {
      return {
        actionName: log.__typename,
        id: log.id,
        actionInfo: 'logged an action',
        icon: <SettingsIcon width="18px" height="18px" />,
        createdAt: log.createdAt,
        personId: log.createdBy[0]?.id,
        personName: log.createdBy[0]?.name,
        personPhoto: log.createdBy[0]?.photo,
        children: (
          <Text>
            {log.description.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Text>
        ),
      }
    })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const recentCarePoints = data?.carePoints.map((carePoint) => {
    return {
      actionName: carePoint.__typename,
      id: carePoint.id,
      actionInfo: 'added a new care point',
      icon: <CarePointsIcon width="18px" height="18px" />,
      createdAt: carePoint.createdAt,
      personId: carePoint.createdBy[0].id,
      personName: carePoint.createdBy[0].name,
      personPhoto: carePoint.createdBy[0].photo,
      children: <CarePointCard carePoint={carePoint} />,
    }
  })

  const recentGoals = data?.goals.map((goal) => {
    return {
      actionName: goal.__typename,
      actionInfo: 'posted a new goal',
      icon: <GoalsIcon width="18px" height="18px" />,
      id: goal.id,
      createdAt: goal.createdAt,
      personId: goal.createdBy[0].id,
      personName: goal.createdBy[0].name,
      personPhoto: goal.createdBy[0].photo,
      description: goal.description,
      name: goal.name,
      photo: goal.photo,
      status: goal.status,
      children: <GoalCard goal={goal as Goal} />,
    }
  })
  const recentCoreValues = data?.coreValues.map((coreValue) => {
    return {
      actionName: coreValue.__typename,
      actionInfo: 'embraced a new core value',
      icon: <CoreValuesIcon width="18px" height="18px" />,
      id: coreValue.id,
      createdAt: coreValue.createdAt,
      createdBy: coreValue.people,
      description: coreValue.description,
      personId: coreValue.people[0]?.id,
      personName: coreValue.people[0]?.name,
      personPhoto: coreValue.people[0]?.photo,
      children: <CoreValueCard coreValue={coreValue} />,
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const recentResources = data?.resources.map((resource) => {
    const owner = resource.providedByPerson.length
      ? resource.providedByPerson[0]
      : resource.providedByCommunity[0]

    return {
      actionName: resource.__typename,
      actionInfo: 'added a new resource',
      icon: <SettingsIcon width="18px" height="18px" />,
      personName: owner.name,
      personPhoto: 'photo' in owner ? (owner.photo ?? '') : '',
      personId: owner.id,
      id: resource.id,
      createdAt: resource.createdAt,
      createdBy: resource.createdBy,
      description: resource.description,
      name: resource.name,
      children: <ResourceCard resource={resource as Resource} />,
    }
  })

  const recentCommunityMembers = data?.communities.flatMap((community) => {
    return community.members.flatMap((member) => {
      return {
        actionName: community.__typename,
        id: community.id,
        personId: member.id,
        icon: <PeopleIcon width="18px" height="18px" />,
        createdAt: member.createdAt,
        personName: member.name,
        personPhoto: member.photo,
        name: community.name,
        actionInfo: `joined a community`,
        children: (
          <PersonCard
            id={member.id}
            name={member.name}
            photo={member.photo}
            info={community.name}
            fontWeight="normal"
          />
        ),
      }
    })
  })

  const recentActions = [
    ...recentGoals,
    ...recentCoreValues,
    ...recentCommunityMembers,
    ...recentResources,
    ...recentCarePoints,
    ...recentLogs,
  ]

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container p={{ base: 0 }}>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', lg: '0.6fr 1.5fr 1fr' }}
          gap={20}
          mt={5}
          position="relative"
          justifyItems={{ md: 'center' }}
          width="100%"
        >
          <GridItem
            display="flex"
            flexDirection="column"
            gap={5}
            alignItems={{ base: 'flex-start', lg: 'center' }}
            mt={{ base: 2, lg: 5 }}
          >
            <Flex gap={{ base: 2, lg: 5 }} flexDirection={{ lg: 'column' }}>
              <Avatar
                src={user?.photo ?? undefined}
                width={{ base: '50px', lg: '200px' }}
                height={{ base: '50px', lg: '200px' }}
              />
              <Flex
                direction="column"
                textAlign={{ base: 'left', lg: 'center' }}
              >
                <Text>Hi</Text>
                <Heading>{user?.name}</Heading>
              </Flex>
            </Flex>
            {!!connections?.length && (
              <VStack gap={2} alignItems={{ base: 'flex-start', lg: 'center' }}>
                <Heading
                  fontSize={{ lg: 'md' }}
                  fontWeight={{ base: 'bolder', lg: 'light' }}
                >
                  Your Connections
                </Heading>
                <AvatarCarousel people={connections as Person[]} />
              </VStack>
            )}
          </GridItem>
          <GridItem>
            <Heading mb={2} fontWeight="bolder">
              {"What's new for me?"}
            </Heading>
            <VStack>
              {recentActions
                .sort((a, b) => {
                  return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                  )
                })
                .map((action) => (
                  <ActionCard
                    key={
                      action.id + '' + action.actionName + '' + action.personId
                    }
                    photo={action.personPhoto ?? undefined}
                    actionInfo={action.actionInfo}
                    personId={action?.personId}
                    id={action.id}
                    name={action?.personName}
                    actionName={action.actionName}
                    createdAt={action.createdAt}
                    icon={action.icon}
                    content={action.children}
                  />
                ))}
            </VStack>
          </GridItem>
          <GridItem>
            <Heading mb={2} fontWeight="bolder">
              Our Communities
            </Heading>
            <VStack gap={2} maxWidth="520px">
              {communities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community as Community}
                  fontWeight={400}
                />
              ))}
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </ApolloWrapper>
  )
}

export default HomeClient
