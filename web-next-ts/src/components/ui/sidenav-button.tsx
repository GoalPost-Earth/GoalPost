'use client'

import {
  Button,
  Heading,
  HStack,
  IconButton,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { GiHamburgerMenu, GiHomeGarage } from 'react-icons/gi'
import Link from 'next/link'
import { ColorModeButton } from './color-mode'
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTrigger,
} from './drawer'
import { Avatar } from './avatar'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useApp } from '@/app/AppContext'
import { AppLogo } from './app-logo'
import { MenuOutline } from '../icons'

const menuItems = [
  {
    name: 'Home',
    to: () => '/',
    icon: <MenuOutline />,
  },
  {
    name: 'Input Data',
    to: () => '/forms',
    icon: <MenuOutline />,
  },
  {
    name: 'Discover',
    to: () => '/#',
    icon: <MenuOutline />,
  },
  {
    name: 'Chatbot',
    to: () => '/#',
    icon: <MenuOutline />,
  },
  {
    name: 'My Member Guide',
    to: () => '/#',
    icon: <MenuOutline />,
  },
  {
    name: 'Log Out',
    to: () => '/api/auth/logout?returnTo=/',
    icon: <GiHomeGarage />,
  },
]

const NavHamburgerButton = () => {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const { church } = useApp()

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
          >
            <GiHamburgerMenu />
          </IconButton>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <Heading>
              <HStack>
                <AppLogo height={16} width={16} />
                <Text>Goalpost</Text>
              </HStack>
            </Heading>
          </DrawerHeader>
          <DrawerBody paddingX={0}>
            {menuItems.map((item) => {
              const pathname = window.location.pathname
              return (
                <Link href={item.to()} key={item.name}>
                  <Button
                    borderRadius="none"
                    border="none"
                    key={item.name}
                    paddingY={8}
                    colorPalette="brand"
                    variant={pathname === item.to() ? 'solid' : 'outline'}
                    width="100%"
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </DrawerBody>
          <DrawerFooter>
            <HStack gap="4">
              <Avatar
                name={user?.name ?? ''}
                size="lg"
                src={user?.picture ?? undefined}
              />
              <Stack gap="0">
                {user?.name && <Text fontWeight="medium">{user?.name}</Text>}
              </Stack>
            </HStack>
            <Spacer />
            <ColorModeButton justifySelf="flex-end" />
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
  )
}

export default NavHamburgerButton
