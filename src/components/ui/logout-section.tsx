import { Flex, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { LogoutIcon } from '../icons'
import { Avatar } from './avatar'
import { useApp } from '@/app/contexts'

export function LogoutSection({
  extendable,
  isExtended,
}: {
  extendable: boolean
  isExtended: boolean
}) {
  const { user } = useApp()

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
          Sign Out
        </Text>
      </Flex>
    </VStack>
  )
}
