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
import { ContextChurch, useApp } from '@/app/AppContext'

const menuItems = [
  {
    name: 'Church Select',
    to: () => '/dashboard',
  },
  {
    name: 'Job Board',
    to: (church: ContextChurch) =>
      `/dashboard/church/${church.level}/${church.id}`,
  },
  {
    name: 'Job Reports',
    to: (church: ContextChurch) => {
      if (['campus', 'stream'].includes(church.level)) {
        return `/job/report/${church.level}/${church.id}/subchurches`
      }

      return `/job/report/${church.level}/${church.id}`
    },
  },
  {
    name: 'Log Out',
    to: () => '/api/auth/logout?returnTo=/',
  },
]

const Navigation = () => {
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
            position="fixed"
            bottom={4}
            right={6}
            zIndex={2}
            rounded="full"
          >
            <GiHamburgerMenu />
          </IconButton>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <Heading>
              {church?.name.toUpperCase()} {church?.level.toUpperCase()}
            </Heading>
            <Text>Job Tracker</Text>
          </DrawerHeader>
          <DrawerBody>
            {menuItems.map((item) => {
              if (!church && item.name !== 'Church Select') return null

              if (item.name === 'Log Out') {
                return (
                  <a href={item.to(church)} key={item.name}>
                    <Button
                      key={item.name}
                      paddingY={7}
                      marginY={1}
                      colorPalette="red"
                      variant="subtle"
                      width="100%"
                    >
                      {item.name}
                    </Button>
                  </a>
                )
              }

              if (item.name === 'Job Reports') {
                if (church.level === 'governorship' || church.id === '') {
                  return null
                }
              }

              if (
                ['council', 'stream'].includes(church.level) &&
                item.name === 'Job Board'
              ) {
                return null
              }

              return (
                <Link href={item.to(church)} key={item.name}>
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
                name={user?.given_name + ' ' + user?.family_name}
                size="lg"
                src={user?.picture ?? undefined}
              />
              <Stack gap="0">
                <Text fontWeight="medium">
                  {user?.given_name + ' ' + user?.family_name}
                </Text>
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

export default Navigation
