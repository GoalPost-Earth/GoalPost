'use client'
import { SearchTabs } from '@/components'
import SearchBar from '@/components/ui/searchbar'
import { useGetSearchResults } from '@/hooks'
import { Box, Flex, Portal, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'
import { IoIosClose } from 'react-icons/io'
import { LuArrowLeft } from 'react-icons/lu'

export default function MobileSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const {
    returnedCarePoints,
    returnedCommunities,
    returnedCoreValues,
    returnedPeople,
    returnedResources,
  } = useGetSearchResults({ searchTerm })

  function handleSearchTermChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value.toLowerCase())
  }

  return (
    <Portal>
      <Box zIndex={1000}>
        <VStack p={4}>
          <Flex width="100%" alignItems="center" gap={3}>
            <LuArrowLeft size={30} onClick={() => router.back()} />
            <Box mx="auto" width="100%">
              <SearchBar
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleSearchTermChange(event)
                }
                width="100%"
                value={searchTerm}
              />
            </Box>
            <IoIosClose size={30} onClick={() => setSearchTerm('')} />
          </Flex>
          <SearchTabs
            content={[
              [
                ...returnedCarePoints,
                ...returnedCommunities,
                ...returnedCoreValues,
                ...returnedPeople,
                ...returnedResources,
              ],
              returnedCarePoints,
              returnedCommunities,
              returnedCoreValues,
              returnedPeople,
              returnedResources,
            ]}
          />
        </VStack>
      </Box>
    </Portal>
  )
}
