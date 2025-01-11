import { Flex, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { LogoutIcon } from '../icons'
import { Avatar } from './avatar'

export function LogoutSection({
  extendable,
  isExtended,
}: {
  extendable: boolean
  isExtended: boolean
}) {
  const { user } = useUser()

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
        <Stack gap="0">
          {user?.name && <Text fontWeight="medium">{user?.name}</Text>}
        </Stack>
      </HStack>
      <Flex
        gap={2}
        borderTop="2px solid"
        borderTopColor="gray.subtle"
        justifyContent="flex-start"
        width="100%"
        paddingY={2}
        px={3}
        alignItems="center"
      >
        <LogoutIcon width="16px" height="16px" />
        <Text
          fontSize="sm"
          color="#C05621"
          display={extendable && !isExtended ? 'none' : 'block'}
        >
          Sign Out
        </Text>
      </Flex>
    </VStack>
  )
}
