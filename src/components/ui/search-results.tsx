'use client'
import { Box, Dialog, Flex, Text, VStack } from '@chakra-ui/react'
import SearchBar from './searchbar'
import { ChangeEvent, useState } from 'react'
import { SearchIcon } from '../icons'
import { CommunityCard } from './community-card'
import { ConnectionsCard } from './connections-card'
import GoalCard from './goal-card'
import { useGetSearchResults } from '@/hooks'
import { Community } from '@/gql/graphql'

export default function SearchResults(props: any) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    returnedCarePoints,
    returnedCommunities,
    returnedCoreValues,
    returnedPeople,
    returnedResources,
    returnedGoals,
  } = useGetSearchResults({ searchTerm })

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
        height={{ base: '100%', lg: '80dvh' }}
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
                  <Flex key={coreValue.id}>{coreValue.name}</Flex>
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
                  <Flex key={resource.id}>{resource.name}</Flex>
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
                  <Flex key={carePoint.id}>{carePoint.description}</Flex>
                ))}
              </VStack>
            )}
            {!!returnedPeople && (
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
                  <ConnectionsCard
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
                  <GoalCard
                    id={goal.id}
                    photo={goal.photo ?? null}
                    name={goal.name}
                    status={goal.status}
                    createdAt={goal.createdAt}
                    description={goal.description}
                  />
                ))}
              </VStack>
            )}
            {!searchTerm && (
              <Text textAlign="center" width="100%">
                Type something to search
              </Text>
            )}
          </VStack>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  )
}
