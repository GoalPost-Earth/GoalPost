'use client'

import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import NavHamburgerButton from './sidenav-button'
import SearchBar from '../searchbar'
import ExtendedSidenav from './extended-sidenav'
import { Avatar } from '../avatar'
import { AppLogo } from '../app-logo'
import { useApp } from '@/app/contexts/AppContext'
import { GoalPostIcon } from '@/components/icons'
import { useRouter } from 'next/navigation'

export default function TopNav() {
  const { user } = useApp()
  const router = useRouter()

  return (
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
      >
        <SearchBar width={'100%'} />
      </Box>
      <Flex
        justifyContent={'center'}
        alignItems={'center'}
        gap={2}
        mr={2}
        ml={{ base: 'auto', lg: '0px' }}
      >
        <Text display={{ base: 'none', lg: 'block' }}>{user?.name} </Text>
        <Avatar src={user?.photo ?? undefined} />
      </Flex>
    </HStack>
  )
}
