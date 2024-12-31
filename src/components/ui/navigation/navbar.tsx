'use client'

import { Box, HStack } from '@chakra-ui/react'
import NavHamburgerButton from './sidenav-button'
import SearchBar from '../searchbar'
import ExtendedSidenav from './extended-sidenav'

export default function Simple() {
  return (
    <HStack py={'0.5rem'} alignItems={'center'} position={'relative'}>
      <ExtendedSidenav />
      <NavHamburgerButton />
      <Box
        mx={'auto'}
        maxWidth={400}
        width={'100%'}
        display={{ base: 'none', md: 'block' }}
      >
        <SearchBar width={'100%'} />
      </Box>
    </HStack>
  )
}
