'use client'

import {
  Flex,
  HStack,
  Link,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { LogoutIcon } from '../icons'
import { Avatar } from './avatar'
import { useApp } from '@/app/contexts'
import { useState } from 'react'

export function LogoutSection({
  extendable,
  isExtended,
}: {
  extendable: boolean
  isExtended: boolean
}) {
  const { user } = useApp()
  const [loading, setLoading] = useState(false)

  return (
    <VStack
      pl={{ base: 3, lg: extendable && !isExtended ? 1.5 : 6 }}
      mt="auto"
      mb={4}
      pt={4}
    >
      <HStack gap="4">
        <Avatar
          name={user?.name ?? ''}
          size="md"
          src={user?.picture ?? undefined}
        />
        <Stack gap="0" display={extendable && !isExtended ? 'none' : 'block'}>
          {user?.name && <Text fontWeight="medium">{user?.name}</Text>}
        </Stack>
      </HStack>
      <Link
        as="a"
        href="/api/auth/logout?returnTo=/"
        onClick={() => setLoading(true)}
        style={{ display: 'block', width: '100%' }}
      >
        <Flex
          gap={2}
          cursor="pointer"
          borderTop="2px solid"
          borderTopColor="gray.subtle"
          justifyContent="flex-start"
          width="100%"
          paddingY={2}
          px={3}
          alignItems="center"
        >
          <LogoutIcon width="16px" height="16px" color="brandIcons" />
          <Text
            fontSize="sm"
            color="brandIcons"
            display={extendable && !isExtended ? 'none' : 'block'}
          >
            {loading ? (
              <HStack>
                <Spinner />
                <Text>'Signing Out'</Text>
              </HStack>
            ) : (
              'Sign Out'
            )}
          </Text>
        </Flex>
      </Link>
    </VStack>
  )
}
