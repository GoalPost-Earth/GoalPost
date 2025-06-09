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
import { useRouter } from 'next/navigation'
import { toaster } from './toaster'

export function LogoutSection({
  extendable,
  isExtended,
}: {
  extendable: boolean
  isExtended: boolean
}) {
  const { user } = useApp()

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token found')
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      })
      if (!res.ok) {
        setLoading(false)
        // Optionally show error
        toaster.error({
          title: 'Logout failed',
          description: 'Please try again later.',
          duration: 5000,
        })
        return
      }
      // Clear localStorage items (customize as needed)
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      // Optionally redirect or update UI
      router.push('/login')
    } catch (err) {
      setLoading(false)
      // Optionally show error
    }
  }

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
      <form style={{ width: '100%' }} onSubmit={handleLogout}>
        <button
          type="submit"
          style={{
            display: 'block',
            width: '100%',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
          disabled={loading}
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
        </button>
      </form>
    </VStack>
  )
}
