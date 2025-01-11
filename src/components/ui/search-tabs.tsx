'use client'
import React, { useState, useEffect } from 'react'
import {
  Flex,
  Spinner,
  Tabs,
  TabsContent,
  Text,
  VStack,
} from '@chakra-ui/react'
import DefaultTabContent from './default-tab-content'
import {
  CarePointCard,
  CommunityCard,
  CoreValueCard,
  GoalCard,
  PersonCard,
  ResourceCard,
} from './entity-cards'
import {
  CarePoint,
  Community,
  CoreValue,
  Goal,
  Person,
  Resource,
} from '@/gql/graphql'

interface SearchTabsProps {
  content: any[]
  loading: boolean
}

const TRIGGERS = [
  'All',
  'Care Points',
  'Communities',
  'Core Values',
  'People',
  'Resources',
  'Goals',
]
export const SearchTabs = ({ content, loading }: SearchTabsProps) => {
  const [activeTab, setActiveTab] = useState(TRIGGERS[0])
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const [
    returnedCarePoints,
    returnedCommunities,
    returnedCoreValues,
    returnedPeople,
    returnedResources,
    returnedGoals,
  ] = content

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      if (window.innerWidth <= 1024 && activeTab !== TRIGGERS[0]) {
        setActiveTab(TRIGGERS[0])
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab, TRIGGERS])

  return (
    <Tabs.Root
      variant="subtle"
      value={activeTab}
      onValueChange={(details) => {
        const newValue = details.value
        setActiveTab(newValue)
      }}
      colorPalette="brand"
      width="100%"
      mt={2}
    >
      <Tabs.List
        mt={2}
        display="flex"
        gap={2}
        justifyContent={{ md: 'center' }}
        overflowX="auto"
        whiteSpace="nowrap"
        scrollbarWidth="none"
        WebkitOverflowScrolling="touch"
      >
        {TRIGGERS.map((trigger, index) => (
          <Tabs.Trigger
            key={`${trigger}-${index}`}
            value={trigger}
            fontSize="xs"
            fontWeight="bold"
            justifyContent="center"
            borderRadius="full"
            minWidth="fit-content"
            bg={activeTab !== trigger ? 'gray.100' : 'brand.200'}
          >
            {trigger}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <TabsContent
        value={TRIGGERS[0]}
        mb={3}
        display="flex"
        flexDirection="column"
        gap={5}
      >
        {!!returnedCoreValues && returnedCoreValues.length > 0 && (
          <VStack width="100%" gap={2} alignItems="flex-start">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Core Values
            </Text>
            {returnedCoreValues.map((coreValue: CoreValue) => (
              <CoreValueCard key={coreValue.id} coreValue={coreValue} />
            ))}
          </VStack>
        )}
        {!!returnedCommunities && returnedCommunities.length > 0 && (
          <VStack width="100%" gap={2} alignItems="flex-start">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Communities
            </Text>
            {returnedCommunities.map((community: Community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </VStack>
        )}
        {!!returnedResources && returnedResources.length > 0 && (
          <VStack width="100%" gap={2} alignItems="flex-start">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Resources
            </Text>
            {returnedResources.map((resource: Resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </VStack>
        )}
        {!!returnedCarePoints && returnedCarePoints.length > 0 && (
          <VStack width="100%" gap={2} alignItems="flex-start">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Care Points
            </Text>
            {returnedCarePoints.map((carePoint: CarePoint) => (
              <CarePointCard key={carePoint.id} carePoint={carePoint} />
            ))}
          </VStack>
        )}
        {!!returnedPeople && returnedPeople.length > 0 && (
          <VStack width="100%" gap={2} alignItems="flex-start">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              People
            </Text>
            {returnedPeople.map((person: Person) => (
              <PersonCard
                key={person.id}
                id={person.id}
                name={person.name}
                photo={person.photo}
              />
            ))}
          </VStack>
        )}
        {!!returnedGoals && returnedGoals.length > 0 && (
          <VStack width="100%" gap={2} alignItems="flex-start">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Goals
            </Text>
            {returnedGoals.map((goal: Goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </VStack>
        )}
        {content.length < 1 && <DefaultTabContent />}
      </TabsContent>
      <TabsContent
        value={TRIGGERS[1]}
        mb={3}
        display="flex"
        flexDirection="column"
        gap={5}
      >
        {!!returnedCarePoints && returnedCarePoints.length > 0 ? (
          returnedCarePoints.map((entity: any) => (
            <CarePointCard key={entity.id} carePoint={entity} />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent
        value={TRIGGERS[2]}
        mb={3}
        display="flex"
        flexDirection="column"
        gap={5}
      >
        {!!returnedCommunities && returnedCommunities.length > 0 ? (
          returnedCommunities.map((entity: any) => (
            <CommunityCard key={entity.id} community={entity} />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent
        value={TRIGGERS[3]}
        mb={3}
        display="flex"
        flexDirection="column"
        gap={5}
      >
        {!!returnedCoreValues && returnedCoreValues.length > 0 ? (
          returnedCoreValues.map((entity: any) => (
            <CoreValueCard key={entity.id} coreValue={entity} />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent
        value={TRIGGERS[4]}
        mb={3}
        display="flex"
        flexDirection="column"
        gap={5}
      >
        {!!returnedPeople && returnedPeople.length > 0 ? (
          returnedPeople.map((entity: any) => (
            <PersonCard
              key={entity.id}
              id={entity.id}
              name={entity.name}
              photo={entity.photo}
            />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent
        value={TRIGGERS[5]}
        mb={3}
        display="flex"
        flexDirection="column"
        gap={5}
      >
        {!!returnedResources && returnedResources.length > 0 ? (
          returnedResources.map((entity: any) => (
            <ResourceCard key={entity.id} resource={entity} />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent width="100%" value={TRIGGERS[6]}>
        {!!returnedGoals && returnedGoals.length > 0 ? (
          returnedGoals.map((entity: any) => (
            <GoalCard key={entity.id} goal={entity} />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
    </Tabs.Root>
  )
}
