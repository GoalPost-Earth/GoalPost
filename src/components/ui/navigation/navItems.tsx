import {
  CarePointsIcon,
  ChatBotIcon,
  GoalsIcon,
  GraphNodeIcon,
  HomeIcon,
  PeopleIcon,
  SettingsIcon,
  InputIcon,
  CommunityIcon,
  CoreValuesIcon,
} from '@/icons'
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from '@/components/ui/accordion'
import { Box, Button, Flex, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'

export const navItems = [
  {
    name: 'Home',
    to: '/',
    icon: HomeIcon,
  },
  {
    name: 'Communities',
    to: '/community',
    icon: CommunityIcon,
  },
  {
    name: 'People',
    to: '/person',
    icon: PeopleIcon,
  },
  {
    name: 'Resources',
    to: '/resource',
    icon: SettingsIcon,
  },
  {
    name: 'Goals',
    to: '/goal',
    icon: GoalsIcon,
  },
  {
    name: 'Core Values',
    to: '/corevalue',
    icon: CoreValuesIcon,
  },
  {
    name: 'Care Points',
    to: '/carepoint',
    icon: CarePointsIcon,
  },
  {
    name: 'AI Chat Bot',
    to: '/chatbot',
    icon: ChatBotIcon,
  },
  {
    name: 'Graph Visualization',
    to: '/graph-visualization',
    icon: GraphNodeIcon,
  },
]

export const inputLinks = [
  { name: 'Add Person', to: '/person/create' },
  { name: 'Add Resources', to: '/resource/create' },
  { name: 'Add Goals', to: '/goal/create' },
  { name: 'Add Community', to: '/community/create' },
  { name: 'Add Core Value', to: '/corevalue/create' },
  { name: 'Add Care Point', to: '/carepoint/create' },
]

export function NavItemLinks({
  setOpen,
  isExtended,
  extendable,
  showAIBot = true,
}: {
  setOpen: any
  extendable?: boolean
  isExtended?: boolean
  showAIBot?: boolean
}) {
  return (
    <Box borderBottom={'2px solid'} borderColor={'gray.subtle'} pb={10}>
      {navItems
        .filter((item) => item.name !== 'AI Chat Bot' || showAIBot)
        .map((item) => {
          const pathname = usePathname()
          const isActive = pathname === item.to

          return (
            <Link href={item.to} key={item.name}>
              <Button
                borderRadius="none"
                border="none"
                key={item.name}
                paddingY={6}
                paddingX={2}
                colorPalette="brand"
                variant={isActive ? 'solid' : 'outline'}
                width="100%"
                onClick={() => {
                  setOpen(false)
                }}
              >
                <Flex
                  gap="30px"
                  alignItems="center"
                  width="100%"
                  px={3}
                  pl={extendable && !isExtended ? 1.5 : 6}
                  transition={'all 0.4s ease-in-out'}
                >
                  <item.icon color={isActive ? 'white' : '#C05621'} />
                  {extendable && isExtended && (
                    <Text fontSize="small">{item.name}</Text>
                  )}
                </Flex>
              </Button>
            </Link>
          )
        })}
    </Box>
  )
}
export function InputAccordion({
  setOpen,
  isExtended,
  extendable,
}: {
  setOpen: any
  extendable?: boolean
  isExtended?: boolean
}) {
  return (
    <Box
      my={10}
      display={extendable && !isExtended ? 'none' : 'block'}
      width={'100%'}
    >
      <AccordionRoot collapsible>
        <AccordionItem value="item-1" border={'none'}>
          <AccordionItemTrigger as="button">
            <Flex
              gap="30px"
              alignItems="center"
              width="100%"
              px={6}
              pl={10}
              cursor={'pointer'}
            >
              <InputIcon />
              <Text fontSize="small" color="brandIcons.600">
                Input
              </Text>
            </Flex>
          </AccordionItemTrigger>
          <AccordionItemContent ml={'auto'}>
            {inputLinks.map((link) => {
              return (
                <Link href={link.to} key={link.name}>
                  <Button
                    display={'flex'}
                    justifyContent={'flex-end'}
                    key={link.name}
                    paddingY={6}
                    colorPalette="brand"
                    variant="ghost"
                    width="100%"
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    <Text
                      fontSize="small"
                      textAlign={'left'}
                      display={'inline-block'}
                      mx={'auto'}
                      minWidth={'120px'}
                    >
                      {link.name}
                    </Text>
                  </Button>
                </Link>
              )
            })}
          </AccordionItemContent>
        </AccordionItem>
      </AccordionRoot>
    </Box>
  )
}
