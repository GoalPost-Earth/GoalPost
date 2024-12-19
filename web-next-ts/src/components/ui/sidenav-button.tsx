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
import { AppLogo } from './app-logo'
import { LogoutIcon, MenuOutline } from '../icons'
import DiscoverIcon from '../icons/DiscoverIcon';
import ChatBotIcon from '../icons/ChatBotIcon';
import ProfileIcon from '../icons/ProfileIcon';
import GraphIcon from '../icons/GraphIcon';

const menuItems = [
  {
    name: 'Home Page',
    to: () => '/',
    icon: <MenuOutline />,
  },
  {
    name: 'Discover',
    to: () => '/#',
    icon: <DiscoverIcon />,
  },
  {
    name: 'AI Chat Box',
    to: () => '/#',
    icon: <ChatBotIcon />,
  },
  {
    name: 'Profile',
    to: () => '/#',
    icon: <ProfileIcon />,
  },
  {
    name: 'Graph Visualization',
    to: () => '/#',
    icon: <GraphIcon />,
  },
]

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
          <Box bg= "gray.subtle">
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
                    <Text fontSize="1rem">
                    {item.name}
                      </Text>
                      </Flex>
                  </Button>
                </Link>
              )
            })}
            </Box>
          <Box marginTop="50px" paddingLeft="20px">
            <Button onClick={() => { }} border="none" background="none">
              <Flex gap="20px" alignItems="center" width="100%">
                <Box rounded="full" bg="red.500" padding={2}>
                <LogoutIcon />
                </Box>
                <Text color="red.500" fontSize="1rem">Logout</Text>
              </Flex>
          </Button>
          </Box>
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
