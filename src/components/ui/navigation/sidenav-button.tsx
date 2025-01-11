'use client'

import { Heading, HStack, IconButton, Spacer } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ColorModeButton } from '../color-mode'
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTrigger,
} from '../drawer'
import { useUser } from '@auth0/nextjs-auth0/client'
import { AppLogo } from '../app-logo'
import { HamburgerIcon } from '@/icons'
import { InputAccordion, NavItemLinks } from './navItems'
import { LogoutSection } from '../logout-section'

const NavHamburgerButton = () => {
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  return (
    <DrawerRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement="start"
    >
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        <IconButton
          colorPalette="gray"
          variant="subtle"
          aria-label="Side Nav Toggle"
          size="lg"
          rounded="small"
          background={'none'}
          display={{ base: 'flex', lg: 'none' }}
        >
          <HamburgerIcon />
        </IconButton>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <Heading>
            <HStack justifyContent="center">
              <AppLogo height={20} width={20} />
            </HStack>
          </Heading>
        </DrawerHeader>
        <DrawerBody paddingX={0}>
          <NavItemLinks setOpen={setOpen} extendable isExtended />
          <InputAccordion setOpen={setOpen} />
        </DrawerBody>
        <DrawerFooter>
          <LogoutSection extendable isExtended />
          <Spacer />
          <ColorModeButton justifySelf="flex-end" />
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  )
}

export default NavHamburgerButton
