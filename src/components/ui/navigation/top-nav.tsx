'use client'

import { Box, Flex, HStack, Portal, Text } from '@chakra-ui/react'
import NavHamburgerButton from './sidenav-button'
import SearchBar from '../searchbar'
import ExtendedSidenav from './extended-sidenav'
import { Avatar } from '../avatar'
import { AppLogo } from '../app-logo'
import { useApp } from '@/app/contexts/AppContext'
import { GoalPostIcon, SearchIcon } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_MATCHING_ENTITIES } from '@/app/graphql/queries/SEARCH_QUERY'
import SearchResults from '../search-results'
import { CommunityCard } from '../community-card'
import { ConnectionsCard } from '../connections-card'
import ResourceDetails from '../resource-details'
import GoalCard from '../goal-card'

export default function TopNav() {
  const { user } = useApp()
  const router = useRouter()

  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTabValue, setActiveTabValue] = useState('')
  const searchPaneRef = useRef<HTMLDivElement | null>(null)

  const { data, loading, error } = useQuery(GET_MATCHING_ENTITIES, {
    variables: { key: searchTerm },
    skip: !searchTerm,
  })
  const returnedEntities = data

  const triggers = [
    'Care Points',
    'Communities',
    'Core Values',
    'People',
    'Resources',
  ]

  const returnedCarePoints = returnedEntities?.carePointSubstringSearch
  const returnedCommunities = returnedEntities?.communitySubstringSearch
  const returnedCoreValues = returnedEntities?.coreValueSubstringSearch
  const returnedPeople = returnedEntities?.peopleSubstringSearch
  const returnedResources = returnedEntities?.resourceSubstringSearch

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
      <ResourceDetails key={entity.id} resource={entity} />
    )),
    returnedEntities?.goalSubstringSearch?.map((entity: any) => (
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
  ]

  function handleSearchTermChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value.toLowerCase())
  }

  useEffect(() => {
    if (window.innerWidth <= 1024) {
      return
    }
    function handleClickOutside(event: MouseEvent) {
      if (
        searchPaneRef.current &&
        !searchPaneRef.current.contains(event.target as Node)
      ) {
        setShowSearch(false)
      }
    }

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch])

  return (
    <>
      <HStack
        py={'0.5rem'}
        alignItems={'center'}
        position={'fixed'}
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bgColor="contrastWhite"
      >
        <ExtendedSidenav />
        <NavHamburgerButton />
        <Flex
          gap={5}
          alignItems="center"
          cursor="pointer"
          onClick={() => {
            router.push('/')
          }}
        >
          <AppLogo width={'40px'} marginLeft={{ base: '15px', lg: '70px' }} />
          <GoalPostIcon display={{ base: 'none', lg: 'block' }} />
        </Flex>
        <Box
          mx={'auto'}
          maxWidth={400}
          width={'100%'}
          display={{ base: 'none', lg: 'block' }}
          position="relative"
        >
          <SearchBar
            width={'100%'}
            endElement={<SearchIcon />}
            onChange={handleSearchTermChange}
            onClick={() => setShowSearch(true)}
          />
          {showSearch && (
            <Portal>
              <div ref={searchPaneRef}>
                <SearchResults
                  content={content}
                  triggers={triggers}
                  activeTabValue={activeTabValue}
                  setActiveTabValue={setActiveTabValue}
                  setShowSearch={setShowSearch}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleSearchTermChange={handleSearchTermChange}
                />
              </div>
            </Portal>
          )}
        </Box>
        <Box ml="auto" display={{ lg: 'none' }} p={2}>
          <SearchIcon onClick={() => setShowSearch(true)} />
        </Box>
        <Flex
          justifyContent={'center'}
          alignItems={'center'}
          gap={2}
          mr={2}
          ml={{ base: 'auto', lg: '0px' }}
          display={{ base: 'none', lg: 'flex' }}
        >
          <Text>{user?.name}</Text>
          <Avatar src={user?.photo ?? undefined} />
        </Flex>
      </HStack>
      {showSearch && (
        <Portal>
          <div ref={searchPaneRef}>
            <SearchResults
              content={content}
              triggers={triggers}
              activeTabValue={activeTabValue}
              setActiveTabValue={setActiveTabValue}
              setShowSearch={setShowSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearchTermChange={handleSearchTermChange}
            />
          </div>
        </Portal>
      )}
    </>
  )
}
