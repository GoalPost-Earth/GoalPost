'use client'
import { Box, Dialog, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import SearchBar from './searchbar'
import { ChangeEvent, useState } from 'react'
import { SearchIcon } from '../icons'
import { CarePoint, Community, CoreValue, Resource } from '@/gql/graphql'
import { EmptyState } from './empty-state'
import {
  CarePointCard,
  CommunityCard,
  CoreValueCard,
  GoalCard,
  PersonCard,
  ResourceCard,
} from './entity-cards'
import { useSearch } from '@/hooks'

export default function SearchResults() {
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    returnedCarePoints,
    returnedCommunities,
    returnedCoreValues,
    returnedPeople,
    returnedResources,
    returnedGoals,
    loading,
  } = useSearch({ searchTerm })

  function handleSearchTermChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value.toLowerCase())
  }

  function handleSearchedEntityClick() {
    const timer = setTimeout(() => setShowSearch(false), 200)

    return () => {
      clearTimeout(timer)
    }
  }

  return (
    <Dialog.Root
      open={showSearch}
      closeOnEscape
      onOpenChange={(event) => {
        setShowSearch(event.open)
      }}
      trapFocus={false}
    >
      <Dialog.Trigger
        ml="auto"
        mx={{ lg: 'auto' }}
        maxWidth={600}
        width={{ base: 'fit-content', lg: '100%' }}
        position="relative"
      >
        <Box>
          <SearchBar
            width={'100%'}
            endElement={<SearchIcon />}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSearchTermChange(event)
            }
            onClick={() => setShowSearch(true)}
          />
        </Box>
      </Dialog.Trigger>
      <Dialog.Content
        position="absolute"
        border="none"
        boxShadow="none"
        bg={{ base: 'contrastWhite', lg: 'transparent' }}
        height="min-content"
        maxHeight={{ base: '100%', lg: '80dvh' }}
        inset={0}
        p={2}
      >
        <Dialog.Body
          p={2}
          gap={5}
          overflow={{ lg: 'auto' }}
          height={{ lg: 'min-content' }}
          boxShadow="none"
          borderRadius="none"
          width="100%"
          bgColor="transparent"
        >
          <VStack
            alignItems="flex-start"
            gap={6}
            bg={'contrastWhite'}
            justifyContent="stretch"
            padding={5}
            borderRadius="lg"
            width="100%"
            maxWidth="600px"
            boxShadow="md"
          >
            {!!returnedCoreValues && returnedCoreValues.length > 0 && (
              <VStack
                width="100%"
                onClick={handleSearchedEntityClick}
                gap={2}
                alignItems="flex-start"
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Core Values
                </Text>
                {returnedCoreValues.map((coreValue) => (
                  <CoreValueCard
                    key={coreValue.id}
                    coreValue={coreValue as CoreValue}
                  />
                ))}
              </VStack>
            )}
            {!!returnedCommunities && returnedCommunities.length > 0 && (
              <VStack
                width="100%"
                onClick={handleSearchedEntityClick}
                gap={2}
                alignItems="flex-start"
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Communities
                </Text>
                {returnedCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community as Community}
                  />
                ))}
              </VStack>
            )}
            {!!returnedResources && returnedResources.length > 0 && (
              <VStack
                width="100%"
                onClick={handleSearchedEntityClick}
                gap={2}
                alignItems="flex-start"
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Resources
                </Text>
                {returnedResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource as Resource}
                  />
                ))}
              </VStack>
            )}
            {!!returnedCarePoints && returnedCarePoints.length > 0 && (
              <VStack
                width="100%"
                onClick={handleSearchedEntityClick}
                gap={2}
                alignItems="flex-start"
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Care Points
                </Text>
                {returnedCarePoints.map((carePoint) => (
                  <CarePointCard
                    key={carePoint.id}
                    carePoint={carePoint as CarePoint}
                  />
                ))}
              </VStack>
            )}
            {!!returnedPeople && returnedPeople.length > 0 && (
              <VStack
                width="100%"
                onClick={handleSearchedEntityClick}
                gap={2}
                alignItems="flex-start"
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  People
                </Text>
                {returnedPeople.map((person) => (
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
              <VStack
                width="100%"
                onClick={handleSearchedEntityClick}
                gap={2}
                alignItems="flex-start"
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Goals
                </Text>
                {returnedGoals.map((goal) => (
                  <GoalCard width="100%" goal={goal} />
                ))}
              </VStack>
            )}
            {loading && (
              <Flex width="100%" justifyContent="center">
                <Spinner />
                <Text as="span" ml={5}>
                  Fetching Results
                </Text>
              </Flex>
            )}
            {!searchTerm && (
              <EmptyState
                padding={0}
                title="No Results"
                description="Type something to search"
              />
            )}
          </VStack>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  )
}
