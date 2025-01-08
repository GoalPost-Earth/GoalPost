'use client'
import {
  Box,
  Card,
  Dialog,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { LuArrowLeft } from 'react-icons/lu'
import SearchBar from './searchbar'
import { GenericTabs } from './generic-tabs'
import { ChangeEvent, useEffect, useState } from 'react'
import { SearchIcon } from '../icons'
import { IoIosClose } from 'react-icons/io'
import { useQuery } from '@apollo/client'
import { GET_MATCHING_ENTITIES } from '@/app/graphql/queries/SEARCH_QUERY'
import { CommunityCard } from './community-card'
import { ConnectionsCard } from './connections-card'
import GoalCard from './goal-card'
import { useDebounce } from '@/hooks'
import { EmptyState } from './empty-state'

export default function SearchResults() {
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [size, setSize] = useState('md')
  const [activeTabValue, setActiveTabValue] = useState('')

  const debouncedTerm = useDebounce(searchTerm, 300)

  const { data, loading } = useQuery(GET_MATCHING_ENTITIES, {
    variables: { key: debouncedTerm },
    skip: !debouncedTerm,
  })
  const returnedEntities = data

  const triggers = [
    'Care Points',
    'Communities',
    'Core Values',
    'People',
    'Resources',
    'Goals',
  ]

  const returnedCarePoints = returnedEntities?.carePointSubstringSearch
  const returnedCommunities = returnedEntities?.communitySubstringSearch
  const returnedCoreValues = returnedEntities?.coreValueSubstringSearch
  const returnedPeople = returnedEntities?.peopleSubstringSearch
  const returnedResources = returnedEntities?.resourceSubstringSearch
  const returnedGoals = returnedEntities?.goalSubstringSearch

  const content = [
    returnedCarePoints?.map((entity: any) => (
      <Flex key={entity.id}>{entity.description}</Flex>
    )),
    returnedCommunities?.map((entity: any) => (
      <CommunityCard key={entity.id} community={entity} />
    )),
    returnedCoreValues?.map((entity: any) => (
      <Flex key={entity.id}>{entity.name}</Flex>
    )),
    returnedPeople?.map((entity: any) => (
      <ConnectionsCard
        key={entity.id}
        id={entity.id}
        name={entity.name}
        photo={entity.photo}
      />
    )),
    returnedResources?.map((entity: any) => (
      <Flex key={entity.id}>{entity.name}</Flex>
    )),
    returnedGoals?.map((entity: any) => (
      <GoalCard
        key={entity.id}
        id={entity.id}
        description={entity.description}
        name={entity.name}
        status={entity.status}
        photo={entity.photo}
        createdAt={entity.createdAt}
      />
    )),
  ].filter((item) => item !== undefined && item.length > 0)

  function handleSearchTermChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value.toLowerCase())
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSize('full')
      } else {
        setSize('md')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSize])

  return (
    <Dialog.Root
      open={showSearch}
      closeOnEscape
      onOpenChange={(event) => {
        setShowSearch(event.open)
      }}
      size={size === 'md' ? 'md' : 'full'}
      trapFocus={false}
    >
      <Dialog.Trigger
        ml="auto"
        mx={{ lg: 'auto' }}
        maxWidth={600}
        width={{ base: 'fit-content', lg: '100%' }}
        position="relative"
      >
        <Box display={{ base: 'none', lg: 'block' }}>
          <SearchBar
            width={'100%'}
            endElement={<SearchIcon />}
            onChange={handleSearchTermChange}
            onClick={() => setShowSearch(true)}
          />
        </Box>

        <Box ml="auto" display={{ lg: 'none' }} p={2}>
          <SearchIcon onClick={() => setShowSearch(true)} />
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
          <VStack>
            <Flex
              width="100%"
              alignItems="center"
              gap={2}
              display={{ base: 'flex', lg: 'none' }}
            >
              <LuArrowLeft size={30} onClick={() => setShowSearch(false)} />
              <SearchBar
                onChange={handleSearchTermChange}
                value={searchTerm}
                width={'100%'}
                startElement={<SearchIcon pr={2} />}
                endElement={
                  <IoIosClose size={30} onClick={() => setSearchTerm('')} />
                }
              />
            </Flex>
            <GenericTabs
              content={content}
              triggers={triggers}
              onTabChange={setActiveTabValue}
              selectedTab={activeTabValue}
              tabsDisplay={{ base: 'block', lg: 'none' }}
            />
            <VStack
              display={{ base: 'none', lg: 'flex' }}
              p={4}
              justify="center"
              alignContent="start"
              gap={5}
              width="100%"
            >
              {content.length !== 0 ? (
                content?.map((item, index) => {
                  return (
                    Array.isArray(content[index]) &&
                    content[index].length > 0 && (
                      <VStack
                        gap={2}
                        width="100%"
                        bg="gray.contrast"
                        p={4}
                        boxShadow={'sm'}
                        alignItems="start"
                      >
                        <Heading size="lg" textAlign="start">
                          {triggers[index]}
                        </Heading>
                        <VStack
                          onClick={() => setShowSearch(false)}
                          width="100%"
                          gap={2}
                          alignItems="stretch"
                        >
                          {item}
                        </VStack>
                      </VStack>
                    )
                  )
                })
              ) : loading ? (
                <Card.Root maxWidth="380px" width="100%" borderRadius="md">
                  <Card.Body>
                    <Box>
                      <Spinner />{' '}
                      <Text as="span" ml={5}>
                        Fetching Results
                      </Text>
                    </Box>
                  </Card.Body>
                </Card.Root>
              ) : (
                <Card.Root maxWidth="380px" width="100%" borderRadius="md">
                  <Card.Body>
                    <EmptyState
                      padding={0}
                      title="No Results"
                      description="Try searching for anything"
                    />
                  </Card.Body>
                </Card.Root>
              )}
            </VStack>
          </VStack>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Root>
  )
}
