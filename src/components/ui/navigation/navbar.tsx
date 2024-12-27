'use client'

import { Box, Flex, HStack } from '@chakra-ui/react'
import NavHamburgerButton from './sidenav-button'
import Link from 'next/link'
import { AppLogo } from '../app-logo'
import { navItems } from './navItems'
import { Button } from '../button'

interface Props {
  link: string
  children: React.ReactNode
}

const NavLink = (props: Props) => {
  const { children, link } = props

  return (
    <Link href={link}>
      <Button
        colorPalette="blackAlpha"
        variant="subtle"
        size={'sm'}
        borderRadius="0px"
      >
        {children}
      </Button>
    </Link>
  )
}

export default function Simple() {
  return (
    <>
      <Box px={4} position="sticky" top={0} zIndex={100} bg="bg">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box display={{ md: 'none' }}>
            <NavHamburgerButton />
          </Box>

          <HStack gap={8} alignItems={'center'}>
            <AppLogo height={16} width={16} p={2} />
            <HStack as={'nav'} display={{ base: 'none', md: 'flex' }}>
              {navItems.map((item) => (
                <NavLink key={item.name} link={item.to()}>
                  {item.name}
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            {/* <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar
                  size={'sm'}
                  src={
                    'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                  }
                />
              </MenuButton> */}
            {/* <MenuList>
                <MenuItem>Link 1</MenuItem>
                <MenuItem>Link 2</MenuItem>
                <MenuDivider />
                <MenuItem>Link 3</MenuItem>
              </MenuList> */}
            {/* </Menu> */}
          </Flex>
        </Flex>
      </Box>
    </>
  )
}
