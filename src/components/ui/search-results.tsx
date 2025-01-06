import { Box, Flex, Heading, Portal, VStack } from '@chakra-ui/react'
import { LuArrowLeft } from 'react-icons/lu'
import SearchBar from './searchbar'
import { GenericTabs } from './generic-tabs'
import { ChangeEvent } from 'react'
import { SearchIcon } from '../icons'
import { IoIosClose } from 'react-icons/io'

export default function SearchResults({
  content,
  triggers,
  activeTabValue,
  setActiveTabValue,
  searchTerm,
  setSearchTerm,
  handleSearchTermChange,
  setShowSearch,
}: {
  content: React.ReactNode[]
  triggers: string[]
  activeTabValue: string
  setActiveTabValue: (tab: string) => void
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  handleSearchTermChange: (event: ChangeEvent<HTMLInputElement>) => void
  setShowSearch: (showSearch: boolean) => void
}) {
  return (
    <Portal>
      <VStack
        position="fixed"
        top={{ base: 0, lg: '10%' }}
        left={{ base: 0, lg: '30%' }}
        right={{ base: 0, lg: '10%' }}
        bottom={{ base: 0, lg: '30%' }}
        height={{ base: '100%', lg: 'auto' }}
        boxShadow={{ base: 'none', lg: 'md' }}
        borderRadius={{ base: 'none', lg: '2xl' }}
        width={{ base: '100%', lg: '50%' }}
        zIndex={100}
        bgColor="contrastWhite"
        gap={5}
        p={4}
        overflow={{ lg: 'auto' }}
      >
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
        <Box></Box>
        <VStack
          display={{ base: 'none', lg: 'flex' }}
          p={4}
          justify="center"
          alignContent="center"
          gap={5}
        >
          {content[0] && (
            <VStack gap={2} width="100%">
              <Heading size="lg">Care Points</Heading>
              {content[0]}
            </VStack>
          )}
          {content[1] && (
            <VStack gap={2} width="100%">
              <Heading size="lg">Communities</Heading>
              {content[1]}
            </VStack>
          )}
          {content[2] && (
            <VStack gap={2} width="100%">
              <Heading size="lg">Core Values</Heading>
              {content[2]}
            </VStack>
          )}
          {content[3] && (
            <VStack gap={2} width="100%">
              <Heading size="lg">People</Heading>
              {content[3]}
            </VStack>
          )}
          {content[4] && (
            <VStack gap={2} width="100%">
              <Heading size="lg">Goals</Heading>
              {content[4]}
            </VStack>
          )}
        </VStack>
      </VStack>
    </Portal>
  )
}
