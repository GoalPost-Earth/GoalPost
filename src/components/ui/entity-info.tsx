import { Box, Flex, Text } from '@chakra-ui/react'

export function EntityInfo({ entity }: { entity: any }) {
  if (typeof entity === 'object' && entity !== null) {
    return Object.entries(entity).map(([key, value]) => (
      <Flex
        key={key}
        width="100%"
        flexDirection={{ base: 'column', md: 'row' }}
        gap={2}
        alignItems="flex-start"
      >
        <Text fontWeight="bold" fontSize="xs" width="50%">
          {key.toUpperCase()}:
        </Text>{' '}
        <Text fontSize="sm" textAlign="start" width="50%">
          {value?.toString()}
        </Text>
      </Flex>
    ))
  } else return
}
