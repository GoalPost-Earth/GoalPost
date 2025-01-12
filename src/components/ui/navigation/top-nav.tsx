'use client'

import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import NavHamburgerButton from './sidenav-button'
import ExtendedSidenav from './extended-sidenav'
import { Avatar } from '../avatar'
import { AppLogo } from '../app-logo'
import { useApp } from '@/app/contexts/AppContext'
import { GoalPostIcon, SearchIcon } from '@/components/icons'
import { usePathname, useRouter } from 'next/navigation'
import SearchResults from '../search-results'
import Link from 'next/link'
import { BrandedGoalPostText } from '../branded-goalpost-text'

export default function TopNav() {
  const { user } = useApp()
  const router = useRouter()
  const pathname = usePathname()

  if (pathname === '/search') {
    return <></>
  }

  return (
    <HStack
      as="nav"
      py={'0.5rem'}
      alignItems={'center'}
      position={'sticky'}
      width="100%"
      top={0}
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
        <BrandedGoalPostText
          display={{ base: 'none', lg: 'block' }}
          fontSize="xl"
        />
      </Flex>
      <Box display={{ base: 'none', lg: 'block' }} mx="auto" width="500px">
        <SearchResults />
      </Box>
      <Box p={2} pt={0} display={{ base: 'block', lg: 'none' }} ml="auto">
        <Link href={'/search'}>
          <SearchIcon />
        </Link>
      </Box>
      <Flex
        justifyContent={'center'}
        alignItems={'center'}
        gap={2}
        mr={2}
        ml={{ base: 'auto', lg: '0px' }}
        display={{ base: 'none', lg: 'flex' }}
        width={{ base: '100%', lg: 'fit-content' }}
      >
        <Text width="fit-content">{user?.name}</Text>
        <Avatar src={user?.photo ?? undefined} />
      </Flex>
    </HStack>
  )
}
