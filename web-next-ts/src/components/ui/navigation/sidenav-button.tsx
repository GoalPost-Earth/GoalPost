'use client'

import {
  Box,
  Button,
  Flex,
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
import { Avatar } from '../avatar'
import { useUser } from '@auth0/nextjs-auth0/client'
import { AppLogo } from '../app-logo'
import { LogoutIcon } from '@/icons'
import { menuItems } from './menuItems'

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
        >
          <GiHamburgerMenu />
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
          <Box bg="gray.subtle">
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
                    <Flex gap="30px" alignItems="center" width="100%" px={6}>
                      {item.icon}
                      <Text fontSize="1rem">{item.name}</Text>
                    </Flex>
                  </Button>
                </Link>
              )
            })}
          </Box>
          <Button
            marginTop={50}
            paddingY={8}
            as="a"
            variant="ghost"
            href="/api/auth/logout?returnTo=/"
            width="100%"
          >
            <Flex gap="30px" alignItems="center" width="100%" px={6}>
              <Box rounded="full" bg="red" padding={2}>
                <LogoutIcon />
              </Box>
              <Text color="red.500" fontSize="1rem">
                Logout
              </Text>
            </Flex>
          </Button>
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
