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
import { GiHamburgerMenu } from 'react-icons/gi'
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

const menuItems = [
  {
    name: 'Home',
    to: () => '/',
  },
  {
    name: 'Log Out',
    to: () => '/api/auth/logout?returnTo=/',
  },
]

const NavHamburgerButton = () => {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const { church } = useApp()

  return (
    <>
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
              {church?.name.toUpperCase()} {church?.level.toUpperCase()}
            </Heading>
          </DrawerHeader>
          <DrawerBody>
            {menuItems.map((item) => {
              return (
                <Link href={item.to()} key={item.name}>
                  <Button
                    key={item.name}
                    paddingY={7}
                    marginY={1}
                    colorPalette="gray"
                    variant="subtle"
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
    </>
  )
}

export default NavHamburgerButton
